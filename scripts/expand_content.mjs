import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Try gemini-1.5-flash-latest as it often resolves 404/Not Found issues
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const CATEGORIES = [
    { id: "alapok", name: "Alapvető Szavak (Basic Words)" },
    { id: "csalad", name: "Család és Ember (Family & People)" },
    { id: "otthon", name: "Otthon és Tárgyak (Home & Objects)" },
    { id: "etel", name: "Étel és Ital (Food & Drink)" },
    { id: "ido", name: "Idő és Számok (Time & Numbers)" },
    { id: "munka", name: "Munka és Iskola (Work & School)" },
    { id: "szabadido", name: "Szabadidő és Hobbi (Leisure & Hobbies)" },
    { id: "utazas", name: "Utazás és Közlekedés (Travel & Transport)" },
    { id: "termeszet", name: "Természet és Állatok (Nature & Animals)" },
    { id: "melleknevek", name: "Gyakori Melléknevek (Common Adjectives)" }
];

const PHRASE_CATEGORIES = [
    { id: "udvozles", name: "Üdvözlés és Alapok (Greetings & Basics)" },
    { id: "bemutatkozas", name: "Bemutatkozás (Introductions)" },
    { id: "etkezes", name: "Étkezés és Rendelés (Dining & Ordering)" },
    { id: "vasarlas", name: "Vásárlás és Pénz (Shopping & Money)" },
    { id: "segitseg", name: "Segítségkérés (Asking for Help)" }
];

async function generateWithRetry(prompt, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean up markdown markers
            if (text.includes("```json")) {
                text = text.split("```json")[1].split("```")[0];
            } else if (text.includes("```")) {
                text = text.split("```")[1].split("```")[0];
            }

            const data = JSON.parse(text);
            if (Array.isArray(data) && data.length > 0) return data;
            throw new Error("Empty array returned");
        } catch (e) {
            console.error(`Attempt ${i + 1} failed:`, e.message);
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

async function main() {
    let allWords = [];
    let allPhrases = [];

    console.log("Starting Generation with gemini-1.5-flash-latest...");

    for (const cat of CATEGORIES) {
        console.log(`Generating words for ${cat.name}...`);
        const prompt = `Generate exactly 52 unique A1-A2 level English vocabulary items for the category "${cat.name}".
    Respond ONLY with a valid JSON array of objects. 
    Each object must have:
    - english: English word
    - hungarian: Hungarian translation
    - phonetic: standard IPA phonetic (e.g., /haʊs/)
    - hungarianPhonetic: simplified phonetic for Hungarian speakers (e.g., 'hausz')
    - hint: a short pedagogical tip in Hungarian
    - emoji: one relevant emoji
    - categoryId: "${cat.id}"`;

        try {
            const words = await generateWithRetry(prompt);
            allWords.push(...words);
            console.log(`Added ${words.length} items for ${cat.id}`);
        } catch (e) {
            console.error(`Final failure for category ${cat.id}`);
        }
    }

    for (const cat of PHRASE_CATEGORIES) {
        console.log(`Generating phrases for ${cat.name}...`);
        const prompt = `Generate exactly 22 useful A1-A2 level English phrases for the category "${cat.name}".
    Respond ONLY with a valid JSON array of objects.
    Each object must have:
    - english: English phrase
    - hungarian: Hungarian translation
    - literal: literal word-for-word Hungarian translation
    - emoji: one relevant emoji
    - categoryId: "${cat.id}"`;

        try {
            const phrases = await generateWithRetry(prompt);
            allPhrases.push(...phrases);
            console.log(`Added ${phrases.length} items for ${cat.id}`);
        } catch (e) {
            console.error(`Final failure for category ${cat.id}`);
        }
    }

    // Assign clean IDs
    const finalWords = allWords.map((w, i) => ({ ...w, id: `v_exp_${i + 1}` }));
    const finalPhrases = allPhrases.map((p, i) => ({ ...p, id: `p_exp_${i + 1}` }));

    const finalData = {
        vocabulary: finalWords,
        phrases: finalPhrases
    };

    fs.writeFileSync("generated_content.json", JSON.stringify(finalData, null, 2));
    console.log(`Success! Generated ${finalWords.length} words and ${finalPhrases.length} phrases.`);
}

main();
