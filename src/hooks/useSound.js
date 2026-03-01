import { useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════
// WEB AUDIO API SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════════

export function useSound() {
    const ctxRef = useRef(null);

    const getCtx = useCallback(() => {
        if (!ctxRef.current) {
            ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
        return ctxRef.current;
    }, []);

    const playSuccess = useCallback(() => {
        try {
            const ctx = getCtx();
            const now = ctx.currentTime;

            // Harmonious two-note chime (C5 and E5)
            [523.25, 659.25].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.05);

                gain.gain.setValueAtTime(0, now + i * 0.05);
                gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.5);

                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.05);
                osc.stop(now + i * 0.05 + 0.5);
            });
        } catch { /* no audio support */ }
    }, [getCtx]);

    const playDing = playSuccess;
    const playSwoosh = playSuccess;
    return { playDing, playSwoosh, playSuccess };
}

// ═══════════════════════════════════════════════════════════════════
// TEXT-TO-SPEECH HELPER
// ═══════════════════════════════════════════════════════════════════

let preferredVoice = null;

const loadVoices = () => {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural/google voices
    preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
        || voices.find(v => v.lang.startsWith('en-US'))
        || voices.find(v => v.lang.startsWith('en'));
};

if (window.speechSynthesis) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
}

export const speak = (text, rate = 1) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    if (!preferredVoice) loadVoices();

    if (preferredVoice) {
        u.voice = preferredVoice;
    }

    u.lang = 'en-US';
    u.rate = rate;
    u.pitch = 1.0; // Slightly more natural pitch
    window.speechSynthesis.speak(u);
};
