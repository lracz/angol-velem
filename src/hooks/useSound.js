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

    const playDing = useCallback(() => {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain).connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch { /* no audio support */ }
    }, [getCtx]);

    const playSwoosh = useCallback(() => {
        try {
            const ctx = getCtx();
            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.15;
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1500;
            source.connect(filter).connect(ctx.destination);
            source.start();
        } catch { /* no audio support */ }
    }, [getCtx]);

    return { playDing, playSwoosh };
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
