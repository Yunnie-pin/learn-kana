import { kanaCharacters } from './kanaCharacters.js';
import { readSelectedGroups, write } from './storage.js';

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
  return readSelectedGroups().filter(group => typeof group === 'string');
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

// ---------- Scheduling ----------
// Four grades, like most SRS apps: "again" (forgot), "hard", "good", "easy".
// Each kanji keeps an ease (how fast its interval grows): easy answers raise
// it, hard and forgotten ones lower it. A forgotten kanji comes back in 10
// minutes and keeps part of its interval, instead of starting over.
export const SRS_GRADES = ['again', 'hard', 'good', 'easy'];
const DEFAULT_EASE = 2.3;
const MIN_EASE = 1.3;
const MAX_INTERVAL_DAYS = 365;
// Share of the interval a forgotten kanji keeps
const LAPSE_KEEP = 0.4;
const RELEARN_MINUTES = 10;

// The answer as a grade (true / false from the typing questions: good / again)
function toGrade(answer) {
  if (answer === true) return 'good';
  if (answer === false) return 'again';
  return SRS_GRADES.includes(answer) ? answer : 'good';
}

// Spreads intervals of a week or more by up to ±10% so kanji learned together
// don't all come back on the same day (shorter ones stay exact: a day more
// on 3 days would be a third more)
function fuzz(days, random) {
  if (days < 7) return days;
  const spread = Math.max(1, Math.round(days * 0.1));
  return days + Math.round((random() * 2 - 1) * spread);
}

// The next state of a kanji's progress after an answer
export function nextSrsState(previous = {}, answer, now = Date.now(), random = Math.random) {
  const grade = toGrade(answer);
  const repetitions = Number(previous.repetitions) || 0;
  const intervalDays = Number(previous.intervalDays) || 0;
  const lapses = Number(previous.lapses) || 0;
  const ease = Number(previous.ease) || DEFAULT_EASE;
  const firstReviewedAt = Number(previous.firstReviewedAt) || now;

  if (grade === 'again') {
    return {
      repetitions: 0,
      // Kept for when it is remembered again (a new kanji has none)
      intervalDays: intervalDays > 0 ? Math.max(1, Math.round(intervalDays * LAPSE_KEEP)) : 0,
      lapses: lapses + 1,
      ease: Math.max(MIN_EASE, ease - 0.2),
      dueAt: now + RELEARN_MINUTES * MINUTE,
      firstReviewedAt,
    };
  }

  let nextInterval;
  let nextEase = ease;
  if (grade === 'hard') {
    nextEase = Math.max(MIN_EASE, ease - 0.15);
    nextInterval = Math.max(1, Math.round(Math.max(intervalDays, 1) * 1.2));
  } else if (grade === 'easy') {
    nextEase = ease + 0.15;
    nextInterval = repetitions === 0 && intervalDays === 0
      ? 4
      : Math.round(Math.max(intervalDays, 1) * ease * 1.3);
  } else if (repetitions === 0) {
    // First time remembered, or remembered again after forgetting
    nextInterval = Math.max(1, intervalDays);
  } else if (repetitions === 1) {
    nextInterval = Math.max(3, intervalDays);
  } else {
    nextInterval = Math.round(intervalDays * ease);
  }
  nextInterval = Math.min(MAX_INTERVAL_DAYS, Math.max(1, fuzz(nextInterval, random)));

  return {
    repetitions: repetitions + 1,
    intervalDays: nextInterval,
    lapses,
    ease: Math.round(nextEase * 100) / 100,
    dueAt: now + nextInterval * DAY,
    firstReviewedAt,
  };
}

// When the kanji would come back with each grade, for the grade buttons:
// { again: ms, hard: ms, good: ms, easy: ms } from now (without the fuzz)
export function previewSrsIntervals(character, now = Date.now()) {
  const previous = readProgress()[character] || {};
  return Object.fromEntries(SRS_GRADES.map(grade => [
    grade,
    nextSrsState(previous, grade, now, () => 0.5).dueAt - now,
  ]));
}

export function recordKanjiSrsAnswer(character, answer, now = Date.now(), random = Math.random) {
  const progress = readProgress();
  progress[character] = nextSrsState(progress[character], answer, now, random);
  write(STORAGE_KEY, progress);
}

// ---------- Review sessions ----------
// New kanji (never reviewed) a day can bring in, so a big selection doesn't
// turn into a 300-card session
export const NEW_KANJI_PER_DAY = 10;

function startOfDay(now) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// How many kanji were reviewed for the first time today
export function getNewKanjiStartedToday(now = Date.now()) {
  const since = startOfDay(now);
  return Object.values(readProgress())
    .filter(entry => Number(entry?.firstReviewedAt) >= since).length;
}

// More new kanji asked for today on top of NEW_KANJI_PER_DAY ("learn 10
// more" once today's ones are done): { day, count }, reset the next day
const EXTRA_NEW_KEY = 'kanji-srs-extra-new';

function getExtraNewToday(now = Date.now()) {
  try {
    const stored = JSON.parse(localStorage.getItem(EXTRA_NEW_KEY));
    return stored && stored.day === startOfDay(now) ? Number(stored.count) || 0 : 0;
  } catch (error) {
    return 0;
  }
}

// Lets today's review bring in NEW_KANJI_PER_DAY more new kanji
export function addExtraNewKanji(now = Date.now()) {
  write(EXTRA_NEW_KEY, {
    day: startOfDay(now),
    count: getExtraNewToday(now) + NEW_KANJI_PER_DAY,
  });
}

// What a review session of the selected groups holds: the kanji due again
// (most overdue first) and the new kanji left for today, in the order of the
// groups. { due, fresh, total, unlearned }: unlearned counts every new kanji
// of the selection, also the ones past today's limit
export function getSrsSession(selectedGroups, now = Date.now()) {
  const progress = readProgress();
  const selected = new Set(selectedGroups);
  const kanji = getAllKanjiCharacters().filter(character => selected.has(character.groupTitle));
  const due = kanji
    .filter(character => {
      const dueAt = Number(progress[character.jp_character]?.dueAt);
      return Number.isFinite(dueAt) && dueAt <= now;
    })
    .sort((a, b) => progress[a.jp_character].dueAt - progress[b.jp_character].dueAt);
  const unlearned = kanji.filter(character => !Number.isFinite(Number(progress[character.jp_character]?.dueAt)));
  const newLeft = Math.max(0, NEW_KANJI_PER_DAY + getExtraNewToday(now) - getNewKanjiStartedToday(now));
  const fresh = unlearned.slice(0, newLeft);
  return { due, fresh, total: due.length + fresh.length, unlearned: unlearned.length };
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

// When the next review of the selected groups comes, for the end of a
// session: { at, count } (count: kanji due by the end of that day), or null
// when none of their kanji has been reviewed yet
export function getNextReview(selectedGroups, now = Date.now()) {
  const progress = readProgress();
  const selected = new Set(selectedGroups);
  const dueTimes = getAllKanjiCharacters()
    .filter(character => selected.has(character.groupTitle))
    .map(character => Number(progress[character.jp_character]?.dueAt))
    .filter(dueAt => Number.isFinite(dueAt) && dueAt > now);
  if (!dueTimes.length) return null;
  const at = Math.min(...dueTimes);
  const endOfThatDay = new Date(at);
  endOfThatDay.setHours(24, 0, 0, 0);
  return { at, count: dueTimes.filter(dueAt => dueAt < endOfThatDay.getTime()).length };
}
