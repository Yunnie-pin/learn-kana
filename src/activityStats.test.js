import { addDays, getCalendarWeeks, getDailyTotals, getStreaks, getWeeklyTrend } from './activityStats.js';

// Thursday 8 October 2026, noon
const NOW = new Date(2026, 9, 8, 12).getTime();
const TODAY = new Date(2026, 9, 8).getTime();

function day(daysAgo) {
  return addDays(TODAY, -daysAgo);
}

function userStats(entries) {
  return {
    あ: { dailyPerformance: entries.map(([daysAgo, right, wrong = 0]) => ({
      date: day(daysAgo), rightGuesses: right, wrongGuesses: wrong, responseTimeSum: right * 2000,
    })) },
  };
}

test('daily totals add up all characters and skip days without answers', () => {
  const stats = {
    あ: { dailyPerformance: [{ date: day(0), rightGuesses: 2, wrongGuesses: 1, responseTimeSum: 3000 }] },
    い: { dailyPerformance: [
      { date: day(0), rightGuesses: 1, responseTimeSum: 1000 },
      { date: day(1), editCount: 4 },
    ] },
    う: {},
  };
  expect(getDailyTotals(stats)).toEqual({ [day(0)]: { right: 3, wrong: 1, responseTimeSum: 4000 } });
});

test('streaks', () => {
  const totals = getDailyTotals(userStats([[0, 1], [1, 1], [2, 1], [10, 1], [11, 1], [12, 1], [13, 1]]));
  expect(getStreaks(totals, NOW)).toEqual({ current: 3, best: 4 });
});

test('the current streak is kept while today has no practice yet', () => {
  expect(getStreaks(getDailyTotals(userStats([[1, 1], [2, 1]])), NOW).current).toBe(2);
  expect(getStreaks(getDailyTotals(userStats([[2, 1], [3, 1]])), NOW).current).toBe(0);
  expect(getStreaks({}, NOW)).toEqual({ current: 0, best: 0 });
});

test('calendar ends with the week of today, Monday first, without future days', () => {
  const weeks = getCalendarWeeks(getDailyTotals(userStats([[0, 3, 1]])), 12, NOW);
  expect(weeks).toHaveLength(12);
  const lastWeek = weeks[11];
  // Monday 5 October
  expect(lastWeek[0].date).toBe(new Date(2026, 9, 5).getTime());
  expect(lastWeek[3]).toEqual({ date: TODAY, answers: 4, right: 3 });
  expect(lastWeek.slice(4)).toEqual([null, null, null]);
  expect(weeks[0][0].date).toBe(new Date(2026, 6, 20).getTime());
});

test('weekly trend', () => {
  const trend = getWeeklyTrend(getDailyTotals(userStats([[0, 3, 1], [6, 1], [7, 2, 2]])), 3, NOW);
  expect(trend.map(week => week.answers)).toEqual([0, 4, 5]);
  expect(trend[0].accuracy).toBeNull();
  expect(trend[0].averageSeconds).toBeNull();
  expect(trend[1].accuracy).toBe(50);
  expect(trend[2].accuracy).toBe(80);
  expect(trend[2].averageSeconds).toBe(2);
});

test('weekly entries are not practice days, and a remembered best streak is kept', () => {
  const stats = { あ: { dailyPerformance: [
    { date: day(120), rightGuesses: 30, week: true },
    { date: day(0), rightGuesses: 1 },
  ] } };
  const totals = getDailyTotals(stats);
  expect(Object.keys(totals)).toEqual([String(day(0))]);
  expect(getStreaks(totals, NOW, 12)).toEqual({ current: 1, best: 12 });
});
