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
