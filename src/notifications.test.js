import {
  buildNotifications,
  countUnseen,
  dismissNotification,
  markNotificationsSeen,
  readNotificationState,
  visibleNotifications,
} from './notifications.js';

beforeEach(() => localStorage.clear());

const DAY = 24 * 60 * 60 * 1000;
// Noon, so the days before it are whole local days
const now = new Date(2026, 9, 9, 12).getTime();
const dayStart = daysAgo => {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.getTime();
};
const practiced = (...daysAgo) =>
  Object.fromEntries(daysAgo.map(days => [dayStart(days), { right: 5, wrong: 1, responseTimeSum: 10 }]));
const ids = notifications => notifications.map(notification => notification.id.replace(/-\d{4}-\d{2}(-\d{2})?$/, ''));

test('a first visit only says welcome', () => {
  expect(ids(buildNotifications({ now }))).toEqual(['welcome']);
});

test('due kanji ask for a review', () => {
  const [srs] = buildNotifications({ now, dueKanji: 4, dailyTotals: practiced(0) });
  expect(srs).toMatchObject({ icon: 'bell', key: 'notifySrsDue', params: { count: 4 }, action: 'srs' });
});

test('a streak without practice today is at risk, with practice it is not', () => {
  const atRisk = buildNotifications({ now, dailyTotals: practiced(1, 2), hasSelection: true });
  expect(atRisk[0]).toMatchObject({ key: 'notifyStreakRisk', params: { days: 2 }, action: 'practice' });

  const safe = buildNotifications({ now, dailyTotals: practiced(0, 1, 2) });
  expect(ids(safe)).not.toContain('streak-risk');
});

test('without a selection the streak reminder has no practice button', () => {
  const [risk] = buildNotifications({ now, dailyTotals: practiced(1) });
  expect(risk.action).toBeNull();
});

test('reaching a streak milestone today is celebrated', () => {
  const notifications = buildNotifications({ now, dailyTotals: practiced(0, 1, 2) });
  expect(notifications.find(item => item.key === 'notifyStreakMilestone')).toMatchObject({ params: { days: 3 } });
  expect(buildNotifications({ now, dailyTotals: practiced(0, 1) }).some(item => item.key === 'notifyStreakMilestone')).toBe(false);
});

test('a frequent mix-up of practicable kana suggests practicing the pair', () => {
  const confusionPairs = [{ characters: ['シ', 'ツ'], count: 4, last: now }];
  const notification = buildNotifications({ now, dailyTotals: practiced(0), confusionPairs, practicableKana: ['シ', 'ツ'] })
    .find(item => item.key === 'notifyConfusion');
  expect(notification).toMatchObject({ action: 'practice-characters', characters: ['シ', 'ツ'], params: { count: 4 } });

  expect(buildNotifications({ now, dailyTotals: practiced(0), confusionPairs, practicableKana: ['シ'] })
    .some(item => item.key === 'notifyConfusion')).toBe(false);
  expect(buildNotifications({ now, dailyTotals: practiced(0), confusionPairs: [{ ...confusionPairs[0], count: 2 }], practicableKana: ['シ', 'ツ'] })
    .some(item => item.key === 'notifyConfusion')).toBe(false);
});

test('a backup is suggested after enough practice and again a month after the last one', () => {
  const dailyTotals = practiced(0, 1, 2, 3, 4);
  const hasBackupReminder = lastBackupAt => buildNotifications({ now, dailyTotals, lastBackupAt })
    .some(item => item.key === 'notifyBackup');
  expect(hasBackupReminder(null)).toBe(true);
  expect(hasBackupReminder(now - 5 * DAY)).toBe(false);
  expect(hasBackupReminder(now - 31 * DAY)).toBe(true);
  expect(buildNotifications({ now, dailyTotals: practiced(0, 1) }).some(item => item.key === 'notifyBackup')).toBe(false);
});

test('seen notifications leave the badge, dismissed ones leave the list', () => {
  const notifications = buildNotifications({ now, dueKanji: 2, dailyTotals: practiced(1), hasSelection: true });
  expect(countUnseen(notifications)).toBe(notifications.length);

  markNotificationsSeen(notifications, now);
  expect(countUnseen(notifications)).toBe(0);
  expect(visibleNotifications(notifications)).toHaveLength(notifications.length);

  dismissNotification(notifications[0].id, now);
  expect(visibleNotifications(notifications).map(item => item.id)).not.toContain(notifications[0].id);
});

test('a dismissed daily reminder comes back the next day', () => {
  const today = buildNotifications({ now, dueKanji: 1, dailyTotals: practiced(0) })[0];
  dismissNotification(today.id, now);
  const tomorrow = buildNotifications({ now: now + DAY, dueKanji: 1, dailyTotals: practiced(1) })[0];
  expect(tomorrow.key).toBe('notifySrsDue');
  expect(visibleNotifications([tomorrow])).toHaveLength(1);
});

test('old seen and dismissed ids are forgotten', () => {
  dismissNotification('old', now - 100 * DAY);
  markNotificationsSeen([{ id: 'recent' }], now);
  const state = readNotificationState();
  expect(state.dismissed.old).toBeUndefined();
  expect(state.seen.recent).toBe(now);
});
