import { calculateMastery, getMasteryBreakdown, getRetention, getTimeLimitSeconds, getWeakestItems } from './mastery.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date(2026, 9, 8, 12).getTime();

function day(daysAgo) {
  const date = new Date(NOW - daysAgo * DAY);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function stats(dailyPerformance) {
  const sum = key => dailyPerformance.reduce((total, daily) => total + (daily[key] || 0), 0);
  return {
    totalRightGuesses: sum('rightGuesses'),
    totalWrongGuesses: sum('wrongGuesses'),
    totaltotalResponseTime: sum('responseTimeSum'),
    dailyPerformance,
  };
}

test('no answers means no mastery', () => {
  expect(calculateMastery(undefined, 'あ', NOW)).toBeNull();
  expect(calculateMastery({ totalRightGuesses: 0, totalWrongGuesses: 0 }, 'あ', NOW)).toBeNull();
});

test('only wrong answers gives a number, not NaN', () => {
  const mastery = calculateMastery(stats([{ date: day(0), wrongGuesses: 3 }]), 'あ', NOW);
  expect(Number.isNaN(mastery)).toBe(false);
  expect(mastery).toBeLessThan(40);
});

test('old stats without daily entries still work, also with only wrong answers', () => {
  expect(calculateMastery({ totalRightGuesses: 0, totalWrongGuesses: 2 }, 'あ', NOW)).not.toBeNaN();
  expect(calculateMastery({ totalRightGuesses: 20, totalWrongGuesses: 0, totaltotalResponseTime: 20000 }, 'あ', NOW))
    .toBeGreaterThanOrEqual(80);
});

test('recent good answers outweigh old mistakes', () => {
  const recovered = stats([
    { date: day(60), wrongGuesses: 20 },
    { date: day(0), rightGuesses: 10, responseTimeSum: 10000 },
  ]);
  const stillStruggling = stats([
    { date: day(60), rightGuesses: 10, responseTimeSum: 10000 },
    { date: day(0), wrongGuesses: 20 },
  ]);
  expect(calculateMastery(recovered, 'あ', NOW)).toBeGreaterThan(calculateMastery(stillStruggling, 'あ', NOW) + 30);
});

test('mastery drops when an item is not practiced for a while', () => {
  const answers = { rightGuesses: 20, responseTimeSum: 20000 };
  const today = calculateMastery(stats([{ date: day(0), ...answers }]), 'あ', NOW);
  const weekAgo = calculateMastery(stats([{ date: day(7), ...answers }]), 'あ', NOW);
  const monthsAgo = calculateMastery(stats([{ date: day(90), ...answers }]), 'あ', NOW);
  expect(weekAgo).toBe(today);
  expect(monthsAgo).toBe(Math.round(today * 0.5));
});

test('retention keeps at least half', () => {
  expect(getRetention(0)).toBe(1);
  expect(getRetention(37)).toBeCloseTo(0.7);
  expect(getRetention(365)).toBe(0.5);
});

test('longer words get more time', () => {
  expect(getTimeLimitSeconds('あ')).toBe(5);
  expect(getTimeLimitSeconds('ありがとう')).toBe(13);
  const slowAnswers = { date: day(0), rightGuesses: 10, responseTimeSum: 10 * 6000 };
  expect(calculateMastery(stats([slowAnswers]), 'ありがとう', NOW))
    .toBeGreaterThan(calculateMastery(stats([slowAnswers]), 'あ', NOW));
});

test('weakest items skip unpracticed and excellent ones, weakest first', () => {
  const good = stats([{ date: day(0), rightGuesses: 20, responseTimeSum: 20000 }]);
  const bad = stats([{ date: day(0), wrongGuesses: 5 }]);
  const okay = stats([{ date: day(0), rightGuesses: 3, wrongGuesses: 3, responseTimeSum: 9000 }]);
  const items = ['あ', 'い', 'う', 'え', 'い'].map(jp_character => ({ jp_character }));
  const weakest = getWeakestItems(items, { あ: good, い: bad, う: okay }, 10, NOW);
  expect(weakest.map(item => item.jp_character)).toEqual(['い', 'う']);
  expect(getWeakestItems(items, { い: bad, う: okay }, 1, NOW)).toHaveLength(1);
});

describe('what makes up the mastery', () => {
  // あ answered right 3 times out of 3 in 0.86s on average, 14 days ago:
  // 100% accuracy, but 83% mastery
  const answeredRightThreeTimes = stats([{ date: NOW - 14 * DAY, rightGuesses: 3, responseTimeSum: 3 * 860 }]);

  test('the breakdown gives the same mastery', () => {
    const breakdown = getMasteryBreakdown(answeredRightThreeTimes, 'あ', NOW);
    expect(breakdown.mastery).toBe(calculateMastery(answeredRightThreeTimes, 'あ', NOW));
    expect(breakdown.mastery).toBe(83);
  });

  test('says how many points each part costs', () => {
    const breakdown = getMasteryBreakdown(answeredRightThreeTimes, 'あ', NOW);
    const lost = Object.fromEntries(breakdown.parts.map(part => [part.key, part.lost]));
    expect(lost.accuracy).toBe(0);
    expect(lost.help).toBe(0);
    // 3 of 20 answers: 8.5 of the 10 experience points are missing
    expect(lost.experience).toBeCloseTo(8.5);
    // 0.86s of the 5s limit
    expect(lost.speed).toBeCloseTo(15 * 0.86 / 5);
    // 7 days past the grace week: 7% of the rest
    expect(breakdown.retention).toBeCloseTo(0.93);
    expect(breakdown.retentionLost).toBeCloseTo((100 - lost.experience - lost.speed) * 0.07);
    expect(breakdown.lifetimeAttempts).toBe(3);
    expect(breakdown.averageSeconds).toBeCloseTo(0.86);
  });

  test('the parts and the retention add up to the mastery', () => {
    const breakdown = getMasteryBreakdown(answeredRightThreeTimes, 'あ', NOW);
    const totalLost = breakdown.parts.reduce((sum, part) => sum + part.lost, 0) + breakdown.retentionLost;
    expect(Math.round(100 - totalLost)).toBe(breakdown.mastery);
  });
});
