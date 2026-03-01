// ═══════════════════════════════════════════════════════════════════
// QUEST TYPES & DAILY QUEST GENERATOR (30+ quest types!)
// ═══════════════════════════════════════════════════════════════════

export const QUEST_TYPES = [
    // ── Szókincs (Vocabulary) ─────────────────────────────────────
    { type: 'vocab_new', text: 'Tanulj meg {target} új szót', min: 3, max: 8, xp: 50 },
    { type: 'vocab_new', text: 'Fejleszd a szókincsed: {target} új szó', min: 10, max: 15, xp: 80 },
    { type: 'vocab_new', text: 'Szókincs Sprint: {target} szó villámgyorsan', min: 5, max: 7, xp: 60 },
    { type: 'vocab_new', text: 'Kezdő csomag: {target} egyszerű szó', min: 3, max: 5, xp: 40 },
    { type: 'vocab_new', text: 'Napi adag: tanulj {target} szót ma', min: 8, max: 12, xp: 70 },
    { type: 'vocab_review', text: 'Mondj fel {target} ismétlést', min: 5, max: 15, xp: 60 },
    { type: 'vocab_review', text: 'Nagy ismétlés: {target} kártya', min: 15, max: 25, xp: 100 },
    { type: 'vocab_review', text: 'Memória frissítő: {target} régi szó', min: 8, max: 12, xp: 70 },
    { type: 'vocab_review', text: 'Szavak újratöltve: {target} ismétlés', min: 10, max: 20, xp: 80 },
    { type: 'vocab_review', text: 'Ismétlés bajnok: {target} kártya', min: 20, max: 30, xp: 120 },

    // ── Mondatok (Sentences) ──────────────────────────────────────
    { type: 'sentence', text: 'Rakj ki {target} mondatot', min: 2, max: 4, xp: 80 },
    { type: 'sentence', text: 'Mondat Mester: {target} mondat hibátlanul', min: 5, max: 8, xp: 150 },
    { type: 'sentence', text: 'Puzzle kihívás: {target} mondat', min: 3, max: 6, xp: 100 },
    { type: 'sentence', text: 'Gyors mondatrakó: {target} mondat', min: 2, max: 3, xp: 60 },
    { type: 'sentence', text: 'Mondat maraton: {target} feladat', min: 7, max: 10, xp: 200 },

    // ── Hallás (Listening) ────────────────────────────────────────
    { type: 'listening', text: 'Érts meg {target} hallott mondatot', min: 2, max: 4, xp: 100 },
    { type: 'listening', text: 'Füleld ki: {target} mondat', min: 3, max: 5, xp: 120 },
    { type: 'listening', text: 'Hallás próba: {target} feladat', min: 1, max: 3, xp: 80 },
    { type: 'listening', text: 'Hangdetektív: {target} mondat felismerése', min: 4, max: 6, xp: 150 },

    // ── Nyelvtan (Grammar) ────────────────────────────────────────
    { type: 'grammar', text: 'Fejezz be {target} nyelvtan leckét', min: 1, max: 2, xp: 150 },
    { type: 'grammar', text: 'Nyelvtan bajnok: {target} lecke', min: 2, max: 3, xp: 250 },
    { type: 'grammar', text: 'Szabályok világa: {target} lecke', min: 1, max: 1, xp: 100 },

    // ── AI Chat ───────────────────────────────────────────────────
    { type: 'chat', text: 'Küldj {target} üzenetet az AI-nak', min: 3, max: 5, xp: 100 },
    { type: 'chat', text: 'Beszélgetés AI-val: {target} üzenet', min: 5, max: 8, xp: 150 },
    { type: 'chat', text: 'AI kávéház: {target} válasz', min: 2, max: 4, xp: 80 },
    { type: 'chat', text: 'Chatelj az AI-val: {target} körös párbeszéd', min: 4, max: 6, xp: 120 },

    // ── Vegyes kihívások (Mixed challenges) ───────────────────────
    { type: 'vocab_new', text: 'Reggeli rutin: {target} új szó ébredés után', min: 3, max: 5, xp: 50 },
    { type: 'vocab_review', text: 'Esti összefoglaló: {target} ismétlés', min: 10, max: 15, xp: 80 },
    { type: 'sentence', text: 'Ebédszünet feladat: {target} mondat', min: 2, max: 3, xp: 70 },
    { type: 'listening', text: 'Fülhallgatós kihívás: {target} mondat', min: 3, max: 5, xp: 110 },
    { type: 'grammar', text: 'Nyelvtan villámkérdés: {target} teszt', min: 1, max: 2, xp: 130 },
    { type: 'chat', text: 'Small talk: {target} üzenet idegennel', min: 3, max: 5, xp: 90 },
    { type: 'vocab_new', text: 'Kategória felfedező: {target} szó új témából', min: 5, max: 10, xp: 70 },
    { type: 'vocab_review', text: 'Tökéletes ismétlő: {target} hiba nélkül', min: 5, max: 10, xp: 90 },
];

export const generateDailyQuests = (userLevel = 1) => {
    const selected = [];
    const types = [...QUEST_TYPES];

    // Difficulty multiplier: 1 at level 1, approx 2 at level 50
    const multiplier = 1 + (Math.max(0, userLevel - 1) * 0.02);

    for (let i = 0; i < 5; i++) {
        const qType = types[Math.floor(Math.random() * types.length)];

        const scaledMin = Math.ceil(qType.min * multiplier);
        const scaledMax = Math.ceil(qType.max * multiplier);
        const target = Math.floor(Math.random() * (scaledMax - scaledMin + 1)) + scaledMin;

        // Scale XP reward with target increase (roughly proportional)
        const scaledXp = Math.round(qType.xp * (1 + (multiplier - 1) * 0.5));

        selected.push({
            id: `q_${Date.now()}_${i}`,
            type: qType.type,
            target,
            current: 0,
            done: false,
            text: qType.text.replace('{target}', target),
            xp: scaledXp
        });
    }
    return selected;
};
