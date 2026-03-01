import React, { useState, useEffect } from 'react';
import { ShieldAlert, Save, X, Trash2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export function AdminPanel({ onClose }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    const [challengeData, setChallengeData] = useState({
        active: false,
        hungarian: '',
        english: '',
        xpReward: 500,
        message: 'Új kihívás a Párodtól!'
    });

    const ADMIN_PASSWORD = 'kiscica'; // simple default password

    useEffect(() => {
        if (isAuthenticated) {
            loadChallenge();
        }
    }, [isAuthenticated]);

    const loadChallenge = async () => {
        try {
            const docRef = doc(db, 'global', 'challenges');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setChallengeData(snap.data());
            }
        } catch (err) {
            console.error("Failed to load challenge", err);
        }
    };

    const saveChallenge = async (activeStatus = true) => {
        try {
            const docRef = doc(db, 'global', 'challenges');
            const dataToSave = { ...challengeData, active: activeStatus };
            await setDoc(docRef, dataToSave);
            setChallengeData(dataToSave);
            alert('Kihívás sikeresen mentve!');
        } catch (err) {
            alert('Hiba a mentés során: ' + err.message);
        }
    };

    const deleteChallenge = async () => {
        if (window.confirm("Biztosan törlöd (inaktiválod) az aktuális kihívást?")) {
            await saveChallenge(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Helytelen jelszó!');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <form onSubmit={handleLogin} className="bg-white p-6 rounded-3xl w-full max-w-sm text-center shadow-2xl animate-fade-in">
                    <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-black mb-4">Adminisztrációs Panel</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Jelszó..."
                        className="w-full px-4 py-3 bg-gray-100 rounded-xl mb-4 text-center font-bold"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Mégse</button>
                        <button type="submit" className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">Belépés</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl animate-bounce-in my-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-black flex items-center gap-2 text-red-600">
                        <ShieldAlert size={24} /> Titkos Vezérlő
                    </h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Üdvözlő Szöveg / Motiváció</label>
                        <input
                            type="text"
                            value={challengeData.message}
                            onChange={e => setChallengeData({ ...challengeData, message: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Magyar Mondat (A feladvány)</label>
                        <input
                            type="text"
                            value={challengeData.hungarian}
                            onChange={e => setChallengeData({ ...challengeData, hungarian: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                            placeholder="pl. Szeretlek, de mosogass el!"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Angol Megoldás (Szavakra bontva lesz)</label>
                        <input
                            type="text"
                            value={challengeData.english}
                            onChange={e => setChallengeData({ ...challengeData, english: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                            placeholder="pl. I love you but wash the dishes!"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">XP Jutalom</label>
                        <input
                            type="number"
                            value={challengeData.xpReward}
                            onChange={e => setChallengeData({ ...challengeData, xpReward: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-100 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mt-4">
                        <input
                            type="checkbox"
                            id="activeCheck"
                            checked={challengeData.active}
                            onChange={e => setChallengeData({ ...challengeData, active: e.target.checked })}
                            className="w-5 h-5 accent-red-600"
                        />
                        <label htmlFor="activeCheck" className="font-bold cursor-pointer">Kihívás Aktiválása!</label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t mt-4">
                        <button
                            onClick={deleteChallenge}
                            className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold flex items-center justify-center transition-colors"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button
                            onClick={() => saveChallenge(challengeData.active)}
                            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} /> Mentés és Küldés
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
