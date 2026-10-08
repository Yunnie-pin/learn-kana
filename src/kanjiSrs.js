import { kanaCharacters } from './kanaCharacters.js';

const STORAGE_KEY = 'kanji-srs-progress';
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

let allKanjiCharacters;

export function getAllKanjiCharacters() {
  if (!allKanjiCharacters) {
    allKanjiCharacters = Object.values(kanaCharacters.kanji).flatMap(group =>
      Object.values(group.characters).map(character => ({
        ...character,
        groupTitle: group.title,
        level: group.level,
        type: 'kanji',
      }))
    );
  }
  return allKanjiCharacters;
}

export function getSelectedKanjiGroupTitles() {
  const stored = localStorage.getItem('checkedKanas');
  if (!stored) return [];

  try {
    const groups = JSON.parse(stored);
    return Array.isArray(groups) ? groups.filter(group => typeof group === 'string') : [];
  } catch (error) {
    console.warn('Ignoring invalid selected Kanji groups.', error);
    return [];
  }
}

export function getSrsKanjiCharacters(selectedGroups, now = Date.now()) {
  const selected = new Set(selectedGroups);
  const selectedKanji = getAllKanjiCharacters().filter(character =>
    selected.has(character.groupTitle)
  );
  return getKanjiSrsOverview(selectedKanji, now);
}

function readProgress() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};

  try {
    const progress = JSON.parse(stored);
    return progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
  } catch (error) {
    console.warn('Ignoring invalid Kanji SRS progress data.', error);
    return {};
  }
}

export function getKanjiSrsOverview(kanji = getAllKanjiCharacters(), now = Date.now()) {
  const progress = readProgress();
  const due = [];
  let nextDueAt = null;

  kanji.forEach(character => {
    const dueAt = Number(progress[character.jp_character]?.dueAt);
    if (!Number.isFinite(dueAt) || dueAt <= now) {
      due.push(character);
    } else if (nextDueAt === null || dueAt < nextDueAt) {
      nextDueAt = dueAt;
    } 
  });

  return { due, nextDueAt, total: kanji.length };
}

export function recordKanjiSrsAnswer(character, correct, now = Date.now()) {
  const progress = readProgress();
  const previous = progress[character] || {};
  const repetitions = Number(previous.repetitions) || 0;
  const intervalDays = Number(previous.intervalDays) || 0;
  const lapses = Number(previous.lapses) || 0;

  if (correct) {
    const nextRepetitions = repetitions + 1;
    const nextIntervalDays = nextRepetitions === 1
      ? 1
      : nextRepetitions === 2
        ? 3
        : Math.min(180, Math.max(4, Math.round(intervalDays * 2.2)));
    progress[character] = {
      repetitions: nextRepetitions,
      intervalDays: nextIntervalDays,
      lapses,
      dueAt: now + nextIntervalDays * DAY,
    };
  } else {
    progress[character] = {
      repetitions: 0,
      intervalDays: 0,
      lapses: lapses + 1,
      dueAt: now + 10 * MINUTE,
    };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Kanji from the selected groups that were practiced before and are due again.
// Unlike getSrsKanjiCharacters(...).due this leaves out kanji that were never practiced.
export function getDueReviewCount(selectedGroups, now = Date.now()) {
  const progress = readProgress();
  const selected = new Set(selectedGroups);
  return getAllKanjiCharacters().filter(character => {
    const dueAt = Number(progress[character.jp_character]?.dueAt);
    return selected.has(character.groupTitle) && Number.isFinite(dueAt) && dueAt <= now;
  }).length;
}

export function getKanjiSrsProgress() {
  return readProgress();
}

// "new" (never reviewed), "learning" (missed or fewer than 3 correct reviews in a row),
// "young" (next review within 3 weeks) or "mature"
export function getKanjiSrsStage(entry) {
  if (!entry || !Number.isFinite(Number(entry.dueAt))) return 'new';
  const repetitions = Number(entry.repetitions) || 0;
  const intervalDays = Number(entry.intervalDays) || 0;
  if (repetitions < 3) return 'learning';
  return intervalDays >= 21 ? 'mature' : 'young';
}

// Stage counts, kanji due now, and how many more come due on each of the next `days` days
export function getKanjiSrsSummary(kanji = getAllKanjiCharacters(), now = Date.now(), days = 7) {
  const progress = readProgress();
  const stages = { new: 0, learning: 0, young: 0, mature: 0 };
  const forecast = Array(days).fill(0);
  let dueNow = 0;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayStarts = Array.from({ length: days + 1 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() + index + 1);
    return date.getTime();
  });

  for (const character of kanji) {
    const entry = progress[character.jp_character];
    const stage = getKanjiSrsStage(entry);
    stages[stage]++;
    if (stage === 'new') continue;

    const dueAt = Number(entry.dueAt);
    if (dueAt <= now) {
      dueNow++;
      continue;
    }
    // Later today counts as day 0, tomorrow as day 1, ...
    const day = dayStarts.findIndex(dayEnd => dueAt < dayEnd);
    if (day !== -1 && day < days) forecast[day]++;
  }

  return { stages, dueNow, forecast, total: kanji.length };
}
