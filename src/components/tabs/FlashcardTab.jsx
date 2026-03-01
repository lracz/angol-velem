import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Volume2, Snail, GraduationCap, ChevronLeft, ChevronRight,
    Check, RotateCcw, Sparkles, Lightbulb
} from 'lucide-react';
import { Confetti } from '../ui/Confetti';
import { SttButton } from '../ui/SttButton';
import { speak } from '../../hooks/useSound';
import { randomEncouragement } from '../../utils/helpers';

export function FlashcardTab({
    items,
    categories,
    vocabMap,
    generatedCards = [],
    onProgress,
    onFetchMore,
    onMarkKnown,
    playSound,
    onQuestProgress,
    isSentences = false
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [sttFeedback, setSttFeedback] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isSolved, setIsSolved] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const inputRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio();
    }, []);

    const allCards = useMemo(() => {
        const combined = [...items, ...generatedCards];
        return combined.map(c => {
            const vData = vocabMap ? vocabMap[c.id] : null;
            const status = typeof vData === 'string' ? vData : (vData?.status || 'learning');
            const nextReview = vData?.nextReview || 0;
            const interval = vData?.interval || 1;
            return { ...c, status, nextReview, interval };
        });
    }, [items, generatedCards, vocabMap]);

    const filteredCards = useMemo(() => {
        if (!selectedCategory) return [];
        return selectedCategory === 'szemelyes'
            ? allCards.filter(c => c._generated)
            : allCards.filter(c => c.categoryId === selectedCategory);
    }, [allCards, selectedCategory]);

    const learningCards = useMemo(() => {
        const now = Date.now();
        return filteredCards.filter(c => c.status === 'learning' || (c.status === 'known' && c.nextReview <= now));
    }, [filteredCards]);

    useEffect(() => {
        setIndex(0);
        setFlipped(false);
        setSttFeedback(null);
        setUserInput('');
        setIsSolved(false);
    }, [selectedCategory]);

    const handleSttResult = useCallback((match) => {
        setSttFeedback(match ? 'correct' : 'retry');
        if (match) setTimeout(() => setSttFeedback(null), 2000);
    }, []);

    const handleFetchMore = async () => {
        if (isFetching || !onFetchMore) return;
        setIsFetching(true);
        try {
            await onFetchMore(selectedCategory);
        } finally {
            setIsFetching(false);
        }
    };

    if (!selectedCategory) {
        const categoriesWithGenerated = [...categories];
        if (generatedCards.length > 0) {
            categoriesWithGenerated.push({ id: 'szemelyes', name: 'Saját szavaim (Mentett)' });
        }

        return (
            <div className="flex flex-col gap-3 animate-slide-up">
                <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">Témakörök</h2>
                {categoriesWithGenerated.map(cat => {
                    const catCards = cat.id === 'szemelyes'
                        ? allCards.filter(c => c._generated)
                        : allCards.filter(c => c.categoryId === cat.id);
                    const knownCat = catCards.filter(c => c.status === 'known').length;
                    const totalCat = catCards.length;
                    const progressPct = totalCat > 0 ? (knownCat / totalCat) * 100 : 0;

                    if (totalCat === 0 && cat.id !== 'szemelyes') return null;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className="flex flex-col gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all text-left"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">{cat.name}</span>
                                <span className="text-sm font-semibold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">
                                    {knownCat}/{totalCat}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400" style={{ width: `${progressPct}%` }} />
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }

    if (selectedCategory && filteredCards.length > 0 && learningCards.length === 0) {
        const itemType = isSentences ? 'mondatot' : 'szót';
        const itemTypeAlt = isSentences ? 'mondatot' : 'szót';

        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur rounded-3xl border border-purple-100 shadow-xl animate-bounce-in text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-purple-700 mb-2">Szuper!</h2>
                <p className="text-gray-600 mb-6">Ebben a kategóriában minden {isSentences ? 'mondatot' : 'szót'} megtanultál!</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button onClick={() => setSelectedCategory(null)} className="px-5 py-3 bg-gray-100 text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-200 transition-all">
                        Másik téma
                    </button>
                    <button
                        onClick={handleFetchMore}
                        disabled={isFetching}
                        className="px-5 py-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isFetching ? <Sparkles size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        Kérek még 50 {isSentences ? 'mondatot' : 'szót'}
                    </button>
                    <button onClick={() => { onMarkKnown(null, 'resetAll'); setIndex(0); }} className="px-5 py-3 bg-white border-2 border-purple-100 text-purple-600 rounded-full font-bold shadow-sm hover:bg-purple-50 transition-all">
                        <RotateCcw size={18} className="inline mr-1" /> Újrakezdés
                    </button>
                </div>
            </div>
        );
    }

    let displayIndex = 0;
    if (learningCards.length > 0) {
        displayIndex = index % learningCards.length;
    }
    const card = learningCards[displayIndex];

    const handleKnow = () => {
        if (!card) return;
        playSound('correct');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1200);

        const now = Date.now();
        let newInterval = 1;
        if (card.status === 'known') {
            newInterval = card.interval * 2;
        }
        const nextReview = now + newInterval * 24 * 60 * 60 * 1000;

        onMarkKnown(card.id, {
            status: 'known',
            interval: newInterval,
            nextReview
        });

        onProgress();
        const questType = isSentences ? 'sentence' : (!card.status || card.status === 'learning' ? 'vocab_new' : 'vocab_review');
        if (onQuestProgress) onQuestProgress(questType);

        setFlipped(false);
        setSttFeedback(null);
        setUserInput('');
        setIsSolved(false);
        setIndex(i => i);
    };

    const handlePractice = () => {
        playSound('flip');
        setFlipped(false);
        setSttFeedback(null);
        setIndex(i => i + 1);
    };

    const handleFlip = () => {
        if (isSolved || isSentences) {
            playSound('flip');
            setFlipped(f => !f);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setUserInput(val);

        if (val.toLowerCase().trim() === card.english.toLowerCase().trim()) {
            setIsSolved(true);
            playSound('correct');
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                setFlipped(true);
                speak(card.english, 1);
            }, 600);
        }
    };

    const nextCard = () => {
        setFlipped(false);
        setSttFeedback(null);
        setUserInput('');
        setIsSolved(false);
        setIndex(i => i + 1);
    };

    const handleBack = () => setSelectedCategory(null);

    if (!card) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-purple-700 mb-2">Szuper!</h2>
                <p className="text-gray-600 mb-6">Ebben a kategóriában mindent megtanultál!</p>
                <div className="flex gap-3">
                    <button onClick={handleBack} className="px-5 py-3 bg-gray-100 text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-200 transition-all">
                        Vissza
                    </button>
                    <button onClick={() => { onMarkKnown(null, 'resetAll'); setIndex(0); }} className="px-5 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <RotateCcw size={18} className="inline mr-1" /> Újrakezdés
                    </button>
                </div>
            </div>
        );
    }

    const knownCount = filteredCards.filter(c => c.status === 'known').length;
    const totalCount = filteredCards.length;
    const categoryName = selectedCategory === 'szemelyes' ? 'Saját szavaim' : categories.find(c => c.id === selectedCategory)?.name;

    return (
        <div className="flex flex-col items-center gap-4 relative animate-slide-up">
            <div className="w-full flex items-center justify-between mb-2">
                <button onClick={handleBack} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-sm max-w-[200px] truncate">{categoryName}</h3>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-0.5">
                        <GraduationCap size={12} />
                        <span>{knownCount}/{totalCount} {isSentences ? 'mondat' : 'szó'}</span>
                    </div>
                </div>
                <div className="w-10"></div>
            </div>

            <Confetti active={showConfetti} />

            <div key={card.id} className={`perspective w-full max-w-xs ${isSolved || isSentences ? 'cursor-pointer' : 'cursor-default'}`} onClick={handleFlip}>
                <div className={`flip-inner relative w-full h-80 ${flipped ? 'flipped' : ''}`}>
                    <div className="flip-front absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg border border-pink-100 p-6">
                        <span className="text-5xl mb-3">{card.emoji}</span>
                        <span className="text-2xl font-bold text-gray-800 text-center">{card.hungarian}</span>
                        {card.hint && (
                            <div className="mt-2 px-3 py-1 bg-white/60 rounded-lg border border-pink-100 flex items-center gap-1.5 animate-fade-in">
                                <Lightbulb size={12} className="text-amber-500" />
                                <span className="text-[11px] text-gray-500 italic leading-tight">{card.hint}</span>
                            </div>
                        )}

                        {!isSolved && !isSentences ? (
                            <div className="mt-6 w-full space-y-3">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    placeholder="Írd le angolul..."
                                    className="w-full px-4 py-3 bg-white rounded-xl border-2 border-purple-100 focus:border-purple-400 outline-none text-center font-bold text-lg text-purple-700 shadow-inner transition-all"
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                />
                                <p className="text-[10px] text-gray-400 text-center font-medium animate-pulse">
                                    Tipp: Koppints a hangszóróra, ha nem tudod!
                                </p>
                            </div>
                        ) : isSolved ? (
                            <div className="mt-6 flex flex-col items-center animate-bounce-in">
                                <div className="bg-green-100 text-green-600 p-2 rounded-full mb-2">
                                    <Check size={24} />
                                </div>
                                <span className="text-sm font-bold text-green-600">Kitaláltad!</span>
                                <span className="text-[10px] text-gray-400 mt-2">Koppints a kártyára a részletekért</span>
                            </div>
                        ) : null}

                        {card._generated && (
                            <span className="absolute top-3 left-3 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Új</span>
                        )}
                    </div>
                    <div className="flip-back absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-6">
                        <span className="text-5xl mb-3">{card.emoji}</span>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-purple-800 text-center">{card.english}</span>
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                {card.phonetic && (
                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-blue-100">
                                        IPA: /{card.phonetic}/
                                    </span>
                                )}
                                {card.hungarianPhonetic && (
                                    <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-purple-100">
                                        Kiejtés: [{card.hungarianPhonetic}]
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleKnow(); }}
                            className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-full font-black shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Következő <ChevronRight size={20} />
                        </button>
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
                    className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105 active:scale-95 transition-all relative group"
                >
                    <Snail size={20} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Csigalassú 🐌
                    </span>
                </button>
                {!isSentences && <SttButton targetWord={card.english} onResult={handleSttResult} />}
            </div>

            {sttFeedback === 'correct' && (
                <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
                    <Check size={18} /> {randomEncouragement()}
                </div>
            )}
            {sttFeedback === 'retry' && (
                <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold">
                    <RotateCcw size={16} /> Próbáld újra! 💪
                </div>
            )}

            <div className="flex gap-3 w-full max-w-xs mt-2">
                <button
                    onClick={nextCard}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-100 text-amber-700 rounded-2xl font-bold hover:bg-amber-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <RotateCcw size={16} /> Még gyakorlom
                </button>
                <button
                    onClick={handleKnow}
                    disabled={!isSolved && !isSentences}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all ${isSolved || isSentences
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:scale-[1.02] active:scale-95'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                >
                    <Check size={16} /> Tudom!
                </button>
            </div>

            <div className="flex items-center gap-6 text-gray-400 mt-2">
                <button onClick={(e) => { e.stopPropagation(); setIndex(i => Math.max(0, i - 1)); setFlipped(false); setSttFeedback(null); setUserInput(''); setIsSolved(false); }} className="p-2 hover:text-purple-500 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-semibold">{displayIndex + 1} / {learningCards.length}</span>
                <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="p-2 hover:text-purple-500 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
