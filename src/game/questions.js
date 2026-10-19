import { toHiragana } from 'wanakana';
import { createSentenceQuestion } from '../sentenceMatching.js';
import { createBunpouQuestion } from '../bunpou.js';
import { kanjiOfWord } from './kanjiEntries.js';

// The kinds of question a game asks, by the `type` of the picked entry (see
// practiceList.js, sentences.js, bunpou.js). A new kind of question is a new
// entry here plus its case in createQuestion.
//   afterCorrect: what a correct answer leads to
//     'next'   the next question comes by itself (kana)
//     'reveal' the answer is shown with a Next button, auto-next or not
//              (kanji: their readings, usage word and meaning)
//     'wait'   the answer and meaning are shown until the player moves on
//              (words and sentences: long answers are worth reading)
//   kanaInput: the answer may also be typed in kana, checked on Enter only
//   recordsConfusions: a wrong answer that is another kana is remembered as
//     a mix-up (confusions.js)
//   readAloud: the answer is read out once right (speech.js); not a lone
//     kanji, the voice cannot know which of its readings is asked
export const QUESTION_TYPES = {
  kana: { afterCorrect: 'next', kanaInput: false, recordsConfusions: true, readAloud: true },
  kanji: { afterCorrect: 'reveal', kanaInput: true, recordsConfusions: false, readAloud: false },
  word: { afterCorrect: 'wait', kanaInput: false, recordsConfusions: false, readAloud: true },
  // Sentences, also the grammar practice (an entry with `bunpou`)
  long: { afterCorrect: 'wait', kanaInput: false, recordsConfusions: false, readAloud: true },
};

// The help a question gives, one step per ask ("?" or the Hint button):
//   romaji     the answer
//   meanings   the meaning of each kanji of the word, then
//   readings   their readings (the one the word uses marked)
//   text       the sentence, when it is only heard
//   furigana   the readings above the kanji of the sentence
//   word       the romaji of the word of the sentence being typed (once per word)
//   role       what the missing particle does
export function hintSteps(entry, sentence) {
  if (entry.type === 'long') {
    return {
      listen: ['text', 'furigana', 'word'],
      particle: ['furigana', 'role'],
    }[sentence.exercise] || ['furigana', 'word'];
  }
  if (entry.type === 'word' && kanjiOfWord(entry.jp_character).length > 0) {
    return ['meanings', 'readings', 'romaji'];
  }
  return ['romaji'];
}

export function questionType(type) {
  return QUESTION_TYPES[type] || QUESTION_TYPES.kana;
}

// The typed answer as it is compared: no case, spaces, hyphens or invisible
// characters, full-width letters as normal ones
export function normalizeAnswer(answer) {
  return String(answer ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[​-‍﻿]/g, '')
    .replace(/[\s-]/g, '');
}

// The question shown for a picked entry:
// {
//   type, display (what is shown), isUsageQuestion (a kanji asked through its
//   usage word, 人 → 人口), answers (normalized accepted answers), solution
//   (the romaji shown as the answer), meaning ({ jp, en } for meaningOf, or
//   null), kanjiUsage (a kanji's usage word, shown once answered), particles
//   and furigana (sentences), sentence (the sentence exercise, see
//   sentenceMatching.js; { exercise: 'type', matcher: null } otherwise),
//   touchEntry (the entry with the romaji the touch answers offer),
//   hintSteps (see hintSteps)
// }
// options: practiceMode (mixed games sometimes ask a kanji through its usage
// word, not in a review), isSrsPractice, sentenceExercise, random
export function createQuestion(entry, { practiceMode, isSrsPractice = false, sentenceExercise, random = Math.random } = {}) {
  const isUsageQuestion = Boolean(!isSrsPractice && entry.type === 'kanji' && entry.usage &&
    practiceMode === 'mixed' && random() < 0.5);
  const readings = Array.isArray(entry.romanji) ? entry.romanji : [entry.romanji];
  const answerReadings = isUsageQuestion ? [entry.usage.romanji] : readings;
  // Kanji may be answered in kana too (みず for 水)
  const accepted = entry.type === 'kanji'
    ? answerReadings.flatMap(reading => [reading, toHiragana(reading)])
    : answerReadings;

  let meaning = null;
  if (isUsageQuestion) meaning = { jp: entry.usage.word, en: entry.usage.meaning };
  else if (['word', 'kanji', 'long'].includes(entry.type)) meaning = { jp: entry.jp_character, en: entry.meaning };

  const sentence = entry.type === 'long'
    ? entry.bunpou ? createBunpouQuestion(entry) : createSentenceQuestion(entry, sentenceExercise)
    : { exercise: 'type', matcher: null };

  return {
    type: entry.type,
    display: isUsageQuestion ? entry.usage.word : entry.jp_character,
    isUsageQuestion,
    answers: accepted.map(normalizeAnswer).filter(Boolean),
    solution: entry.type === 'kanji' ? answerReadings : entry.romanji,
    meaning,
    kanjiUsage: entry.type === 'kanji' ? entry.usage : null,
    particles: entry.type === 'long' && Array.isArray(entry.particles) ? entry.particles : [],
    furigana: entry.type === 'long' && entry.furigana ? entry.furigana : {},
    sentence,
    touchEntry: { ...entry, romanji: answerReadings },
    hintSteps: hintSteps(entry, sentence),
  };
}
