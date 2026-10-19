import { addExtraNewKanji, getKanjiSrsStage, getKanjiSrsSummary, getNewKanjiStartedToday, getSrsSession, NEW_KANJI_PER_DAY, nextSrsState, previewSrsIntervals, recordKanjiSrsAnswer } from './kanjiSrs.js';
import { kanaCharacters } from './kanaCharacters.js';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const NOW = new Date(2026, 9, 8, 12).getTime();

beforeEach(() => localStorage.clear());

const kanji = ['一', '二', '三', '四', '五'].map(jp_character => ({ jp_character }));

test('stages follow the review history', () => {
  expect(getKanjiSrsStage(undefined)).toBe('new');
  expect(getKanjiSrsStage({ repetitions: 0, intervalDays: 0, dueAt: NOW })).toBe('learning');
  expect(getKanjiSrsStage({ repetitions: 2, intervalDays: 3, dueAt: NOW })).toBe('learning');
  expect(getKanjiSrsStage({ repetitions: 3, intervalDays: 7, dueAt: NOW })).toBe('young');
  expect(getKanjiSrsStage({ repetitions: 5, intervalDays: 30, dueAt: NOW })).toBe('mature');
});

test('summary counts stages, kanji due now and the coming days', () => {
  // 一: missed, due again in 10 minutes (later today)
  recordKanjiSrsAnswer('一', false, NOW);
  // 二: right once yesterday, due now
  recordKanjiSrsAnswer('二', true, NOW - DAY - MINUTE);
  // 三: right twice, due in 3 days
  recordKanjiSrsAnswer('三', true, NOW - 2 * DAY);
  recordKanjiSrsAnswer('三', true, NOW);
  // 四: due in 30 days, outside the forecast
  localStorage.setItem('kanji-srs-progress', JSON.stringify({
    ...JSON.parse(localStorage.getItem('kanji-srs-progress')),
    四: { repetitions: 6, intervalDays: 30, lapses: 0, dueAt: NOW + 30 * DAY },
  }));

  expect(getKanjiSrsSummary(kanji, NOW)).toEqual({
    stages: { new: 1, learning: 3, young: 0, mature: 1 },
    dueNow: 1,
    forecast: [1, 0, 0, 1, 0, 0, 0],
    total: 5,
  });
});

describe('scheduling with four grades', () => {
  const noFuzz = () => 0.5;
  const after = (grades, start = {}) => grades.reduce((state, grade) => nextSrsState(state, grade, NOW, noFuzz), start);

  test('good: 1 day, then 3, then growing with the ease', () => {
    expect(after(['good']).intervalDays).toBe(1);
    expect(after(['good', 'good']).intervalDays).toBe(3);
    expect(after(['good', 'good', 'good']).intervalDays).toBe(Math.round(3 * 2.3));
  });

  test('easy goes further and raises the ease, hard stays shorter and lowers it', () => {
    const good = after(['good', 'good', 'good']);
    const easy = after(['good', 'good', 'easy']);
    const hard = after(['good', 'good', 'hard']);
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(hard.intervalDays).toBeLessThan(good.intervalDays);
    expect(easy.ease).toBeGreaterThan(good.ease);
    expect(hard.ease).toBeLessThan(good.ease);
    // A new kanji answered "easy" skips straight to 4 days
    expect(after(['easy']).intervalDays).toBe(4);
  });

  test('forgetting brings it back in 10 minutes but keeps part of its interval', () => {
    const learned = after(['good', 'good', 'good', 'good']);
    const forgot = nextSrsState(learned, 'again', NOW, noFuzz);
    expect(forgot.dueAt).toBe(NOW + 10 * MINUTE);
    expect(forgot.lapses).toBe(1);
    expect(forgot.intervalDays).toBe(Math.round(learned.intervalDays * 0.4));
    // Remembered again: back to that kept interval, not to 1 day
    expect(nextSrsState(forgot, 'good', NOW, noFuzz).intervalDays).toBe(forgot.intervalDays);
    // The ease never drops below 1.3
    expect(after(Array(20).fill('again')).ease).toBe(1.3);
  });

  test('true / false still mean good / again', () => {
    expect(nextSrsState({}, true, NOW, noFuzz).intervalDays).toBe(1);
    expect(nextSrsState({}, false, NOW, noFuzz).dueAt).toBe(NOW + 10 * MINUTE);
  });

  test('long intervals are spread a little, so kanji learned together come back on different days', () => {
    const state = after(['good', 'good', 'good', 'good']);
    const low = nextSrsState(state, 'good', NOW, () => 0).intervalDays;
    const high = nextSrsState(state, 'good', NOW, () => 0.999).intervalDays;
    expect(high).toBeGreaterThan(low);
  });

  test('the grade buttons preview when the kanji comes back', () => {
    const preview = previewSrsIntervals('四', NOW);
    expect(preview).toEqual({ again: 10 * MINUTE, hard: DAY, good: DAY, easy: 4 * DAY });
  });
});

describe('review sessions', () => {
  const group = Object.values(kanaCharacters.kanji)[0];
  const kanjiOfGroup = Object.values(group.characters).map(character => character.jp_character);

  test('new kanji are limited per day, due ones come first', () => {
    // Two kanji reviewed before and due now, the rest never reviewed
    recordKanjiSrsAnswer(kanjiOfGroup[5], 'good', NOW - 3 * DAY);
    recordKanjiSrsAnswer(kanjiOfGroup[2], 'good', NOW - 2 * DAY);
    const session = getSrsSession([group.title], NOW);
    expect(session.due.map(character => character.jp_character)).toEqual([kanjiOfGroup[5], kanjiOfGroup[2]]);
    // 10 new a day, minus the ones started today (none: those two were days ago)
    expect(session.fresh).toHaveLength(Math.min(NEW_KANJI_PER_DAY, kanjiOfGroup.length - 2));
    expect(session.total).toBe(session.due.length + session.fresh.length);
  });

  test('kanji started today count against the new kanji of the day', () => {
    kanjiOfGroup.slice(0, 4).forEach(character => recordKanjiSrsAnswer(character, 'good', NOW));
    expect(getNewKanjiStartedToday(NOW)).toBe(4);
    expect(getSrsSession([group.title], NOW).fresh).toHaveLength(NEW_KANJI_PER_DAY - 4);
  });
});

test('"learn more" lets today bring in more new kanji, until tomorrow', () => {
  const group = Object.values(kanaCharacters.kanji).find(item => Object.keys(item.characters).length >= 10);
  const others = Object.values(kanaCharacters.kanji).filter(item => item !== group);
  // Today's 10 new kanji learned elsewhere
  others.flatMap(item => Object.values(item.characters)).slice(0, NEW_KANJI_PER_DAY)
    .forEach(character => recordKanjiSrsAnswer(character.jp_character, 'good', NOW));
  expect(getSrsSession([group.title], NOW).fresh).toHaveLength(0);
  expect(getSrsSession([group.title], NOW).unlearned).toBe(Object.keys(group.characters).length);

  addExtraNewKanji(NOW);
  expect(getSrsSession([group.title], NOW).fresh).toHaveLength(NEW_KANJI_PER_DAY);
  // The next day the limit is back to normal
  expect(getSrsSession([group.title], NOW + DAY).fresh).toHaveLength(NEW_KANJI_PER_DAY);
});
