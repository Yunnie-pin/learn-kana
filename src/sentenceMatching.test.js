import { toHiragana } from 'wanakana';
import { sentences } from './sentences.js';
import { alignWords, createSentenceMatcher, createSentenceQuestion, isSpokenAnswerPrefix, matchesSpokenAnswer, normalizeTypedAnswer, transcriptToRomaji, wordSpellings } from './sentenceMatching.js';

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

describe('sentence questions', () => {
  const entry = sentence('わたしの父は毎日、新聞を読みます');

  test('particle: hides one particle and only that particle is typed', () => {
    // random() = 0.99 picks the last particle, を
    const question = createSentenceQuestion(entry, 'particle', () => 0.99);
    expect(question.exercise).toBe('particle');
    expect(question.blank).toEqual({ start: 11, end: 12, text: 'を' });
    expect(question.matcher.check('wo').correct).toBe(true);
    expect(question.matcher.check('o').correct).toBe(true);
    expect(question.matcher.check('wa').onTrack).toBe(false);

    const first = createSentenceQuestion(entry, 'particle', () => 0);
    expect(first.blank.text).toBe('の');
    expect(first.matcher.check('no').correct).toBe(true);
  });

  test('particle: は can be typed as wa or ha', () => {
    const question = createSentenceQuestion(entry, 'particle', () => 0.4);
    expect(question.blank.text).toBe('は');
    expect(question.matcher.check('wa').correct).toBe(true);
    expect(question.matcher.check('ha').correct).toBe(true);
  });

  test('arrange: the words are always shown out of order', () => {
    // random() = 0 would keep a shuffle in place: it must still change the order
    let calls = 0;
    const question = createSentenceQuestion(entry, 'arrange', () => (calls++ < 50 ? 0.999 : 0));
    expect(question.exercise).toBe('arrange');
    expect([...question.order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(question.order).not.toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    expect(question.matcher.check(entry.romanji[0]).correct).toBe(true);
  });

  test('a sentence without particles falls back to typing it', () => {
    const plain = { jp_character: 'おはよう', romanji: ['ohayou'], particles: [] };
    expect(createSentenceQuestion(plain, 'particle').exercise).toBe('type');
    expect(createSentenceQuestion(plain, 'listen').exercise).toBe('listen');
  });
});

describe('spoken answers', () => {
  const water = sentence('これは水です');

  test('accept the sentence as written and as it is read out loud', () => {
    expect(matchesSpokenAnswer(water, 'これは水です')).toBe(true);
    expect(matchesSpokenAnswer(water, 'これはみずです')).toBe(true);
    // The recognizer adds punctuation of its own
    expect(matchesSpokenAnswer(water, 'これは水です。')).toBe(true);
  });

  test('accept the particles written as they sound (は as わ)', () => {
    const student = sentence('わたしは学生です');
    expect(matchesSpokenAnswer(student, 'ワタシハガクセイデス')).toBe(true);
    expect(matchesSpokenAnswer(student, 'わたしわ学生です')).toBe(true);
  });

  test('reject another sentence and empty speech', () => {
    expect(matchesSpokenAnswer(water, 'それは水です')).toBe(false);
    expect(matchesSpokenAnswer(water, 'これは木です')).toBe(false);
    expect(matchesSpokenAnswer(water, '')).toBe(false);
  });

  test('a part of the sentence still fits it while it is being read', () => {
    expect(isSpokenAnswerPrefix(water, 'これは')).toBe(true);
    expect(isSpokenAnswerPrefix(water, 'これはみず')).toBe(true);
    expect(isSpokenAnswerPrefix(water, 'これは水')).toBe(true);
    // The particles written as they sound fit as well
    const student = sentence('わたしは学生です');
    expect(isSpokenAnswerPrefix(student, 'わたしわ')).toBe(true);
    // A pause between the parts changes nothing
    expect(isSpokenAnswerPrefix(water, 'これは 水')).toBe(true);
  });

  test('speech that can no longer become the sentence was mispronounced', () => {
    expect(isSpokenAnswerPrefix(water, 'それは')).toBe(false);
    expect(isSpokenAnswerPrefix(water, 'みずです')).toBe(false);
    expect(isSpokenAnswerPrefix(water, 'これはみずですよ')).toBe(false);
    expect(isSpokenAnswerPrefix(water, '')).toBe(false);
  });

  test('turn speech into romaji so a wrong recognition can be edited by hand', () => {
    // Speech that does not follow the sentence is kept as it was heard
    expect(transcriptToRomaji(water, 'それは水です')).toBe('sorehamizudesu');
    // The words of the sentence are written the way the answer is stored
    expect(transcriptToRomaji(water, 'これは水です')).toBe('kore wa mizu desu');
    expect(transcriptToRomaji(sentence('わたしは学生です'), 'わたしは学生です')).toBe('watashi wa gakusei desu');
    // The particles sound as they are read (は as わ)
    expect(transcriptToRomaji(water, 'これわみずです')).toBe('kore wa mizu desu');
  });

  test('the words heard so far are separated by spaces', () => {
    expect(transcriptToRomaji(water, 'これは')).toBe('kore wa');
    // A word heard only in part shows its kana so far
    expect(transcriptToRomaji(water, 'これはみ')).toBe('kore wa mi');
    // A pause changes nothing about the words
    expect(transcriptToRomaji(water, 'これは 水です')).toBe('kore wa mizu desu');
  });

  test('kanji outside the sentence are read with the dictionary', () => {
    // 水 heard as 木: the part no longer fitting the sentence stays as heard
    expect(transcriptToRomaji(water, 'これは木です')).toBe('kore wa kidesu');
  });

  test('a kanji run the dictionary cannot read still fits the sentence it sounds like', () => {
    // The recognizer writes こうえん with its kanji, which the game never teaches
    const park = { jp_character: 'こうえんはどこですか', particles: [4, 9], furigana: {}, romanji: ['kouen wa doko desu ka'] };
    expect(matchesSpokenAnswer(park, '公園はどこですか')).toBe(true);
    expect(isSpokenAnswerPrefix(park, '公園は')).toBe(true);
    expect(isSpokenAnswerPrefix(park, '公園ゼ')).toBe(false);
    expect(transcriptToRomaji(park, '公園はどこですか')).toBe('kouen wa doko desu ka');
    expect(transcriptToRomaji(park, '公園は')).toBe('kouen wa');
  });

  test('katakana words are written as the sentence stores them', () => {
    const coffee = sentence('コーヒーを飲みます');
    expect(transcriptToRomaji(coffee, 'コーヒーを飲みます')).toBe('koohii wo nomimasu');
    // The recognizer may write a katakana word in hiragana
    expect(transcriptToRomaji(coffee, 'こうひいをのみます')).toBe('koohii wo nomimasu');
  });
});
