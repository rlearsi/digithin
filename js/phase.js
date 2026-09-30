/* ================================================
   DIGITINHO — js/phase.js
   Phase progression, completion modal, ranks & transitions
   ================================================ */
'use strict';

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
// PHASE PROGRESSION & TRANSITIONS
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

  // Unlock new words: only starting from the completion of Phase 2 (to be displayed starting at Phase 3)
  let toUnlock = [];
  if (state.phase >= 2) {
    const pool     = WORD_POOL.filter(w => !state.unlockedWords.find(u => u.text === w.text));
    toUnlock = shuffle(pool).slice(0, CFG.wordsPerPhase);
    toUnlock.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));

    if (state.unlockedWords.length >= WORD_POOL.length) {
      unlockAchievement('colecionador');
    }
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
