import fs from 'fs';

let content = fs.readFileSync('c:\\Users\\raczl\\Desktop\\angol\\src\\data\\vocabulary.js', 'utf8');

const newWords = [
    // ruhazat
    { id: "gen_ruh1", english: "clothes", hungarian: "ruhák", phonetic: "/kloʊðz/", hungarianPhonetic: "klouz", hint: "Általános kifejezés a ruházatra.", categoryId: "ruhazat", emoji: "👕" },
    { id: "gen_ruh2", english: "shirt", hungarian: "ing", phonetic: "/ʃɜːrt/", hungarianPhonetic: "sört", hint: "Gombos, galléros öltözék.", categoryId: "ruhazat", emoji: "👔" },
    { id: "gen_ruh3", english: "t-shirt", hungarian: "póló", phonetic: "/ˈtiː.ʃɜːrt/", hungarianPhonetic: "tísört", hint: "Rövid ujjú pamut felső.", categoryId: "ruhazat", emoji: "👕" },
    { id: "gen_ruh4", english: "pants", hungarian: "nadrág", phonetic: "/pænts/", hungarianPhonetic: "penc", hint: "Amerikai angolban nadrág (UK-ben alsónadrág).", categoryId: "ruhazat", emoji: "👖" },
    { id: "gen_ruh5", english: "dress", hungarian: "ruha (női)", phonetic: "/dres/", hungarianPhonetic: "dresz", hint: "Egybeszabott női öltözék.", categoryId: "ruhazat", emoji: "👗" },
    { id: "gen_ruh6", english: "skirt", hungarian: "szoknya", phonetic: "/skɜːrt/", hungarianPhonetic: "szkört", hint: "Nők viselik a deréktól lefelé.", categoryId: "ruhazat", emoji: "👘" },
    { id: "gen_ruh7", english: "jacket", hungarian: "dzseki / zakó", phonetic: "/ˈdʒæk.ɪt/", hungarianPhonetic: "dzsekit", hint: "Rövid kabát.", categoryId: "ruhazat", emoji: "🧥" },
    { id: "gen_ruh8", english: "coat", hungarian: "kabát", phonetic: "/koʊt/", hungarianPhonetic: "kóut", hint: "Hosszú, meleg felsőruházat.", categoryId: "ruhazat", emoji: "🧥" },
    { id: "gen_ruh9", english: "shoes", hungarian: "cipő", phonetic: "/ʃuːz/", hungarianPhonetic: "súz", hint: "Lábbeli többes számban.", categoryId: "ruhazat", emoji: "👞" },
    { id: "gen_ruh10", english: "socks", hungarian: "zokni", phonetic: "/sɒks/", hungarianPhonetic: "szoksz", hint: "A cipő alatt hordjuk.", categoryId: "ruhazat", emoji: "🧦" },
    // idojaras
    { id: "gen_ido1", english: "weather", hungarian: "időjárás", phonetic: "/ˈweð.ər/", hungarianPhonetic: "vedör", hint: "Milyen idő van kint?", categoryId: "idojaras", emoji: "🌤️" },
    { id: "gen_ido2", english: "sun", hungarian: "nap (égitest)", phonetic: "/sʌn/", hungarianPhonetic: "szán", hint: "Nappal süt.", categoryId: "idojaras", emoji: "☀️" },
    { id: "gen_ido3", english: "rain", hungarian: "eső", phonetic: "/reɪn/", hungarianPhonetic: "réjn", hint: "Víz hullik az égből.", categoryId: "idojaras", emoji: "🌧️" },
    { id: "gen_ido4", english: "snow", hungarian: "hó", phonetic: "/snoʊ/", hungarianPhonetic: "sznóu", hint: "Hidegben esik.", categoryId: "idojaras", emoji: "❄️" },
    { id: "gen_ido5", english: "wind", hungarian: "szél", phonetic: "/wɪnd/", hungarianPhonetic: "vind", hint: "Mozgó levegő.", categoryId: "idojaras", emoji: "💨" },
    { id: "gen_ido6", english: "cloud", hungarian: "felhő", phonetic: "/klaʊd/", hungarianPhonetic: "klaud", hint: "Fehér vagy szürke az égen.", categoryId: "idojaras", emoji: "☁️" },
    { id: "gen_ido7", english: "storm", hungarian: "vihar", phonetic: "/stɔːrm/", hungarianPhonetic: "sztórm", hint: "Erős szél és eső/hó.", categoryId: "idojaras", emoji: "⛈️" },
    { id: "gen_ido8", english: "hot", hungarian: "forró / meleg", phonetic: "/hɒt/", hungarianPhonetic: "hot", hint: "Nyáron ilyen az idő.", categoryId: "idojaras", emoji: "🥵" },
    { id: "gen_ido9", english: "cold", hungarian: "hideg", phonetic: "/koʊld/", hungarianPhonetic: "kóuld", hint: "Télen ilyen az idő.", categoryId: "idojaras", emoji: "🥶" },
    { id: "gen_ido10", english: "warm", hungarian: "meleg", phonetic: "/wɔːrm/", hungarianPhonetic: "vórm", hint: "Kellemes tavaszi idő.", categoryId: "idojaras", emoji: "🌡️" },
    // vasarlas_helyek
    { id: "gen_hely1", english: "shop", hungarian: "bolt", phonetic: "/ʃɒp/", hungarianPhonetic: "sop", hint: "Britek így mondják.", categoryId: "vasarlas_helyek", emoji: "🏪" },
    { id: "gen_hely2", english: "store", hungarian: "áruház / üzlet", phonetic: "/stɔːr/", hungarianPhonetic: "sztór", hint: "Amerikaiak így mondják.", categoryId: "vasarlas_helyek", emoji: "🏬" },
    { id: "gen_hely3", english: "mall", hungarian: "pláza", phonetic: "/mɔːl/", hungarianPhonetic: "mól", hint: "Nagy bevásárlóközpont.", categoryId: "vasarlas_helyek", emoji: "🏢" },
    { id: "gen_hely4", english: "market", hungarian: "piac", phonetic: "/ˈmɑːr.kɪt/", hungarianPhonetic: "márkit", hint: "Szabadtéri árusítóhely.", categoryId: "vasarlas_helyek", emoji: "🧺" },
    { id: "gen_hely5", english: "supermarket", hungarian: "szupermarket", phonetic: "/ˈsuː.pɚˌmɑːr.kɪt/", hungarianPhonetic: "szúpörmárkit", hint: "Nagy élelmiszerbolt.", categoryId: "vasarlas_helyek", emoji: "🛒" },
    { id: "gen_hely6", english: "price", hungarian: "ár", phonetic: "/praɪs/", hungarianPhonetic: "prájs", hint: "Ennyibe kerül.", categoryId: "vasarlas_helyek", emoji: "🏷️" },
    { id: "gen_hely7", english: "sale", hungarian: "kiárusítás / akció", phonetic: "/seɪl/", hungarianPhonetic: "széjl", hint: "Amikor minden olcsóbb.", categoryId: "vasarlas_helyek", emoji: "📉" },
    { id: "gen_hely8", english: "cash", hungarian: "készpénz", phonetic: "/kæʃ/", hungarianPhonetic: "kes", hint: "Papírpénz és érme.", categoryId: "vasarlas_helyek", emoji: "💵" },
    { id: "gen_hely9", english: "card", hungarian: "kártya", phonetic: "/kɑːrd/", hungarianPhonetic: "kárd", hint: "Bankkártya röviden.", categoryId: "vasarlas_helyek", emoji: "💳" },
    { id: "gen_hely10", english: "receipt", hungarian: "blokk / nyugta", phonetic: "/rɪˈsiːt/", hungarianPhonetic: "riszít", hint: "A 'p' néma!", categoryId: "vasarlas_helyek", emoji: "🧾" },
    // szabadido
    { id: "gen_szab1", english: "hobby", hungarian: "hobbi", phonetic: "/ˈhɒb.i/", hungarianPhonetic: "hobi", hint: "Szabadidős tevékenység.", categoryId: "szabadido", emoji: "🎨" },
    { id: "gen_szab2", english: "game", hungarian: "játék", phonetic: "/ɡeɪm/", hungarianPhonetic: "géjm", hint: "Szabályok szerinti szórakozás.", categoryId: "szabadido", emoji: "🎮" },
    { id: "gen_szab3", english: "music", hungarian: "zene", phonetic: "/ˈmjuː.zɪk/", hungarianPhonetic: "mjúzik", hint: "Hangok ritmusos sorozata.", categoryId: "szabadido", emoji: "🎵" },
    { id: "gen_szab4", english: "movie", hungarian: "film", phonetic: "/ˈmuː.vi/", hungarianPhonetic: "múvi", hint: "Mozgókép.", categoryId: "szabadido", emoji: "🍿" },
    { id: "gen_szab5", english: "sport", hungarian: "sport", phonetic: "/spɔːrt/", hungarianPhonetic: "szpórt", hint: "Fizikai aktivitás.", categoryId: "szabadido", emoji: "⚽" },
    // munka
    { id: "gen_mun01", english: "office", hungarian: "iroda", phonetic: "/ˈɒf.ɪs/", hungarianPhonetic: "ofisz", hint: "Munkahely.", categoryId: "munka", emoji: "🏢" },
    { id: "gen_mun02", english: "boss", hungarian: "főnök", phonetic: "/bɒs/", hungarianPhonetic: "bosz", hint: "Vezető.", categoryId: "munka", emoji: "👔" },
    { id: "gen_mun03", english: "meeting", hungarian: "megbeszélés / értekezlet", phonetic: "/ˈmiː.tɪŋ/", hungarianPhonetic: "míting", hint: "Közös megbeszélés.", categoryId: "munka", emoji: "🤝" },
    { id: "gen_mun04", english: "salary", hungarian: "fizetés", phonetic: "/ˈsæl.ər.i/", hungarianPhonetic: "szeleri", hint: "Munkáért kapott pénz.", categoryId: "munka", emoji: "💰" },
    { id: "gen_mun05", english: "career", hungarian: "karrier", phonetic: "/kəˈrɪər/", hungarianPhonetic: "kírír", hint: "Életpálya.", categoryId: "munka", emoji: "📈" },
    // csalad
    { id: "gen_csal01", english: "parent", hungarian: "szülő", phonetic: "/ˈpeə.rənt/", hungarianPhonetic: "perönt", hint: "Anya vagy apa.", categoryId: "csalad", emoji: "👪" },
    { id: "gen_csal02", english: "child", hungarian: "gyermek", phonetic: "/tʃaɪld/", hungarianPhonetic: "csájld", hint: "Fiatal korú családtag.", categoryId: "csalad", emoji: "👦" },
    { id: "gen_csal03", english: "sibling", hungarian: "testvér", phonetic: "/ˈsɪb.lɪŋ/", hungarianPhonetic: "szibling", hint: "Fiú vagy lánytestvér egyaránt.", categoryId: "csalad", emoji: "👦👧" },
    { id: "gen_csal04", english: "uncle", hungarian: "nagybácsi", phonetic: "/ˈʌŋ.kəl/", hungarianPhonetic: "ánköl", hint: "Szülő testvére (férfi).", categoryId: "csalad", emoji: "👨" },
    { id: "gen_csal05", english: "aunt", hungarian: "nagynéni", phonetic: "/ænt/", hungarianPhonetic: "ent", hint: "Szülő testvére (nő).", categoryId: "csalad", emoji: "👩" },
];

const newPhrases = [
    // udvozles
    { id: "phr_udv1", english: "Good morning!", hungarian: "Jó reggelt!", categoryId: "udvozles", phonetic: "/ɡʊd ˈmɔːrnɪŋ/", hint: "Délig használjuk.", emoji: "🌅" },
    { id: "phr_udv2", english: "Good afternoon!", hungarian: "Jó napot!", categoryId: "udvozles", phonetic: "/ɡʊd ˌæftərˈnuːn/", hint: "Dél után használjuk.", emoji: "☀️" },
    { id: "phr_udv3", english: "Good evening!", hungarian: "Jó estét!", categoryId: "udvozles", phonetic: "/ɡʊd ˈiːvnɪŋ/", hint: "Este használjuk.", emoji: "🌆" },
    { id: "phr_udv4", english: "Good night!", hungarian: "Jó éjszakát!", categoryId: "udvozles", phonetic: "/ɡʊd naɪt/", hint: "Lefekvéskor köszönünk így.", emoji: "🌙" },
    // bemutatkozas
    { id: "phr_bem1", english: "My name is...", hungarian: "A nevem...", categoryId: "bemutatkozas", phonetic: "/maɪ neɪm ɪz/", hint: "A leggyakoribb bemutatkozás.", emoji: "📛" },
    { id: "phr_bem2", english: "Nice to meet you.", hungarian: "Örülök, hogy megismertem.", categoryId: "bemutatkozas", phonetic: "/naɪs tu miːt ju/", hint: "Első találkozáskor illik mondani.", emoji: "🤝" },
    { id: "phr_bem3", english: "Where are you from?", hungarian: "Hová valósi vagy?", categoryId: "bemutatkozas", phonetic: "/wer ɑːr ju frɒm/", hint: "Ismerkedésnél gyakori kérdés.", emoji: "🌍" },
    { id: "phr_bem4", english: "I am from Hungary.", hungarian: "Magyarországról jöttem.", categoryId: "bemutatkozas", phonetic: "/aɪ æm frɒm ˈhʌŋɡəri/", hint: "Válasz a származást firtató kérdésre.", emoji: "🇭🇺" },
    // etkezes
    { id: "phr_etk1", english: "A table for two, please.", hungarian: "Egy asztalt két főre, kérem.", categoryId: "etkezes", phonetic: "/ə ˈteɪbəl fər tuː pliːz/", hint: "Étteremben az első mondatok egyike.", emoji: "🍽️" },
    { id: "phr_etk2", english: "Can I have the menu?", hungarian: "Megkaphatnám az étlapot?", categoryId: "etkezes", phonetic: "/kæn aɪ hæv ðə ˈmenjuː/", hint: "Rendelés előtt.", emoji: "📖" },
    { id: "phr_etk3", english: "The bill, please.", hungarian: "A számlát kérem.", categoryId: "etkezes", phonetic: "/ðə bɪl pliːz/", hint: "Fizetéskor.", emoji: "🧾" },
    { id: "phr_etk4", english: "Keep the change.", hungarian: "Tartsa meg az aprót.", categoryId: "etkezes", phonetic: "/kiːp ðə tʃeɪndʒ/", hint: "Borravaló adásakor.", emoji: "💰" },
    // vasarlas
    { id: "phr_vas1", english: "How much is this?", hungarian: "Mennyibe kerül ez?", categoryId: "vasarlas", phonetic: "/haʊ mʌtʃ ɪz ðɪs/", hint: "Ár érdeklődése.", emoji: "💸" },
    { id: "phr_vas2", english: "I'm just looking, thanks.", hungarian: "Csak nézelődöm, köszönöm.", categoryId: "vasarlas", phonetic: "/aɪm dʒʌst ˈlʊkɪŋ θæŋks/", hint: "Ha az eladó megkérdezi, segíthet-e.", emoji: "👀" },
    { id: "phr_vas3", english: "Can I pay by card?", hungarian: "Fizethetek kártyával?", categoryId: "vasarlas", phonetic: "/kæn aɪ peɪ baɪ kɑːrd/", hint: "Fizetési mód.", emoji: "💳" },
    { id: "phr_vas4", english: "Do you have this in a different size?", hungarian: "Van ebből más méretben?", categoryId: "vasarlas", phonetic: "/du ju hæv ðɪs ɪn ə ˈdɪfərənt saɪz/", hint: "Ruhavásárlásnál.", emoji: "👗" },
    // segitseg
    { id: "phr_seg1", english: "Can you help me?", hungarian: "Tudna segíteni?", categoryId: "segitseg", phonetic: "/kæn ju help miː/", hint: "Általános segítségkérés.", emoji: "🆘" },
    { id: "phr_seg2", english: "I'm lost.", hungarian: "Eltévedtem.", categoryId: "segitseg", phonetic: "/aɪm lɒst/", hint: "Útirány keresésekor.", emoji: "🗺️" },
    { id: "phr_seg3", english: "Call an ambulance!", hungarian: "Hívjanak mentőt!", categoryId: "segitseg", phonetic: "/kɔːl ən ˈæmbjələns/", hint: "Vészhelyzetben.", emoji: "🚑" },
    { id: "phr_seg4", english: "I need a doctor.", hungarian: "Orvosra van szükségem.", categoryId: "segitseg", phonetic: "/aɪ niːd ə ˈdɒktər/", hint: "Betegség esetén.", emoji: "⚕️" },
];

const stringifiedWords = newWords.map(w => `  ${JSON.stringify(w)}`).join(',\n');
content = content.replace(
    '];\n\nexport const PHRASES = [',
    ',\n' + stringifiedWords + '\n];\n\nexport const PHRASES = ['
);

const stringifiedPhrases = newPhrases.map(w => `  ${JSON.stringify(w)}`).join(',\n');
content = content.replace(
    '];\n\nexport const GRAMMAR_LESSONS = [',
    ',\n' + stringifiedPhrases + '\n];\n\nexport const GRAMMAR_LESSONS = ['
);

fs.writeFileSync('c:\\Users\\raczl\\Desktop\\angol\\src\\data\\vocabulary.js', content);
