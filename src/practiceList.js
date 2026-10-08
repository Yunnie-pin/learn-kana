import { kanaCharacters } from './kanaCharacters.js';

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

export function getListForPractice(charGroups, mode) {
  const characters = getListOfKanas(charGroups);
  if (mode === 'mixed') {
    return [...characters, ...getListOfWords(charGroups)];
  }
  if (mode === 'words') return getListOfWords(charGroups);
  // "characters": every selected kana and kanji group
  return characters;
}

// The practice type picked in the menu: "characters", "words" or "mixed"
export function getStoredPracticeMode() {
  const stored = localStorage.getItem('game-mode-practice') ||
    (localStorage.getItem('game-mode-word') === 'true' ? 'words' : 'characters');
  // Older "kanji" / "srs" values count as "characters", like in GameModeSelector
  return ['words', 'mixed'].includes(stored) ? stored : 'characters';
}
