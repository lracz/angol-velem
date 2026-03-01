import { useState } from 'react';
import { Heart } from 'lucide-react';
import {
    auth,
    signInWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup
} from '../../config/firebase';

export function LoginScreen({ onLogin, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState(error);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!auth) { setLocalError("A Firebase nincs beállítva. Ellenőrizd a .env fájlt!"); return; }
        setLocalError(null);
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLocalError("Helytelen email vagy jelszó!");
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        if (!auth) {
            setLocalError("A Firebase nincs beállítva. Ellenőrizd a .env fájlt!");
            return;
        }
        setLocalError(null);
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("Google login error:", err);
            if (err.code === 'auth/popup-blocked') {
                setLocalError("A böngésződ blokkolta a felugró ablakot. Engedélyezd a pop-upokat!");
            } else if (err.code === 'auth/operation-not-supported') {
                setLocalError("A Google bejelentkezés nincs engedélyezve a Firebase konzolban!");
            } else {
                setLocalError("Hiba történt a Google belépés során. Próbáld újra!");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-[2rem] shadow-2xl p-10 animate-fade-in border border-white/20">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-inner">
                        <Heart className="text-pink-500 fill-pink-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Angol Velem</h1>
                    <p className="text-gray-500 font-medium">Tanulj angolul szeretettel! 💕</p>
                </div>

                {localError && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-center gap-2 animate-bounce-in">
                        <div className="w-1 h-4 bg-red-400 rounded-full" />
                        {localError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-300 focus:bg-white outline-none transition-all text-gray-700 font-medium shadow-sm"
                            placeholder="pelda@email.hu"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Jelszó</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-300 focus:bg-white outline-none transition-all text-gray-700 font-medium shadow-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-pink-300/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Belépés...' : 'Belépés'}
                    </button>
                </form>

                <div className="mt-8 relative h-px bg-gray-100 flex items-center justify-center">
                    <span className="bg-white px-4 text-xs font-bold text-gray-400 tracking-widest uppercase">Vagy</span>
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full mt-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Belépés Google-lal
                </button>
            </div>
        </div>
    );
}
