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
let voiceRetries = 0;

const loadVoices = () => {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();

    // Priority 1: High-quality English (Google/Natural/Premium)
    let voice = voices.find(v => v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Samantha')));

    // Priority 2: Any US English
    if (!voice) voice = voices.find(v => v.lang.startsWith('en-US'));

    // Priority 3: Any English
    if (!voice) voice = voices.find(v => v.lang.startsWith('en'));

    if (voice) {
        preferredVoice = voice;
        console.log(`[Audio] Voice selected: ${voice.name} (${voice.lang})`);
    } else if (voices.length > 0 && voiceRetries < 5) {
        // Retry if voices are present but none matched English yet (common on some browsers)
        voiceRetries++;
        setTimeout(loadVoices, 500);
    }
};

if (window.speechSynthesis) {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
    // Extra insurance: try again after 1s
    setTimeout(loadVoices, 1000);
}

export const speak = (text, rate = 0.9) => {
    if (!window.speechSynthesis) {
        console.warn("[Audio] Synthesis not supported");
        return;
    }
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);

    // Always call loadVoices just in case they arrived late
    if (!preferredVoice) loadVoices();

    if (preferredVoice) {
        u.voice = preferredVoice;
    }

    u.lang = 'en-US';
    u.rate = rate; // Slightly slower for better clarity
    u.pitch = 1.0;
    u.volume = 1.0;

    window.speechSynthesis.speak(u);
};
