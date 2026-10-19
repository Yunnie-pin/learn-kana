import {
  getStorageUsage, MIGRATIONS, readJson, readSelectedGroups, readUserStats, runStorageMigrations,
  STORAGE_FULL_EVENT, STORAGE_VERSION, STORAGE_VERSION_KEY, write, writeUserStats,
} from './storage.js';
import { buildNotifications } from './notifications.js';
import { createBackup, readBackup, restoreBackup } from './statsStorage.js';

beforeEach(() => localStorage.clear());

test('reads give the fallback for missing or corrupt values', () => {
  expect(readUserStats()).toEqual({});
  localStorage.setItem('userStats', '{not json');
  expect(readUserStats()).toEqual({});
  localStorage.setItem('checkedKanas', '"あ"');
  expect(readSelectedGroups()).toEqual([]);
  expect(readJson('missing', 7)).toBe(7);
});

test('writes store JSON, strings as they are', () => {
  writeUserStats({ あ: { totalTimesShown: 1 } });
  expect(readUserStats()).toEqual({ あ: { totalTimesShown: 1 } });
  write('theme', 'dark');
  expect(localStorage.getItem('theme')).toBe('dark');
});

test('a full storage does not throw: the write fails and the app is told', () => {
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('full', 'QuotaExceededError');
  });
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
  const onFull = vi.fn();
  window.addEventListener(STORAGE_FULL_EVENT, onFull);
  try {
    expect(writeUserStats({ あ: {} })).toBe(false);
    expect(onFull).toHaveBeenCalledTimes(1);
    expect(onFull.mock.calls[0][0].detail).toEqual({ key: 'userStats' });
  } finally {
    window.removeEventListener(STORAGE_FULL_EVENT, onFull);
    setItem.mockRestore();
    warn.mockRestore();
  }
});

test('the usage counts every key, the biggest first', () => {
  localStorage.setItem('small', 'a');
  localStorage.setItem('userStats', 'x'.repeat(100));
  const usage = getStorageUsage();
  expect(usage.byKey[0].key).toBe('userStats');
  expect(usage.bytes).toBe((5 + 1 + 9 + 100) * 2);
  expect(usage.ratio).toBeGreaterThan(0);
});

describe('migrations', () => {
  test('run once, in order, and record the version', () => {
    const calls = [];
    const migrations = [() => calls.push(0), () => calls.push(1)];
    expect(runStorageMigrations(migrations)).toBe(2);
    expect(runStorageMigrations(migrations)).toBe(2);
    expect(calls).toEqual([0, 1]);
    expect(localStorage.getItem(STORAGE_VERSION_KEY)).toBe('2');
  });

  test('a failing migration stops there and is tried again next time', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    let fail = true;
    const later = vi.fn();
    const migrations = [() => { if (fail) throw new Error('boom'); }, later];
    expect(runStorageMigrations(migrations)).toBe(0);
    expect(later).not.toHaveBeenCalled();
    fail = false;
    expect(runStorageMigrations(migrations)).toBe(2);
    expect(later).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('the first one drops values that do not parse and keeps good ones', () => {
    localStorage.setItem('userStats', '{broken');
    localStorage.setItem('checkedKanas', '["あ"]');
    runStorageMigrations();
    expect(localStorage.getItem('userStats')).toBeNull();
    expect(localStorage.getItem('checkedKanas')).toBe('["あ"]');
    expect(Number(localStorage.getItem(STORAGE_VERSION_KEY))).toBe(STORAGE_VERSION);
    expect(STORAGE_VERSION).toBe(MIGRATIONS.length);
  });

  test('a restored backup from before the versions is brought up to date', () => {
    localStorage.setItem('checkedKanas', '"not a list"');
    const data = readBackup(createBackup());
    expect(data[STORAGE_VERSION_KEY]).toBeUndefined();
    localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
    restoreBackup(data);
    expect(localStorage.getItem('checkedKanas')).toBeNull();
    expect(Number(localStorage.getItem(STORAGE_VERSION_KEY))).toBe(STORAGE_VERSION);
  });
});

test('the navbar warns when the storage is almost full, or a save failed', () => {
  const ids = options => buildNotifications(options).filter(item => item.id.startsWith('storage-full'));
  expect(ids({ storageRatio: 0.5 })).toHaveLength(0);
  expect(ids({ storageRatio: 0.85 })[0]).toMatchObject({ key: 'notifyStorageAlmostFull', params: { percent: 85 }, action: 'backup' });
  expect(ids({ storageRatio: 0.2, storageFull: true })[0]).toMatchObject({ key: 'notifyStorageFull' });
});
