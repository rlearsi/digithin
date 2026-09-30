/* ================================================
   DIGITINHO — js/boss.js
   Boss battles, thematic vocabulary, enigma trial & victory
   ================================================ */
'use strict';

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

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const bossIcon = state.bossBattle.boss.icon || '👾';
  const bossName = (currentLang === 'pt' && state.bossBattle.boss?.namePt)
    ? state.bossBattle.boss.namePt
    : (state.bossBattle.boss?.name || (typeof t === 'function' ? t('boss_default_name') : 'Boss'));
  const scenarioName = (currentLang === 'pt' && state.bossBattle.boss?.scenarioPt)
    ? state.bossBattle.boss.scenarioPt
    : (state.bossBattle.boss?.scenario || 'Scenario');
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
    : (state.bossBattle.boss.scenario || 'Scenario');

  const solvedNum = Math.min(3, (state.bossBattle.solvedCount || 0) + 1);
  const totalEnigmas = state.bossBattle.boss?.maxLives || 3;

  const badgeText = typeof t === 'function'
    ? t('boss_enigma_badge', { num: solvedNum, total: totalEnigmas, scenario: scenarioName.toUpperCase() })
    : `📜 ENIGMA ${solvedNum} / ${totalEnigmas} • ${scenarioName.toUpperCase()}`;
  const lettersText = typeof t === 'function'
    ? t('boss_enigma_letters', { count: targetWord.length })
    : `${targetWord.length} LETTERS`;

  el.innerHTML = `
    <div class="bmb-header">
      <span class="bmb-badge">${badgeText}</span>
      <span class="bmb-length">${lettersText}</span>
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
      showFeedback(typeof t === 'function' ? t('fb_shield_error_protected') : '🛡️ Error protected by Shield!', 'special');
      return;
    }

    // Typo breaks combo
    if (state.combo > 0) {
      state.combo = 0;
      showFeedback(typeof t === 'function' ? t('fb_combo_broken') : 'Combo broken!', 'error');
    }

    state.errorsPhase++;
    state.totalErrors++;
    playSound('error');
    showFeedback(typeof t === 'function' ? t('fb_error_letter') : '❌ Wrong letter!', 'error');

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
    showFeedback(typeof t === 'function' ? t('fb_fury_activated') : 'FURY MODE ACTIVATED! DOUBLE POINTS!', 'special');
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

  const enigmaMsg = typeof t === 'function'
    ? t('fb_enigma_solved', { pts })
    : `💥 ENIGMA SOLVED! -1 BOSS HP! (+${pts}pts)`;
  showFeedback(enigmaMsg, 'special');
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

  const currentLang = typeof getLanguage === 'function' ? getLanguage() : 'en';
  const bossName = (currentLang === 'pt' && state.bossBattle.boss?.namePt)
    ? state.bossBattle.boss.namePt
    : (state.bossBattle.boss?.name || (typeof t === 'function' ? t('boss_default_name') : 'Boss'));

  const victoryMsg = typeof t === 'function'
    ? t('fb_boss_defeated', { boss: bossName.toUpperCase() })
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
    showFeedback(typeof t === 'function' ? t('fb_permanent_life') : '+1 Permanent Life!', 'special');
  } else if (skill.id === 'continue') {
    state.continues = (state.continues || 0) + 1;
    showFeedback(typeof t === 'function' ? t('fb_continue_obtained') : '🪙 +1 Continue token obtained!', 'special');
  } else if (skill.id === 'wordpack') {
    const unlockedTexts = new Set(state.unlockedWords.map(w => w.text.toLowerCase()));
    const lockedPool    = WORD_POOL.filter(w => !unlockedTexts.has(w.text.toLowerCase()));
    const picked        = shuffle(lockedPool).slice(0, 3);
    if (picked.length > 0) {
      picked.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));
      const names = picked.map(w => w.text.toUpperCase()).join(', ');
      const unlLabel = typeof t === 'function' ? t('library_unlocked') : 'Unlocked';
      showFeedback(`📦 ${unlLabel}: ${names}!`, 'special');
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
    const skillName = (typeof t === 'function' && t(`skill_name_${skill.id}`) !== `skill_name_${skill.id}`)
      ? t(`skill_name_${skill.id}`)
      : (skill.name || '');
    const rewardMsg = typeof t === 'function' ? t('fb_reward_granted', { reward: skillName }) : `Reward granted: ${skillName}!`;
    showFeedback(rewardMsg, 'special');
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
