import { useState } from 'react';
import {
    Volume2, ChevronLeft, ChevronRight, Check, RotateCcw,
    Sparkles, AlertTriangle
} from 'lucide-react';
import { Confetti } from '../ui/Confetti';
import { speak } from '../../hooks/useSound';
import { GRAMMAR_LESSONS } from '../../data/grammar';

export function GrammarTab({ userData, onToggleLesson, onQuestProgress }) {
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (selectedLesson) {
        const isCompleted = userData?.completedLessons?.includes(selectedLesson.id);

        const handleOptionSelect = (index) => {
            setSelectedOption(index);
            setShowError(false);
        };

        const handleNextQuestion = () => {
            const currentQuestion = selectedLesson.quiz[currentQuestionIndex];
            if (selectedOption === currentQuestion.correct) {
                if (currentQuestionIndex < selectedLesson.quiz.length - 1) {
                    setCurrentQuestionIndex(curr => curr + 1);
                    setSelectedOption(null);
                } else {
                    setShowSuccess(true);
                }
            } else {
                setShowError(true);
            }
        };

        if (quizMode) {
            if (showSuccess) {
                return (
                    <div className="space-y-6 animate-fade-in pb-20">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-green-100 text-center relative overflow-hidden">
                            <Confetti />
                            <div className="text-6xl mb-4 animate-bounce">🏆</div>
                            <h2 className="text-3xl font-black text-green-600 mb-4 animate-fade-in">Szép munka!</h2>
                            <p className="text-gray-600 font-medium mb-8">Sikeresen teljesítetted a tesztet, tiéd a jutalom XP és a pipa!</p>
                            <button
                                onClick={() => {
                                    onToggleLesson(selectedLesson.id, 15);
                                    if (onQuestProgress) onQuestProgress('vocab_review');
                                    setSelectedLesson(null);
                                    setQuizMode(false);
                                    setShowSuccess(false);
                                }}
                                className="w-full py-4 rounded-2xl font-black text-lg shadow-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={24} /> Befejezés és XP Begyűjtése
                            </button>
                        </div>
                    </div>
                );
            }

            const currentQuestion = selectedLesson.quiz[currentQuestionIndex];
            return (
                <div className="space-y-6 animate-fade-in pb-20">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-purple-100">
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Gyakorlás: {selectedLesson.title}</h2>
                        <div className="flex justify-between items-center mb-6 text-sm font-bold text-purple-400">
                            <span>Kérdés {currentQuestionIndex + 1} / {selectedLesson.quiz.length}</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-700 mb-6">{currentQuestion.question}</h3>

                        <div className="space-y-3 mb-8">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 font-semibold transition-all ${selectedOption === idx
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-100 hover:border-purple-200 bg-white text-gray-600'
                                        } ${showError && selectedOption === idx ? 'border-red-400 bg-red-50 text-red-600 animate-shake' : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {showError && (
                            <p className="text-red-500 font-bold mb-4 text-center animate-pulse">Hopsz, ez nem talált! Próbáld újra.</p>
                        )}

                        <button
                            onClick={handleNextQuestion}
                            disabled={selectedOption === null}
                            className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all ${selectedOption === null
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-[1.02] active:scale-95'
                                }`}
                        >
                            Ellenőrzés
                        </button>

                        <button
                            onClick={() => { setQuizMode(false); setShowSuccess(false); }}
                            className="w-full mt-4 py-3 text-gray-500 font-bold hover:text-gray-700 transition-colors"
                        >
                            Vissza az elmélethez
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6 animate-fade-in pb-20">
                <button
                    onClick={() => { setSelectedLesson(null); setQuizMode(false); setShowSuccess(false); }}
                    className="flex items-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all"
                >
                    <ChevronLeft size={20} /> Vissza a leckékhez
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-purple-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-4xl opacity-20 pointer-events-none">{selectedLesson.emoji}</div>
                    <h2 className="text-3xl font-black text-gray-800 mb-6">{selectedLesson.title}</h2>

                    <div className="prose prose-purple max-w-none mb-8">
                        <div className="relative z-10 text-gray-700 text-sm leading-relaxed space-y-4 bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
                            {selectedLesson.theory.split('\n\n').map((para, i) => (
                                <p key={i} dangerouslySetInnerHTML={{
                                    __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-purple-700">$1</strong>')
                                }} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 mb-8">
                        <h3 className="text-amber-800 font-black flex items-center gap-2 mb-2 text-sm">
                            <AlertTriangle size={18} /> Vigyázz! (Common Pitfall)
                        </h3>
                        <p className="text-amber-700 font-medium text-sm leading-snug">{selectedLesson.pitfall}</p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <Sparkles className="text-yellow-500" size={24} /> Példák
                        </h3>
                        <div className="grid gap-3">
                            {selectedLesson.examples.map((ex, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white border-2 border-purple-50 p-4 rounded-2xl shadow-sm hover:border-purple-200 transition-colors">
                                    <div>
                                        <p className="text-lg font-black text-purple-800">{ex.english}</p>
                                        <p className="text-sm font-bold text-gray-400 mt-1">{ex.hungarian}</p>
                                    </div>
                                    <button
                                        onClick={() => speak(ex.english, 1)}
                                        className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all flex-shrink-0"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={isCompleted ? () => { onToggleLesson(selectedLesson.id); setSelectedLesson(null); } : () => { setQuizMode(true); setCurrentQuestionIndex(0); setSelectedOption(null); setShowError(false); }}
                        className={`w-full mt-10 py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${isCompleted
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200'
                            }`}
                    >
                        {isCompleted ? <RotateCcw size={20} /> : <Check size={20} />}
                        {isCompleted ? 'Újratanulom ezt a leckét' : 'Teszt indítása'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="px-2">
                <h2 className="text-3xl font-black text-gray-800">Angol Nyelvtan</h2>
                <p className="text-gray-500 font-medium">Minden, amit az alapokhoz tudni kell 📚</p>
            </div>

            <div className="grid gap-4">
                {GRAMMAR_LESSONS.map((lesson) => {
                    const isCompleted = userData?.completedLessons?.includes(lesson.id);
                    return (
                        <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all flex items-center gap-5 text-left group relative overflow-hidden"
                        >
                            {isCompleted && (
                                <div className="absolute top-0 right-0 bg-green-400 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">
                                    Kész
                                </div>
                            )}
                            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner text-purple-600">
                                {lesson.emoji}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{lesson.title}</h3>
                                <p className="text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Kattints a részletekért</p>
                            </div>
                            <ChevronRight className="text-purple-200 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
