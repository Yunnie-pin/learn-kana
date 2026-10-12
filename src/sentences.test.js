import { getPracticeSentences, getReadableSentences, sentenceLevel, sentencePattern } from './sentences.js';
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
