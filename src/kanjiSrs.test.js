import { getKanjiSrsStage, getKanjiSrsSummary, recordKanjiSrsAnswer } from './kanjiSrs.js';

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
