import { useState, useMemo } from 'react';
import { Trophy, Target, Medal, Check, Lock, Gift } from 'lucide-react';
import { CATEGORIES } from '../../data/vocabulary';
import { SNAIL_COUPONS } from '../../data/coupons';
import { Confetti } from '../ui/Confetti';

export function ProgressionTab({ userData, vocabulary, grammarLessons, showAllQuests, setShowAllQuests, onRedeemCoupon }) {
    const [confirmCoupon, setConfirmCoupon] = useState(null);
    const [showCouponConfetti, setShowCouponConfetti] = useState(false);

    const vocabProgress = useMemo(() => {
        if (!vocabulary.length) return 0;
        const knownCount = vocabulary.filter(v => userData?.vocabMap?.[v.id] === 'known').length;
        return Math.round((knownCount / vocabulary.length) * 100);
    }, [vocabulary, userData]);

    const grammarProgress = useMemo(() => {
        if (!grammarLessons.length) return 0;
        const completedCount = userData?.completedLessons?.length || 0;
        return Math.round((completedCount / grammarLessons.length) * 100);
    }, [grammarLessons, userData]);

    const combinedProgress = Math.round((vocabProgress + grammarProgress) / 2);

    const categoryStats = useMemo(() => {
        const stats = {};
        vocabulary.forEach(v => {
            if (!stats[v.categoryId]) stats[v.categoryId] = { total: 0, known: 0 };
            stats[v.categoryId].total++;
            if (userData?.vocabMap?.[v.id] === 'known') stats[v.categoryId].known++;
        });
        return stats;
    }, [vocabulary, userData]);

    const level = userData?.level || 1;
    const xp = userData?.xp || 0;
    const minXp = (level - 1) * (level - 1) * 100;
    const maxXp = level * level * 100;
    const xpPercent = Math.max(0, Math.min(100, ((xp - minXp) / (maxXp - minXp)) * 100));

    const redeemedCoupons = userData?.redeemedCoupons || [];

    const handleRedeem = (coupon) => {
        if (onRedeemCoupon) onRedeemCoupon(coupon.id);
        setConfirmCoupon(null);
        setShowCouponConfetti(true);
        setTimeout(() => setShowCouponConfetti(false), 3000);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* ═══════════════════════════════════════════════════════ */}
            {/* LEVEL & XP HERO CARD                                  */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Trophy className="text-yellow-300" size={32} /> {level}. szint
                    </h2>
                    <div className="flex justify-between items-end mt-4 mb-2">
                        <span className="text-sm font-bold text-purple-200 uppercase tracking-widest">Következő szintig</span>
                        <span className="font-black text-yellow-300">{xp} / {maxXp} XP</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-1000 ease-out"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                    <p className="text-purple-100 font-medium mt-4">Lássuk, mennyit fejlődtél még! 🚀</p>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Szókincs</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black">{vocabProgress}%</span>
                                <span className="text-sm font-bold text-purple-200 mb-1">kész</span>
                            </div>
                            <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-yellow-400 transition-all duration-1000 ease-out" style={{ width: `${vocabProgress}%` }} />
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Nyelvtan</p>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-black">{grammarProgress}%</span>
                                <span className="text-sm font-bold text-purple-200 mb-1">pipa</span>
                            </div>
                            <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-green-400 transition-all duration-1000 ease-out" style={{ width: `${grammarProgress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* DAILY QUESTS                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        <Target className="text-pink-500" size={24} /> Napi Küldetések
                    </h3>
                    <button
                        onClick={() => setShowAllQuests(!showAllQuests)}
                        className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
                    >
                        {showAllQuests ? 'Kevesebb mutatás' : 'Összes mutatása'}
                    </button>
                </div>
                <div className={`grid gap-4 transition-all duration-300 ${!showAllQuests ? 'overflow-hidden' : ''}`}>
                    {(userData?.quests || []).slice(0, showAllQuests ? undefined : 3).map(q => (
                        <div key={q.id} className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50 flex items-center gap-4 hover:shadow-md transition-shadow animate-fade-in">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner flex-shrink-0 ${q.done ? 'bg-green-100 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
                                {q.done ? <Check size={24} /> : '🎯'}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-2">
                                    <span className={`font-bold ${q.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{q.text}</span>
                                    <span className="text-xs font-black text-amber-500 whitespace-nowrap">+{q.xp} XP</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                    <div className={`h-full transition-all duration-700 ${q.done ? 'bg-green-400' : 'bg-amber-400'}`} style={{ width: `${(q.current / q.target) * 100}%` }} />
                                </div>
                                <div className="text-[10px] text-gray-400 font-bold mt-1 text-right">{q.current} / {q.target}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* SNAIL COUPONS (Csigakuponok)                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="space-y-4 mt-8">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 px-2">
                    <Gift className="text-pink-500" size={24} /> 🐌 Csigakuponok
                </h3>
                <p className="text-sm text-gray-500 px-2">Szintlépéssel jutalmakat oldhatsz fel! Váltsd be őket bármikor.</p>

                <Confetti active={showCouponConfetti} />

                <div className="grid gap-4">
                    {SNAIL_COUPONS.map(coupon => {
                        const isUnlocked = level >= coupon.requiredLevel;
                        const isRedeemed = redeemedCoupons.includes(coupon.id);

                        return (
                            <div
                                key={coupon.id}
                                className={`rounded-3xl p-5 shadow-sm border flex items-center gap-4 transition-all duration-300 ${isRedeemed
                                        ? 'bg-green-50/80 border-green-200 opacity-75'
                                        : isUnlocked
                                            ? `${coupon.bgLight} hover:shadow-md hover:scale-[1.01]`
                                            : 'bg-gray-50 border-gray-200 opacity-60'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0 ${isRedeemed
                                        ? 'bg-green-100'
                                        : isUnlocked
                                            ? `bg-gradient-to-br ${coupon.color} text-white`
                                            : 'bg-gray-100'
                                    }`}>
                                    {isRedeemed ? <Check size={24} className="text-green-600" /> : isUnlocked ? coupon.emoji : <Lock size={20} className="text-gray-400" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <span className={`font-bold text-sm ${isRedeemed ? 'text-green-600 line-through' : isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {coupon.title}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${isRedeemed
                                                ? 'bg-green-100 text-green-600'
                                                : isUnlocked
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isRedeemed ? '✅ Beváltva' : `Szint ${coupon.requiredLevel}`}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 leading-snug ${isRedeemed ? 'text-green-500' : isUnlocked ? 'text-gray-500' : 'text-gray-300'}`}>
                                        {coupon.description}
                                    </p>
                                    {isUnlocked && !isRedeemed && (
                                        <button
                                            onClick={() => setConfirmCoupon(coupon)}
                                            className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r ${coupon.color} shadow-md hover:scale-105 active:scale-95 transition-all`}
                                        >
                                            🎟️ Beváltás
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* CATEGORY STATS                                        */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="space-y-4 mt-8">
                <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 px-2">
                    <Target className="text-pink-500" size={24} /> Kategóriák állapota
                </h3>
                <div className="grid gap-4">
                    {CATEGORIES.map(cat => {
                        const stat = categoryStats[cat.id] || { total: 0, known: 0 };
                        const percent = stat.total > 0 ? Math.round((stat.known / stat.total) * 100) : 0;
                        return (
                            <div key={cat.id} className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50 flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                                    {stat.known === stat.total && stat.total > 0 ? '✅' : '📖'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-bold text-gray-800">{cat.name}</span>
                                        <span className="text-xs font-black text-purple-400">{stat.known}/{stat.total} szó</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${percent === 100 ? 'bg-green-400' : 'bg-purple-400'}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* READINESS                                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 text-6xl opacity-20 pointer-events-none transform -rotate-12 hover:rotate-0 hover:scale-110 hover:opacity-100 transition-all duration-300">🐌</div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                        <Medal className="text-indigo-500" size={24} /> Készenlét (Readiness)
                    </h3>
                    <span className="text-2xl font-black text-indigo-600">{combinedProgress}%</span>
                </div>

                <div className="w-full h-4 bg-indigo-100/50 rounded-full overflow-hidden mb-4 shadow-inner relative z-10">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-blue-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${combinedProgress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 blur-[2px] animate-pulse" />
                    </div>
                </div>

                <p className="text-sm text-indigo-700 font-medium relative z-10">
                    {combinedProgress < 50
                        ? "Még az út elején jársz. Folytasd a szavak tanulását és a nyelvtan áttekintését!"
                        : combinedProgress < 100
                            ? "Egyre jobb vagy! Készülj fel a végső vizsgára!"
                            : "Készen állsz! A tudásod sziklaszilárd, mint egy csiga háza! 🏆"}
                </p>
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* CONFIRMATION MODAL                                    */}
            {/* ═══════════════════════════════════════════════════════ */}
            {confirmCoupon && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" onClick={() => setConfirmCoupon(null)}>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-purple-100 animate-bounce-in" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="text-5xl mb-4">{confirmCoupon.emoji}</div>
                            <h3 className="text-xl font-black text-gray-800 mb-2">{confirmCoupon.title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{confirmCoupon.description}</p>
                            <p className="text-xs text-amber-600 font-bold mb-6 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                ⚠️ Figyelem: A kupont csak egyszer lehet beváltani!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmCoupon(null)}
                                    className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Mégsem
                                </button>
                                <button
                                    onClick={() => handleRedeem(confirmCoupon)}
                                    className={`flex-1 py-3 rounded-2xl text-white font-black bg-gradient-to-r ${confirmCoupon.color} shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
                                >
                                    ✨ Beváltom!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
