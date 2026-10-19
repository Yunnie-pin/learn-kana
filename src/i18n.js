import React, { createContext, useContext, useEffect, useState } from 'react';
import { kanaCharacters } from './kanaCharacters';
import { kanjiWords } from './kanjiWords';
import { en } from './locales/en.js';
import { id } from './locales/id.js';

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'id', label: 'ID' },
];

// Interface texts, one file per language in src/locales. A value is either a
// string or a function taking params. A key missing in a language falls back
// to English. To add a language: a file in src/locales with the keys of en.js,
// and its entry in LANGUAGES and translations.
const translations = { en, id };

function detectLanguage() {
  try {
    const stored = localStorage.getItem('language');
    if (translations[stored]) return stored;
  } catch (e) { }
  // First visit: follow the browser language, English when the app does not have it
  const browser = (navigator.language || '').toLowerCase().split('-')[0];
  return LANGUAGES.some(language => language.code === browser) ? browser : 'en';
}

export function translate(language, key, params) {
  const text = translations[language]?.[key] ?? translations.en[key] ?? key;
  return typeof text === 'function' ? text(params || {}) : text;
}

// Indonesian word meanings ("meaning_id" in kanaCharacters.js), by kana
const indonesianMeanings = {};
for (const word of Object.values(kanaCharacters.words)) {
  if (word.meaning_id) {
    indonesianMeanings[word.jp_character] = word.meaning_id;
  }
}
for (const group of Object.values(kanaCharacters.kanji)) {
  for (const character of Object.values(group.characters)) {
    if (character.meaning_id) {
      indonesianMeanings[character.jp_character] = character.meaning_id;
    }
    if (character.usage?.meaning_id) {
      indonesianMeanings[character.usage.word] = character.usage.meaning_id;
    }
  }
}
for (const [word, , , meaningId] of kanjiWords) {
  if (meaningId && !indonesianMeanings[word]) indonesianMeanings[word] = meaningId;
}
// Data loaded later (the sentences, see sentences.js) adds its own meanings,
// so this file does not pull every sentence into the first download
export function addIndonesianMeanings(entries) {
  for (const entry of entries) {
    if (entry.meaning_id) {
      indonesianMeanings[entry.jp_character] = entry.meaning_id;
    }
  }
}

// Falls back to the English meaning when a word has no translation
export function translateMeaning(language, jpCharacter, englishMeaning) {
  if (language === 'id') {
    return indonesianMeanings[jpCharacter] || englishMeaning;
  }
  return englishMeaning;
}

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => { },
  t: (key, params) => translate('en', key, params),
  meaningOf: (jpCharacter, englishMeaning) => englishMeaning,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (code) => {
    try {
      localStorage.setItem('language', code);
    } catch (e) { }
    setLanguageState(code);
  };

  const value = {
    language,
    setLanguage,
    t: (key, params) => translate(language, key, params),
    meaningOf: (jpCharacter, englishMeaning) => translateMeaning(language, jpCharacter, englishMeaning),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
