import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Sparkles } from 'lucide-react';
import { AI_SCENARIOS, BASE_SYSTEM_PROMPT, parseAiResponse } from '../../utils/helpers';

export function AiChatTab({ onNewFlashcard, onQuestProgress }) {
    const [scenario, setScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function callGemini(systemPrompt, msgs) {
        // Diagnostic Logging Utility
        const redact = (k) => k ? `${k.substring(0, 6)}...${k.substring(k.length - 4)}` : "MISSING";
        console.log(`[Diagnostic] callGemini invoked. Keys: primary=${redact(primaryKey)}, secondary=${redact(secondaryKey)}`);

        if (!primaryKey) {
            console.error("[Diagnostic] No primary API key found in import.meta.env");
            throw new Error('Hiányzó API kulcs (VITE_GEMINI_API_KEY)');
        }

        const contents = msgs.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
        }));
        if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });

        const createBody = () => JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        reply: { type: 'STRING', description: 'Your encouraging response text' },
                        correction: {
                            type: 'OBJECT',
                            nullable: true,
                            description: 'If the user made a grammar, vocabulary, or spelling mistake in English, correct it here. Otherwise null.',
                            properties: {
                                original: { type: 'STRING', description: 'The word or phrase the user messed up' },
                                corrected: { type: 'STRING', description: 'The correct English form' },
                                explanation: { type: 'STRING', description: 'A short, friendly explanation in Hungarian' }
                            }
                        },
                        flashcard: {
                            type: 'OBJECT',
                            nullable: true,
                            description: 'A new flashcard if a mistake was corrected, otherwise null',
                            properties: {
                                hungarian: { type: 'STRING' },
                                english: { type: 'STRING' },
                                emoji: { type: 'STRING' },
                            },
                        },
                    },
                    required: ['reply'],
                },
            },
        });

        const executeFetch = async (key, name) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            try {
                console.log(`[Diagnostic] Attempting fetch with key: ${name} (${redact(key)})`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        signal: controller.signal,
                        body: createBody(),
                    }
                );
                if (!response.ok) {
                    const errData = await response.text();
                    console.error(`[Diagnostic] ${name} failed. Status: ${response.status}`, errData);
                    throw new Error(`API error ${response.status}: ${errData}`);
                }
                console.log(`[Diagnostic] ${name} request successful!`);
                return await response.json();
            } finally {
                clearTimeout(timeout);
            }
        };

        try {
            const data = await executeFetch(primaryKey, "PRIMARY");
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "Szia! Készen állok a gyakorlásra! 😊"}';
        } catch (err) {
            console.warn(`[Diagnostic] Primary key failed. Should try secondary? ${!!secondaryKey}`, err.message);

            // Retrying for specific status codes (Rate limited, Unauthorized/Expired)
            const shouldRetry = err.message.includes('429') || err.message.includes('400') || err.message.includes('403');

            if (secondaryKey && shouldRetry) {
                try {
                    const fallbackData = await executeFetch(secondaryKey, "SECONDARY");
                    return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "Szia! Készen állok a gyakorlásra! 😊"}';
                } catch (fallbackErr) {
                    console.error("[Diagnostic] Secondary key also failed:", fallbackErr.message);
                    throw fallbackErr;
                }
            }
            throw err;
        }
    }

    const startScenario = async (sc) => {
        setScenario(sc);
        setMessages([]);
        setError(null);
        setLoading(true);
        try {
            const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nScenario: ${sc.systemExtra}`;
            const resp = await callGemini(systemPrompt, []);
            const { reply } = parseAiResponse(resp);
            setMessages([{ role: 'ai', text: reply }]);
        } catch (err) {
            console.error("Gemini API Error details:", err);
            if (err.message.includes('429')) {
                setError('Az AI tanár éppen túl elfoglalt (429). Kérlek várj egy percet! ☕');
            } else {
                setError('Hiba történt. Részletek: ' + err.message.substring(0, 100));
            }
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setError(null);

        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            if (onQuestProgress) onQuestProgress('chat');
            const systemPrompt = scenario.systemExtra + '\n\n' + BASE_SYSTEM_PROMPT;
            const resp = await callGemini(systemPrompt, newMessages);
            const parsed = parseAiResponse(resp);
            const reply = parsed.reply;
            const flashcard = parsed.flashcard;
            const correction = parsed.correction;

            if (flashcard) onNewFlashcard(flashcard);
            setMessages(prev => [...prev, { role: 'ai', text: reply, correction }]);
        } catch (err) {
            console.error("Gemini API Error details:", err);
            if (err.message.includes('429')) {
                setError('Sok kérést küldtél, az AI pihen egy kicsit. Várj pár percet! 💤');
            } else {
                setError('Hiba történt. Részletek: ' + err.message.substring(0, 100));
            }
        } finally {
            setLoading(false);
        }
    };

    if (!scenario) {
        return (
            <div className="flex flex-col gap-3 animate-slide-up">
                <div className="text-center mb-2">
                    <Sparkles className="inline text-purple-400 mb-1" size={24} />
                    <h3 className="font-bold text-gray-800">Válassz egy helyzetet!</h3>
                </div>
                {AI_SCENARIOS.map(sc => (
                    <button
                        key={sc.id}
                        onClick={() => startScenario(sc)}
                        className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all text-left"
                    >
                        <sc.icon size={24} className="text-purple-500 flex-shrink-0" />
                        <span className="font-bold text-gray-700">{sc.label}</span>
                    </button>
                ))}
                {!primaryKey && (
                    <div className="mt-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-700 text-center">
                        ⚠️ Az AI-hoz add hozzá a Gemini API kulcsot a <code className="bg-amber-100 px-1 rounded">.env</code> fájlban!
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[60vh] animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setScenario(null); setMessages([]); }} className="p-2 rounded-full hover:bg-purple-100 transition-colors">
                    <ChevronLeft size={18} className="text-purple-600" />
                </button>
                <span className="font-bold text-gray-700 text-sm">{scenario.label}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
                {messages.map((msg, i) => (
                    <div key={i} className={`animate-slide-up flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-br-md block' : 'bg-white border border-purple-100 text-gray-800 rounded-bl-md shadow-sm block'}`}>
                            {msg.text}
                        </div>
                        {msg.correction && (
                            <div className="mt-1.5 max-w-[85%] text-xs bg-red-50/80 border border-red-100 rounded-xl p-3 shadow-sm animate-slide-up">
                                <div className="flex items-center gap-1.5 text-red-600 font-bold mb-1">
                                    <Sparkles size={14} /> JAVÍTÁS
                                </div>
                                <div className="line-through text-red-400 mb-0.5">{msg.correction.original}</div>
                                <div className="text-green-600 font-bold mb-1.5">{msg.correction.corrected}</div>
                                <div className="text-gray-600 italic leading-snug">{msg.correction.explanation}</div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-purple-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                            </div>
                        </div>
                    </div>
                )}
                {error && <div className="text-center"><p className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-sm">{error}</p></div>}
                <div ref={scrollRef} />
            </div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Írj angolul... ✍️"
                    className="flex-1 px-4 py-3 rounded-2xl bg-white border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
                    disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
