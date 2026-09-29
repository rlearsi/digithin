/* ================================================
   DIGITINHO — js/i18n.js
   Internationalization (i18n) Engine
   Supported: en (Default), pt, fr, de, ja, ko, zh
   Locale dictionaries located in js/locale/{lang}.js
   ================================================ */
'use strict';

const SUPPORTED_LANGUAGES = ['en', 'pt', 'fr', 'de', 'ja', 'ko', 'zh'];

// Aggregated dictionaries loaded from js/locale/*.js
const TRANSLATIONS = window.TRANSLATIONS = window.TRANSLATIONS || {};

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('digitinho_language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
  } catch (_) {}

  // Auto-detect browser language for first-time visitors
  const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  if (navLang.startsWith('pt')) return 'pt';
  if (navLang.startsWith('fr')) return 'fr';
  if (navLang.startsWith('de')) return 'de';
  if (navLang.startsWith('ja')) return 'ja';
  if (navLang.startsWith('ko')) return 'ko';
  if (navLang.startsWith('zh')) return 'zh';
  return 'en'; // English is default
}

let currentLanguage = detectInitialLanguage();

function getLanguage() {
  return currentLanguage;
}

function t(key, params) {
  const enDict = TRANSLATIONS.en || {};
  const dict = TRANSLATIONS[currentLanguage] || enDict;
  let str = dict[key] || enDict[key] || key;
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(p => {
      str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
  }
  return str;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = 'en';
  currentLanguage = lang;
  try {
    localStorage.setItem('digitinho_language', lang);
  } catch (_) {}

  if (typeof state !== 'undefined' && state) {
    state.language = lang;
  }

  // Update active word pool and syllables
  if (typeof updateWordPoolLanguage === 'function') {
    updateWordPoolLanguage(lang);
  }

  applyTranslations();
}

function changeLanguage(lang) {
  setLanguage(lang);
}

function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation) {
      if (el.tagName === 'INPUT' && el.type === 'placeholder') {
        el.placeholder = translation;
      } else {
        el.innerHTML = translation;
      }
    }
  });

  // Sync settings dropdown
  const langSelect = document.getElementById('settings-lang-select');
  if (langSelect) {
    langSelect.value = lang;
  }

  const inMatch = typeof isMatchInProgress === 'function' ? isMatchInProgress() : false;
  const diffSelect = document.getElementById('settings-difficulty-select');
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

  // Update settings labels with dynamic states & modern SVGs
  if (typeof updateSettingsUI === 'function') {
    updateSettingsUI();
  }

  // Update Training modal if rendered
  if (typeof renderTrainingWorlds === 'function') renderTrainingWorlds();
  // Update Achievements modal if rendered
  if (typeof renderConquistasModal === 'function') renderConquistasModal();
  // Update Shop modal if rendered
  if (typeof renderShopModal === 'function') renderShopModal();
  // Update Library modal if rendered
  if (typeof renderBibliotecaModal === 'function') renderBibliotecaModal();
  // Update HUD
  if (typeof updateHUD === 'function') updateHUD();
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
}
