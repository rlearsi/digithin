/* ================================================
   DIGITINHO — js/shop.js
   Shop mechanics, pricing, inventory, and modal
   ================================================ */
'use strict';

function shopPrice(basePrice) {
  return Math.ceil(basePrice * Math.pow(CFG.shopPriceFactor, state.shopPurchaseCount));
}

function showShop() {
  state.paused = true;
  state.currentShopItems = shuffle(SKILLS_ALL).slice(0, 3);
  renderShopItems();
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

  state.currentShopItems.forEach(item => {
    const price     = shopPrice(item.basePrice);
    const canAfford = state.totalScore >= price;
    const existing  = item.id === 'continue'
      ? (state.continues > 0 ? { count: state.continues } : null)
      : state.skillSlots.find(s => s.id === item.id);
    const itemColor = item.color || 'var(--accent-primary)';
    const loc       = getLocalizedItem(item);

    const buyTxt = typeof t === 'function' ? t('shop_btn_buy') : 'Comprar';

    const el = document.createElement('div');
    el.className = 'shop-card ' + (canAfford ? 'shop-card-affordable' : 'shop-card-dimmed');
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
        <button class="shop-buy-btn ${canAfford ? 'can-buy' : 'no-pts'}" ${!canAfford ? 'disabled' : ''} onclick="buyShopItem('${item.id}', ${price})">
          ${buyTxt}
        </button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function renderShopModal() {
  renderShopItems();
}

function buyShopItem(skillId, price) {
  if (state.totalScore < price) return;
  state.totalScore -= price;
  state.shopPurchaseCount++;
  playSound('buy');

  if (skillId === 'extralife') {
    state.lives    = Math.min(state.lives + 1, 6);
    state.maxLives = Math.max(state.maxLives, state.lives);
    showFeedback('+1 Vida permanente!', 'special');
  } else if (skillId === 'continue') {
    state.continues = (state.continues || 0) + 1;
    showFeedback('+1 Ficha Continue obtida!', 'special');
  } else if (skillId === 'wordpack') {
    // Unlock 3 random locked words from pool
    const unlockedTexts = new Set(state.unlockedWords.map(w => w.text.toLowerCase()));
    const lockedPool    = WORD_POOL.filter(w => !unlockedTexts.has(w.text.toLowerCase()));
    const picked        = shuffle(lockedPool).slice(0, 3);

    if (picked.length > 0) {
      picked.forEach(w => state.unlockedWords.push({ ...w, phase: state.phase }));
      const names = picked.map(w => w.text.toUpperCase()).join(', ');
      showFeedback(`Desbloqueadas: ${names}!`, 'special');
      playSound('skill');
      if (state.unlockedWords.length >= WORD_POOL.length) {
        if (typeof unlockAchievement === 'function') unlockAchievement('colecionador');
      }
    } else {
      showFeedback('Todas as palavras já foram descobertas!', 'special');
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
    showFeedback(`+1 ${locDef?.name || def?.name || ''}!`, 'special');
  }

  $('shop-balance').textContent = formatScore(state.totalScore);
  renderShopItems();
  updateHUD();
}

function closeShop() {
  modalShop.classList.add('hidden');
  beginPhase();
}
