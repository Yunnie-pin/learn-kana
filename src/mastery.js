const DAY = 24 * 60 * 60 * 1000;

// A day of practice counts half as much every RECENCY_HALF_LIFE_DAYS days,
// so mastery follows how the user does now rather than their lifetime totals
const RECENCY_HALF_LIFE_DAYS = 14;
// After FORGET_GRACE_DAYS without practice, mastery drops by FORGET_RATE_PER_DAY
// per day, down to MIN_RETENTION of its value, so forgotten items come back up
const FORGET_GRACE_DAYS = 7;
const FORGET_RATE_PER_DAY = 0.01;
const MIN_RETENTION = 0.5;

// Seconds a correct answer may take before it scores 0 on speed:
// 5 seconds for one character and 2 more for each extra character of a word
export function getTimeLimitSeconds(character) {
  const length = Array.from(character || '').length;
  return 5 + 2 * Math.max(0, length - 1);
}

// Sums the daily entries, each weighted by how long ago it was
function getRecencyWeightedTotals(dailyPerformance, now) {
  const totals = {
    rightGuesses: 0,
    wrongGuesses: 0,
    wrongSubmissions: 0,
    editCount: 0,
    askForHelpCounter: 0,
    responseTimeSum: 0,
  };

  for (const daily of dailyPerformance) {
    const ageDays = Math.max(0, (now - daily.date) / DAY);
    const weight = Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
    for (const key of Object.keys(totals)) {
      totals[key] += (daily[key] || 0) * weight;
    }
  }
  return totals;
}

// Totals from before dailyPerformance existed, in the same shape
function getLifetimeTotals(stats) {
  return {
    rightGuesses: stats.totalRightGuesses || 0,
    wrongGuesses: stats.totalWrongGuesses || 0,
    wrongSubmissions: stats.totalWrongSubmissions || 0,
    editCount: stats.totalEditCount || 0,
    askForHelpCounter: stats.totalAskForHelpCounter || 0,
    responseTimeSum: stats.totaltotalResponseTime || 0,
  };
}

// Share of mastery kept after `daysSincePractice` days without practice (MIN_RETENTION-1)
export function getRetention(daysSincePractice) {
  const forgottenDays = Math.max(0, daysSincePractice - FORGET_GRACE_DAYS);
  return Math.max(MIN_RETENTION, 1 - forgottenDays * FORGET_RATE_PER_DAY);
}

// Mastery of one character or word from its userStats entry (0-100), or null without answers
export function calculateMastery(stats, character, now = Date.now()) {
  if (!stats) return null;

  const lifetimeAttempts = (stats.totalRightGuesses || 0) + (stats.totalWrongGuesses || 0);
  if (lifetimeAttempts === 0) return null;

  const dailyPerformance = (stats.dailyPerformance || []).filter(daily =>
    (daily.rightGuesses || 0) + (daily.wrongGuesses || 0) > 0
  );
  const hasDailyData = dailyPerformance.length > 0;
  const totals = hasDailyData
    ? getRecencyWeightedTotals(dailyPerformance, now)
    : getLifetimeTotals(stats);

  const attempts = totals.rightGuesses + totals.wrongGuesses;
  if (attempts === 0) return null;

  // Calculate accuracy (0-1)
  const accuracy = totals.rightGuesses / attempts;

  // Average response time of correct answers (lower is better); no correct answers scores 0
  const timeScore = totals.rightGuesses > 0
    ? Math.max(0, 1 - (totals.responseTimeSum / totals.rightGuesses / 1000) / getTimeLimitSeconds(character))
    : 0;

  // Calculate help factor (less help is better)
  const helpFactor = Math.max(0, 1 - (totals.askForHelpCounter / attempts));

  // Calculate edit efficiency (fewer edits per correct answer is better, cap at 5 edits)
  const avgEditsPerCorrect = totals.rightGuesses > 0 ? totals.editCount / totals.rightGuesses : 0;
  const editEfficiency = Math.max(0, 1 - (avgEditsPerCorrect / 5));

  // Calculate wrong submission penalty (fewer wrong submissions is better)
  const submissionAccuracy = Math.max(0, 1 - (totals.wrongSubmissions / attempts));

  // Experience counts every answer ever given (more practice is better, cap at 20 attempts)
  const experienceFactor = Math.min(lifetimeAttempts / 20, 1);

  // Weighted formula: accuracy (40%), time (15%), help (10%), edits (15%), submissions (10%), experience (10%)
  let mastery = (
    accuracy * 0.4 +
    timeScore * 0.15 +
    helpFactor * 0.1 +
    editEfficiency * 0.15 +
    submissionAccuracy * 0.1 +
    experienceFactor * 0.1
  ) * 100;

  if (hasDailyData) {
    const lastPracticed = Math.max(...dailyPerformance.map(daily => daily.date));
    mastery *= getRetention((now - lastPracticed) / DAY);
  }

  return Math.round(mastery);
}

// Practiced items below "Excellent" mastery, weakest first
export function getWeakestItems(items, userStats, count = 10, now = Date.now()) {
  const seen = new Set();
  const weakest = [];
  for (const item of items) {
    if (seen.has(item.jp_character)) continue;
    seen.add(item.jp_character);
    const mastery = calculateMastery(userStats[item.jp_character], item.jp_character, now);
    if (mastery !== null && mastery < 80) {
      weakest.push({ ...item, mastery });
    }
  }
  return weakest.sort((a, b) => a.mastery - b.mastery).slice(0, count);
}
