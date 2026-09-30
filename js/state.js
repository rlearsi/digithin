/* ================================================
   DIGITINHO — js/state.js
   State management and random generators
   ================================================ */
'use strict';

let state = {};

// ================================================
// DIFFICULTY PERSISTENCE & HELPERS
// ================================================
function getDifficulty() {
  try {
    const saved = localStorage.getItem('digitinho_difficulty');
    if (saved && (saved === 'easy' || saved === 'normal' || saved === 'hard')) {
      return saved;
    }
  } catch (_) {}
  return 'normal';
}

function getDifficultyConfig(diffKey) {
  const key = diffKey || (state && state.difficulty) || getDifficulty();
  return (typeof DIFFICULTY_CONFIG !== 'undefined' && DIFFICULTY_CONFIG[key])
    ? DIFFICULTY_CONFIG[key]
    : { id: 'normal', name: 'Médio', initialSpeed: 1.0, speedErrorPenalty: 0, progressErrorPenalty: 3, startLives: 3 };
}

function isMatchInProgress() {
  const sg = typeof screenGame !== 'undefined' ? screenGame : document.getElementById('screen-game');
  const mg = typeof modalGameover !== 'undefined' ? modalGameover : document.getElementById('modal-gameover');
  const isGameOver = !!(mg && !mg.classList.contains('hidden'));
  return !!(sg && sg.classList.contains('active') && !isGameOver);
}

function setDifficulty(diff) {
  if (isMatchInProgress()) {
    console.warn('[Digitinho] Cannot change difficulty during an active match.');
    return;
  }
  const valid = (diff === 'easy' || diff === 'hard') ? diff : 'normal';
  try {
    localStorage.setItem('digitinho_difficulty', valid);
  } catch (_) {}
  if (state) {
    const oldDiff = state.difficulty;
    state.difficulty = valid;
    const cfg = getDifficultyConfig(valid);
    if (state.gameMode === 'classic' || state.gameMode === 'timeattack') {
      const oldCfg = getDifficultyConfig(oldDiff);
      if (state.lives === (oldCfg?.startLives || 3)) {
        state.lives = cfg.startLives;
      }
      state.maxLives = cfg.startLives;
    }
  }
  if (typeof updateHUD === 'function') updateHUD();
  if (typeof updateSettingsUI === 'function') updateSettingsUI();
}

function changeDifficulty(diff) {
  if (isMatchInProgress()) {
    console.warn('[Digitinho] Cannot change difficulty during an active match.');
    return;
  }
  setDifficulty(diff);
}

function defaultState() {
  const diffKey = getDifficulty();
  const diffCfg = getDifficultyConfig(diffKey);
  return {
    difficulty:        diffKey,
    phase:             1,
    phasePts:          0,       // Points accumulated in the current phase
    totalScore:        0,       // Banked points from previous phases (used in shop)
    errorsPhase:       0,       // Errors made in the current phase
    totalErrors:       0,       // Total errors made in this run
    lives:             diffCfg.startLives,
    maxLives:          diffCfg.startLives,
    progress:          0,
    hitsPhase:         0,
    totalHits:         0,
    speedMultiplier:   diffCfg.initialSpeed,     // Resets to initial speed each phase
    typedBuffer:       '',
    activeItems:       [],
    spawnQueue:        [],
    spawnTimer:        null,
    rafId:             null,
    lastTs:            null,
    paused:            false,
    escPaused:         false,
    libPaused:         false,
    phaseComplete:     false,
    unlockedWords:     [],      // Words unlocked by player
    wordStats:         {},      // { [text]: { count: N } }
    skillSlots:        [],      // [{ id, count }] up to 4 distinct skill types
    activeTimers:      {},      // { freezer: ms, bomb: ms, shield: ms, vortex: ms, slowdown: ms, haste: ms }
    vortexAccum:       0,       // Tracks 2-second interval for vortex effect
    shopPurchaseCount: 0,
    currentShopPurchases: 0,
    selectedShopIndex: -1,
    currentShopItems:  [],
    idCounter:         0,
    combo:             0,       // Consecutive correct hits streak
    maxCombo:          0,       // Best streak in the match
    continues:         0,       // Available continues purchased from shop
    gameMode:          'classic', // 'classic' | 'zen' | 'timeattack' | 'training'
    timeAttackSecs:    60,
    trainingWorld:     1,       // 1 (Home Row), 2 (Top Row), 3 (Bottom Row), 4 (Accents & Punctuation)
    trainingLesson:    1,
    startTime:         null,    // Timestamp when phase/run started
    charsTyped:        0,       // Total characters correctly typed
    defeatedBossTypes: [],      // Boss types defeated during this run for randomized variety
    pendingBoss:       null,    // Randomly selected candidate boss for the upcoming boss phase
    pendingBossPhase:  null,    // Phase number for which pendingBoss was selected
    bossBattle: {
      active:          false,
      boss:            null,
      meanings:        [],
      meaningIndex:    0,
      currentWord:     null,
      boxItem:         null,
      damageCount:     0,
    },
  };
}

// Check if a phase is a Boss Battle (every 10 phases: 10, 20, 30, ...)
function isBossPhase(phase) {
  const p = parseInt(phase, 10) || 0;
  return p > 0 && p % 10 === 0;
}

// Random helpers
function rand(a, b)   { return Math.random() * (b - a) + a; }
function pick(arr)    { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function uid()        { return ++state.idCounter; }
function randLetter() { return 'ABCDEFGHIJKLMNOPRSTUVZ'[Math.floor(Math.random() * 22)]; }

// Format score with 10 digits (e.g. 0000098120)
function formatScore(val) {
  const num = Math.max(0, Math.floor(val || 0));
  return String(num).padStart(10, '0');
}

// High score persistence & tracking
function getHighScore() {
  try {
    const val = localStorage.getItem('digitinho_highscore');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (_) {
    return 0;
  }
}

function updateHighScore(score) {
  const currentBest = getHighScore();
  const numScore = Math.max(0, Math.floor(score || 0));
  const isNew = numScore > currentBest && numScore > 0;
  const best = isNew ? numScore : currentBest;
  if (isNew) {
    try {
      localStorage.setItem('digitinho_highscore', String(numScore));
    } catch (_) {}
  }
  return { best, isNew, previous: currentBest };
}

