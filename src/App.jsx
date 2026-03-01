import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Volume2, Snail, Mic, MicOff, Send, BookOpen, MessageCircle,
  GraduationCap, ChevronLeft, ChevronRight, Check, X, RotateCcw,
  Sparkles, Coffee, Map, ShoppingCart, Phone, Star, Flame, Target, LogOut
} from 'lucide-react';

// ── Firebase Imports ───────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config exists (to prevent crashes before setup)
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// ═══════════════════════════════════════════════════════════════════
// DATA — Vocabulary (15+ words) & Phrases (5+)
// ═══════════════════════════════════════════════════════════════════
const INITIAL_VOCABULARY = [
  { id: 'v1', hungarian: 'alma', english: 'apple', emoji: '🍎' },
  { id: 'v2', hungarian: 'víz', english: 'water', emoji: '💧' },
  { id: 'v3', hungarian: 'ház', english: 'house', emoji: '🏠' },
  { id: 'v4', hungarian: 'macska', english: 'cat', emoji: '🐱' },
  { id: 'v5', hungarian: 'kutya', english: 'dog', emoji: '🐶' },
  { id: 'v6', hungarian: 'nap', english: 'sun', emoji: '☀️' },
  { id: 'v7', hungarian: 'hold', english: 'moon', emoji: '🌙' },
  { id: 'v8', hungarian: 'könyv', english: 'book', emoji: '📖' },
  { id: 'v9', hungarian: 'kávé', english: 'coffee', emoji: '☕' },
  { id: 'v10', hungarian: 'kenyér', english: 'bread', emoji: '🍞' },
  { id: 'v11', hungarian: 'barát', english: 'friend', emoji: '🤝' },
  { id: 'v12', hungarian: 'szerelem', english: 'love', emoji: '❤️' },
  { id: 'v13', hungarian: 'virág', english: 'flower', emoji: '🌸' },
  { id: 'v14', hungarian: 'csillag', english: 'star', emoji: '⭐' },
  { id: 'v15', hungarian: 'zene', english: 'music', emoji: '🎵' },
  { id: 'v16', hungarian: 'szép', english: 'beautiful', emoji: '✨' },
  { id: 'v17', hungarian: 'boldog', english: 'happy', emoji: '😊' },
  { id: 'v18', hungarian: 'enni', english: 'to eat', emoji: '🍽️' },
  { id: 'v19', hungarian: 'inni', english: 'to drink', emoji: '🥤' },
  { id: 'v20', hungarian: 'aludni', english: 'to sleep', emoji: '😴' },
];

const PHRASES = [
  { id: 'p1', hungarian: 'Jó reggelt!', english: 'Good morning!', emoji: '🌅' },
  { id: 'p2', hungarian: 'Hogy vagy?', english: 'How are you?', emoji: '😊' },
  { id: 'p3', hungarian: 'Köszönöm szépen!', english: 'Thank you very much!', emoji: '🙏' },
  { id: 'p4', hungarian: 'Nem értem.', english: "I don't understand.", emoji: '🤔' },
  { id: 'p5', hungarian: 'Beszélsz magyarul?', english: 'Do you speak Hungarian?', emoji: '🗣️' },
  { id: 'p6', hungarian: 'Mennyibe kerül?', english: 'How much does it cost?', emoji: '💰' },
  { id: 'p7', hungarian: 'Hol van a mosdó?', english: 'Where is the bathroom?', emoji: '🚻' },
  { id: 'p8', hungarian: 'Segítséget kérek!', english: 'I need help!', emoji: '🆘' },
];

const AI_SCENARIOS = [
  { id: 'coffee', label: '☕ Kávé rendelése', icon: Coffee, systemExtra: 'Simulate ordering coffee at a café. Start by greeting the student as a barista.' },
  { id: 'directions', label: '🗺️ Útbaigazítás', icon: Map, systemExtra: 'Simulate asking for and giving directions. Start by asking "Hi! Can I help you?"' },
  { id: 'shopping', label: '🛒 Bevásárlás', icon: ShoppingCart, systemExtra: 'Simulate buying groceries at a store. Start by saying "Welcome! What would you like?"' },
  { id: 'phone', label: '📞 Telefonhívás', icon: Phone, systemExtra: 'Simulate a phone call to book a table at a restaurant. Start with "Hello, Restaurant Bella, how can I help?"' },
  { id: 'introduce', label: '👋 Bemutatkozás', icon: Star, systemExtra: 'Simulate meeting someone new. Start with "Hi! My name is Anna. What is your name?"' },
];

const BASE_SYSTEM_PROMPT = `You are a highly encouraging English tutor. The user is an absolute beginner and a native Hungarian speaker. Use VERY simple A1 English. Pay special attention to typical Hungarian mistakes: confusing 'he' and 'she' (Hungarian has no genders), and word order (Hungarian is flexible, English is strict SVO). If she makes these mistakes, gently correct her in Hungarian, then ask her to repeat in English. Always praise her efforts.

You MUST respond in the following JSON format:
{
  "reply": "Your encouraging response text here",
  "flashcard": null
}

If the user made a vocabulary or grammar mistake that you corrected, set flashcard to an object:
{
  "reply": "Your response",
  "flashcard": { "hungarian": "correct hungarian word", "english": "correct english word", "emoji": "relevant emoji" }
}

Always set flashcard to null if there was no mistake to correct.`;

// ═══════════════════════════════════════════════════════════════════
// HOOKS & HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Web Audio API sound effects */
function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playDing = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* no audio support */ }
  }, [getCtx]);

  const playSwoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.15;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      source.connect(filter).connect(ctx.destination);
      source.start();
    } catch { /* no audio support */ }
  }, [getCtx]);

  return { playDing, playSwoosh };
}

const speak = (text, rate = 1) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const ENCOURAGEMENTS = [
  'Szuper! 🌟', 'Ügyes vagy! 💪', 'Fantasztikus! ✨', 'Nagyszerű! 🎉',
  'Remek munka! 👏', 'Így kell ezt! 🔥', 'Büszke vagyok rád! 💕',
];
const randomEncouragement = () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

const CONFETTI_COLORS = ['#f9a8d4', '#c084fc', '#93c5fd', '#86efac', '#fde047', '#fca5a5'];

function parseAiResponse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return {
      reply: parsed.reply || raw,
      flashcard: parsed.flashcard && parsed.flashcard.hungarian && parsed.flashcard.english
        ? parsed.flashcard
        : null,
    };
  } catch {
    return { reply: raw, flashcard: null };
  }
}

// ═══════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${Math.random() * 30}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function SttButton({ targetWord, onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const results = Array.from(e.results[0]).map(r => r.transcript.toLowerCase().trim());
      const target = targetWord.toLowerCase().trim();
      const match = results.some(r => r.includes(target) || target.includes(r));
      onResult(match);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [targetWord, onResult]);

  if (!supported) {
    return (
      <button disabled className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="Chrome böngészőben működik a legjobban!">
        <MicOff size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (listening) { recRef.current?.stop(); setListening(false); }
        else { recRef.current?.start(); setListening(true); }
      }}
      className={`p-3 rounded-full transition-all duration-200 ${listening
        ? 'bg-red-100 text-red-600 animate-pulse-glow'
        : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105 active:scale-95'
        }`}
      title={listening ? 'Hallgatom...' : 'Mondd ki!'}
    >
      {listening ? <Mic size={20} /> : <Mic size={20} />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════

function VocabularyTab({ vocabMap, generatedCards, onMarkKnown, onResetAll, onProgress, sound }) {
  // Combine base vocabulary + generated cards
  const allCardsOriginal = [
    ...INITIAL_VOCABULARY,
    ...generatedCards
  ];

  // Map state to cards
  const allCards = allCardsOriginal.map(c => ({
    ...c,
    status: vocabMap[c.id] || 'learning' // default to learning if unknown
  }));

  const learningCards = allCards.filter(c => c.status === 'learning');

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sttFeedback, setSttFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Safe index logic
  let displayIndex = 0;
  if (learningCards.length > 0) {
    displayIndex = index % learningCards.length;
  }
  const card = learningCards[displayIndex];


  const handleKnow = () => {
    if (!card) return;
    sound.playDing();
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);

    onMarkKnown(card.id);
    onProgress();
    setFlipped(false);
    setSttFeedback(null);
    setIndex(i => i); // keep index, array will shrink
  };

  const handlePractice = () => {
    sound.playSwoosh();
    setFlipped(false);
    setSttFeedback(null);
    setIndex(i => i + 1);
  };

  const handleFlip = () => {
    sound.playSwoosh();
    setFlipped(f => !f);
  };

  const handleSttResult = useCallback((match) => {
    setSttFeedback(match ? 'correct' : 'retry');
    if (match) setTimeout(() => setSttFeedback(null), 2000);
  }, []);

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Gratulálok!</h2>
        <p className="text-gray-600 mb-6">Az összes kártyát megtanultad!</p>
        <button
          onClick={() => {
            onResetAll();
            setIndex(0);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <RotateCcw size={18} /> Újrakezdés
        </button>
      </div>
    );
  }

  const knownCount = allCards.filter(c => c.status === 'known').length;
  const totalCount = allCards.length;

  return (
    <div className="flex flex-col items-center gap-4 relative animate-slide-up">
      <Confetti active={showConfetti} />

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <GraduationCap size={14} />
        <span>{knownCount}/{totalCount} szó megtanulva</span>
      </div>

      <div className="perspective w-full max-w-xs cursor-pointer" onClick={handleFlip}>
        <div className={`flip-inner relative w-full h-64 ${flipped ? 'flipped' : ''}`}>
          <div className="flip-front absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg border border-pink-100 p-6">
            <span className="text-5xl mb-3">{card.emoji}</span>
            <span className="text-2xl font-bold text-gray-800">{card.hungarian}</span>
            <span className="text-xs text-gray-400 mt-4">Koppints a fordításhoz →</span>
            {card._generated && (
              <span className="absolute top-3 left-3 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Új</span>
            )}
          </div>
          <div className="flip-back absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-6">
            <span className="text-5xl mb-3">{card.emoji}</span>
            <span className="text-2xl font-bold text-purple-800">{card.english}</span>
            <span className="text-xs text-purple-400 mt-4">← Koppints vissza</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.english, 1); }}
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Volume2 size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.english, 0.5); }}
          className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Snail size={20} />
        </button>
        <SttButton targetWord={card.english} onResult={handleSttResult} />
      </div>

      {sttFeedback === 'correct' && (
        <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
          <Check size={18} /> {randomEncouragement()}
        </div>
      )}
      {sttFeedback === 'retry' && (
        <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold">
          <RotateCcw size={16} /> Próbáld újra, menni fog! 💪
        </div>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={handlePractice}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-100 text-amber-700 rounded-2xl font-bold hover:bg-amber-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RotateCcw size={16} /> Még gyakorlom
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-2xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Check size={16} /> Tudom!
        </button>
      </div>

      {learningCards.length > 0 && (
        <div className="flex items-center gap-6 text-gray-400 mt-2">
          <button onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); setSttFeedback(null); }} className="p-2 hover:text-purple-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold">{displayIndex + 1} / {learningCards.length}</span>
          <button onClick={() => { setIndex(i => i + 1); setFlipped(false); setSttFeedback(null); }} className="p-2 hover:text-purple-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function PhrasesTab() {
  return (
    <div className="flex flex-col gap-3 animate-slide-up">
      <p className="text-sm text-gray-500 text-center mb-1">Kattints a hangszóróra a kiejtéshez! 🔊</p>
      {PHRASES.map(phrase => (
        <div
          key={phrase.id}
          className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-100 transition-all"
        >
          <span className="text-3xl flex-shrink-0">{phrase.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-sm">{phrase.hungarian}</p>
            <p className="text-purple-600 font-semibold text-sm">{phrase.english}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => speak(phrase.english, 1)}
              className="p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={() => speak(phrase.english, 0.5)}
              className="p-2.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all"
            >
              <Snail size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AiChatTab({ onNewFlashcard }) {
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keys from .env
  const primaryKey = import.meta.env.VITE_GEMINI_API_KEY;
  const secondaryKey = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;

  async function callGemini(systemPrompt, msgs) {
    if (!primaryKey) throw new Error('No API key');
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

    const executeFetch = async (key) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: createBody(),
          }
        );
        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`API error ${response.status}: ${errData}`);
        }
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      // First attempt with primary key
      const data = await executeFetch(primaryKey);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "I\'m here to help! 😊"}';
    } catch (err) {
      console.warn("Primary Gemini key failed, trying secondary if available...", err);
      if (secondaryKey && err.message.includes('429')) {
        // Fallback attempt with secondary key specifically on 429 (rate limit)
        try {
          const fallbackData = await executeFetch(secondaryKey);
          return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "I\'m here to help! 😊"}';
        } catch (fallbackErr) {
          console.error("Secondary key also failed:", fallbackErr);
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
    } catch {
      setError('Hoppá! Az AI éppen nem elérhető. Próbáld újra! 🔄');
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
      const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nScenario: ${scenario.systemExtra}`;
      const resp = await callGemini(systemPrompt, newMessages);
      const { reply, flashcard } = parseAiResponse(resp);
      if (flashcard) onNewFlashcard(flashcard);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setError('Az AI nem válaszol. Ellenőrizd az interneted! 🌐');
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
            className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all"
          >
            <sc.icon size={24} className="text-purple-500 flex-shrink-0" />
            <span className="font-bold text-gray-700">{sc.label}</span>
          </button>
        ))}
        {!apiKey && (
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
          <div key={i} className={`animate-slide-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-br-md' : 'bg-white border border-purple-100 text-gray-800 rounded-bl-md shadow-sm'}`}>
              {msg.text}
            </div>
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

// ═══════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("A Firebase nincs beállítva a .env fájlban!");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Hibás email vagy jelszó. 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-pink-100 text-center animate-slide-up">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-6 shadow-md">
          <Heart className="text-white fill-white" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-1">
          English With Love
        </h1>
        <p className="text-sm text-gray-500 mb-8">Tanulj angolul egy kis extrával 💕</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300 transition-all font-medium text-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-300 transition-all font-medium text-gray-700"
            required
          />
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform active:scale-95 transition-all text-lg"
          >
            {loading ? "Bejelentkezés..." : "Belépés"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP ROUTER (Handles Auth & Firebase Sync)
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Firestore state
  const [userData, setUserData] = useState({
    vocabMap: {}, // { "v1": "known", "gen_1": "learning" }
    generatedCards: [], // AI flashcards
    dailyProgress: { date: new Date().toDateString(), count: 0 },
    streak: 0,
  });

  const [activeTab, setActiveTab] = useState(0);
  const sound = useSound();

  // 1. Auth Listener
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync (onSnapshot)
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        // Handle daily reset logic here when data loads
        const today = new Date().toDateString();
        let dbDaily = data.dailyProgress || { date: today, count: 0 };
        let dbStreak = data.streak || 0;

        if (dbDaily.date !== today) {
          if (dbDaily.count >= 10) dbStreak += 1;
          else if (dbDaily.count === 0) dbStreak = 0;
          dbDaily = { date: today, count: 0 };

          // Background update if day changed
          setDoc(docRef, { dailyProgress: dbDaily, streak: dbStreak }, { merge: true });
        }

        setUserData({
          vocabMap: data.vocabMap || {},
          generatedCards: data.generatedCards || [],
          dailyProgress: dbDaily,
          streak: dbStreak,
        });
      } else {
        // Initialize new user document
        const initialData = {
          vocabMap: {},
          generatedCards: [],
          dailyProgress: { date: new Date().toDateString(), count: 0 },
          streak: 0,
        };
        setDoc(docRef, initialData);
        setUserData(initialData);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Firestore Write Helpers
  const updateFirebase = async (updates) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  const handleMarkKnown = (cardId) => {
    updateFirebase({
      vocabMap: {
        ...userData.vocabMap,
        [cardId]: 'known'
      }
    });
  };

  const handleResetAll = () => {
    // Instead of deleting vocabMap, set all to learning
    const newMap = { ...userData.vocabMap };
    Object.keys(newMap).forEach(k => newMap[k] = 'learning');
    updateFirebase({ vocabMap: newMap });
  };

  const handleProgress = () => {
    updateFirebase({
      dailyProgress: {
        date: userData.dailyProgress.date,
        count: Math.min(userData.dailyProgress.count + 1, 10)
      }
    });
  };

  const handleNewFlashcard = (card) => {
    // Check if duplicate in generated or internal vocab
    const isDuplicate = [...INITIAL_VOCABULARY, ...userData.generatedCards].some(
      c => c.english?.toLowerCase() === card.english?.toLowerCase()
    );
    if (isDuplicate) return;

    const newGeneratedCard = {
      ...card,
      id: `gen_${Date.now()}`,
      status: 'learning',
      _generated: true,
    };

    updateFirebase({
      generatedCards: [...userData.generatedCards, newGeneratedCard],
      vocabMap: {
        ...userData.vocabMap,
        [newGeneratedCard.id]: 'learning'
      }
    });
  };


  // ── Render States ─────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Heart className="animate-pulse text-pink-400 fill-pink-400" size={48} />
      </div>
    );
  }

  if (!user && auth) {
    return <LoginScreen />;
  }

  // If Firebase isn't configured in .env at all
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Firebase nincs beállítva</h1>
          <p className="text-gray-700">Töltsd ki a <code className="bg-white px-2 rounded">.env</code> fájlt a Firebase adataiddal!</p>
        </div>
      </div>
    );
  }

  const DAILY_GOAL = 10;
  const progressPct = Math.min((userData.dailyProgress.count / DAILY_GOAL) * 100, 100);
  const tabs = [
    { label: 'Szótár', icon: BookOpen },
    { label: 'Mondatok', icon: MessageCircle },
    { label: 'AI Gyakorlás', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-pink-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={22} />
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                English With Love
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                <Flame size={14} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{userData.streak} napos sorozat</span>
              </div>
              <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target size={14} className="text-purple-400 flex-shrink-0" />
            <div className="flex-1 h-2.5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressPct >= 100 ? 'shimmer-bar' : 'bg-gradient-to-r from-pink-400 to-purple-400'
                  }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-purple-500 flex-shrink-0 whitespace-nowrap">
              {userData.dailyProgress.count}/{DAILY_GOAL}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">
        {/* Show generated cards notification only on the AI tab to prevent annoying popups in flashcards */}
        {userData.generatedCards.length > 0 && activeTab === 2 && (
          <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 text-sm text-purple-700 text-center animate-slide-up">
            ✨ Eddig {userData.generatedCards.length} extra kártyát tanultál meg az AI-tól!
          </div>
        )}

        {activeTab === 0 && (
          <VocabularyTab
            vocabMap={userData.vocabMap}
            generatedCards={userData.generatedCards}
            onMarkKnown={handleMarkKnown}
            onResetAll={handleResetAll}
            onProgress={handleProgress}
            sound={sound}
          />
        )}
        {activeTab === 1 && <PhrasesTab />}
        {activeTab === 2 && <AiChatTab onNewFlashcard={handleNewFlashcard} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-pink-100">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all duration-200 ${activeTab === i ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon size={20} className={activeTab === i ? 'scale-110' : ''} />
              <span className="text-[10px] font-bold">{tab.label}</span>
              {activeTab === i && <div className="w-1 h-1 rounded-full bg-purple-500 mt-0.5" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
