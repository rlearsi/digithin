/* ================================================
   DIGITINHO — js/ui.js
   DOM elements, HUD, particles, queue, and visual effects
   ================================================ */
'use strict';

const $ = id => document.getElementById(id);

// DOM Cache
const screenStart    = $('screen-start');
const screenGame     = $('screen-game');
const gameArea       = $('game-area');
const hiddenInput    = $('hidden-input');
const feedbackEl     = $('feedback-msg');
const hudPhasePts    = $('hud-phase-pts');
const hudTotal       = $('hud-total');
const phaseNumEl     = $('phase-num');
const progressFill   = $('progress-fill');
const progressText   = $('progress-text');
const livesRow       = $('lives-row');
const speedDisplay   = $('speed-display');
const hitsDisplay    = $('hits-display');
const errorsDisplay  = $('errors-display');
const wordsList      = $('words-list');
const skillsCont     = $('skills-container');
const queueItemsEl   = $('queue-items');
const modalPhase     = $('modal-phase');
const modalShop      = $('modal-shop');
const modalGameover  = $('modal-gameover');
const modalLib         = $('modal-biblioteca');
const modalConquistas  = $('modal-conquistas');
const modalSettings    = $('modal-settings');
const modalRules       = $('modal-rules');

function openRulesModal() {
  const m = modalRules || $('modal-rules');
  if (m) m.classList.remove('hidden');
}

function closeRulesModal() {
  const m = modalRules || $('modal-rules');
  if (m) m.classList.add('hidden');
}
const achievementsGrid = $('achievements-grid');
const pauseOverlay     = $('pause-overlay');
const bossHud          = $('boss-hud');
const bossAvatar       = $('boss-avatar');
const bossName         = $('boss-name');
const bossDesc         = $('boss-desc');
const bossHearts       = $('boss-hearts');
const modalBossReward  = $('modal-boss-reward');
const bossSkillsGrid   = $('boss-skills-grid');

// ============================================================
// THEME MANAGEMENT (Dark / Light)
// ============================================================
function initTheme() {
  const saved = localStorage.getItem('digitinho_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'dark'); // default modern dark
  setTheme(initial);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('digitinho_theme', theme);
  const isDark = theme === 'dark';
  document.querySelectorAll('.theme-switch-btn').forEach(btn => {
    const aria = isDark
      ? (typeof t === 'function' ? t('theme_switch_to_light') : 'Switch to light theme')
      : (typeof t === 'function' ? t('theme_switch_to_dark') : 'Switch to dark theme');
    btn.setAttribute('aria-label', aria);
    btn.classList.toggle('is-dark', isDark);
  });
  if (typeof updateSettingsUI === 'function') {
    updateSettingsUI();
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

initTheme();

// ============================================================
// QUEUE POSITION MANAGEMENT (Top [default] / Bottom)
// ============================================================
function initQueuePosition() {
  const saved = localStorage.getItem('digitinho_queue_pos');
  const initial = saved === 'bottom' ? 'bottom' : 'top'; // Top is default
  setQueuePosition(initial);
}

function setQueuePosition(pos) {
  const gameCol = $('game-column');
  const isTop = pos !== 'bottom';
  const finalPos = isTop ? 'top' : 'bottom';

  if (gameCol) {
    gameCol.classList.toggle('queue-pos-top', isTop);
    gameCol.classList.toggle('queue-pos-bottom', !isTop);
    gameCol.setAttribute('data-queue-pos', finalPos);
  }

  localStorage.setItem('digitinho_queue_pos', finalPos);

  if (typeof updateSettingsUI === 'function') {
    updateSettingsUI();
  }
}

function toggleQueuePosition() {
  const current = localStorage.getItem('digitinho_queue_pos') === 'bottom' ? 'bottom' : 'top';
  const next = current === 'top' ? 'bottom' : 'top';
  setQueuePosition(next);
}

initQueuePosition();

// ============================================================
// PAUSE SETTINGS VIEW MANAGEMENT
// ============================================================
function updateSoundUI() {
  const isEnabled = typeof isSoundEnabled === 'function' ? isSoundEnabled() : true;
  const soundVal = $('settings-sound-val');
  if (soundVal) {
    const iconSvg = isEnabled
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
    const label = isEnabled
      ? (typeof t === 'function' ? t('settings_sound_on') : 'On')
      : (typeof t === 'function' ? t('settings_sound_off') : 'Mute');
    soundVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  const soundBtn = $('settings-sound-btn');
  if (soundBtn) {
    soundBtn.classList.toggle('is-muted', !isEnabled);
  }
}

function updateSettingsUI() {
  updateSoundUI();
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const settingsThemeVal = $('settings-theme-val');
  if (settingsThemeVal) {
    const iconSvg = theme === 'dark'
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    const label = theme === 'dark'
      ? (typeof t === 'function' ? t('settings_theme_dark') : 'Dark')
      : (typeof t === 'function' ? t('settings_theme_light') : 'Light');
    settingsThemeVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  const isTop = (localStorage.getItem('digitinho_queue_pos') || 'top') !== 'bottom';
  const settingsQueueVal = $('settings-queue-val');
  if (settingsQueueVal) {
    const iconSvg = isTop
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    const label = isTop
      ? (typeof t === 'function' ? t('settings_queue_top') : 'Top')
      : (typeof t === 'function' ? t('settings_queue_bottom') : 'Bottom');
    settingsQueueVal.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  updateBossBattlesUI();

  const langSelect = $('settings-lang-select');
  if (langSelect && typeof getLanguage === 'function') {
    langSelect.value = getLanguage();
  }

  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const diffSelect = $('settings-difficulty-select');
  if (diffSelect) {
    if (typeof getDifficulty === 'function') {
      diffSelect.value = getDifficulty();
    }
    diffSelect.disabled = inMatch;
    if (inMatch) {
      diffSelect.title = typeof t === 'function' ? t('settings_diff_locked_match') : '';
    } else {
      diffSelect.title = '';
    }
  }
}

function isBossBattlesEnabled() {
  const saved = localStorage.getItem('digitinho_boss_enabled');
  return saved === null ? true : saved === 'true';
}

function toggleBossBattlesSetting() {
  const current = isBossBattlesEnabled();
  const next = !current;
  localStorage.setItem('digitinho_boss_enabled', String(next));
  updateBossBattlesUI();
  return next;
}

function updateBossBattlesUI() {
  const isEnabled = isBossBattlesEnabled();
  const btn = $('settings-boss-btn');
  const val = $('settings-boss-val');
  if (val) {
    const iconSvg = isEnabled
      ? `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/></svg>`
      : `<svg class="btn-svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    const label = isEnabled
      ? (typeof t === 'function' ? t('settings_boss_on') : 'Every 10 Phases (Active)')
      : (typeof t === 'function' ? t('settings_boss_off') : 'Disabled');
    val.innerHTML = `${iconSvg} <span>${label}</span>`;
  }
  if (btn) {
    btn.classList.toggle('is-disabled', !isEnabled);
  }
}

let settingsPaused = false;
let settingsOpenedFromPause = false;

function isSettingsOpen() {
  const modal = $('modal-settings');
  return !!(modal && !modal.classList.contains('hidden'));
}

function isPauseSettingsOpen() {
  return isSettingsOpen();
}

function openSettings(fromStart = false) {
  // If game is actively playing, pause it
  if (screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    settingsPaused = true;
    state.paused   = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  // Check if pause overlay is currently visible
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    settingsOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    settingsOpenedFromPause = false;
  }

  updateSettingsUI();
  const modal = $('modal-settings');
  if (modal) modal.classList.remove('hidden');
}

function openPauseSettings() {
  openSettings(false);
}

function closeSettings() {
  const modal = $('modal-settings');
  if (modal) modal.classList.add('hidden');

  // If opened from pause menu, restore pause menu
  if (settingsOpenedFromPause) {
    settingsOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    return;
  }

  // If paused specifically by opening settings during active gameplay, resume
  if (settingsPaused) {
    settingsPaused = false;
    if (!state.escPaused && !state.phaseComplete) {
      state.paused = false;
      state.lastTs = null;
      state.rafId  = requestAnimationFrame(gameLoop);
      if (!state.bossBattle || !state.bossBattle.active) {
        scheduleSpawn();
      }
      hiddenInput?.focus();
    }
  }
}

function closePauseSettings() {
  closeSettings();
}

function resetPauseView() {
  if (typeof cancelExitConfirm === 'function') cancelExitConfirm();
  closeSettings();
  const btnPauseTraining = $('btn-pause-back-training');
  if (btnPauseTraining) {
    if (typeof state !== 'undefined' && state.gameMode === 'training') {
      btnPauseTraining.classList.remove('hidden');
      btnPauseTraining.style.display = '';
    } else {
      btnPauseTraining.classList.add('hidden');
      btnPauseTraining.style.display = 'none';
    }
  }
}

// Close settings if clicking backdrop
if (modalSettings) {
  modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) closeSettings();
  });
}

// Initial sound UI sync
updateSoundUI();

// Slow-motion screen ring
const slowRing = document.createElement('div');
slowRing.id = 'slow-ring';
document.body.appendChild(slowRing);

// Clear falling item area
function clearArea() {
  if (gameArea)   gameArea.innerHTML = '';
  if (feedbackEl) gameArea.appendChild(feedbackEl);
  if (state)      state.activeItems = [];
}

// Global PPM (Words Per Minute / Palavras por Minuto) Calculator
function calcPPM() {
  if (state && state.currentWpm) return state.currentWpm;
  if (!state || !state.startTime) return 0;
  const elapsedMin = Math.max(0.08, (Date.now() - state.startTime) / 60000);
  return Math.round(((state.charsTyped || 0) / 5) / elapsedMin) || 0;
}

// Phase goal calculator (Fase 1 = 10, Fase 2 = 20, Fase 3 = 30...; Treinamento = 10 / 15 / 20)
function phaseGoal() {
  if (state && state.gameMode === 'training') {
    const lesson = state.phase || 1;
    if (lesson === 1) return 10;
    if (lesson === 2) return 15;
    return 20; // Lição 3: Desafio de Maestria
  }
  return calcPhaseGoal(state.phase);
}

// Update HUD & Side Panels
function updateHUD() {
  if (typeof state === 'undefined' || !state) return;
  const formattedScore = formatScore(state.totalScore);
  if (hudTotal) hudTotal.textContent = formattedScore;

  if (phaseNumEl) {
    if (state.bossBattle && state.bossBattle.active) {
      const bossLbl = typeof t === 'function' ? t('boss_default_name').toUpperCase() : 'BOSS';
      phaseNumEl.textContent = `⚔️ ${bossLbl} ${state.phase}`;
    } else if (state.gameMode === 'timeattack') {
      phaseNumEl.textContent = `⏱️ ${state.timeAttackSecs}s`;
    } else if (state.gameMode === 'zen') {
      phaseNumEl.textContent = `ZEN ${state.phase}`;
    } else if (state.gameMode === 'training') {
      const lessonLbl = typeof t === 'function' ? t('hud_training_lesson').toUpperCase() : 'LESSON';
      phaseNumEl.textContent = `M${state.trainingWorld || 1} • ${lessonLbl} ${state.phase} / 3`;
    } else {
      phaseNumEl.textContent = state.phase;
    }
  }

  if (hitsDisplay)   hitsDisplay.textContent   = state.hitsPhase;
  if (errorsDisplay) errorsDisplay.textContent = state.errorsPhase;

  // Real-time WPM (PPM)
  const wpmDisplay = $('wpm-display');
  if (wpmDisplay) {
    if (state.startTime) {
      const wpm = calcPPM();
      state.currentWpm = wpm;
      wpmDisplay.textContent = `${wpm}`;
      try {
        const curBest = parseInt(localStorage.getItem('digitinho_best_wpm') || '0', 10);
        if (wpm > curBest) localStorage.setItem('digitinho_best_wpm', String(wpm));
      } catch (_) {}
      if (wpm >= 60) unlockAchievement('dedo_veloz');
    } else {
      wpmDisplay.textContent = '0';
    }
  }

  // Real-time Accuracy %
  const accuracyDisplay = $('accuracy-display');
  if (accuracyDisplay) {
    const totalAttempts = (state.totalHits || 0) + (state.totalErrors || 0);
    const acc = totalAttempts > 0 ? Math.round(((state.totalHits || 0) / totalAttempts) * 100) : 100;
    state.currentAccuracy = acc;
    accuracyDisplay.textContent = `${acc}%`;
  }

  // Combo Streak & Modo Fúria
  const comboDisplay = $('combo-display');
  const comboVal = state.combo || 0;
  if (comboDisplay) {
    comboDisplay.textContent = `${comboVal}×`;
    comboDisplay.className = 'smb-val ' + (comboVal >= 15 ? 'text-amber' : comboVal >= 5 ? 'text-sky' : '');
  }
  const gameCol = $('game-column');
  if (gameCol) {
    gameCol.classList.toggle('fury-mode', comboVal >= 15);
  }

  if (state.bossBattle && state.bossBattle.active) {
    const boss = state.bossBattle.boss || { lives: 3 };
    const currentLives = boss.lives || 0;
    const maxLives = 3;
    const bossHpPct = Math.max(0, Math.min(100, (currentLives / maxLives) * 100));
    if (progressFill) progressFill.style.width = bossHpPct + '%';
    const bossHpLbl = typeof t === 'function' ? t('hud_boss_hp') : 'BOSS HP';
    if (progressText) progressText.textContent = `${bossHpLbl}: ${currentLives} / ${maxLives}`;
  } else {
    const goal = phaseGoal();
    const pct  = Math.min(100, Math.max(0, (state.progress / goal) * 100));
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressText) {
      if (state.gameMode === 'training') {
        const lesson = state.phase || 1;
        const lessonName = typeof t === 'function' ? t(`training_lesson_${lesson}_name`) : (lesson === 1 ? 'Home Keys' : lesson === 2 ? 'Alternation' : 'Final Challenge');
        const lessonLbl = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
        progressText.textContent = `${state.progress} / ${goal} • ${lessonLbl} ${lesson}/3: ${lessonName}`;
      } else {
        progressText.textContent = `${state.progress} / ${goal}`;
      }
    }
  }

  let mult = state.speedMultiplier || 1.0;
  if ((state.activeTimers?.haste || 0) > 0) {
    mult += (typeof CFG !== 'undefined' && CFG.hasteSpeedBonus) ? CFG.hasteSpeedBonus : 0.5;
  }
  if ((state.activeTimers?.slowdown || 0) > 0) {
    mult *= 0.4;
  }
  mult = Math.round(mult * 100) / 100;
  const sx = (Math.abs(Math.round(mult * 100) - Math.round(mult * 10) * 10) > 0)
    ? mult.toFixed(2)
    : mult.toFixed(1);
  if (speedDisplay) speedDisplay.textContent = sx + '×';

  // Shield aura visual update
  const aura = $('shield-aura');
  if (aura) {
    if ((state.activeTimers?.shield || 0) > 0) {
      aura.classList.add('active');
    } else {
      aura.classList.remove('active');
    }
  }

  // Zen / Training Mode fixed indicator toggle in HUD
  const zenFixedBadge = $('zen-fixed-badge');
  if (zenFixedBadge) {
    if (state.gameMode === 'zen') {
      zenFixedBadge.textContent = typeof t === 'function' ? t('hud_zen_badge') : 'Zen';
      zenFixedBadge.classList.remove('hidden');
    } else if (state.gameMode === 'training') {
      const tw = typeof TRAINING_WORLDS !== 'undefined' ? TRAINING_WORLDS[state.trainingWorld || 1] : null;
      const lessonLabel = typeof t === 'function' ? t('hud_training_lesson') : 'Lesson';
      zenFixedBadge.textContent = tw ? `${tw.name} (${lessonLabel} ${state.phase}/3)` : (typeof t === 'function' ? t('hud_training_badge') : 'Training');
      zenFixedBadge.classList.remove('hidden');
    } else {
      zenFixedBadge.classList.add('hidden');
    }
  }

  // Render lives (hearts)
  if (livesRow) {
    livesRow.innerHTML = '';
    const livesLbl = $('hud-lives-lbl');
    const livesCountText = $('lives-count-text');
    if (state.gameMode === 'zen') {
      const zenPill = typeof t === 'function' ? t('hud_zen_pill') : 'No lives lost';
      const zenTitle = typeof t === 'function' ? t('hud_zen_pill_title') : '';
      livesRow.innerHTML = `<span class="zen-lives-pill" title="${zenTitle}">${zenPill}</span>`;
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? t('hud_zen_lbl') : 'ZEN MODE';
      if (livesCountText) {
        livesCountText.textContent = '∞';
        livesCountText.className = 'stat-lives-count';
      }
    } else if (state.gameMode === 'training') {
      const trainingTitle = typeof t === 'function' ? t('hud_training_pill_title') : '';
      const trainingLbl = typeof t === 'function' ? t('hud_training_lbl') : 'TRAINING';
      const freeLbl = typeof t === 'function' ? t('hud_free') : 'Free';
      livesRow.innerHTML = `<span class="zen-lives-pill" title="${trainingTitle}">${trainingLbl}</span>`;
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? t('hud_training_lbl') : 'TRAINING';
      if (livesCountText) {
        livesCountText.textContent = freeLbl;
        livesCountText.className = 'stat-lives-count';
      }
    } else {
      if (livesLbl) livesLbl.textContent = typeof t === 'function' ? t('hud_lives') : 'LIVES';
      const max = Math.min(10, state.maxLives || CFG.startLives);
      const cur = Math.max(0, state.lives);
      if (livesCountText) {
        livesCountText.textContent = `${cur} / ${max}`;
        livesCountText.className = 'stat-lives-count' + (cur <= 1 ? ' danger' : cur === 2 ? ' warn' : '');
      }
      for (let i = 0; i < max; i++) {
        const s = document.createElement('span');
        s.className = 'heart-icon' + (i >= cur ? ' lost' : '');
        s.textContent = i < cur ? '❤️' : '🤍';
        livesRow.appendChild(s);
      }
    }
    const mobileLives = $('hud-mobile-lives');
    if (mobileLives) {
      mobileLives.innerHTML = livesRow.innerHTML;
    }
  }

  // Render unlocked words in side panel (misteriosamente aparece a partir da Fase 3)
  if (wordsList) {
    wordsList.innerHTML = '';
    if (state.phase >= 3 && state.unlockedWords && state.unlockedWords.length > 0) {
      state.unlockedWords.forEach(w => {
        const completed = state.wordStats[w.text.toLowerCase()]?.count || 0;
        const d = document.createElement('div');
        d.className = 'word-tag';
        d.innerHTML = `<span>${w.text.toUpperCase()}</span><span class="wt-pts">${completed > 0 ? `✓×${completed}` : `+${wordPts(w.text)}`}</span>`;
        wordsList.appendChild(d);
      });
    }
  }

  renderSkills();
}

// Render skill slots cleanly with persistent active state and duration bar
function renderSkills() {
  if (!skillsCont) return;
  if (typeof state === 'undefined' || !state || !Array.isArray(state.skillSlots)) return;

  if (state.skillSlots.length === 0) {
    const emptyHint = typeof t === 'function' ? t('hud_skills_empty_hint') : 'Buy in the shop<br/>or complete words <strong>⚡</strong>';
    skillsCont.innerHTML = `<div class="empty-hint">${emptyHint}</div>`;
    return;
  }

  // Remove empty hint if present
  if (skillsCont.querySelector('.empty-hint')) {
    skillsCont.innerHTML = '';
  }

  const existingPills = Array.from(skillsCont.querySelectorAll('.skill-pill'));
  const needsRebuild = existingPills.length !== state.skillSlots.length ||
    existingPills.some((p, i) => p.dataset.skillId !== state.skillSlots[i].id);

  if (needsRebuild) {
    skillsCont.innerHTML = '';
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      const pill = createSkillPill(slot, idx, def);
      skillsCont.appendChild(pill);
    });
  } else {
    state.skillSlots.forEach((slot, idx) => {
      const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[slot.id]) || SKILLS_ALL.find(s => s.id === slot.id);
      if (!def) return;
      updateSkillPill(existingPills[idx], slot, idx, def);
    });
  }
}

function createSkillPill(slot, idx, def) {
  const pill = document.createElement('div');
  pill.className = 'skill-pill';
  pill.dataset.skillId = slot.id;
  const sName = (typeof t === 'function' && t('skill_' + slot.id + '_name') !== ('skill_' + slot.id + '_name')) ? t('skill_' + slot.id + '_name') : def.name;
  const sDesc = (typeof t === 'function' && t('skill_' + slot.id + '_desc') !== ('skill_' + slot.id + '_desc')) ? t('skill_' + slot.id + '_desc') : def.desc;
  pill.title = sDesc;

  pill.innerHTML = `
    <div class="sp-main">
      <span class="sp-icon">${def.icon}</span>
      <div class="sp-info">
        <span class="sp-name">${sName}</span>
        <span class="sp-dur-text"></span>
      </div>
    </div>
    <div class="sp-badges">
      <kbd class="sp-key-badge">${idx + 1}</kbd>
      <span class="sp-count-badge"></span>
    </div>
    <div class="sp-active-bar-track">
      <div class="sp-active-bar"></div>
    </div>
  `;

  updateSkillPill(pill, slot, idx, def);
  return pill;
}

function updateSkillPill(pill, slot, idx, def) {
  const timer = state.activeTimers[slot.id] || 0;
  const isActive = timer > 0;
  const totalDur = def.duration || 10000;
  const pct = Math.min(100, Math.max(0, (timer / totalDur) * 100));

  pill.classList.toggle('sp-is-active', isActive);

  if (slot.count > 0) {
    pill.onclick = () => activateSkill(idx);
    pill.style.cursor = 'pointer';
  } else {
    pill.onclick = null;
    pill.style.cursor = 'default';
  }

  const activeLabel = typeof t === 'function' ? t('hud_active') : 'ATIVO';

  const durText = pill.querySelector('.sp-dur-text');
  if (durText) {
    if (isActive) {
      durText.className = 'sp-dur-text sp-dur';
      durText.textContent = `${(timer / 1000).toFixed(1)}s ${activeLabel.toLowerCase()}`;
    } else {
      durText.className = 'sp-dur-text sp-dur-hint';
      durText.textContent = def.desc.split(' ').slice(0, 3).join(' ');
    }
  }

  const keyBadge = pill.querySelector('.sp-key-badge');
  if (keyBadge) {
    keyBadge.textContent = idx + 1;
    const keyLabel = (typeof t === 'function' && t('hud_key_label') !== 'hud_key_label') ? t('hud_key_label') : 'Tecla';
    keyBadge.title = `${keyLabel} [${idx + 1}]`;
    keyBadge.style.opacity = '1';
    keyBadge.classList.toggle('sp-key-empty', slot.count === 0 && !isActive);
  }

  const countBadge = pill.querySelector('.sp-count-badge');
  if (countBadge) {
    if (isActive && slot.count === 0) {
      countBadge.className = 'sp-count-badge sp-active-badge';
      countBadge.textContent = activeLabel.toUpperCase();
    } else {
      countBadge.className = 'sp-count-badge';
      countBadge.textContent = `×${slot.count}`;
    }
  }

  const track = pill.querySelector('.sp-active-bar-track');
  const bar = pill.querySelector('.sp-active-bar');
  if (track && bar) {
    track.style.display = isActive ? 'block' : 'none';
    if (isActive) {
      bar.style.width = pct.toFixed(1) + '%';
      if (def.color) {
        bar.style.background = def.color;
        bar.style.boxShadow = `0 0 8px ${def.color}`;
      }
    }
  }
}

// Render upcoming queue bar
function renderQueue() {
  if (!queueItemsEl) return;
  queueItemsEl.innerHTML = '';
  if (state.bossBattle && state.bossBattle.active) {
    const qb = document.createElement('div');
    qb.className = 'queue-boss-indicator';
    qb.style.cssText = 'color:var(--accent-amber);font-weight:800;font-size:0.75rem;display:flex;align-items:center;gap:6px;padding:4px 8px;letter-spacing:0.03em;';
    const bossHpLbl = typeof t === 'function' ? t('hud_boss_hp') : 'BOSS HP';
    const enigmaIdx = (state.bossBattle.meaningIndex || 0) + 1;
    const enigmaLbl = typeof t === 'function' ? t('boss_enigma_queue', { num: enigmaIdx }) : `ENIGMA ${enigmaIdx} / 3`;
    qb.innerHTML = `⚔️ ${enigmaLbl} &bull; ${bossHpLbl}: ${state.bossBattle.boss?.lives || 0}/3`;
    queueItemsEl.appendChild(qb);
    return;
  }
  const show = Math.min(state.spawnQueue.length, 6);
  for (let i = 0; i < show; i++) {
    const qi = state.spawnQueue[i];
    const el = document.createElement('div');
    let cls = `qi ${qi.type}`;
    if (qi.skill) cls += ' has-skill-q';
    el.className = cls;
    el.textContent = qi.text;
    queueItemsEl.appendChild(el);
  }
}

// Temporary feedback message in game board
function showFeedback(msg, type) {
  if (!feedbackEl) return;
  feedbackEl.textContent = msg;
  feedbackEl.className   = '';
  void feedbackEl.offsetWidth;
  feedbackEl.className =
    type === 'success' ? 'fb-success' :
    type === 'special' ? 'fb-special' : 'fb-error';
}

// Particle explosion
function spawnParticles(el, pts) {
  const r    = el.getBoundingClientRect();
  const cx   = r.left + r.width  / 2;
  const cy   = r.top  + r.height / 2;
  const cols = ['#6366f1','#38bdf8','#f59e0b','#22c55e','#f472b6','#a78bfa','#e879f9'];
  const cnt  = Math.min(pts + 3, 14);

  for (let i = 0; i < cnt; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const sz    = rand(4, 9);
    const angle = rand(0, Math.PI * 2);
    const dist  = rand(20, 65);
    p.style.cssText = `width:${sz}px;height:${sz}px;background:${pick(cols)};left:${cx}px;top:${cy}px;--tx:${Math.cos(angle) * dist}px;--ty:${Math.sin(angle) * dist}px;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

// Shockwave ring for bomb area explosion
function createExplosionRing(cx, cy, radius, isBig) {
  const ring = document.createElement('div');
  ring.className    = isBig ? 'bomb-ring bomb-ring-big' : 'bomb-ring';
  ring.style.left   = (cx - radius) + 'px';
  ring.style.top    = (cy - radius) + 'px';
  ring.style.width  = (radius * 2) + 'px';
  ring.style.height = (radius * 2) + 'px';
  gameArea.appendChild(ring);
  setTimeout(() => ring.remove(), 520);
}

// ============================================================
// CELEBRATORY CONFETTI FOR PHASE COMPLETION
// ============================================================
let confettiRaf = null;
let confettiParticles = [];

function launchConfetti() {
  const canvas = $('confetti-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width  = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const colors = [
    '#4F46E5', '#0284C7', '#10B981', '#EA580C',
    '#FF4757', '#8B5CF6', '#F59E0B', '#EC4899', '#38BDF8'
  ];

  confettiParticles = [];
  const count = 160;

  for (let i = 0; i < count; i++) {
    let originX, originY, angle, speed;

    if (i < 45) {
      // Cannon Left: blasts towards center/top-right
      originX = w * 0.12;
      originY = h * 0.85;
      angle   = -Math.PI * 0.42 + (Math.random() - 0.5) * 0.6;
      speed   = 14 + Math.random() * 16;
    } else if (i < 90) {
      // Cannon Right: blasts towards center/top-left
      originX = w * 0.88;
      originY = h * 0.85;
      angle   = -Math.PI * 0.58 + (Math.random() - 0.5) * 0.6;
      speed   = 14 + Math.random() * 16;
    } else if (i < 125) {
      // Center burst: blasts upwards
      originX = w * 0.5 + (Math.random() - 0.5) * (w * 0.3);
      originY = h * 0.7;
      angle   = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.8;
      speed   = 12 + Math.random() * 14;
    } else {
      // Top shower: floats down gracefully
      originX = Math.random() * w;
      originY = -20 - Math.random() * 100;
      angle   = Math.PI * 0.5 + (Math.random() - 0.5) * 0.4;
      speed   = 2 + Math.random() * 4;
    }

    confettiParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 9 + Math.random() * 8,
      color: pick(colors),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.22,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.07 + Math.random() * 0.08,
      isCircle: Math.random() < 0.25,
      opacity: 1,
      drag: 0.978 + Math.random() * 0.012,
      gravity: 0.32 + Math.random() * 0.12,
    });
  }

  if (confettiRaf) cancelAnimationFrame(confettiRaf);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeCount = 0;

    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.rotation += p.rotationSpeed;
      p.wobble   += p.wobbleSpeed;

      if (p.vy > 1.5) {
        p.opacity = Math.max(0, p.opacity - 0.005);
      }

      if (p.opacity > 0 && p.y < h + 30) {
        activeCount++;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const scaleX = Math.cos(p.wobble);
        ctx.scale(scaleX, 1);

        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size * 0.5, -p.size * 0.3, p.size, p.size * 0.6);
        }
        ctx.restore();
      }
    }

    if (activeCount > 0) {
      confettiRaf = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiRaf = null;
      canvas.style.display = 'none';
    }
  }

  confettiRaf = requestAnimationFrame(render);
}

function stopConfetti() {
  if (confettiRaf) {
    cancelAnimationFrame(confettiRaf);
    confettiRaf = null;
  }
  const canvas = $('confetti-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
  }
}

// Animated background letters on start screen
(function initStartBg() {
  const deco = $('bg-deco');
  if (!deco) return;
  const items = ['A','B','C','DE','CA','MA','GATO','CASA','NO','PE','TO','VI','RE','LA','LUA','SOL'];
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:absolute;
      font-family:'Plus Jakarta Sans','Inter',sans-serif; font-weight:700;
      font-size:${0.85 + Math.random() * 1.1}rem;
      color:rgba(255,255,255,0.85);
      background:rgba(99,102,241,${0.08 + Math.random() * 0.12});
      border-radius:10px;
      padding:${6 + Math.random() * 6}px ${10 + Math.random() * 10}px;
      left:${Math.random() * 90}%;
      top:${Math.random() * 90}%;
      transform:rotate(${(Math.random() - 0.5) * 24}deg);
      animation:decoF ${4 + Math.random() * 5}s ease-in-out ${Math.random() * 4}s infinite alternate;
      border:none;
    `;
    el.textContent = items[Math.floor(Math.random() * items.length)];
    deco.appendChild(el);
  }

  const s = document.createElement('style');
  s.textContent = `@keyframes decoF{from{transform:translateY(0) rotate(var(--r,0deg))}to{transform:translateY(-16px) rotate(var(--r,0deg))}}`;
  document.head.appendChild(s);
})();

// ============================================================
// PAUSE COUNTDOWN ("3, 2, 1, VAI!")
// ============================================================
let countdownActive  = false;
let countdownTimerId = null;

function runResumeCountdown(onComplete) {
  const overlay = $('countdown-overlay');
  const numEl   = $('countdown-num');
  if (!overlay || !numEl) {
    onComplete();
    return;
  }

  countdownActive = true;
  overlay.classList.remove('hidden');

  let count = 3;
  numEl.textContent = String(count);
  numEl.style.animation = 'none';
  void numEl.offsetWidth;
  numEl.style.animation = '';
  playSound('countdown');

  const tick = () => {
    count--;
    if (count > 0) {
      numEl.textContent = String(count);
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
      playSound('countdown');
      countdownTimerId = setTimeout(tick, 700);
    } else if (count === 0) {
      numEl.textContent = typeof t === 'function' ? t('countdown_go') : 'GO!';
      numEl.style.animation = 'none';
      void numEl.offsetWidth;
      numEl.style.animation = '';
      playSound('countdownGo');
      countdownTimerId = setTimeout(() => {
        overlay.classList.add('hidden');
        countdownActive = false;
        onComplete();
      }, 400);
    }
  };
  countdownTimerId = setTimeout(tick, 700);
}

function cancelResumeCountdown() {
  if (countdownTimerId) clearTimeout(countdownTimerId);
  countdownActive = false;
  const overlay = $('countdown-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ============================================================
// ACHIEVEMENTS SYSTEM
// ============================================================
function showAchievementToast(ach) {
  const toast = $('achievement-toast');
  if (!toast) return;
  const icon = $('at-icon');
  const name = $('at-name');
  const desc = $('at-desc');
  if (icon) icon.textContent = ach.icon || '🏆';
  if (name) name.textContent = ach.name;
  if (desc) desc.textContent = ach.desc;

  toast.classList.remove('hidden');
  playSound('achievement');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.add('hidden'), 4000);
}

function unlockAchievement(id) {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('digitinho_achievements') || '{}');
  } catch (_) {}
  if (saved[id]) return;
  saved[id] = Date.now();
  try {
    localStorage.setItem('digitinho_achievements', JSON.stringify(saved));
  } catch (_) {}
  const def = (typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : []).find(a => a.id === id);
  if (def) showAchievementToast(def);
}

let achPaused = false;
let achOpenedFromPause = false;

function showConquistas() {
  // If pause overlay is currently visible, hide it while conquistas modal is open
  const pauseOverlay = $('pause-overlay');
  if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) {
    achOpenedFromPause = true;
    pauseOverlay.classList.add('hidden');
  } else {
    achOpenedFromPause = false;
  }

  if (screenGame?.classList.contains('active') && !state.paused && !state.phaseComplete) {
    achPaused    = true;
    state.paused = true;
    cancelAnimationFrame(state.rafId);
    clearTimeout(state.spawnTimer);
  }

  // Pre-check retroactive unlock for Colecionador
  if (state.unlockedWords && state.unlockedWords.length >= (typeof WORD_POOL !== 'undefined' ? WORD_POOL.length : 30)) {
    unlockAchievement('colecionador');
  }

  renderConquistasModal();

  const modal = $('modal-conquistas');
  if (modal) modal.classList.remove('hidden');
}

function closeConquistas() {
  const modal = $('modal-conquistas');
  if (modal) modal.classList.add('hidden');

  // If opened from pause menu, restore pause menu
  if (achOpenedFromPause) {
    achOpenedFromPause = false;
    const pauseOverlay = $('pause-overlay');
    if (pauseOverlay) pauseOverlay.classList.remove('hidden');
    return;
  }

  if (achPaused) {
    achPaused = false;
    if (!state.escPaused && !state.phaseComplete) {
      state.paused = false;
      state.lastTs = null;
      state.rafId  = requestAnimationFrame(gameLoop);
      if (!state.bossBattle || !state.bossBattle.active) {
        scheduleSpawn();
      }
      hiddenInput?.focus();
    }
  }
}

function renderConquistasModal() {
  const grid  = $('achievements-grid');
  const badge = $('achievements-counter-badge');
  if (!grid || !badge) return;
  grid.innerHTML = '';

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem('digitinho_achievements') || '{}');
  } catch (_) {}

  const bestWpm    = Math.max(state.currentWpm || 0, parseInt(localStorage.getItem('digitinho_best_wpm') || '0', 10));
  const bestCombo  = Math.max(state.maxCombo || 0, parseInt(localStorage.getItem('digitinho_best_combo') || '0', 10));
  const wordsCount = state.unlockedWords ? state.unlockedWords.length : 0;

  const total = (typeof ACHIEVEMENTS !== 'undefined') ? ACHIEVEMENTS.length : 6;
  const list  = (typeof ACHIEVEMENTS !== 'undefined') ? ACHIEVEMENTS : [];
  const unlockedCount = list.filter(a => !!saved[a.id]).length;
  badge.textContent = (typeof t === 'function')
    ? t('ach_counter', { unlocked: unlockedCount, total: total })
    : `${unlockedCount} / ${total} Unlocked`;

  list.forEach(ach => {
    const isUnlocked = !!saved[ach.id];
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'ach-unlocked' : 'ach-locked'}`;

    let curVal = 0;
    const target = ach.target || 1;
    let progressTxt = '';

    if (ach.id === 'dedo_veloz') {
      curVal = Math.min(target, bestWpm);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (60+ ' + t('hud_wpm') + ')') : `Record: ${curVal} / ${target} ${t('hud_wpm')}`;
    } else if (ach.id === 'cirurgico') {
      curVal = isUnlocked ? 100 : (state.currentAccuracy ? Math.round(state.currentAccuracy) : 0);
      const accLabel = typeof t === 'function' ? t('hud_accuracy') : 'ACCURACY';
      progressTxt = isUnlocked ? `${t('ach_goal_reached')} (100% ${accLabel})` : `100% ${accLabel}`;
    } else if (ach.id === 'colecionador') {
      curVal = Math.min(target, wordsCount);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ` (${target} ${t('ach_unit_words')})`) : `${curVal} / ${target} ${t('ach_unit_words')}`;
    } else if (ach.id === 'mestre_combo') {
      curVal = Math.min(target, bestCombo);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (30+ combo)') : `${curVal} / ${target} ${t('ach_unit_streak')}`;
    } else if (ach.id === 'modo_furia') {
      curVal = Math.min(target, bestCombo);
      progressTxt = isUnlocked ? (t('ach_goal_reached') + ' (15+ combo)') : `${curVal} / ${target} ${t('ach_unit_combo')}`;
    } else if (ach.id === 'mestre_tipo') {
      let curWords = 0;
      try {
        curWords = parseInt(localStorage.getItem('digitinho_words_completed') || '0', 10);
      } catch (_) {}
      curVal = Math.min(target, curWords);
      const unitTxt = typeof t === 'function' ? t('ach_unit_words') : 'words';
      progressTxt = isUnlocked
        ? ((typeof t === 'function' ? t('ach_goal_reached') : 'Goal reached') + ` (100+ ${unitTxt})`)
        : `${curVal} / ${target} ${unitTxt}`;
    }

    const pct = isUnlocked ? 100 : Math.min(100, Math.max(0, Math.round((curVal / target) * 100)));

    let dateStr = '';
    if (isUnlocked && saved[ach.id]) {
      try {
        const d = new Date(saved[ach.id]);
        dateStr = d.toLocaleDateString();
      } catch (_) {}
    }

    const statusTxt = isUnlocked
      ? (typeof t === 'function' ? t('ach_status_unlocked') : '✓ Unlocked')
      : (typeof t === 'function' ? t('ach_status_locked') : 'Locked');

    const achName = (typeof t === 'function' && t('ach_' + ach.id + '_name') !== ('ach_' + ach.id + '_name')) ? t('ach_' + ach.id + '_name') : ach.name;
    const achDesc = (typeof t === 'function' && t('ach_' + ach.id + '_desc') !== ('ach_' + ach.id + '_desc')) ? t('ach_' + ach.id + '_desc') : ach.desc;

    const lockSvg = `<svg class="ach-lock-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;opacity:0.8;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

    card.innerHTML = `
      <div class="ach-icon-seal">
        <span>${isUnlocked ? ach.icon : lockSvg}</span>
      </div>
      <div class="ach-details">
        <div class="ach-title-row">
          <span class="ach-name">${achName}</span>
          <span class="ach-status-badge">${statusTxt}</span>
        </div>
        <p class="ach-desc">${achDesc}</p>
        <div class="ach-progress-wrap">
          <div class="ach-progress-bar">
            <div class="ach-progress-fill" style="width: ${pct}%"></div>
          </div>
          <span class="ach-progress-text">${progressTxt}${dateStr ? ` <span class="ach-date-text">&bull; ${dateStr}</span>` : ''}</span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ============================================================
// TRAINING MODE MODAL (KEYBOARD ROW PROGRESSION)
// ============================================================
function openTrainingModal() {
  renderTrainingWorlds();
  const modal = $('modal-training');
  if (modal) modal.classList.remove('hidden');
}

function closeTrainingModal() {
  const modal = $('modal-training');
  if (modal) modal.classList.add('hidden');
}

function renderTrainingWorlds() {
  const grid = $('training-worlds-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const worlds = typeof getTrainingWorlds === 'function' ? getTrainingWorlds() : (typeof TRAINING_WORLDS !== 'undefined' ? TRAINING_WORLDS : {});

  Object.values(worlds).forEach(w => {
    let isCompleted = false;
    let bestAcc = null;
    try {
      isCompleted = localStorage.getItem(`digitinho_training_world_${w.id}`) === 'completed';
      const savedPrec = localStorage.getItem(`digitinho_training_precision_${w.id}`);
      if (savedPrec !== null) {
        bestAcc = parseFloat(savedPrec).toFixed(1);
      } else if (isCompleted) {
        // Baseline for completed world prior to precision logging
        bestAcc = '100.0';
      }
    } catch (_) {}

    const card = document.createElement('div');
    card.className = 'training-world-card' + (isCompleted ? ' twc-completed' : '');
    card.style.setProperty('--card-color', w.color || 'var(--accent-cyan)');

    const keysHtml = w.chars.map(c => `<span class="twc-key-badge">${c}</span>`).join('');
    const statusCompleted = typeof t === 'function' ? t('training_completed') : '🏅 Completed (Mastery)';
    const statusPending   = typeof t === 'function' ? t('training_pending') : '🎯 3 Lessons';
    const statusBadge = isCompleted
      ? `<span class="twc-status-badge">${statusCompleted}</span>`
      : `<span class="twc-status-badge twc-status-pending">${statusPending}</span>`;

    const recordLabel = typeof t === 'function' && bestAcc !== null
      ? t('training_record_acc', { acc: bestAcc })
      : `🎯 Record: ${bestAcc || '100.0'}% Precision`;
    const recordBadge = (isCompleted && bestAcc !== null)
      ? `<span class="twc-record-badge" title="${bestAcc}% Precision Record">${recordLabel}</span>`
      : '';

    const btnAgain = typeof t === 'function' ? t('training_btn_again') : 'Train Again 🔄';
    const btnStart = typeof t === 'function' ? t('training_btn_start') : 'Start Training (3 Lessons) →';

    card.innerHTML = `
      <div class="twc-head">
        <div class="twc-icon-wrap" style="color: ${w.color || 'inherit'}">
          <span>${w.icon}</span>
        </div>
        <div class="twc-title-col">
          <div class="twc-name">${w.name}</div>
          <div class="twc-meta-row">
            ${statusBadge}
            ${recordBadge}
          </div>
        </div>
      </div>
      <p class="twc-desc">${w.desc}</p>
      <div class="twc-keys-preview">
        ${keysHtml}
      </div>
      <button class="twc-start-btn" type="button" onclick="startTrainingWorld(${w.id})">
        ${isCompleted ? btnAgain : btnStart}
      </button>
    `;

    grid.appendChild(card);
  });
}

// ============================================================
// MOBILE VIRTUAL KEYBOARD AUTO-ADAPTATION (window.visualViewport)
// ============================================================
function updateMobileViewport() {
  const vv = window.visualViewport;
  const layout = $('layout');
  const screenGame = $('screen-game');
  const hud = $('hud');

  if (!vv) return;

  const vh = vv.height;
  const vw = vv.width;
  const fullH = window.innerHeight;
  const diff = fullH - vh;
  // Android and iOS virtual keyboards typically occupy 120px to 450px
  const isKeyboardOpen = diff > 100;

  document.documentElement.style.setProperty('--visual-viewport-height', `${vh}px`);
  document.documentElement.style.setProperty('--visual-viewport-width', `${vw}px`);
  document.documentElement.style.setProperty('--keyboard-height', `${Math.max(0, diff)}px`);

  if (isKeyboardOpen) {
    document.body.classList.add('keyboard-active');

    if (screenGame) {
      screenGame.style.height = `${vh}px`;
      screenGame.style.maxHeight = `${vh}px`;
      screenGame.style.bottom = 'auto';
    }

    const hudH = hud?.offsetHeight || 50;
    if (layout) {
      layout.style.maxHeight = `${Math.max(140, vh - hudH - 8)}px`;
    }

    // Safety reposition: prevent falling items from being clipped or unfairly falling out of view
    if (typeof state !== 'undefined' && state?.activeItems && typeof gameArea !== 'undefined' && gameArea) {
      const boardH = gameArea.clientHeight;
      if (boardH > 80) {
        state.activeItems.forEach(item => {
          if (!item.removing && item.y > boardH - 45) {
            item.y = Math.max(10, boardH - 65);
            if (item.el) item.el.style.top = `${item.y}px`;
          }
        });
      }
    }

    window.scrollTo(0, 0);
  } else {
    document.body.classList.remove('keyboard-active');

    if (screenGame) {
      screenGame.style.height = '';
      screenGame.style.maxHeight = '';
      screenGame.style.bottom = '';
    }

    if (layout) {
      layout.style.maxHeight = '';
    }
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateMobileViewport);
  window.visualViewport.addEventListener('scroll', () => {
    if (document.body.classList.contains('keyboard-active')) {
      window.scrollTo(0, 0);
    }
    updateMobileViewport();
  });
}
window.addEventListener('resize', updateMobileViewport);
window.addEventListener('orientationchange', () => setTimeout(updateMobileViewport, 250));

// Initial call
updateMobileViewport();

// ============================================================
// BOSS BATTLE UI RENDERING (MONSTER / ROBOT WITH LIVES: |||)
// ============================================================
function getBossSpriteSvg(boss) {
  const type = boss?.type || 'robot';
  const primaryColor = boss?.color || '#06B6D4';

  if (type === 'robot') {
    // 1. Cyber Robot: Antennas, scanning laser visor, metallic plates, chest reactor
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="robotMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#475569" />
            <stop offset="50%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
          <linearGradient id="robotVisor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#06B6D4" />
            <stop offset="50%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#06B6D4" />
          </linearGradient>
          <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Antenna with blinking red warning orb -->
        <line x1="40" y1="12" x2="40" y2="4" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="40" cy="3" r="3" fill="#EF4444" filter="url(#laserGlow)" class="boss-antenna-light" />
        
        <line x1="26" y1="16" x2="20" y2="9" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="19" cy="8" r="2" fill="${primaryColor}" />
        <line x1="54" y1="16" x2="60" y2="9" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="61" cy="8" r="2" fill="${primaryColor}" />

        <!-- Ears / Sensors -->
        <rect x="15" y="24" width="6" height="14" rx="2" fill="#334155" stroke="${primaryColor}" stroke-width="1.2" />
        <rect x="59" y="24" width="6" height="14" rx="2" fill="#334155" stroke="${primaryColor}" stroke-width="1.2" />

        <!-- Head Chassis -->
        <rect x="20" y="14" width="40" height="34" rx="8" fill="url(#robotMetal)" stroke="${primaryColor}" stroke-width="2" />
        
        <!-- Glowing Cyber Visor with scanning laser beam -->
        <rect x="25" y="24" width="30" height="10" rx="4" fill="#030712" stroke="#0284C7" stroke-width="1" />
        <rect x="26" y="25.5" width="28" height="7" rx="3" fill="url(#robotVisor)" filter="url(#laserGlow)" opacity="0.9" />
        <line x1="26" y1="29" x2="54" y2="29" stroke="#FFFFFF" stroke-width="1.2" class="boss-scan-line" />

        <!-- Vocoder grille -->
        <line x1="30" y1="40" x2="50" y2="40" stroke="${primaryColor}" stroke-width="1.5" stroke-linecap="round" />
        <line x1="33" y1="43" x2="47" y2="43" stroke="#94A3B8" stroke-width="1.2" stroke-linecap="round" />

        <!-- Neck & Torso Plate -->
        <path d="M 28 48 L 52 48 L 56 66 L 24 66 Z" fill="url(#robotMetal)" stroke="${primaryColor}" stroke-width="1.8" />
        <!-- Glowing Core Reactor -->
        <circle cx="40" cy="57" r="5" fill="#EF4444" filter="url(#laserGlow)" class="boss-core-pulse" />
        <circle cx="40" cy="57" r="2" fill="#FFFFFF" />

        <!-- Shoulder armor pads -->
        <polygon points="22,48 10,54 18,66 26,60" fill="#334155" stroke="${primaryColor}" stroke-width="1.5" />
        <polygon points="58,48 70,54 62,66 54,60" fill="#334155" stroke="${primaryColor}" stroke-width="1.5" />

        <!-- Hover Plasma Thrusters -->
        <ellipse cx="32" cy="68" rx="4" ry="2" fill="#38BDF8" opacity="0.8" />
        <ellipse cx="48" cy="68" rx="4" ry="2" fill="#38BDF8" opacity="0.8" />
      </svg>
    `;
  } else if (type === 'beast') {
    // 2. Feral Apex: Golden mane, predator eyes, fangs, feral ears and tribal markings
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="beastMane" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#D97706" />
            <stop offset="50%" stop-color="#B45309" />
            <stop offset="100%" stop-color="#78350F" />
          </linearGradient>
          <linearGradient id="beastFur" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FBBF24" />
            <stop offset="100%" stop-color="#D97706" />
          </linearGradient>
          <filter id="beastGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Flaring Mane Back -->
        <path d="M 12 28 Q 6 12 24 10 Q 40 2 56 10 Q 74 12 68 28 Q 78 46 66 64 Q 40 76 14 64 Q 2 46 12 28 Z" fill="url(#beastMane)" stroke="#F59E0B" stroke-width="1.5" />

        <!-- Pointed Predator Ears -->
        <polygon points="22,18 14,4 32,14" fill="#78350F" stroke="#F59E0B" stroke-width="1.5" />
        <polygon points="58,18 66,4 48,14" fill="#78350F" stroke="#F59E0B" stroke-width="1.5" />
        <polygon points="23,16 18,8 29,14" fill="#FBBF24" />
        <polygon points="57,16 62,8 51,14" fill="#FBBF24" />

        <!-- Lion / Wolf Face Structure -->
        <polygon points="24,20 56,20 62,40 50,54 30,54 18,40" fill="url(#beastFur)" stroke="#F59E0B" stroke-width="1.8" />
        
        <!-- Feral Brow & Markings -->
        <path d="M 28 22 L 40 32 L 52 22" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
        <line x1="40" y1="18" x2="40" y2="30" stroke="#78350F" stroke-width="2" stroke-linecap="round" />

        <!-- Piercing Golden Eyes with Slit Pupils -->
        <ellipse cx="30" cy="32" rx="5" ry="3.5" fill="#FEF08A" filter="url(#beastGlow)" />
        <ellipse cx="50" cy="32" rx="5" ry="3.5" fill="#FEF08A" filter="url(#beastGlow)" />
        <ellipse cx="30" cy="32" rx="1.8" ry="3" fill="#000000" />
        <ellipse cx="50" cy="32" rx="1.8" ry="3" fill="#000000" />

        <!-- Snout & Predator Fangs -->
        <polygon points="36,40 44,40 40,46" fill="#78350F" />
        <path d="M 33 46 Q 40 50 47 46" stroke="#451A03" stroke-width="2" fill="none" stroke-linecap="round" />
        <polygon points="33,47 36,47 34.5,53" fill="#FFFFFF" />
        <polygon points="44,47 47,47 45.5,53" fill="#FFFFFF" />

        <!-- Muscular Chest Plate & Claws Clasp -->
        <path d="M 26 54 L 54 54 L 60 70 L 20 70 Z" fill="url(#beastMane)" stroke="#F59E0B" stroke-width="1.6" />
        <circle cx="40" cy="62" r="4.5" fill="#F59E0B" filter="url(#beastGlow)" />
        <circle cx="40" cy="62" r="2" fill="#FFFFFF" />
      </svg>
    `;
  } else if (type === 'mythology') {
    // 3. Arcane Chimera / Dragon: Sweeping horns, mystic third eye, crest spikes, arcane wings
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mythSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6B21A8" />
            <stop offset="50%" stop-color="#4C1D95" />
            <stop offset="100%" stop-color="#2E1065" />
          </linearGradient>
          <filter id="mythGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Magnificent Dragon / Chimera Horns -->
        <path d="M 24 20 Q 12 4 4 8 Q 12 18 20 25 Z" fill="#C084FC" stroke="#A855F7" stroke-width="1.8" />
        <path d="M 56 20 Q 68 4 76 8 Q 68 18 60 25 Z" fill="#C084FC" stroke="#A855F7" stroke-width="1.8" />

        <!-- Crest Spikes -->
        <polygon points="34,14 40,2 46,14" fill="#A855F7" stroke="#E9D5FF" stroke-width="1" />
        <polygon points="24,18 28,8 34,16" fill="#7E22CE" />
        <polygon points="56,18 52,8 46,16" fill="#7E22CE" />

        <!-- Face Mask -->
        <polygon points="22,18 58,18 64,36 52,52 28,52 16,36" fill="url(#mythSkin)" stroke="#A855F7" stroke-width="2" />

        <!-- Arcane Third Eye Rune in Forehead -->
        <circle cx="40" cy="22" r="3.5" fill="#E879F9" filter="url(#mythGlow)" />
        <circle cx="40" cy="22" r="1.5" fill="#FFFFFF" />

        <!-- Glowing Mystic Eyes -->
        <polygon points="25,32 35,32 33,37 25,36" fill="#F472B6" filter="url(#mythGlow)" />
        <polygon points="55,32 45,32 47,37 55,36" fill="#F472B6" filter="url(#mythGlow)" />
        <circle cx="30" cy="34" r="1.2" fill="#FFFFFF" />
        <circle cx="50" cy="34" r="1.2" fill="#FFFFFF" />

        <!-- Dragon Snout & Mystic Breath Grille -->
        <path d="M 32 42 L 36 46 L 40 42 L 44 46 L 48 42" stroke="#E879F9" stroke-width="1.8" stroke-linecap="round" fill="none" />

        <!-- Neck Plate & Sigil -->
        <path d="M 28 52 L 52 52 L 58 68 L 22 68 Z" fill="url(#mythSkin)" stroke="#A855F7" stroke-width="1.8" />
        <polygon points="40,56 46,62 40,68 34,62" fill="#C084FC" filter="url(#mythGlow)" />
        <polygon points="40,58 44,62 40,66 36,62" fill="#FFFFFF" />
      </svg>
    `;
  } else if (type === 'ocean') {
    // 4. Abyssal Leviathan: Crown fins, glowing tentacles, sapphire eyes, deep pelagic gills
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oceanSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0284C7" />
            <stop offset="50%" stop-color="#0369A1" />
            <stop offset="100%" stop-color="#082F49" />
          </linearGradient>
          <filter id="oceanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Dorsal Fin Crown -->
        <polygon points="40,2 48,16 32,16" fill="#38BDF8" filter="url(#oceanGlow)" />
        <polygon points="28,8 34,18 24,18" fill="#0284C7" />
        <polygon points="52,8 46,18 56,18" fill="#0284C7" />

        <!-- Arching Bioluminescent Tentacles -->
        <path d="M 16 36 Q 4 48 8 62 Q 14 66 18 54" stroke="#38BDF8" stroke-width="2.5" fill="none" stroke-linecap="round" filter="url(#oceanGlow)" />
        <path d="M 64 36 Q 76 48 72 62 Q 66 66 62 54" stroke="#38BDF8" stroke-width="2.5" fill="none" stroke-linecap="round" filter="url(#oceanGlow)" />

        <!-- Abyssal Head / Shell -->
        <ellipse cx="40" cy="32" rx="22" ry="18" fill="url(#oceanSkin)" stroke="#38BDF8" stroke-width="2" />

        <!-- Glowing Oceanic Eyes -->
        <ellipse cx="29" cy="30" rx="4.5" ry="3.5" fill="#00F5FF" filter="url(#oceanGlow)" />
        <ellipse cx="51" cy="30" rx="4.5" ry="3.5" fill="#00F5FF" filter="url(#oceanGlow)" />
        <circle cx="29" cy="30" r="1.5" fill="#FFFFFF" />
        <circle cx="51" cy="30" r="1.5" fill="#FFFFFF" />

        <!-- Bioluminescent Barbel Orbs -->
        <circle cx="20" cy="40" r="2" fill="#38BDF8" filter="url(#oceanGlow)" />
        <circle cx="60" cy="40" r="2" fill="#38BDF8" filter="url(#oceanGlow)" />

        <!-- Pelagic Siphon / Gill Vents -->
        <path d="M 34 38 Q 40 43 46 38" stroke="#38BDF8" stroke-width="1.8" fill="none" stroke-linecap="round" />
        <path d="M 36 42 Q 40 46 44 42" stroke="#0EA5E9" stroke-width="1.5" fill="none" stroke-linecap="round" />

        <!-- Abyssal Water Vortex Core -->
        <path d="M 30 50 L 50 50 L 56 68 L 24 68 Z" fill="url(#oceanSkin)" stroke="#38BDF8" stroke-width="1.8" />
        <circle cx="40" cy="59" r="5" fill="#00F5FF" filter="url(#oceanGlow)" />
        <circle cx="40" cy="59" r="2" fill="#FFFFFF" />
      </svg>
    `;
  } else if (type === 'cosmos') {
    // 5. Astro-Titan Chronos: Orbital rings, stellar coronal spikes, pulsar core, starlight crest
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cosmosSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#4F46E5" />
            <stop offset="50%" stop-color="#3730A3" />
            <stop offset="100%" stop-color="#1E1B4B" />
          </linearGradient>
          <filter id="cosmosGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Orbital Gyro Rings -->
        <ellipse cx="40" cy="38" rx="36" ry="10" fill="none" stroke="#818CF8" stroke-width="1.8" transform="rotate(-15 40 38)" opacity="0.85" filter="url(#cosmosGlow)" />
        <ellipse cx="40" cy="38" rx="36" ry="10" fill="none" stroke="#C7D2FE" stroke-width="1" transform="rotate(-15 40 38)" stroke-dasharray="4 2" />

        <!-- Stellar Coronal Halo Spikes -->
        <line x1="40" y1="2" x2="40" y2="10" stroke="#A5B4FC" stroke-width="2.5" stroke-linecap="round" filter="url(#cosmosGlow)" />
        <line x1="16" y1="12" x2="22" y2="18" stroke="#818CF8" stroke-width="2" stroke-linecap="round" />
        <line x1="64" y1="12" x2="58" y2="18" stroke="#818CF8" stroke-width="2" stroke-linecap="round" />

        <!-- Celestial Spherical Helm -->
        <circle cx="40" cy="34" r="18" fill="url(#cosmosSkin)" stroke="#818CF8" stroke-width="2" />

        <!-- Galactic Nebula Visor / Cosmic Eyes -->
        <ellipse cx="32" cy="32" rx="4" ry="2.5" fill="#F472B6" filter="url(#cosmosGlow)" />
        <ellipse cx="48" cy="32" rx="4" ry="2.5" fill="#F472B6" filter="url(#cosmosGlow)" />
        <circle cx="32" cy="32" r="1.2" fill="#FFFFFF" />
        <circle cx="48" cy="32" r="1.2" fill="#FFFFFF" />

        <!-- Constellation Nodes on Forehead -->
        <circle cx="40" cy="24" r="1.5" fill="#FFFFFF" />
        <circle cx="35" cy="26" r="1" fill="#A5B4FC" />
        <circle cx="45" cy="26" r="1" fill="#A5B4FC" />
        <line x1="35" y1="26" x2="40" y2="24" stroke="#818CF8" stroke-width="0.8" />
        <line x1="45" y1="26" x2="40" y2="24" stroke="#818CF8" stroke-width="0.8" />

        <!-- Pulsar Core Reactor -->
        <path d="M 30 52 L 50 52 L 56 68 L 24 68 Z" fill="url(#cosmosSkin)" stroke="#818CF8" stroke-width="1.8" />
        <circle cx="40" cy="60" r="5" fill="#818CF8" filter="url(#cosmosGlow)" />
        <polygon points="40,55 44,60 40,65 36,60" fill="#FFFFFF" />
      </svg>
    `;
  } else {
    // 6. Volcano / Magma Colossus: Obsidian horns, glowing lava cracks, smoldering core
    return `
      <svg class="boss-svg-char" viewBox="0 0 80 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lavaMetal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#450A0A" />
            <stop offset="50%" stop-color="#1C1917" />
            <stop offset="100%" stop-color="#0C0A09" />
          </linearGradient>
          <filter id="lavaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Jagged Obsidian Horns -->
        <polygon points="24,18 10,2 18,22" fill="#7F1D1D" stroke="#EF4444" stroke-width="1.6" />
        <polygon points="56,18 70,2 62,22" fill="#7F1D1D" stroke="#EF4444" stroke-width="1.6" />
        <polygon points="34,14 40,4 46,14" fill="#B91C1C" stroke="#F97316" stroke-width="1.2" />

        <!-- Rugged Rock Face -->
        <polygon points="20,18 60,18 66,38 54,52 26,52 14,38" fill="url(#lavaMetal)" stroke="#EF4444" stroke-width="2" />

        <!-- Glowing Magma Fissures / Cracks -->
        <path d="M 28 22 L 34 28 L 30 36 L 40 42 L 50 36 L 46 28 L 52 22" stroke="#F97316" stroke-width="1.6" fill="none" stroke-linecap="round" filter="url(#lavaGlow)" />
        
        <!-- Incandescent Eyes of Fire -->
        <polygon points="25,30 35,31 33,35 25,34" fill="#FACC15" filter="url(#lavaGlow)" />
        <polygon points="55,30 45,31 47,35 55,34" fill="#FACC15" filter="url(#lavaGlow)" />
        <circle cx="30" cy="32.5" r="1.2" fill="#FFFFFF" />
        <circle cx="50" cy="32.5" r="1.2" fill="#FFFFFF" />

        <!-- Molten Core -->
        <path d="M 26 52 L 54 52 L 60 70 L 20 70 Z" fill="url(#lavaMetal)" stroke="#EF4444" stroke-width="1.8" />
        <circle cx="40" cy="61" r="5.5" fill="#EF4444" filter="url(#lavaGlow)" />
        <circle cx="40" cy="61" r="3" fill="#FACC15" />
        <circle cx="40" cy="61" r="1.2" fill="#FFFFFF" />
      </svg>
    `;
  }
}

function renderBossHud(boss, remainingLives = 3, maxLives = 3) {
  if (!bossHud) return;
  bossHud.classList.remove('hidden');

  // Trigger surge entrance animation
  bossHud.classList.remove('boss-surge');
  void bossHud.offsetWidth;
  bossHud.classList.add('boss-surge');

  const lang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
  const isPt = lang === 'pt';
  const name = isPt ? (boss.namePt || boss.name) : (boss.name || boss.namePt);
  const scenario = isPt ? (boss.scenarioPt || boss.scenario) : (boss.scenario || boss.scenarioPt);
  const badgeLabel = isPt ? (boss.badgeTextPt || boss.badgeText) : (boss.badgeText || boss.badgeTextPt);
  const desc = isPt ? (boss.scenarioDescPt || boss.lorePt || boss.titlePt) : (boss.scenarioDesc || boss.lore || boss.title);

  if (bossName) bossName.textContent = name || (typeof t === 'function' ? t('boss_default_name') : 'Boss');
  if (bossDesc) bossDesc.textContent = `${scenario} — ${desc}`;

  const badgeEl = $('boss-badge');
  if (badgeEl) {
    badgeEl.textContent = `${badgeLabel || (typeof t === 'function' ? t('boss_default_name').toUpperCase() : 'BOSS')} • ${scenario.toUpperCase()}`;
    const clr = boss.color || '#06B6D4';
    badgeEl.style.background = `linear-gradient(135deg, ${clr}, #3B82F6)`;
    badgeEl.style.boxShadow = `0 0 10px ${clr}55`;
  }

  // Inject animated custom SVG according to boss type
  const spriteEl = $('boss-sprite');
  if (spriteEl) {
    spriteEl.innerHTML = getBossSpriteSvg(boss);
  }

  // Set glowing aura around figure wrap according to boss theme color
  const figureWrap = $('boss-figure-wrap');
  if (figureWrap && boss.color) {
    figureWrap.style.boxShadow = `0 0 18px ${boss.color}55`;
  }

  // Render health points: |||
  const barsContainer = $('boss-hp-bars');
  const textEl = $('boss-hp-text');

  if (barsContainer) {
    barsContainer.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
      const bar = document.createElement('span');
      bar.className = `boss-hp-bar ${i < remainingLives ? 'active' : 'depleted'}`;
      bar.textContent = '|';
      barsContainer.appendChild(bar);
    }
  }

  if (textEl) {
    let str = '';
    for (let i = 0; i < maxLives; i++) {
      str += (i < remainingLives ? '|' : '·');
    }
    textEl.textContent = str;
    textEl.className = `boss-hp-text ${remainingLives === 1 ? 'critical' : remainingLives === 0 ? 'dead' : ''}`;
  }
}

function hideBossHud() {
  if (bossHud) bossHud.classList.add('hidden');
}

function flashBossDamage() {
  if (!bossHud) return;
  bossHud.classList.add('boss-damaged');
  setTimeout(() => bossHud.classList.remove('boss-damaged'), 450);
}

function renderBossMeaningSlots(boxEl, targetWord, typedBuffer) {
  if (!boxEl) return;
  const slotsCont = boxEl.querySelector('.bmb-slots');
  if (!slotsCont) return;
  slotsCont.innerHTML = '';

  const chars = targetWord.split('');
  for (let i = 0; i < chars.length; i++) {
    const slot = document.createElement('span');
    if (i < typedBuffer.length) {
      slot.className = 'bmb-slot filled';
      slot.textContent = typedBuffer[i];
    } else {
      slot.className = 'bmb-slot empty';
      slot.textContent = '_';
    }
    slotsCont.appendChild(slot);
  }
}

function showBossRewardModal(skills, onPick) {
  if (!modalBossReward || !bossSkillsGrid) return;
  bossSkillsGrid.innerHTML = '';

  skills.forEach(skill => {
    const loc = (typeof getLocalizedItem === 'function') ? getLocalizedItem(skill) : { name: skill.name, desc: skill.desc };
    const pickTxt = typeof t === 'function' && t('boss_btn_pick') ? t('boss_btn_pick') : 'Obtain';
    const card = document.createElement('div');
    card.className = 'boss-skill-card';
    card.innerHTML = `
      <div class="boss-skill-icon-wrap" style="--item-clr: ${skill.color || 'var(--accent-primary)'}">
        <span>${skill.icon}</span>
      </div>
      <div class="boss-skill-name">${loc.name || skill.name}</div>
      <div class="boss-skill-desc">${loc.desc || skill.desc}</div>
      <button class="boss-skill-pick-btn" type="button">${pickTxt}</button>
    `;
    const btn = card.querySelector('.boss-skill-pick-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onPick === 'function') onPick(skill);
        closeBossRewardModal();
      });
    }
    bossSkillsGrid.appendChild(card);
  });

  modalBossReward.classList.remove('hidden');
}

function closeBossRewardModal() {
  if (modalBossReward) modalBossReward.classList.add('hidden');
}
