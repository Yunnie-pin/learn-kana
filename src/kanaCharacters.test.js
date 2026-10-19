import { kanaCharacters, kanjiLevels, KANJI_PER_GROUP } from './kanaCharacters.js';
import { kanjiReadings } from './kanjiReadings.js';
import { validateKanaData } from './data/validateKanaData.js';

test('the kana and kanji data has no problems', () => {
  expect(validateKanaData()).toEqual([]);
});

test('a kanji without readings is reported', () => {
  const saved = kanjiReadings['水'];
  delete kanjiReadings['水'];
  try {
    expect(validateKanaData()).toContainEqual(expect.stringContaining('水: no readings in kanjiReadings.js'));
  } finally {
    kanjiReadings['水'] = saved;
  }
});

test('every theme of every level is split into groups of at most KANJI_PER_GROUP', () => {
  for (const { level, categories } of kanjiLevels) {
    const groups = Object.values(kanaCharacters.kanji).filter(group => group.level === level);
    const kanjiCount = categories.reduce((count, category) => count + category.kanji.length, 0);
    expect(groups.reduce((count, group) => count + Object.keys(group.characters).length, 0)).toBe(kanjiCount);
    expect(groups.length).toBe(categories.reduce((count, category) => count + Math.ceil(category.kanji.length / KANJI_PER_GROUP), 0));
  }
});
