/* ================================================
   DIGITINHO — js/data.js
   Game configuration, pools, and definitions
   ================================================ */
'use strict';

const CFG = {
  baseSpeed: 52,
  speedBonusLetter: 0.008,
  speedBonusSyl: 0.02,
  speedBonusWord: 0.04,
  speedErrorPenalty: 0.1,   // +0.1x per typo error
  maxSpeedMult: 4.0,
  spawnBase: 2100,
  spawnMin: 500,
  spawnVariance: 650,
  freezerMaxItems: 3, // Limite máximo de rúnicos simultâneos na tela com Freezer ativo
  hasteSpeedBonus: 0.5, // Aumento relativo (+0.5) de velocidade com a habilidade Pontos em Dobro
  padX: 14,
  progressPenalty: 1,
  startLives: 3,
  wordsPerPhase: 3,
  wordSkillChance: 0.06,  // Rare on words — primary source is the shop
  wildcardChance: 0.04,  // Chance of spawning a wildcard word
  shopEvery: 3,     // Shop appears every N completed phases
  shopPriceFactor: 1.45,  // Exponential price escalation
  queueSize: 6,     // Items previewed in the bottom queue
};

// ================================================
// DIFFICULTY PRESETS & CONFIGURATION
// ================================================
const DIFFICULTY_CONFIG = {
  easy: {
    id: 'easy',
    name: 'easy',
    initialSpeed: 0.5,
    speedErrorPenalty: 0,
    progressErrorPenalty: 0,
    startLives: 5,
  },
  normal: {
    id: 'normal',
    name: 'normal',
    initialSpeed: 1.0,
    speedErrorPenalty: 0,
    progressErrorPenalty: 1,
    startLives: 3,
  },
  hard: {
    id: 'hard',
    name: 'hard',
    initialSpeed: 1.5,
    speedErrorPenalty: 0.05,
    progressErrorPenalty: 1,
    startLives: 3,
  },
};

// Phase goal: Phase 1 = 10, Phase 2 = 20, Phase 3 = 30, Phase 4 = 40, Phase 5 = 50, Phase 6 = 60... (+10 per phase)
function calcPhaseGoal(phase) {
  const p = Math.max(1, parseInt(phase, 10) || 1);
  return p * 10;
}

// ================================================
// MULTI-LANGUAGE DATA AGGREGATION
// Modularly loaded from locales/{lang}.json by js/i18n.js
// ================================================
const SYLLABLE_POOLS = {};
const WORD_POOLS = {};
const BOSS_WORDS_BY_TYPE = {
  robot: {},
  beast: {},
  mythology: {},
  ocean: {},
  cosmos: {},
  volcano: {}
};
const TRAINING_WORLDS_DATA = {};

function initGameLanguageData() {
  const wordsObj = (typeof window !== 'undefined' && window.GAME_DATA_WORDS) ? window.GAME_DATA_WORDS : {};
  const supported = (typeof SUPPORTED_LANGUAGES !== 'undefined') ? SUPPORTED_LANGUAGES : ['en', 'pt', 'fr', 'de', 'ja', 'ko', 'zh'];

  supported.forEach(lang => {
    const data = wordsObj[lang] || {};
    if (data.syllables) {
      SYLLABLE_POOLS[lang] = data.syllables;
    } else if (wordsObj.en && wordsObj.en.syllables) {
      SYLLABLE_POOLS[lang] = wordsObj.en.syllables;
    }

    if (data.words) {
      WORD_POOLS[lang] = data.words;
    } else if (wordsObj.en && wordsObj.en.words) {
      WORD_POOLS[lang] = wordsObj.en.words;
    }

    if (data.bossWords) {
      Object.keys(data.bossWords).forEach(type => {
        if (!BOSS_WORDS_BY_TYPE[type]) BOSS_WORDS_BY_TYPE[type] = {};
        BOSS_WORDS_BY_TYPE[type][lang] = data.bossWords[type];
      });
    }

    if (data.trainingWorlds) {
      TRAINING_WORLDS_DATA[lang] = data.trainingWorlds;
    }
  });

  // Ensure default fallback for training worlds
  if (!TRAINING_WORLDS_DATA.en && wordsObj.en && wordsObj.en.trainingWorlds) {
    TRAINING_WORLDS_DATA.en = wordsObj.en.trainingWorlds;
  }
}
initGameLanguageData();

// Initial setup from active language
const initLang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
let WORD_POOL = WORD_POOLS[initLang] || WORD_POOLS.en || [];
let ALL_SYLLABLES = SYLLABLE_POOLS[initLang] || SYLLABLE_POOLS.en || [];

function getTrainingWorlds(lang) {
  const curLang = lang || ((typeof getLanguage === 'function') ? getLanguage() : 'en');
  return TRAINING_WORLDS_DATA[curLang] || TRAINING_WORLDS_DATA.en || {};
}

let TRAINING_WORLDS = getTrainingWorlds(initLang);

function updateWordPoolLanguage(lang) {
  if (typeof window !== 'undefined' && window.GAME_DATA_WORDS && window.GAME_DATA_WORDS[lang]) {
    initGameLanguageData();
  }
  WORD_POOL = WORD_POOLS[lang] || WORD_POOLS.en || [];
  ALL_SYLLABLES = SYLLABLE_POOLS[lang] || SYLLABLE_POOLS.en || [];
  TRAINING_WORLDS = getTrainingWorlds(lang);
}

// ================================================
// BOSS SYSTEM: SCENARIOS, UNIQUE TYPES & THEMATIC ENIGMAS
// ================================================
// 6 authentic boss archetypes appearing randomly at phase multiples of 10:
// - robot:     Cybernetic Metropolis (Technological & Cybernetic meanings)
// - beast:     Primordial Savanna (Fauna, Apex Predators & Pack meanings)
// - mythology: Mystic Pantheon & Delphi (Mythology, Gods & Legendary beings)
// - ocean:     Pelagic Trench & Deep Abyss (Marine biology & Ocean depths)
// - cosmos:    Stellar Nebula & Cosmic Void (Astrophysics, Stars & Gravity)
// - volcano:   Volcanic Caldera & Igneous Core (Magma, Lava & Geology)

const BOSS_DEFS = [
  {
    id: 'cyber_titan',
    type: 'robot',
    name: 'Cyber-Titan Lexis',
    namePt: 'Cyber-Titã Lexis',
    title: 'Autonomous Cyber Sentinel',
    titlePt: 'Sentinela Cibernético Autônomo',
    scenario: 'Cybernetic Metropolis',
    scenarioPt: 'Metrópole Cibernética',
    scenarioDesc: 'Mega-city of glowing servers, neural processors and automated drone grids.',
    scenarioDescPt: 'Mega-cidade de servidores luminosos, processadores neurais e malhas autônomas.',
    icon: '🤖',
    color: '#06B6D4',
    badgeText: 'ROBOT • TECH',
    badgeTextPt: 'ROBÔ • TECH',
    lives: 3,
    maxLives: 3,
    lore: 'Master of algorithms, computational logic, and digital networks.',
    lorePt: 'Mestre dos algoritmos, lógica computacional e redes de alta frequência.'
  },
  {
    id: 'feral_apex',
    type: 'beast',
    name: 'Rex-Primus, the Feral Apex',
    namePt: 'Rex-Primus, o Soberano Feral',
    title: 'Ancient Apex Predator',
    titlePt: 'Predador Ancestral da Savana',
    scenario: 'Primordial Savanna',
    scenarioPt: 'Savana Primordial',
    scenarioDesc: 'Vast wild plains where primal beasts rule through pure instinct and strength.',
    scenarioDescPt: 'Planícies selvagens onde feras ancestrais reinam pela força e instinto.',
    icon: '🦁',
    color: '#F59E0B',
    badgeText: 'FAUNA • BEAST',
    badgeTextPt: 'FAUNA • FERA',
    lives: 3,
    maxLives: 3,
    lore: 'Emperor of wild herds, razor talons, and coordinated pack hunters.',
    lorePt: 'Soberano das manadas selvagens, garras afiadas e alcateias implacáveis.'
  },
  {
    id: 'arcane_chimera',
    type: 'mythology',
    name: 'Arcane Chimera of Delphi',
    namePt: 'Quimera Arcana de Delfos',
    title: 'Guardian of the Sacred Pantheon',
    titlePt: 'Guardião do Panteão Sagrado',
    scenario: 'Mystic Olympus Temple',
    scenarioPt: 'Templo Místico de Delfos',
    scenarioDesc: 'Ancient sanctuary of high columns, sacred oracles, and mythical creatures.',
    scenarioDescPt: 'Santuário de colunas monumentais, oráculos sagrados e criaturas lendárias.',
    icon: '🐲',
    color: '#A855F7',
    badgeText: 'MYTHOLOGY • LEGEND',
    badgeTextPt: 'MITOLOGIA • LENDA',
    lives: 3,
    maxLives: 3,
    lore: 'Forged from mythological fire, riddling sphinxes, and hydra heads.',
    lorePt: 'Forjado no fogo mitológico, enigmas de esfinge e lendas dos deuses antigos.'
  },
  {
    id: 'abyssal_leviathan',
    type: 'ocean',
    name: 'Deep Abyss Leviathan',
    namePt: 'Leviatã do Abismo Profundo',
    title: 'Monarch of the Pelagic Trenches',
    titlePt: 'Monarca das Trincheiras Abissais',
    scenario: 'Pelagic Ocean Trench',
    scenarioPt: 'Fossa Oceânica Abissal',
    scenarioDesc: 'Crushing deep sea where bioluminescent organisms glide in absolute darkness.',
    scenarioDescPt: 'Profundezas oceânicas onde seres bioluminescentes reinam na escuridão total.',
    icon: '🐙',
    color: '#0EA5E9',
    badgeText: 'OCEAN • ABYSS',
    badgeTextPt: 'OCEANO • ABISMO',
    lives: 3,
    maxLives: 3,
    lore: 'Commander of tidal waves, colossal sharks, and deep-sea trenches.',
    lorePt: 'Comandante das marés, tsunamis, recifes de corais e fossas submarinas.'
  },
  {
    id: 'cosmic_chronos',
    type: 'cosmos',
    name: 'Astro-Titan Chronos',
    namePt: 'Astro-Titã Cronos',
    title: 'Weaver of Galaxies & Nebulae',
    titlePt: 'Tecedor das Galáxias e Nebulosas',
    scenario: 'Stellar Nebula & Cosmic Void',
    scenarioPt: 'Nebulosa Estelar & Vácuo Cósmico',
    scenarioDesc: 'Infinite cosmic void swirling with ionized star clouds and gravitational orbits.',
    scenarioDescPt: 'Vácuo estelar infinito com nuvens de plasma ionizado e órbitas gravitacionais.',
    icon: '🌌',
    color: '#6366F1',
    badgeText: 'COSMOS • SPACE',
    badgeTextPt: 'COSMOS • ESPAÇO',
    lives: 3,
    maxLives: 3,
    lore: 'Ruler of thermonuclear star cores, pulsar beacons, and cosmic gravitational pulls.',
    lorePt: 'Regente da fusão estelar, pulsares rítmicos e gravidade orbital.'
  },
  {
    id: 'magma_vulcanus',
    type: 'volcano',
    name: 'Vulcanus, the Magma Colossus',
    namePt: 'Vulcanus, o Colosso de Magma',
    title: 'Lord of the Tectonic Caldera',
    titlePt: 'Senhor da Caldeira Tectônica',
    scenario: 'Volcanic Caldera & Igneous Core',
    scenarioPt: 'Caldeira Vulcânica & Núcleo Ígneo',
    scenarioDesc: 'Incandescent sea of subterranean lava, basalt pillars, and smoking craters.',
    scenarioDescPt: 'Mar subterrâneo de lava incandescente, colunas de basalto e crateras fumegantes.',
    icon: '🌋',
    color: '#EF4444',
    badgeText: 'VOLCANO • MAGMA',
    badgeTextPt: 'VULCÃO • MAGMA',
    lives: 3,
    maxLives: 3,
    lore: 'Incarnation of tectonic eruption, pyroclastic surges, and liquid rock.',
    lorePt: 'Encarnação das erupções tectônicas, nuvens piroclásticas e rochas fundidas.'
  }
];

function getRandomBoss(level = 1, excludeTypes = []) {
  let pool = BOSS_DEFS;
  if (Array.isArray(excludeTypes) && excludeTypes.length > 0 && excludeTypes.length < BOSS_DEFS.length) {
    const filtered = BOSS_DEFS.filter(b => !excludeTypes.includes(b.type));
    if (filtered.length > 0) pool = filtered;
  }
  const base = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...base,
    name: level > 1 ? `${base.name} (Lv. ${level})` : base.name,
    namePt: level > 1 ? `${base.namePt || base.name} (Nv. ${level})` : (base.namePt || base.name),
    lives: 3,
    maxLives: 3
  };
}

function getBossByType(bossType, level = 1) {
  const base = BOSS_DEFS.find(b => b.type === bossType) || BOSS_DEFS[0];
  return {
    ...base,
    name: level > 1 ? `${base.name} (Lv. ${level})` : base.name,
    namePt: level > 1 ? `${base.namePt || base.name} (Nv. ${level})` : (base.namePt || base.name),
    lives: 3,
    maxLives: 3
  };
}

function getBossForPhase(phase, learnedWords = null, excludeTypes = []) {
  const p = parseInt(phase, 10) || 10;
  const level = Math.max(1, Math.floor(p / 10));

  // If active game state has a pending boss already chosen for this phase, preserve it
  if (typeof state !== 'undefined' && state && state.pendingBoss && state.pendingBossPhase === p) {
    return state.pendingBoss;
  }

  // 1. If learned words are provided, find all eligible bosses (player learned >= 3 words)
  if (Array.isArray(learnedWords) && typeof isWordThematicallyRelatedToBoss === 'function') {
    let eligible = BOSS_DEFS.filter(b => {
      const matching = learnedWords.filter(w => isWordThematicallyRelatedToBoss(w, b.type));
      return matching.length >= 3;
    });

    if (eligible.length > 0) {
      if (Array.isArray(excludeTypes) && excludeTypes.length > 0 && excludeTypes.length < eligible.length) {
        const notDefeated = eligible.filter(b => !excludeTypes.includes(b.type));
        if (notDefeated.length > 0) eligible = notDefeated;
      }
      const base = eligible[Math.floor(Math.random() * eligible.length)];
      return {
        ...base,
        name: level > 1 ? `${base.name} (Lv. ${level})` : base.name,
        namePt: level > 1 ? `${base.namePt || base.name} (Nv. ${level})` : (base.namePt || base.name),
        lives: 3,
        maxLives: 3
      };
    }
  }

  // 2. Fallback: random boss among archetypes
  return getRandomBoss(level, excludeTypes);
}

// ================================================
// THEMATIC VOCABULARY & ENIGMA MEANINGS BY BOSS TYPE
// ================================================
function getThemedWordsForBoss(bossType, lang = 'en') {
  const typeWords = BOSS_WORDS_BY_TYPE[bossType] || BOSS_WORDS_BY_TYPE.robot;
  const langWords = typeWords[lang] || typeWords.en || typeWords.pt;
  return langWords || [];
}

// Wildcard words — destroy all items on screen when typed
const WILDCARD_WORDS = ['BOOM', 'BANG', 'NOVA', 'WARP', 'CHAOS'];

// ================================================
// CENTRAL SOURCE OF TRUTH: SKILLS & SHOP ITEMS
// ================================================

// 1. ACTIVATABLE RUNIC SKILLS (8 total — bound to keys 1–8)
// Names and descriptions live in locale files: skill_name_{id} / skill_desc_{id}
// Activation/expiry messages live in locale files: fb_{id}_activated / fb_{id}_expired
const SKILLS_CONFIG = {
  freezer: {
    id: 'freezer',
    icon: '❄️',
    name: 'Freeze',        // fallback only — real label via t('skill_name_freezer')
    desc: 'Freeze all runics for 10s',
    duration: 10000,
    basePrice: 300,
    color: '#06B6D4',
    category: 'skill',
    onActivate: (st) => {
      st.activeItems.forEach(i => i.el?.classList.add('frozen'));
    },
    onExpire: (st) => {
      st.activeItems.forEach(i => i.el?.classList.remove('frozen'));
    }
  },
  bomb: {
    id: 'bomb',
    icon: '💣',
    name: 'Bomb',
    desc: 'Multi-line area blast wave for 10s',
    duration: 10000,
    basePrice: 450,
    color: '#FF4757',
    category: 'skill',
    onActivate: () => {
      if (typeof playSound === 'function') playSound('bomb');
    },
    onExpire: () => {}
  },
  shield: {
    id: 'shield',
    icon: '🛡️',
    name: 'Runic Shield',
    desc: 'Protect against dropped runics and typos for 10s',
    duration: 10000,
    basePrice: 390,
    color: '#10B981',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  },
  vortex: {
    id: 'vortex',
    icon: '🌀',
    name: 'Vortex',
    desc: 'Devour the lowest runic every 2s for 10s',
    duration: 10000,
    basePrice: 420,
    color: '#8B5CF6',
    category: 'skill',
    onActivate: (st) => {
      st.vortexAccum = 0;
    },
    onExpire: () => {}
  },
  slowdown: {
    id: 'slowdown',
    icon: '⏱️',
    name: 'Slow-Mo',
    desc: 'Slow runic fall speed by 50% for 15s',
    duration: 15000,
    basePrice: 240,
    color: '#3B82F6',
    category: 'skill',
    onActivate: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.add('active');
    },
    onExpire: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.remove('active');
    }
  },
  haste: {
    id: 'haste',
    icon: '⚡',
    name: 'Double Points',
    desc: '+0.5 speed and 2× points for 15s',
    duration: 15000,
    basePrice: 240,
    speedBonus: 0.5,
    color: '#FF9F1A',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  },
  speedlock: {
    id: 'speedlock',
    icon: '🔒',
    name: 'Speed Lock',
    desc: 'Lock speed at 1.0× for 60s',
    duration: 60000,
    basePrice: 540,
    color: '#38BDF8',
    category: 'skill',
    onActivate: (st) => {
      st.speedMultiplier = 1.0;
    },
    onExpire: () => {}
  },
  dilation: {
    id: 'dilation',
    icon: '🌌',
    name: 'Spacing',
    desc: 'Increase vertical distance between runics for 45s',
    duration: 45000,
    basePrice: 480,
    color: '#A855F7',
    category: 'skill',
    onActivate: () => {},
    onExpire: () => {}
  }
};

// 2. SHOP ITEMS (Immediate consumables / special non-slot items)
// Names and descriptions live in locale files: skill_name_{id} / skill_desc_{id}
const SHOP_ITEMS_CONFIG = {
  continue: {
    id: 'continue',
    icon: '🪙',
    name: 'Continue Token',
    desc: 'Instant revival on Game Over in same phase',
    basePrice: 900,
    color: '#EAB308',
    isItem: true,
    category: 'item'
  },
  wordpack: {
    id: 'wordpack',
    icon: '📦',
    name: 'Mystery Pack',
    desc: 'Instantly unlocks 3 random words for your Library',
    basePrice: 330,
    color: '#EC4899',
    isItem: true,
    category: 'item'
  },
  extralife: {
    id: 'extralife',
    icon: '❤️',
    name: '+1 Life',
    desc: '+1 permanent life for this run (up to 6)',
    basePrice: 600,
    color: '#EF4444',
    isItem: true,
    category: 'item'
  }
};


const SKILLS_LIST = Object.values(SKILLS_CONFIG);
const SHOP_ITEMS_LIST = Object.values(SHOP_ITEMS_CONFIG);
const SKILLS_ALL = [...SKILLS_LIST, ...SHOP_ITEMS_LIST];

// All 6 Achievements (including the new Typography Master!)
const ACHIEVEMENTS = [
  { id: 'dedo_veloz',   icon: '⚡', name: 'Speed Demon',        desc: 'Reach 60 WPM.',                              target: 60,  unit: 'WPM' },
  { id: 'cirurgico',    icon: '🎯', name: 'Surgical',           desc: 'Complete any phase with 100% accuracy.',      target: 100, unit: '%' },
  { id: 'colecionador', icon: '📖', name: 'Collector',          desc: 'Unlock all words in the Library.',           target: 30,  unit: 'words' },
  { id: 'mestre_combo', icon: '🔥', name: 'Combo Master',       desc: 'Reach 30 consecutive correct keystrokes.',   target: 30,  unit: 'hits' },
  { id: 'modo_furia',   icon: '💥', name: 'Fury Mode',          desc: 'Activate Fury Mode with 15 hits in a row.',  target: 15,  unit: 'combo' },
  { id: 'mestre_tipo',  icon: '✍️', name: 'Typography Master',  desc: 'Complete 100 full words.',                   target: 100, unit: 'words' },
];

function wordPts(text) {
  return (text || '').length * 3;
}

