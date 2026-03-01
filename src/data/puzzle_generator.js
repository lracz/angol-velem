// Dynamic sentence generator for Sentence Puzzle

// Categorized exact matches to ensure grammatically correct templates
const TEMPLATES = [
    // Subject + Be + Adjective
    {
        pattern: "[Subj] is [Adj].",
        hungarian: "[Subj_Hu] [Adj_Hu].",
        requirements: { Subj: ["cat", "dog", "car", "book", "house", "room", "water"], Adj: ["good", "bad", "big", "small", "hot", "cold", "new", "old"] }
    },
    {
        pattern: "I am [Adj].",
        hungarian: "Én [Adj_Hu] vagyok.",
        requirements: { Adj: ["good", "bad", "happy", "sad", "tired", "ready"] }
    },
    {
        pattern: "You are [Adj].",
        hungarian: "Te [Adj_Hu] vagy.",
        requirements: { Adj: ["good", "bad", "happy", "sad", "ready", "beautiful"] }
    },

    // Subject + Verb + Object
    {
        pattern: "I [Verb] the [Obj].",
        hungarian: "Én [Verb_Hu] a(z) [Obj_Hu].",
        requirements: {
            Verb: ["see", "want", "have", "like", "need", "know"],
            Obj: ["car", "book", "dog", "cat", "food", "water", "money", "time"]
        }
    },
    {
        pattern: "We want to [Verb].",
        hungarian: "Mi akarunk [Verb_Hu].",
        requirements: { Verb: ["go", "sleep", "eat", "drink", "work", "play", "run", "learn"] }
    },
    {
        pattern: "They have a [Obj].",
        hungarian: "Nekik van egy [Obj_Hu].",
        requirements: { Obj: ["car", "house", "dog", "cat", "book", "problem", "question"] }
    },

    // Location
    {
        pattern: "The [Subj] is in the [Place].",
        hungarian: "A(z) [Subj_Hu] a(z) [Place_Hu] van.",
        requirements: {
            Subj: ["man", "woman", "child", "dog", "cat", "book"],
            Place: ["house", "room", "car", "school", "city", "country"]
        }
    },
    {
        pattern: "I go to the [Place].",
        hungarian: "Megyek a(z) [Place_Hu].",
        requirements: { Place: ["school", "hospital", "store", "park", "bank", "restaurant"] }
    },

    {
        pattern: "I [Verb] every [Day].",
        hungarian: "Minden [Day_Hu] [Verb_Hu].",
        requirements: { Verb: ["work", "study", "run", "learn", "play"], Day: ["day", "morning", "night", "week"] }
    },
    // Subject + Can + Verb
    {
        pattern: "I can [Verb].",
        hungarian: "Tudok [Verb_Hu].",
        requirements: { Verb: ["see", "speak", "go", "work", "play", "learn"] }
    },
    {
        pattern: "Can you [Verb]?",
        hungarian: "Tudsz [Verb_Hu]?",
        requirements: { Verb: ["see", "go", "work", "play", "learn", "help"] }
    },
    // Possessive
    {
        pattern: "It is my [Obj].",
        hungarian: "Ez az én [Obj_Hu].",
        requirements: { Obj: ["car", "book", "house", "dog", "cat", "phone", "water"] }
    },
    {
        pattern: "Where is your [Obj]?",
        hungarian: "Hol van a te [Obj_Hu]?",
        requirements: { Obj: ["car", "book", "house", "dog", "cat", "phone", "water"] }
    },
    // Adjective + Noun
    {
        pattern: "I have a [Adj] [Obj].",
        hungarian: "Van egy [Adj_Hu] [Obj_Hu].",
        requirements: { Adj: ["big", "small", "new", "old", "good", "bad"], Obj: ["car", "house", "dog", "cat", "book", "phone"] }
    }
];

// Fallback phrases if player doesn't have enough known words
const FALLBACK_PHRASES = [
    { id: "fallback_1", english: "I am happy today.", hungarian: "Ma boldog vagyok." },
    { id: "fallback_2", english: "The cat is small.", hungarian: "A macska kicsi." },
    { id: "fallback_3", english: "I see a blue car.", hungarian: "Látok egy kék autót." },
    { id: "fallback_4", english: "We go to school.", hungarian: "Iskolába megyünk." },
    { id: "fallback_5", english: "They have a big house.", hungarian: "Nagy házuk van." }
];

// Simple hash function for stable IDs
function stringToId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

export function generateDynamicSentences(knownVocabulary, count = 50) {
    if (!knownVocabulary || knownVocabulary.length < 10) {
        return FALLBACK_PHRASES; // Return fallbacks if not enough words learnt
    }

    // Create dictionary for fast lookups of known words by english form
    const knownDict = {};
    knownVocabulary.forEach(v => {
        knownDict[v.english.toLowerCase()] = v.hungarian.toLowerCase();
    });

    const generateSentence = (template) => {
        let eng = template.pattern;
        let hun = template.hungarian;
        let isValid = true;

        // Replace placeholders
        Object.keys(template.requirements).forEach(key => {
            const validOptions = template.requirements[key].filter(word => knownDict[word]);

            if (validOptions.length === 0) {
                isValid = false;
                return;
            }

            // Select random known word for this placeholder
            const selectedWord = validOptions[Math.floor(Math.random() * validOptions.length)];
            const hunWord = knownDict[selectedWord];

            // Simple Hungarian definite article logic (a/az)
            if (hun.includes(`a(z) [${key}_Hu]`)) {
                const az = /^[aáeéiíoóöőuúüű]/i.test(hunWord) ? 'az' : 'a';
                hun = hun.replace(`a(z) [${key}_Hu]`, `${az} ${hunWord}`);
            } else {
                hun = hun.replace(`[${key}_Hu]`, hunWord);
            }
            eng = eng.replace(`[${key}]`, selectedWord);
        });

        return isValid ? { english: eng, hungarian: hun, id: `gen_${stringToId(eng)}` } : null;
    };

    const results = [];
    let attempts = 0;

    // Try to generate unique sentences
    while (results.length < count && attempts < 100) {
        const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
        const sentence = generateSentence(template);

        // Ensure we don't have exact duplicates
        if (sentence && !results.some(r => r.english === sentence.english)) {
            results.push(sentence);
        }
        attempts++;
    }

    // If we couldn't generate enough, pad with fallbacks
    if (results.length < 5) {
        return [...results, ...FALLBACK_PHRASES].slice(0, Math.max(count, 5));
    }

    return results;
}
