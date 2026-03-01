export const GRAMMAR_LESSONS = [
    {
        id: "g1",
        title: "A 'Lenni' ige (To Be)",
        emoji: "✨",
        theory: `Az angolban a 'lenni' ige (to be) alapvető, és három alakja van jelen időben: **am**, **is**, **are**. 
    - **I am** (Én vagyok) 
    - **You are** (Te vagy / Ti vagytok)
    - **He/She/It is** (Ő van / Az van)
    - **We are** (Mi vagyunk)
    - **They are** (Ők vannak)
    
    Tagadáshoz egyszerűen a **not** szót tesszük utána: *I am not*, *She is not*. Kérdésnél pedig az ige az alany elé kerül: *Are you...?*`,
        pitfall: "Magyarul gyakran elhagyjuk a létigét (pl. 'Ő tanár'), de angolban KÖTELEZŐ kitenni: 'He **is** a teacher'.",
        examples: [
            { english: "I am a student.", hungarian: "Diák vagyok." },
            { english: "She is happy.", hungarian: "Ő boldog." },
            { english: "They are at home.", hungarian: "Otthon vannak." },
            { english: "Are you ready?", hungarian: "Kész vagy?" }
        ],
        quiz: [
            { question: "Melyik a helyes forma?", options: ["He are a teacher.", "He is a teacher.", "He am a teacher."], correct: 1 },
            { question: "Hogy mondod helyesen: 'Otthon vannak'?", options: ["They is at home.", "They are at home.", "They at home."], correct: 1 },
            { question: "Melyik a helyes tagadás?", options: ["I am not happy.", "I not am happy.", "I am no happy."], correct: 0 },
            { question: "Válassz: '____ you ready?'", options: ["Is", "Am", "Are"], correct: 2 },
            { question: "Helyes a mondat: 'She is a student.'?", options: ["Igen", "Nem, 'She are' kell.", "Nem, 'She am' kell."], correct: 0 },
            { question: "Melyik a kérdő alak?", options: ["You are happy?", "Are you happy?", "Happy are you?"], correct: 1 }
        ]
    },
    {
        id: "g2",
        title: "Birtoklás (Have got)",
        emoji: "🤲",
        theory: `Ha azt akarjuk kifejezni, hogy valakinek van valamije, a **have got** szerkezetet használjuk. 
    E/3 személyben (He, She, It) az alakja **has got**-ra változik.
    - **I have got** a car. (Van egy autóm.)
    - **He has got** a dog. (Van egy kutyája.)
    
    Rövidített alakok: *I've got*, *He's got*. Tagadás: *I haven't got*, *He hasn't got*.`,
        pitfall: "Ne felejtsd el az E/3-as **has** alakot! Nem 'He have got', hanem 'He **has** got'.",
        examples: [
            { english: "I have got a blue pen.", hungarian: "Van egy kék tollam." },
            { english: "She has got two brothers.", hungarian: "Van két fiútestvére." },
            { english: "Have you got a minute?", hungarian: "Van egy perced?" },
            { english: "We haven't got much time.", hungarian: "Nincs sok időnk." }
        ],
        quiz: [
            { question: "Melyik mondat nyelvtanilag helyes?", options: ["She have got a cat.", "She has got a cat.", "She got a cat."], correct: 1 },
            { question: "Mit jelent: 'Have you got a car?'", options: ["Van egy autód?", "Vezetsz autót?", "Ez a te autód?"], correct: 0 },
            { question: "Melyik a helyes tagadás?", options: ["I have not got a dog.", "I haven't got a dog.", "Mindkettő helyes."], correct: 2 },
            { question: "Birtoklás E/3-ban:", options: ["He have got", "He has got", "He has get"], correct: 1 },
            { question: "Kérdés feltevése:", options: ["You have got a pen?", "Have you got a pen?", "Has you got a pen?"], correct: 1 },
            { question: "Rövidített alak (Péternek van):", options: ["Peter's got", "Peter have got", "Peter've got"], correct: 0 }
        ]
    },
    {
        id: "g3",
        title: "Egyszerű Jelen (Present Simple)",
        emoji: "📅",
        theory: `Általános igazságok, szokások és rendszeresen ismétlődő cselekvések kifejezésére használjuk. 
    A legfontosabb szabály: **E/3 személyben (He, She, It) az ige -s végződést kap!**
    - **I work** every day. (Minden nap dolgozom.)
    - **She works** every day. (Ő minden nap dolgozik.)
    
    Kérdésnél a **do / does** segédigét használjuk, tagadásnál pedig a **don't / doesn't** alakot.`,
        pitfall: "Magyarul nem teszünk külön végződést E/3-ban, de angolban az **-s** elengedhetetlen: 'He play**s** football'.",
        examples: [
            { english: "I live in Budapest.", hungarian: "Budapesten élek." },
            { english: "He drinks tea in the morning.", hungarian: "Reggelente teát iszik." },
            { english: "Do you like coffee?", hungarian: "Szereted a kávét?" },
            { english: "She doesn't speak French.", hungarian: "Ő nem beszél franciául." }
        ],
        quiz: [
            { question: "Hogyan mondod: 'Minden nap dolgozik (fiú)'?", options: ["He work every day.", "He works every day.", "He is working every day."], correct: 1 },
            { question: "Melyik a helyes tagadás?", options: ["I not like coffee.", "I don't like coffee.", "I doesn't like coffee."], correct: 1 },
            { question: "Kérdés E/3-ban (ő):", options: ["Do she speak English?", "Does she speak English?", "Is she speak English?"], correct: 1 },
            { question: "Melyik a helyes forma?", options: ["They lives here.", "They live here.", "They is live here."], correct: 1 },
            { question: "Helyes-e: 'He plays football'?", options: ["Igen, mert E/3-ban -s kell.", "Nem, 'He play' kell.", "Csak akkor, ha most csinálja."], correct: 0 },
            { question: "Melyik segédige kell tagadáshoz E/3-ban?", options: ["don't", "doesn't", "not"], correct: 1 }
        ]
    },
    {
        id: "g4",
        title: "Névelők (A, An, The)",
        emoji: "🅰️",
        theory: `Az angolban kétféle névelő van: határozatlan (**a/an**) és határozott (**the**).
    - **A**: Mássalhangzóval kezdődő szavak előtt (pl. *a car*, *a boy*).
    - **An**: Magánhangzóval (**a, e, i, o, u**) kezdődő szavak előtt (pl. *an apple*, *an orange*).
    - **The**: Akkor használjuk, ha egy konkrét, már említett dologról beszélünk.`,
        pitfall: "Ha a szó magánhangzónak HANGZIK (pl. 'an hour'), akkor 'an' kell, hiába 'h'-val kezdődik!",
        examples: [
            { english: "I see a cat.", hungarian: "Látok egy macskát." },
            { english: "She eats an apple.", hungarian: "Eszik egy almát." },
            { english: "The book is on the table.", hungarian: "A könyv az asztalon van. (Egy bizonyos könyv)" }
        ],
        quiz: [
            { question: "Melyik helyes?", options: ["A apple", "An apple", "The apple (általánosságban)"], correct: 1 },
            { question: "Helyes a mondat? 'I wait for an hour.'", options: ["Nem, 'a hour' kell.", "Igen, mert h-val kezdődik, de magánhangzónak ejtjük."], correct: 1 },
            { question: "Mielőtt kimondod: '____ orange'?", options: ["a", "an", "the"], correct: 1 },
            { question: "Egy konkrét autó, amiről már beszéltünk:", options: ["a car", "an car", "the car"], correct: 2 },
            { question: "Melyik a kakukktojás (mássalhangzóval kezdődik)?", options: ["university (u=j)", "umbrella", "uncle"], correct: 0 },
            { question: "Válassz: '____ honest man' (h nem hangzik)", options: ["a", "an", "the"], correct: 1 }
        ]
    },
    {
        id: "g5",
        title: "Többes szám (Plurals)",
        emoji: "👯",
        theory: `A legtöbb szó végére egyszerűen egy **-s** betűt teszünk: *cat -> cats*.
    Ha a szó *s, sh, ch, x* végű, akkor **-es** kell: *bus -> buses*.
    Vannak rendhagyó alakok is, amiket meg kell tanulni: *man -> men*, *child -> children*, *person -> people*.`,
        pitfall: "Ne felejtsd el, hogy a 'people' után TÖBBES számú ige kell: 'People **are** happy', nem 'is'.",
        examples: [
            { english: "Two dogs are playing.", hungarian: "Két kutya játszik." },
            { english: "I have three children.", hungarian: "Három gyerekem van." },
            { english: "The boxes are heavy.", hungarian: "A dobozok nehezek." }
        ],
        quiz: [
            { question: "Mi a 'child' (gyerek) többes száma?", options: ["childs", "childes", "children"], correct: 2 },
            { question: "Melyik a nyelvtanilag helyes: 'The people...'", options: ["is happy", "are happy", "be happy"], correct: 1 },
            { question: "Többes szám: 'bus' -> ?", options: ["buss", "buses", "busies"], correct: 1 },
            { question: "Rendhagyó többes szám (férfi):", options: ["mans", "man", "men"], correct: 2 },
            { question: "Többes szám: 'box' -> ?", options: ["boxs", "boxies", "boxes"], correct: 2 },
            { question: "Hogyan mondod: 'Nők'?", options: ["womans", "womens", "women"], correct: 2 }
        ]
    },
    {
        id: "g6",
        title: "Folyamatos Jelen (Present Continuous)",
        emoji: "🏃",
        theory: `Azt fejezzük ki vele, ami **éppen most** történik.
    Képzése: **am/is/are + ige-ing**.
    - **I am reading.** (Most éppen olvasok.)
    - **They are running.** (Most éppen futnak.)`,
        pitfall: "Ne hagyd le a létigét! Nem 'I reading', hanem 'I **am** reading'.",
        examples: [
            { english: "What are you doing?", hungarian: "Mit csinálsz (most)?" },
            { english: "It is raining outside.", hungarian: "Kint esik az eső." },
            { english: "I am not working today.", hungarian: "Ma nem dolgozom." }
        ],
        quiz: [
            { question: "Hogy mondod: 'Most olvasok'?", options: ["I reading now.", "I am reading now.", "I read now."], correct: 1 },
            { question: "Mikor használjuk?", options: ["Éppen most történő cselekvéseknél", "Általános igazságoknál"], correct: 0 },
            { question: "Tagadás: 'Ő éppen nem alszik'?", options: ["He not sleeping.", "He is not sleeping.", "He does not sleeping."], correct: 1 },
            { question: "Kérdés: 'Te éppen főzöl?'", options: ["Are you cooking?", "Do you cooking?", "You are cooking?"], correct: 0 },
            { question: "Mi a helyes alak (fuss)?", options: ["runing", "running", "runing"], correct: 1 },
            { question: "Válassz: 'Look! The baby ____.'", options: ["smile", "smiles", "is smiling"], correct: 2 }
        ]
    },
    {
        id: "g7",
        title: "Múlt idő (Past Simple - Bevezetés)",
        emoji: "🔙",
        theory: `Befejezett múltbeli eseményekre használjuk. 
    Szabályos igéknél **-ed** végződést teszünk az igére: *work -> worked*.
    Kérdésnél és tagadásnál a **did** segédigét használjuk, ilyenkor az ige visszaugrik alapalakba: *I didn't work.*`,
        pitfall: "Tagadásnál 'didn't' után NEM kell -ed: 'I didn't work', nem 'I didn't worked'.",
        examples: [
            { english: "I worked yesterday.", hungarian: "Tegnap dolgoztam." },
            { english: "Did you see me?", hungarian: "Láttál engem?" },
            { english: "We watched a movie.", hungarian: "Megnéztünk egy filmet." }
        ],
        quiz: [
            { question: "Hogy kérdezed: 'Dolgoztál tegnap?'", options: ["Do you worked yesterday?", "Did you work yesterday?", "Are you work yesterday?"], correct: 1 },
            { question: "Melyik a helyes forma múlt időben (regular)?", options: ["stay -> staied", "play -> plaied", "work -> worked"], correct: 2 },
            { question: "Helyes tagadás múlt időben:", options: ["I didn't went.", "I didn't go.", "I don't went."], correct: 1 },
            { question: "Szabályos ige végződése:", options: ["-ing", "-s", "-ed"], correct: 2 },
            { question: "Helyes-e: 'I watched a movie'?", options: ["Igen", "Nem, 'I watch' kell.", "Nem, 'I was watched' kell."], correct: 0 },
            { question: "Válaszolj: 'Did you see Peter?'", options: ["Yes, I did.", "Yes, I see.", "Yes, I do."], correct: 0 }
        ]
    },
    {
        id: "g8",
        title: "Segédigék: CAN (Képesség)",
        emoji: "💪",
        theory: `Képességet fejezünk ki vele (tud, képes rá). Utána az ige alapalakja áll, és nincs -s végződés E/3-ban sem!
    - **I can swim.** (Tudok úszni.)
    - **She can sing.** (Tud énekelni.)
    Tagadás: **cannot** vagy **can't**.`,
        pitfall: "A 'can' után soha ne tegyél 'to'-t! Nem 'I can to swim', hanem 'I can swim'.",
        examples: [
            { english: "Can you help me?", hungarian: "Tudsz segíteni?" },
            { english: "I can't drive a car.", hungarian: "Nem tudok autót vezetni." },
            { english: "Birds can fly.", hungarian: "A madarak tudnak repülni." }
        ],
        quiz: [
            { question: "Melyik a helyes?", options: ["She can sings.", "She can sing.", "She can to sing."], correct: 1 },
            { question: "Melyik segédige fejez ki képességet?", options: ["will", "can", "must"], correct: 1 },
            { question: "Melyik a kakukktojás (mi NEM fejez ki képességet)?", options: ["I can swim.", "I can jump.", "I can go there tomorrow (ígéret)."], correct: 2 },
            { question: "Tagadás: 'Nem tudok úszni.'", options: ["I can not swim.", "I can't swim.", "Mindkettő helyes."], correct: 2 },
            { question: "Kérdés: 'Tudsz repülni?'", options: ["Can you fly?", "Do you can fly?", "Are you can fly?"], correct: 0 },
            { question: "Válassz: 'He ____ speak English very well.'", options: ["cans", "can", "is can"], correct: 1 }
        ]
    },
    {
        id: "g9",
        title: "Jövő idő (Will)",
        emoji: "🚀",
        theory: `Ígéretek, hirtelen döntések vagy jóslatok kifejezésére.
    Képzése: **will + ige alapalakja**.
    - **I will call you.** (Fel foglak hívni.)
    Tagadás: **will not** vagy **won't**.`,
        pitfall: "A 'will' után sincs 'to'! 'I will go', nem 'I will to go'.",
        examples: [
            { english: "I will help you.", hungarian: "Segíteni fogok neked." },
            { english: "It will be hot tomorrow.", hungarian: "Holnap meleg lesz." },
            { english: "Will you marry me?", hungarian: "Hozzám jössz feleségül?" }
        ],
        quiz: [
            { question: "Hogy mondod: 'Segíteni fogok neked'?", options: ["I will helping you.", "I helps you.", "I will help you."], correct: 2 },
            { question: "Mi a 'will not' rövidítése?", options: ["willn't", "won't", "don't"], correct: 1 },
            { question: "Melyik fejez ki jövő időt?", options: ["I go.", "I went.", "I will go."], correct: 2 },
            { question: "Kérdés: 'Eljössz?'", options: ["Will you come?", "Do you will come?", "Are you will come?"], correct: 0 },
            { question: "Helyes-e: 'I will to call you'?", options: ["Igen", "Nem, a 'to' nem kell.", "Igen, de csak E/3-ban."], correct: 1 },
            { question: "Ígéret: 'Nem foglak elfelejteni.'", options: ["I won't forget you.", "I will not forget you.", "Mindkettő helyes."], correct: 2 }
        ]
    },
    {
        id: "g10",
        title: "Melléknévfokozás (Comparison)",
        emoji: "⚖️",
        theory: `Két dolgot hasonlítunk össze. Rövid szavaknál **-er** végződés és a **than** szó kell.
    - *small -> smaller than*
    Hosszú szavaknál (2+ szótag) a **more** szót használjuk.
    - *expensive -> more expensive than*`,
        pitfall: "Vannak rendhagyók: *good -> better*, *bad -> worse*.",
        examples: [
            { english: "The cat is smaller than the dog.", hungarian: "A macska kisebb, mint a kutya." },
            { english: "English is easier than Chinese.", hungarian: "Az angol könnyebb, mint a kínai." },
            { english: "This car is more expensive.", hungarian: "Ez az autó drágább." }
        ],
        quiz: [
            { question: "Mi a 'good' középfoka?", options: ["gooder", "more good", "better"], correct: 2 },
            { question: "Melyik a helyes?", options: ["more cheaper", "cheaper", "most cheap"], correct: 1 },
            { question: "Hosszú melléknév fokozása (beautiful):", options: ["beautifuller", "more beautiful", "beautifullest"], correct: 1 },
            { question: "Mi hiányzik? 'She is taller ____ me.'", options: ["than", "then", "that"], correct: 0 },
            { question: "Rendhagyó fokozás (bad):", options: ["badder", "worse", "worst"], correct: 1 },
            { question: "Melyik a helyes középfok: 'Happy'?", options: ["happyer", "happier", "more happy"], correct: 1 }
        ]
    },
    {
        id: "g11",
        title: "Birtokos Névmások (Possessive Pronouns)",
        emoji: "🆔",
        theory: `Ha nem akarjuk megismételni a főnevet: 'Ez az én könyvem' -> 'Ez az enyém'.
    - **mine** (enyém), **yours** (tied), **his/hers** (övé), **ours** (miénk), **theirs** (övék).`,
        pitfall: "Vigyázz: a 'yours' végén ott az -s, de nincs aposztróf!",
        examples: [
            { english: "This pen is mine.", hungarian: "Ez a toll az enyém." },
            { english: "Is this car yours?", hungarian: "Ez az autó a tied?" },
            { english: "The victory is ours!", hungarian: "A győzelem a miénk!" }
        ],
        quiz: [
            { question: "Enyém vagy tiéd?", options: ["Mine or yours?", "My or your?", "Me or you?"], correct: 0 },
            { question: "Ez a könyv az övé (lány).", options: ["This book is her.", "This book is hers.", "This book is she."], correct: 1 },
            { question: "Válaszolj: 'Whose is this?' (A miénk)", options: ["It's our.", "It's ours.", "It's us."], correct: 1 },
            { question: "Melyik a kakukktojás?", options: ["mine", "house", "theirs"], correct: 1 },
            { question: "Helyes-e: 'The car is your'?", options: ["Igen", "Nem, 'yours' kell.", "Nem, 'your's' kell (aposztróffal)."], correct: 1 },
            { question: "Fordítsd: 'Az övék.'", options: ["They.", "Theirs.", "Them."], correct: 1 }
        ]
    },
    {
        id: "g12",
        title: "Helyhatározók (In, On, At)",
        emoji: "📍",
        theory: `A leggyakoribb elöljárószók:
    - **In**: Belső térben (pl. *in the room*, *in Budapest*).
    - **On**: Felületen (pl. *on the table*, *on the wall*).
    - **At**: Ponton vagy eseményen (pl. *at the bus stop*, *at the party*).`,
        pitfall: "Időben is használjuk őket: 'in the morning', 'on Monday', 'at 5 o'clock'.",
        examples: [
            { english: "He is in the kitchen.", hungarian: "A konyhában van." },
            { english: "The key is on the desk.", hungarian: "A kulcs az íróasztalon van." },
            { english: "Wait for me at the entrance.", hungarian: "Várj meg a bejáratnál." }
        ],
        quiz: [
            { question: "Hétfőn", options: ["in Monday", "on Monday", "at Monday"], correct: 1 },
            { question: "Az asztalon", options: ["in the table", "on the table", "at the table"], correct: 1 },
            { question: "Reggel", options: ["in the morning", "on the morning", "at the morning"], correct: 0 },
            { question: "5 órakor", options: ["in 5 o'clock", "on 5 o'clock", "at 5 o'clock"], correct: 2 },
            { question: "Budapesten", options: ["in Budapest", "on Budapest", "at Budapest"], correct: 0 },
            { question: "A busz megállóban (pontnál)", options: ["in the bus stop", "on the bus stop", "at the bus stop"], correct: 2 }
        ]
    },
    {
        id: "g13",
        title: "Segédigék: MUST (Kötelezettség)",
        emoji: "🛑",
        theory: `Erős kötelezettség vagy szabály kifejezésére. 
    Képzése: **must + ige alapalakja**.
    - **You must go.** (Menned kell.)
    Tagadás: **mustn't** (Tilos!).`,
        pitfall: "A 'mustn't' tiltást jelent, nem azt, hogy 'nem kell' (arra a 'don't have to' van).",
        examples: [
            { english: "I must study for the exam.", hungarian: "Tanulnom kell a vizsgára." },
            { english: "You must not smoke here.", hungarian: "Itt tilos dohányozni." },
            { english: "We must be quiet.", hungarian: "Csendben kell lennünk." }
        ],
        quiz: [
            { question: "Mit jelent: 'You mustn't do that'?", options: ["Nem kell megtenned.", "Tilos megtenned.", "Nem tudod megtenni."], correct: 1 },
            { question: "Hogy írjuk, hogy mennem kell?", options: ["I must go.", "I must going.", "I must to go."], correct: 0 },
            { question: "Melyik fejez ki szabályt vagy erős kötelességet?", options: ["can", "will", "must"], correct: 2 },
            { question: "Helyes-e: 'You mustn't to smoke here'?", options: ["Igen", "Nem, a 'to' nem kell.", "Igen, de csak kérdésben."], correct: 1 },
            { question: "Tagadás (tilos):", options: ["must not", "not must", "don't must"], correct: 0 },
            { question: "Válassz: 'We ____ be quiet in the library.'", options: ["musts", "must", "are must"], correct: 1 }
        ]
    },
    {
        id: "g14",
        title: "Személyes névmások tárgyesete (Me, You, Him...)",
        emoji: "👤",
        theory: `Amikor a névmás a mondat tárgya (pl. 'Lát engem').
    - **me** (engem), **you** (téged), **him/her/it** (őt/azt), **us** (minket), **them** (őket).`,
        pitfall: "Magyarban sok toldalék van (nekem, tőlem), angolban gyakran csak 'to me', 'from me'.",
        examples: [
            { english: "Can you help me?", hungarian: "Tudsz nekem segíteni?" },
            { english: "I love her.", hungarian: "Szeretem őt." },
            { english: "Tell them the truth.", hungarian: "Mondd meg nekik az igazat." }
        ],
        quiz: [
            { question: "Segíts neki! (fiú)", options: ["Help he!", "Help his!", "Help him!"], correct: 2 },
            { question: "Szeretem őket.", options: ["I love their.", "I love them.", "I love they."], correct: 1 },
            { question: "Mondd meg nekünk az igazat.", options: ["Tell we the truth.", "Tell us the truth.", "Tell ours the truth."], correct: 1 },
            { question: "Látlak titeket/téged.", options: ["I see you.", "I see yours.", "I see your."], correct: 0 },
            { question: "Várd meg őt! (lány)", options: ["Wait for she!", "Wait for her!", "Wait for hers!"], correct: 1 },
            { question: "Melyik a kakukktojás (nem tárgyeset)?", options: ["me", "them", "their"], correct: 2 }
        ]
    },
    {
        id: "g15",
        title: "Végső Vizsga: Összes Igeidő Keverve",
        emoji: "🏆",
        theory: `Ez a lecke a korábban tanult igeidők (Egyszerű Jelen, Folyamatos Jelen, Egyszerű Múlt, Jövő) összefoglalása. 
    Nézzük át a legfontosabb különbségeket:
    - **Egyszerű Jelen (Present Simple)**: Szokások, tények (I work every day).
    - **Folyamatos Jelen (Present Continuous)**: Éppen most történő események (I am working right now).
    - **Egyszerű Múlt (Past Simple)**: Lezárt múltbeli események (I worked yesterday).
    - **Jövő (Will)**: Döntések, ígéretek jövőre nézve (I will work tomorrow).`,
        pitfall: "Gyakori hiba összekeverni a folyamatos és egyszerű jelent. Mindig nézd az időhatározókat (now vs. every day)!",
        examples: [
            { english: "She always drinks coffee.", hungarian: "Mindig kávét iszik. (Egyszerű Jelen)" },
            { english: "She is drinking coffee now.", hungarian: "Éppen kávét iszik. (Folyamatos Jelen)" },
            { english: "She drank coffee yesterday.", hungarian: "Tegnap kávét ivott. (Egyszerű Múlt)" },
            { english: "She will drink coffee later.", hungarian: "Később kávét fog inni. (Jövő)" }
        ],
        quiz: [
            { question: "Melyik jelöl folyamatos, éppen történő cselekvést?", options: ["I play tennis.", "I am playing tennis.", "I played tennis."], correct: 1 },
            { question: "Mit válassz erre: 'I ____ to the cinema yesterday'?", options: ["go", "will go", "went"], correct: 2 },
            { question: "Melyik jelentést hordozza a 'will'?", options: ["Múltbeli befejezett", "Jövőbeli szándék/ígéret", "Általános igazság"], correct: 1 },
            { question: "Melyik a helyes E/3 alak?", options: ["She work every day.", "She works every day.", "She is work every day."], correct: 1 },
            { question: "Tagadás múltban:", options: ["I don't go.", "I didn't go.", "I no go."], correct: 1 },
            { question: "Kérdés feltevése most történő cselekvésnél:", options: ["Are you sleeping?", "Do you sleeping?", "Did you sleep?"], correct: 0 },
            { question: "Jövő idejű tagadás:", options: ["I willn't", "I won't", "I don't will"], correct: 1 },
            { question: "Melyik a kakukktojás (nem igeidő)?", options: ["Simple Present", "Past Simple", "Good Job"], correct: 2 }
        ]
    }
];