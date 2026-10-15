import { kanaCharacters } from './kanaCharacters.js';
import { getListOfWords, wordInTopic } from './practiceList.js';

/*
 * The words list (kanaCharacters.words): every word is only offered when all
 * the kana groups it is written with are selected, so its hiragana_groups /
 * katakana_groups must match its spelling. Small kana count as their big
 * kana (ュ → ユ, in the ヤ group), ー is not in any group.
 */
const SMALL = {
  'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'っ': 'つ',
  'ァ': 'ア', 'ィ': 'イ', 'ゥ': 'ウ', 'ェ': 'エ', 'ォ': 'オ', 'ャ': 'ヤ', 'ュ': 'ユ', 'ョ': 'ヨ', 'ッ': 'ツ',
};
const groupOf = {};
for (const script of ['hiragana', 'katakana']) {
  for (const group of Object.values(kanaCharacters[script])) {
    for (const character of Object.values(group.characters)) {
      if (!(character.jp_character in groupOf)) groupOf[character.jp_character] = group.title;
    }
  }
}
function groupsOf(jp) {
  const hiragana = new Set();
  const katakana = new Set();
  for (const character of jp) {
    if (character === 'ー') continue;
    const title = groupOf[SMALL[character] || character];
    if (!title) return null;
    (/[゠-ヿ]/.test(character) ? katakana : hiragana).add(title);
  }
  return { hiragana: [...hiragana].sort(), katakana: [...katakana].sort() };
}

const words = Object.entries(kanaCharacters.words);

test('every word lists exactly the kana groups it is written with', () => {
  const wrong = words.filter(([, word]) => {
    const groups = groupsOf(word.jp_character);
    return !groups ||
      JSON.stringify(groups.hiragana) !== JSON.stringify([...word.hiragana_groups].sort()) ||
      JSON.stringify(groups.katakana) !== JSON.stringify([...word.katakana_groups].sort());
  }).map(([key]) => key);
  expect(wrong).toEqual([]);
});

test('every word has romaji, meanings in both languages and is listed once', () => {
  const incomplete = words.filter(([, word]) =>
    // "-" for ー (ko-hi-) and "'" after ん (kin'youbi) are accepted ways to type them
    !word.romanji?.length || !word.romanji.every(romaji => /^[a-z '-]+$/.test(romaji)) || !word.meaning || !word.meaning_id
  ).map(([key]) => key);
  expect(incomplete).toEqual([]);
  const spellings = words.map(([, word]) => word.jp_character);
  expect(spellings.filter((jp, index) => spellings.indexOf(jp) !== index)).toEqual([]);
});

describe('IT words', () => {
  const itWords = words.filter(([, word]) => wordInTopic(word, 'it')).map(([, word]) => word);
  const katakanaGroups = Object.values(kanaCharacters.katakana).map(group => group.title);
  const hiraganaGroups = Object.values(kanaCharacters.hiragana).map(group => group.title);

  test('there are 100+ of them, for developers and the workplace', () => {
    expect(itWords.length).toBeGreaterThanOrEqual(100);
    const spellings = itWords.map(word => word.jp_character);
    for (const word of ['プログラム', 'サーバー', 'データベース', 'エンジニア', 'めんせつ', 'しめきり', 'パソコン', 'かいしゃ']) {
      expect(spellings).toContain(word);
    }
  });

  test('the IT topic only offers IT words, "all" offers every word', () => {
    const allGroups = [...hiraganaGroups, ...katakanaGroups];
    const everyWord = getListOfWords(allGroups);
    expect(everyWord.length).toBe(words.length);
    const it = everyWord.filter(word => wordInTopic(kanaCharacters.words[Object.keys(kanaCharacters.words)
      .find(key => kanaCharacters.words[key].jp_character === word.jp_character)], 'it'));
    expect(it.length).toBe(itWords.length);
    expect(wordInTopic({ tags: ['food'] }, 'all')).toBe(true);
    expect(wordInTopic({ tags: ['food'] }, 'it')).toBe(false);
    expect(wordInTopic({}, 'it')).toBe(false);
  });
});
