import React, { useState } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';
import { Confetti } from './Confetti';

export function SnailShopModal({
    userData,
    updateFirebase,
    onClose
}) {
    const [showConfetti, setShowConfetti] = useState(false);
    const coins = userData?.snailCoins || 0;
    const owned = userData?.ownedAccessories || [];
    const equipped = userData?.equippedAccessories || [];

    const handleBuyOrEquip = (acc) => {
        const isOwned = owned.includes(acc.id);
        const isEquipped = equipped.includes(acc.id);

        if (isEquipped) {
            // Unequip
            updateFirebase({
                equippedAccessories: equipped.filter(id => id !== acc.id)
            });
            return;
        }

        if (isOwned) {
            // Equip (replace same type)
            const newEquipped = equipped.filter(id => {
                const existingAcc = ACCESSORIES.find(a => a.id === id);
                return existingAcc?.type !== acc.type;
            });
            newEquipped.push(acc.id);
            updateFirebase({ equippedAccessories: newEquipped });
            return;
        }

        // Buy
        if (coins >= acc.price) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1500);

            const newEquipped = equipped.filter(id => {
                const existingAcc = ACCESSORIES.find(a => a.id === id);
                return existingAcc?.type !== acc.type;
            });
            newEquipped.push(acc.id);

            updateFirebase({
                snailCoins: coins - acc.price,
                ownedAccessories: [...owned, acc.id],
                equippedAccessories: newEquipped
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <Confetti active={showConfetti} />

            <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 shrink-0 shadow-md z-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-black text-white flex items-center gap-2 filter drop-shadow">
                            <ShoppingBag size={20} /> Csigus Bolt
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 backdrop-blur-sm border border-white/30">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Egyenleged:</span>
                        <span className="text-yellow-300 font-bold text-lg leading-none">{coins} 🪙</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-4 overflow-y-auto w-full flex-grow relative bg-gray-50">
                    <div className="grid grid-cols-2 gap-3 pb-8">
                        {ACCESSORIES.map(acc => {
                            const isOwned = owned.includes(acc.id);
                            const isEquipped = equipped.includes(acc.id);
                            const canAfford = coins >= acc.price;

                            return (
                                <div key={acc.id} className={`bg-white rounded-2xl border-2 p-3 flex flex-col items-center text-center transition-all ${isEquipped ? 'border-purple-400 bg-purple-50/50 shadow-md' :
                                    isOwned ? 'border-green-200 hover:border-green-400' :
                                        'border-gray-100 hover:border-gray-300'
                                    }`}>
                                    <div className="text-4xl filter drop-shadow-md mb-2 h-12 flex items-center justify-center">
                                        {acc.emoji}
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-xs mb-2 h-8 flex items-center justify-center">
                                        {acc.name}
                                    </h4>

                                    <button
                                        onClick={() => handleBuyOrEquip(acc)}
                                        disabled={!isOwned && !canAfford}
                                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${isEquipped ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                                            isOwned ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                canAfford ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                                    'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                                            }`}
                                    >
                                        {isEquipped ? (
                                            <><Check size={14} /> Levétel</>
                                        ) : isOwned ? (
                                            'Felvétel'
                                        ) : (
                                            <>{acc.price} 🪙</>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
