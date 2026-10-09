import { getDailyTotals, getStreaks } from './activityStats.js';

const DAY = 24 * 60 * 60 * 1000;
// Daily entries older than this are merged into one entry per week
const KEEP_DAILY_DAYS = 90;
const LAST_COMPACTION_KEY = 'statsLastCompaction';
export const BEST_PRACTICE_STREAK_KEY = 'bestPracticeStreak';

// Midnight of the Monday that starts the week of `timestamp`
function getWeekStart(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return date.getTime();
}

// Merges dailyPerformance entries older than `keepDays` into weekly entries ({ week: true }),
// adding up every count. Returns whether anything changed
export function compactDailyPerformance(userStats, now = Date.now(), keepDays = KEEP_DAILY_DAYS) {
  const cutoff = new Date(now - keepDays * DAY);
  cutoff.setHours(0, 0, 0, 0);
  // Only whole weeks before the cutoff, so a week is never part daily and part weekly
  const weeklyBefore = getWeekStart(cutoff.getTime());
  let changed = false;

  for (const stats of Object.values(userStats || {})) {
    const daily = stats?.dailyPerformance;
    if (!Array.isArray(daily)) continue;
    if (!daily.some(entry => entry.date < weeklyBefore && !entry.week)) continue;

    const weeks = {};
    const kept = [];
    for (const entry of daily) {
      if (entry.date >= weeklyBefore) {
        kept.push(entry);
        continue;
      }
      const weekStart = getWeekStart(entry.date);
      const week = weeks[weekStart] || (weeks[weekStart] = { date: weekStart, week: true });
      for (const [key, value] of Object.entries(entry)) {
        if (key !== 'date' && typeof value === 'number') {
          week[key] = (week[key] || 0) + value;
        }
      }
    }
    stats.dailyPerformance = [
      ...Object.values(weeks).sort((a, b) => a.date - b.date),
      ...kept,
    ];
    changed = true;
  }
  return changed;
}

// Once a day: remember the best practice streak while every day is still known,
// then merge old daily entries so userStats stays small in localStorage
export function runStatsMaintenance(now = Date.now()) {
  const today = new Date(now).setHours(0, 0, 0, 0);
  if (Number(localStorage.getItem(LAST_COMPACTION_KEY)) === today) return;

  let userStats;
  try {
    userStats = JSON.parse(localStorage.getItem('userStats')) || {};
  } catch (error) {
    return;
  }

  const storedBest = Number(localStorage.getItem(BEST_PRACTICE_STREAK_KEY)) || 0;
  const { best } = getStreaks(getDailyTotals(userStats), now, storedBest);
  localStorage.setItem(BEST_PRACTICE_STREAK_KEY, String(best));

  if (compactDailyPerformance(userStats, now)) {
    localStorage.setItem('userStats', JSON.stringify(userStats));
  }
  localStorage.setItem(LAST_COMPACTION_KEY, String(today));
}

/*
############################
Backup: export and import
############################
*/
// Learning progress, and the menu settings that go with it. Session-only keys are left out
const BACKUP_KEYS = [
  'userStats',
  'kanji-srs-progress',
  'kanaConfusions',
  'bestStreakRecord',
  BEST_PRACTICE_STREAK_KEY,
  'checkedKanas',
  'gameMode',
  'game-mode-practice',
  'game-mode-word',
  'game-mode-touch',
  'game-mode-hints',
  'game-mode-auto-next',
  'game-mode-random-fonts',
  'game-mode-kanji-readings',
  'game-mode-kanji-onyomi',
  'game-mode-kanji-kunyomi',
  'language',
  'theme',
];

export function createBackup(now = Date.now()) {
  const data = {};
  for (const key of BACKUP_KEYS) {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }
  return { app: 'learn-kana', version: 1, exportedAt: new Date(now).toISOString(), data };
}

// Checks a parsed backup file; returns its data, or null when it is not a backup of this app
export function readBackup(backup) {
  if (!backup || backup.app !== 'learn-kana' || backup.version !== 1) return null;
  if (!backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) return null;
  const data = {};
  for (const key of BACKUP_KEYS) {
    if (typeof backup.data[key] === 'string') data[key] = backup.data[key];
  }
  if (data.userStats !== undefined) {
    try {
      const stats = JSON.parse(data.userStats);
      if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return null;
    } catch (error) {
      return null;
    }
  }
  return data;
}

// Replaces this browser's progress and settings with the backup's
export function restoreBackup(data) {
  for (const key of BACKUP_KEYS) {
    if (key in data) {
      localStorage.setItem(key, data[key]);
    } else {
      localStorage.removeItem(key);
    }
  }
  // The restored stats get checked and compacted again on the next start
  localStorage.removeItem(LAST_COMPACTION_KEY);
}

// When the last backup file was saved, so the navbar can remind about it (not part of the backup)
export const LAST_BACKUP_KEY = 'lastBackupAt';

// Saves the backup as a .json file through the browser's download
export function downloadBackup(now = Date.now()) {
  const backup = createBackup(now);
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `learn-kana-progress-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  localStorage.setItem(LAST_BACKUP_KEY, String(now));
}
