import hiragana from './data/kana/hiragana.json';
import katakana from './data/kana/katakana.json';
import words from './data/words.json';
import n5Kanji from './data/kanji/n5.json';
import n4Kanji from './data/kanji/n4.json';
import { kanjiUsage } from './kanjiUsage.js';
import { kanjiUsageMeanings } from './kanjiUsageMeanings.js';
import { kanjiReadings } from './kanjiReadings.js';

/*
The characters the app teaches, built from the data in src/data (see its
README.md for the format of each file and how to add a JLPT level):

{
  "hiragana": { "a": { "title": "あ", "tags": [ "main_kana" ], "characters": {
    "a": { "jp_character": "あ", "romanji": [ "a" ], "sound": "あ" }, ... } }, ... },
  "katakana": { ... },
  "words": { "kawaii": { "jp_character": "かわいい", "romanji": [ "kawaii" ], "sound": "かわいい",
    "meaning": "cute", "meaning_id": "imut", "tags": [...], "hiragana_groups": [ "わ", "あ", "か" ],
    "katakana_groups": [] }, ... },
  "kanji": { "n5-numbers-1": { "title": "N5 Numbers - 1", "level": "N5", "themeTitle": ...,
    "characters": { "一": { "jp_character": "一", ..., "usage": { word, romanji, meaning,
    meaning_id }, "readings": { onyomi, kunyomi } } } }, ... }
}

The kanji themes are split into groups of KANJI_PER_GROUP, the groups the menu
lets the user select. The data is checked by validateKanaData.js (run by the
tests), not here, so opening the app does not pay for it.
*/

export const KANJI_PER_GROUP = 10;

// The JLPT levels, easiest first: each one has its themes, and each theme its
// kanji entries ({ key, jp_character, romanji, sound, meaning, meaning_id })
const n5KanjiByCharacter = new Map(n5Kanji.kanji.map(entry => [entry.jp_character, entry]));
export const kanjiLevels = [
  {
    level: 'N5',
    // N5 themes list their kanji by character; the entries are keyed by it too
    categories: n5Kanji.categories.map(({ characters, ...category }) => ({
      ...category,
      kanji: characters.map(character => ({ ...n5KanjiByCharacter.get(character), key: character })),
    })),
  },
  { level: 'N4', categories: n4Kanji.categories },
];

function splitKanjiCategory(category) {
  const groupCount = Math.ceil(category.kanji.length / KANJI_PER_GROUP);
  return Array.from({ length: groupCount }, (_, index) => {
    const groupNumber = index + 1;
    return {
      key: `${category.key}-${groupNumber}`,
      title: `${category.title} - ${groupNumber}`,
      title_id: `Kelompok ${groupNumber}`,
      themeTitle: category.title,
      themeTitle_id: category.title_id,
      groupNumber,
      kanji: category.kanji.slice(index * KANJI_PER_GROUP, groupNumber * KANJI_PER_GROUP),
    };
  });
}

// The kanji entry as the app uses it: a word that uses it, and its readings
function addKanjiUsage({ key, ...entry }) {
  const usage = kanjiUsage[entry.jp_character] || [];
  const meanings = kanjiUsageMeanings[entry.jp_character] || [];
  return {
    ...entry,
    usage: {
      word: usage[0],
      romanji: usage[1],
      meaning: meanings[0],
      meaning_id: meanings[1],
    },
    readings: kanjiReadings[entry.jp_character],
  };
}

const kanji = Object.fromEntries(kanjiLevels.flatMap(({ level, categories }) =>
  categories.flatMap(splitKanjiCategory).map(group => [group.key, {
    title: group.title,
    title_id: group.title_id,
    level,
    themeTitle: group.themeTitle,
    themeTitle_id: group.themeTitle_id,
    groupNumber: group.groupNumber,
    tags: ['main_kana'],
    characters: Object.fromEntries(group.kanji.map(entry => [entry.key, addKanjiUsage(entry)])),
  }])
));

export const kanaCharacters = { hiragana, katakana, words, kanji };
