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
