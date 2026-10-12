import { toHiragana } from 'wanakana';
import { sentences } from './sentences.js';
import { alignWords, createSentenceMatcher, normalizeTypedAnswer, wordSpellings } from './sentenceMatching.js';

const sentence = (jp) => sentences.find(entry => entry.jp_character === jp);

describe('word spellings', () => {
  test('accept Kunrei-shiki, long vowels, m before b and nn for ん', () => {
    expect(wordSpellings('watashi')).toContain('watasi');
    expect(wordSpellings('tsukurimasu')).toContain('tukurimasu');
    expect(wordSpellings('kyou')).toEqual(expect.arrayContaining(['kyou', 'kyoo', 'kyō']));
    expect(wordSpellings('koohii')).toEqual(expect.arrayContaining(['kouhii', 'kōhī']));
    expect(wordSpellings('shinbun')).toEqual(expect.arrayContaining(['shimbun', 'sinbun', 'shinnbun']));
    expect(wordSpellings('densha')).toEqual(expect.arrayContaining(['densya', 'dennsha']));
    // An "n" before a vowel is not ん
    expect(wordSpellings('nani')).toEqual(['nani']);
  });
});

describe('lining the words up with the sentence', () => {
  test('every word of every sentence is lined up with its characters', () => {
    const failures = sentences.filter(entry =>
      entry.romanji.some(romaji => !alignWords(entry, romaji.split(' ')))
    ).map(entry => entry.jp_character);
    expect(failures).toEqual([]);
  });

  test('punctuation goes with the word before it', () => {
    const entry = sentence('毎週、山へ行きます');
    const characters = [...entry.jp_character];
    const words = alignWords(entry, entry.romanji[0].split(' '))
      .map(({ start, end }) => characters.slice(start, end).join(''));
    expect(words).toEqual(['毎週、', '山', 'へ', '行きます']);
  });
});

describe('checking a typed sentence', () => {
  const matcher = createSentenceMatcher(sentence('わたしの父は毎日、新聞を読みます'));

  test('accepts the stored romaji, with or without spaces', () => {
    expect(matcher.check('watashi no chichi wa mainichi shinbun wo yomimasu').correct).toBe(true);
    expect(matcher.check('watashinochichiwamainichishinbunoyomimasu').correct).toBe(true);
  });

  test('accepts other common spellings', () => {
    expect(matcher.check('watasinotitihamainitisimbunwoyomimasu').correct).toBe(true);
    expect(matcher.check("Watashi no chichi ha mainichi shinbun o yomimasu").correct).toBe(true);
  });

  test('accepts kana typed with a Japanese keyboard', () => {
    expect(matcher.check('わたしのちちはまいにちしんぶんをよみます').correct).toBe(true);
    expect(matcher.check('watashi no ちちは').onTrack).toBe(true);
  });

  test('counts the words already typed', () => {
    expect(matcher.check('').wordsDone).toBe(0);
    expect(matcher.check('watashi').wordsDone).toBe(1);
    expect(matcher.check('watashinochi').wordsDone).toBe(2);
    expect(matcher.check('watashi no chichi wa').wordsDone).toBe(4);
  });

  test('a partly typed syllable is still on track', () => {
    // "sy" on the way to "syo", "h" on the way to "ha"
    const school = createSentenceMatcher(sentence('わたしは毎日、電車で学校へ行きます'));
    expect(school.check('watashi wa mainichi densy').onTrack).toBe(true);
    expect(matcher.check('watashi no chichi h').onTrack).toBe(true);
  });

  test('tells where the first mistake is', () => {
    const result = matcher.check('watashi no chichi xa');
    expect(result.onTrack).toBe(false);
    expect('watashi no chichi xa'.slice(0, result.validLength)).toBe('watashi no chichi ');
    expect(matcher.check('watashix').validLength).toBe('watashi'.length);
    expect(matcher.check('x').validLength).toBe(0);
  });

  test('extra text after the sentence is a mistake', () => {
    const result = matcher.check('watashi no chichi wa mainichi shinbun wo yomimasux');
    expect(result.correct).toBe(false);
    expect(result.onTrack).toBe(false);
  });

  test('every sentence accepts its own romaji and kana reading', () => {
    const failures = [];
    for (const entry of sentences) {
      const check = createSentenceMatcher(entry).check;
      for (const romaji of entry.romanji) {
        if (!check(romaji).correct) failures.push(`${entry.jp_character}: ${romaji}`);
        // Typed key by key, the answer never looks wrong on the way
        const typed = romaji.replace(/ /g, '');
        for (let length = 1; length < typed.length; length++) {
          if (!check(typed.slice(0, length)).onTrack) {
            failures.push(`${entry.jp_character}: "${typed.slice(0, length)}" flagged`);
            break;
          }
        }
      }
      if (!check(toHiragana(entry.romanji[0].replace(/ /g, ''))).correct) {
        failures.push(`${entry.jp_character}: kana`);
      }
    }
    expect(failures).toEqual([]);
  });
});

test('normalizing keeps track of where every typed character ends', () => {
  expect(normalizeTypedAnswer('Wa ta-shi')).toEqual({ text: 'watashi', rawEnd: [1, 3, 4, 6, 7, 8, 9] });
});
