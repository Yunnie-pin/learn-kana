import { findKanaForAnswer, getConfusionPairs, readConfusions, recordConfusion } from './confusions.js';

beforeEach(() => localStorage.clear());

const kana = [
  { jp_character: 'し', romanji: ['shi', 'si'], type: 'kana' },
  { jp_character: 'シ', romanji: ['shi', 'si'], type: 'kana' },
  { jp_character: 'ツ', romanji: ['tsu'], type: 'kana' },
  { jp_character: 'ソ', romanji: ['so'], type: 'kana' },
  { jp_character: '山', romanji: ['yama'], type: 'kanji' },
];

test('the answer is matched to a kana of the same script when there is one', () => {
  expect(findKanaForAnswer(kana, 'shi', 'ツ')).toBe('シ');
  expect(findKanaForAnswer(kana, 'si', 'ツ')).toBe('シ');
  expect(findKanaForAnswer(kana.filter(k => k.jp_character !== 'シ'), 'shi', 'ツ')).toBe('し');
  expect(findKanaForAnswer(kana, 'tsu', 'ツ')).toBeNull();
  expect(findKanaForAnswer(kana, 'yama', 'ツ')).toBeNull();
  expect(findKanaForAnswer(kana, 'xyz', 'ツ')).toBeNull();
});

test('mix-ups are stored and added up in both directions', () => {
  recordConfusion('ツ', 'シ', 1);
  recordConfusion('ツ', 'シ', 2);
  recordConfusion('シ', 'ツ', 3);
  recordConfusion('ソ', 'ン', 4);
  recordConfusion('ソ', 'ソ', 5);
  expect(readConfusions()['ツ']['シ']).toEqual({ count: 2, last: 2 });
  expect(getConfusionPairs(readConfusions())).toEqual([
    { characters: ['シ', 'ツ'], count: 3, last: 3 },
    { characters: ['ソ', 'ン'], count: 1, last: 4 },
  ]);
  expect(getConfusionPairs(readConfusions(), 1)).toHaveLength(1);
});

test('broken stored data is ignored', () => {
  localStorage.setItem('kanaConfusions', 'not json');
  expect(readConfusions()).toEqual({});
  expect(getConfusionPairs(undefined)).toEqual([]);
});
