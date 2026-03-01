// STATIC GRAMMAR LESSONS (14 Topics)

export const GRAMMAR_LESSONS = [
    {
        id: "g1",
        title: "Személyes Névmások",
        emoji: "👤",
        theory: "Az angolban a névmások alapvető fontosságúak, mert a magyarral ellentétben az igék alakja nem mindig árulja el, kiről van szó.\n\n**Alanyi névmások:** I (én), You (te/ti), He (ő-hímnem), She (ő-nőnem), It (ő/az-semlegesnem), We (mi), They (ők).\n\n**Fontos:** Az 'I' mindig nagybetű! A 'He' és 'She' embereknél kötelező, az 'It' tárgyakra és állatokra vonatkozik (kivéve, ha kedvenc).",
        examples: [
            { english: "I am hungry.", hungarian: "Éhes vagyok." },
            { english: "She is a teacher.", hungarian: "Ő egy tanár (nő)." },
            { english: "It is a big dog.", hungarian: "Ez egy nagy kutya." },
            { english: "We go home.", hungarian: "Hazamegyünk." }
        ]
    },
    {
        id: "g2",
        title: "A 'Lenni' ige (to be)",
        emoji: "✨",
        theory: "A 'to be' (lenni) a legfontosabb ige. Jelen időben három alakja van: **am, is, are**.\n\nHasználata: I **am**, You **are**, He/She/It **is**, We **are**, They **are**.\n\nTagadáshoz csak egy 'not' kell utána: I am not, He is not (vagy isn't).",
        examples: [
            { english: "I am happy.", hungarian: "Boldog vagyok." },
            { english: "They are here.", hungarian: "Itt vannak." },
            { english: "She isn't tired.", hungarian: "Ő nem fáradt." },
            { english: "Are you hungry?", hungarian: "Éhes vagy?" }
        ]
    },
    {
        id: "g3",
        title: "Egyszerű jelen idő",
        emoji: "📅",
        theory: "Olyan cselekvésekre használjuk, amik **rendszeresen** történnek, vagy általános igazságok.\n\nKépzése: Az ige alapalakja. **KIVÉVE:** He/She/It esetén egy **-s** végződést kap az ige!\n\nKérdésnél és tagadásnál a 'do' / 'does' segédigét hívjuk segítségül.",
        examples: [
            { english: "I work every day.", hungarian: "Minden nap dolgozom." },
            { english: "He loves coffee.", hungarian: "Ő imádja a kávét." },
            { english: "She doesn't smoke.", hungarian: "Ő nem dohányzik." },
            { english: "Do you like chocolate?", hungarian: "Szereted a csokoládét?" }
        ]
    },
    {
        id: "g4",
        title: "Folyamatos jelen idő",
        emoji: "⏳",
        theory: "Olyan eseményekre, amik **éppen most**, a beszéd pillanatában történnek.\n\nKépzése: **am/is/are + ige-ing**.\n\nKulcsszavak: now (most), at the moment (ebben a pillanatban).",
        examples: [
            { english: "I am reading now.", hungarian: "Éppen olvasok." },
            { english: "They are playing football.", hungarian: "Fociznak (épp most)." },
            { english: "What are you doing?", hungarian: "Mit csinálsz (épp most)?" },
            { english: "Listen! She is singing.", hungarian: "Figyelj! Énekel." }
        ]
    },
    {
        id: "g5",
        title: "Birtoklás (Have got)",
        emoji: "🤲",
        theory: "Azt fejezzük ki vele, hogy valakinek van valamije.\n\nHasználata: I/You/We/They **have got**, He/She/It **has got**.\n\nA beszédben gyakran rövidítjük: I've got, He's got.",
        examples: [
            { english: "I have got a car.", hungarian: "Van egy autóm." },
            { english: "She has got blue eyes.", hungarian: "Kék szeme van." },
            { english: "Have you got a pen?", hungarian: "Van tollad?" },
            { english: "I haven't got time.", hungarian: "Nincs időm." }
        ]
    },
    {
        id: "g6",
        title: "Múlt idő alapok",
        emoji: "⬅️",
        theory: "A lezárult múltbeli események kifejezésére szolgál.\n\nA szabályos igék **-ed** végződést kapnak (pl. work -> worked). Vannak azonban rendhagyó igék is (pl. go -> went), amiket külön meg kell tanulni.\n\nKérdésnél és tagadásnál a 'did' segédigét használjuk.",
        examples: [
            { english: "I worked yesterday.", hungarian: "Tegnap dolgoztam." },
            { english: "She went to London.", hungarian: "Londonba ment." },
            { english: "I didn't see you.", hungarian: "Nem láttalak." },
            { english: "Did you like the movie?", hungarian: "Tetszett a film?" }
        ]
    },
    {
        id: "g7",
        title: "Jövő idő (Will)",
        emoji: "➡️",
        theory: "Akkor használjuk, ha hirtelen döntünk, vagy jóslunk valamit a jövőre nézve.\n\nKépzése: **will + ige alapalakja**. Minden személynél ugyanolyan marad.\n\nTagadás: will not -> **won't**.",
        pitfall: "Ne használd a 'will'-t olyan dolgokra, amiket már elterveztél! Arra a 'going to' való.",
        examples: [
            { english: "I will call you.", hungarian: "Fel foglak hívni." },
            { english: "It will rain tomorrow.", hungarian: "Holnap esni fog." },
            { english: "She won't come home.", hungarian: "Nem fog hazajönni." },
            { english: "Will you help me?", hungarian: "Segítesz majd (fogsz segíteni)?" }
        ]
    }
];
