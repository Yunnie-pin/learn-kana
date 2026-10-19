import {
  BUNPOU_ANSWER_KEY, BUNPOU_JLPT_KEY, BUNPOU_TOPIC_KEY,
  bunpouFormNote, bunpouOptionLabel, bunpouPhraseOf, createBunpouQuestion, formVariations, getBunpouOptions, getBunpouQuestions,
} from './bunpou.js';
import { getReadableSentences, sentenceJlpt, sentences } from './sentences.js';
import { kanaCharacters } from './kanaCharacters.js';
import { translate } from './i18n.js';

/*
 * Grammar ("bunpou") practice: a real sentence is shown with the verb form at
 * its end hidden (父はコーヒーを？...), and the player completes it - by typing
 * the form's romaji (nomimasen) or by picking it among four forms of the same
 * verb (nomimasu ・ nomimashita ・ nomimasen). Everything is built from the
 * sentence data, so the tests check against the very sentences in the corpus.
 */
const sentenceEntry = (jp) => sentences.find(sentence => sentence.jp_character === jp);

// Every selectable group: with all of them picked every sentence is readable
const ALL_GROUP_TITLES = ['hiragana', 'katakana', 'kanji'].flatMap(script =>
  Object.values(kanaCharacters[script] || {}).map(group => group.title)
);
// The group a kana or kanji is taught in (水 -> its N5 kanji group, み -> "ま")
const groupTitleOf = (character) => ['hiragana', 'katakana', 'kanji']
  .flatMap(script => Object.values(kanaCharacters[script] || {}))
  .find(group => Object.values(group.characters).some(item => item.jp_character === character))?.title;
// Exactly the groups one sentence is made of: the smallest selection that can show it
const groupsOf = (sentence) => [...new Set([...sentence.jp_character].map(groupTitleOf).filter(Boolean))];

// The masked sentence as the game shows it (？ over the hidden characters)
const maskedSentenceOf = (sentence) => {
  const phrase = bunpouPhraseOf(sentence);
  return [...sentence.jp_character].map((character, index) =>
    index >= phrase.blank.start && index < phrase.blank.end ? '？' : character).join('');
};

beforeEach(() => {
  localStorage.clear();
});

describe('formVariations', () => {
  test('builds the polite other forms of the same verb', () => {
    expect(formVariations('nomimasu')).toMatchObject({ stem: 'nomi', ending: 'masu' });
    expect(formVariations('nomimasu').forms)
      .toEqual(['nomimashita', 'nomimasen', 'nomimasen deshita', 'nomimashou']);
    expect(formVariations('ikimasen')).toMatchObject({
      stem: 'iki', ending: 'masen', forms: ['ikimasu', 'ikimashita', 'ikimashou'],
    });
    expect(formVariations('tabemashita')).toMatchObject({
      stem: 'tabe', ending: 'mashita', forms: ['tabemasu', 'tabemasen', 'tabemashou'],
    });
  });

  test('knows the longer endings before the shorter ones', () => {
    // 〜ませんでした is one ending, not 〜ました with a tail in front
    expect(formVariations('shimasen deshita')).toMatchObject({
      stem: 'shi', ending: 'masen deshita', forms: ['shimasu', 'shimashita', 'shimasen'],
    });
    // 〜てください / 〜ています / 〜たいです carry the verb with them
    expect(formVariations('mite kudasai')).toMatchObject({
      stem: 'mi', ending: 'te kudasai', forms: ['mite imasu', 'mite imashita'],
    });
    expect(formVariations('ikitai desu')).toMatchObject({
      stem: 'iki', ending: 'tai desu', forms: ['ikimasu', 'ikimashita', 'ikimasen'],
    });
  });

  test('is null for everything else (です, か, bare endings)', () => {
    expect(formVariations('desu')).toBeNull();
    expect(formVariations('ka')).toBeNull();
    expect(formVariations('benkyou')).toBeNull();
    expect(formVariations('')).toBeNull();
    // An ending on its own is not a verb
    expect(formVariations('masu')).toBeNull();
    expect(formVariations('masen')).toBeNull();
  });
});

describe('bunpouPhraseOf on real sentences', () => {
  test('水を飲みます ends with ます', () => {
    const entry = sentenceEntry('水を飲みます');
    expect(bunpouPhraseOf(entry)).toMatchObject({
      phrase: 'nomimasu', stem: 'nomi', ending: 'masu',
      blank: { start: 2, end: 6, text: '飲みます' },
    });
  });

  test('the question marker か stays visible: いっしょに駅へ行きませんか', () => {
    const entry = sentenceEntry('いっしょに駅へ行きませんか');
    expect(bunpouPhraseOf(entry)).toMatchObject({
      phrase: 'ikimasen', stem: 'iki', ending: 'masen',
      blank: { start: 7, end: 12, text: '行きません' },
    });
    // 行きません is hidden, the か of the question is not
    expect(maskedSentenceOf(entry)).toBe('いっしょに駅へ？？？？？か');
  });

  test('〜てください takes the て form with it: えいがを見てください', () => {
    expect(bunpouPhraseOf(sentenceEntry('えいがを見てください'))).toMatchObject({
      phrase: 'mite kudasai', stem: 'mi', ending: 'te kudasai',
      blank: { start: 4, end: 10, text: '見てください' },
    });
  });

  test('〜たいです takes the stem with it: わたしはレストランへ行きたいです', () => {
    expect(bunpouPhraseOf(sentenceEntry('わたしはレストランへ行きたいです'))).toMatchObject({
      phrase: 'ikitai desu', stem: 'iki', ending: 'tai desu',
      blank: { start: 10, end: 16, text: '行きたいです' },
    });
  });

  test('〜ませんでした is one form: きのう、学生は日本語をべんきょうしませんでした', () => {
    expect(bunpouPhraseOf(sentenceEntry('きのう、学生は日本語をべんきょうしませんでした'))).toMatchObject({
      phrase: 'shimasen deshita', stem: 'shi', ending: 'masen deshita',
      blank: { start: 16, end: 23, text: 'しませんでした' },
    });
  });

  test('a 〜です sentence has no form to hide', () => {
    expect(bunpouPhraseOf(sentenceEntry('これは水です'))).toBeNull();
    expect(bunpouPhraseOf(sentenceEntry('きのうは雨でした'))).toBeNull();
  });
});

describe('getBunpouQuestions', () => {
  test('turns the readable sentences with a verb form into questions', () => {
    const questions = getBunpouQuestions(groupsOf(sentenceEntry('水を飲みます')));
    const question = questions.find(item => item.jp_character === '水を飲みます');
    expect(question).toBeDefined();
    expect(question.type).toBe('long');
    expect(question.romanji).toEqual(sentenceEntry('水を飲みます').romanji);
    expect(question.meaning).toBe(sentenceEntry('水を飲みます').meaning);
    expect(question.bunpou.phrase).toBe('nomimasu');
    expect(question.bunpou.blank).toEqual({ start: 2, end: 6, text: '飲みます' });
    // Four different forms of the same verb, the right one among them
    expect(question.bunpou.options).toHaveLength(4);
    expect(new Set(question.bunpou.options).size).toBe(4);
    expect(question.bunpou.options).toContain('nomimasu');
  });

  test('a sentence with no verb form makes no question (only これは水です is readable)', () => {
    const groups = ['か', 'ら', 'は', 'だ', 'さ', groupTitleOf('水')];
    expect(getBunpouQuestions(groups)).toEqual([]);
  });

  test('every question of the corpus offers four distinct forms, its own among them', () => {
    const questions = getBunpouQuestions(ALL_GROUP_TITLES);
    expect(questions.length).toBeGreaterThan(100);
    for (const question of questions) {
      expect(question.bunpou.options).toHaveLength(4);
      expect(new Set(question.bunpou.options).size).toBe(4);
      expect(question.bunpou.options).toContain(question.bunpou.phrase);
      // The hidden form is exactly what the sentence ends with
      expect(bunpouPhraseOf(question).phrase).toBe(question.bunpou.phrase);
    }
  });

  test('the menu options filter the questions (level, topic)', () => {
    const readable = getReadableSentences(ALL_GROUP_TITLES).filter(sentence => bunpouPhraseOf(sentence));
    const all = { answer: 'typing', jlpt: 'all', topic: 'all' };

    const n4 = getBunpouQuestions(ALL_GROUP_TITLES, { ...all, jlpt: 'N4' });
    expect(n4.map(question => question.jp_character))
      .toEqual(readable.filter(sentence => sentenceJlpt(sentence) === 'N4').map(sentence => sentence.jp_character));
    expect(n4.length).toBeGreaterThan(0);

    const it = getBunpouQuestions(ALL_GROUP_TITLES, { ...all, topic: 'it' });
    expect(it.map(question => question.jp_character))
      .toEqual(readable.filter(sentence => sentence.topic === 'it').map(sentence => sentence.jp_character));
    expect(it.length).toBeGreaterThan(0);

    const general = getBunpouQuestions(ALL_GROUP_TITLES, { ...all, topic: 'general' });
    expect(general.map(question => question.jp_character))
      .toEqual(readable.filter(sentence => sentence.topic !== 'it').map(sentence => sentence.jp_character));
    expect(general.length).toBeGreaterThan(0);
  });
});

describe('createBunpouQuestion', () => {
  const questionFor = (jp) => {
    const item = getBunpouQuestions(ALL_GROUP_TITLES).find(question => question.jp_character === jp);
    expect(item).toBeDefined();
    return createBunpouQuestion(item);
  };

  test('takes only the hidden form as the answer', () => {
    const question = questionFor('水を飲みます');
    expect(question.exercise).toBe('bunpou');
    expect(question.choice.correct).toBe('nomimasu');
    expect(question.matcher.words).toEqual(['nomimasu']);
    expect(question.matcher.check('nomimasu').correct).toBe(true);
    expect(question.matcher.check('mizu wo nomimasu').correct).toBe(false);
    expect(question.matcher.check('nomimashita').correct).toBe(false);
    expect(question.matcher.check('nomimasen').correct).toBe(false);
    // Kana from a Japanese keyboard works too
    expect(question.matcher.check('のみます').correct).toBe(true);
  });

  test('checks a multi-word form (〜ませんでした), spelling by spelling', () => {
    const question = questionFor('きのう、学生は日本語をべんきょうしませんでした');
    expect(question.choice.correct).toBe('shimasen deshita');
    expect(question.matcher.check('shimasen deshita').correct).toBe(true);
    // With or without the space, and in Kunrei-shiki (si, desita)
    expect(question.matcher.check('shimasendeshita').correct).toBe(true);
    expect(question.matcher.check('simasen desita').correct).toBe(true);
    // Half of it is on track but not the answer yet
    expect(question.matcher.check('shimasen')).toMatchObject({ correct: false, onTrack: true });
  });

  test('a hidden kanji form is checked with its reading', () => {
    const question = questionFor('水を飲みます');
    // 飲みます -> のみます: the furigana of the hidden part is carried over
    expect(question.matcher.check('nomi masu').correct).toBe(true);
    expect(question.matcher.check('nomimasu').correct).toBe(true);
  });

  test('labels the choice buttons in kanji / kana, the forms of the verb with its kanji', () => {
    const question = questionFor('水を飲みます');
    const labelOf = (option) => question.choice.labels[question.choice.options.indexOf(option)];
    // The form of the sentence shows as the sentence writes it, the other
    // forms of the same verb keep the kanji stem. The three wrong options
    // are three of the four polite derivations of 飲む
    const derivations = {
      'nomimashita': '飲みました',
      'nomimasen': '飲みません',
      'nomimasen deshita': '飲みませんでした',
      'nomimashou': '飲みましょう',
    };
    expect(labelOf('nomimasu')).toBe('飲みます');
    for (const option of question.choice.options) {
      expect(labelOf(option)).toBe(option === 'nomimasu' ? '飲みます' : derivations[option]);
    }
  });

  test('a て form carries the verb: 飲んでください makes 飲んでいます', () => {
    const question = questionFor('ジュースを飲んでください');
    const labelOf = (option) => question.choice.labels[question.choice.options.indexOf(option)];
    expect(question.choice.correct).toBe('nonde kudasai');
    expect(labelOf('nonde kudasai')).toBe('飲んでください');
    expect(labelOf('nonde imasu')).toBe('飲んでいます');
    expect(labelOf('nonde imashita')).toBe('飲んでいました');
  });

  test('every question of the corpus gets distinct kanji / kana labels, its own form as written', () => {
    for (const item of getBunpouQuestions(ALL_GROUP_TITLES)) {
      const { choice, blank } = createBunpouQuestion(item);
      expect(choice.labels).toHaveLength(choice.options.length);
      expect(new Set(choice.labels).size).toBe(choice.options.length);
      for (const label of choice.labels) {
        // No romaji on the buttons
        expect(label).not.toMatch(/[a-z]/i);
      }
      expect(choice.labels[choice.options.indexOf(choice.correct)]).toBe(blank.text);
    }
  });
});

describe('bunpouOptionLabel', () => {
  // The hidden form of 水を飲みます: 飲みます, its furigana re-indexed
  const { blank, phrase } = bunpouPhraseOf(sentenceEntry('水を飲みます'));
  const furigana = { 0: 'の' };

  test('shows the form of the sentence as the sentence writes it', () => {
    expect(bunpouOptionLabel('nomimasu', phrase, blank, furigana)).toBe('飲みます');
    expect(bunpouOptionLabel('nomimashita', phrase, blank, furigana)).toBe('飲みました');
  });

  test('a form of another verb is labelled in kana, not with the kanji of 飲む', () => {
    expect(bunpouOptionLabel('kaimasu', phrase, blank, furigana)).toBe('かいます');
    // 買う is never written with the kanji of the shown verb
    expect(bunpouOptionLabel('kaimashita', phrase, blank, furigana)).toBe('かいました');
  });

  test('an option that only looks like the stem stays kana (言 here, 行 there)', () => {
    // ikimasu starts with the stem i of iimasu, but いきます is 行く - not 言きます
    expect(bunpouOptionLabel('ikimasu', 'iimasu', { text: '言います' }, {})).toBe('いきます');
  });
});

describe('bunpouFormNote', () => {
  const noteOf = (phrase) => bunpouFormNote(phrase, (key) => translate('en', key));

  test('explains the ending the answer was chosen for', () => {
    expect(noteOf('nomimasu')).toBe(translate('en', 'bunpouNoteMasu'));
    expect(noteOf('yomimasen')).toBe(translate('en', 'bunpouNoteMasen'));
    expect(noteOf('ikimashita')).toBe(translate('en', 'bunpouNoteMashita'));
    expect(noteOf('shimasen deshita')).toBe(translate('en', 'bunpouNoteMasenDeshita'));
    expect(noteOf('kakimashou')).toBe(translate('en', 'bunpouNoteMashou'));
    expect(noteOf('ikitai desu')).toBe(translate('en', 'bunpouNoteTai'));
    // て / で are the same grammar, only a different sound change
    expect(noteOf('mite kudasai')).toBe(translate('en', 'bunpouNoteKudasai'));
    expect(noteOf('nonde kudasai')).toBe(translate('en', 'bunpouNoteKudasai'));
    expect(noteOf('mite imasu')).toBe(translate('en', 'bunpouNoteTeImasu'));
    expect(noteOf('yonde imasu')).toBe(translate('en', 'bunpouNoteTeImasu'));
  });

  test('is null for everything that is not a known verb form', () => {
    expect(noteOf('desu')).toBeNull();
    expect(noteOf('benkyou')).toBeNull();
  });
});

describe('getBunpouOptions', () => {
  test('answers by typing, everything, by default', () => {
    expect(getBunpouOptions()).toEqual({ answer: 'typing', jlpt: 'all', topic: 'all' });
  });

  test('reads what was chosen in the menu', () => {
    localStorage.setItem(BUNPOU_ANSWER_KEY, 'choice');
    localStorage.setItem(BUNPOU_JLPT_KEY, 'N4');
    localStorage.setItem(BUNPOU_TOPIC_KEY, 'it');
    expect(getBunpouOptions()).toEqual({ answer: 'choice', jlpt: 'N4', topic: 'it' });
  });

  test('a stored value that makes no sense falls back', () => {
    localStorage.setItem(BUNPOU_ANSWER_KEY, 'touch');
    localStorage.setItem(BUNPOU_JLPT_KEY, 'N1');
    localStorage.setItem(BUNPOU_TOPIC_KEY, 'word');
    expect(getBunpouOptions()).toEqual({ answer: 'typing', jlpt: 'all', topic: 'all' });
  });
});
