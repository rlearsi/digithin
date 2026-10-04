/* ================================================
   DIGITINHO — js/input.js
   Keyboard, touch, hidden input & visibility listeners
   ================================================ */
'use strict';

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

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (typeof navigateShop === 'function') navigateShop('down');
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (typeof navigateShop === 'function') navigateShop('up');
      return;
    }

    if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
      e.preventDefault();
      if (typeof buyShopItemByIndex === 'function') buyShopItemByIndex(0);
      return;
    }
    if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
      e.preventDefault();
      if (typeof buyShopItemByIndex === 'function') buyShopItemByIndex(1);
      return;
    }
    if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
      e.preventDefault();
      if (typeof buyShopItemByIndex === 'function') buyShopItemByIndex(2);
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

  // If Boss Battle Reward modal is open, handle keyboard navigation and confirm
  const modalBossRewardEl = $('modal-boss-reward');
  const isBossRewardModalOpen = (typeof isBossRewardOpen === 'function') ? isBossRewardOpen() : (modalBossRewardEl && !modalBossRewardEl.classList.contains('hidden'));
  if (isBossRewardModalOpen) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (typeof navigateBossReward === 'function') navigateBossReward('next');
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (typeof navigateBossReward === 'function') navigateBossReward('prev');
      return;
    }
    if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
      e.preventDefault();
      if (typeof pickBossSkillByIndex === 'function') pickBossSkillByIndex(0);
      return;
    }
    if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
      e.preventDefault();
      if (typeof pickBossSkillByIndex === 'function') pickBossSkillByIndex(1);
      return;
    }
    if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
      e.preventDefault();
      if (typeof pickBossSkillByIndex === 'function') pickBossSkillByIndex(2);
      return;
    }
    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (typeof pickSelectedBossSkill === 'function') pickSelectedBossSkill();
      return;
    }

    // Intercept ANY other key while boss reward modal is open to prevent background typing or accidental interactions
    e.preventDefault();
    return;
  }

  // Ignore Enter during resume countdown overlay
  if (typeof countdownActive !== 'undefined' && countdownActive) {
    if (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter') {
      e.preventDefault();
      return;
    }
  }

  // If Pause overlay is open, Enter resumes the game (triggers "Continuar")
  const pauseOverlayEl = $('pause-overlay');
  const isPauseOverlayOpen = pauseOverlayEl && !pauseOverlayEl.classList.contains('hidden');
  if (isPauseOverlayOpen) {
    const isConfirmOpen = (typeof isPauseConfirmOpen === 'function') && isPauseConfirmOpen();
    if (isConfirmOpen) {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        cancelExitConfirm();
        return;
      }
      return;
    }

    // Check if other overlay modals are open on top of pause (Library, Achievements, Settings)
    const isSubModalOpen =
      (typeof isSettingsOpen === 'function' && isSettingsOpen()) ||
      (typeof isPauseSettingsOpen === 'function' && isPauseSettingsOpen()) ||
      Boolean($('modal-settings') && !$('modal-settings').classList.contains('hidden')) ||
      Boolean($('modal-biblioteca') && !$('modal-biblioteca').classList.contains('hidden')) ||
      Boolean($('modal-conquistas') && !$('modal-conquistas').classList.contains('hidden')) ||
      Boolean($('modal-training') && !$('modal-training').classList.contains('hidden'));

    if (!isSubModalOpen && (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter')) {
      const resumeBtn = $('btn-pause-resume') || pauseOverlayEl.querySelector('.btn-primary');
      if (document.activeElement && document.activeElement.tagName === 'BUTTON' && document.activeElement !== resumeBtn) {
        return;
      }
      e.preventDefault();
      if (resumeBtn) {
        resumeBtn.click();
      } else if (typeof togglePause === 'function') {
        togglePause();
      } else if (typeof resumeGame === 'function') {
        resumeGame();
      }
      return;
    }
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
  if (state.paused || state.phaseComplete || (typeof isShopOpen === 'function' && isShopOpen()) || (typeof isBossRewardOpen === 'function' && isBossRewardOpen())) {
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
