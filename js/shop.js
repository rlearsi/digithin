/* ================================================
   DIGITINHO — js/shop.js
   Shop mechanics, pricing, inventory, and modal
   ================================================ */
'use strict';

function shopPrice(basePrice) {
  return Math.ceil(basePrice * Math.pow(CFG.shopPriceFactor, state.shopPurchaseCount));
}

function isShopOpen() {
  return modalShop && !modalShop.classList.contains('hidden');
}

function isShopConfirmOpen() {
  const confirmView = $('shop-confirm-view');
  return isShopOpen() && confirmView && !confirmView.classList.contains('hidden');
}

function updateShopConfirmText() {
  const descEl = $('shop-confirm-desc');
  if (!descEl) return;
  const key = 'shop_confirm_exit_desc';
  descEl.setAttribute('data-i18n', key);
  descEl.textContent = typeof t === 'function' ? t(key) : '';
}

function showShopExitConfirm() {
  const mainView = $('shop-main-view');
  const confirmView = $('shop-confirm-view');
  const box = document.querySelector('.modal-shop-box');
  if (mainView) mainView.classList.add('hidden');
  if (confirmView) {
    updateShopConfirmText();
    confirmView.classList.remove('hidden');
  }
  if (box) box.classList.add('modal-box-confirm');
}

function cancelShopExitConfirm() {
  const confirmView = $('shop-confirm-view');
  const mainView = $('shop-main-view');
  const box = document.querySelector('.modal-shop-box');
  if (confirmView) confirmView.classList.add('hidden');
  if (mainView) mainView.classList.remove('hidden');
  if (box) box.classList.remove('modal-box-confirm');
}

function confirmShopExit() {
  cancelShopExitConfirm();
  state.selectedShopIndex = -1;
  updateShopSelectionVisual();
  const fbEl = $('shop-feedback-msg');
  if (fbEl) fbEl.classList.add('hidden');
  const card = document.querySelector('.shop-balance-card');
  if (card) card.classList.remove('sbc-shake');
  if (shopFeedbackTimer) clearTimeout(shopFeedbackTimer);
  if (modalShop) modalShop.classList.add('hidden');
  state.phaseComplete = false;
  if (typeof goToMainMenu === 'function') {
    goToMainMenu();
  }
}

function selectShopItem(index) {
  if (state.selectedShopIndex === index) {
    state.selectedShopIndex = -1;
  } else {
    state.selectedShopIndex = index;
    if (typeof playSound === 'function') playSound('click');
  }
  updateShopSelectionVisual();
}

function navigateShop(direction) {
  const total = state.currentShopItems ? state.currentShopItems.length : 3;
  if (total === 0) return;

  if (direction === 'down') {
    if (state.selectedShopIndex === -1) {
      state.selectedShopIndex = 0;
    } else if (state.selectedShopIndex === total - 1) {
      state.selectedShopIndex = -1; // volta para desmarcado ("Continuar Jogando")
    } else {
      state.selectedShopIndex++;
    }
  } else if (direction === 'up') {
    if (state.selectedShopIndex === -1) {
      state.selectedShopIndex = total - 1;
    } else if (state.selectedShopIndex === 0) {
      state.selectedShopIndex = -1; // volta para desmarcado ("Continuar Jogando")
    } else {
      state.selectedShopIndex--;
    }
  }

  if (typeof playSound === 'function') playSound('click');
  updateShopSelectionVisual();
}

function updateShopSelectionVisual() {
  const cards = document.querySelectorAll('#shop-items-grid .shop-card');
  cards.forEach((card, idx) => {
    if (idx === state.selectedShopIndex) {
      card.classList.add('shop-card-selected');
    } else {
      card.classList.remove('shop-card-selected');
    }
  });

  const continueBtn = document.querySelector('.btn-shop-close');
  if (continueBtn) {
    if (state.selectedShopIndex === -1) {
      continueBtn.classList.add('btn-shop-continue-active');
    } else {
      continueBtn.classList.remove('btn-shop-continue-active');
    }
  }
}

let shopFeedbackTimer = null;

function showShopFeedback(msg, type = 'warning') {
  const el = $('shop-feedback-msg');
  const card = document.querySelector('.shop-balance-card');
  if (!el) return;

  const textSpan = el.querySelector('.shop-feedback-text');
  if (textSpan) textSpan.textContent = msg;

  el.className = `shop-feedback-msg ${type}`;
  el.classList.remove('hidden');

  if (card) {
    card.classList.remove('sbc-shake');
    void card.offsetWidth;
    card.classList.add('sbc-shake');
  }

  if (shopFeedbackTimer) clearTimeout(shopFeedbackTimer);
  shopFeedbackTimer = setTimeout(() => {
    el.classList.add('hidden');
    if (card) card.classList.remove('sbc-shake');
  }, 2600);
}

function buySelectedShopItem() {
  if (state.selectedShopIndex < 0 || !state.currentShopItems || !state.currentShopItems[state.selectedShopIndex]) {
    return false;
  }
  const item = state.currentShopItems[state.selectedShopIndex];
  const price = shopPrice(item.basePrice);
  if (state.totalScore < price) {
    if (typeof playSound === 'function') playSound('error');
    const msg = typeof t === 'function' ? t('shop_insufficient_pts') : 'Pontos insuficientes!';
    showShopFeedback(msg, 'warning');
    return false;
  }
  buyShopItem(item.id, price);
  state.selectedShopIndex = -1;
  updateShopSelectionVisual();
  return true;
}

function showShop() {
  const fbEl = $('shop-feedback-msg');
  if (fbEl) fbEl.classList.add('hidden');
  const card = document.querySelector('.shop-balance-card');
  if (card) card.classList.remove('sbc-shake');
  if (shopFeedbackTimer) clearTimeout(shopFeedbackTimer);

  if (typeof clearGameBoard === 'function') {
    clearGameBoard();
  } else {
    if (state.activeItems && Array.isArray(state.activeItems)) {
      state.activeItems.forEach(i => i.el?.parentNode?.removeChild(i.el));
      state.activeItems = [];
    }
    const leftoverTokens = gameArea?.querySelectorAll('.token, .boss-meaning-box');
    if (leftoverTokens) leftoverTokens.forEach(el => el.parentNode?.removeChild(el));
    state.spawnQueue = [];
    if (typeof renderQueue === 'function') renderQueue();
    state.typedBuffer = '';
    if (typeof clearHighlight === 'function') clearHighlight();
  }
  const hiddenInp = $('hidden-input');
  if (hiddenInp) {
    hiddenInp.value = '';
    if (typeof hiddenInp.blur === 'function') hiddenInp.blur();
  }

  state.paused = true;
  state.phaseComplete = false;
  state.currentShopPurchases = 0;
  state.selectedShopIndex = -1;
  cancelShopExitConfirm();
  state.currentShopItems = shuffle(SKILLS_ALL).slice(0, 3);
  renderShopItems();
  updateShopSelectionVisual();
  $('shop-balance').textContent = formatScore(state.totalScore);
  modalShop.classList.remove('hidden');
}

function getLocalizedItem(item) {
  const lang = typeof getLanguage === 'function' ? getLanguage() : (typeof state !== 'undefined' && state?.language ? state.language : 'pt');
  const nameKey = `skill_name_${item.id}`;
  const descKey = `skill_desc_${item.id}`;

  let name = (typeof t === 'function' && t(nameKey) !== nameKey)
    ? t(nameKey)
    : (lang === 'pt' && item.namePt ? item.namePt : item.name);

  let desc = (typeof t === 'function' && t(descKey) !== descKey)
    ? t(descKey)
    : (lang === 'pt' && item.descPt ? item.descPt : item.desc);

  if (lang === 'pt') {
    if (item.namePt) name = item.namePt;
    if (item.descPt) desc = item.descPt;
  }

  return { name: name || item.name || '', desc: desc || item.desc || '' };
}

function renderShopItems() {
  const grid = $('shop-items-grid');
  if (!grid) return;
  grid.innerHTML = '';

  state.currentShopItems.forEach((item, index) => {
    const price     = shopPrice(item.basePrice);
    const canAfford = state.totalScore >= price;
    const isSelected = (state.selectedShopIndex === index);
    const existing  = item.id === 'continue'
      ? (state.continues > 0 ? { count: state.continues } : null)
      : state.skillSlots.find(s => s.id === item.id);
    const itemColor = item.color || 'var(--accent-primary)';
    const loc       = getLocalizedItem(item);

    const buyTxt = typeof t === 'function' ? t('shop_btn_buy') : 'Comprar';

    const el = document.createElement('div');
    el.className = 'shop-card ' + (canAfford ? 'shop-card-affordable' : 'shop-card-dimmed') + (isSelected ? ' shop-card-selected' : '');
    el.setAttribute('data-shop-index', index);
    el.onclick = (e) => {
      if (e.target.closest('.shop-buy-btn')) return;
      selectShopItem(index);
    };

    const availTxt = (typeof t === 'function' && t('shop_available')) ? t('shop_available') : 'Disponível';
    el.innerHTML = `
      <div class="shop-icon-wrapper" style="--item-clr: ${itemColor}">
        <span class="shop-icon-symbol">${item.icon}</span>
      </div>
      <div class="shop-item-details">
        <div class="shop-title-row">
          <span class="shop-item-title">${loc.name}</span>
          ${canAfford ? `<span class="shop-can-buy-badge">${availTxt}</span>` : ''}
          ${existing ? `<span class="shop-owned-tag">✓ ×${existing.count}</span>` : ''}
        </div>
        <p class="shop-item-desc">${loc.desc}</p>
      </div>
      <div class="shop-action-col">
        <div class="shop-price-tag">
          <span class="shop-coin-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 9v6"/>
            </svg>
          </span>
          <span class="shop-price-num">${price}</span>
        </div>
        <button class="shop-buy-btn ${canAfford ? 'can-buy' : 'no-pts'}" ${!canAfford ? 'disabled' : ''} onclick="event.stopPropagation(); buyShopItem('${item.id}', ${price})">
          ${buyTxt}
        </button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function renderShopModal() {
  renderShopItems();
  if (typeof isShopConfirmOpen === 'function' && isShopConfirmOpen()) {
    updateShopConfirmText();
  }
}

function buyShopItem(skillId, price) {
  if (state.totalScore < price) {
    if (typeof playSound === 'function') playSound('error');
    const msg = typeof t === 'function' ? t('shop_insufficient_pts') : 'Pontos insuficientes!';
    showShopFeedback(msg, 'warning');
    return;
  }
  state.totalScore -= price;
  state.shopPurchaseCount++;
  state.currentShopPurchases = (state.currentShopPurchases || 0) + 1;
  state.selectedShopIndex = -1;
  playSound('buy');

  if (skillId === 'extralife') {
    state.lives    = Math.min(state.lives + 1, 6);
    state.maxLives = Math.max(state.maxLives, state.lives);
    showShopFeedback('+1 Vida permanente!', 'success');
  } else if (skillId === 'continue') {
    state.continues = (state.continues || 0) + 1;
    showShopFeedback('+1 Ficha Continue obtida!', 'success');
  } else if (skillId === 'wordpack') {
    // Unlock 3 random locked words from pool
    const unlockedTexts = new Set(state.unlockedWords.map(w => w.text.toLowerCase()));
    const lockedPool    = WORD_POOL.filter(w => !unlockedTexts.has(w.text.toLowerCase()));
    const picked        = shuffle(lockedPool).slice(0, 3);

    if (picked.length > 0) {
      picked.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));
      const names = picked.map(w => w.text.toUpperCase()).join(', ');
      showShopFeedback(`Desbloqueadas: ${names}!`, 'success');
      playSound('skill');
      if (state.unlockedWords.length >= WORD_POOL.length) {
        if (typeof unlockAchievement === 'function') unlockAchievement('colecionador');
      }
    } else {
      showShopFeedback('Todas as palavras já foram descobertas!', 'success');
    }
  } else {
    // Regular skill item
    const slot = state.skillSlots.find(s => s.id === skillId);
    if (slot) {
      slot.count++;
    } else if (state.skillSlots.length < 8) {
      state.skillSlots.push({ id: skillId, count: 1 });
    } else {
      state.skillSlots[state.skillSlots.length - 1] = { id: skillId, count: 1 };
    }
    const def = (typeof SKILLS_CONFIG !== 'undefined' && SKILLS_CONFIG[skillId]) || SKILLS_ALL.find(s => s.id === skillId);
    const locDef = def ? getLocalizedItem(def) : null;
    showShopFeedback(`+1 ${locDef?.name || def?.name || ''}!`, 'success');
  }

  $('shop-balance').textContent = formatScore(state.totalScore);
  renderShopItems();
  updateShopSelectionVisual();
  updateHUD();
}

function closeShop() {
  cancelShopExitConfirm();
  state.selectedShopIndex = -1;
  updateShopSelectionVisual();
  const fbEl = $('shop-feedback-msg');
  if (fbEl) fbEl.classList.add('hidden');
  const card = document.querySelector('.shop-balance-card');
  if (card) card.classList.remove('sbc-shake');
  if (shopFeedbackTimer) clearTimeout(shopFeedbackTimer);
  modalShop.classList.add('hidden');
  state.phaseComplete = false;
  beginPhase();
}

