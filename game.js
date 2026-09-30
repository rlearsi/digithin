/* ================================================
   DIGITINHO — game.js
   Core gameplay engine, match lifecycle, loop & matching
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
  const lesson1Name = typeof t === 'function' ? t('training_lesson_1_name') : 'Home Keys';
  const lessonLbl = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
  showFeedback(`${worldData.name} — ${lessonLbl} 1/3 (${lesson1Name})`, 'special');
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

// ============================================================
// PHASE EXIT CONFIRMATION MODAL
// ============================================================
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

// ============================================================
// 2. PHASE PROGRESSION & TRANSITIONS
// ============================================================
function beginPhase() {
  // Check if current phase is a Boss Battle (every 10 phases) - requires at least 3 learned words of that boss
  if (typeof canTriggerBossBattle === 'function' && canTriggerBossBattle()) {
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
    const worldData = (typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[worldId]) || { name: (typeof t === 'function' ? t('hud_training_lbl') : 'Training'), subtitle: '' };
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
      $('modal-phase-h').textContent = typeof t === 'function'
        ? t('training_mastery_completed', { world: worldData.name })
        : `${worldData.name} — Mastery Completed!`;

      const rankBadge = $('phase-rank-badge');
      if (rankBadge) {
        rankBadge.textContent = isNewRecord
          ? (typeof t === 'function' ? t('training_new_record') : 'NEW RECORD!')
          : (typeof t === 'function' ? t('training_world_mastered') : 'WORLD MASTERED');
        rankBadge.className = 'phase-rank-badge rank-s';
      }

      const statStatusLbl = typeof t === 'function' ? t('training_stat_status') : 'Training Status';
      const statCompletedLbl = typeof t === 'function' ? t('training_stat_completed') : '100% Completed (3/3 Lessons)';
      const statKeysLbl = typeof t === 'function' ? t('training_stat_keys') : 'Mastered Keys';
      const statAccLbl = typeof t === 'function' ? t('training_stat_accuracy') : 'Match Accuracy';
      const statBestLbl = typeof t === 'function' ? t('training_stat_best_record') : 'Best Record (Accuracy)';
      const statSpeedLbl = typeof t === 'function' ? t('training_stat_speed') : 'Real Speed (WPM)';
      const statHitsLbl = typeof t === 'function' ? t('training_stat_hits_errors') : 'Total Hits / Errors';
      const hitsVal = typeof t === 'function'
        ? t('training_hits_errs_val', { hits: state.totalHits || state.hitsPhase, errors: state.totalErrors || errs })
        : `${state.totalHits || state.hitsPhase} hits / ${state.totalErrors || errs} errors`;
      const newRecLabel = isNewRecord ? (typeof t === 'function' ? `(${t('training_new_record')})` : '(NEW RECORD!)') : '';

      $('modal-phase-stats').innerHTML = `
        <div class="go-row"><span>${statStatusLbl}</span><strong style="color:var(--accent-emerald)">${statCompletedLbl}</strong></div>
        <div class="go-row"><span>${statKeysLbl}</span><strong style="color:var(--accent-amber)">${worldData.subtitle}</strong></div>
        <div class="go-row"><span>${statAccLbl}</span><strong style="color:${finalPrecNum >= 90 ? 'var(--accent-emerald)' : 'var(--accent-coral)'}">${finalPrecNum.toFixed(1)}%</strong></div>
        <div class="go-row"><span>${statBestLbl}</span><strong style="color:var(--accent-amber)">${currentRecord}% ${newRecLabel}</strong></div>
        <div class="go-row"><span>${statSpeedLbl}</span><strong style="color:var(--accent-cyan)">${ppm} PPM</strong></div>
        <div class="go-row"><span>${statHitsLbl}</span><strong style="color:var(--t1)">${hitsVal}</strong></div>
      `;

      $('section-words').style.display = 'none';

      const nextWorldId = worldId + 1;
      const hasNextWorld = typeof TRAINING_WORLDS !== 'undefined' && TRAINING_WORLDS[nextWorldId];
      const nextBtn = $('btn-next-phase') || document.querySelector('#modal-phase .btn-primary');
      if (nextBtn) {
        if (hasNextWorld) {
          nextBtn.textContent = typeof t === 'function'
            ? t('training_btn_next_world', { world: TRAINING_WORLDS[nextWorldId].name })
            : `Advance to ${TRAINING_WORLDS[nextWorldId].name} →`;
        } else {
          nextBtn.textContent = typeof t === 'function' ? t('training_btn_finish_all') : 'Finish All Trainings! →';
        }
      }

      modalPhase.classList.remove('hidden');
      playSound('firework');
      launchConfetti();
      return;
    }

    // Lições 1 e 2
    const nextLesson = lesson + 1;
    const lessonTitle = lesson === 1
      ? (typeof t === 'function' ? t('training_lesson_1_title') : 'Lesson 1: Key Recognition')
      : (typeof t === 'function' ? t('training_lesson_2_title') : 'Lesson 2: Finger Alternation');
    const nextLessonHint = lesson === 1
      ? (typeof t === 'function' ? t('training_next_obj_2') : 'Next goal: Combine keys into short words and alternate hands.')
      : (typeof t === 'function' ? t('training_next_obj_3') : 'Next goal: Final flow and mastery challenge with full words!');

    $('phase-emoji').innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
    $('modal-phase-h').textContent = typeof t === 'function'
      ? t('training_lesson_completed', { world: worldData.name, lesson: lessonTitle })
      : `${worldData.name} — ${lessonTitle}`;

    let rank = typeof t === 'function' ? t('training_rank_s') : 'SURGICAL PRECISION';
    let rankCls = 'rank-s';
    if (acc === '100.0' && errs === 0) {
      unlockAchievement('cirurgico');
    } else if (acc >= 90) {
      rank = typeof t === 'function' ? t('training_rank_a') : 'EXCELLENT FLOW';
      rankCls = 'rank-a';
    } else if (acc >= 75) {
      rank = typeof t === 'function' ? t('training_rank_b') : 'GOOD CONTROL';
      rankCls = 'rank-b';
    } else {
      rank = typeof t === 'function' ? t('training_rank_c') : 'PRACTICE MORE';
      rankCls = 'rank-c';
    }

    const rankBadge = $('phase-rank-badge');
    if (rankBadge) {
      rankBadge.textContent = rank;
      rankBadge.className = `phase-rank-badge ${rankCls}`;
    }

    const statProgressLbl = typeof t === 'function' ? t('training_stat_world_progress') : 'World Progress';
    const statLessonDone = typeof t === 'function' ? t('training_stat_lesson_done', { lesson }) : `Lesson ${lesson} of 3 Completed`;
    const statAccRateLbl = typeof t === 'function' ? t('training_stat_accuracy_rate') : 'Accuracy Rate';
    const statSpeedLbl = typeof t === 'function' ? t('training_stat_speed') : 'Real Speed (WPM)';
    const statHitsErrorsLbl = typeof t === 'function' ? t('training_stat_hits_errors') : 'Hits / Errors';
    const hitsErrVal = typeof t === 'function'
      ? t('training_hits_errs_val', { hits: state.hitsPhase, errors: errs })
      : `${state.hitsPhase} hits / ${errs} errors`;

    $('modal-phase-stats').innerHTML = `
      <div class="go-row"><span>${statProgressLbl}</span><strong style="color:var(--accent-amber)">${statLessonDone}</strong></div>
      <div class="go-row"><span>${statAccRateLbl}</span><strong style="color:${acc >= 90 ? 'var(--accent-emerald)' : 'var(--accent-coral)'}">${acc}%</strong></div>
      <div class="go-row"><span>${statSpeedLbl}</span><strong style="color:var(--accent-cyan)">${ppm} PPM</strong></div>
      <div class="go-row"><span>${statHitsErrorsLbl}</span><strong style="color:var(--t1)">${hitsErrVal}</strong></div>
      <div class="go-row"><span style="color:var(--t3);font-size:0.75rem">${nextLessonHint}</span></div>
    `;

    $('section-words').style.display = 'none';

    const nextBtn = $('btn-next-phase') || document.querySelector('#modal-phase .btn-primary');
    if (nextBtn) {
      const runicsCount = nextLesson === 2 ? '15' : '20';
      nextBtn.textContent = typeof t === 'function'
        ? t('training_btn_next_lesson', { lesson: nextLesson, runics: runicsCount })
        : `Advance to Lesson ${nextLesson} (${runicsCount} runics) →`;
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
    span.textContent = typeof t === 'function' ? t('modal_btn_next_phase') : 'Next Phase →';
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
  $('modal-phase-h').textContent = typeof t === 'function'
    ? t('modal_phase_complete', { phase: state.phase })
    : `Phase ${state.phase} Complete!`;

  const ptsEarnedLbl = typeof t === 'function' ? t('modal_phase_pts') : 'Points Earned in Phase';
  const penaltyLbl   = typeof t === 'function' ? t('modal_penalty') : 'Errors (Penalty)';
  const netPtsLbl    = typeof t === 'function' ? t('modal_net_pts') : 'Net Added Points';
  const totalPtsLbl  = typeof t === 'function' ? t('modal_total_pts') : 'Total Score';

  $('modal-phase-stats').innerHTML = `
    <div class="go-row"><span>${ptsEarnedLbl}</span><strong style="color:var(--t1)">+${rawPts}</strong></div>
    <div class="go-row"><span>${penaltyLbl}</span><strong style="color:var(--accent-coral)">−${penalty}</strong></div>
    <div class="go-row"><span>${netPtsLbl}</span><strong style="color:var(--accent-emerald)">+${finalPts}</strong></div>
    <div class="go-row"><span>${totalPtsLbl}</span><strong style="color:var(--accent-cyan);font-variant-numeric:tabular-nums;letter-spacing:0.04em">${formatScore(state.totalScore)}</strong></div>
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
        showFeedback(typeof t === 'function' ? t('fb_training_completed') : '🎉 Congratulations! You completed all training worlds!', 'special');
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

// ============================================================
// 3. HEALTH & GAME OVER
// ============================================================
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
    showFeedback(typeof t === 'function' ? t('fb_runic_dropped_zen') : '⚠️ Runic dropped (-accuracy)', 'error');
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
    showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
  }

  state.lives--;
  playSound('life');
  showFeedback(typeof t === 'function' ? t('fb_runic_dropped') : '💔 Runic dropped!', 'error');

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
  showFeedback(typeof t === 'function' ? t('fb_continue_used') : '🪙 Continue used! Resuming phase...', 'special');
  beginPhase();
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
        if (typeof onSkillExpired === 'function') onSkillExpired(skillId);
      }
    }
  }

  // Vortex skill: devours 1 non-targeted token every 2 seconds
  if ((state.activeTimers?.vortex || 0) > 0) {
    state.vortexAccum = (state.vortexAccum || 0) + dt;
    if (state.vortexAccum >= 2.0) {
      state.vortexAccum -= 2.0;
      if (typeof triggerVortexDevour === 'function') triggerVortexDevour();
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
        showFeedback(typeof t === 'function' ? t('fb_time_up') : "⏱️ Time's Up!", 'special');
        return;
      }
    }
  }

  if (timersChanged && typeof renderSkills === 'function') renderSkills();

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
  if (typeof checkFreezerAutoCancel === 'function') checkFreezerAutoCancel();

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
        showFeedback(typeof t === 'function' ? t('fb_boss_enigma_dropped') : '💥 The enigma dropped! The Boss attacked!', 'error');
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
            if (typeof spawnBossMeaningBox === 'function') spawnBossMeaningBox();
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

// ============================================================
// 5. MATCHING & COMPLETION
// ============================================================
function handleLetterTyped(char) {
  if (state.paused || state.phaseComplete || (typeof isShopOpen === 'function' && isShopOpen())) {
    state.typedBuffer = '';
    return;
  }
  // Boss Battle dedicated typing logic
  if (state.bossBattle && state.bossBattle.active) {
    if (typeof handleBossLetterTyped === 'function') handleBossLetterTyped(char);
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
        const msg = typeof t === 'function' ? t('fb_shield_error_protected') : '🛡️ Error protected by Shield!';
        showFeedback(msg, 'special');
        return;
      }

      // Combo breaks on error
      if (state.combo > 0) {
        state.combo = 0;
        showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
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
      const errLbl = typeof t === 'function' ? t('fb_error') : '❌ Error';
      if (diffCfg.speedErrorPenalty > 0) {
        showFeedback(`${errLbl} (+${diffCfg.speedErrorPenalty}x)`, 'error');
      } else {
        showFeedback(errLbl, 'error');
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
    if (typeof wildcardExplode === 'function') wildcardExplode(item);
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
    showFeedback(typeof t === 'function' ? t('fb_fury_activated') : 'FURY MODE ACTIVATED! DOUBLE POINTS!', 'special');
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
    if (typeof gainSkill === 'function') gainSkill(item.skill.id);
  }

  // Active Bomb effect
  if (state.activeTimers.bomb > 0) {
    if (typeof triggerBombAreaExplosion === 'function') triggerBombAreaExplosion(item);
  }

  setTimeout(() => {
    item.el?.parentNode?.removeChild(item.el);
    state.activeItems = state.activeItems.filter(i => i.id !== item.id);
    if (typeof checkFreezerAutoCancel === 'function') checkFreezerAutoCancel();
  }, 240);

  updateHUD();
  checkPhaseComplete();
}
