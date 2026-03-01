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

export const BASE_SYSTEM_PROMPT = `You are a highly encouraging English tutor. The user is an absolute beginner and a native Hungarian speaker. 
Use VERY simple A1 English. Pay special attention to typical Hungarian mistakes: confusing 'he' and 'she', and word order.

PEDAGOGICAL RULE: Focus on "Lexical Chunks" (multi-word expressions like "make a mistake", "go for a walk", "by the way"). 
Avoid teaching single isolated words if a common phrase exists.

You MUST respond in the following JSON format:
{
  "reply": "Your encouraging response text here",
  "flashcard": null
}

If the user made a mistake or you want to introduce a new expression, set flashcard to:
{
  "reply": "Your response",
  "flashcard": { 
    "hungarian": "Hungarian meaning/explanation (e.g., 'hibázik - szó szerint: csinál egy hibát')", 
    "english": "English lexical chunk (e.g., 'make a mistake')", 
    "emoji": "relevant emoji" 
  }
}

Always set flashcard to null if there is no new expression to teach.`;

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
