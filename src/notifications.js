import { getStreaks } from './activityStats.js';

// Notifications in the navbar, made from the progress saved in this browser (there is no server).
// Each one has an id; ids that should come back later carry the day, week or month,
// so a dismissed reminder returns the next day instead of never.
const STORAGE_KEY = 'notifications';
// Seen / dismissed ids older than this are forgotten, their reminders have moved on to new ids
const FORGET_AFTER_DAYS = 90;
const DAY = 24 * 60 * 60 * 1000;

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];
// A pair mixed up at least this often is worth a reminder
const CONFUSION_MIN_COUNT = 3;
// How many kana / pairs a notification shows, its practice button still takes all of them
const WEAKEST_CHIPS = 5;
const CONFUSION_CHIPS = 3;
// Remind to save a backup once there is this much practice to lose, then every BACKUP_EVERY_DAYS
const BACKUP_MIN_PRACTICE_DAYS = 5;
const BACKUP_EVERY_DAYS = 30;

// Newest first. Add an entry here when shipping something users should know about
export const WHATS_NEW = [
  { id: '2026-10', key: 'notifyWhatsNew202610' },
];

function startOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function dayKey(timestamp) {
  const date = new Date(timestamp);
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function weekKey(timestamp) {
  const date = new Date(startOfDay(timestamp));
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dayKey(date.getTime());
}

// Every notification that applies right now, most useful first.
// { id, icon, titleKey?, key, params, chips?, action, actionKey? } where action is one of:
// 'srs' (start the kanji review), 'practice' (start a game with the selection),
// 'practice-characters' (with `characters`), 'backup' (save a backup file)
export function buildNotifications({
  now = Date.now(),
  dailyTotals = {},
  dueKanji = 0,
  confusionPairs = [],
  practicableKana = [],
  weakest = [],
  hasSelection = false,
  lastBackupAt = null,
  storedBestStreak = 0,
}) {
  const notifications = [];
  const today = dayKey(now);
  const practiceDays = Object.keys(dailyTotals).length;
  const practicedToday = Boolean(dailyTotals[startOfDay(now)]);
  const streak = getStreaks(dailyTotals, now, storedBestStreak).current;

  if (dueKanji > 0) {
    notifications.push({ id: `srs-${today}`, icon: 'bell', key: 'notifySrsDue', params: { count: dueKanji }, action: 'srs' });
  }

  if (streak > 0 && !practicedToday) {
    notifications.push({
      id: `streak-risk-${today}`,
      icon: 'flame',
      key: 'notifyStreakRisk',
      params: { days: streak },
      action: hasSelection ? 'practice' : null,
    });
  }

  // "Weakest in your selection", like the Learning Progress window: practiced kana under 80% mastery
  if (weakest.length > 0) {
    notifications.push({
      id: `weakest-${weekKey(now)}`,
      icon: 'alert-triangle',
      titleKey: 'statsWeakestTitle',
      key: 'notifyWeakest',
      params: { count: weakest.length },
      chips: weakest.slice(0, WEAKEST_CHIPS).map(item => ({ text: item.character, detail: `${item.mastery}%` })),
      action: 'practice-characters',
      actionKey: 'statsPracticeWeakest',
      characters: weakest.map(item => item.character),
    });
  }

  // "Often mixed up", like the Learning Progress window: the most frequent pairs, and a game with
  // those of their kana the current selection can show
  const frequentPairs = confusionPairs.filter(pair => pair.count >= CONFUSION_MIN_COUNT);
  if (frequentPairs.length > 0) {
    const available = new Set(practicableKana);
    const practicable = [...new Set(frequentPairs.flatMap(pair => pair.characters))]
      .filter(character => available.has(character));
    notifications.push({
      id: `confusions-${weekKey(now)}`,
      icon: 'arrow-left-right',
      titleKey: 'statsConfusionsTitle',
      key: 'notifyConfusions',
      params: { count: frequentPairs.length },
      chips: frequentPairs.slice(0, CONFUSION_CHIPS).map(pair => ({
        text: pair.characters.join(' ⇄ '),
        detail: `×${pair.count}`,
      })),
      action: practicable.length > 0 ? 'practice-characters' : null,
      actionKey: 'statsPracticeWeakest',
      characters: practicable,
    });
  }

  const backupIsOld = !lastBackupAt || now - lastBackupAt > BACKUP_EVERY_DAYS * DAY;
  if (practiceDays >= BACKUP_MIN_PRACTICE_DAYS && backupIsOld) {
    notifications.push({ id: `backup-${today.slice(0, 7)}`, icon: 'download', key: 'notifyBackup', params: {}, action: 'backup' });
  }

  if (practicedToday && STREAK_MILESTONES.includes(streak)) {
    notifications.push({ id: `streak-${streak}-${today}`, icon: 'trophy', key: 'notifyStreakMilestone', params: { days: streak }, action: null });
  }

  if (practiceDays === 0) {
    notifications.push({ id: 'welcome', icon: 'sparkles', key: 'notifyWelcome', params: {}, action: null });
  } else {
    for (const entry of WHATS_NEW) {
      notifications.push({ id: `whats-new-${entry.id}`, icon: 'sparkles', key: entry.key, params: {}, action: null });
    }
  }

  return notifications;
}

// { seen: { id: timestamp }, dismissed: { id: timestamp } }
export function readNotificationState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      seen: stored?.seen && typeof stored.seen === 'object' ? stored.seen : {},
      dismissed: stored?.dismissed && typeof stored.dismissed === 'object' ? stored.dismissed : {},
    };
  } catch (error) {
    return { seen: {}, dismissed: {} };
  }
}

function writeNotificationState(state, now) {
  const keepAfter = now - FORGET_AFTER_DAYS * DAY;
  const prune = ids => Object.fromEntries(Object.entries(ids).filter(([, time]) => time >= keepAfter));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ seen: prune(state.seen), dismissed: prune(state.dismissed) }));
}

export function visibleNotifications(notifications, state = readNotificationState()) {
  return notifications.filter(notification => !state.dismissed[notification.id]);
}

export function countUnseen(notifications, state = readNotificationState()) {
  return visibleNotifications(notifications, state).filter(notification => !state.seen[notification.id]).length;
}

export function markNotificationsSeen(notifications, now = Date.now()) {
  const state = readNotificationState();
  for (const notification of notifications) {
    state.seen[notification.id] = state.seen[notification.id] || now;
  }
  writeNotificationState(state, now);
}

export function dismissNotification(id, now = Date.now()) {
  const state = readNotificationState();
  state.dismissed[id] = now;
  writeNotificationState(state, now);
}
