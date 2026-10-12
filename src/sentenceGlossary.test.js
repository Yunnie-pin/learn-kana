import { sentences } from './sentences.js';
import { sentenceBreakdown } from './sentenceGlossary.js';

test('every word of every sentence has a meaning in both languages', () => {
  const missing = new Set();
  for (const sentence of sentences) {
    for (const language of ['en', 'id']) {
      const words = sentenceBreakdown(sentence, language);
      if (!words.length) missing.add(`${sentence.jp_character} (not lined up)`);
      words.filter(word => !word.meaning).forEach(word => missing.add(word.text));
    }
  }
  expect([...missing]).toEqual([]);
});

test('breaks a sentence into its words, with the role of each particle', () => {
  const sentence = sentences.find(entry => entry.jp_character === '毎週、山へ行きます');
  expect(sentenceBreakdown(sentence, 'en')).toEqual([
    { text: '毎週', romaji: 'maishuu', particle: false, meaning: 'every week' },
    { text: '山', romaji: 'yama', particle: false, meaning: expect.stringMatching(/mountain/i) },
    { text: 'へ', romaji: 'e', particle: true, meaning: 'direction: "to ..."' },
    { text: '行きます', romaji: 'ikimasu', particle: false, meaning: 'go' },
  ]);
  expect(sentenceBreakdown(sentence, 'id')[3].meaning).toBe('pergi');
});

test('keeps a word written with a space in romaji together', () => {
  const sentence = sentences.find(entry => entry.jp_character === 'わたしはともだちといっしょに学校へ行きます');
  expect(sentenceBreakdown(sentence, 'en').map(word => word.text))
    .toEqual(['わたし', 'は', 'ともだち', 'と', 'いっしょに', '学校', 'へ', '行きます']);
});
