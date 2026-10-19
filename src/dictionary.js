import { isKana, isRomaji, toHiragana, toKatakana } from 'wanakana';
import { kanaCharacters, kanjiLevels } from './kanaCharacters.js';
import { getListOfKanjiWords } from './practiceList.js';
import { sentences } from './sentences.js';

/* The Dictionary tab: every kana, kanji and word the app teaches, in one
 * list, with a search over the Japanese, the romaji and both meanings.
 *
 * Entry: { id, type: 'kana' | 'kanji' | 'word', jp, reading (kana, words
 * only when it differs from jp), romaji: [], meaning, meaningId, and
 * script / row / vowel (kana), level / category (its theme, see
 * getKanjiCategories) / onyomi / kunyomi / usage (kanji),
 * tags (words: their topics) }
 */
let entries = null;

export function getDictionaryEntries() {
  if (entries) return entries;
  entries = [];
  const seen = new Set();
  const add = (entry) => {
    const id = `${entry.type}:${entry.jp}`;
    if (seen.has(id)) return;
    seen.add(id);
    entries.push({ id, ...entry });
  };

  for (const script of ['hiragana', 'katakana']) {
    for (const [groupKey, group] of Object.entries(kanaCharacters[script])) {
      for (const [vowel, character] of Object.entries(group.characters)) {
        // row / vowel: its place in the gojūon table (ん has a row of its own)
        const isN = /^[んン]$/.test(character.jp_character);
        add({
          type: 'kana',
          script,
          jp: character.jp_character,
          romaji: character.romanji,
          row: isN ? 'nn' : groupKey,
          vowel: isN ? 'a' : vowel,
        });
      }
    }
  }

  const kanjiGroups = Object.values(kanaCharacters.kanji);
  for (const group of kanjiGroups) {
    for (const character of Object.values(group.characters)) {
      add({
        type: 'kanji',
        jp: character.jp_character,
        romaji: character.romanji,
        meaning: character.meaning,
        meaningId: character.meaning_id,
        level: group.level,
        category: group.themeTitle,
        onyomi: character.readings?.onyomi || [],
        kunyomi: character.readings?.kunyomi || [],
        usage: character.usage,
      });
    }
  }

  for (const word of Object.values(kanaCharacters.words)) {
    add({
      type: 'word',
      jp: word.jp_character,
      reading: word.sound !== word.jp_character ? word.sound : undefined,
      romaji: word.romanji,
      meaning: word.meaning,
      meaningId: word.meaning_id,
      tags: word.tags || [],
    });
  }
  // Kanji vocabulary: read with the first romaji, written in hiragana
  for (const word of getListOfKanjiWords(kanjiGroups.map(group => group.title))) {
    add({
      type: 'word',
      jp: word.jp_character,
      reading: toHiragana(word.romanji[0]),
      romaji: word.romanji,
      meaning: word.meaning,
      meaningId: word.meaning_id,
      tags: word.tags || [],
    });
  }
  return entries;
}

const KANJI = /[㐀-䶿一-鿿]/;
export const isKanji = (character) => KANJI.test(character);

// The kanji entry of a character, when the app teaches it
let kanjiById = null;
export function getKanjiEntry(character) {
  if (!kanjiById) {
    kanjiById = new Map(getDictionaryEntries().filter(entry => entry.type === 'kanji').map(entry => [entry.jp, entry]));
  }
  return kanjiById.get(character) || null;
}

// The topics of the words, most used first
let wordTopics = null;
export function getWordTopics() {
  if (!wordTopics) {
    const counts = new Map();
    for (const entry of getDictionaryEntries()) {
      for (const tag of entry.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    wordTopics = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
  }
  return wordTopics;
}

// The kanji categories (the themes of src/data/kanji), easiest level first:
// { title (what an entry's category is), title_id, level }. Only the ones of
// `level` when given.
export function getKanjiCategories(level = 'all') {
  return kanjiLevels
    .filter(item => level === 'all' || item.level === level)
    .flatMap(item => item.categories.map(category => ({ title: category.title, title_id: category.title_id, level: item.level })));
}

// "days_of_week" -> "Days of week"
export const topicLabel = (tag) => tag === 'it' ? 'IT' : (tag.charAt(0).toUpperCase() + tag.slice(1)).replace(/_/g, ' ');

// Up to `count` sentences of the app that use a kanji or a word, shortest
// first. Short kana words (いい, ここ) would be found inside other words: a
// word needs a kanji or at least 3 kana.
const sentencesByEntry = new Map();
export function getExampleSentences(entry, count = 1) {
  if (entry.type === 'kana') return [];
  if (entry.type === 'word' && ![...entry.jp].some(isKanji) && [...entry.jp].length < 3) return [];
  if (!sentencesByEntry.has(entry.id)) {
    sentencesByEntry.set(entry.id, sentences
      .filter(sentence => sentence.jp_character.includes(entry.jp))
      .sort((a, b) => a.jp_character.length - b.jp_character.length));
  }
  return sentencesByEntry.get(entry.id).slice(0, count);
}

// The gojūon table of a script: rows of the 5 vowels (null: no kana there)
export const KANA_VOWELS = ['a', 'i', 'u', 'e', 'o'];
export function getKanaTable(script) {
  const rows = new Map();
  for (const entry of getDictionaryEntries()) {
    if (entry.type !== 'kana' || entry.script !== script) continue;
    if (!rows.has(entry.row)) rows.set(entry.row, Object.fromEntries(KANA_VOWELS.map(vowel => [vowel, null])));
    rows.get(entry.row)[entry.vowel] = entry;
  }
  // ん after わ, before the dakuten rows
  const order = [...rows.keys()].filter(row => row !== 'nn');
  order.splice(order.indexOf('w') + 1, 0, 'nn');
  return order.filter(row => rows.has(row)).map(row => ({ row, cells: KANA_VOWELS.map(vowel => rows.get(row)[vowel]) }));
}

// On'yomi are written in katakana, kun'yomi in hiragana
export const onyomiKana = (reading) => toKatakana(reading);
export const kunyomiKana = (reading) => toHiragana(reading);

const normalize = (text) => String(text || '').toLowerCase().trim();

// One spelling for every way to type the same romaji, so that Kunrei-shiki
// (si, tu, syo), long vowels (kyoo, kyō, kyou) and m before b / p (shimbun)
// find the Hepburn of the data. Only for comparing, never shown.
const ROMAJI_KEY_RULES = [
  [/ā/g, 'aa'], [/ī/g, 'ii'], [/ū/g, 'uu'], [/ē/g, 'ee'], [/ō/g, 'ou'],
  [/['\-\s]/g, ''],
  [/oo/g, 'ou'],
  [/sy/g, 'sh'], [/[zj]y/g, 'j'], [/[tc]y/g, 'ch'],
  [/si/g, 'shi'], [/ti/g, 'chi'], [/tu/g, 'tsu'], [/hu/g, 'fu'], [/zi/g, 'ji'],
  [/m(?=[bp])/g, 'n'], [/nn/g, 'n'],
];
export function romajiKey(text) {
  return ROMAJI_KEY_RULES.reduce((key, [pattern, replacement]) => key.replace(pattern, replacement), normalize(text));
}

// What a query is compared with, built once per entry: the Japanese texts
// and meanings as they are (each part of a meaning too: "before and after,
// around" -> "before and after", "around"), and the romaji as romajiKey
const searchIndex = new WeakMap();
function searchTexts(entry) {
  if (searchIndex.has(entry)) return searchIndex.get(entry);
  const meanings = [entry.meaning, entry.meaningId].filter(Boolean).map(normalize);
  const romaji = [...entry.romaji, ...(entry.onyomi || []), ...(entry.kunyomi || [])];
  const texts = {
    plain: [
      entry.jp,
      entry.reading,
      ...(entry.onyomi || []).map(onyomiKana),
      ...(entry.kunyomi || []).map(kunyomiKana),
      ...meanings,
      ...meanings.flatMap(meaning => meaning.split(/[,/;()]/)),
    ].filter(Boolean).map(normalize).filter(Boolean),
    romaji: romaji.map(romajiKey).filter(Boolean),
  };
  searchIndex.set(entry, texts);
  return texts;
}

// 0: exact, 1: starts with, 2: contains, null: no match. One Latin letter
// would be in nearly every meaning: it only finds what starts with it.
function rankText(text, query) {
  if (text === query) return 0;
  if (text.startsWith(query)) return 1;
  if (text.includes(query) && !/^[a-z]$/.test(query)) return 2;
  return null;
}

function matchRank(entry, queries) {
  const texts = searchTexts(entry);
  let best = null;
  for (const [kind, query] of queries) {
    for (const text of texts[kind]) {
      const rank = rankText(text, query);
      if (rank !== null && (best === null || rank < best)) best = rank;
      if (best === 0) return 0;
    }
  }
  return best;
}

// Entries of the type ('all', 'kana', 'kanji', 'word') matching the query,
// best matches first; without a query, all of them in the app's order
export function searchDictionary(query, type = 'all', list = getDictionaryEntries()) {
  const ofType = type === 'all' ? list : list.filter(entry => entry.type === type);
  const text = normalize(query);
  if (!text) return ofType;
  const queries = [['plain', text]];
  if (isRomaji(text)) {
    queries.push(['romaji', romajiKey(text)]);
    // Romaji also finds the kana: "neko" -> ねこ, ネコ. Not for one letter:
    // "a" -> あ would be in hundreds of words
    const hiragana = toHiragana(text);
    if (text.length >= 2 && isKana(hiragana)) queries.push(['plain', hiragana], ['plain', toKatakana(text)]);
  }
  return ofType
    .map((entry, index) => ({ entry, index, rank: matchRank(entry, queries) }))
    .filter(result => result.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(result => result.entry);
}

// The words that are written with a kanji (水 -> 水曜日, 池の水...)
export function getWordsWithKanji(kanji, count = 12) {
  return getDictionaryEntries().filter(entry => entry.type === 'word' && entry.jp.includes(kanji)).slice(0, count);
}

// The kanji entries of a word, in order, once each
export function getKanjiOfWord(entry) {
  return [...new Set([...entry.jp])].map(getKanjiEntry).filter(Boolean);
}

// Where a search query is in a text, to highlight it: [start, end] or null.
// Romaji also finds its kana (mizu -> みず).
export function findMatch(text, query) {
  const value = normalize(query);
  if (!text || !value) return null;
  const candidates = [value];
  if (isRomaji(value) && value.length >= 2) {
    const hiragana = toHiragana(value);
    if (isKana(hiragana)) candidates.push(hiragana, toKatakana(value));
  }
  const lower = String(text).toLowerCase();
  for (const candidate of candidates) {
    const start = lower.indexOf(candidate);
    if (start >= 0) return [start, start + candidate.length];
  }
  return null;
}

// Number of single-letter edits from a to b (Levenshtein)
function editDistance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

// For a search without results: up to `count` romaji or meanings spelled
// almost the same ("mizuu" -> "mizu", "wtaer" -> "water"), closest first
export function getSpellingSuggestions(query, count = 3) {
  const value = normalize(query);
  if (value.length < 3 || !/^[a-z' -]+$/.test(value)) return [];
  const limit = value.length >= 6 ? 2 : 1;
  const found = new Map();
  for (const entry of getDictionaryEntries()) {
    const words = [
      ...entry.romaji,
      ...[entry.meaning, entry.meaningId].filter(Boolean).flatMap(meaning => meaning.split(/[,/;()]/)),
    ].map(normalize).filter(text => text && Math.abs(text.length - value.length) <= limit);
    for (const word of words) {
      if (found.has(word)) continue;
      const distance = editDistance(value, word);
      if (distance > 0 && distance <= limit) found.set(word, distance);
    }
  }
  return [...found.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).slice(0, count).map(([word]) => word);
}

// The last searches, newest first (localStorage: they help on the next visit too)
const HISTORY_KEY = 'dictionary-history';
export const HISTORY_SIZE = 5;
export function readSearchHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history.filter(item => typeof item === 'string').slice(0, HISTORY_SIZE) : [];
  } catch (error) {
    return [];
  }
}
export function addToSearchHistory(query) {
  const value = String(query || '').trim();
  if (!value) return readSearchHistory();
  const history = [value, ...readSearchHistory().filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, HISTORY_SIZE);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) { }
  return history;
}
export function clearSearchHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) { }
  return [];
}
