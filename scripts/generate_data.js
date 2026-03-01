import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Using the other key since the primary hit a rate limit
const GEMINI_API_KEY = "AIzaSyDT-AZUgYbFTjEyhK4Yuzzuhgg5YIK8FMI";

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
    "Oktatás és Iskola (Education & School)"
];

const PHRASE_CATEGORIES = [
    "Üdvözlések és Alapok (Greetings & Basics)",
    "Ismerkedés és Bemutatkozás (Introductions)",
    "Étkezés és Rendelés (Eating & Ordering)",
    "Vásárlás és Pénz (Shopping & Money)",
    "Utazás és Szállás (Travel & Accommodation)",
    "Segítségkérés és Vészhelyzet (Help & Emergencies)",
    "Érzelmek Kifejezése (Expressing Emotions)",
    "Vélemény és Egyetértés (Opinions & Agreement)"
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
    "Kérdőszavak (Who, What, Where...)",
    "Módbeli segédigék (Can, Must, Should)",
    "Birtokos névmások (My, Your, His)",
    "Gyakoriságot kifejező határozószók (Always, Sometimes...)" // Covers A1-A2 completely
];

async function callGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Retry logic specifically for 429
    for (let attempts = 0; attempts < 3; attempts++) {
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

        if (response.status === 429) {
            console.warn(`Rate limit hit. Retrying in 15 seconds... (Attempt ${attempts + 1})`);
            await new Promise(r => setTimeout(r, 15000));
            continue;
        }

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
    throw new Error("Max retries exceeded due to rate limits.");
}

async function generateVocabulary() {
    console.log("Generating 1000+ Word Vocabulary Library...");
    let vocabularyIdCounter = 1;
    let phrasesIdCounter = 1;

    let allVocabulary = [];
    let allPhrases = [];

    // Generate words per category (approx 90 per category to reach ~1000)
    for (const category of CATEGORIES) {
        console.log(`Generating words for: ${category}`);
        const prompt = `You are designing an English learning app for Hungarian speakers. 
        Generate exactly 90 of the absolute most common, core English words (Pareto principle 80/20) that fit the category "${category}".
        Requirements:
        1. They must be A1/A2 level.
        2. Format as a JSON array of objects: { "hungarian": "word in HU", "english": "word in EN", "emoji": "a relevant single emoji" }.
        3. Do NOT include markdown blocks, just the raw JSON array. Return exactly 90 items.`;

        try {
            const items = await callGemini(prompt);
            const categoryId = category.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");

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
            // Heavy delay to bypass free tier strictness
            await new Promise(r => setTimeout(r, 4000));
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
        2. Format as a JSON array of objects: { "hungarian": "phrase in HU", "english": "phrase in EN", "emoji": "a relevant single emoji" }.
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
            // Heavy delay to bypass free tier strictness
            await new Promise(r => setTimeout(r, 4000));
        } catch (e) {
            console.error(`- Failed to generate phrases for ${category}:`, e.message);
        }
    }

    // Save Vocabulary to JS file
    const outputContent = `// AUTO-GENERATED PARETO-OPTIMIZED ENGLISH LIBRARY (${allVocabulary.length} words, ${allPhrases.length} phrases)

export const CATEGORIES = ${JSON.stringify(CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c.split("(")[0].trim() })), null, 2)};
export const PHRASE_CATEGORIES = ${JSON.stringify(PHRASE_CATEGORIES.map(c => ({ id: c.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""), name: c.split("(")[0].trim() })), null, 2)};

export const INITIAL_VOCABULARY = ${JSON.stringify(allVocabulary, null, 2)};

export const PHRASES = ${JSON.stringify(allPhrases, null, 2)};
`;

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'vocabulary.js');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputContent, 'utf-8');

    console.log(`\n✅ Generated data saved to ${outputPath}`);
}

async function generateGrammar() {
    console.log("\nGenerating Grammar Library...");
    let allLessons = [];
    let lessonIdCounter = 1;

    for (const topic of GRAMMAR_TOPICS) {
        console.log(`Generating grammar rules for: ${topic}`);
        const prompt = `You are an expert English tutor for native Hungarians.
         Write a structured grammar lesson about "${topic}".
         Requirements:
         1. It must be written in HUNGARIAN, using clear, encouraging language.
         2. Explain the theory, differences from Hungarian (if any), and provide a few examples.
         3. Keep it beginner-friendly (A1/A2).
         4. Give a relevant single Emoji that represents the topic.
         5. Generate 4 key example sentence pairs.
         6. Format exactly as this JSON object (no markdown wrapping):
         {
             "emoji": "...",
             "theory": "The markdown-formatted explanation here. Use **bold** for emphasis. Keep it to 3-4 paragraphs.",
             "examples": [
                 { "english": "English sentence", "hungarian": "Hungarian translation" },
                 { "english": "English sentence", "hungarian": "Hungarian translation" },
                 ... (4 total)
             ]
         }`;

        try {
            const item = await callGemini(prompt);
            allLessons.push({
                id: `g${lessonIdCounter++}`,
                title: topic.split("(")[0].trim(),
                emoji: item.emoji,
                theory: item.theory,
                examples: item.examples
            });
            console.log(`- Success! Added grammar lesson.`);
            await new Promise(r => setTimeout(r, 4000));
        } catch (e) {
            console.error(`- Failed to generate grammar for ${topic}:`, e.message);
        }
    }

    const outputContent = `// AUTO-GENERATED GRAMMAR LESSONS (${allLessons.length} lessons)

export const GRAMMAR_LESSONS = ${JSON.stringify(allLessons, null, 2)};
`;

    const outputPath = path.join(__dirname, '..', 'src', 'data', 'grammar.js');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputContent, 'utf-8');

    console.log(`\n✅ Generated grammar saved to ${outputPath}`);
}

async function main() {
    await generateVocabulary();
    await generateGrammar();
    console.log("\n🎉 ALL GENERATION COMPLETED.");
}

main();
