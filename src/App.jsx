import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Heart, Volume2, Snail, Mic, MicOff, Send, BookOpen, MessageCircle,
  GraduationCap, ChevronLeft, ChevronRight, Check, X, RotateCcw,
  Sparkles, Coffee, Map, ShoppingCart, Phone, Star, Flame, Target, LogOut,
  AlertTriangle, Lightbulb, Headphones, Trophy, Medal, TrendingUp, Languages, Gamepad2
} from 'lucide-react';

// ── Firebase Imports ───────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
  GoogleAuthProvider, signInWithPopup
} from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config exists (to prevent crashes before setup)
const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════
import { INITIAL_VOCABULARY, PHRASES, CATEGORIES, PHRASE_CATEGORIES } from './data/vocabulary';
import { GRAMMAR_LESSONS } from './data/grammar';

const AI_SCENARIOS = [
  { id: 'coffee', label: '☕ Kávé rendelése', icon: Coffee, systemExtra: 'Simulate ordering coffee at a café. Start by greeting the student as a barista.' },
  { id: 'directions', label: '🗺️ Útbaigazítás', icon: Map, systemExtra: 'Simulate asking for and giving directions. Start by asking "Hi! Can I help you?"' },
  { id: 'shopping', label: '🛒 Bevásárlás', icon: ShoppingCart, systemExtra: 'Simulate buying groceries at a store. Start by saying "Welcome! What would you like?"' },
  { id: 'phone', label: '📞 Telefonhívás', icon: Phone, systemExtra: 'Simulate a phone call to book a table at a restaurant. Start with "Hello, Restaurant Bella, how can I help?"' },
  { id: 'introduce', label: '👋 Bemutatkozás', icon: Star, systemExtra: 'Simulate meeting someone new. Start with "Hi! My name is Anna. What is your name?"' },
];

const BASE_SYSTEM_PROMPT = `You are a highly encouraging English tutor. The user is an absolute beginner and a native Hungarian speaker. Use VERY simple A1 English. Pay special attention to typical Hungarian mistakes: confusing 'he' and 'she' (Hungarian has no genders), and word order (Hungarian is flexible, English is strict SVO). If she makes these mistakes, gently correct her in Hungarian, then ask her to repeat in English. Always praise her efforts.

You MUST respond in the following JSON format:
{
  "reply": "Your encouraging response text here",
  "flashcard": null
}

If the user made a vocabulary or grammar mistake that you corrected, set flashcard to an object:
{
  "reply": "Your response",
  "flashcard": { "hungarian": "correct hungarian word", "english": "correct english word", "emoji": "relevant emoji" }
}

Always set flashcard to null if there was no mistake to correct.`;

// ═══════════════════════════════════════════════════════════════════
// HOOKS & HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Web Audio API sound effects */
function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playDing = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain).connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* no audio support */ }
  }, [getCtx]);

  const playSwoosh = useCallback(() => {
    try {
      const ctx = getCtx();
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.15;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      source.connect(filter).connect(ctx.destination);
      source.start();
    } catch { /* no audio support */ }
  }, [getCtx]);

  return { playDing, playSwoosh };
}

const speak = (text, rate = 1) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1.1;
  window.speechSynthesis.speak(u);
};

const ENCOURAGEMENTS = [
  'Szuper! 🌟', 'Ügyes vagy! 💪', 'Fantasztikus! ✨', 'Nagyszerű! 🎉',
  'Remek munka! 👏', 'Így kell ezt! 🔥', 'Büszke vagyok rád! 💕',
];
const randomEncouragement = () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

const CONFETTI_COLORS = ['#f9a8d4', '#c084fc', '#93c5fd', '#86efac', '#fde047', '#fca5a5'];

function parseAiResponse(raw) {
  try {
    const parsed = JSON.parse(raw);
    return {
      reply: parsed.reply || raw,
      flashcard: parsed.flashcard && parsed.flashcard.hungarian && parsed.flashcard.english
        ? parsed.flashcard
        : null,
    };
  } catch {
    return { reply: raw, flashcard: null };
  }
}

// ═══════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${Math.random() * 30}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${Math.random() * 0.4}s`,
            animationDuration: `${0.8 + Math.random() * 0.6}s`,
            width: `${6 + Math.random() * 6}px`,
            height: `${6 + Math.random() * 6}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
}

function SttButton({ targetWord, onResult }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e) => {
      const results = Array.from(e.results[0]).map(r => r.transcript.toLowerCase().trim());
      const target = targetWord.toLowerCase().trim();
      const match = results.some(r => r.includes(target) || target.includes(r));
      onResult(match);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [targetWord, onResult]);

  if (!supported) {
    return (
      <button disabled className="p-3 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed" title="Chrome böngészőben működik a legjobban!">
        <MicOff size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        if (listening) { recRef.current?.stop(); setListening(false); }
        else { recRef.current?.start(); setListening(true); }
      }}
      className={`p-3 rounded-full transition-all duration-200 ${listening
        ? 'bg-red-100 text-red-600 animate-pulse-glow'
        : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:scale-105 active:scale-95'
        }`}
      title={listening ? 'Hallgatom...' : 'Mondd ki!'}
    >
      {listening ? <Mic size={20} /> : <Mic size={20} />}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════════

function VocabularyTab({ vocabMap, generatedCards, onMarkKnown, onResetAll, onProgress, sound, initialVocabulary = INITIAL_VOCABULARY }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sttFeedback, setSttFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Combine base vocabulary + generated cards
  const allCards = useMemo(() => {
    const combined = [...initialVocabulary, ...generatedCards];
    return combined.map(c => ({
      ...c,
      status: vocabMap[c.id] || 'learning'
    }));
  }, [initialVocabulary, generatedCards, vocabMap]);

  // Derived state for selection
  const filteredCards = useMemo(() => {
    if (!selectedCategory) return [];
    return selectedCategory === 'szemelyes'
      ? allCards.filter(c => c._generated)
      : allCards.filter(c => c.categoryId === selectedCategory);
  }, [allCards, selectedCategory]);

  const learningCards = useMemo(() => filteredCards.filter(c => c.status === 'learning'), [filteredCards]);

  // Reset index when category changes
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    setSttFeedback(null);
  }, [selectedCategory]);

  const handleSttResult = useCallback((match) => {
    setSttFeedback(match ? 'correct' : 'retry');
    if (match) setTimeout(() => setSttFeedback(null), 2000);
  }, []);

  if (!selectedCategory) {
    // Show Category List
    const categoriesWithGenerated = [...CATEGORIES];
    if (generatedCards.length > 0) {
      categoriesWithGenerated.push({ id: 'szemelyes', name: 'Saját szavaim (Mentett)' });
    }

    return (
      <div className="flex flex-col gap-3 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">Témakörök</h2>
        {categoriesWithGenerated.map(cat => {
          const catCards = cat.id === 'szemelyes'
            ? allCards.filter(c => c._generated)
            : allCards.filter(c => c.categoryId === cat.id);
          const knownCat = catCards.filter(c => c.status === 'known').length;
          const totalCat = catCards.length;
          const progressPct = totalCat > 0 ? (knownCat / totalCat) * 100 : 0;

          if (totalCat === 0 && cat.id !== 'szemelyes') return null; // Hide empty categories

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex flex-col gap-2 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all text-left"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">{cat.name}</span>
                <span className="text-sm font-semibold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">
                  {knownCat}/{totalCat}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400" style={{ width: `${progressPct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // State for flashcards (already defined above)

  // Safe index logic
  let displayIndex = 0;
  if (learningCards.length > 0) {
    displayIndex = index % learningCards.length;
  }
  const card = learningCards[displayIndex];

  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio();
  }, []);

  const playSound = (type) => {
    if (!audioRef.current) return;
    const sounds = {
      correct: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
      wrong: 'https://assets.mixkit.co/active_storage/sfx/2010/2010-preview.mp3',
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      flip: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };
    audioRef.current.src = sounds[type];
    audioRef.current.volume = 0.5; // Reduced volume to 50%
    audioRef.current.play().catch(() => { });
  };

  const handleKnow = () => {
    if (!card) return;
    playSound('correct');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);

    // SRS Logic: learning -> review -> known (mastered)
    const currentStatus = vocabMap[card.id] || 'learning';
    let nextStatus = 'known';

    if (currentStatus === 'learning') nextStatus = 'review';
    else if (currentStatus === 'review') nextStatus = 'known';

    onMarkKnown(card.id, nextStatus);
    onProgress();
    setFlipped(false);
    setSttFeedback(null);
    setIndex(i => i);
  };

  const handlePractice = () => {
    playSound('flip');
    setFlipped(false);
    setSttFeedback(null);
    setIndex(i => i + 1);
  };

  const handleFlip = () => {
    playSound('flip');
    setFlipped(f => !f);
  };

  // STT handler moved up

  const handleBack = () => setSelectedCategory(null);

  if (!card) {
    // Reached end of category
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-purple-700 mb-2">Szuper!</h2>
        <p className="text-gray-600 mb-6">Ebben a kategóriában mindent megtanultál!</p>
        <div className="flex gap-3">
          <button onClick={handleBack} className="px-5 py-3 bg-gray-100 text-gray-600 rounded-full font-bold shadow-md hover:bg-gray-200 transition-all">
            Vissza
          </button>
          <button onClick={() => { onResetAll(); setIndex(0); }} className="px-5 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <RotateCcw size={18} className="inline mr-1" /> Újrakezdés
          </button>
        </div>
      </div>
    );
  }

  const knownCount = filteredCards.filter(c => c.status === 'known').length;
  const totalCount = filteredCards.length;

  const categoryName = selectedCategory === 'szemelyes' ? 'Saját szavaim' : CATEGORIES.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="flex flex-col items-center gap-4 relative animate-slide-up">
      <div className="w-full flex items-center justify-between mb-2">
        <button onClick={handleBack} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h3 className="font-bold text-gray-800 text-sm max-w-[200px] truncate">{categoryName}</h3>
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-0.5">
            <GraduationCap size={12} />
            <span>{knownCount}/{totalCount} szó</span>
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer to center title */}
      </div>

      <Confetti active={showConfetti} />

      <div className="perspective w-full max-w-xs cursor-pointer" onClick={handleFlip}>
        <div className={`flip-inner relative w-full h-64 ${flipped ? 'flipped' : ''}`}>
          <div className="flip-front absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg border border-pink-100 p-6">
            <span className="text-5xl mb-3">{card.emoji}</span>
            <span className="text-2xl font-bold text-gray-800 text-center">{card.hungarian}</span>
            {card.hint && (
              <div className="mt-2 px-3 py-1 bg-white/60 rounded-lg border border-pink-100 flex items-center gap-1.5 animate-fade-in">
                <Lightbulb size={12} className="text-amber-500" />
                <span className="text-[11px] text-gray-500 italic leading-tight">{card.hint}</span>
              </div>
            )}
            <span className="text-xs text-gray-400 mt-4">Koppints a fordításhoz →</span>
            {card._generated && (
              <span className="absolute top-3 left-3 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Új</span>
            )}
          </div>
          <div className="flip-back absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-6">
            <span className="text-5xl mb-3">{card.emoji}</span>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-purple-800 text-center">{card.english}</span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {card.phonetic && (
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-blue-100">
                    IPA: /{card.phonetic}/
                  </span>
                )}
                {card.hungarianPhonetic && (
                  <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-purple-100">
                    Kiejtés: [{card.hungarianPhonetic}]
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-purple-400 mt-4">← Koppints vissza</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.english, 1); }}
          className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Volume2 size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); speak(card.english, 0.5); }}
          className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Snail size={20} />
        </button>
        <SttButton targetWord={card.english} onResult={handleSttResult} />
      </div>

      {sttFeedback === 'correct' && (
        <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold">
          <Check size={18} /> {randomEncouragement()}
        </div>
      )}
      {sttFeedback === 'retry' && (
        <div className="animate-bounce-in flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full font-semibold">
          <RotateCcw size={16} /> Próbáld újra! 💪
        </div>
      )}

      <div className="flex gap-3 w-full max-w-xs mt-2">
        <button
          onClick={handlePractice}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-100 text-amber-700 rounded-2xl font-bold hover:bg-amber-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <RotateCcw size={16} /> Még gyakorlom
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-2xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Check size={16} /> Tudom!
        </button>
      </div>

      {learningCards.length > 0 && (
        <div className="flex items-center gap-6 text-gray-400 mt-2">
          <button onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); setSttFeedback(null); }} className="p-2 hover:text-purple-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold">{displayIndex + 1} / {learningCards.length}</span>
          <button onClick={() => { setIndex(i => i + 1); setFlipped(false); setSttFeedback(null); }} className="p-2 hover:text-purple-500 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function PhrasesTab({ phrases = PHRASES }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!selectedCategory) {
    return (
      <div className="flex flex-col gap-3 animate-slide-up">
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">Gyakori Helyzetek</h2>
        {PHRASE_CATEGORIES.map(cat => {
          const catPhrases = phrases.filter(p => p.categoryId === cat.id);
          if (catPhrases.length === 0) return null;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex items-center justify-between gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all text-left"
            >
              <span className="font-bold text-gray-700">{cat.name}</span>
              <span className="text-sm font-semibold text-purple-500 bg-purple-50 px-3 py-1 rounded-full">
                {catPhrases.length}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const currentPhrases = PHRASES.filter(p => p.categoryId === selectedCategory);
  const categoryName = PHRASE_CATEGORIES.find(c => c.id === selectedCategory)?.name;

  return (
    <div className="flex flex-col gap-3 animate-slide-up">
      <div className="flex items-center mb-1">
        <button onClick={() => setSelectedCategory(null)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h3 className="font-bold text-gray-800 text-center flex-1 pr-10">{categoryName}</h3>
      </div>
      <p className="text-sm text-gray-500 text-center mb-2">Kattints a hangszóróra a kiejtéshez! 🔊</p>
      {currentPhrases.map(phrase => (
        <div
          key={phrase.id}
          className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-100 transition-all"
        >
          <span className="text-3xl flex-shrink-0">{phrase.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-gray-800 text-sm">{phrase.hungarian}</p>
              {phrase.literal && (
                <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded italic">Szó szerint: {phrase.literal}</span>
              )}
            </div>
            <p className="text-purple-600 font-semibold text-sm">{phrase.english}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => speak(phrase.english, 1)}
              className="p-2.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={() => speak(phrase.english, 0.5)}
              className="p-2.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all"
            >
              <Snail size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GrammarTab({ userData, onToggleLesson }) {
  const [selectedLesson, setSelectedLesson] = useState(null);

  if (selectedLesson) {
    const isCompleted = userData?.completedLessons?.includes(selectedLesson.id);
    return (
      <div className="space-y-6 animate-fade-in pb-20">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all"
        >
          <ChevronLeft size={20} /> Vissza a leckékhez
        </button>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-purple-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-4xl opacity-20 pointer-events-none">{selectedLesson.emoji}</div>
          <h2 className="text-3xl font-black text-gray-800 mb-6">{selectedLesson.title}</h2>

          <div className="prose prose-purple max-w-none mb-8">
            <div className="relative z-10 text-gray-700 text-sm leading-relaxed space-y-4 bg-purple-50/50 p-6 rounded-3xl border border-purple-100">
              {selectedLesson.theory.split('\n\n').map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-purple-700">$1</strong>')
                }} />
              ))}
            </div>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 mb-8">
            <h3 className="text-amber-800 font-black flex items-center gap-2 mb-2 text-sm">
              <AlertTriangle size={18} /> Vigyázz! (Common Pitfall)
            </h3>
            <p className="text-amber-700 font-medium text-sm leading-snug">{selectedLesson.pitfall}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={24} /> Példák
            </h3>
            <div className="grid gap-3">
              {selectedLesson.examples.map((ex, idx) => (
                <div key={idx} className="bg-white border-2 border-purple-50 p-4 rounded-2xl shadow-sm hover:border-purple-200 transition-colors">
                  <p className="text-lg font-black text-purple-800">{ex.english}</p>
                  <p className="text-sm font-bold text-gray-400 mt-1">{ex.hungarian}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              onToggleLesson(selectedLesson.id);
              setSelectedLesson(null);
            }}
            className={`w-full mt-10 py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 ${isCompleted
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200'
              }`}
          >
            {isCompleted ? <RotateCcw size={20} /> : <Check size={20} />}
            {isCompleted ? 'Újratanulom ezt a leckét' : 'Megértettem és kész!'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="px-2">
        <h2 className="text-3xl font-black text-gray-800">Angol Nyelvtan</h2>
        <p className="text-gray-500 font-medium">Minden, amit az alapokhoz tudni kell 📚</p>
      </div>

      <div className="grid gap-4">
        {GRAMMAR_LESSONS.map((lesson) => {
          const isCompleted = userData?.completedLessons?.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="w-full bg-white p-6 rounded-[2rem] shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all flex items-center gap-5 text-left group relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-0 right-0 bg-green-400 text-white px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest">
                  Kész
                </div>
              )}
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner text-purple-600">
                {lesson.emoji}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{lesson.title}</h3>
                <p className="text-sm text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Kattints a részletekért</p>
              </div>
              <ChevronRight className="text-purple-200 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SentencePuzzle({ phrases, sound }) {
  const [index, setIndex] = useState(0);
  const [scrambledWords, setScrambledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const phrase = useMemo(() => phrases[index % phrases.length], [phrases, index]);

  const initPuzzle = useCallback(() => {
    if (!phrase) return;
    const words = phrase.english.split(' ');
    // Simple shuffle
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setScrambledWords(shuffled.map((w, i) => ({ id: i, text: w })));
    setSelectedWords([]);
    setIsCorrect(false);
  }, [phrase]);

  useEffect(() => {
    initPuzzle();
    setShowHint(false);
  }, [initPuzzle]);

  const handleWordClick = (wordObj) => {
    if (isCorrect) return;
    const newSelected = [...selectedWords, wordObj];
    setSelectedWords(newSelected);
    setScrambledWords(scrambledWords.filter(w => w.id !== wordObj.id));

    // Check if sentence is complete
    if (newSelected.length === phrase.english.split(' ').length) {
      const result = newSelected.map(w => w.text).join(' ');
      if (result.toLowerCase() === phrase.english.toLowerCase()) {
        setIsCorrect(true);
        sound.playDing();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        // Mistake - reset
        setTimeout(() => {
          initPuzzle();
        }, 800);
      }
    }
  };

  const resetWord = (wordObj) => {
    if (isCorrect) return;
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setScrambledWords([...scrambledWords, wordObj]);
  };

  if (!phrase) return null;

  return (
    <div className="flex flex-col items-center gap-6 animate-slide-up py-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Mondatrakó</h2>
        <p className="text-sm text-gray-500">Rakd össze a mondatot helyes sorrendben!</p>
      </div>

      <Confetti active={showConfetti} />

      <div className="w-full bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-inner border border-purple-100 min-h-[140px] flex flex-wrap gap-2 items-center justify-center relative">
        <div className="absolute top-2 left-4 text-[10px] font-bold text-purple-300 uppercase tracking-widest">A mondat helye</div>

        {/* Hint Section */}
        <div className="w-full text-center">
          <p className="text-gray-400 font-medium mb-1 italic text-xs">"{phrase.hungarian}"</p>
          {showHint && (
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 mb-3 animate-fade-in">
              <p className="text-[11px] text-amber-600 font-bold uppercase tracking-wider mb-0.5">Súgó: Mi a következő szó?</p>
              <p className="text-sm font-black text-amber-800">
                {phrase.english.split(' ')[selectedWords.length] || 'Kész!'}
              </p>
            </div>
          )}
        </div>

        {selectedWords.map((w, idx) => (
          <button
            key={idx}
            onClick={() => resetWord(w)}
            className={`px-3 py-1.5 rounded-xl font-bold shadow-sm transition-all transform active:scale-95 text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            {w.text}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {scrambledWords.map((w) => (
          <button
            key={w.id}
            onClick={() => handleWordClick(w)}
            disabled={isCorrect}
            className="px-4 py-2 bg-white text-gray-700 rounded-xl font-bold shadow-md border border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all transform active:scale-95"
          >
            {w.text}
          </button>
        ))}
      </div>

      {isCorrect && (
        <div className="flex flex-col items-center gap-4 animate-bounce-in mt-6">
          <div className="px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold text-lg">
            Szuper! ✨
          </div>
          <button
            onClick={() => setIndex(i => i + 1)}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Következő <ChevronRight size={20} />
          </button>
        </div>
      )}

      {!isCorrect && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${showHint ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-amber-50 hover:text-amber-600'
              }`}
          >
            <Lightbulb size={14} /> {showHint ? 'Súgó elrejtése' : 'Kérek egy súgót'}
          </button>

          {selectedWords.length > 0 && (
            <button
              onClick={initPuzzle}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={14} /> Újrakezdés
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AiChatTab({ onNewFlashcard }) {
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keys from .env
  const primaryKey = import.meta.env.VITE_GEMINI_API_KEY;
  const secondaryKey = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;

  async function callGemini(systemPrompt, msgs) {
    if (!primaryKey) throw new Error('No API key');
    const contents = msgs.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
    if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: 'Hello!' }] });

    const createBody = () => JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: { type: 'STRING', description: 'Your encouraging response text' },
            flashcard: {
              type: 'OBJECT',
              nullable: true,
              description: 'A new flashcard if a mistake was corrected, otherwise null',
              properties: {
                hungarian: { type: 'STRING' },
                english: { type: 'STRING' },
                emoji: { type: 'STRING' },
              },
            },
          },
          required: ['reply'],
        },
      },
    });

    const executeFetch = async (key) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: createBody(),
          }
        );
        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`API error ${response.status}: ${errData}`);
        }
        return await response.json();
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      // First attempt with primary key
      const data = await executeFetch(primaryKey);
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "I\'m here to help! 😊"}';
    } catch (err) {
      console.warn("Primary Gemini key failed, trying secondary if available...", err);
      // Fallback if secondary exists AND error is 429 (rate limit) or 403 (invalid/leaked key)
      const shouldRetry = err.message.includes('429') || err.message.includes('403');

      if (secondaryKey && shouldRetry) {
        try {
          const fallbackData = await executeFetch(secondaryKey);
          return fallbackData.candidates?.[0]?.content?.parts?.[0]?.text || '{"reply": "I\'m here to help! 😊"}';
        } catch (fallbackErr) {
          console.error("Secondary key also failed:", fallbackErr);
          throw fallbackErr;
        }
      }
      throw err;
    }
  }

  const startScenario = async (sc) => {
    setScenario(sc);
    setMessages([]);
    setError(null);
    setLoading(true);
    try {
      const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nScenario: ${sc.systemExtra}`;
      const resp = await callGemini(systemPrompt, []);
      const { reply } = parseAiResponse(resp);
      setMessages([{ role: 'ai', text: reply }]);
    } catch (err) {
      if (err.message.includes('429')) {
        setError('Az AI tanár éppen túl elfoglalt (429). Kérlek várj egy percet! ☕');
      } else {
        setError('Hoppá! Az AI éppen nem elérhető. Próbáld újra! 🔄');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setError(null);

    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nScenario: ${scenario.systemExtra}`;
      const resp = await callGemini(systemPrompt, newMessages);
      const { reply, flashcard } = parseAiResponse(resp);
      if (flashcard) onNewFlashcard(flashcard);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      if (err.message.includes('429')) {
        setError('Sok kérést küldtél, az AI pihen egy kicsit. Várj pár percet! 💤');
      } else {
        setError('Az AI nem válaszol. Ellenőrizd az interneted! 🌐');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!scenario) {
    return (
      <div className="flex flex-col gap-3 animate-slide-up">
        <div className="text-center mb-2">
          <Sparkles className="inline text-purple-400 mb-1" size={24} />
          <h3 className="font-bold text-gray-800">Válassz egy helyzetet!</h3>
        </div>
        {AI_SCENARIOS.map(sc => (
          <button
            key={sc.id}
            onClick={() => startScenario(sc)}
            className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-purple-50 hover:shadow-md hover:border-purple-200 transition-all text-left"
          >
            <sc.icon size={24} className="text-purple-500 flex-shrink-0" />
            <span className="font-bold text-gray-700">{sc.label}</span>
          </button>
        ))}
        {!primaryKey && (
          <div className="mt-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-sm text-amber-700 text-center">
            ⚠️ Az AI-hoz add hozzá a Gemini API kulcsot a <code className="bg-amber-100 px-1 rounded">.env</code> fájlban!
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[60vh] animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => { setScenario(null); setMessages([]); }} className="p-2 rounded-full hover:bg-purple-100 transition-colors">
          <ChevronLeft size={18} className="text-purple-600" />
        </button>
        <span className="font-bold text-gray-700 text-sm">{scenario.label}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`animate-slide-up flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-br-md' : 'bg-white border border-purple-100 text-gray-800 rounded-bl-md shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-purple-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
        {error && <div className="text-center"><p className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-sm">{error}</p></div>}
        <div ref={scrollRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Írj angolul... ✍️"
          className="flex-1 px-4 py-3 rounded-2xl bg-white border border-purple-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="p-3 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════════
// PROGRESSION TAB
// ═══════════════════════════════════════════════════════════════════
function ProgressionTab({ userData, vocabulary, grammarLessons }) {
  const vocabProgress = useMemo(() => {
    if (!vocabulary.length) return 0;
    const knownCount = vocabulary.filter(v => userData?.vocabMap?.[v.id] === 'known').length;
    return Math.round((knownCount / vocabulary.length) * 100);
  }, [vocabulary, userData]);

  const grammarProgress = useMemo(() => {
    if (!grammarLessons.length) return 0;
    const completedCount = userData?.completedLessons?.length || 0;
    return Math.round((completedCount / grammarLessons.length) * 100);
  }, [grammarLessons, userData]);

  const categoryStats = useMemo(() => {
    const stats = {};
    vocabulary.forEach(v => {
      if (!stats[v.categoryId]) stats[v.categoryId] = { total: 0, known: 0 };
      stats[v.categoryId].total++;
      if (userData?.vocabMap?.[v.id] === 'known') stats[v.categoryId].known++;
    });
    return stats;
  }, [vocabulary, userData]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-300" size={32} /> Szintlépésed
          </h2>
          <p className="text-purple-100 font-medium">Lássuk, mennyit fejlődtél ma! 🚀</p>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Szókincs</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">{vocabProgress}%</span>
                <span className="text-sm font-bold text-purple-200 mb-1">kész</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
                  style={{ width: `${vocabProgress}%` }}
                />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest text-purple-200 mb-2">Nyelvtan</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black">{grammarProgress}%</span>
                <span className="text-sm font-bold text-purple-200 mb-1">pipa</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-1000 ease-out"
                  style={{ width: `${grammarProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 px-2">
          <Target className="text-pink-500" size={24} /> Kategóriák állapota
        </h3>
        <div className="grid gap-4">
          {CATEGORIES.map(cat => {
            const stat = categoryStats[cat.id] || { total: 0, known: 0 };
            const percent = stat.total > 0 ? Math.round((stat.known / stat.total) * 100) : 0;
            return (
              <div key={cat.id} className="bg-white rounded-3xl p-5 shadow-sm border border-purple-50 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  {stat.known === stat.total && stat.total > 0 ? '✅' : '📖'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-gray-800">{cat.name}</span>
                    <span className="text-xs font-black text-purple-400">{stat.known}/{stat.total} szó</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${percent === 100 ? 'bg-green-400' : 'bg-purple-400'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
        <h3 className="text-lg font-black text-amber-800 flex items-center gap-2 mb-2">
          <Medal className="text-amber-500" size={24} /> Következő mérföldkő
        </h3>
        <p className="text-sm text-amber-700 font-medium">
          {vocabProgress < 100
            ? `Tanulj meg még ${vocabulary.length - vocabulary.filter(v => userData?.vocabMap?.[v.id] === 'known').length} szót az alapvető szókincshez!`
            : "Gratulálunk! Te már egy igazi profi vagy! Folytasd az AI beszélgetésekkel! 🎓"}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ═══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync external errors (like handled in App component)
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    onLogin(email, password);
  };

  const handleGoogle = async () => {
    if (!auth) {
      setLocalError("A Firebase nincs beállítva. Ellenőrizd a .env fájlt!");
      return;
    }
    setLocalError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setLocalError("A böngésződ blokkolta a felugró ablakot. Engedélyezd a pop-upokat!");
      } else if (err.code === 'auth/operation-not-supported') {
        setLocalError("A Google bejelentkezés nincs engedélyezve a Firebase konzolban!");
      } else {
        setLocalError("Hiba történt a Google belépés során. Próbáld újra!");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-[2rem] shadow-2xl p-10 animate-fade-in border border-white/20">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse shadow-inner">
            <Heart className="text-pink-500 fill-pink-500" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Angol Velem</h1>
          <p className="text-gray-500 font-medium">Tanulj angolul szeretettel! 💕</p>
        </div>

        {localError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100 flex items-center gap-2 animate-bounce-in">
            <div className="w-1 h-4 bg-red-400 rounded-full" />
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-300 focus:bg-white outline-none transition-all text-gray-700 font-medium shadow-sm"
              placeholder="pelda@email.hu"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-300 focus:bg-white outline-none transition-all text-gray-700 font-medium shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-pink-300/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Belépés...' : 'Belépés'}
          </button>
        </form>

        <div className="mt-8 relative h-px bg-gray-100 flex items-center justify-center">
          <span className="bg-white px-4 text-xs font-bold text-gray-400 tracking-widest uppercase">Vagy</span>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mt-8 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:border-purple-300 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Belépés Google-lal
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP ROUTER (Handles Auth & Firebase Sync)
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Firestore state
  const [userData, setUserData] = useState({
    vocabMap: {}, // { "v1": "known", "gen_1": "learning" }
    generatedCards: [], // AI flashcards
    dailyProgress: { date: new Date().toDateString(), count: 0 },
    streak: 0,
    completedLessons: [], // New: for grammar lessons
  });

  const [activeTab, setActiveTab] = useState('vocabulary'); // Changed initial tab
  const sound = useSound(); // Keep useSound for now, though VocabularyTab uses its own audioRef

  const combinedPhrases = useMemo(() => {
    const aiPhrases = userData.generatedCards.filter(c => c.type === 'phrase' || (c.english && c.english.split(' ').length > 1));
    return [...PHRASES, ...aiPhrases];
  }, [userData.generatedCards]);

  const combinedVocabulary = useMemo(() => {
    const aiWords = userData.generatedCards.filter(c => c.type === 'word' || (c.english && c.english.split(' ').length === 1));
    return [...INITIAL_VOCABULARY, ...aiWords];
  }, [userData.generatedCards]);

  // 1. Auth Listener
  useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore Sync (onSnapshot)
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        // Handle daily reset logic here when data loads
        const today = new Date().toDateString();
        let dbDaily = data.dailyProgress || { date: today, count: 0 };
        let dbStreak = data.streak || 0;

        if (dbDaily.date !== today) {
          if (dbDaily.count >= 10) dbStreak += 1;
          else if (dbDaily.count === 0) dbStreak = 0;
          dbDaily = { date: today, count: 0 };

          // Background update if day changed
          setDoc(docRef, { dailyProgress: dbDaily, streak: dbStreak }, { merge: true });
        }

        setUserData({
          vocabMap: data.vocabMap || {},
          generatedCards: data.generatedCards || [],
          dailyProgress: dbDaily,
          streak: dbStreak,
          completedLessons: data.completedLessons || [], // New: for grammar lessons
        });
      } else {
        // Initialize new user document
        const initialData = {
          vocabMap: {},
          generatedCards: [],
          dailyProgress: { date: new Date().toDateString(), count: 0 },
          streak: 0,
          completedLessons: [], // New: for grammar lessons
        };
        setDoc(docRef, initialData);
        setUserData(initialData);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Firestore Write Helpers
  const updateFirebase = async (updates) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  const handleMarkKnown = (id, newStatus = 'known') => {
    updateFirebase({
      vocabMap: { ...userData.vocabMap, [id]: newStatus }
    });
  };

  const handleToggleLesson = (id) => {
    const isCompleted = userData.completedLessons.includes(id);
    const newList = isCompleted
      ? userData.completedLessons.filter(l => l !== id)
      : [...userData.completedLessons, id];

    updateFirebase({ completedLessons: newList });
  };

  const handleResetAll = () => {
    // Instead of deleting vocabMap, set all to learning
    const newMap = { ...userData.vocabMap };
    Object.keys(newMap).forEach(k => newMap[k] = 'learning');
    updateFirebase({ vocabMap: newMap });
  };

  const handleProgress = () => {
    updateFirebase({
      dailyProgress: {
        date: userData.dailyProgress.date,
        count: Math.min(userData.dailyProgress.count + 1, 10)
      }
    });
  };

  const handleNewFlashcard = (card) => {
    // Check if duplicate in generated or internal vocab
    const isDuplicate = [...INITIAL_VOCABULARY, ...userData.generatedCards].some(
      c => c.english?.toLowerCase() === card.english?.toLowerCase()
    );
    if (isDuplicate) return;

    const newGeneratedCard = {
      ...card,
      id: `gen_${Date.now()}`,
      status: 'learning',
      _generated: true,
    };

    updateFirebase({
      generatedCards: [...userData.generatedCards, newGeneratedCard],
      vocabMap: {
        ...userData.vocabMap,
        [newGeneratedCard.id]: 'learning'
      }
    });
  };


  const [loginError, setLoginError] = useState(null);

  const handleEmailLogin = async (email, password) => {
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError("Hibás email vagy jelszó. 😢");
    }
  };

  // ── Render States ─────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <Heart className="animate-pulse text-pink-400 fill-pink-400" size={48} />
      </div>
    );
  }

  if (!user && auth) {
    return <LoginScreen onLogin={handleEmailLogin} error={loginError} />;
  }

  // If Firebase isn't configured in .env at all
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Firebase nincs beállítva</h1>
          <p className="text-gray-700">Töltsd ki a <code className="bg-white px-2 rounded">.env</code> fájlt a Firebase adataiddal!</p>
        </div>
      </div>
    );
  }

  const DAILY_GOAL = 10;
  const progressPct = Math.min((userData.dailyProgress.count / DAILY_GOAL) * 100, 100);
  const tabs = [
    { id: 'vocabulary', label: 'Szótár', icon: BookOpen },
    { id: 'phrases', label: 'Mondatok', icon: Languages },
    { id: 'practice', label: 'Gyakorlat', icon: Gamepad2 },
    { id: 'grammar', label: 'Nyelvtan', icon: GraduationCap },
    { id: 'chat', label: 'AI Gyakorlás', icon: Sparkles },
    { id: 'progress', label: 'Haladás', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-pink-100 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-500" size={22} />
              <h1 className="text-lg font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                English With Love
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                <Flame size={14} className="text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{userData.streak} napos sorozat</span>
              </div>
              <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Target size={14} className="text-purple-400 flex-shrink-0" />
            <div className="flex-1 h-2.5 bg-purple-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${progressPct >= 100 ? 'shimmer-bar' : 'bg-gradient-to-r from-pink-400 to-purple-400'
                  }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-purple-500 flex-shrink-0 whitespace-nowrap">
              {userData.dailyProgress.count}/{DAILY_GOAL}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24 main-content-bg">
        {/* Show generated cards notification only on the AI tab to prevent annoying popups in flashcards */}
        {userData.generatedCards.length > 0 && activeTab === 'chat' && (
          <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 text-sm text-purple-700 text-center animate-slide-up">
            ✨ Eddig {userData.generatedCards.length} extra kártyát tanultál meg az AI-tól!
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyTab
            vocabMap={userData.vocabMap}
            generatedCards={userData.generatedCards}
            onMarkKnown={handleMarkKnown}
            onResetAll={handleResetAll}
            onProgress={handleProgress}
            sound={sound}
            initialVocabulary={combinedVocabulary}
          />
        )}
        {activeTab === 'phrases' && <PhrasesTab phrases={combinedPhrases} />}
        {activeTab === 'grammar' && (
          <GrammarTab
            userData={userData}
            onToggleLesson={handleToggleLesson}
          />
        )}
        {activeTab === 'practice' && <SentencePuzzle phrases={combinedPhrases} sound={sound} />}
        {activeTab === 'chat' && <AiChatTab onNewFlashcard={handleNewFlashcard} />}
        {activeTab === 'progress' && (
          <ProgressionTab
            userData={userData}
            vocabulary={combinedVocabulary}
            grammarLessons={GRAMMAR_LESSONS}
          />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-pink-100">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-all duration-200 ${activeTab === tab.id ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'scale-110' : ''} />
              <span className="text-[10px] font-bold">{tab.label}</span>
              {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-purple-500 mt-0.5" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
