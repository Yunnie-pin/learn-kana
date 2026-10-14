import { findKanaForAnswer, getConfusionPairs, getMixupKana, getPairsMixedUpSince, getSimilarKana, readConfusions, recordConfusion } from './confusions.js';

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

test('similar kana list the user mix-ups first, most frequent first, then the look-alikes', () => {
  recordConfusion('ツ', 'ン');
  recordConfusion('ソ', 'ツ');
  recordConfusion('ソ', 'ツ');
  expect(getSimilarKana('ツ')).toEqual(['ソ', 'ン', 'シ']);
  expect(getSimilarKana('ぬ')).toEqual(['め']);
  expect(getSimilarKana('山')).toEqual([]);
});

describe('mix-up practice', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const NOW = new Date(2026, 9, 14, 12).getTime();
  const confusions = {
    'ツ': { 'シ': { count: 4, last: NOW - DAY } },
    'シ': { 'ツ': { count: 1, last: NOW - 2 * DAY } },
    'ソ': { 'ン': { count: 5, last: NOW - 30 * DAY } },
    'ぬ': { 'め': { count: 1, last: NOW } },
  };

  test('the pairs mixed up during a game', () => {
    expect(getPairsMixedUpSince(NOW - DAY / 2, confusions).map(pair => pair.characters)).toEqual([['ぬ', 'め']]);
    expect(getPairsMixedUpSince(NOW + 1, confusions)).toEqual([]);
  });

  test('the kana of the pairs, each once', () => {
    expect(getMixupKana([{ characters: ['シ', 'ツ'] }, { characters: ['ツ', 'ソ'] }])).toEqual(['シ', 'ツ', 'ソ']);
  });
});
