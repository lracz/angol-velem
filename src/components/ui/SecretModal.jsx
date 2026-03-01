import React from 'react';
import { Heart, X } from 'lucide-react';
import { Confetti } from './Confetti';

export function SecretModal({ secret, onClose }) {
    if (!secret) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <Confetti active={true} />

            <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-bounce-in border-4 border-pink-200">
                <div className="bg-gradient-to-r from-pink-400 to-red-400 p-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Heart size={64} className="fill-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-2 opacity-20">
                        <Heart size={48} className="fill-white" />
                    </div>
                    <span className="text-6xl filter drop-shadow-md mb-2 block relative z-10">{secret.emoji}</span>
                    <h2 className="text-2xl font-black text-white relative z-10 filter drop-shadow-sm">
                        Titkos Üzenet!
                    </h2>
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{secret.title}</h3>
                    <div className="bg-pink-50 p-4 rounded-2xl mb-6 relative border border-pink-100">
                        <Heart size={20} className="absolute -top-3 -right-3 text-pink-400 fill-pink-400 animate-pulse" />
                        <p className="text-gray-700 font-medium italic">"{secret.message}"</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                    >
                        Köszönöm! ❤️
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
