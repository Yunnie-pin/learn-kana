import { kanaCharacters } from './kanaCharacters.js';
import { getListOfKanjiWords, getListOfWords, wordInTopic } from './practiceList.js';
import { itUsageWords, kanjiWords } from './kanjiWords.js';

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

  test('the topic separates the general words, the IT ones and all of them', () => {
    const allGroups = [...hiraganaGroups, ...katakanaGroups];
    const everyWord = getListOfWords(allGroups);
    expect(everyWord.length).toBe(words.length);
    const it = everyWord.filter(word => wordInTopic(kanaCharacters.words[Object.keys(kanaCharacters.words)
      .find(key => kanaCharacters.words[key].jp_character === word.jp_character)], 'it'));
    expect(it.length).toBe(itWords.length);
    // "general" is everything the IT topic does not take
    const general = everyWord.filter(word => wordInTopic(word, 'general'));
    expect(general.length + it.length).toBe(everyWord.length);
    expect(wordInTopic({ tags: ['food'] }, 'all')).toBe(true);
    expect(wordInTopic({ tags: ['food'] }, 'it')).toBe(false);
    expect(wordInTopic({ tags: ['food'] }, 'general')).toBe(true);
    expect(wordInTopic({ tags: ['it'] }, 'general')).toBe(false);
    expect(wordInTopic({}, 'it')).toBe(false);
    expect(wordInTopic({}, 'general')).toBe(true);
  });
});

describe('kanji words', () => {
  const kanjiGroups = Object.values(kanaCharacters.kanji).map(group => group.title);
  const kanjiGroupOf = {};
  Object.values(kanaCharacters.kanji).forEach(group =>
    Object.values(group.characters).forEach(character => { kanjiGroupOf[character.jp_character] ??= group.title; })
  );
  const isKanji = (character) => /[一-鿿]/.test(character);

  test('selecting only kanji groups gives words: the vocabulary of those kanji', () => {
    const words = getListOfKanjiWords(kanjiGroups);
    expect(words.length).toBeGreaterThan(150);
    expect(words.map(word => word.jp_character)).toEqual(expect.arrayContaining(['水曜日', '毎日', '今日']));
    // Every one only uses taught kanji, has a reading and meanings
    words.forEach(word => {
      expect([...word.jp_character].filter(isKanji).every(character => kanjiGroupOf[character])).toBe(true);
      expect(word.romanji[0]).toMatch(/^[a-z' ]+$/);
      expect(word.meaning).toBeTruthy();
      expect(word.meaning_id).toBeTruthy();
    });
    // Each word once
    expect(new Set(words.map(word => word.jp_character)).size).toBe(words.length);
  });

  test('only the words whose kanji are all selected', () => {
    const oneGroup = kanjiGroups[0];
    const words = getListOfKanjiWords([oneGroup]);
    words.forEach(word => {
      [...word.jp_character].filter(isKanji).forEach(character => expect(kanjiGroupOf[character]).toBe(oneGroup));
    });
    expect(getListOfKanjiWords([])).toEqual([]);
    // Kana groups alone give no kanji words
    expect(getListOfKanjiWords(Object.values(kanaCharacters.hiragana).map(group => group.title))).toEqual([]);
  });

  test('words with a kanji the app does not teach are left out', () => {
    const spellings = getListOfKanjiWords(kanjiGroups).map(word => word.jp_character);
    // 一番 needs 番, which is not taught
    expect(kanjiGroupOf['番']).toBeUndefined();
    expect(spellings).not.toContain('一番');
  });


});

describe('kanji vocabulary list (kanjiWords.js)', () => {
  const kanjiGroups = Object.values(kanaCharacters.kanji).map(group => group.title);
  const taught = new Set(Object.values(kanaCharacters.kanji).flatMap(group => Object.values(group.characters).map(c => c.jp_character)));
  const usageWords = new Set(Object.values(kanaCharacters.kanji).flatMap(group =>
    Object.values(group.characters).map(c => c.usage?.word).filter(Boolean)));
  const isKanji = (character) => /[一-鿿]/.test(character);

  test('only taught kanji, complete, each word once and not a usage word again', () => {
    const problems = [];
    const seen = new Set();
    for (const [word, romanji, meaning, meaningId, tags] of kanjiWords) {
      const untaught = [...word].filter(isKanji).filter(character => !taught.has(character));
      if (untaught.length) problems.push(`${word}: untaught ${untaught.join('')}`);
      if (![...word].some(isKanji)) problems.push(`${word}: no kanji`);
      if (!romanji.length || !romanji.every(r => /^[a-z]+$/.test(r))) problems.push(`${word}: romaji ${romanji}`);
      if (!meaning || !meaningId) problems.push(`${word}: meaning`);
      if (tags && !tags.every(tag => tag === 'it')) problems.push(`${word}: tags ${tags}`);
      if (seen.has(word)) problems.push(`${word}: twice`);
      if (usageWords.has(word)) problems.push(`${word}: already a usage word`);
      seen.add(word);
    }
    itUsageWords.forEach(word => { if (!usageWords.has(word)) problems.push(`${word}: not a usage word`); });
    expect(problems).toEqual([]);
  });

  test('all of them are offered once every kanji group is selected', () => {
    const offered = new Set(getListOfKanjiWords(kanjiGroups).map(word => word.jp_character));
    expect(kanjiWords.filter(([word]) => !offered.has(word)).map(([word]) => word)).toEqual([]);
    expect(offered.size).toBeGreaterThan(350);
  });

  test('IT & work kanji words are in the IT topic', () => {
    const it = getListOfKanjiWords(kanjiGroups).filter(word => wordInTopic(word, 'it')).map(word => word.jp_character);
    expect(it).toEqual(expect.arrayContaining(['会社', '仕事', '社員', '入力', '通知', '働く']));
    expect(it).not.toContain('水曜日');
    // Every usage word listed as IT is offered (all its kanji are taught)
    expect(itUsageWords.filter(word => !it.includes(word))).toEqual([]);
  });
});
