import { selectNextCharacter } from './selectNextCharacter.js';
import { MAX_RESPONSE_TIME, recordGuess, recordShown, resetCurrentGameStats } from './userStatsUpdates.js';
import { getListForPractice } from '../practiceList.js';
import { kanaCharacters } from '../kanaCharacters.js';

const NOW = new Date(2026, 9, 19, 12).getTime();
const today = new Date(NOW).setHours(0, 0, 0, 0);
const kana = ['あ', 'い', 'う'].map(jp_character => ({ jp_character, romanji: ['x'], type: 'kana' }));

describe('selectNextCharacter', () => {
  // A "random" that always draws the same point of the weights
  const at = point => () => point;

  test('never repeats the previous character when there is another one', () => {
    for (const point of [0, 0.3, 0.6, 0.99]) {
      expect(selectNextCharacter(kana, 'あ', {}, at(point)).jp_character).not.toBe('あ');
    }
  });

  test('a character often answered wrong is drawn more often', () => {
    const daily = (right, wrong) => [{ date: Date.now(), rightGuesses: right, wrongGuesses: wrong }];
    const stats = { あ: { dailyPerformance: daily(10, 0) }, い: { dailyPerformance: daily(10, 0) }, う: { dailyPerformance: daily(1, 9) } };
    const draws = { あ: 0, い: 0, う: 0 };
    for (let index = 0; index < 100; index++) {
      draws[selectNextCharacter(kana, null, stats, at(index / 100)).jp_character]++;
    }
    expect(draws['う']).toBeGreaterThan(draws['あ'] + draws['い']);
  });

  test('one character: it is shown again', () => {
    expect(selectNextCharacter(kana.slice(0, 1), 'あ', {}, at(0.5)).jp_character).toBe('あ');
  });
});

describe('userStats updates', () => {
  test('a first answer creates the stats and today\'s entry', () => {
    const stats = recordGuess({}, 'あ', 'correct', 1500, NOW);
    expect(stats['あ']).toMatchObject({ totalRightGuesses: 1, totaltotalResponseTime: 1500, totalTimesShown: 0 });
    expect(stats['あ'].currentGameStats).toMatchObject({ rightGuesses: 1, totalResponseTime: 1500 });
    expect(stats['あ'].dailyPerformance).toEqual([
      { date: today, rightGuesses: 1, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, askForHelpCounter: 0, responseTimeSum: 1500 },
    ]);
  });

  test('every kind of answer is counted, a slow one at MAX_RESPONSE_TIME', () => {
    let stats = {};
    for (const type of ['wrong', 'wrongSubmission', 'edit', 'askForHelp']) stats = recordGuess(stats, 'あ', type, 0, NOW);
    stats = recordGuess(stats, 'あ', 'correct', 60000, NOW);
    expect(stats['あ'].dailyPerformance[0]).toMatchObject({ wrongGuesses: 1, wrongSubmissions: 1, editCount: 1, askForHelpCounter: 1, responseTimeSum: MAX_RESPONSE_TIME });
    expect(stats['あ']).toMatchObject({ totalWrongGuesses: 1, totalWrongSubmissions: 1, totalEditCount: 1, totalAskForHelpCounter: 1 });
  });

  test('older field names are carried over', () => {
    const stats = recordGuess({ あ: { totalTouchWrongGuesses: 4, currentGameStats: { touchWrongGuesses: 2, totalResponseTime: 0 } } }, 'あ', 'wrong', 0, NOW);
    expect(stats['あ'].totalWrongGuesses).toBe(5);
    expect(stats['あ'].currentGameStats.wrongGuesses).toBe(3);
    expect(stats['あ']).not.toHaveProperty('totalTouchWrongGuesses');
  });

  test('shown questions are counted, a new game starts from zero', () => {
    let stats = recordShown(recordShown({}, 'あ'), 'あ');
    expect(stats['あ'].totalTimesShown).toBe(2);
    stats = recordGuess(stats, 'あ', 'wrong', 0, NOW);
    resetCurrentGameStats(stats);
    expect(stats['あ'].currentGameStats.wrongGuesses).toBe(0);
    expect(stats['あ'].totalWrongGuesses).toBe(1);
  });
});

test('the practice list keeps only the words of the topic picked in the menu', () => {
  const groups = ['hiragana', 'katakana', 'kanji'].flatMap(script => Object.values(kanaCharacters[script]).map(group => group.title));
  const all = getListForPractice(groups, 'words', 'all');
  const it = getListForPractice(groups, 'words', 'it');
  expect(it.length).toBeGreaterThan(0);
  expect(it.length).toBeLessThan(all.length);
  expect(it.every(word => word.tags.includes('it'))).toBe(true);
  // Kana and kanji are never filtered by topic
  expect(getListForPractice(groups, 'mixed', 'it').filter(item => item.type !== 'word').length)
    .toBe(getListForPractice(groups, 'characters', 'it').length);
});
