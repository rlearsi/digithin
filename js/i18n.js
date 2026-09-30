/* ================================================
   DIGITINHO — js/i18n.js
   Internationalization (i18n) & Dynamic Language Pack Engine
   Supported: en (Default), pt, fr, de, ja, ko, zh
   Single-file language packs located in: locales/{lang}.json
   ================================================ */
'use strict';

const SUPPORTED_LANGUAGES = ['en', 'pt', 'fr', 'de', 'ja', 'ko', 'zh'];

// Aggregated dictionaries loaded from locales/{lang}.json
const TRANSLATIONS = window.TRANSLATIONS = window.TRANSLATIONS || {};
window.GAME_DATA_WORDS = window.GAME_DATA_WORDS || {};

const LOADED_LOCALES = {};
let isLocaleReady = false;

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

/**
 * Loads a single language pack JSON file from locales/{lang}.json
 */
async function loadLocale(lang) {
  if (LOADED_LOCALES[lang]) {
    return LOADED_LOCALES[lang];
  }

  try {
    const response = await fetch(`locales/${lang}.json?v=2.2`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} loading locales/${lang}.json`);
    }
    const data = await response.json();
    LOADED_LOCALES[lang] = data;

    // Register UI strings
    TRANSLATIONS[lang] = data.ui || {};

    // Register vocabulary, syllables, boss words and training worlds
    window.GAME_DATA_WORDS[lang] = {
      syllables: data.syllables || [],
      words: data.words || [],
      bossWords: data.bossWords || {},
      trainingWorlds: data.trainingWorlds || {}
    };

    return data;
  } catch (err) {
    console.error(`[i18n] Error loading language pack '${lang}':`, err);
    if (lang !== 'en' && !LOADED_LOCALES.en) {
      return await loadLocale('en');
    }
    return null;
  }
}

/**
 * Sets the active game language and reloads data if necessary
 */
async function setLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) lang = 'en';
  currentLanguage = lang;
  try {
    localStorage.setItem('digitinho_language', lang);
  } catch (_) {}

  if (typeof state !== 'undefined' && state) {
    state.language = lang;
  }

  // Ensure this language pack is loaded
  await loadLocale(lang);

  // Update active word pool, syllables and training worlds
  if (typeof updateWordPoolLanguage === 'function') {
    updateWordPoolLanguage(lang);
  }

  applyTranslations();
}

async function changeLanguage(lang) {
  await setLanguage(lang);
}

function applyTranslations() {
  const lang = getLanguage();
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    // Never overwrite with key name if translation failed to find a valid string
    if (translation && translation !== key) {
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
    try { updateSettingsUI(); } catch (e) { console.warn('[i18n] updateSettingsUI error:', e); }
  }

  // Update Training modal if rendered
  if (typeof renderTrainingWorlds === 'function') {
    try { renderTrainingWorlds(); } catch (e) { console.warn('[i18n] renderTrainingWorlds error:', e); }
  }
  // Update Achievements modal if rendered
  if (typeof renderConquistasModal === 'function') {
    try { renderConquistasModal(); } catch (e) { console.warn('[i18n] renderConquistasModal error:', e); }
  }
  // Update Shop modal if rendered
  if (typeof renderShopModal === 'function') {
    try { renderShopModal(); } catch (e) { console.warn('[i18n] renderShopModal error:', e); }
  }
  // Update Library modal if rendered
  if (typeof renderBibliotecaModal === 'function') {
    try { renderBibliotecaModal(); } catch (e) { console.warn('[i18n] renderBibliotecaModal error:', e); }
  }

  // Update HUD ONLY IF game match is currently in progress
  if (typeof isMatchInProgress === 'function' && isMatchInProgress() && typeof updateHUD === 'function') {
    try { updateHUD(); } catch (e) { console.warn('[i18n] updateHUD error:', e); }
  }
}

/**
 * Fades out and safely removes the initial loading screen
 */
function hideAppLoadingScreen() {
  const loader = document.getElementById('app-loading-screen');
  if (loader && !loader.classList.contains('fade-out')) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 450);
  }
}

/**
 * Bootstraps the i18n system and preloads initial locale
 */
async function initLocaleSystem() {
  const initial = detectInitialLanguage();
  currentLanguage = initial;

  // Always preload English as primary fallback, plus active language
  try {
    if (initial !== 'en') {
      await Promise.all([loadLocale('en'), loadLocale(initial)]);
    } else {
      await loadLocale('en');
    }
  } catch (err) {
    console.error('[i18n] Error during initial locale bootstrap:', err);
  }

  // Re-sync game data structures
  try {
    if (typeof initGameLanguageData === 'function') {
      initGameLanguageData();
    }
    if (typeof updateWordPoolLanguage === 'function') {
      updateWordPoolLanguage(initial);
    }
  } catch (err) {
    console.error('[i18n] Error during game data sync:', err);
  }

  isLocaleReady = true;

  try {
    applyTranslations();
  } catch (err) {
    console.error('[i18n] Error in applyTranslations:', err);
  } finally {
    // ALWAYS dismiss the loading screen, even if an unexpected error occurs
    hideAppLoadingScreen();
  }
}

// Safety timeout: ensure loading screen NEVER blocks forever
if (typeof setTimeout === 'function') {
  setTimeout(() => {
    hideAppLoadingScreen();
  }, 2000);
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocaleSystem);
  } else {
    initLocaleSystem();
  }
}
