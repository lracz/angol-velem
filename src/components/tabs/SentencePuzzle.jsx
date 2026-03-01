import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, RotateCcw, Lightbulb } from 'lucide-react';
import { Confetti } from '../ui/Confetti';

export function SentencePuzzle({ phrases, sound, onQuestProgress, savedSolved = [], onSolvePhrase }) {
    const [solvedContent, setSolvedContent] = useState(savedSolved);
    const [currentPhrase, setCurrentPhrase] = useState(null);

    useEffect(() => {
        setSolvedContent(savedSolved);
    }, [savedSolved]);

    const [scrambledWords, setScrambledWords] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const initPuzzle = useCallback(() => {
        if (solvedContent.length >= phrases.length && phrases.length > 0) {
            setCurrentPhrase(null);
            return;
        }

        const unsolved = phrases.filter(p => !solvedContent.includes(p.id));
        const randomPhrase = unsolved[Math.floor(Math.random() * unsolved.length)];
        if (!randomPhrase) return;

        setCurrentPhrase(randomPhrase);
        const words = randomPhrase.english.split(' ');
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setScrambledWords(shuffled.map((w, i) => ({ id: i, text: w })));
        setSelectedWords([]);
        setIsCorrect(false);
        setShowHint(false);
    }, [phrases, solvedContent]);

    useEffect(() => {
        initPuzzle();
    }, [initPuzzle]);

    const handleWordClick = (wordObj) => {
        if (isCorrect || !currentPhrase) return;
        const newSelected = [...selectedWords, wordObj];
        setSelectedWords(newSelected);
        setScrambledWords(scrambledWords.filter(w => w.id !== wordObj.id));

        if (newSelected.length === currentPhrase.english.split(' ').length) {
            const result = newSelected.map(w => w.text).join(' ');
            if (result.toLowerCase() === currentPhrase.english.toLowerCase()) {
                setIsCorrect(true);
                sound.playDing();
                setShowConfetti(true);
                if (onQuestProgress) onQuestProgress('sentence');
                if (onSolvePhrase) onSolvePhrase(currentPhrase.id);
                setTimeout(() => setShowConfetti(false), 2000);
            } else {
                setTimeout(() => {
                    const words = currentPhrase.english.split(' ');
                    const shuffled = [...words].sort(() => Math.random() - 0.5);
                    setScrambledWords(shuffled.map((w, i) => ({ id: i, text: w })));
                    setSelectedWords([]);
                }, 800);
            }
        }
    };

    const resetWord = (wordObj) => {
        if (isCorrect) return;
        setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
        setScrambledWords([...scrambledWords, wordObj]);
    };

    if (solvedContent.length >= phrases.length && phrases.length > 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-6 animate-fade-in py-10">
                <div className="text-6xl animate-bounce">🏆</div>
                <h2 className="text-3xl font-black text-green-600 text-center">Megcsináltad az összeset!</h2>
                <p className="text-gray-500 font-medium text-center">Nincs több kérdés ebben a szekcióban.</p>
                <button
                    onClick={() => {
                        if (onSolvePhrase) onSolvePhrase(true);
                        setSolvedContent([]);
                    }}
                    className="mt-4 px-6 py-3 bg-purple-100 text-purple-700 rounded-2xl font-bold hover:bg-purple-200 transition-colors"
                >
                    <RotateCcw className="inline mr-2" size={18} /> Kezdjük elölről!
                </button>
            </div>
        );
    }

    if (!currentPhrase) return null;

    const progressPercent = Math.round((solvedContent.length / phrases.length) * 100) || 0;

    return (
        <div className="flex flex-col items-center gap-6 animate-slide-up py-4 w-full">
            <div className="w-full flex flex-col items-center gap-3">
                <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-gray-800">Mondatrakó</h2>
                    <p className="text-sm text-gray-500">Rakd össze a mondatot helyes sorrendben!</p>
                </div>

                <div className="w-full max-w-sm mt-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
                        <span>Haladás</span>
                        <span>{solvedContent.length} / {phrases.length}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </div>

            <Confetti active={showConfetti} />

            <div className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-inner border border-purple-100 min-h-[140px] flex flex-wrap gap-2 items-center justify-center relative">
                <div className="absolute top-2 left-4 text-[10px] font-bold text-purple-300 uppercase tracking-widest">A mondat helye</div>

                <div className="w-full text-center">
                    <p className="text-gray-400 font-medium mb-1 italic text-xs">"{currentPhrase.hungarian}"</p>
                    {showHint && (
                        <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 mb-3 animate-fade-in">
                            <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">Súgó: Mi a következő szó?</p>
                            <p className="text-sm font-black text-amber-800">
                                {currentPhrase.english.split(' ')[selectedWords.length] || 'Kész!'}
                            </p>
                        </div>
                    )}
                </div>

                {selectedWords.map((w, idx) => (
                    <button
                        key={idx}
                        onClick={() => resetWord(w)}
                        className={`px-3 py-1.5 rounded-xl font-bold shadow-sm transition-all transform active:scale-95 text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                    >
                        {w.text}
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
                {scrambledWords.map((w) => (
                    <button
                        key={w.id}
                        onClick={() => handleWordClick(w)}
                        disabled={isCorrect}
                        className="px-4 py-2 bg-white text-gray-700 rounded-xl font-bold shadow-md border border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all transform active:scale-95"
                    >
                        {w.text}
                    </button>
                ))}
            </div>

            {isCorrect && (
                <div className="flex flex-col items-center gap-4 animate-bounce-in mt-6">
                    <div className="px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold text-lg">
                        Szuper! ✨
                    </div>
                    <button
                        onClick={() => {
                            initPuzzle();
                        }}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Következő <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {!isCorrect && (
                <div className="flex gap-4 mt-4">
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${showHint ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                    >
                        <Lightbulb size={14} /> {showHint ? 'Súgó elrejtése' : 'Kérek egy súgót'}
                    </button>

                    {selectedWords.length > 0 && (
                        <button
                            onClick={initPuzzle}
                            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
                        >
                            <RotateCcw size={14} /> Újrakezdés
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
