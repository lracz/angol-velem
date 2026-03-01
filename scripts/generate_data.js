import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_API_KEY_SECONDARY = process.env.VITE_GEMINI_API_KEY_SECONDARY;

const CATEGORIES = [
    "Alapvető Névmások és Igék (Core Pronouns & Verbs)",
    "Idő és Számok (Time & Numbers)",
    "Ember és Család (People & Family)",
    "Otthon és Mindennapok (Home & Daily Life)",
    "Étel és Ital (Food & Drinks)",
    "Utazás és Irányok (Travel & Directions)",
    "Munka és Pénz (Work & Money)",
    "Természet és Állatok (Nature & Animals)",
    "Leggyakoribb Melléknevek (Common Adjectives)",
    "Érzelmek és Érzések (Emotions & Feelings)",
    "Egészség és Test (Health & Body)",
    "Oktatás és Iskola (Education & School)",
    "Szabadidő és Hobbi (Leisure & Hobbies)",
    "Város és Közlekedés (City & Transport)",
    "Időjárás és Évszakok (Weather & Seasons)",
    "Ruházat és Divat (Clothes & Fashion)",
    "Technológia és Média (Tech & Media)",
    "Színek és Formák (Colors & Shapes)"
];

const PHRASE_CATEGORIES = [
    "Üdvözlések és Alapok (Basics)",
    "Ismerkedés (Introductions)",
    "Étkezés (Dining)",
    "Vásárlás (Shopping)",
    "Utazás (Travel)",
    "Segítségkérés (Help)",
    "Érzelmek (Emotions)",
    "Vélemény (Opinions)",
    "Helyszíni Beszélgetés (Socializing)",
    "Udvariasság (Politeness)"
];

const GRAMMAR_TOPICS = [
    "Névmások (I, You, He...)",
    "A 'Lenni' ige (To Be - am/is/are)",
    "Egyszerű jelen (Present Simple)",
    "Folyamatos jelen (Present Continuous)",
    "Birtoklás (Have / Has)",
    "Múlt idő alapok (Past Simple)",
    "Jövő idő (Will / Going to)",
    "Személyes névmások tárgyesete (me, you, him)",
    "A / An / The (Névelők)",
    "Többes szám (Plurals)",
    "Kériőszavak (Who, What, Where...)",
    "Módbeli segédigék (Can, Must, Should)",
    "Birtokos névmások (My, Your, His)",
    "Határozószók (Always, Sometimes...)"
];

async function callGemini(prompt, useSecondary = false) {
    const key = useSecondary ? GEMINI_API_KEY_SECONDARY : GEMINI_API_KEY;
    if (!key) throw new Error("API Key is missing!");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

    for (let attempts = 0; attempts < 2; attempts++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (response.status === 429 || response.status === 403) {
                if (!useSecondary && GEMINI_API_KEY_SECONDARY) {
                    console.warn(`Primary key failed (${response.status}). Switching to secondary...`);
                    return await callGemini(prompt, true);
                }
                console.warn(`Rate limit or error hit. Retrying in 10s...`);
                await new Promise(r => setTimeout(r, 10000));
                continue;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Status: ${response.status}, Body: ${errorText}`);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0].content) {
                console.error("Unexpected response structure:", JSON.stringify(data));
                return [];
            }
            try {
                const text = data.candidates[0].content.parts[0].text;
                // Find anything that looks like a JSON array or object
                const firstBracket = text.indexOf('[');
                const lastBracket = text.lastIndexOf(']');
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');

                let cleanJson = "";
                if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
                    cleanJson = text.substring(firstBracket, lastBracket + 1);
                } else if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanJson = text.substring(firstBrace, lastBrace + 1);
                } else {
                    cleanJson = text;
                }

                return JSON.parse(cleanJson);
            } catch (e) {
                console.error("JSON Parse Error. Raw text snippet:", data.candidates[0].content.parts[0].text.substring(0, 100));
                return [];
            }
        } catch (e) {
            if (attempts === 1) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function generateVocabulary() {
    console.log("🚀 Starting Massive Vocabulary Generation (Incremental)...");
    let vocabularyIdCounter = 1;
    let phrasesIdCounter = 1;
    let allVocabulary = [];
    let allPhrases = [];

    const save = () => {
        const output = `// AUTO-GENERATED LIBRARY
export const CATEGORIES = ${JSON.stringify(CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c.split("(")[0].trim() })), null, 2)};
export const PHRASE_CATEGORIES = ${JSON.stringify(PHRASE_CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c.split("(")[0].trim() })), null, 2)};
export const INITIAL_VOCABULARY = ${JSON.stringify(allVocabulary, null, 2)};
export const PHRASES = ${JSON.stringify(allPhrases, null, 2)};`;
        fs.writeFileSync(path.join(__dirname, '../src/data/vocabulary.js'), output);
    };

    // WORDS
    for (const category of CATEGORIES) {
        console.log(`📦 Category: ${category}`);
        const prompt = `Generate exactly 20 common English words for "${category}". 
        Requirements:
        1. Return ONLY a valid JSON array of objects.
        2. Format: [{ "hungarian": "...", "english": "...", "emoji": "...", "phonetic": "...", "hint": "..." }]
        3. A1-A2 level only. No other text.`;

        try {
            const items = await callGemini(prompt);
            if (Array.isArray(items) && items.length > 0) {
                const categoryId = category.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
                items.forEach(item => {
                    allVocabulary.push({
                        id: `v${vocabularyIdCounter++}`,
                        ...item,
                        categoryId
                    });
                });
                console.log(`✅ Success! Added ${items.length} words. Total: ${allVocabulary.length}`);
                save(); // Save progress
            }
            await new Promise(r => setTimeout(r, 10000));
        } catch (e) {
            console.error(`❌ Failed ${category}: ${e.message}`);
            await new Promise(r => setTimeout(r, 15000));
        }
    }

    // PHRASES
    for (const category of PHRASE_CATEGORIES) {
        console.log(`💬 Phrase Category: ${category}`);
        const prompt = `Generate exactly 15 common English phrases for "${category}".
        Requirements:
        1. Return ONLY a valid JSON array of objects.
        2. Format: [{ "hungarian": "...", "english": "...", "emoji": "...", "literal": "..." }]
        3. Practical, everyday usage. No other text.`;

        try {
            const items = await callGemini(prompt);
            if (Array.isArray(items) && items.length > 0) {
                const categoryId = category.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
                items.forEach(item => {
                    allPhrases.push({
                        id: `p${phrasesIdCounter++}`,
                        ...item,
                        categoryId
                    });
                });
                console.log(`✅ Success! Added ${items.length} phrases. Total: ${allPhrases.length}`);
                save(); // Save progress
            }
            await new Promise(r => setTimeout(r, 10000));
        } catch (e) {
            console.error(`❌ Failed ${category}: ${e.message}`);
            await new Promise(r => setTimeout(r, 15000));
        }
    }
}

async function generateGrammar() {
    console.log("📖 Starting Grammar Generation (Incremental)...");
    let allLessons = [];
    let id = 1;

    const save = () => {
        const output = `// AUTO-GENERATED GRAMMAR
export const GRAMMAR_LESSONS = ${JSON.stringify(allLessons, null, 2)};`;
        fs.writeFileSync(path.join(__dirname, '../src/data/grammar.js'), output);
    };

    for (const topic of GRAMMAR_TOPICS) {
        console.log(`📝 Topic: ${topic}`);
        const prompt = `Expert English grammar lesson for Hungarians about "${topic}".
        Include:
        - "emoji": single emoji
        - "theory": 3-4 paragraphs in Hungarian explaining rules and differences from HU. Use **bold** for emphasis.
        - "pitfall": one common mistake Hungarians make with this specific topic (in Hungarian).
        - "examples": array of 4 { "english": string, "hungarian": string }
        Return as a JSON object. No other text.`;

        try {
            const item = await callGemini(prompt);
            if (item && item.theory) {
                allLessons.push({
                    id: `g${id++}`,
                    title: topic.split("(")[0].trim(),
                    ...item
                });
                console.log(`✅ Success! Added ${topic}. Total: ${allLessons.length}`);
                save(); // Save progress
            }
            await new Promise(r => setTimeout(r, 10000));
        } catch (e) {
            console.error(`❌ Failed ${topic}: ${e.message}`);
            await new Promise(r => setTimeout(r, 15000));
        }
    }
}

async function main() {
    try {
        console.log("Checking API Keys...");
        if (!GEMINI_API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing in .env!");

        await generateVocabulary();
        await generateGrammar();
        console.log("\n✨ CONTENT REFRESH COMPLETE.");
    } catch (err) {
        console.error("CRITICAL SCRIPT ERROR:", err);
    }
}

main();
