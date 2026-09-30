/* ================================================
   DIGITINHO — game.js
   Core gameplay engine, input, loop, matching & flow
   ================================================ */
'use strict';

// ============================================================
// 1. GAME LIFECYCLE
// ============================================================
function startGame(mode = 'classic') {
  if (typeof isLocaleReady !== 'undefined' && !isLocaleReady) return;
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  state = defaultState();
  state.gameMode  = mode;
  state.startTime = Date.now();

  const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { startLives: 3, initialSpeed: 1.0 };
  if (mode === 'zen' || mode === 'training') {
    state.lives    = 999;
    state.maxLives = 999;
  } else {
    state.lives    = diffCfg.startLives;
    state.maxLives = diffCfg.startLives;
  }
  if (mode === 'timeattack') {
    state.timeAttackSecs = 60;
  }
  state.speedMultiplier = diffCfg.initialSpeed;
  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  hiddenInput.focus();
  refillQueue();
  updateHUD();
  beginPhase();
}

function startTrainingWorld(worldId = 1) {
  if (typeof isLocaleReady !== 'undefined' && !isLocaleReady) return;
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  state = defaultState();
  state.gameMode = 'training';
  state.trainingWorld = parseInt(worldId, 10) || 1;
  state.trainingLesson = 1;
  state.phase = 1;
  state.lives = 999;
  state.maxLives = 999;
  state.startTime = Date.now();
  state.spawnQueue = [];

  if (typeof closeTrainingModal === 'function') closeTrainingModal();

  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  hiddenInput.focus();
  refillQueue();
  updateHUD();
  beginPhase();

  const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[state.trainingWorld]) || { name: 'Mundo 1' };
  showFeedback(`${worldData.name} — Lição 1 de 3 (Teclas Base)`, 'special');
}

function restartGame() {
  modalGameover.classList.add('hidden');
  clearArea();
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);
  if (typeof hideBossHud === 'function') hideBossHud();
  if (state.bossBattle) state.bossBattle.active = false;
  if (state.gameMode === 'training') {
    startTrainingWorld(state.trainingWorld || 1);
  } else {
    startGame(state.gameMode || 'classic');
  }
}

function goToMainMenu() {
  if (typeof cancelResumeCountdown === 'function') cancelResumeCountdown();
  if (state.rafId) cancelAnimationFrame(state.rafId);
  if (state.spawnTimer) clearTimeout(state.spawnTimer);
  if (state.timeAttackTimerId) clearInterval(state.timeAttackTimerId);

  clearArea();
  state.paused = true;
  state.escPaused = false;
  state.phaseComplete = false;
  state.activeTimers = {};
  if (typeof hideBossHud === 'function') hideBossHud();
  if (state.bossBattle) state.bossBattle.active = false;

  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  if (typeof resetPauseView === 'function') resetPauseView();
  if (typeof closeSettings === 'function') closeSettings();
  if (typeof closeBiblioteca === 'function') closeBiblioteca();
  if (typeof closeConquistas === 'function') closeConquistas();
  if (typeof closeTrainingModal === 'function') closeTrainingModal();
  if (typeof cancelShopExitConfirm === 'function') cancelShopExitConfirm();

  const cdOverlay = $('countdown-overlay');
  if (cdOverlay) cdOverlay.classList.add('hidden');

  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));

  const screenGame = $('screen-game');
  const screenStart = $('screen-start');
  if (screenGame) screenGame.classList.remove('active');
  if (screenStart) screenStart.classList.add('active');

  if (hiddenInput && typeof hiddenInput.blur === 'function') {
    hiddenInput.blur();
  }

  if (typeof playSound === 'function') playSound('click');
}

function isPauseConfirmOpen() {
  const confirmView = $('pause-confirm-view');
  return confirmView && !confirmView.classList.contains('hidden');
}

function cancelExitConfirm() {
  const mainView = $('pause-main-view');
  const confirmView = $('pause-confirm-view');
  if (mainView && confirmView) {
    confirmView.classList.add('hidden');
    mainView.classList.remove('hidden');
    if (typeof playSound === 'function') playSound('click');
  }
}

function confirmGoToMainMenu() {
  const mainView = $('pause-main-view');
  const confirmView = $('pause-confirm-view');
  if (mainView && confirmView) {
    mainView.classList.add('hidden');
    confirmView.classList.remove('hidden');
    if (typeof playSound === 'function') playSound('click');
  } else {
    goToMainMenu();
  }
}

function executeExitToMainMenu() {
  cancelExitConfirm();
  goToMainMenu();
}

function isPhaseConfirmOpen() {
  const confirmView = $('phase-confirm-view');
  return confirmView && !confirmView.classList.contains('hidden');
}

function showPhaseExitConfirm() {
  const mainView = $('phase-main-view');
  const confirmView = $('phase-confirm-view');
  const box = $('modal-phase-box');
  if (mainView && confirmView) {
    mainView.classList.add('hidden');
    confirmView.classList.remove('hidden');
    if (box) box.classList.add('modal-box-confirm');
    if (typeof playSound === 'function') playSound('click');
  }
}

function cancelPhaseExitConfirm() {
  const mainView = $('phase-main-view');
  const confirmView = $('phase-confirm-view');
  const box = $('modal-phase-box');
  if (confirmView) confirmView.classList.add('hidden');
  if (mainView) mainView.classList.remove('hidden');
  if (box) box.classList.remove('modal-box-confirm');
}

function executePhaseExitToMainMenu() {
  cancelPhaseExitConfirm();
  if (state.gameMode === 'training') {
    exitTrainingToMenu();
  } else {
    exitPhaseToMainMenu();
  }
}

function getLearnedWords() {
  if (!state) return [];

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[currentLang])
    ? WORD_POOLS[currentLang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);

  const poolMap = new Map();
  activePool.forEach(w => {
    if (w && w.text) poolMap.set(w.text.toLowerCase(), w);
  });

  const learnedMap = new Map();

  // 1. Words that have been unlocked and completed / typed at least once
  if (Array.isArray(state.unlockedWords)) {
    state.unlockedWords.forEach(uw => {
      if (!uw || !uw.text) return;
      const key = uw.text.toLowerCase();
      const typedCount = state.wordStats?.[key]?.count || 0;
      if (typedCount > 0) {
        const localized = poolMap.get(key) || uw;
        if (localized && localized.meaning) {
          learnedMap.set(key, { ...localized, phase: uw.phase || state.phase });
        }
      }
    });
  }

  // 2. Also include any words in wordStats that exist in activePool
  if (state.wordStats) {
    Object.keys(state.wordStats).forEach(key => {
      if (learnedMap.has(key)) return;
      const count = state.wordStats[key]?.count || 0;
      if (count > 0 && poolMap.has(key)) {
        const localized = poolMap.get(key);
        if (localized && localized.meaning) {
          learnedMap.set(key, { ...localized, phase: state.phase });
        }
      }
    });
  }

  return Array.from(learnedMap.values());
}

const BOSS_THEME_INDICES = {
  robot:     [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  beast:     [0, 7, 15, 23, 26, 28],
  mythology: [14, 19, 20],
  ocean:     [10, 22, 29],
  cosmos:    [12, 13, 18],
  volcano:   [4, 8, 11, 21],
};

function getWordConceptIndex(text) {
  if (!text) return -1;
  const lower = text.toLowerCase();
  if (typeof WORD_POOLS !== 'undefined') {
    for (const lang in WORD_POOLS) {
      const pool = WORD_POOLS[lang];
      if (Array.isArray(pool)) {
        const idx = pool.findIndex(w => w && w.text && w.text.toLowerCase() === lower);
        if (idx !== -1) return idx;
      }
    }
  }
  return -1;
}

function isWordThematicallyRelatedToBoss(wordObj, bossType) {
  if (!wordObj || !bossType) return false;
  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const type = (wordObj.type || '').toLowerCase();
  const text = (wordObj.text || '').toLowerCase();

  // 1. Direct thematic vocabulary check from BOSS_WORDS_BY_TYPE scoped strictly to active language
  if (typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) {
    const langDicts = BOSS_WORDS_BY_TYPE[bossType];
    const list = langDicts[currentLang] || langDicts.pt || langDicts.en;
    if (Array.isArray(list) && list.some(item => item && item.text && item.text.toLowerCase() === text)) {
      return true;
    }
  }

  // 2. Strict semantic type and authentic keywords scoped strictly by boss theme
  switch (bossType) {
    case 'robot':
      return type === 'tech';
    case 'beast':
      return type === 'fauna' || type === 'animal' || type === 'tier';
    case 'mythology':
      return type === 'myth' || type === 'fantasia' || type === 'fantasie' || type === 'fantasy';
    case 'ocean':
      return type === 'ocean';
    case 'cosmos':
      return type === 'cosmos' || type === 'kosmos';
    case 'volcano':
      return type === 'volcano';
    default:
      return false;
  }
}

function canTriggerBossBattle() {
  if (state.gameMode === 'training' || state.gameMode === 'zen') return false;
  if (typeof isBossBattlesEnabled === 'function' && !isBossBattlesEnabled()) return false;
  // Regra 1: O boss deve continuar aparecendo em um múltiplo de 10 fases
  if (!isBossPhase(state.phase)) return false;

  const learnedWords = getLearnedWords();
  const defeated = state.defeatedBossTypes || [];

  // Filtra todos os chefões para os quais o jogador já aprendeu pelo menos 3 vocábulos
  const eligible = (typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS : []).filter(b => {
    const matching = learnedWords.filter(w => isWordThematicallyRelatedToBoss(w, b.type));
    return matching.length >= 3;
  });

  // Regra 2 & 3: Caso não haja palavras o suficiente para nenhum chefão, ignora o boss naquele loop (sem aviso)
  if (eligible.length === 0) {
    state.pendingBoss = null;
    state.pendingBossPhase = null;
    return false;
  }

  // Prioriza chefões ainda não enfrentados nesta partida para garantir variedade máxima
  const notDefeated = eligible.filter(b => !defeated.includes(b.type));
  const pool = notDefeated.length > 0 ? notDefeated : eligible;

  // Sorteia aleatoriamente um dos chefões qualificados!
  const chosenBase = pool[Math.floor(Math.random() * pool.length)];
  const level = Math.max(1, Math.floor(state.phase / 10));

  state.pendingBoss = {
    ...chosenBase,
    name: level > 1 ? `${chosenBase.name} (Lv. ${level})` : chosenBase.name,
    namePt: level > 1 ? `${chosenBase.namePt || chosenBase.name} (Nv. ${level})` : (chosenBase.namePt || chosenBase.name),
    lives: 3,
    maxLives: 3
  };
  state.pendingBossPhase = state.phase;

  return true;
}

function beginPhase() {
  // Check if current phase is a Boss Battle (every 10 phases) - requires at least 3 learned words of that boss
  if (canTriggerBossBattle()) {
    beginBossPhase();
    return;
  }

  if (typeof hideBossHud === 'function') hideBossHud();
  if (state.bossBattle) state.bossBattle.active = false;

  state.progress        = 0;
  state.hitsPhase       = 0;
  state.errorsPhase     = 0;
  state.phasePts        = 0;
  const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { initialSpeed: 1.0 };
  state.speedMultiplier = state.gameMode === 'training' ? (state.phase === 3 ? 1.1 : 1.0) : diffCfg.initialSpeed;
  state.combo           = 0;   // Reseta o combo a cada nova fase!
  state.phaseComplete   = false;
  state.paused          = false;
  state.typedBuffer     = '';
  state.spawnQueue      = [];

  clearArea();
  refillQueue();
  renderQueue();
  scheduleSpawn();
  state.lastTs = null;
  state.rafId  = requestAnimationFrame(gameLoop);
  updateHUD();
}

function checkPhaseComplete() {
  if (state.phaseComplete || state.paused || state.bossBattle?.active) return;
  if (state.progress >= phaseGoal()) {
    state.phaseComplete = true;
    state.paused        = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
    showPhaseModal();
  }
}

function clearGameBoard() {
  if (state.activeItems && Array.isArray(state.activeItems)) {
    state.activeItems.forEach(i => i.el?.parentNode?.removeChild(i.el));
    state.activeItems = [];
  }
  const leftoverTokens = gameArea?.querySelectorAll('.token, .boss-meaning-box');
  if (leftoverTokens) {
    leftoverTokens.forEach(el => el.parentNode?.removeChild(el));
  }
  state.spawnQueue = [];
  if (typeof renderQueue === 'function') renderQueue();
  state.typedBuffer = '';
  if (typeof clearHighlight === 'function') clearHighlight();
}

function showPhaseModal() {
  clearGameBoard();

  // Deduct error penalty at the end when banking phase points!
  const rawPts   = state.phasePts;
  const penalty  = state.errorsPhase;
  const finalPts = Math.max(0, rawPts - penalty);
  state.totalScore += finalPts;

  // Training Mode Didactic Summary
  if (state.gameMode === 'training') {
    const worldId = state.trainingWorld || 1;
    const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[worldId]) || { name: 'Treinamento', subtitle: '' };
    const lesson = state.phase || 1; // 1, 2 ou 3
    const errs = state.errorsPhase;
    const attempts = state.hitsPhase + errs;
    const acc = attempts > 0 ? ((state.hitsPhase / attempts) * 100).toFixed(1) : '100.0';
    const ppm = typeof calcPPM === 'function' ? calcPPM() : (state.currentWpm || 0);

    const btnBackTraining = $('btn-phase-back-training');
    if (btnBackTraining) {
      btnBackTraining.classList.remove('hidden');
      btnBackTraining.style.display = '';
    }

    // Lição 3 = FIM DO MUNDO DE TREINAMENTO!
    if (lesson >= 3) {
      const attempts = state.hitsPhase + errs;
      const lessonAcc = attempts > 0 ? ((state.hitsPhase / attempts) * 100).toFixed(1) : '100.0';
      const totalAttempts = (state.totalHits || 0) + (state.totalErrors || 0);
      const overallAcc = totalAttempts > 0 ? (((state.totalHits || 0) / totalAttempts) * 100).toFixed(1) : lessonAcc;
      const finalPrecNum = parseFloat(overallAcc);

      let isNewRecord = false;
      try {
        localStorage.setItem(`digitinho_training_world_${worldId}`, 'completed');
        const prevBestRaw = localStorage.getItem(`digitinho_training_precision_${worldId}`);
        if (prevBestRaw === null) {
          isNewRecord = true;
          localStorage.setItem(`digitinho_training_precision_${worldId}`, finalPrecNum.toFixed(1));
        } else {
          const prevBestNum = parseFloat(prevBestRaw);
          if (finalPrecNum > prevBestNum) {
            isNewRecord = true;
            localStorage.setItem(`digitinho_training_precision_${worldId}`, finalPrecNum.toFixed(1));
          }
        }
      } catch (_) {}

      const currentRecord = localStorage.getItem(`digitinho_training_precision_${worldId}`) || finalPrecNum.toFixed(1);

      $('phase-emoji').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`;
      $('modal-phase-h').textContent = `${worldData.name} — Maestria Concluída!`;

      const rankBadge = $('phase-rank-badge');
      if (rankBadge) {
        rankBadge.textContent = isNewRecord ? 'NOVO RECORDE!' : 'MUNDO DOMINADO';
        rankBadge.className = 'phase-rank-badge rank-s';
      }

      $('modal-phase-stats').innerHTML = `
        <div class="go-row"><span>Status do Treinamento</span><strong style="color:var(--accent-emerald)">100% Concluído (3/3 Lições)</strong></div>
        <div class="go-row"><span>Teclas Dominadas</span><strong style="color:var(--accent-amber)">${worldData.subtitle}</strong></div>
        <div class="go-row"><span>Precisão Desta Partida</span><strong style="color:${finalPrecNum >= 90 ? 'var(--accent-emerald)' : 'var(--accent-coral)'}">${finalPrecNum.toFixed(1)}%</strong></div>
        <div class="go-row"><span>Melhor Recorde (Precisão)</span><strong style="color:var(--accent-amber)">${currentRecord}% ${isNewRecord ? '(NOVO RECORDE!)' : ''}</strong></div>
        <div class="go-row"><span>Velocidade Real (PPM)</span><strong style="color:var(--accent-cyan)">${ppm} PPM</strong></div>
        <div class="go-row"><span>Acertos / Erros Totais</span><strong style="color:var(--t1)">${state.totalHits || state.hitsPhase} acertos / ${state.totalErrors || errs} erros</strong></div>
      `;

      $('section-words').style.display = 'none';

      const nextWorldId = worldId + 1;
      const hasNextWorld = typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[nextWorldId];
      const nextBtn = $('btn-next-phase') || document.querySelector('#modal-phase .btn-primary');
      if (nextBtn) {
        if (hasNextWorld) {
          nextBtn.textContent = `Avançar para o ${TRAINING_WORLDS[nextWorldId].name} →`;
        } else {
          nextBtn.textContent = `Concluir Todos os Treinos! →`;
        }
      }

      modalPhase.classList.remove('hidden');
      playSound('firework');
      launchConfetti();
      return;
    }

    // Lições 1 e 2
    const nextLesson = lesson + 1;
    const lessonTitle = lesson === 1 ? 'Lição 1: Reconhecimento de Teclas' : 'Lição 2: Alternância de Dedos';
    const nextLessonHint = lesson === 1
      ? 'Próximo objetivo: Combinar teclas em pequenas palavras e alternância entre as mãos.'
      : 'Próximo objetivo: Desafio final de fluidez e maestria com vocábulos completos!';

    $('phase-emoji').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    $('modal-phase-h').textContent = `${worldData.name} — ${lessonTitle} Concluída!`;

    let rank = 'PRECISÃO CIRÚRGICA';
    let rankCls = 'rank-s';
    if (acc === '100.0' && errs === 0) {
      unlockAchievement('cirurgico');
    } else if (acc >= 90) {
      rank = 'EXCELENTE FLUIDEZ';
      rankCls = 'rank-a';
    } else if (acc >= 75) {
      rank = 'BOM CONTROLE';
      rankCls = 'rank-b';
    } else {
      rank = 'PRATICAR MAIS';
      rankCls = 'rank-c';
    }

    const rankBadge = $('phase-rank-badge');
    if (rankBadge) {
      rankBadge.textContent = rank;
      rankBadge.className = `phase-rank-badge ${rankCls}`;
    }

    $('modal-phase-stats').innerHTML = `
      <div class="go-row"><span>Progresso do Mundo</span><strong style="color:var(--accent-amber)">Lição ${lesson} de 3 Concluída</strong></div>
      <div class="go-row"><span>Taxa de Precisão</span><strong style="color:${acc >= 90 ? 'var(--accent-emerald)' : 'var(--accent-coral)'}">${acc}%</strong></div>
      <div class="go-row"><span>Velocidade Real (PPM)</span><strong style="color:var(--accent-cyan)">${ppm} PPM</strong></div>
      <div class="go-row"><span>Acertos / Erros</span><strong style="color:var(--t1)">${state.hitsPhase} acertos / ${errs} erros</strong></div>
      <div class="go-row"><span style="color:var(--t3);font-size:0.75rem">${nextLessonHint}</span></div>
    `;

    $('section-words').style.display = 'none';

    const nextBtn = $('btn-next-phase') || document.querySelector('#modal-phase .btn-primary');
    if (nextBtn) {
      nextBtn.textContent = `Avançar para Lição ${nextLesson} (${nextLesson === 2 ? '15' : '20'} rúnicos) →`;
    }

    modalPhase.classList.remove('hidden');
    playSound('firework');
    launchConfetti();
    return;
  }

  // Classic Mode: hide training back button completely
  const btnBackTraining = $('btn-phase-back-training');
  if (btnBackTraining) {
    btnBackTraining.classList.add('hidden');
    btnBackTraining.style.display = 'none';
  }
  const nextBtn = $('btn-next-phase') || document.querySelector('#modal-phase .btn-primary');
  if (nextBtn) {
    const span = nextBtn.querySelector('span') || nextBtn;
    span.textContent = typeof t === 'function' ? t('modal_btn_next_phase') : 'Próxima Fase →';
  }

  // Performance Rank: S, A, B, C
  const errs     = state.errorsPhase;
  const attempts = state.hitsPhase + errs;
  const acc      = attempts > 0 ? (state.hitsPhase / attempts) * 100 : 100;
  let rank = 'RANK C';
  let rankCls = 'rank-c';
  if (errs === 0 && acc === 100) {
    rank = 'RANK S';
    rankCls = 'rank-s';
    unlockAchievement('cirurgico');
  } else if (acc >= 90 && errs <= 2) {
    rank = 'RANK A';
    rankCls = 'rank-a';
  } else if (acc >= 75) {
    rank = 'RANK B';
    rankCls = 'rank-b';
  }

  const rankBadge = $('phase-rank-badge');
  if (rankBadge) {
    rankBadge.textContent = rank;
    rankBadge.className = `phase-rank-badge ${rankCls}`;
  }

  // Phase emoji: target (ph1), flame (ph2-3), bolt (ph4+)
  const phaseEmojiEl = $('phase-emoji');
  if (phaseEmojiEl) {
    if (state.phase === 1) {
      phaseEmojiEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`;
    } else if (state.phase <= 3) {
      phaseEmojiEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    } else {
      phaseEmojiEl.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    }
  }
  $('modal-phase-h').textContent  = `Fase ${state.phase} Completa!`;
  $('modal-phase-stats').innerHTML = `
    <div class="go-row"><span>Pontos Conquistados na Fase</span><strong style="color:var(--t1)">+${rawPts}</strong></div>
    <div class="go-row"><span>Erros (penalidade)</span><strong style="color:var(--accent-coral)">−${penalty}</strong></div>
    <div class="go-row"><span>Soma Adicionada</span><strong style="color:var(--accent-emerald)">+${finalPts}</strong></div>
    <div class="go-row"><span>Pontuação Total</span><strong style="color:var(--accent-cyan);font-variant-numeric:tabular-nums;letter-spacing:0.04em">${formatScore(state.totalScore)}</strong></div>
  `;

  // Unlock 3 new random words
  const pool     = WORD_POOL.filter(w => !state.unlockedWords.find(u => u.text === w.text));
  const toUnlock = shuffle(pool).slice(0, CFG.wordsPerPhase);
  toUnlock.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));

  if (state.unlockedWords.length >= WORD_POOL.length) {
    unlockAchievement('colecionador');
  }

  const row = $('unlocked-words-row');
  row.innerHTML = '';
  if (toUnlock.length > 0) {
    $('section-words').style.display = 'block';
    toUnlock.forEach(w => {
      const p = document.createElement('div');
      p.className = 'unlocked-pill';
      p.innerHTML = `${w.text.toUpperCase()}<small>+${wordPts(w.text)}pts</small>`;
      row.appendChild(p);
    });
  } else {
    $('section-words').style.display = 'none';
  }

  if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
  modalPhase.classList.remove('hidden');
  playSound('firework');
  launchConfetti();
}

function continueToNextPhase() {
  stopConfetti();
  if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
  modalPhase.classList.add('hidden');
  state.phaseComplete = false;
  const completedPhase = state.phase;

  if (state.gameMode === 'training') {
    // Se completou a Lição 3 (Fim do Mundo):
    if (completedPhase >= 3) {
      const nextWorldId = (state.trainingWorld || 1) + 1;
      if (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[nextWorldId]) {
        startTrainingWorld(nextWorldId);
      } else {
        goToMainMenu();
        openTrainingModal();
        showFeedback('Parabéns! Você concluiu todos os mundos de treino!', 'special');
      }
      return;
    }

    // Avança para a próxima lição (2 ou 3)
    state.phase++;
    state.trainingLesson = state.phase;
    beginPhase();
    return;
  }

  state.phase++;
  // A 1ª loja aparece após a fase 5. Depois, de 3 em 3 fases (5, 8, 11, 14…)
  const isShopPhase = completedPhase === 5 || (completedPhase > 5 && (completedPhase - 5) % 3 === 0);
  if (isShopPhase) {
    showShop();
  } else {
    beginPhase();
  }
}

function exitPhaseToMainMenu() {
  stopConfetti();
  if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
  if (modalPhase) modalPhase.classList.add('hidden');
  goToMainMenu();
}

function exitTrainingToMenu() {
  stopConfetti();
  if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
  if (modalPhase) modalPhase.classList.add('hidden');
  goToMainMenu();
  openTrainingModal();
}

function loseLife() {
  // Shield immunity protects lives
  if ((state.activeTimers?.shield || 0) > 0) {
    playSound('skill');
    const msg = typeof t === 'function' ? t('fb_shield_blocked') : '🛡️ Dano bloqueado pela Imunidade!';
    showFeedback(msg, 'special');
    return;
  }

  // Training Mode: No life loss! Only accuracy and PPM reduction
  if (state.gameMode === 'training') {
    state.errorsPhase++;
    state.totalErrors++;
    state.combo = 0;
    playSound('fall');
    showFeedback('⚠️ Rúnico caiu (- precisão)', 'error');
    updateHUD();
    return;
  }

  // Zen Mode: No life loss (silent and clean, info is permanently displayed on HUD)
  if (state.gameMode === 'zen') {
    playSound('fall');
    state.combo = 0;
    updateHUD();
    return;
  }

  // Combo breaks on life loss
  if (state.combo > 0) {
    state.combo = 0;
    showFeedback('Combo quebrado!', 'error');
  }

  state.lives--;
  playSound('life');
  showFeedback('💔 Rúnico caiu!', 'error');

  // Flash border
  document.body.style.animation = 'screenShake .28s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 300);

  updateHUD();

  if (state.lives <= 0) {
    gameOver();
  }
}

function gameOver() {
  state.paused = true;
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);

  // Close any open overlays or settings dialogs so they never bleed into Game Over
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  const modalLib = $('modal-biblioteca');
  if (modalLib) modalLib.classList.add('hidden');
  const modalConquistas = $('modal-conquistas');
  if (modalConquistas) modalConquistas.classList.add('hidden');
  const modalTraining = $('modal-training');
  if (modalTraining) modalTraining.classList.add('hidden');

  // Populate modern game over arcade dashboard
  const currentScore = state.totalScore || 0;
  const recordResult = typeof updateHighScore === 'function' ? updateHighScore(currentScore) : { best: currentScore, isNew: false };

  $('go-score').textContent  = formatScore(currentScore);
  const bestScoreEl = $('go-best-score');
  if (bestScoreEl) {
    bestScoreEl.textContent = formatScore(recordResult.best);
  }
  const newRecordTag = $('go-new-record-tag');
  if (newRecordTag) {
    newRecordTag.classList.toggle('hidden', !recordResult.isNew);
  }
  $('go-hits').textContent   = state.totalHits;
  $('go-errors').textContent = state.totalErrors;
  $('go-phase').textContent  = state.phase;
  $('go-words').textContent  = `${state.unlockedWords.length} / ${WORD_POOL.length}`;

  const btnContinue = $('btn-go-continue');
  const countEl     = $('go-continue-count');
  if (btnContinue && countEl) {
    if (state.continues > 0) {
      countEl.textContent = state.continues;
      btnContinue.classList.remove('hidden');
    } else {
      btnContinue.classList.add('hidden');
    }
  }

  modalGameover.classList.remove('hidden');
}

function useContinue() {
  if (state.continues <= 0) return;
  state.continues--;
  playSound('continue');
  const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { startLives: 3, initialSpeed: 1.0 };
  state.lives           = diffCfg.startLives;
  state.progress        = 0;
  state.speedMultiplier = diffCfg.initialSpeed;
  state.activeItems.forEach(i => i.el?.parentNode?.removeChild(i.el));
  state.activeItems     = [];
  modalGameover.classList.add('hidden');
  showFeedback('🪙 Continue usado! Continuando fase...', 'special');
  beginPhase();
}

// ============================================================
// 2. PAUSE / RESUME (ESC) WITH "3, 2, 1" COUNTDOWN
// ============================================================
function pauseGame() {
  const screenGame = $('screen-game');
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;
  if (modalGameover && !modalGameover.classList.contains('hidden')) return;

  const pauseOverlay = $('pause-overlay');

  if (typeof countdownActive !== 'undefined' && countdownActive) {
    cancelResumeCountdown();
    state.escPaused = true;
    state.paused    = true;
    if (typeof resetPauseView === 'function') resetPauseView();
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
    return;
  }

  if (state.paused) return;

  state.escPaused = true;
  state.paused    = true;
  if (typeof resetPauseView === 'function') resetPauseView();
  if (pauseOverlay) pauseOverlay.classList.remove('hidden');
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);
}

function resumeGame() {
  const screenGame = $('screen-game');
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;

  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  state.escPaused = false;

  // Run 3, 2, 1 countdown before resuming gameplay!
  runResumeCountdown(() => {
    state.paused = false;
    state.lastTs = null;
    state.rafId  = requestAnimationFrame(gameLoop);
    if (!state.bossBattle || !state.bossBattle.active) {
      scheduleSpawn();
    } else {
      if (state.activeItems.length === 0 && !state.bossBattle.boxItem && (state.bossBattle.boss?.lives || 0) > 0) {
        spawnBossMeaningBox();
      }
    }
    hiddenInput?.focus();
  });
}

function togglePause() {
  // If exit confirmation view is open inside pause, ESC cancels it back to main pause options
  if (isPauseConfirmOpen()) {
    cancelExitConfirm();
    return;
  }

  // If inside the settings view or modal, ESC navigates back / closes it
  if (typeof isSettingsOpen === 'function' && isSettingsOpen()) {
    closeSettings();
    return;
  }
  if (typeof isPauseSettingsOpen === 'function' && isPauseSettingsOpen()) {
    closePauseSettings();
    return;
  }

  // Check other modals that might be open
  const modalTraining = $('modal-training');
  if (modalTraining && !modalTraining.classList.contains('hidden')) {
    if (typeof closeTrainingModal === 'function') closeTrainingModal();
    return;
  }
  const modalLib = $('modal-biblioteca');
  if (modalLib && !modalLib.classList.contains('hidden')) {
    if (typeof closeBiblioteca === 'function') closeBiblioteca();
    return;
  }
  const modalConquistas = $('modal-conquistas');
  if (modalConquistas && !modalConquistas.classList.contains('hidden')) {
    if (typeof closeConquistas === 'function') closeConquistas();
    return;
  }
  const modalPhaseEl = $('modal-phase');
  if (modalPhaseEl && !modalPhaseEl.classList.contains('hidden')) {
    if (typeof isPhaseConfirmOpen === 'function' && isPhaseConfirmOpen()) {
      if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
    } else if (typeof showPhaseExitConfirm === 'function') {
      showPhaseExitConfirm();
    }
    return;
  }
  const modalShopEl = $('modal-shop');
  if (modalShopEl && !modalShopEl.classList.contains('hidden')) {
    if (typeof isShopConfirmOpen === 'function' && isShopConfirmOpen()) {
      if (typeof cancelShopExitConfirm === 'function') cancelShopExitConfirm();
    } else if (typeof showShopExitConfirm === 'function') {
      showShopExitConfirm();
    }
    return;
  }

  // Only toggle pause during active gameplay screen
  if (!screenGame?.classList.contains('active')) return;
  if (state.phaseComplete) return;

  if (typeof countdownActive !== 'undefined' && countdownActive) {
    pauseGame();
    return;
  }

  if (state.escPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

// ============================================================
// 3. SPAWNING & QUEUE
// ============================================================
function decideSpawnType() {
  const p = state.phase;
  // Requirement 7: Early phases are fast — NO complete words in phase 1 and 2!
  if (p === 1) {
    return 'letter'; // Phase 1: fast single letters
  }
  if (p === 2) {
    return Math.random() < 0.5 ? 'syllable' : 'letter'; // Phase 2: snappy 1-2 char letters/syllables
  }

  // Phase 3+: full words unlocked, syllables, and letters
  const wordW = Math.min(0.48, 0.20 + (p - 3) * 0.05);
  const sylW  = Math.min(0.38, 0.25 + (p - 3) * 0.02);
  const r = Math.random();
  if (r < wordW && state.unlockedWords.length > 0) return 'word';
  if (r < wordW + sylW) return 'syllable';
  return 'letter';
}

function genQueueItem() {
  // Training Mode: didactic queue using strictly the active world's key progression
  if (state.gameMode === 'training') {
    const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[state.trainingWorld]) || TRAINING_WORLDS[1];
    const chars = worldData?.chars || ['A', 'S', 'D', 'F'];
    const words = worldData?.words || [];

    // Lição 1: 100% teclas isoladas da linha para fixação de posição e memória muscular
    if (state.phase === 1 || words.length === 0) {
      return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
    }
    // Lição 2: 50% letras, 50% palavras/sílabas curtas da linha (treino de alternância)
    if (state.phase === 2) {
      if (Math.random() < 0.50) {
        return { text: pick(words).toUpperCase(), type: 'word', skill: null };
      }
      return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
    }
    // Lição 3 (Desafio Final): 80% palavras da linha, 20% letras para consolidação de fluidez
    if (Math.random() < 0.80) {
      return { text: pick(words).toUpperCase(), type: 'word', skill: null };
    }
    return { text: pick(chars).toUpperCase(), type: 'letter', skill: null };
  }

  const type = decideSpawnType();
  let text, skill = null;

  if (type === 'letter') {
    text = randLetter();
  } else if (type === 'syllable') {
    text = pick(ALL_SYLLABLES).toUpperCase();
  } else {
    // Phase 3+ only: Wildcard words & regular words
    if (state.phase >= 3 && state.unlockedWords.length >= 3 && Math.random() < CFG.wildcardChance) {
      return { text: pick(WILDCARD_WORDS), type: 'wildcard', skill: null };
    }
    if (state.unlockedWords.length === 0) {
      text = randLetter();
      return { text, type: 'letter', skill: null };
    }
    text = pick(state.unlockedWords).text.toUpperCase();
    // Rare chance to contain skill
    if (Math.random() < CFG.wordSkillChance) {
      const avail = SKILLS_ALL.filter(s => !s.isItem && s.id !== 'extralife');
      if (avail.length > 0) skill = pick(avail);
    }
  }
  return { text, type, skill };
}

function refillQueue() {
  while (state.spawnQueue.length < CFG.queueSize) {
    state.spawnQueue.push(genQueueItem());
  }
}

function scheduleSpawn() {
  if (state.paused || state.phaseComplete || (state.bossBattle && state.bossBattle.active)) return;
  let multVal  = state.speedMultiplier || 1.0;
  if ((state.activeTimers?.haste || 0) > 0) {
    multVal += (typeof CFG !== 'undefined' && CFG.hasteSpeedBonus) ? CFG.hasteSpeedBonus : 0.5;
  }
  if ((state.activeTimers?.slowdown || 0) > 0) {
    multVal *= 0.4;
  }
  let base       = Math.max(CFG.spawnMin, CFG.spawnBase / multVal);
  if ((state.activeTimers?.dilation || 0) > 0) {
    base *= 1.8; // Dilates spacing between runics
  }
  const interval = base + (Math.random() - 0.5) * CFG.spawnVariance;
  state.spawnTimer = setTimeout(() => {
    if (!state.paused && !state.phaseComplete && (!state.bossBattle || !state.bossBattle.active)) {
      spawnItem();
      scheduleSpawn();
    }
  }, Math.max(450, interval));
}

function spawnItem() {
  if (state.bossBattle && state.bossBattle.active) return false;
  const isFrozen = (state.activeTimers?.freezer || 0) > 0;
  if (isFrozen) {
    const activeCount = state.activeItems.filter(i => !i.removing).length;
    const maxFrozen = (typeof CFG !== 'undefined' && CFG.freezerMaxItems) ? CFG.freezerMaxItems : 3;
    if (activeCount >= maxFrozen) {
      return false;
    }
  }

  refillQueue();
  const next = state.spawnQueue.shift();
  refillQueue();
  renderQueue();

  const boardW = gameArea.clientWidth || 420;
  const el     = document.createElement('div');

  let cls = `falling-item ${next.type}`;
  if (next.skill) cls += ' has-skill';
  el.className   = cls;
  el.textContent = next.text;

  // Attached badges
  if (next.skill) {
    const b = document.createElement('div');
    b.className   = 'skill-badge';
    b.textContent = '⚡';
    b.title       = next.skill.name;
    el.appendChild(b);
  }
  if (next.type === 'wildcard') {
    const b = document.createElement('div');
    b.className   = 'wildcard-badge';
    b.textContent = '💥';
    el.appendChild(b);
  }

  // Freezer status
  if (state.activeTimers.freezer > 0) {
    el.classList.add('frozen');
  }

  // Freezer / visibility fix: items spawn directly visible at y = 0
  const initialY = 0;
  el.style.top  = initialY + 'px';
  el.style.left = '0px';
  gameArea.appendChild(el);

  // Position horizontally within padding
  const itemW = el.offsetWidth || 60;
  const minX  = CFG.padX;
  const maxX  = Math.max(minX, boardW - itemW - CFG.padX);
  let posX    = rand(minX, maxX);

  // Evita sobreposição horizontal com itens próximos ao topo (ex.: congelados em y = 0)
  const nearTopItems = state.activeItems.filter(i => !i.removing && i.y < 50);
  if (nearTopItems.length > 0) {
    let bestX = posX;
    let bestMinDist = -1;
    for (let attempt = 0; attempt < 12; attempt++) {
      const candidateX = rand(minX, maxX);
      let minDist = Infinity;
      for (const other of nearTopItems) {
        const d = Math.abs(candidateX - other.x);
        if (d < minDist) minDist = d;
      }
      if (minDist >= itemW + 12) {
        bestX = candidateX;
        break;
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestX = candidateX;
      }
    }
    posX = bestX;
  }

  el.style.left = posX + 'px';

  const itemObj = {
    id:        uid(),
    el,
    text:      next.text,
    type:      next.type,
    skill:     next.skill,
    y:         initialY,
    x:         posX,
    baseSpeed: CFG.baseSpeed + (Math.random() - 0.5) * 4,
    removing:  false,
  };

  state.activeItems.push(itemObj);
  return true;
}

// ============================================================
// 4. GAME LOOP
// ============================================================
function gameLoop(ts) {
  if (state.paused || state.phaseComplete) return;

  if (!state.lastTs) state.lastTs = ts;
  const dt = Math.min((ts - state.lastTs) / 1000, 0.1);
  state.lastTs = ts;

  // Tick active skill timers
  let timersChanged = false;
  for (const skillId in state.activeTimers) {
    if (state.activeTimers[skillId] > 0) {
      state.activeTimers[skillId] -= dt * 1000;
      timersChanged = true;
      if (state.activeTimers[skillId] <= 0) {
        state.activeTimers[skillId] = 0;
        onSkillExpired(skillId);
      }
    }
  }

  // Vortex skill: devours 1 non-targeted token every 2 seconds
  if ((state.activeTimers?.vortex || 0) > 0) {
    state.vortexAccum = (state.vortexAccum || 0) + dt;
    if (state.vortexAccum >= 2.0) {
      state.vortexAccum -= 2.0;
      triggerVortexDevour();
    }
  }

  // Speedlock active: clamp speedMultiplier to 1.0
  if ((state.activeTimers?.speedlock || 0) > 0) {
    state.speedMultiplier = 1.0;
  }

  // Time Attack mode timer countdown
  if (state.gameMode === 'timeattack') {
    state.timeAttackAccum = (state.timeAttackAccum || 0) + dt;
    if (state.timeAttackAccum >= 1.0) {
      state.timeAttackAccum -= 1.0;
      state.timeAttackSecs = Math.max(0, (state.timeAttackSecs || 60) - 1);
      updateHUD();
      if (state.timeAttackSecs <= 0) {
        gameOver();
        showFeedback('⏱️ Tempo Esgotado!', 'special');
        return;
      }
    }
  }

  if (timersChanged) renderSkills();

  // Multipliers & effective speed
  const isFrozen = (state.activeTimers.freezer || 0) > 0;
  let effectiveSpeed = state.speedMultiplier || 1.0;
  if (state.bossBattle && state.bossBattle.active) {
    // Regra 1: Velocidade padrão dos significados que caem nos chefões é 0.5x para qualquer dificuldade.
    // Mesmo que o jogador erre, a velocidade é fixa em 0.5x.
    state.speedMultiplier = 0.5;
    effectiveSpeed = 0.5;
  } else {
    if ((state.activeTimers.haste || 0) > 0) {
      effectiveSpeed += (typeof CFG !== 'undefined' && CFG.hasteSpeedBonus) ? CFG.hasteSpeedBonus : 0.5;
    }
    if ((state.activeTimers.slowdown || 0) > 0) {
      effectiveSpeed *= 0.4;
    }
  }

  // Freezer auto-cancel check
  checkFreezerAutoCancel();

  const boardH = gameArea.clientHeight || 500;
  const items  = state.activeItems;

  // Boss Battle safety: strictly no loose runics or words during boss confrontations
  if (state.bossBattle && state.bossBattle.active) {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].isBossMeaning) {
        items[i].el?.parentNode?.removeChild(items[i].el);
        items.splice(i, 1);
      }
    }
  }

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.removing) continue;

    // Movement
    if (!isFrozen) {
      const spd = item.baseSpeed || CFG.baseSpeed;
      item.y += spd * effectiveSpeed * dt;
      item.el.style.top = item.y + 'px';
    }

    // Danger cue near bottom
    const h = item.el.offsetHeight || 36;
    if (item.y + h >= boardH - 90) {
      item.el.classList.add('danger');
    } else {
      item.el.classList.remove('danger');
    }

    // Fall out of board
    if (item.y >= boardH - 24) {
      item.removing = true;
      item.el.classList.add('destroying');
      playSound('fall');
      loseLife();

      if (item.isBossMeaning) {
        showFeedback('💥 O enigma caiu! O Chefão atacou!', 'error');
        if (typeof flashBossDamage === 'function') flashBossDamage();
        // Regra 2: Salva o significado que caiu para não repeti-lo imediatamente no próximo sorteio
        if (state.bossBattle?.currentWord) {
          state.bossBattle.lastDroppedWord = state.bossBattle.currentWord.text.toLowerCase();
        }
        state.typedBuffer = '';
        state.speedMultiplier = 0.5; // Garante velocidade fixa
        setTimeout(() => {
          item.el?.parentNode?.removeChild(item.el);
          if (state.bossBattle?.active && !state.paused && state.lives > 0) {
            spawnBossMeaningBox();
          }
        }, 280);
      } else {
        setTimeout(() => item.el?.parentNode?.removeChild(item.el), 260);
      }

      items.splice(i, 1);
    }
  }

  state.rafId = requestAnimationFrame(gameLoop);
}

function checkFreezerAutoCancel() {
  if (state.activeTimers.freezer > 0 && state.activeItems.length === 0 && !state.bossBattle?.active) {
    state.activeTimers.freezer = 0;
    state.skillSlots = state.skillSlots.filter(s => !(s.id === 'freezer' && s.count <= 0));
    showFeedback('❄️ Tela limpa — gelo desligado!', 'special');
    updateHUD();
  }
}

function onSkillExpired(skillId) {
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);

  // Centralized onExpire callback
  if (def && typeof def.onExpire === 'function') {
    def.onExpire(state);
  }

  // Localized feedback
  const expireMsgKey = `fb_${skillId}_expired`;
  const msg = (typeof t === 'function' && t(expireMsgKey) !== expireMsgKey)
    ? t(expireMsgKey)
    : (def?.expireMsg || `${def?.name || skillId} expirou`);

  showFeedback(msg, 'special');

  // Remove skill slot from state.skillSlots only when duration has expired and count is 0
  state.skillSlots = state.skillSlots.filter(s => !(s.id === skillId && s.count <= 0));

  updateHUD();
}

// ============================================================
// 5. INPUT HANDLING
// ============================================================
document.addEventListener('keydown', e => {
  // If Rules modal is open, ESC closes it
  const modalRulesEl = $('modal-rules');
  if (modalRulesEl && !modalRulesEl.classList.contains('hidden')) {
    if (e.key === 'Escape' || e.code === 'Escape') {
      e.preventDefault();
      closeRulesModal();
      return;
    }
  }

  // If Start Screen is active, pressing Enter starts Classic match
  const screenStartEl = $('screen-start');
  if (screenStartEl && screenStartEl.classList.contains('active')) {
    const isAnyModalOpen = document.querySelector('.modal:not(.hidden)');
    if (!isAnyModalOpen && (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter')) {
      e.preventDefault();
      startGame('classic');
      return;
    }
  }

  // If Phase Complete modal is open, Enter advances to next phase and ESC asks confirmation
  const modalPhaseEl = $('modal-phase');
  const isPhaseModalOpen = modalPhaseEl && !modalPhaseEl.classList.contains('hidden');
  if (isPhaseModalOpen) {
    const isConfirmOpen = (typeof isPhaseConfirmOpen === 'function') && isPhaseConfirmOpen();
    if (isConfirmOpen) {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        if (typeof cancelPhaseExitConfirm === 'function') cancelPhaseExitConfirm();
        return;
      }
      if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        if (typeof executePhaseExitToMainMenu === 'function') executePhaseExitToMainMenu();
        return;
      }
      return;
    }

    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      continueToNextPhase();
      return;
    }
    if (e.key === 'Escape' || e.code === 'Escape') {
      e.preventDefault();
      if (typeof showPhaseExitConfirm === 'function') showPhaseExitConfirm();
      return;
    }
    return;
  }

  // If Shop modal is open, handle keyboard navigation, buy/close, or ESC confirmation
  const modalShopEl = $('modal-shop');
  const isShopModalOpen = (typeof isShopOpen === 'function') ? isShopOpen() : (modalShopEl && !modalShopEl.classList.contains('hidden'));
  if (isShopModalOpen) {
    const isConfirmOpen = (typeof isShopConfirmOpen === 'function') && isShopConfirmOpen();
    if (isConfirmOpen) {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        if (typeof cancelShopExitConfirm === 'function') cancelShopExitConfirm();
        return;
      }
      if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        if (typeof confirmShopExit === 'function') confirmShopExit();
        return;
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (typeof navigateShop === 'function') navigateShop('down');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (typeof navigateShop === 'function') navigateShop('up');
      return;
    }

    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      if (state.selectedShopIndex !== undefined && state.selectedShopIndex >= 0) {
        if (typeof buySelectedShopItem === 'function') buySelectedShopItem();
      } else {
        if (typeof closeShop === 'function') closeShop();
      }
      return;
    }

    if (e.key === 'Escape' || e.code === 'Escape') {
      e.preventDefault();
      if (state.selectedShopIndex !== undefined && state.selectedShopIndex >= 0) {
        state.selectedShopIndex = -1;
        if (typeof updateShopSelectionVisual === 'function') updateShopSelectionVisual();
      } else {
        if (typeof showShopExitConfirm === 'function') showShopExitConfirm();
      }
      return;
    }

    // Intercept ANY other key while shop is open to prevent background typing or accidental interactions
    e.preventDefault();
    return;
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    togglePause();
    return;
  }

  if (state.paused || state.phaseComplete) return;

  // Number keys 1–8 activate respective skill slot
  if (/^[1-8]$/.test(e.key)) {
    const idx = parseInt(e.key, 10) - 1;
    if (state.skillSlots[idx]) {
      e.preventDefault();
      const pills = document.querySelectorAll('.skill-pill');
      if (pills[idx]) {
        const kb = pills[idx].querySelector('.sp-key-badge');
        if (kb) {
          kb.classList.add('sp-key-pressed');
          setTimeout(() => kb.classList.remove('sp-key-pressed'), 160);
        }
      }
      activateSkill(idx);
      return;
    }
  }

  // Backspace clears buffer (or last char during boss battle)
  if (e.key === 'Backspace') {
    e.preventDefault();
    if (state.bossBattle && state.bossBattle.active) {
      if (state.typedBuffer.length > 0) {
        state.typedBuffer = state.typedBuffer.slice(0, -1);
        if (state.bossBattle.boxItem?.el && state.bossBattle.currentWord) {
          renderBossMeaningSlots(state.bossBattle.boxItem.el, state.bossBattle.currentWord.text.toUpperCase(), state.typedBuffer);
        }
      }
      return;
    }
    state.typedBuffer = '';
    clearHighlight();
    return;
  }

  // Letters, accented characters and punctuation (used in Training Mode)
  if (!/^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ?!,.:;]$/.test(e.key)) return;
  e.preventDefault();

  handleLetterTyped(e.key.toUpperCase());
});

gameArea?.addEventListener('click', () => hiddenInput?.focus());
gameArea?.addEventListener('touchstart', () => {
  if (hiddenInput && document.activeElement !== hiddenInput) {
    hiddenInput.focus();
  }
}, { passive: true });

hiddenInput?.addEventListener('input', () => {
  if (state.paused || state.phaseComplete || (typeof isShopOpen === 'function' && isShopOpen())) {
    hiddenInput.value = '';
    return;
  }
  const val = hiddenInput.value;
  if (val) {
    const char = val.slice(-1).toUpperCase();
    if (/^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ?!,.:;]$/.test(char)) {
      handleLetterTyped(char);
    }
    hiddenInput.value = '';
  }
});

// Auto-pause when browser tab is minimized / hidden or window loses focus (inactive)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseGame();
  }
});

window.addEventListener('blur', () => {
  pauseGame();
});

// ============================================================
// 6. MATCHING & COMPLETION
// ============================================================
function handleLetterTyped(char) {
  if (state.paused || state.phaseComplete || (typeof isShopOpen === 'function' && isShopOpen())) {
    state.typedBuffer = '';
    return;
  }
  // Boss Battle dedicated typing logic
  if (state.bossBattle && state.bossBattle.active) {
    handleBossLetterTyped(char);
    return;
  }

  // Trava de proteção: Não pune o jogador se o campo/tabuleiro estiver sem rúnicos ativos!
  const activeTokens = state.activeItems.filter(item => !item.removing);
  if (activeTokens.length === 0) {
    state.typedBuffer = '';
    return;
  }

  const nextBuf = state.typedBuffer + char;

  const matching = activeTokens.filter(item =>
    item.text.startsWith(nextBuf)
  );

  if (matching.length > 0) {
    state.typedBuffer = nextBuf;
    state.hitsPhase++;
    state.totalHits++;
    state.charsTyped = (state.charsTyped || 0) + 1;
    if (typeof playMechanicalClick === 'function') playMechanicalClick(state.typedBuffer.length);

    const target = matching.reduce((lowest, item) => item.y > lowest.y ? item : lowest);

    if (target.text === state.typedBuffer) {
      completeItem(target);
      state.typedBuffer = '';
      clearHighlight();
    } else {
      playSound('hit');
      highlightBuffer();
    }
  } else {
    // Check if char starts another item
    const newMatching = activeTokens.filter(item =>
      item.text.startsWith(char)
    );

    if (newMatching.length > 0) {
      state.typedBuffer = char;
      state.hitsPhase++;
      state.totalHits++;
      state.charsTyped = (state.charsTyped || 0) + 1;
      if (typeof playMechanicalClick === 'function') playMechanicalClick(1);

      const target = newMatching.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
      if (target.text === char) {
        completeItem(target);
        state.typedBuffer = '';
        clearHighlight();
      } else {
        playSound('hit');
        highlightBuffer();
      }
    } else {
      // Check if Shield protects against error penalty
      if ((state.activeTimers?.shield || 0) > 0) {
        state.typedBuffer = '';
        clearHighlight();
        playSound('skill');
        const msg = typeof t === 'function' ? t('fb_shield_error_protected') : '🛡️ Erro protegido!';
        showFeedback(msg, 'special');
        return;
      }

      // Combo breaks on error
      if (state.combo > 0) {
        state.combo = 0;
        showFeedback('Combo quebrado!', 'error');
      }

      // Typo: -1 penalty at phase end + progress bar deduction (only in classic mode)
      state.errorsPhase++;
      state.totalErrors++;
      const diffCfg = typeof getDifficultyConfig === 'function' ? getDifficultyConfig() : { speedErrorPenalty: 0, progressErrorPenalty: 3 };
      if (state.gameMode !== 'training' && diffCfg.progressErrorPenalty > 0) {
        state.progress = Math.max(0, state.progress - diffCfg.progressErrorPenalty);
      }
      if (state.gameMode !== 'training' && (state.activeTimers?.speedlock || 0) <= 0 && diffCfg.speedErrorPenalty > 0) {
        state.speedMultiplier = Math.min(CFG.maxSpeedMult, (state.speedMultiplier || 1.0) + diffCfg.speedErrorPenalty);
      }

      if (progressFill && diffCfg.progressErrorPenalty > 0) {
        progressFill.classList.add('err-flash');
        setTimeout(() => progressFill.classList.remove('err-flash'), 320);
      }
      if (speedDisplay && diffCfg.speedErrorPenalty > 0) {
        speedDisplay.classList.add('speed-up-flash');
        setTimeout(() => speedDisplay.classList.remove('speed-up-flash'), 320);
      }

      state.typedBuffer = '';
      clearHighlight();
      playSound('error');
      if (diffCfg.speedErrorPenalty > 0) {
        showFeedback(`❌ Erro (+${diffCfg.speedErrorPenalty}x)`, 'error');
      } else {
        showFeedback('❌ Erro', 'error');
      }
      updateHUD();
    }
  }
}

function highlightBuffer() {
  state.activeItems.forEach(item => {
    if (item.removing) return;
    if (item.text.startsWith(state.typedBuffer)) {
      item.el.classList.add('typing-target');
      const matched = state.typedBuffer;
      const rest    = item.text.slice(matched.length);
      item.el.innerHTML = `<span class="m">${matched}</span>${rest}`;
      if (item.skill) {
        const b = document.createElement('div');
        b.className = 'skill-badge'; b.textContent = '⚡';
        item.el.appendChild(b);
      }
      if (item.type === 'wildcard') {
        const b = document.createElement('div');
        b.className = 'wildcard-badge'; b.textContent = '💥';
        item.el.appendChild(b);
      }
    } else {
      item.el.classList.remove('typing-target');
    }
  });
}

function clearHighlight() {
  state.activeItems.forEach(item => {
    if (item.removing) return;
    item.el.classList.remove('typing-target');
    item.el.textContent = item.text;
    if (item.skill) {
      const b = document.createElement('div');
      b.className = 'skill-badge'; b.textContent = '⚡';
      item.el.appendChild(b);
    }
    if (item.type === 'wildcard') {
      const b = document.createElement('div');
      b.className = 'wildcard-badge'; b.textContent = '💥';
      item.el.appendChild(b);
    }
  });
}

function completeItem(item) {
  item.removing = true;
  item.el.classList.add('destroying');
  spawnParticles(item.el, item.text.length * 2);

  // Speed progression during the match
  if (item.type === 'letter') {
    state.speedMultiplier = Math.min(CFG.maxSpeedMult, (state.speedMultiplier || 1.0) + CFG.speedBonusLetter);
  } else if (item.type === 'syllable') {
    state.speedMultiplier = Math.min(CFG.maxSpeedMult, (state.speedMultiplier || 1.0) + CFG.speedBonusSyl);
  } else {
    state.speedMultiplier = Math.min(CFG.maxSpeedMult, (state.speedMultiplier || 1.0) + CFG.speedBonusWord);
  }

  // Handle Wildcard
  if (item.type === 'wildcard') {
    wildcardExplode(item);
    return;
  }

  // Increment combo streak
  state.combo    = (state.combo || 0) + 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  try {
    const curBest = parseInt(localStorage.getItem('digitinho_best_combo') || '0', 10);
    if (state.maxCombo > curBest) localStorage.setItem('digitinho_best_combo', String(state.maxCombo));
  } catch (_) {}
  if (state.combo >= 30) {
    unlockAchievement('mestre_combo');
  }

  // Check Modo Fúria
  const isFury = state.combo >= 15;
  if (state.combo === 15) {
    playSound('fury');
    showFeedback('MODO FÚRIA ATIVADO! PONTOS EM DOBRO!', 'special');
    unlockAchievement('modo_furia');
  } else if (state.combo > 1) {
    playSound('combo');
  }

  // Multiplier calculation:
  let comboMult = 1;
  if (state.combo >= 15)      comboMult = 4;
  else if (state.combo >= 10) comboMult = 3;
  else if (state.combo >= 5)  comboMult = 2;

  // In Modo Fúria, point multiplier doubles:
  if (isFury) {
    comboMult *= 2;
  }

  // Points & Progress
  let basePts = item.type === 'letter' ? 1 : item.type === 'syllable' ? 3 : wordPts(item.text);
  if (state.activeTimers.haste > 0) basePts = Math.floor(basePts * 2);

  const pts = basePts * comboMult;
  state.phasePts += pts;

  if (state.gameMode === 'training') {
    state.progress = Math.min(phaseGoal(), state.progress + 1);
  } else {
    state.progress += pts;
  }

  if (progressFill) {
    progressFill.classList.add('hit-flash');
    setTimeout(() => progressFill.classList.remove('hit-flash'), 220);
  }

  if (item.type === 'letter')        playSound('hit');
  else if (item.type === 'syllable') playSound('syllable');
  else                               playSound('word');

  showFeedback(comboMult > 1 ? `+${pts} (${comboMult}× Combo!)` : `+${pts}`, 'success');

  // Track discovered word stats
  if (item.type === 'word') {
    const key = item.text.toLowerCase();
    if (!state.wordStats[key]) state.wordStats[key] = { count: 0 };
    state.wordStats[key].count++;

    // Track total words completed for achievement 'mestre_tipo' (100 Palavras Completas)
    try {
      let statsCount = 0;
      for (const k in state.wordStats) {
        statsCount += state.wordStats[k].count || 0;
      }
      const stored = parseInt(localStorage.getItem('digitinho_words_completed') || '0', 10) || 0;
      const totalWords = Math.max(stored + 1, statsCount);
      localStorage.setItem('digitinho_words_completed', String(totalWords));
      if (totalWords >= 100) {
        unlockAchievement('mestre_tipo');
      }
    } catch (_) {}
  }

  // Attached skill
  if (item.skill) {
    gainSkill(item.skill.id);
  }

  // Active Bomb effect
  if (state.activeTimers.bomb > 0) {
    triggerBombAreaExplosion(item);
  }

  setTimeout(() => {
    item.el?.parentNode?.removeChild(item.el);
    state.activeItems = state.activeItems.filter(i => i.id !== item.id);
    checkFreezerAutoCancel();
  }, 240);

  updateHUD();
  checkPhaseComplete();
}

// ============================================================
// 7. SKILL ACTIONS & EXPLOSIONS
// ============================================================
function wildcardExplode(wildcardItem) {
  playSound('wildcard');
  showFeedback('💥 CORINGA! LIMPEZA TOTAL!', 'special');

  let totalPts = 10;
  state.activeItems.forEach(other => {
    if (other.id === wildcardItem.id) return;
    const pts = other.type === 'letter' ? 1 : other.type === 'syllable' ? 3 : wordPts(other.text);
    totalPts += pts;
    other.removing = true;
    other.el.classList.add('destroying');
    spawnParticles(other.el, 3);
    setTimeout(() => other.el?.parentNode?.removeChild(other.el), 280);
  });

  state.activeItems = [];
  if ((state.activeTimers?.haste || 0) > 0) totalPts = Math.floor(totalPts * 2);
  state.phasePts += totalPts;
  state.progress += totalPts;

  document.body.style.animation = 'screenShake .4s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 420);

  updateHUD();
  checkPhaseComplete();
}

function gainSkill(skillId) {
  // Only activatable skills can occupy slots (items like wordpack/extralife/continue are handled directly)
  if (typeof SKILLS_CONFIG !== 'undefined' && !SKILLS_CONFIG[skillId]) return;

  playSound('skill');
  const slot = state.skillSlots.find(s => s.id === skillId);
  if (slot) {
    slot.count++;
  } else if (state.skillSlots.length < 8) {
    state.skillSlots.push({ id: skillId, count: 1 });
  }
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);
  showFeedback(`⚡ Habilidade ${def?.name || ''}!`, 'special');
  updateHUD();
}

function activateSkill(idx) {
  const slot = state.skillSlots[idx];
  if (!slot || slot.count <= 0) return;

  slot.count--;
  const skillId = slot.id;
  const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);
  const dur = (def && def.duration) ? def.duration : 10000;

  playSound('skill');

  state.activeTimers[skillId] = (state.activeTimers[skillId] || 0) + dur;

  // Centralized onActivate handler
  if (def && typeof def.onActivate === 'function') {
    def.onActivate(state);
  }

  // Localized feedback
  const durSec = Math.round(dur / 1000);
  const activateMsgKey = `fb_${skillId}_activated`;
  const msg = (typeof t === 'function' && t(activateMsgKey) !== activateMsgKey)
    ? t(activateMsgKey)
    : (def?.activateMsg || `⚡ ${def?.name || skillId} (${durSec}s)!`);

  showFeedback(msg, 'special');
  updateHUD();
}

function triggerBombAreaExplosion(sourceItem) {
  playSound('bomb');

  const r     = sourceItem.el.getBoundingClientRect();
  const gRect = gameArea.getBoundingClientRect();
  const cx    = (r.left + r.width  / 2) - gRect.left;
  const cy    = (r.top  + r.height / 2) - gRect.top;

  // Quanto mais letras tem o vocábulo, maior é o raio da explosão.
  // 1 letra destrói 1 linha, 5 letras destroem 5 linhas, 10 letras destroem 10 linhas, etc.
  const numLetters = Math.max(1, (sourceItem.text || '').length);
  const LINE_HEIGHT = 45; // Altura média vertical de uma linha de rúnicos
  const radius = Math.max(55, numLetters * LINE_HEIGHT);

  createExplosionRing(cx, cy, radius, sourceItem.type === 'word' || numLetters >= 4);

  let extraPts = 0;
  state.activeItems.forEach(other => {
    if (other.id === sourceItem.id || other.removing) return;
    const or   = other.el.getBoundingClientRect();
    const ox   = (or.left + or.width  / 2) - gRect.left;
    const oy   = (or.top  + or.height / 2) - gRect.top;
    const dist = Math.sqrt((ox - cx) ** 2 + (oy - cy) ** 2);
    const vertDist = Math.abs(oy - cy);

    // Destrói dentro do raio expansivo ou dentro da faixa vertical de linhas correspondente
    if (dist <= radius || vertDist <= (numLetters * LINE_HEIGHT / 2)) {
      extraPts += other.type === 'letter' ? 1 : other.type === 'syllable' ? 3 : wordPts(other.text);
      other.removing = true;
      other.el.classList.add('destroying');
      spawnParticles(other.el, 3);
      setTimeout(() => other.el?.parentNode?.removeChild(other.el), 260);
    }
  });

  state.activeItems = state.activeItems.filter(i => !i.removing);

  if (extraPts > 0) {
    if (state.activeTimers.haste > 0) extraPts = Math.floor(extraPts * 2);
    state.phasePts += extraPts;
    state.progress += extraPts;
    const msg = (typeof t === 'function')
      ? t('fb_bomb_explosion', { lines: numLetters, pts: extraPts })
      : `💥 Explosão (${numLetters} linhas)! +${extraPts}`;
    showFeedback(msg, 'special');
  }
}

// Vortex effect: devours 1 non-targeted token
function triggerVortexDevour() {
  const candidates = state.activeItems.filter(item =>
    !item.removing && (!state.typedBuffer || !item.text.startsWith(state.typedBuffer))
  );

  if (candidates.length === 0) return;

  // Pick lowest candidate (most urgent)
  const victim = candidates.reduce((lowest, item) => item.y > lowest.y ? item : lowest);
  victim.removing = true;
  victim.el.classList.add('destroying');
  spawnParticles(victim.el, 4);
  playSound('skill');

  let pts = victim.type === 'letter' ? 1 : victim.type === 'syllable' ? 3 : wordPts(victim.text);
  if (state.activeTimers.haste > 0) pts = Math.floor(pts * 2);

  state.phasePts += pts;
  state.progress += pts;

  showFeedback(`🌀 Vórtice devorou ${victim.text}! +${pts}`, 'special');

  setTimeout(() => {
    victim.el?.parentNode?.removeChild(victim.el);
    state.activeItems = state.activeItems.filter(i => i.id !== victim.id);
    checkFreezerAutoCancel();
  }, 240);

  updateHUD();
  checkPhaseComplete();
}

// ============================================================
// 8. BOSS BATTLES (EVERY 10 PHASES)
// ============================================================
function beginBossPhase() {
  clearArea();
  clearTimeout(state.spawnTimer);
  state.spawnTimer = null;

  // Clean any lingering non-boss tokens from DOM and activeItems
  const stray = gameArea?.querySelectorAll('.falling-item, .token');
  stray?.forEach(el => el.parentNode?.removeChild(el));
  state.activeItems = [];

  const candidateBoss = (state.pendingBoss && state.pendingBossPhase === state.phase)
    ? state.pendingBoss
    : getBossForPhase(state.phase, getLearnedWords(), state.defeatedBossTypes || []);
  const bossType = candidateBoss?.type || 'robot';

  // Pick 3 distinct words strictly from the words the player has already learned matching this boss
  const learnedPool = getLearnedWords();
  const themedMatches = learnedPool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));

  // Regra 2 & 3: O boss escolhido só deve aparecer se o jogador já aprendeu pelo menos 3 vocábulos daquele chefão.
  // Caso não haja palavras suficientes, ignora o boss naquele loop (sem aviso) e roda fase comum.
  if (themedMatches.length < 3) {
    if (typeof hideBossHud === 'function') hideBossHud();
    if (state.bossBattle) state.bossBattle.active = false;
    state.progress        = 0;
    state.hitsPhase       = 0;
    state.errorsPhase     = 0;
    state.phasePts        = 0;
    state.phaseComplete   = false;
    state.paused          = false;
    state.typedBuffer     = '';
    state.activeItems     = [];
    state.spawnQueue      = [];
    clearArea();
    refillQueue();
    renderQueue();
    state.lastTs = null;
    state.rafId = requestAnimationFrame(gameLoop);
    updateHUD();
    scheduleSpawn();
    return;
  }

  state.bossBattle = {
    active:          true,
    boss:            candidateBoss,
    pool:            themedMatches,
    solvedWords:     [],
    attemptedWords:  [],
    lastDroppedWord: null,
    solvedCount:     0,
    currentWord:     null,
    boxItem:         null,
    damageCount:       0,
  };

  state.progress        = 0;
  state.hitsPhase       = 0;
  state.errorsPhase     = 0;
  state.phasePts        = 0;
  // Regra 1: Velocidade padrão dos significados que caem nos chefões é fixa em 0.5x para qualquer dificuldade.
  state.speedMultiplier = 0.5;
  state.combo           = 0;
  state.phaseComplete   = false;
  state.paused          = false;
  state.typedBuffer     = '';
  state.spawnQueue      = [];

  renderBossHud(state.bossBattle.boss, state.bossBattle.boss.lives, state.bossBattle.boss.maxLives || 3);
  renderQueue();
  playSound('bossSpawn');

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const bossIcon = state.bossBattle.boss.icon || '👾';
  const bossName = (currentLang === 'pt' && state.bossBattle.boss?.namePt)
    ? state.bossBattle.boss.namePt
    : (state.bossBattle.boss?.name || 'Chefão');
  const scenarioName = (currentLang === 'pt' && state.bossBattle.boss?.scenarioPt)
    ? state.bossBattle.boss.scenarioPt
    : (state.bossBattle.boss?.scenario || 'Cenário');
  showFeedback(`${bossIcon} ${bossName.toUpperCase()} • ${scenarioName.toUpperCase()}!`, 'special');

  state.lastTs = null;
  state.rafId  = requestAnimationFrame(gameLoop);
  updateHUD();

  setTimeout(() => {
    if (state.bossBattle?.active && !state.paused) {
      spawnBossMeaningBox();
    }
  }, 900);
}

function pickNextBossWord() {
  if (!state.bossBattle || !state.bossBattle.active) return null;
  const bossType = state.bossBattle.boss?.type || 'robot';

  // Regra 5: Mantenha a lógica de apenas sortear palavras que ele já aprendeu e que sejam daquele chefão
  const learnedPool = getLearnedWords();
  const themedMatches = learnedPool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));
  if (themedMatches.length === 0) return null;

  // 1. Filtrar palavras já resolvidas com sucesso nesta batalha
  const solvedSet = new Set((state.bossBattle.solvedWords || []).map(s => s.toLowerCase()));
  const unsolvedPool = themedMatches.filter(w => !solvedSet.has(w.text.toLowerCase()));
  const availablePool = unsolvedPool.length > 0 ? unsolvedPool : themedMatches;

  // 2. Regra 2: Filtrar palavras que já foram tentadas no ciclo atual
  const attemptedSet = new Set((state.bossBattle.attemptedWords || []).map(s => s.toLowerCase()));
  let candidates = availablePool.filter(w => !attemptedSet.has(w.text.toLowerCase()));

  // 3. Regras 3 e 4: Caso todas as palavras disponíveis tenham sido tentadas (ou o limite seja 3 e esgotou), reinicia o ciclo
  if (candidates.length === 0) {
    state.bossBattle.attemptedWords = [];
    // Evita repetir imediatamente a palavra que acabou de cair se houver outras opções disponíveis
    if (availablePool.length > 1 && state.bossBattle.lastDroppedWord) {
      candidates = availablePool.filter(w => w.text.toLowerCase() !== state.bossBattle.lastDroppedWord.toLowerCase());
    }
    if (!candidates || candidates.length === 0) {
      candidates = availablePool;
    }
  }

  // 4. Sorteia aleatoriamente um novo significado entre as opções elegíveis
  const chosenWord = candidates[Math.floor(Math.random() * candidates.length)];
  if (chosenWord) {
    const key = chosenWord.text.toLowerCase();
    if (!state.bossBattle.attemptedWords) state.bossBattle.attemptedWords = [];
    if (!state.bossBattle.attemptedWords.includes(key)) {
      state.bossBattle.attemptedWords.push(key);
    }
    state.bossBattle.currentWord = chosenWord;
    state.bossBattle.lastDroppedWord = null;
  }
  return chosenWord;
}

function spawnBossMeaningBox() {
  if (!state.bossBattle?.active || state.paused) return;

  const wordObj = pickNextBossWord();
  if (!wordObj) return;

  state.bossBattle.currentWord = wordObj;
  const targetWord = wordObj.text.toUpperCase();
  state.typedBuffer = '';
  // Regra 1: Velocidade fixa de 0.5x
  state.speedMultiplier = 0.5;

  const el = document.createElement('div');
  let cls = 'boss-meaning-box';
  if ((state.activeTimers?.freezer || 0) > 0) cls += ' frozen';
  el.className = cls;

  const currentLang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
  const scenarioName = (currentLang === 'pt' && state.bossBattle.boss.scenarioPt)
    ? state.bossBattle.boss.scenarioPt
    : (state.bossBattle.boss.scenario || 'Cenário');

  const solvedNum = Math.min(3, (state.bossBattle.solvedCount || 0) + 1);
  const totalEnigmas = state.bossBattle.boss?.maxLives || 3;

  el.innerHTML = `
    <div class="bmb-header">
      <span class="bmb-badge">📜 ENIGMA ${solvedNum} DE ${totalEnigmas} • ${scenarioName.toUpperCase()}</span>
      <span class="bmb-length">${targetWord.length} LETRAS</span>
    </div>
    <div class="bmb-meaning">"${wordObj.meaning}"</div>
    <div class="bmb-slots"></div>
  `;

  renderBossMeaningSlots(el, targetWord, '');

  clearTimeout(state.spawnTimer);
  state.spawnTimer = null;

  // Purge any stray non-boss tokens from DOM and activeItems
  const stray = gameArea?.querySelectorAll('.falling-item, .token');
  stray?.forEach(tEl => tEl.parentNode?.removeChild(tEl));

  const initialY = 0;
  el.style.top  = initialY + 'px';
  gameArea.appendChild(el);

  const itemObj = {
    id:            uid(),
    el,
    text:          targetWord,
    type:          'boss_meaning',
    isBossMeaning: true,
    y:             initialY,
    x:             0,
    baseSpeed:     28, // Calibrated pace giving adequate reading & typing time
    removing:      false,
  };

  state.activeItems = [itemObj];
  state.bossBattle.boxItem = itemObj;
  renderQueue();
  updateHUD();
}

function handleBossLetterTyped(char) {
  if (!state.bossBattle?.active || !state.bossBattle.currentWord || !state.bossBattle.boxItem) return;
  const boxItem = state.bossBattle.boxItem;
  if (boxItem.removing) return;

  const targetWord = state.bossBattle.currentWord.text.toUpperCase();
  const nextBuf = state.typedBuffer + char;

  if (targetWord.startsWith(nextBuf)) {
    state.typedBuffer = nextBuf;
    state.hitsPhase++;
    state.totalHits++;
    state.charsTyped = (state.charsTyped || 0) + 1;
    if (typeof playMechanicalClick === 'function') playMechanicalClick(state.typedBuffer.length);

    renderBossMeaningSlots(boxItem.el, targetWord, state.typedBuffer);

    if (state.typedBuffer === targetWord) {
      completeBossMeaning();
      state.typedBuffer = '';
    } else {
      playSound('hit');
    }
  } else {
    // Shield protection
    if ((state.activeTimers?.shield || 0) > 0) {
      playSound('skill');
      showFeedback('🛡️ Erro protegido pela Imunidade!', 'special');
      return;
    }

    // Typo breaks combo
    if (state.combo > 0) {
      state.combo = 0;
      showFeedback('Combo quebrado!', 'error');
    }

    state.errorsPhase++;
    state.totalErrors++;
    playSound('error');
    showFeedback('❌ Letra errada!', 'error');

    // Regra 1: Velocidade é fixa em 0.5x mesmo em caso de erro
    state.speedMultiplier = 0.5;

    if (boxItem.el) {
      boxItem.el.classList.add('bmb-error');
      setTimeout(() => boxItem.el?.classList.remove('bmb-error'), 320);
    }

    state.typedBuffer = '';
    renderBossMeaningSlots(boxItem.el, targetWord, '');
    updateHUD();
  }
}

function completeBossMeaning() {
  const boxItem = state.bossBattle.boxItem;
  if (!boxItem) return;

  boxItem.removing = true;
  boxItem.el.classList.add('destroying');
  spawnParticles(boxItem.el, 16);

  // Combo progression
  state.combo    = (state.combo || 0) + 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  try {
    const curBest = parseInt(localStorage.getItem('digitinho_best_combo') || '0', 10);
    if (state.maxCombo > curBest) localStorage.setItem('digitinho_best_combo', String(state.maxCombo));
  } catch (_) {}
  if (state.combo >= 30) unlockAchievement('mestre_combo');

  const isFury = state.combo >= 15;
  if (state.combo === 15) {
    playSound('fury');
    showFeedback('MODO FÚRIA ATIVADO! PONTOS EM DOBRO!', 'special');
    unlockAchievement('modo_furia');
  } else if (state.combo > 1) {
    playSound('combo');
  }

  let comboMult = state.combo >= 15 ? 4 : state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;
  if (isFury) comboMult *= 2;

  const pts = 60 * comboMult;
  state.phasePts   += pts;
  state.totalScore += pts;

  playSound('bossHit');
  flashBossDamage();
  document.body.style.animation = 'screenShake .35s ease';
  setTimeout(() => { document.body.style.animation = ''; }, 350);

  // Record discovered word stats
  const wordKey = state.bossBattle.currentWord.text.toLowerCase();
  if (!state.bossBattle.solvedWords) state.bossBattle.solvedWords = [];
  if (!state.bossBattle.solvedWords.includes(wordKey)) {
    state.bossBattle.solvedWords.push(wordKey);
  }
  state.bossBattle.solvedCount = (state.bossBattle.solvedCount || 0) + 1;

  if (!state.wordStats[wordKey]) state.wordStats[wordKey] = { count: 0 };
  state.wordStats[wordKey].count++;
  if (!state.unlockedWords.find(w => w.text.toLowerCase() === wordKey)) {
    state.unlockedWords.push({ ...state.bossBattle.currentWord, phase: state.phase });
  }

  // Deduct 1 boss life (Cada significado tira uma vida do boss)
  state.bossBattle.boss.lives--;
  state.bossBattle.damageCount++;

  showFeedback(`💥 ENIGMA DECIFRADO! -1 PONTO DE VIDA! (+${pts}pts)`, 'special');
  renderBossHud(state.bossBattle.boss, state.bossBattle.boss.lives, state.bossBattle.boss.maxLives || 3);
  updateHUD();

  setTimeout(() => {
    boxItem.el?.parentNode?.removeChild(boxItem.el);
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
    state.activeItems = [];
    state.bossBattle.boxItem = null;
    const stray = gameArea?.querySelectorAll('.falling-item, .token');
    stray?.forEach(el => el.parentNode?.removeChild(el));

    if (state.bossBattle.boss.lives <= 0) {
      defeatBoss();
    } else {
      state.typedBuffer = '';
      setTimeout(() => {
        if (state.bossBattle?.active && !state.paused) {
          spawnBossMeaningBox();
        }
      }, 700);
    }
  }, 280);
}

function defeatBoss() {
  state.bossBattle.active = false;
  state.phaseComplete = true;
  state.paused = true;
  cancelAnimationFrame(state.rafId);
  clearTimeout(state.spawnTimer);

  // Ao vencer o boss, jogador ganha 1000 pontos
  const bossBonusPts = 1000;
  state.phasePts += bossBonusPts;
  state.totalScore += bossBonusPts;
  updateHUD();

  playSound('bossDefeat');
  launchConfetti();

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const bossName = (currentLang === 'pt' && state.bossBattle.boss?.namePt)
    ? state.bossBattle.boss.namePt
    : (state.bossBattle.boss?.name || 'Chefão');

  const victoryMsg = currentLang === 'pt'
    ? `👑 ${bossName.toUpperCase()} DERROTADO! +1.000 PTS!`
    : `👑 ${bossName.toUpperCase()} DEFEATED! +1,000 PTS!`;

  showFeedback(victoryMsg, 'special');

  if (state.bossBattle?.boss?.type) {
    if (!state.defeatedBossTypes) state.defeatedBossTypes = [];
    if (!state.defeatedBossTypes.includes(state.bossBattle.boss.type)) {
      state.defeatedBossTypes.push(state.bossBattle.boss.type);
    }
  }
  state.pendingBoss = null;
  state.pendingBossPhase = null;

  // Ao vencer o boss, jogador pode escolher entre 3 habilidades aleatórias
  const rewardPool = shuffle(SKILLS_ALL).slice(0, 3);

  setTimeout(() => {
    showBossRewardModal(rewardPool, (chosenSkill) => {
      stopConfetti();
      grantRewardSkill(chosenSkill);
      continueAfterBossVictory();
    });
  }, 650);
}

function grantRewardSkill(skill) {
  if (skill.id === 'extralife') {
    state.lives = Math.min(state.lives + 1, 6);
    state.maxLives = Math.max(state.maxLives, state.lives);
    showFeedback('+1 Vida permanente!', 'special');
  } else if (skill.id === 'continue') {
    state.continues = (state.continues || 0) + 1;
    showFeedback('🪙 +1 Ficha Continue obtida!', 'special');
  } else if (skill.id === 'wordpack') {
    const unlockedTexts = new Set(state.unlockedWords.map(w => w.text.toLowerCase()));
    const lockedPool    = WORD_POOL.filter(w => !unlockedTexts.has(w.text.toLowerCase()));
    const picked        = shuffle(lockedPool).slice(0, 3);
    if (picked.length > 0) {
      picked.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));
      const names = picked.map(w => w.text.toUpperCase()).join(', ');
      showFeedback(`📦 Desbloqueadas: ${names}!`, 'special');
      if (state.unlockedWords.length >= WORD_POOL.length) {
        if (typeof unlockAchievement === 'function') unlockAchievement('colecionador');
      }
    }
  } else {
    const slot = state.skillSlots.find(s => s.id === skill.id);
    if (slot) {
      slot.count++;
    } else if (state.skillSlots.length < 8) {
      state.skillSlots.push({ id: skill.id, count: 1 });
    } else {
      state.skillSlots[state.skillSlots.length - 1] = { id: skill.id, count: 1 };
    }
    showFeedback(`Recompensa concedida: ${skill.name}!`, 'special');
  }
  playSound('skill');
  updateHUD();
}

function continueAfterBossVictory() {
  hideBossHud();
  state.pendingBoss = null;
  state.pendingBossPhase = null;
  state.phaseComplete = false;
  state.paused = true;
  const completedPhase = state.phase;
  state.phase++;

  // A 1ª loja aparece após a fase 5. Depois, de 3 em 3 fases (5, 8, 11, 14…)
  const isShopPhase = completedPhase === 5 || (completedPhase > 5 && (completedPhase - 5) % 3 === 0);
  if (isShopPhase) {
    showShop();
  } else {
    beginPhase();
  }
}

let currentBossTestIndex = 0;
const BOSS_TEST_PHASES = [10, 20, 30, 40, 50, 60];

function testBossBattle(phaseOverride) {
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');

  if (screenStart?.classList.contains('active')) {
    screenStart.classList.remove('active');
    screenGame.classList.add('active');
    hiddenInput.focus();
  }
  const testIdx = currentBossTestIndex++;
  const testBosses = typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS : [];
  state.phase = (phaseOverride && phaseOverride % 10 === 0) ? phaseOverride : 10;
  const candidateBoss = testBosses[testIdx % testBosses.length] || getBossForPhase(state.phase);
  state.pendingBoss = candidateBoss;
  state.pendingBossPhase = state.phase;
  const bossType = candidateBoss?.type || 'robot';

  // Ensure tester has at least 3 matching learned words for the candidate boss
  const currentLearned = getLearnedWords();
  const matchingThemed = currentLearned.filter(w => isWordThematicallyRelatedToBoss(w, bossType));

  if (matchingThemed.length < 3) {
    const curLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
    const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[curLang])
      ? WORD_POOLS[curLang]
      : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
    let matchingInPool = activePool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));
    if (matchingInPool.length < 3 && typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) {
      const bossList = BOSS_WORDS_BY_TYPE[bossType][curLang] || BOSS_WORDS_BY_TYPE[bossType].pt || BOSS_WORDS_BY_TYPE[bossType].en || [];
      matchingInPool = [...matchingInPool, ...bossList];
    }
    matchingInPool.forEach(w => {
      const key = w.text.toLowerCase();
      if (!state.wordStats[key]) state.wordStats[key] = { count: 1 };
      if (!state.unlockedWords.find(u => u.text.toLowerCase() === key)) {
        state.unlockedWords.push({ ...w, phase: state.phase });
      }
    });
  }

  state.paused = false;
  state.escPaused = false;
  beginBossPhase();
}

function startBossTest() {
  if (typeof closeSettings === 'function') closeSettings();
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  const modalTraining = $('modal-training');
  if (modalTraining) modalTraining.classList.add('hidden');

  state = defaultState();
  state.gameMode = 'classic';
  state.startTime = Date.now();
  state.phase = 10;

  const testIdx = currentBossTestIndex++;
  const testBosses = typeof BOSS_DEFS !== 'undefined' ? BOSS_DEFS : [];
  const candidateBoss = testBosses[testIdx % testBosses.length] || getBossForPhase(state.phase);
  state.pendingBoss = candidateBoss;
  state.pendingBossPhase = state.phase;
  const bossType = candidateBoss?.type || 'robot';

  const curLang = typeof getLanguage === 'function' ? getLanguage() : 'pt';
  const activePool = (typeof WORD_POOLS !== 'undefined' && WORD_POOLS[curLang])
    ? WORD_POOLS[curLang]
    : (typeof WORD_POOL !== 'undefined' ? WORD_POOL : []);
  let matchingInPool = activePool.filter(w => isWordThematicallyRelatedToBoss(w, bossType));
  if (matchingInPool.length < 3 && typeof BOSS_WORDS_BY_TYPE !== 'undefined' && BOSS_WORDS_BY_TYPE[bossType]) {
    const bossWordFallback = BOSS_WORDS_BY_TYPE[bossType][curLang] || BOSS_WORDS_BY_TYPE[bossType].pt || BOSS_WORDS_BY_TYPE[bossType].en || [];
    matchingInPool = [...matchingInPool, ...bossWordFallback];
  }

  matchingInPool.forEach(w => {
    state.unlockedWords.push({ ...w, phase: 1 });
    const key = w.text.toLowerCase();
    if (!state.wordStats[key]) state.wordStats[key] = { count: 1 };
  });

  screenStart.classList.remove('active');
  screenGame.classList.add('active');
  hiddenInput.focus();
  beginBossPhase();
}
