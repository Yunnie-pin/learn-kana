import { alignWords, createSentenceMatcher } from './sentenceMatching.js';
import { getReadableSentences, sentenceInTopic, sentenceJlpt } from './sentences.js';
import { getBunpouOptions } from './practiceOptions.js';
import { toHiragana } from 'wanakana';

/* Grammar ("bunpou") practice, built from the sentences the sentence practice
 * already has: the verb form at the end of a real sentence is hidden (e.g.
 * 父はコーヒーを？...), and the player completes it - by typing its romaji
 * (nomimasen) or by choosing it among four forms of the same verb, shown in
 * kanji / kana (飲みます ・ 飲みました ・ 飲みません). The answer explains the
 * chosen form instead of repeating the meaning of the sentence.
 *
 * Nothing new is written by hand: every question is made from the existing
 * sentence data, and the wrong options are other forms of the same verb - the
 * real ones from the corpus, and the ones the polite conjugation produces
 * (〜ます / 〜ません / 〜ました / 〜ましょう / 〜てください / 〜ています).
 */

const PUNCTUATION = /[、。！？!?・]/;

// The verb forms the practice knows, longest ending first. Each one lists the
// endings that change its meaning but keep the verb: the options of a
// question are the form of its sentence plus three of these, or real forms of
// the verb from the corpus (see optionsFor).
const FORM_RULES = [
  { ending: 'masen deshita', derivations: ['masu', 'mashita', 'masen'] },
  { ending: 'te kudasai', derivations: ['te imasu', 'te imashita'] },
  { ending: 'de kudasai', derivations: ['de imasu', 'de imashita'] },
  { ending: 'te imasu', derivations: ['te kudasai', 'te imashita', 'te imasen'] },
  { ending: 'de imasu', derivations: ['de kudasai', 'de imashita', 'de imasen'] },
  { ending: 'tai desu', derivations: ['masu', 'mashita', 'masen'] },
  { ending: 'mashou', derivations: ['masu', 'mashita', 'masen'] },
  { ending: 'mashita', derivations: ['masu', 'masen', 'mashou'] },
  { ending: 'masen', derivations: ['masu', 'mashita', 'mashou'] },
  { ending: 'masu', derivations: ['mashita', 'masen', 'masen deshita', 'mashou'] },
];

// Every ending a form or a wrong option can end with
const BUNPOU_ENDINGS = new Set(
  FORM_RULES.flatMap(rule => [rule.ending, ...rule.derivations])
);

// Words that can follow the verb form without being part of it (a question
// marker, emphasis): they stay visible in the sentence
const TRAILING_WORDS = ['ka', 'ne', 'yo'];

// A て form always ends in -te / -de, but the て form of います (います ->
// いて) may not be just the particles で / て on their own (ひとりで + います
// is "to be alone", not a ている form)
const TE_FORM = /^(?!te$|de$).+(te|de)$/;

const OPTION_COUNT = 4;

// Splits the main romaji answer of a sentence into its words
function answerWords(sentence) {
  return String([].concat(sentence.romanji)[0] || '')
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean);
}

// The verb form a sentence ends with: its romaji, the stem the other forms
// are built from (stem + ending), and the endings that keep the verb. Null
// for a sentence that does not end with a verb form (〜です sentences).
export function formVariations(phrase) {
  for (const rule of FORM_RULES) {
    if (phrase.length > rule.ending.length && phrase.endsWith(rule.ending)) {
      const stem = phrase.slice(0, phrase.length - rule.ending.length);
      return {
        stem,
        ending: rule.ending,
        forms: rule.derivations.map(ending => stem + ending),
      };
    }
  }
  return null;
}

// The verb form of a sentence as a question: { phrase, stem, ending, blank },
// where blank = { start, end, text } are the characters the form is written
// with (punctuation after it stays visible). Words following the form (か,
// ね...) are not part of it either. Null when the sentence has no verb form
// at its end, or when it can't be lined up word by word.
export function bunpouPhraseOf(sentence) {
  const words = answerWords(sentence);
  if (!words.length) return null;
  const segments = alignWords(sentence, words);
  if (!segments) return null;

  let end = words.length;
  while (end > 1 && TRAILING_WORDS.includes(words[end - 1])) end--;
  if (end === 0) return null;

  // The form can take in the word before it: the て form of 〜ている and
  // 〜てください (のんで + います), the stem of 〜たいです and 〜ませんでした
  let start = end - 1;
  const last = words[end - 1];
  const previous = end >= 2 ? words[end - 2] : '';
  if (['imasu', 'imashita', 'imasen', 'kudasai'].includes(last) && TE_FORM.test(previous)) {
    start = end - 2;
  } else if ((last === 'desu' && previous.endsWith('tai')) || (last === 'deshita' && previous.endsWith('masen'))) {
    start = end - 2;
  }

  const phrase = words.slice(start, end).join(' ');
  const variation = formVariations(phrase);
  if (!variation) return null;

  const characters = [...sentence.jp_character];
  let blankEnd = segments[end - 1].end;
  while (blankEnd > segments[start].start && PUNCTUATION.test(characters[blankEnd - 1])) blankEnd--;
  const blank = {
    start: segments[start].start,
    end: blankEnd,
    text: characters.slice(segments[start].start, blankEnd).join(''),
  };
  if (!blank.text) return null;
  return { phrase, ...variation, blank };
}

function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The options of one question: the form of its sentence plus three other
// forms of the same verb, first the ones the conjugation gives, then the real
// ones found in the corpus, then - when the verb is rare - real forms of
// other verbs so that the buttons are always filled.
function optionsFor(phrase, pools, random) {
  const options = [phrase.phrase];
  const used = new Set(options);
  const fillFrom = (candidates) => {
    for (const text of shuffle(candidates, random)) {
      if (options.length >= OPTION_COUNT) return;
      if (!text || used.has(text)) continue;
      used.add(text);
      options.push(text);
    }
  };
  fillFrom(phrase.forms);
  fillFrom(pools.byStem.get(phrase.stem) || []);
  fillFrom(pools.byEnding.get(phrase.ending) || []);
  return shuffle(options, random);
}

// The hidden form read out in kana (のみます for 飲みます), from the
// furigana of its characters
function kanaReadingOf(blank, furigana) {
  return [...blank.text]
    .map((character, index) => furigana[index] || character)
    .join('');
}

// The characters of the form that carry its stem (飲み of 飲みます): reading
// the form in kana, everything before its ending. Null when the reading does
// not line up with the romaji word for word.
function kanjiStemOf(blank, furigana, phrase) {
  const { ending } = formVariations(phrase);
  const reading = kanaReadingOf(blank, furigana);
  // The romaji endings carry spaces (て います), Japanese does not
  const endingKana = toHiragana(ending.replace(/\s+/g, ''));
  if (!reading.endsWith(endingKana)) return null;
  const stemKana = reading.slice(0, reading.length - endingKana.length);
  let kana = '';
  let count = 0;
  for (const character of [...blank.text]) {
    if (kana.length >= stemKana.length) break;
    kana += furigana[count] || character;
    count++;
  }
  return kana === stemKana ? blank.text.slice(0, count) : null;
}

// The text of a choice button: the form of the sentence as it is written
// there (飲みます), the other forms of the same verb with the same kanji stem
// (飲みました), and the forms of other verbs in kana (かいます)
export function bunpouOptionLabel(option, phrase, blank, furigana) {
  const inKana = text => toHiragana(text.replace(/\s+/g, ''));
  if (option === phrase) return blank.text;
  const variation = formVariations(phrase);
  const rest = variation &&
    option.startsWith(variation.stem) &&
    BUNPOU_ENDINGS.has(option.slice(variation.stem.length))
    ? option.slice(variation.stem.length)
    : null;
  const stemText = rest ? kanjiStemOf(blank, furigana, phrase) : null;
  return stemText ? stemText + inKana(rest) : inKana(option);
}

// ---------- Grammar practice options (chosen in the menu) ----------

export { BUNPOU_ANSWER_MODES, BUNPOU_JLPT_LEVELS, BUNPOU_TOPICS, BUNPOU_ANSWER_KEY, BUNPOU_JLPT_KEY, BUNPOU_TOPIC_KEY, getBunpouOptions } from './practiceOptions.js';

// The grammar questions offered with the selected groups and the options of
// the menu. The wrong options are looked up in the whole readable corpus, so
// even a small selection has real forms to offer.
export function getBunpouQuestions(selectedGroupTitles, options = getBunpouOptions(), random = Math.random) {
  const candidates = getReadableSentences(selectedGroupTitles)
    .map(sentence => ({ sentence, phrase: bunpouPhraseOf(sentence) }))
    .filter(({ phrase }) => phrase);
  const pools = { byStem: new Map(), byEnding: new Map() };
  for (const { phrase } of candidates) {
    if (!pools.byStem.has(phrase.stem)) pools.byStem.set(phrase.stem, []);
    pools.byStem.get(phrase.stem).push(phrase.phrase);
    if (!pools.byEnding.has(phrase.ending)) pools.byEnding.set(phrase.ending, []);
    pools.byEnding.get(phrase.ending).push(phrase.phrase);
  }

  return candidates
    .filter(({ sentence }) =>
      (!options.jlpt || options.jlpt === 'all' || sentenceJlpt(sentence) === options.jlpt) &&
      sentenceInTopic(sentence, options.topic || 'all'))
    .map(({ sentence, phrase }) => ({
      "jp_character": sentence.jp_character,
      "romanji": sentence.romanji,
      "particles": sentence.particles || [],
      "furigana": sentence.furigana || {},
      "sound": "",
      "meaning": sentence.meaning,
      "type": "long",
      bunpou: {
        blank: phrase.blank,
        phrase: phrase.phrase,
        options: optionsFor(phrase, pools, random),
      },
    }));
}

// Why the form of the sentence is the answer: one note per ending, shown
// once the question is answered (the meaning of the sentence is in the
// prompt). て / で are the same grammar, only a different sound change.
const BUNPOU_FORM_NOTE_KEYS = {
  'masu': 'bunpouNoteMasu',
  'masen': 'bunpouNoteMasen',
  'mashita': 'bunpouNoteMashita',
  'masen deshita': 'bunpouNoteMasenDeshita',
  'mashou': 'bunpouNoteMashou',
  'tai desu': 'bunpouNoteTai',
  'te kudasai': 'bunpouNoteKudasai',
  'de kudasai': 'bunpouNoteKudasai',
  'te imasu': 'bunpouNoteTeImasu',
  'de imasu': 'bunpouNoteTeImasu',
};

// The explanation of the form a question asks for (its ending decides which
// one), in the language `translate` speaks. Null for anything that is not a
// known verb form.
export function bunpouFormNote(phrase, translate) {
  const variation = formVariations(phrase);
  const key = variation && BUNPOU_FORM_NOTE_KEYS[variation.ending];
  return key ? translate(key) : null;
}

// The question shown in the game (see createSentenceQuestion in
// sentenceMatching.js): the verb form is hidden, only that form is typed, and
// the choice buttons come with the options built above, labelled in
// kanji / kana
export function createBunpouQuestion(item) {
  const { blank, phrase, options } = item.bunpou;
  // The furigana of the hidden part, re-indexed for the sub-sentence: the
  // hidden form is checked on its own, its kanji (飲みます) need their reading
  // to be lined up with the romaji
  const furigana = {};
  for (const [index, reading] of Object.entries(item.furigana || {})) {
    const position = Number(index) - blank.start;
    if (position >= 0 && position < blank.text.length) furigana[position] = reading;
  }
  return {
    exercise: 'bunpou',
    blank,
    choice: {
      correct: phrase,
      options,
      labels: options.map(option => bunpouOptionLabel(option, phrase, blank, furigana)),
    },
    matcher: createSentenceMatcher({
      jp_character: blank.text,
      romanji: [phrase],
      particles: [],
      furigana,
    }),
  };
}
