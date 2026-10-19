// Everything the app keeps is in this browser's localStorage (there is no
// server). This module is the one place that reads and writes it safely:
// - reads never throw: a missing, corrupt or blocked value (private mode,
//   disabled storage) gives the fallback
// - writes never throw: a full storage (about 5 MB per site) is reported
//   with STORAGE_FULL_EVENT and the write returns false, the game goes on
// - the layout of the stored data has a version, upgraded once at startup by
//   the MIGRATIONS below

// The keys holding the user's progress and selection (the menu settings are
// the game-mode-* keys, see practiceOptions.js and GameModeSelector.js)
export const USER_STATS_KEY = 'userStats';
export const SELECTED_GROUPS_KEY = 'checkedKanas';
export const STORAGE_VERSION_KEY = 'storageVersion';

export const STORAGE_FULL_EVENT = 'learn-kana:storage-full';
// What browsers give a site, about 5 MB; strings are counted in UTF-16 units
export const STORAGE_QUOTA = 5 * 1024 * 1024;

export function readString(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

export function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function isQuotaError(error) {
  return error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22);
}

// Strings are stored as they are, everything else as JSON
export function write(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      console.warn(`localStorage is full, "${key}" was not saved.`);
      try {
        window.dispatchEvent(new CustomEvent(STORAGE_FULL_EVENT, { detail: { key } }));
      } catch (eventError) { }
    }
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) { }
}

// Per-character practice stats, keyed by the shown jp_character
export function readUserStats() {
  const stats = readJson(USER_STATS_KEY, {});
  return stats && typeof stats === 'object' && !Array.isArray(stats) ? stats : {};
}

export function writeUserStats(stats) {
  return write(USER_STATS_KEY, stats);
}

// Titles of the kana / kanji groups selected in the menu
export function readSelectedGroups() {
  const groups = readJson(SELECTED_GROUPS_KEY, []);
  return Array.isArray(groups) ? groups : [];
}

export function writeSelectedGroups(groups) {
  return write(SELECTED_GROUPS_KEY, [...groups]);
}

// How much of the storage is used, in bytes, and the biggest keys first
export function getStorageUsage() {
  const byKey = [];
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      const value = localStorage.getItem(key) || '';
      byKey.push({ key, bytes: (key.length + value.length) * 2 });
    }
  } catch (error) { }
  byKey.sort((a, b) => b.bytes - a.bytes);
  const bytes = byKey.reduce((total, entry) => total + entry.bytes, 0);
  return { bytes, ratio: bytes / STORAGE_QUOTA, byKey };
}

// Upgrades of the stored data, in order: MIGRATIONS[n] takes the data from
// version n to n + 1. Add a function at the end when the layout of a key
// changes; never edit or remove one that has shipped.
export const MIGRATIONS = [
  // 0 → 1: the version is recorded; values that do not parse are dropped so
  // every later read starts from a clean value
  () => {
    if (readString(USER_STATS_KEY) !== null && readJson(USER_STATS_KEY, null) === null) remove(USER_STATS_KEY);
    if (readString(SELECTED_GROUPS_KEY) !== null && !Array.isArray(readJson(SELECTED_GROUPS_KEY, null))) remove(SELECTED_GROUPS_KEY);
  },
];

export const STORAGE_VERSION = MIGRATIONS.length;

// Runs the migrations the stored data has not had yet. A failing migration
// stops there, so it is tried again on the next start
export function runStorageMigrations(migrations = MIGRATIONS) {
  let version = Number(readString(STORAGE_VERSION_KEY, '0')) || 0;
  while (version < migrations.length) {
    try {
      migrations[version]();
    } catch (error) {
      console.warn(`Storage migration ${version} → ${version + 1} failed.`, error);
      return version;
    }
    version++;
    write(STORAGE_VERSION_KEY, String(version));
  }
  return version;
}
