import { compactDailyPerformance, createBackup, readBackup, restoreBackup, runStatsMaintenance } from './statsStorage.js';
import { calculateMastery } from './mastery.js';

// Thursday 8 October 2026, noon
const NOW = new Date(2026, 9, 8, 12).getTime();

function day(daysAgo) {
  const date = new Date(2026, 9, 8);
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
}

beforeEach(() => localStorage.clear());

test('daily entries older than 90 days become one entry per week', () => {
  const stats = { あ: { totalRightGuesses: 9, totalWrongGuesses: 2, dailyPerformance: [
    // Monday 22 June and Wednesday 24 June 2026: the same week
    { date: new Date(2026, 5, 22).getTime(), rightGuesses: 2, wrongGuesses: 1, responseTimeSum: 3000 },
    { date: new Date(2026, 5, 24).getTime(), rightGuesses: 3, wrongGuesses: 1, responseTimeSum: 4000, editCount: 2 },
    { date: day(10), rightGuesses: 4, responseTimeSum: 5000 },
  ] } };
  const masteryBefore = calculateMastery(stats.あ, 'あ', NOW);

  expect(compactDailyPerformance(stats, NOW)).toBe(true);
  expect(stats.あ.dailyPerformance).toEqual([
    { date: new Date(2026, 5, 22).getTime(), week: true, rightGuesses: 5, wrongGuesses: 2, responseTimeSum: 7000, editCount: 2 },
    { date: day(10), rightGuesses: 4, responseTimeSum: 5000 },
  ]);
  // Old weeks barely count towards mastery anyway
  expect(Math.abs(calculateMastery(stats.あ, 'あ', NOW) - masteryBefore)).toBeLessThanOrEqual(1);
  expect(compactDailyPerformance(stats, NOW)).toBe(false);
});

test('recent entries are left alone', () => {
  const stats = { あ: { dailyPerformance: [{ date: day(30), rightGuesses: 1 }] }, い: {} };
  expect(compactDailyPerformance(stats, NOW)).toBe(false);
});

test('maintenance keeps the best streak before old days are merged, once a day', () => {
  const dailyPerformance = [100, 101, 102, 103, 104].map(daysAgo => ({ date: day(daysAgo), rightGuesses: 1 }));
  localStorage.setItem('userStats', JSON.stringify({ あ: { dailyPerformance } }));
  runStatsMaintenance(NOW);
  expect(localStorage.getItem('bestPracticeStreak')).toBe('5');
  expect(JSON.parse(localStorage.getItem('userStats')).あ.dailyPerformance.every(entry => entry.week)).toBe(true);

  localStorage.setItem('userStats', 'changed');
  runStatsMaintenance(NOW + 60 * 1000);
  expect(localStorage.getItem('userStats')).toBe('changed');
});

test('backup round trip', () => {
  localStorage.setItem('userStats', '{"あ":{}}');
  localStorage.setItem('kanji-srs-progress', '{}');
  localStorage.setItem('problematicKanasFilter', '["あ"]');
  const backup = JSON.parse(JSON.stringify(createBackup(NOW)));
  expect(backup.data).toEqual({ userStats: '{"あ":{}}', 'kanji-srs-progress': '{}' });

  localStorage.clear();
  localStorage.setItem('theme', 'dark');
  restoreBackup(readBackup(backup));
  expect(localStorage.getItem('userStats')).toBe('{"あ":{}}');
  expect(localStorage.getItem('theme')).toBeNull();
});

test('files that are not a backup are refused', () => {
  expect(readBackup(null)).toBeNull();
  expect(readBackup({ app: 'other', version: 1, data: {} })).toBeNull();
  expect(readBackup({ app: 'learn-kana', version: 2, data: {} })).toBeNull();
  expect(readBackup({ app: 'learn-kana', version: 1, data: { userStats: 'not json' } })).toBeNull();
  expect(readBackup({ app: 'learn-kana', version: 1, data: { userStats: '{}', other: 'x', theme: 5 } }))
    .toEqual({ userStats: '{}' });
});
