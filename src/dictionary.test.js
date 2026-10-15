import { getDictionaryEntries, searchDictionary } from './dictionary';
import { kanaCharacters } from './kanaCharacters';

const jp = (results) => results.map(entry => entry.jp);
const count = (type) => getDictionaryEntries().filter(entry => entry.type === type).length;

test('has every kana, kanji and word, once', () => {
  const ids = getDictionaryEntries().map(entry => entry.id);
  expect(new Set(ids).size).toBe(ids.length);
  const kanji = Object.values(kanaCharacters.kanji).flatMap(group => Object.keys(group.characters));
  expect(count('kanji')).toBe(kanji.length);
  expect(count('kana')).toBeGreaterThan(100);
  // The kana words and the kanji vocabulary
  expect(count('word')).toBeGreaterThan(Object.keys(kanaCharacters.words).length);
});
test('finds by Japanese, romaji, meaning and kanji reading, best match first', () => {
  expect(jp(searchDictionary('水'))[0]).toBe('水');
  expect(jp(searchDictionary('ka', 'kana')).slice(0, 2)).toEqual(['か', 'カ']);
  expect(jp(searchDictionary('water', 'kanji'))[0]).toBe('水');
  expect(jp(searchDictionary('sui', 'kanji'))).toContain('水');
  expect(jp(searchDictionary('mizu', 'kanji'))).toContain('水');
  // Indonesian meanings too
  expect(jp(searchDictionary('imut', 'word'))).toContain('かわいい');
});

test('romaji also finds the kana spelling', () => {
  expect(jp(searchDictionary('kawaii', 'word'))[0]).toBe('かわいい');
  expect(jp(searchDictionary('かわいい', 'word'))[0]).toBe('かわいい');
});

test('filters by type, and shows everything without a query', () => {
  expect(searchDictionary('', 'kanji').every(entry => entry.type === 'kanji')).toBe(true);
  expect(searchDictionary('  ').length).toBe(getDictionaryEntries().length);
  expect(searchDictionary('zzzqqq')).toEqual([]);
});

test('other ways to type the romaji find the same entries', () => {
  // Kunrei-shiki, long vowels, m before b / p
  expect(jp(searchDictionary('si', 'kana'))).toContain('し');
  expect(jp(searchDictionary('tu', 'kana'))).toContain('つ');
  expect(jp(searchDictionary('tyotto', 'word'))).toEqual(jp(searchDictionary('chotto', 'word')));
  const hepburn = searchDictionary('kyuu', 'kanji');
  expect(hepburn.length).toBeGreaterThan(0);
  expect(jp(searchDictionary('kyū', 'kanji'))).toEqual(jp(hepburn));
  expect(jp(searchDictionary('shimbun', 'word'))).toEqual(jp(searchDictionary('shinbun', 'word')));
});

test('one Latin letter only finds what starts with it', () => {
  const results = searchDictionary('a');
  expect(results.length).toBeLessThan(searchDictionary('').length / 4);
  expect(jp(results)).toContain('あ');
  // Not the words with "a" somewhere in them, nor every word with あ
  expect(jp(results)).not.toContain('かわいい');
});

describe('helpers of the Dictionary page', () => {
  const { getExampleSentences, getKanaTable, getKanjiEntry, getWordTopics } = require('./dictionary');
  const entry = (type, text) => getDictionaryEntries().find(item => item.type === type && item.jp === text);

  test('the gojūon table: 5 vowels a row, ん on a row of its own after わ', () => {
    const rows = getKanaTable('hiragana');
    const text = (row) => row.cells.map(cell => cell ? cell.jp : '·').join('');
    expect(text(rows[0])).toBe('あいうえお');
    expect(rows.map(text)).toContain('なにぬねの');
    expect(text(rows.find(row => row.row === 'y'))).toBe('や·ゆ·よ');
    const w = rows.findIndex(row => row.row === 'w');
    expect(text(rows[w + 1])).toBe('ん····');
    // Every kana is in the table
    const inTable = rows.flatMap(row => row.cells).filter(Boolean).length;
    expect(inTable).toBe(getDictionaryEntries().filter(item => item.type === 'kana' && item.script === 'hiragana').length);
  });

  test('example sentences use the word, shortest first; none for short kana words', () => {
    const examples = getExampleSentences(entry('kanji', '水'));
    expect(examples.length).toBe(2);
    examples.forEach(sentence => expect(sentence.jp_character).toContain('水'));
    expect(examples[0].jp_character.length).toBeLessThanOrEqual(examples[1].jp_character.length);
    expect(getExampleSentences(entry('kana', 'あ'))).toEqual([]);
  });

  test('kanji entries and word topics', () => {
    expect(getKanjiEntry('水').type).toBe('kanji');
    expect(getKanjiEntry('あ')).toBeNull();
    expect(getWordTopics()).toContain('it');
    expect(entry('word', 'かわいい').tags).toContain('adjectives');
  });
});
