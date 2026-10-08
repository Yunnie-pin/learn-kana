import { chooseTouchOptions } from './touchAnswers.js';

const row = (characters, consonant) => Array.from(characters).map((character, i) => ({
  jp_character: character,
  romanji: [consonant + 'aiueo'[i]],
  vocal: 'aiueo'[i],
  type: 'kana',
}));

const pool = [
  ...row('あいうえお', ''),
  ...row('かきくけこ', 'k'),
  ...row('さしすせそ', 's'),
  ...row('たちつてと', 't'),
];
const find = character => pool.find(item => item.jp_character === character);

test('the right answer is always an option and no option repeats', () => {
  for (let i = 0; i < 50; i++) {
    const picked = pool[i % pool.length];
    const options = chooseTouchOptions(picked, pool);
    expect(options).toHaveLength(5);
    expect(options).toContain(picked.romanji[0]);
    expect(new Set(options).size).toBe(5);
  }
});

test('similar kana are offered, at most two of them', () => {
  const options = chooseTouchOptions(find('き'), pool, ['さ', 'ち', 'し']);
  expect(options).toEqual(expect.arrayContaining(['ki', 'sa', 'ti']));
  expect(options).not.toContain('si');
});

test('one kana per vowel keeps the a i u e o order', () => {
  const options = chooseTouchOptions(find('く'), pool, ['さ']);
  expect(options.map(option => option.slice(-1))).toEqual(['a', 'i', 'u', 'e', 'o']);
  expect(options[2]).toBe('ku');
});

test('similar kana outside the practiced characters are not offered', () => {
  const options = chooseTouchOptions(find('き'), pool, ['ぬ']);
  expect(options).toContain('ki');
  expect(options).toHaveLength(5);
});

test('the practiced characters are not changed', () => {
  const before = JSON.stringify(pool);
  chooseTouchOptions({ ...find('か'), romanji: ['ka'] }, pool, ['た']);
  expect(JSON.stringify(pool)).toBe(before);
});

test('a small pool repeats wrong options to fill every button', () => {
  const options = chooseTouchOptions(find('あ'), [find('あ'), find('い')]);
  expect(options).toHaveLength(5);
  expect(options.filter(option => option === 'a')).toHaveLength(1);
  expect(new Set(options)).toEqual(new Set(['a', 'i']));
});
