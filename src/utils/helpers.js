import { Coffee, Map, ShoppingCart, Phone, Star } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// ENCOURAGEMENTS & CONFETTI
// ═══════════════════════════════════════════════════════════════════

export const ENCOURAGEMENTS = [
    'Szuper! 🌟', 'Ügyes vagy! 💪', 'Fantasztikus! ✨', 'Nagyszerű! 🎉',
    'Remek munka! 👏', 'Így kell ezt! 🔥', 'Büszke vagyok rád! 💕',
];

export const randomEncouragement = () =>
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

export const CONFETTI_COLORS = ['#f9a8d4', '#c084fc', '#93c5fd', '#86efac', '#fde047', '#fca5a5'];

// ═══════════════════════════════════════════════════════════════════
// AI CHAT HELPERS
// ═══════════════════════════════════════════════════════════════════

export const AI_SCENARIOS = [
    { id: 'coffee', label: '☕ Kávé rendelése', icon: Coffee, systemExtra: 'Simulate ordering coffee at a café. Start by greeting the student as a barista.' },
    { id: 'directions', label: '🗺️ Útbaigazítás', icon: Map, systemExtra: 'Simulate asking for and giving directions. Start by asking "Hi! Can I help you?"' },
    { id: 'shopping', label: '🛒 Bevásárlás', icon: ShoppingCart, systemExtra: 'Simulate buying groceries at a store. Start by saying "Welcome! What would you like?"' },
    { id: 'phone', label: '📞 Telefonhívás', icon: Phone, systemExtra: 'Simulate a phone call to book a table at a restaurant. Start with "Hello, Restaurant Bella, how can I help?"' },
    { id: 'introduce', label: '👋 Bemutatkozás', icon: Star, systemExtra: 'Simulate meeting someone new. Start with "Hi! My name is Anna. What is your name?"' },
];

export const BASE_SYSTEM_PROMPT = `You are a highly encouraging English tutor. The user is an absolute beginner and a native Hungarian speaker. Use VERY simple A1 English. Pay special attention to typical Hungarian mistakes: confusing 'he' and 'she' (Hungarian has no genders), and word order (Hungarian is flexible, English is strict SVO). If she makes these mistakes, gently correct her in Hungarian, then ask her to repeat in English. Always praise her efforts.

You MUST respond in the following JSON format:
{
  "reply": "Your encouraging response text here",
  "flashcard": null
}

If the user made a vocabulary or grammar mistake that you corrected, set flashcard to an object:
{
  "reply": "Your response",
  "flashcard": { "hungarian": "correct hungarian word", "english": "correct english word", "emoji": "relevant emoji" }
}

Always set flashcard to null if there was no mistake to correct.`;

export function parseAiResponse(raw) {
    try {
        const parsed = JSON.parse(raw);
        return {
            reply: parsed.reply || raw,
            flashcard: parsed.flashcard && parsed.flashcard.hungarian && parsed.flashcard.english
                ? parsed.flashcard
                : null,
            correction: parsed.correction && parsed.correction.original && parsed.correction.corrected
                ? parsed.correction
                : null,
        };
    } catch {
        return { reply: raw, flashcard: null, correction: null };
    }
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DAILY_GOAL = 50;
