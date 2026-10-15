import { isKana, isRomaji, toHiragana, toKatakana } from 'wanakana';
import { kanaCharacters } from './kanaCharacters.js';
import { getListOfKanjiWords } from './practiceList.js';

/* The Dictionary tab: every kana, kanji and word the app teaches, in one
 * list, with a search over the Japanese, the romaji and both meanings.
 *
 * Entry: { id, type: 'kana' | 'kanji' | 'word', jp, reading (kana, words
 * only when it differs from jp), romaji: [], meaning, meaningId, and
 * script (kana), level / onyomi / kunyomi / usage (kanji) }
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
    for (const group of Object.values(kanaCharacters[script])) {
      for (const character of Object.values(group.characters)) {
        add({ type: 'kana', script, jp: character.jp_character, romaji: character.romanji });
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
    });
  }
  return entries;
}

// On'yomi are written in katakana, kun'yomi in hiragana
export const onyomiKana = (reading) => toKatakana(reading);
export const kunyomiKana = (reading) => toHiragana(reading);

const normalize = (text) => String(text || '').toLowerCase().trim();

// The texts a query is compared with: whole texts, and each part of a
// meaning ("before and after, around" -> "before and after", "around")
function searchTexts(entry) {
  const meanings = [entry.meaning, entry.meaningId].filter(Boolean).map(normalize);
  return [
    entry.jp,
    entry.reading,
    ...entry.romaji,
    ...(entry.onyomi || []),
    ...(entry.kunyomi || []),
    ...(entry.onyomi || []).map(onyomiKana),
    ...(entry.kunyomi || []).map(kunyomiKana),
    ...meanings,
    ...meanings.flatMap(meaning => meaning.split(/[,/;()]/)),
  ].filter(Boolean).map(normalize).filter(Boolean);
}

// 0: exact, 1: starts with, 2: contains, null: no match
function matchRank(entry, queries) {
  let best = null;
  for (const text of searchTexts(entry)) {
    for (const query of queries) {
      const rank = text === query ? 0 : text.startsWith(query) ? 1 : text.includes(query) ? 2 : null;
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
  // Romaji also finds the kana: "neko" -> ねこ, ネコ
  const queries = [text];
  if (isRomaji(text)) {
    const hiragana = toHiragana(text);
    if (isKana(hiragana)) queries.push(hiragana, toKatakana(text));
  }
  return ofType
    .map((entry, index) => ({ entry, index, rank: matchRank(entry, queries) }))
    .filter(result => result.rank !== null)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(result => result.entry);
}
