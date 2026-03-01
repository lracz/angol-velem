import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export function SttButton({ targetWord, onResult }) {
    const [listening, setListening] = useState(false);
    const [supported, setSupported] = useState(true);
    const recRef = useRef(null);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { setSupported(false); return; }
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 3;
        rec.onresult = (e) => {
            const results = Array.from(e.results[0]).map(r => r.transcript.toLowerCase().trim());
            const target = targetWord.toLowerCase().trim();
            const match = results.some(r => r.includes(target) || target.includes(r));
            onResult(match);
            setListening(false);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        recRef.current = rec;
    }, [targetWord, onResult]);

    if (!supported) {
        return (
            <button disabled className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="Chrome böngészőben működik a legjobban!">
                <MicOff size={20} />
            </button>
        );
    }

    return (
        <button
            onClick={() => {
                if (listening) { recRef.current?.stop(); setListening(false); }
                else { recRef.current?.start(); setListening(true); }
            }}
            className={`p-3 rounded-full transition-all duration-200 ${listening
                ? 'bg-red-100 text-red-600 animate-pulse-glow'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105 active:scale-95'
                }`}
            title={listening ? 'Hallgatom...' : 'Mondd ki!'}
        >
            {listening ? <Mic size={20} /> : <Mic size={20} />}
        </button>
    );
}
