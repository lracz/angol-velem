import React, { useState, useEffect } from 'react';
import { Utensils, Droplet, Heart, ShoppingBag, X } from 'lucide-react';
import { ACCESSORIES } from '../../data/accessories';

export function SnailPet({
    userData,
    updateFirebase,
    handleOpenShop
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEating, setIsEating] = useState(false);

    // Snail states from userData or defaults
    const foodItems = userData?.snailFood || 0;
    const waterItems = userData?.snailWater || 0;
    const coins = userData?.snailCoins || 0;

    const foodLevel = userData?.snailFoodLevel ?? 100;
    const waterLevel = userData?.snailWaterLevel ?? 100;

    const equipped = userData?.equippedAccessories || [];

    // Calculate generic happiness/health based on food & water
    const healthTarget = (foodLevel + waterLevel) / 2;
    const emotion = healthTarget > 75 ? '😎' : healthTarget > 40 ? '🐌' : '🥺';

    // Handle Feeding
    const handleFeed = (e) => {
        e.stopPropagation();
        if (foodItems > 0 && foodLevel < 100) {
            setIsEating(true);
            setTimeout(() => setIsEating(false), 800);
            updateFirebase({
                snailFood: foodItems - 1,
                snailFoodLevel: Math.min(100, foodLevel + 20)
            });
        }
    };

    // Handle Watering
    const handleWater = (e) => {
        e.stopPropagation();
        if (waterItems > 0 && waterLevel < 100) {
            setIsEating(true);
            setTimeout(() => setIsEating(false), 800);
            updateFirebase({
                snailWater: waterItems - 1,
                snailWaterLevel: Math.min(100, waterLevel + 20)
            });
        }
    };

    if (!isOpen) {
        return (
            <div
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-0 z-50 group flex items-center justify-end cursor-pointer bg-white/60 hover:bg-white/90 backdrop-blur-sm border border-pink-100 rounded-l-2xl shadow-sm px-3 py-2 transition-all"
            >
                <span className="text-[10px] font-bold text-pink-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Snail Pet
                </span>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <span className={`text-3xl filter drop-shadow hover:scale-110 transition-transform ${isEating ? 'animate-bounce' : ''}`}>
                        {emotion}
                    </span>
                    {/* Render equipped accessories mini */}
                    {equipped.map(accId => {
                        const acc = ACCESSORIES.find(a => a.id === accId);
                        if (!acc) return null;
                        return (
                            <span key={acc.id} className={`absolute ${acc.position} ${acc.scale} pointer-events-none filter drop-shadow-sm`}>
                                {acc.emoji}
                            </span>
                        );
                    })}
                </div>
                {/* Urgent indicators */}
                {healthTarget <= 40 && (
                    <span className="absolute -top-1 -left-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 z-[60] w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-4 border-pink-100 animate-bounce-in overflow-hidden">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-3 flex justify-between items-center relative">
                <h3 className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Heart size={16} className="text-pink-500 fill-pink-500" /> Csigus
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
            </div>

            <div className="p-4 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative w-24 h-24 flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 rounded-full mb-4 shadow-inner border border-gray-100">
                    <span className={`text-5xl filter drop-shadow-lg scale-x-[-1] transition-transform ${isEating ? 'animate-bounce' : ''}`}>
                        {emotion}
                    </span>
                    {equipped.map(accId => {
                        const acc = ACCESSORIES.find(a => a.id === accId);
                        if (!acc) return null;
                        let pos = acc.position;
                        // Avatar is mirrored here (scale-x-[-1]), we might need to adjust positions but we accept the simple approach.
                        return (
                            <span key={acc.id} className={`absolute ${pos} scale-125 pointer-events-none filter drop-shadow-md`}>
                                {acc.emoji}
                            </span>
                        );
                    })}
                </div>

                {/* Status Bars */}
                <div className="w-full space-y-3 mb-4">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-0.5 px-1">
                            <span className="flex items-center gap-1"><Utensils size={10} /> Éhség</span>
                            <span>{Math.floor(foodLevel)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${foodLevel}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-0.5 px-1">
                            <span className="flex items-center gap-1"><Droplet size={10} /> Szomjúság</span>
                            <span>{Math.floor(waterLevel)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${waterLevel}%` }} />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 w-full mb-4">
                    <button
                        onClick={handleFeed}
                        disabled={foodItems === 0 || foodLevel >= 100}
                        className="flex flex-col items-center py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-orange-600 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <Utensils size={18} className="mb-1" />
                        <span className="text-xs">Etetés</span>
                        <span className="text-[9px] bg-orange-200 px-1.5 py-0.5 rounded-full mt-1">
                            Raktáron: {foodItems}
                        </span>
                    </button>

                    <button
                        onClick={handleWater}
                        disabled={waterItems === 0 || waterLevel >= 100}
                        className="flex flex-col items-center py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-blue-600 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <Droplet size={18} className="mb-1" />
                        <span className="text-xs">Itatás</span>
                        <span className="text-[9px] bg-blue-200 px-1.5 py-0.5 rounded-full mt-1">
                            Raktáron: {waterItems}
                        </span>
                    </button>
                </div>

                {/* Footer / Shop */}
                <div className="w-full flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Egyenleg</span>
                        <span className="font-bold text-yellow-500 text-sm">{coins} 🪙</span>
                    </div>
                    <button
                        onClick={handleOpenShop}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg text-xs font-bold transition-colors"
                    >
                        <ShoppingBag size={14} />
                        Bolt
                    </button>
                </div>
            </div>
        </div>
    );
}
