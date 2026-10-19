import { kanaCharacters, kanjiLevels, KANJI_PER_GROUP } from '../kanaCharacters.js';
import { kanjiUsage } from '../kanjiUsage.js';
import { kanjiUsageMeanings } from '../kanjiUsageMeanings.js';
import { kanjiReadings } from '../kanjiReadings.js';

const isKanji = character => /[㐀-鿿]/u.test(character);
const nonEmptyStrings = list => Array.isArray(list) && list.every(item => typeof item === 'string' && item.trim());

// Every problem in the kana / kanji data, as readable messages (none when the
// data is fine). Run by kanaCharacters.test.js, so CI fails on bad data
// instead of the app failing when it opens.
export function validateKanaData() {
  const problems = [];
  const seenKanji = new Map();

  for (const { level, categories } of kanjiLevels) {
    for (const category of categories) {
      if (!category.key || !category.title || !category.title_id) {
        problems.push(`${level} theme ${category.key || '?'}: needs a key, a title and a title_id`);
      }
      for (const entry of category.kanji) {
        const where = `${level} ${category.key} ${entry.jp_character || entry.key}`;
        if (!entry.jp_character) {
          problems.push(`${where}: the theme lists a kanji that has no entry`);
          continue;
        }
        if (seenKanji.has(entry.jp_character)) {
          problems.push(`${where}: already in ${seenKanji.get(entry.jp_character)}`);
        }
        seenKanji.set(entry.jp_character, `${level} ${category.key}`);
        if (!entry.key) problems.push(`${where}: needs a key`);
        if (!nonEmptyStrings(entry.romanji) || entry.romanji.length === 0) problems.push(`${where}: needs its romanji`);
        if (!entry.sound || !entry.meaning || !entry.meaning_id) problems.push(`${where}: needs a sound, a meaning and a meaning_id`);
        if (!kanjiUsage[entry.jp_character]) problems.push(`${where}: no word in kanjiUsage.js`);
        if (!kanjiUsageMeanings[entry.jp_character]) problems.push(`${where}: no meaning in kanjiUsageMeanings.js`);
        if (!kanjiReadings[entry.jp_character]) problems.push(`${where}: no readings in kanjiReadings.js`);
      }
    }
  }

  // N5 kanji entries that no theme lists would never be shown
  const groupedKanji = new Set(seenKanji.keys());
  for (const character of Object.keys(kanjiUsageMeanings)) {
    if (!groupedKanji.has(character)) problems.push(`${character}: in kanjiUsageMeanings.js but in no kanji theme`);
  }

  // The readings of every kanji, also the ones only seen in a usage word (水曜日 needs 曜)
  const usageKanji = Object.values(kanaCharacters.kanji)
    .flatMap(group => Object.values(group.characters))
    .flatMap(entry => [...(entry.usage.word || '')].filter(isKanji));
  for (const character of new Set([...groupedKanji, ...usageKanji])) {
    const readings = kanjiReadings[character];
    if (!readings) {
      if (!groupedKanji.has(character)) problems.push(`${character}: used in a kanji usage word, no readings in kanjiReadings.js`);
      continue;
    }
    if (!Array.isArray(readings.onyomi) || !Array.isArray(readings.kunyomi) ||
        ![...readings.onyomi, ...readings.kunyomi].every(reading => typeof reading === 'string' && reading.trim())) {
      problems.push(`${character}: invalid onyomi or kunyomi in kanjiReadings.js`);
    }
  }

  for (const group of Object.values(kanaCharacters.kanji)) {
    if (Object.keys(group.characters).length > KANJI_PER_GROUP) {
      problems.push(`${group.title}: more than ${KANJI_PER_GROUP} kanji`);
    }
  }

  // Words: what the game shows, and the kana groups they need, which must exist
  const groupTitles = {
    hiragana: new Set(Object.values(kanaCharacters.hiragana).map(group => group.title)),
    katakana: new Set(Object.values(kanaCharacters.katakana).map(group => group.title)),
  };
  for (const [key, word] of Object.entries(kanaCharacters.words)) {
    if (!word.jp_character || !nonEmptyStrings(word.romanji) || word.romanji.length === 0 || !word.meaning) {
      problems.push(`word ${key}: needs a jp_character, its romanji and a meaning`);
    }
    for (const script of ['hiragana', 'katakana']) {
      for (const title of word[`${script}_groups`] || []) {
        if (!groupTitles[script].has(title)) problems.push(`word ${key}: no ${script} group "${title}"`);
      }
    }
  }

  return problems;
}
