import { readingsUsedInWord } from './kanjiWordReadings.js';
import { kanaCharacters } from './kanaCharacters.js';
import { getListOfKanjiWords } from './practiceList.js';

const used = (word, romanji) => {
  const result = readingsUsedInWord(word, romanji);
  return result && Object.fromEntries([...result].map(([kanji, { on, kun }]) => [kanji, [...on, ...kun]]));
};

test('every kanji gets the reading it has in the word', () => {
  expect(used('水曜日', 'suiyoubi')).toEqual({ 水: ['sui'], 曜: ['you'], 日: ['hi'] });
  expect(used('先生', 'sensei')).toEqual({ 先: ['sen'], 生: ['sei'] });
  expect(used('日曜日', 'nichiyoubi')).toEqual({ 日: ['nichi', 'hi'], 曜: ['you'] });
});

test('on and kun readings are told apart', () => {
  const result = readingsUsedInWord('水曜日', 'suiyoubi');
  expect([...result.get('水').on]).toEqual(['sui']);
  expect([...result.get('日').kun]).toEqual(['hi']);
});

test('sound changes: voicing, a doubled consonant, okurigana in kana', () => {
  expect(used('東口', 'higashiguchi')).toEqual({ 東: ['higashi'], 口: ['kuchi'] });
  expect(used('中学校', 'chuugakkou')).toEqual({ 中: ['chuu'], 学: ['gaku'], 校: ['kou'] });
  expect(used('安い', 'yasui')).toEqual({ 安: ['yasui'] });
});

test('words read as a whole match nothing', () => {
  expect(readingsUsedInWord('今日', 'kyou')).toBeNull();
});

test('most kanji words are split over their kanji', () => {
  const groups = Object.values(kanaCharacters.kanji).map(group => group.title);
  const words = getListOfKanjiWords(groups);
  const unmatched = words.filter(word => !readingsUsedInWord(word.jp_character, word.romanji));
  expect(unmatched.length).toBeLessThan(words.length * 0.1);
});
