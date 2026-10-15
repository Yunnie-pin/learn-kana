import { getPracticeSentences, getReadableSentences, sentenceJlpt, sentenceLevel, sentencePattern, sentences } from './sentences.js';
import { kanaCharacters } from './kanaCharacters.js';

const ALL_GROUP_TITLES = ['hiragana', 'katakana', 'kanji'].flatMap(script =>
  Object.values(kanaCharacters[script] || {}).map(group => group.title)
);
const options = (overrides) => ({ level: 'all', pattern: 'all', exercise: 'type', ...overrides });

test('sentence length levels', () => {
  expect(sentenceLevel({ romanji: ['kore wa mizu desu'] })).toBe('easy');
  expect(sentenceLevel({ romanji: ['watashi wa gakkou de nihongo wo yomimasu'] })).toBe('hard');
  expect(sentenceLevel({ romanji: ['a b c d e f'] })).toBe('medium');
});

test('grammar patterns, from how the sentence ends', () => {
  expect(sentencePattern({ jp_character: 'これは水です' })).toBe('desu');
  expect(sentencePattern({ jp_character: 'それはなんですか' })).toBe('question');
  expect(sentencePattern({ jp_character: '店にパンがあります' })).toBe('exist');
  expect(sentencePattern({ jp_character: '本を読みました' })).toBe('verb');
});

test('the practice sentences follow the options', () => {
  const all = getReadableSentences(ALL_GROUP_TITLES);
  expect(getPracticeSentences(ALL_GROUP_TITLES, options())).toHaveLength(all.length);

  const short = getPracticeSentences(ALL_GROUP_TITLES, options({ level: 'easy' }));
  expect(short.length).toBeGreaterThan(0);
  expect(short.every(sentence => sentenceLevel(sentence) === 'easy')).toBe(true);

  const questions = getPracticeSentences(ALL_GROUP_TITLES, options({ pattern: 'question' }));
  expect(questions.length).toBeGreaterThan(0);
  expect(questions.every(sentence => sentence.jp_character.endsWith('か'))).toBe(true);

  // The particle exercise needs a particle to hide
  const withParticles = getPracticeSentences(ALL_GROUP_TITLES, options({ exercise: 'particle' }));
  expect(withParticles.every(sentence => sentence.particles.length > 0)).toBe(true);
});

test('every level and pattern has sentences', () => {
  for (const level of ['easy', 'medium', 'hard']) {
    expect(getPracticeSentences(ALL_GROUP_TITLES, options({ level })).length).toBeGreaterThan(50);
  }
  for (const pattern of ['desu', 'verb', 'exist', 'question']) {
    expect(getPracticeSentences(ALL_GROUP_TITLES, options({ pattern })).length).toBeGreaterThan(5);
  }
});

test('the pattern set by a template wins over how the sentence ends', () => {
  // 〜ています ends like います (there is) but practices a verb form
  expect(sentencePattern({ jp_character: '母は今、パンを食べています', pattern: 'verb' })).toBe('verb');
  expect(sentencePattern({ jp_character: '母は今、パンを食べています' })).toBe('exist');
});

test('JLPT levels: N5 by default, N4 for the N4 grammar templates', () => {
  expect(sentenceJlpt({})).toBe('N5');
  const n4 = getPracticeSentences(ALL_GROUP_TITLES, options({ jlpt: 'N4' }));
  expect(n4.length).toBeGreaterThan(100);
  expect(n4.every(sentence => sentence.jlpt === 'N4')).toBe(true);
  const n5 = getPracticeSentences(ALL_GROUP_TITLES, options({ jlpt: 'N5' }));
  expect(n5.length + n4.length).toBe(getReadableSentences(ALL_GROUP_TITLES).length);
  // Every N4 grammar is there
  for (const ending of ['てもいいですか', 'てはいけません', 'ことがあります', 'ことができます', 'つもりです', 'なければなりません', 'たりします', 'とおもいます']) {
    expect(sentences.some(sentence => sentence.jlpt === 'N4' && sentence.jp_character.replace(/[んっ]/g, '').includes(ending.replace(/[んっ]/g, '')))).toBe(true);
  }
});

test('the IT topic keeps the IT and workplace sentences', () => {
  const it = getPracticeSentences(ALL_GROUP_TITLES, options({ topic: 'it' }));
  expect(it.length).toBeGreaterThan(150);
  expect(it.every(sentence => sentence.topic === 'it')).toBe(true);
  const spellings = it.map(sentence => sentence.jp_character);
  expect(spellings).toContain('わたしはエンジニアです');
  expect(spellings).toContain('わたしは日本のかいしゃではたらきたいです');
  expect(getPracticeSentences(ALL_GROUP_TITLES, options({ topic: 'all' })))
    .toHaveLength(getReadableSentences(ALL_GROUP_TITLES).length);
});
