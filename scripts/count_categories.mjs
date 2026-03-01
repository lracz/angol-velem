import fs from 'fs';

const content = fs.readFileSync('c:\\Users\\raczl\\Desktop\\angol\\src\\data\\vocabulary.js', 'utf8');

const regex = /categoryId:\s*"([^"]+)"/g;
let match;
const counts = {};

while ((match = regex.exec(content)) !== null) {
    const cat = match[1];
    counts[cat] = (counts[cat] || 0) + 1;
}

const CATEGORIES = [
    "alapok", "igek", "melleknevek", "csalad", "otthon", "etel", "ido",
    "munka", "szabadido", "utazas", "termeszet", "egeszseg", "ruhazat",
    "vasarlas_helyek", "idojaras"
];

const PHRASE_CATEGORIES = [
    "udvozles", "bemutatkozas", "etkezes", "vasarlas", "segitseg"
];

let out = '--- VOCABULARY CATEGORIES ---\n';
CATEGORIES.forEach(cat => {
    const c = counts[cat] || 0;
    out += `${cat.padEnd(15)} : ${c}\n`;
});

out += '\n--- PHRASE CATEGORIES ---\n';
PHRASE_CATEGORIES.forEach(cat => {
    const c = counts[cat] || 0;
    out += `${cat.padEnd(15)} : ${c}\n`;
});

fs.writeFileSync('c:\\Users\\raczl\\Desktop\\angol\\scripts\\category_counts.txt', out);
