import { kanaCharacters } from './kanaCharacters.js';
import { itUsageWords, kanjiWords } from './kanjiWords.js';

// Creates a list of all possible Kanas/Words to show, the element outputs look like this:
// { "jp_character": "あ", "romanji": ["a"], "sound": "あ", "type": "kana/word", *"vocal": "a", *"meaning": "dog" }
// *The key "vocal" only shows up when the type is "kana"
// *The key "meaning" only shows up when the type is "word"
export function getListOfKanas(charGroups) {
  let output = []
  const selectedGroups = Array.isArray(charGroups) ? charGroups : [];
  Object.entries(kanaCharacters).forEach(([categoryKey, category]) => {
    if (categoryKey === 'words') return;
    Object.entries(category).forEach(([groupKey, charGroup]) => {
      if (!charGroup || !charGroup.title || !selectedGroups.includes(charGroup.title)) return;
      Object.entries(charGroup.characters).forEach(([charKey, char]) => {
        if (!char || typeof char !== 'object') return;
        const normalizedChar = { ...char };
        if (categoryKey === 'kanji') {
          normalizedChar.type = 'kanji';
        } else {
          normalizedChar.vocal = normalizedChar.vocal || charKey;
          normalizedChar.type = 'kana';
        }
        output.push(normalizedChar);
      });
    });
  });
  return output;
}

export function getListOfWords(charGroups) {
  let output = []
  const selectedGroups = Array.isArray(charGroups) ? charGroups : [];
  Object.entries(kanaCharacters.words).forEach(([key, value]) => {
    let ignoreWord = false;
    for (let i = 0; i < value.hiragana_groups.length; i++) {
      if (!selectedGroups.includes(value.hiragana_groups[i])) {
        ignoreWord = true;
      }
    }
    for (let i = 0; i < value.katakana_groups.length; i++) {
      if (!selectedGroups.includes(value.katakana_groups[i])) {
        ignoreWord = true;
      }
    }
    if (!ignoreWord) {
      output.push({
        "jp_character": value.jp_character,
        "romanji": value.romanji,
        "sound": value.sound,
        "meaning": value.meaning,
        "type": "word",
      })
    }
  })
  return output;
}

// Kanji vocabulary for the words practice: the usage word of every kanji
// (水 -> 水曜日, 時 -> 時間...), offered when all of its kanji are in the
// selected kanji groups. Its kana (多い, 少し) need no kana group: kanji are
// practiced once kana can be read. Words with a kanji the app doesn't teach
// (一番) are left out, and one-kanji words are the kanji questions themselves.
let kanjiGroupByCharacter = null;
export function getListOfKanjiWords(charGroups) {
  const selectedGroups = Array.isArray(charGroups) ? charGroups : [];
  if (!kanjiGroupByCharacter) {
    kanjiGroupByCharacter = {};
    for (const group of Object.values(kanaCharacters.kanji || {})) {
      for (const character of Object.values(group.characters || {})) {
        if (!(character.jp_character in kanjiGroupByCharacter)) {
          kanjiGroupByCharacter[character.jp_character] = group.title;
        }
      }
    }
  }
  const isKanji = (character) => /[㐀-䶿一-鿿]/.test(character);
  const output = [];
  const seen = new Set();
  for (const group of Object.values(kanaCharacters.kanji || {})) {
    for (const character of Object.values(group.characters || {})) {
      const usage = character.usage;
      if (!usage || seen.has(usage.word) || [...usage.word].length < 2) continue;
      const kanji = [...usage.word].filter(isKanji);
      const readable = kanji.length > 0 && kanji.every(item =>
        kanjiGroupByCharacter[item] && selectedGroups.includes(kanjiGroupByCharacter[item])
      );
      if (!readable) continue;
      seen.add(usage.word);
      output.push({
        "jp_character": usage.word,
        "romanji": [usage.romanji],
        "sound": usage.word,
        "meaning": usage.meaning,
        "meaning_id": usage.meaning_id,
        "tags": itUsageWords.includes(usage.word) ? ['it'] : [],
        "type": "word",
        "kanjiWord": true,
      });
    }
  }
  // More kanji vocabulary (kanjiWords.js), with the same rule
  for (const [word, romanji, meaning, meaningId, tags = []] of kanjiWords) {
    if (seen.has(word)) continue;
    const kanji = [...word].filter(isKanji);
    const readable = kanji.length > 0 && kanji.every(item =>
      kanjiGroupByCharacter[item] && selectedGroups.includes(kanjiGroupByCharacter[item])
    );
    if (!readable) continue;
    seen.add(word);
    output.push({
      "jp_character": word,
      "romanji": romanji,
      "sound": word,
      "meaning": meaning,
      "meaning_id": meaningId,
      "tags": tags,
      "type": "word",
      "kanjiWord": true,
    });
  }
  return output;
}

export function getListForPractice(charGroups, mode) {
  const characters = getListOfKanas(charGroups);
  if (mode === 'mixed') {
    return [...characters, ...getListOfWords(charGroups), ...getListOfKanjiWords(charGroups)];
  }
  if (mode === 'words') return [...getListOfWords(charGroups), ...getListOfKanjiWords(charGroups)];
  // "characters": every selected kana and kanji group
  return characters;
}

// The practice type picked in the menu: "characters", "words" or "mixed"
export function getStoredPracticeMode() {
  const stored = localStorage.getItem('game-mode-practice') ||
    (localStorage.getItem('game-mode-word') === 'true' ? 'words' : 'characters');
  // Older "kanji" values, and the kanji review ("srs", its own session), count as "characters"
  return ['words', 'mixed'].includes(stored) ? stored : 'characters';
}

// Order of the characters practice: "random" picks the next character by how
// well it is known (weakest more often), "sequential" goes through the
// selection in the order of the kana table (あ い う え お, か き く け こ...)
export const CHARACTER_ORDERS = ['random', 'sequential'];
export const CHARACTER_ORDER_KEY = 'game-mode-order';

export function getCharacterOrder() {
  let stored = null;
  try {
    stored = localStorage.getItem(CHARACTER_ORDER_KEY);
  } catch (error) { }
  return CHARACTER_ORDERS.includes(stored) ? stored : 'random';
}

// Topic of the words practice: every word, or only the IT and workplace words
// (tag "it": プログラム, サーバー, めんせつ...) for people heading to an IT company
export const WORD_TOPICS = ['all', 'it'];
export const WORD_TOPIC_KEY = 'game-mode-word-topic';

export function getWordTopic() {
  let stored = null;
  try {
    stored = localStorage.getItem(WORD_TOPIC_KEY);
  } catch (error) { }
  return WORD_TOPICS.includes(stored) ? stored : 'all';
}

export function wordInTopic(word, topic = getWordTopic()) {
  return topic === 'all' || (word.tags || []).includes(topic);
}
