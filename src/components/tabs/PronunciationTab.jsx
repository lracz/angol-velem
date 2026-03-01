import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, CheckCircle2, XCircle, RefreshCw, Volume2 } from 'lucide-react';

export function PronunciationTab({ phrases, sound, onQuestProgress, updateFirebase, userData }) {
    const [currentPhrase, setCurrentPhrase] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [score, setScore] = useState(null); // 0-100
    const [feedback, setFeedback] = useState(null); // 'excellent', 'good', 'try_again'
    const [recognition, setRecognition] = useState(null);

    // Initialize Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = false;
            recog.lang = 'en-US';

            recog.onresult = (event) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
                calculateScore(result);
            };

            recog.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error === 'no-speech') {
                    setFeedback('Nem hallottam semmit. Próbáld újra!');
                }
            };

            recog.onend = () => {
                setIsListening(false);
            };

            setRecognition(recog);
        }
    }, []);

    const getRandomPhrase = useCallback(() => {
        if (!phrases || phrases.length === 0) return;
        const validPhrases = phrases.filter(p => p.english && p.english.length < 60);
        const random = validPhrases[Math.floor(Math.random() * validPhrases.length)];
        setCurrentPhrase(random);
        setTranscript('');
        setScore(null);
        setFeedback(null);
    }, [phrases]);

    useEffect(() => {
        if (!currentPhrase) getRandomPhrase();
    }, [currentPhrase, getRandomPhrase]);

    const calculateScore = (spokenText) => {
        if (!currentPhrase) return;

        const target = currentPhrase.english.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
        const spoken = spokenText.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

        const targetWords = target.split(/\s+/);
        const spokenWords = spoken.split(/\s+/);

        let matches = 0;
        targetWords.forEach(word => {
            if (spokenWords.includes(word)) matches++;
        });

        const matchPercent = (matches / targetWords.length) * 100;
        setScore(Math.round(matchPercent));

        if (matchPercent >= 80) {
            setFeedback('excellent');
            sound.playSuccess();
            handleReward();
        } else if (matchPercent >= 50) {
            setFeedback('good');
        } else {
            setFeedback('try_again');
        }
    };

    const handleReward = () => {
        const xpReward = 20;
        const updates = {
            xp: (userData.xp || 0) + xpReward,
            weeklyXp: (userData.weeklyXp || 0) + xpReward
        };
        updateFirebase(updates);
        if (onQuestProgress) onQuestProgress('practice');
    };

    const startRecording = () => {
        if (!recognition) {
            alert("A hangfelismerés nem támogatott ebben a böngészőben. Használj Chrome-ot!");
            return;
        }
        setTranscript('');
        setScore(null);
        setFeedback(null);
        setIsListening(true);
        recognition.start();
    };

    if (!currentPhrase) return <div className="p-8 text-center text-gray-400">Betöltés...</div>;

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-purple-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Mic size={120} className="text-purple-500" />
                </div>

                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center justify-center gap-2">
                    <Mic className="text-purple-500" size={28} /> Kiejtés Gyakorlása
                </h2>

                <div className="bg-purple-50 rounded-3xl p-6 mb-8 relative group">
                    <button
                        onClick={() => sound.speak(currentPhrase.english)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full text-purple-500 shadow-sm hover:scale-110 active:scale-95 transition-all"
                    >
                        <Volume2 size={20} />
                    </button>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Mondd ezt hangosan:</p>
                    <p className="text-2xl font-black text-purple-700 leading-tight px-4">{currentPhrase.english}</p>
                    <p className="text-purple-400 text-sm mt-3 italic">"{currentPhrase.hungarian}"</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-6">
                    <button
                        onClick={isListening ? () => { } : startRecording}
                        disabled={isListening}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 ${isListening
                                ? 'bg-red-500 animate-pulse'
                                : 'bg-gradient-to-tr from-purple-500 to-indigo-600 hover:shadow-purple-200'
                            }`}
                    >
                        {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                    </button>

                    <div className="min-h-[60px] w-full flex flex-col items-center">
                        {isListening && (
                            <p className="text-red-500 font-bold animate-pulse text-sm">Hallgatlak... Beszélj most!</p>
                        )}
                        {transcript && (
                            <div className="animate-fade-in text-center">
                                <p className="text-xs text-gray-400 uppercase font-black mb-1">Ezt hallottam:</p>
                                <p className="text-lg font-bold text-gray-700 italic">"{transcript}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {score !== null && (
                    <div className="mt-8 pt-8 border-t border-gray-100 animate-bounce-in">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            {feedback === 'excellent' && <CheckCircle2 size={40} className="text-green-500" />}
                            {feedback === 'good' && <CheckCircle2 size={40} className="text-yellow-500" />}
                            {feedback === 'try_again' && <XCircle size={40} className="text-red-400" />}

                            <div className="text-left">
                                <p className="text-3xl font-black text-gray-800">{score}%</p>
                                <p className={`font-bold text-sm ${feedback === 'excellent' ? 'text-green-500' :
                                        feedback === 'good' ? 'text-yellow-500' : 'text-red-400'
                                    }`}>
                                    {feedback === 'excellent' ? 'Tökéletes! ✨ (+20 XP)' :
                                        feedback === 'good' ? 'Majdnem jó! Próbáld kicsit tisztábban.' :
                                            'Valami nem stimmel, fussunk neki újra!'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={getRandomPhrase}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-bold text-sm transition-all mx-auto"
                >
                    <RefreshCw size={18} /> Következő mondat
                </button>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 italic text-indigo-600 text-sm">
                💡 <strong>Tipp:</strong> Kattints a hangszóró ikonra a mondat mellett, hogy meghalld a helyes kiejtést, mielőtt te is elmondanád!
            </div>
        </div>
    );
}
