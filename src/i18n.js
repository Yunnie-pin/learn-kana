import React, { createContext, useContext, useEffect, useState } from 'react';
import { kanaCharacters } from './kanaCharacters';

export const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'id', label: 'ID' },
];

// Interface texts. A value is either a string or a function taking params.
// Missing Indonesian keys fall back to English.
const translations = {
  en: {
    // Navbar
    navbarBy: 'by',
    navbarInstall: 'Install app',
    navbarGitHub: 'View on GitHub',
    navbarLanguage: 'Language',

    // Menu
    menuTitle: 'Select a group to learn',
    mainKana: 'Main Kana',
    dakutenKana: 'Dakuten Kana',
    menuSummaryNone: 'Select at least one group to start',
    menuSummaryNoWords: 'No words with these groups yet, select more',
    menuSummaryWords: ({ words, groups }) => `${words} word${words === 1 ? '' : 's'} from ${groups} group${groups === 1 ? '' : 's'}`,
    menuSummaryCharacters: ({ groups, characters }) => `${groups} group${groups === 1 ? '' : 's'} · ${characters} characters`,
    menuStart: "Let's start!",
    menuStats: 'View Progress Stats',

    // Mode selector
    modeTitle: 'Select a mode:',
    modeKanaCount: ({ count }) => `Give me ${count} Kanas`,
    modeMinutes: ({ count }) => `Give me ${count} minutes`,
    modeUnlimited: 'Unlimited',
    practiceLabel: 'Practice',
    practiceCharacters: 'Characters',
    practiceWords: 'Words',
    practiceKanji: 'Kanji',
    kanjiShowAll: 'Show all',
    kanjiShowLess: 'Show less',
    answerByLabel: 'Answer by',
    answerTyping: 'Typing',
    answerMultipleChoice: 'Multiple choice',
    answerMultipleChoiceDisabled: 'Only available when practicing characters',
    optionHints: 'Hints',
    optionHandwrittenFonts: 'Handwritten Fonts',
    optionAutoNext: 'Auto Next',

    // Game
    gameScoreKanas: 'Kanas ',
    gameScoreProblematics: '🎯 Problematics: ',
    gameStreakTitle: 'Correct answers in a row',
    gameHelpKey: 'help',
    gameHintButton: '💡 Hint',
    gameFontKey: 'normal font',
    gameFontButton: '🔤 Font',
    gameNext: 'Next →',
    gamePlaceholder: 'type romaji / kana…',
    gameEnd: 'End game',
    gameErrorNoKana: "You didn't select any Kana!",
    gameErrorNoCharacters: 'No characters available to show!',

    // Summary
    summaryCompletedKanas: 'Kanas Completed!',
    summaryCompletedWords: 'Words Completed!',
    summaryAccuracy: 'Accuracy',
    summaryAvgTime: 'Avg time',
    summaryBestStreak: 'Best streak',
    summaryNewRecord: 'New record!',
    summaryHintsUsed: 'Hints used',
    summarySamePace: 'Same pace as your average',
    summaryFaster: ({ seconds }) => `⬆ ${seconds}s faster than usual`,
    summarySlower: ({ seconds }) => `⬇ ${seconds}s slower than usual`,
    summaryNeedsPractice: 'Needs practice',
    summarySlowest: 'Slowest',
    summaryTryAgain: 'Yeah.. ehh... Try again?',
    summaryBackToMenu: 'Back to Main Menu',
    summaryTryProblematics: 'Try Problematics',
    summaryPlayAgain: 'Play Again',
    summaryShortcuts: 'Enter: play again · Esc: main menu',
    summaryNoProblematics: "No problematic characters found! You're doing great! 🎉",

    // Progress stats
    statsTitle: 'Learning Progress',
    statsPracticed: 'Practiced',
    statsAvgMastery: 'Avg Mastery',
    statsNotPracticed: 'Not Practiced',
    statsExcellent: '80-100% Excellent',
    statsGood: '60-79% Good',
    statsOk: '40-59% OK',
    statsNeedsWork: '20-39% Needs Work',
    statsStruggling: '0-19% Struggling',
    statsNoData: 'No Data',
    statsNoPracticeData: 'No practice data yet',
    statsTimesShown: ({ count }) => `Times Shown: ${count}`,
    statsCorrectWrong: ({ correct, wrong }) => `Correct: ${correct} | Wrong: ${wrong}`,
    statsAccuracy: ({ percent }) => `Accuracy: ${percent}%`,
    statsAvgTime: ({ seconds }) => `Avg Time: ${seconds}s`,
    statsEdits: ({ count, average }) => `Edits: ${count} (avg ${average}/correct)`,
    statsWrongSubmissions: ({ count }) => `Wrong Submissions: ${count}`,
    statsHelpRequested: ({ count }) => `Help Requested: ${count} times`,

    // Not found page
    notFoundTitle: 'Oops!',
    notFoundMessage: 'Page not found',
    notFoundRedirecting: ({ seconds }) => `Redirecting back in ${seconds} seconds...`,
    notFoundRedirectNow: 'Redirect Now',
  },

  id: {
    navbarBy: 'oleh',
    navbarInstall: 'Pasang aplikasi',
    navbarGitHub: 'Lihat di GitHub',
    navbarLanguage: 'Bahasa',

    menuTitle: 'Pilih grup yang ingin dipelajari',
    mainKana: 'Kana Dasar',
    dakutenKana: 'Kana Dakuten',
    menuSummaryNone: 'Pilih minimal satu grup untuk mulai',
    menuSummaryNoWords: 'Belum ada kata untuk grup ini, pilih grup lain',
    menuSummaryWords: ({ words, groups }) => `${words} kata dari ${groups} grup`,
    menuSummaryCharacters: ({ groups, characters }) => `${groups} grup · ${characters} karakter`,
    menuStart: 'Ayo mulai!',
    menuStats: 'Lihat progres belajar',

    modeTitle: 'Pilih mode:',
    modeKanaCount: ({ count }) => `${count} kana`,
    modeMinutes: ({ count }) => `${count} menit`,
    modeUnlimited: 'Tanpa batas',
    practiceLabel: 'Latihan',
    practiceCharacters: 'Huruf',
    practiceWords: 'Kata',
    practiceKanji: 'Kanji',
    kanjiShowAll: 'Tampilkan semua',
    kanjiShowLess: 'Tampilkan lebih sedikit',
    answerByLabel: 'Jawab dengan',
    answerTyping: 'Mengetik',
    answerMultipleChoice: 'Pilihan ganda',
    answerMultipleChoiceDisabled: 'Hanya tersedia saat latihan huruf',
    optionHints: 'Petunjuk',
    optionHandwrittenFonts: 'Font tulisan tangan',
    optionAutoNext: 'Lanjut otomatis',

    gameScoreKanas: 'Kana ',
    gameScoreProblematics: '🎯 Latihan sulit: ',
    gameStreakTitle: 'Jawaban benar berturut-turut',
    gameHelpKey: 'bantuan',
    gameHintButton: '💡 Petunjuk',
    gameFontKey: 'font biasa',
    gameFontButton: '🔤 Font',
    gameNext: 'Lanjut →',
    gamePlaceholder: 'ketik romaji / kana…',
    gameEnd: 'Akhiri permainan',
    gameErrorNoKana: 'Kamu belum memilih kana!',
    gameErrorNoCharacters: 'Tidak ada karakter untuk ditampilkan!',

    summaryCompletedKanas: 'Kana Selesai!',
    summaryCompletedWords: 'Kata Selesai!',
    summaryAccuracy: 'Akurasi',
    summaryAvgTime: 'Rata-rata waktu',
    summaryBestStreak: 'Streak terbaik',
    summaryNewRecord: 'Rekor baru!',
    summaryHintsUsed: 'Petunjuk dipakai',
    summarySamePace: 'Sama dengan rata-ratamu',
    summaryFaster: ({ seconds }) => `⬆ ${seconds} dtk lebih cepat dari biasanya`,
    summarySlower: ({ seconds }) => `⬇ ${seconds} dtk lebih lambat dari biasanya`,
    summaryNeedsPractice: 'Perlu dilatih',
    summarySlowest: 'Paling lambat',
    summaryTryAgain: 'Hmm... coba lagi?',
    summaryBackToMenu: 'Kembali ke menu',
    summaryTryProblematics: 'Latih yang sulit',
    summaryPlayAgain: 'Main lagi',
    summaryShortcuts: 'Enter: main lagi · Esc: menu utama',
    summaryNoProblematics: 'Tidak ada karakter yang sulit! Kamu hebat! 🎉',

    statsTitle: 'Progres Belajar',
    statsPracticed: 'Sudah dilatih',
    statsAvgMastery: 'Rata-rata penguasaan',
    statsNotPracticed: 'Belum dilatih',
    statsExcellent: '80-100% Sangat baik',
    statsGood: '60-79% Baik',
    statsOk: '40-59% Cukup',
    statsNeedsWork: '20-39% Perlu latihan',
    statsStruggling: '0-19% Kesulitan',
    statsNoData: 'Belum ada data',
    statsNoPracticeData: 'Belum ada data latihan',
    statsTimesShown: ({ count }) => `Muncul: ${count} kali`,
    statsCorrectWrong: ({ correct, wrong }) => `Benar: ${correct} | Salah: ${wrong}`,
    statsAccuracy: ({ percent }) => `Akurasi: ${percent}%`,
    statsAvgTime: ({ seconds }) => `Rata-rata waktu: ${seconds} dtk`,
    statsEdits: ({ count, average }) => `Koreksi: ${count} (rata-rata ${average}/jawaban benar)`,
    statsWrongSubmissions: ({ count }) => `Jawaban salah: ${count}`,
    statsHelpRequested: ({ count }) => `Minta petunjuk: ${count} kali`,

    notFoundTitle: 'Ups!',
    notFoundMessage: 'Halaman tidak ditemukan',
    notFoundRedirecting: ({ seconds }) => `Kembali dalam ${seconds} detik...`,
    notFoundRedirectNow: 'Kembali sekarang',
  },
};

function detectLanguage() {
  try {
    const stored = localStorage.getItem('language');
    if (translations[stored]) return stored;
  } catch (e) { }
  // First visit: follow the browser language
  return (navigator.language || '').toLowerCase().startsWith('id') ? 'id' : 'en';
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
