import React, { useState, useEffect } from 'react';
import { Swords, X, Check } from 'lucide-react';
import { Confetti } from './Confetti';

export function BossFightModal({ challenge, onClose, onSolve }) {
    const [showConfetti, setShowConfetti] = useState(false);
    const [selectedWords, setSelectedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (challenge && challenge.english) {
            const words = challenge.english.split(' ');
            // Simple shuffle
            const shuffled = [...words].sort(() => Math.random() - 0.5);
            // Ensure it's not solved initially (extremely rare case)
            if (shuffled.join(' ') === challenge.english && words.length > 1) {
                shuffled.reverse();
            }
            setAvailableWords(shuffled.map((word, i) => ({ id: i, word })));
        }
    }, [challenge]);

    const handleSelectWord = (wordObj) => {
        setSelectedWords([...selectedWords, wordObj]);
        setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    };

    const handleRemoveWord = (wordObj) => {
        setAvailableWords([...availableWords, wordObj]);
        setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    };

    const handleCheck = () => {
        const currentSentence = selectedWords.map(w => w.word).join(' ');
        if (currentSentence === challenge.english) {
            setShowConfetti(true);
            setTimeout(() => {
                onSolve(challenge.xpReward);
            }, 2000);
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
        }
    };

    if (!challenge) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <Confetti active={showConfetti} />

            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-bounce-in border-4 border-red-500 flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
                    <Swords size={48} className="mx-auto text-white filter drop-shadow mb-2" />
                    <h2 className="text-2xl font-black text-white filter drop-shadow uppercase tracking-wider">
                        Boss Fight!
                    </h2>
                    <p className="text-red-100 font-bold mt-1">Jutalom: {challenge.xpReward} XP 🪙</p>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50 flex flex-col items-center">
                    <p className="text-center font-bold text-gray-800 mb-6 bg-white py-3 px-4 rounded-xl border border-gray-200 shadow-sm w-full">
                        "{challenge.message}"
                        <br />
                        <span className="text-red-500 mt-2 block opacity-80 uppercase text-xs">Fordítsd le:</span>
                        <span className="text-lg text-purple-700 block mt-1">{challenge.hungarian}</span>
                    </p>

                    {/* Target Box (Selected Words) */}
                    <div className={`w-full min-h-[80px] p-3 mb-6 bg-white border-2 rounded-xl flex flex-wrap gap-2 items-center justify-center transition-colors ${isError ? 'border-red-400 bg-red-50' : selectedWords.length > 0 ? 'border-purple-300' : 'border-dashed border-gray-300'
                        }`}>
                        {selectedWords.length === 0 && !isError && (
                            <span className="text-gray-400 font-medium text-sm">Érintsd meg a szavakat sorrendben...</span>
                        )}
                        {selectedWords.map(w => (
                            <button
                                key={w.id}
                                onClick={() => handleRemoveWord(w)}
                                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
                            >
                                {w.word}
                            </button>
                        ))}
                    </div>

                    {/* Word Bank */}
                    <div className="w-full flex flex-wrap gap-2 justify-center mb-6 min-h-[50px]">
                        {availableWords.map(w => (
                            <button
                                key={w.id}
                                onClick={() => handleSelectWord(w)}
                                className="px-3 py-1.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:border-purple-300 hover:text-purple-600 hover:scale-105 active:scale-95 transition-all"
                            >
                                {w.word}
                            </button>
                        ))}
                    </div>

                    {/* Check Button */}
                    <button
                        onClick={handleCheck}
                        disabled={availableWords.length > 0}
                        className={`w-full py-3 rounded-xl font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all ${availableWords.length === 0
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:scale-[1.02] active:scale-95'
                                : 'bg-gray-300 cursor-not-allowed opacity-70'
                            }`}
                    >
                        <Check size={20} /> Ellenőrzés
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-20"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
