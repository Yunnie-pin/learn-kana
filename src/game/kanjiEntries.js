import { kanaCharacters } from '../kanaCharacters.js';

// Every kanji entry the app teaches, by its character
export const kanjiEntryByCharacter = new Map(
  Object.values(kanaCharacters.kanji).flatMap(group => Object.values(group.characters))
    .map(entry => [entry.jp_character, entry])
);

// The kanji the app teaches in a word, once each, in order
export function kanjiOfWord(word) {
  return [...new Set([...String(word || '')])].filter(character => kanjiEntryByCharacter.has(character));
}
