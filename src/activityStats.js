// Practice history summed over every character, from the dailyPerformance entries in userStats

function startOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Midnight `days` days after `dayStart` (negative goes back), safe across daylight saving changes
export function addDays(dayStart, days) {
  const date = new Date(dayStart);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

// { midnightTimestamp: { right, wrong, responseTimeSum } } over all characters
export function getDailyTotals(userStats) {
  const totals = {};
  for (const stats of Object.values(userStats || {})) {
    for (const daily of stats?.dailyPerformance || []) {
      // Old days merged into weeks (statsStorage.js) say nothing about single days
      if (daily.week) continue;
      const day = startOfDay(daily.date);
      const total = totals[day] || (totals[day] = { right: 0, wrong: 0, responseTimeSum: 0 });
      total.right += daily.rightGuesses || 0;
      total.wrong += daily.wrongGuesses || 0;
      total.responseTimeSum += daily.responseTimeSum || 0;
    }
  }
  // Days where something was only shown or edited are not practice days
  for (const day of Object.keys(totals)) {
    if (totals[day].right + totals[day].wrong === 0) delete totals[day];
  }
  return totals;
}

// Current streak counts up to today, or up to yesterday while today has no practice yet.
// storedBest is the best streak remembered from days that were merged into weeks since
export function getStreaks(dailyTotals, now = Date.now(), storedBest = 0) {
  const days = Object.keys(dailyTotals).map(Number).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let previous = null;
  for (const day of days) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  const today = startOfDay(now);
  let day = dailyTotals[today] ? today : addDays(today, -1);
  let current = 0;
  while (dailyTotals[day]) {
    current++;
    day = addDays(day, -1);
  }
  return { current, best: Math.max(best, current, storedBest) };
}

// Days for the calendar: `weeks` columns of Monday-Sunday, the last one holding today.
// Days after today are left out (null)
export function getCalendarWeeks(dailyTotals, weeks = 12, now = Date.now()) {
  const today = startOfDay(now);
  const daysSinceMonday = (new Date(today).getDay() + 6) % 7;
  const firstMonday = addDays(today, -daysSinceMonday - (weeks - 1) * 7);

  const columns = [];
  for (let week = 0; week < weeks; week++) {
    const column = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const day = addDays(firstMonday, week * 7 + weekday);
      if (day > today) {
        column.push(null);
      } else {
        const total = dailyTotals[day];
        column.push({ date: day, answers: total ? total.right + total.wrong : 0, right: total?.right || 0 });
      }
    }
    columns.push(column);
  }
  return columns;
}

// Accuracy (%) and average time of a correct answer (seconds) for each of the last `weeks`
// 7-day windows, oldest first and the last one ending today. Weeks without answers are null
export function getWeeklyTrend(dailyTotals, weeks = 12, now = Date.now()) {
  const today = startOfDay(now);
  const trend = [];
  for (let week = weeks - 1; week >= 0; week--) {
    const end = addDays(today, -week * 7);
    const start = addDays(end, -6);
    let right = 0;
    let wrong = 0;
    let responseTimeSum = 0;
    for (let day = start; day <= end; day = addDays(day, 1)) {
      const total = dailyTotals[day];
      if (!total) continue;
      right += total.right;
      wrong += total.wrong;
      responseTimeSum += total.responseTimeSum;
    }
    trend.push({
      start,
      end,
      answers: right + wrong,
      accuracy: right + wrong > 0 ? Math.round(right / (right + wrong) * 100) : null,
      averageSeconds: right > 0 ? Math.round(responseTimeSum / right / 100) / 10 : null,
    });
  }
  return trend;
}
