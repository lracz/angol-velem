// ═══════════════════════════════════════════════════════════════════
// ANGOL VELEM – Main App (Refactored)
// Only routing, state management, and Firebase sync logic live here.
// All UI components are in separate files under /components.
// ═══════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Heart, BookOpen, Languages, Gamepad2, Headphones,
  GraduationCap, TrendingUp, Sparkles, LogOut,
  Star, Flame, Target, Medal, Book
} from 'lucide-react';

// Config & Firebase
import {
  auth, db,
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  doc, onSnapshot, setDoc
} from './config/firebase';

// Hooks
import { useSound } from './hooks/useSound';

// Utils
import { generateDailyQuests } from './utils/quests';
import { DAILY_GOAL } from './utils/helpers';

// Data
import { INITIAL_VOCABULARY, PHRASES, CATEGORIES, PHRASE_CATEGORIES } from './data/vocabulary';
import { GRAMMAR_LESSONS } from './data/grammar';
import { generateDynamicSentences } from './data/puzzle_generator';

// UI Components
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Auth
import { LoginScreen } from './components/auth/LoginScreen';

// Tab Components
import { FlashcardTab } from './components/tabs/FlashcardTab';
import { GrammarTab } from './components/tabs/GrammarTab';
import { SentencePuzzle } from './components/tabs/SentencePuzzle';
import { ListeningPuzzle } from './components/tabs/ListeningPuzzle';
import { AiChatTab } from './components/tabs/AiChatTab';
import { DictionaryTab } from './components/tabs/DictionaryTab';
import { ProgressionTab } from './components/tabs/ProgressionTab';
import { SecretModal } from './components/ui/SecretModal';
import { SnailPet } from './components/ui/SnailPet';
import { SnailShopModal } from './components/ui/SnailShopModal';
import { BossFightModal } from './components/ui/BossFightModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { SECRETS } from './data/secrets';


// ═══════════════════════════════════════════════════════════════════
// MAIN APP (Handles Auth & Firebase Sync)
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Firestore state
  const [userData, setUserData] = useState({
    vocabMap: {},
    generatedCards: [],
    dailyProgress: { date: new Date().toDateString(), count: 0 },
    streak: 0,
    completedLessons: [],
    practiceIndex: 0,
    listeningIndex: 0,
    redeemedCoupons: [],
    unlockedSecrets: [],
    snailCoins: 0,
    snailFood: 0,
    snailWater: 0,
    snailFoodLevel: 100,
    snailWaterLevel: 100,
    ownedAccessories: [],
    equippedAccessories: [],
  });

  const [showGlobalConfetti, setShowGlobalConfetti] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState(null);
  const [showAllQuests, setShowAllQuests] = useState(false);

  const [activeTab, setActiveTab] = useState('vocabulary');
  const [activeSecret, setActiveSecret] = useState(null);
  const [showSnailShop, setShowSnailShop] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [headerClicks, setHeaderClicks] = useState(0);
  const sound = useSound();

  // ── Secret Check ─────────────────────────────────────────────
  useEffect(() => {
    if (!userData || !userData.unlockedSecrets) return;

    const newSecrets = SECRETS.filter(secret => {
      if (userData.unlockedSecrets.includes(secret.id)) return false;
      if (secret.condition.type === 'level') {
        return (userData.level || 1) >= secret.condition.value;
      }
      if (secret.condition.type === 'streak') {
        return (userData.streak || 0) >= secret.condition.value;
      }
      return false;
    });

    if (newSecrets.length > 0 && !activeSecret) {
      const targetSecret = newSecrets[0];
      setActiveSecret(targetSecret);
      const newUnlocked = [...userData.unlockedSecrets, targetSecret.id];
      updateFirebase({ unlockedSecrets: newUnlocked });
    }
  }, [userData?.level, userData?.streak, userData?.unlockedSecrets]);

  // ── Derived Data ──────────────────────────────────────────────
  const combinedPhrases = useMemo(() => {
    const aiPhrases = userData.generatedCards.filter(c => c.type === 'phrase' || (c.english && c.english.split(' ').length > 1));
    return [...PHRASES, ...aiPhrases];
  }, [userData.generatedCards]);

  const combinedVocabulary = useMemo(() => {
    const aiWords = userData.generatedCards.filter(c => c.type === 'word' || (c.english && c.english.split(' ').length === 1));
    return [...INITIAL_VOCABULARY, ...aiWords];
  }, [userData.generatedCards]);

  const dynamicPuzzlePhrases = useMemo(() => {
    const learningOrKnown = combinedVocabulary.filter(v =>
      userData?.vocabMap?.[v.id] === 'known' ||
      userData?.vocabMap?.[v.id] === 'review' ||
      userData?.vocabMap?.[v.id] === 'learning'
    );
    return generateDynamicSentences(learningOrKnown, 20);
  }, [combinedVocabulary, userData.vocabMap]);

  // ── 1. Auth Listener ──────────────────────────────────────────
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

  // ── Global Challenge Listener ────────────────────────────────
  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, 'global', 'challenges');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.active) {
          setActiveChallenge(data);
        } else {
          setActiveChallenge(null);
        }
      }
    });
    return () => unsubscribe();
  }, [db]);

  // ── 2. Real-time Firestore Sync (onSnapshot) ─────────────────
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        const today = new Date().toDateString();
        let dbDaily = data.dailyProgress || { date: today, count: 0 };
        let dbStreak = data.streak || 0;

        if (dbDaily.date !== today) {
          if (dbDaily.count >= 50) dbStreak += 1;
          else if (dbDaily.count === 0) dbStreak = 0;
          dbDaily = { date: today, count: 0 };

          const newQuests = generateDailyQuests();
          const newFoodLevel = Math.max(0, (data.snailFoodLevel ?? 100) - 25);
          const newWaterLevel = Math.max(0, (data.snailWaterLevel ?? 100) - 25);

          setDoc(docRef, {
            dailyProgress: dbDaily,
            streak: dbStreak,
            quests: newQuests,
            snailFoodLevel: newFoodLevel,
            snailWaterLevel: newWaterLevel
          }, { merge: true });

          data.quests = newQuests;
          data.snailFoodLevel = newFoodLevel;
          data.snailWaterLevel = newWaterLevel;
        }

        setUserData({
          vocabMap: data.vocabMap || {},
          generatedCards: data.generatedCards || [],
          dailyProgress: dbDaily,
          streak: dbStreak,
          completedLessons: data.completedLessons || [],
          xp: data.xp || 0,
          level: data.level || 1,
          quests: data.quests || generateDailyQuests(),
          practiceIndex: data.practiceIndex || 0,
          listeningIndex: data.listeningIndex || 0,
          redeemedCoupons: data.redeemedCoupons || [],
          unlockedSecrets: data.unlockedSecrets || [],
          snailCoins: data.snailCoins || 0,
          snailFood: data.snailFood || 0,
          snailWater: data.snailWater || 0,
          snailFoodLevel: data.snailFoodLevel ?? 100,
          snailWaterLevel: data.snailWaterLevel ?? 100,
          ownedAccessories: data.ownedAccessories || [],
          equippedAccessories: data.equippedAccessories || [],
        });
      } else {
        const initialQuests = generateDailyQuests();
        const initialData = {
          vocabMap: {},
          generatedCards: [],
          dailyProgress: { date: new Date().toDateString(), count: 0 },
          streak: 0,
          completedLessons: [],
          xp: 0,
          level: 1,
          quests: initialQuests,
          practiceIndex: 0,
          listeningIndex: 0,
          redeemedCoupons: [],
          unlockedSecrets: [],
          snailCoins: 0,
          snailFood: 5,
          snailWater: 5,
          snailFoodLevel: 100,
          snailWaterLevel: 100,
          ownedAccessories: [],
          equippedAccessories: [],
        };
        setDoc(docRef, initialData);
        setUserData(initialData);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // ── Firestore Write Helpers ───────────────────────────────────
  const updateFirebase = async (updates) => {
    if (!user || !db) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, updates, { merge: true });
  };

  const handleMarkKnown = (id, newStatus = 'known') => {
    if (id === null && newStatus === 'resetAll') {
      const newMap = { ...userData.vocabMap };
      Object.keys(newMap).forEach(k => newMap[k] = 'learning');
      updateFirebase({ vocabMap: newMap });
    } else {
      const updates = {
        vocabMap: { ...userData.vocabMap, [id]: newStatus }
      };

      // 30% chance to find food or water when practicing
      if (Math.random() > 0.7) {
        if (Math.random() > 0.5) {
          updates.snailFood = (userData.snailFood || 0) + 1;
        } else {
          updates.snailWater = (userData.snailWater || 0) + 1;
        }
      }
      updateFirebase(updates);
    }
  };

  const handleToggleLesson = async (id, xpReward = 0) => {
    const isCompleted = userData.completedLessons.includes(id);
    const newList = isCompleted
      ? userData.completedLessons.filter(l => l !== id)
      : [...userData.completedLessons, id];

    if (!isCompleted && xpReward > 0) {
      let newXp = (userData.xp || 0) + xpReward;
      let newLevel = userData.level || 1;
      let didLevelUp = false;
      while (newXp >= newLevel * newLevel * 100) {
        newLevel++;
        didLevelUp = true;
      }

      const earnedCoins = Math.floor(xpReward / 10);
      const newCoins = (userData.snailCoins || 0) + earnedCoins;
      const newFood = (userData.snailFood || 0) + 5;
      const newWater = (userData.snailWater || 0) + 5;

      const freshUserData = {
        ...userData, completedLessons: newList, xp: newXp, level: newLevel,
        snailCoins: newCoins, snailFood: newFood, snailWater: newWater
      };
      setUserData(freshUserData);
      await updateFirebase({
        completedLessons: newList, xp: newXp, level: newLevel,
        snailCoins: newCoins, snailFood: newFood, snailWater: newWater
      });

      if (didLevelUp) {
        sound.playDing();
        setLevelUpMessage(`Szintlépés! Elérted a(z) ${newLevel}. szintet! 🎉`);
        setShowGlobalConfetti(true);
        setTimeout(() => {
          setShowGlobalConfetti(false);
          setLevelUpMessage(null);
        }, 5000);
      }
    } else {
      // Award minor rewards for finishing a lesson even if already done
      const newXp = (userData.xp || 0) + 20;
      const newCoins = (userData.snailCoins || 0) + 5;
      updateFirebase({
        completedLessons: newList,
        xp: newXp,
        snailCoins: newCoins
      });
    }
  };

  const handleResetAll = () => {
    const newMap = { ...userData.vocabMap };
    Object.keys(newMap).forEach(k => newMap[k] = 'learning');
    updateFirebase({ vocabMap: newMap });
  };

  const handleProgress = () => {
    updateFirebase({
      dailyProgress: {
        date: userData.dailyProgress.date,
        count: (userData.dailyProgress.count || 0) + 1
      }
    });
  };

  const handleQuestProgress = useCallback(async (type) => {
    if (!user || !userData) return;

    let updatedQuests = [...(userData.quests || [])];
    let newXp = userData.xp || 0;
    let newLevel = userData.level || 1;
    let newCoins = userData.snailCoins || 0;
    let newFood = userData.snailFood || 0;
    let newWater = userData.snailWater || 0;
    let didLevelUp = false;

    let questsChanged = false;
    updatedQuests = updatedQuests.map(q => {
      if (!q.done && q.type === type) {
        questsChanged = true;
        q.current += 1;
        if (q.current >= q.target) {
          q.done = true;
          newXp += q.xp;
          newCoins += Math.floor(q.xp / 10);
          newFood += 5;
          newWater += 5;
        }
      }
      return q;
    });

    if (questsChanged) {
      while (newXp >= newLevel * newLevel * 100) {
        newLevel++;
        didLevelUp = true;
      }

      const updates = {
        quests: updatedQuests,
        xp: newXp,
        level: newLevel,
        snailCoins: newCoins,
        snailFood: newFood,
        snailWater: newWater
      };

      setUserData(prev => ({ ...prev, ...updates }));
      await updateFirebase(updates);

      if (didLevelUp) {
        sound.playDing();
        setLevelUpMessage(`Szintlépés! Elérted a(z) ${newLevel}. szintet! 🎉`);
        setShowGlobalConfetti(true);
        setTimeout(() => {
          setShowGlobalConfetti(false);
          setLevelUpMessage(null);
        }, 5000);
      }
    }
  }, [user, userData, db, sound]);

  const handleSolveBossFight = async (xpReward) => {
    const newXp = (userData.xp || 0) + xpReward;
    let newLevel = userData.level || 1;
    let didLevelUp = false;
    while (newXp >= newLevel * newLevel * 100) {
      newLevel++;
      didLevelUp = true;
    }

    const earnedCoins = Math.floor(xpReward / 5); // Boss fight gives more coins
    const freshUserData = {
      ...userData,
      xp: newXp,
      level: newLevel,
      snailCoins: (userData.snailCoins || 0) + earnedCoins
    };

    setUserData(freshUserData);
    await updateFirebase({
      xp: newXp,
      level: newLevel,
      snailCoins: freshUserData.snailCoins
    });

    setActiveChallenge(null); // Hide for this session

    if (didLevelUp) {
      sound.playDing();
      setLevelUpMessage(`Szintlépés! Elérted a(z) ${newLevel}. szintet! 🎉`);
      setShowGlobalConfetti(true);
      setTimeout(() => {
        setShowGlobalConfetti(false);
        setLevelUpMessage(null);
      }, 5000);
    }
  };

  const handleSolvePhrase = (type, phraseId) => {
    if (phraseId === true) {
      updateFirebase({
        [type === 'practice' ? 'practiceSolved' : 'listeningSolved']: []
      });
      return;
    }

    const key = type === 'practice' ? 'practiceSolved' : 'listeningSolved';
    const currentList = userData[key] || [];

    // Always award XP for solving a puzzle
    const xpReward = 10;
    const coinReward = 2;
    const newXp = (userData.xp || 0) + xpReward;
    const newCoins = (userData.snailCoins || 0) + coinReward;

    let newLevel = userData.level || 1;
    let didLevelUp = false;
    while (newXp >= newLevel * newLevel * 100) {
      newLevel++;
      didLevelUp = true;
    }

    const updates = {
      xp: newXp,
      level: newLevel,
      snailCoins: newCoins
    };

    if (phraseId !== true && !currentList.includes(phraseId)) {
      updates[key] = [...currentList, phraseId];
    }

    updateFirebase(updates);

    if (didLevelUp) {
      sound.playDing();
      setLevelUpMessage(`Szintlépés! Elérted a(z) ${newLevel}. szintet! 🎉`);
      setShowGlobalConfetti(true);
      setTimeout(() => {
        setShowGlobalConfetti(false);
        setLevelUpMessage(null);
      }, 5000);
    }
  };

  const handleRedeemCoupon = (couponId) => {
    if ((userData.redeemedCoupons || []).includes(couponId)) return;
    const newRedeemed = [...(userData.redeemedCoupons || []), couponId];
    updateFirebase({ redeemedCoupons: newRedeemed });
    sound.playDing();
    setShowGlobalConfetti(true);
    setTimeout(() => setShowGlobalConfetti(false), 3000);
  };

  const handleNewFlashcard = (card) => {
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

  const handleFetchMoreWords = async (categoryId) => {
    const primaryKey = import.meta.env.VITE_GEMINI_API_KEY;
    const secondaryKey = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;

    const targetCategory = CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;

    const systemPrompt = `Te egy modern angoltanár asszisztens vagy, aki a Kifejezés-alapú (Lexical) megközelítést alkalmazza. 
Kérlek, generálj pontosan 50 db ÚJ, a mindennapi életben gyakran használt angol kifejezést (lexical chunks, rövid szókapcsolatok) a(z) "${targetCategory}" témakörből egy A1-A2 szintű magyar tanuló számára.
Ne csupasz, egyedi szavakat adj (pl. "mistake"), hanem a hozzájuk tartozó gyakori igei/jelzős környezetükkel (pl. "make a mistake", "shining sun", "book a table")! A kifejezések legyenek átlagosan 2-4 szó hosszúak.
A "hint" mezőbe mindenképp egy nagyon egyszerű, A1 szintű rövid példamondatot írj angolul a szókapcsolattal, ami segíti a megértést!
A válaszod SZIGORÚAN egy JSON tömb legyen a következő formátumban, markdown és extra kód blokk NÉLKÜL:
[
  { "hungarian": "hibát elkövetni", "english": "make a mistake", "emoji": "❌", "hint": "Try not to make a mistake." }
]
Ne írj semmi mást a JSON-ön kívül!`;

    const createBody = () => JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const executeFetch = async (key) => {
      if (!key) throw new Error("No API key");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal, body: createBody() }
        );
        if (!response.ok) throw new Error(`API error ${response.status}`);
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
      } finally {
        clearTimeout(timeout);
      }
    };

    try {
      let newWords;
      try {
        newWords = await executeFetch(primaryKey);
      } catch (err) {
        if (secondaryKey) newWords = await executeFetch(secondaryKey);
        else throw err;
      }

      if (Array.isArray(newWords)) {
        const generated = newWords.map((w, index) => ({
          ...w,
          id: `gen_${categoryId}_${Date.now()}_${index}`,
          categoryId,
          status: 'learning',
          _generated: true,
          type: 'word'
        }));

        const newVocabMap = { ...userData.vocabMap };
        generated.forEach(g => newVocabMap[g.id] = 'learning');

        updateFirebase({
          generatedCards: [...(userData.generatedCards || []), ...generated],
          vocabMap: newVocabMap
        });
      }
    } catch (err) {
      console.error("Failed to fetch words", err);
      throw new Error("Nem sikerült letölteni az új szavakat. Kérjük próbáld később!");
    }
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

  // ── Render States ─────────────────────────────────────────────
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

  const dailyCount = userData?.dailyProgress?.count || 0;
  const progressPct = Math.min((dailyCount / DAILY_GOAL) * 100, 100);
  const isOverGoal = dailyCount >= DAILY_GOAL;

  const tabs = [
    { id: 'dictionary', label: 'Szótár', icon: Book },
    { id: 'vocabulary', label: 'Tanulás', icon: BookOpen },
    { id: 'phrases', label: 'Mondatok', icon: Languages },
    { id: 'practice', label: 'Gyakorlat', icon: Gamepad2 },
    { id: 'listening', label: 'Hallás', icon: Headphones },
    { id: 'grammar', label: 'Nyelvtan', icon: GraduationCap },
    { id: 'chat', label: 'AI Gyakorlás', icon: Sparkles },
    { id: 'progress', label: 'Haladás', icon: TrendingUp },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-pink-100 px-4 py-3">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div
                className="flex items-center gap-2 group relative cursor-pointer"
                onClick={() => {
                  const newClicks = headerClicks + 1;
                  setHeaderClicks(newClicks);
                  if (newClicks >= 3) {
                    setShowAdminPanel(true);
                    setHeaderClicks(0);
                  }
                  setTimeout(() => setHeaderClicks(0), 2000);
                }}
              >
                <Heart className="text-pink-500 fill-pink-500 group-hover:opacity-0 transition-opacity duration-300" size={22} />
                <span className="absolute left-0 top-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg pointer-events-none w-full h-full">🐌</span>
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  Angol Velem
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                  <Medal className="text-yellow-600" size={14} />
                  <span className="text-xs font-bold text-yellow-700">Szint {userData?.level || 1}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-yellow-700">{userData?.xp || 0} XP</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">{userData.streak} nap</span>
                </div>
                <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Target size={14} className={`${isOverGoal ? 'text-orange-500 animate-bounce' : 'text-purple-400'} flex-shrink-0`} />
              <div className="flex-1 h-2.5 bg-purple-100/50 rounded-full overflow-hidden shadow-inner relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isOverGoal ? 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 shimmer-bar' : 'bg-gradient-to-r from-pink-400 to-purple-400'
                    }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className={`text-xs font-black flex-shrink-0 whitespace-nowrap transition-colors ${isOverGoal ? 'text-red-500 drop-shadow-sm' : 'text-purple-500'}`}>
                {dailyCount}/{DAILY_GOAL}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-5 pb-24 main-content-bg">
          {userData.generatedCards.length > 0 && activeTab === 'chat' && (
            <div className="mb-4 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 text-sm text-purple-700 text-center animate-slide-up">
              ✨ Eddig {userData.generatedCards.length} extra kártyát tanultál meg az AI-tól!
            </div>
          )}

          {activeTab === 'dictionary' && (
            <DictionaryTab
              vocabMap={userData.vocabMap}
              vocabulary={combinedVocabulary}
            />
          )}

          {activeTab === 'vocabulary' && (
            <FlashcardTab
              items={INITIAL_VOCABULARY}
              categories={CATEGORIES}
              vocabMap={userData.vocabMap}
              generatedCards={userData.generatedCards}
              onProgress={handleProgress}
              onFetchMore={handleFetchMoreWords}
              onMarkKnown={(id, data) => handleMarkKnown(id, data)}
              playSound={sound.playDing}
              onQuestProgress={handleQuestProgress}
            />
          )}
          {activeTab === 'phrases' && (
            <FlashcardTab
              items={combinedPhrases}
              categories={PHRASE_CATEGORIES}
              vocabMap={userData.vocabMap}
              onProgress={handleProgress}
              onMarkKnown={(id, data) => handleMarkKnown(id, data)}
              playSound={sound.playDing}
              onQuestProgress={handleQuestProgress}
              isSentences={true}
            />
          )}
          {activeTab === 'grammar' && (
            <GrammarTab
              userData={userData}
              onToggleLesson={handleToggleLesson}
              onQuestProgress={handleQuestProgress}
            />
          )}
          {activeTab === 'practice' && <SentencePuzzle
            phrases={dynamicPuzzlePhrases.length > 0 ? dynamicPuzzlePhrases : combinedPhrases}
            sound={sound}
            onQuestProgress={handleQuestProgress}
            savedSolved={userData.practiceSolved || []}
            onSolvePhrase={(id) => handleSolvePhrase('practice', id)}
          />}
          {activeTab === 'listening' && <ListeningPuzzle
            phrases={dynamicPuzzlePhrases.length > 0 ? dynamicPuzzlePhrases : combinedPhrases}
            sound={sound}
            onQuestProgress={handleQuestProgress}
            savedSolved={userData.listeningSolved || []}
            onSolvePhrase={(id) => handleSolvePhrase('listening', id)}
          />}
          {activeTab === 'chat' && <AiChatTab onNewFlashcard={handleNewFlashcard} onQuestProgress={handleQuestProgress} />}
          {activeTab === 'progress' && (
            <ProgressionTab
              userData={userData}
              vocabulary={combinedVocabulary}
              grammarLessons={GRAMMAR_LESSONS}
              showAllQuests={showAllQuests}
              setShowAllQuests={setShowAllQuests}
              onRedeemCoupon={handleRedeemCoupon}
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

        <SnailPet
          userData={userData}
          updateFirebase={updateFirebase}
          handleOpenShop={() => setShowSnailShop(true)}
        />

        {showSnailShop && (
          <SnailShopModal
            userData={userData}
            updateFirebase={updateFirebase}
            onClose={() => setShowSnailShop(false)}
          />
        )}

        {activeChallenge && (
          <BossFightModal
            challenge={activeChallenge}
            onClose={() => setActiveChallenge(null)}
            onSolve={handleSolveBossFight}
          />
        )}

        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}

        <SecretModal secret={activeSecret} onClose={() => setActiveSecret(null)} />
      </div>
    </ErrorBoundary>
  );
}
