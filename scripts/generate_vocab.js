import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = "AIzaSyBqcrTD0WWtHia-PlvwNg3jZAKxM3eRv7c";

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
    "Érzelmek és Érzések (Emotions & Feelings)"
];

const PHRASE_CATEGORIES = [
    "Üdvözlések és Alapok (Greetings & Basics)",
    "Ismerkedés és Bemutatkozás (Introductions)",
    "Étkezés és Rendelés (Eating & Ordering)",
    "Vásárlás és Pénz (Shopping & Money)",
    "Utazás és Szállás (Travel & Accommodation)",
    "Segítségkérés és Vészhelyzet (Help & Emergencies)"
];

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    try {
        const text = data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON", data);
        return [];
    }
}

async function main() {
    console.log("Generating 1000 Word Vocabulary Library...");
    let vocabularyIdCounter = 1;
    let phrasesIdCounter = 1;

    let allVocabulary = [];
    let allPhrases = [];

    // Generate words per category (approx 100 per category to reach 1000)
    for (const category of CATEGORIES) {
        console.log(`Generating words for: ${category}`);
        const prompt = `You are designing an English learning app for Hungarian speakers. 
        Generate exactly 100 of the absolute most common, core English words (Pareto principle 80/20) that fit the category "${category}".
        Requirements:
        1. They must be A1/A2 level.
        2. Format as a JSON array of objects: { "hungarian": "word in HU", "english": "word in EN", "emoji": "a relevant single emoji", "categoryId": "will_fill_later" }.
        3. Do NOT include markdown blocks, just the raw JSON array. Return exactly 100 items.`;

        try {
            const items = await callGemini(prompt);
            const categoryId = category.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""); // e.g. "alapveto"

            items.forEach(item => {
                allVocabulary.push({
                    id: `v${vocabularyIdCounter++}`,
                    hungarian: item.hungarian,
                    english: item.english,
                    emoji: item.emoji,
                    categoryId: categoryId
                });
            });
            console.log(`- Success! Added ${items.length} words.`);
            // Sleep 2 seconds to respect free tier rate limit
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`- Failed to generate words for ${category}:`, e.message);
        }
    }

    // Generate phrases per category
    for (const category of PHRASE_CATEGORIES) {
        console.log(`Generating phrases for: ${category}`);
        const prompt = `You are designing an English learning app for Hungarian speakers. 
        Generate exactly 25 of the most useful, everyday English "chunks" or short phrases (Lexical approach) that fit the category "${category}".
        Requirements:
        1. They must be practical (e.g., "How much is it?", "I'll have a coffee").
        2. Format as a JSON array of objects: { "hungarian": "phrase in HU", "english": "phrase in EN", "emoji": "a relevant single emoji", "categoryId": "will_fill_later" }.
        3. Do NOT include markdown blocks, just the raw JSON array. Return exactly 25 items.`;

        try {
            const items = await callGemini(prompt);
            const categoryId = category.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");

            items.forEach(item => {
                allPhrases.push({
                    id: `p${phrasesIdCounter++}`,
                    hungarian: item.hungarian,
                    english: item.english,
                    emoji: item.emoji,
                    categoryId: categoryId
                });
            });
            console.log(`- Success! Added ${items.length} phrases.`);
            // Sleep 2 seconds to respect free tier rate limit
            await new Promise(r => setTimeout(r, 2000));
        } catch (e) {
            console.error(`- Failed to generate phrases for ${category}:`, e.message);
        }
    }

    // Save to JS file
    const outputContent = `// AUTO-GENERATED PARETO-OPTIMIZED ENGLISH LIBRARY (${allVocabulary.length} words, ${allPhrases.length} phrases)

export const CATEGORIES = ${JSON.stringify(CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c })), null, 2)};
export const PHRASE_CATEGORIES = ${JSON.stringify(PHRASE_CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c })), null, 2)};

export const INITIAL_VOCABULARY = ${JSON.stringify(allVocabulary, null, 2)};

export const PHRASES = ${JSON.stringify(allPhrases, null, 2)};
`;

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'vocabulary.js');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputContent, 'utf-8');

    console.log(`\n✅ Generated data saved to ${outputPath}`);
    console.log(`Total Words: ${allVocabulary.length}`);
    console.log(`Total Phrases: ${allPhrases.length}`);
}

main();
