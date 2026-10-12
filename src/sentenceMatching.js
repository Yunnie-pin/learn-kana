import { isKana, toHiragana, toRomaji } from 'wanakana';
import { kanjiReadings } from './kanjiReadings.js';

/* Answer checking for the "sentences" practice mode.
 *
 * A sentence's romaji is stored word-spaced in Hepburn ("watashi wa mizu wo
 * nomimasu"). Each word ("token") is lined up with the characters of the
 * Japanese sentence it is written with, which lets the game:
 *   - accept every common way to type a word: Kunrei-shiki (si, tu, syo),
 *     long vowels (kyoo, kyō), m before b/p (shimbun), nn for ん, and the
 *     particles as written (は = wa/ha, へ = e/he, を = wo/o);
 *   - accept kana typed with a Japanese keyboard;
 *   - tell how many words are already typed (progress, hints) and where the
 *     first mistake is.
 */

// Hepburn spelling -> other accepted spellings of the same sound
const SPELLING_RULES = [
  ['shi', ['si']], ['chi', ['ti']], ['tsu', ['tu']], ['fu', ['hu']], ['ji', ['zi']],
  ['sha', ['sya']], ['shu', ['syu']], ['sho', ['syo']],
  ['cha', ['tya', 'cya']], ['chu', ['tyu', 'cyu']], ['cho', ['tyo', 'cyo']],
  ['ja', ['zya', 'jya']], ['ju', ['zyu', 'jyu']], ['jo', ['zyo', 'jyo']],
  ['ou', ['oo', 'ō']], ['oo', ['ou', 'ō']], ['uu', ['ū']], ['aa', ['ā']], ['ii', ['ī']], ['ee', ['ē']],
];
const VOWEL_OR_Y = /[aiueoy]/;
// Keeps a word with many spelling choices from exploding into thousands of variants
const MAX_SPELLINGS = 256;

// Particles that are written with one kana but read differently
const PARTICLE_SPELLINGS = { 'は': ['wa', 'ha'], 'へ': ['e', 'he'], 'を': ['wo', 'o'] };
// Reading of those particles, used to line the romaji up with the sentence
const PARTICLE_READINGS = { 'は': 'わ', 'へ': 'え', 'を': 'を' };

const PUNCTUATION = /[、。！？!?・]/;

// Every accepted spelling of one Hepburn word
export function wordSpellings(word) {
  const results = new Set();
  const build = (index, typed) => {
    if (results.size >= MAX_SPELLINGS) return;
    if (index >= word.length) {
      results.add(typed);
      return;
    }
    for (const [from, alternatives] of SPELLING_RULES) {
      if (word.startsWith(from, index)) {
        for (const alternative of alternatives) build(index + from.length, typed + alternative);
      }
    }
    // ん (an "n" not followed by a vowel or y): "nn", and "m" before b / p / m
    if (word[index] === 'n' && !VOWEL_OR_Y.test(word[index + 1] || '')) {
      build(index + 1, typed + 'nn');
      if (/[bpm]/.test(word[index + 1] || '')) build(index + 1, typed + 'm');
    }
    build(index + 1, typed + word[index]);
  };
  build(0, '');
  return [...results];
}

// Comparable form of a romaji string, only used to line words up with the sentence
const alignmentForm = (romaji) => romaji
  .replace(/'/g, '')
  .replace(/wo/g, 'o')
  .replace(/ou/g, 'oo');

// The kana each character of the sentence is read with (empty for punctuation)
function characterReadings(sentence) {
  const particles = sentence.particles || [];
  const furigana = sentence.furigana || {};
  return [...sentence.jp_character].map((character, index) => {
    if (furigana[index]) return furigana[index];
    if (particles.includes(index) && PARTICLE_READINGS[character]) return PARTICLE_READINGS[character];
    if (PUNCTUATION.test(character)) return '';
    return character;
  });
}

// Lines every word of a romaji answer up with the sentence characters it is
// written with: [{ start, end }] (end exclusive, punctuation goes with the
// word before it), or null when the words cannot be lined up.
export function alignWords(sentence, words) {
  const characters = [...sentence.jp_character];
  const readings = characterReadings(sentence);
  const romajiUpTo = [''];
  for (let end = 1; end <= characters.length; end++) {
    romajiUpTo.push(alignmentForm(toRomaji(readings.slice(0, end).join(''))));
  }

  const segments = [];
  let start = 0;
  let typed = '';
  for (const word of words) {
    typed += word;
    const target = alignmentForm(typed);
    let end = start + 1;
    while (end <= characters.length && romajiUpTo[end] !== target) end++;
    if (end > characters.length) return null;
    while (end < characters.length && PUNCTUATION.test(characters[end])) end++;
    segments.push({ start, end });
    start = end;
  }
  return start === characters.length ? segments : null;
}

// Accepted spellings of every word of one romaji answer
function answerWords(sentence, romaji) {
  const words = romaji.toLowerCase().split(/[\s-]+/).filter(Boolean);
  const segments = alignWords(sentence, words);
  const characters = [...sentence.jp_character];
  const particles = sentence.particles || [];
  const hasParticle = (character) => particles.some(index => characters[index] === character);

  return {
    words,
    segments,
    spellings: words.map((word, index) => {
      const spellings = new Set(wordSpellings(word));
      // A one-kana particle can also be typed the way it is written (は = ha)
      let particle = null;
      if (segments) {
        const { start, end } = segments[index];
        const text = characters.slice(start, end).join('').replace(PUNCTUATION, '');
        if (end - start >= 1 && particles.includes(start) && PARTICLE_SPELLINGS[text]) particle = text;
      } else {
        // Without the alignment, fall back to the spelling of the word
        particle = Object.keys(PARTICLE_SPELLINGS)
          .find(character => PARTICLE_SPELLINGS[character][0] === word && hasParticle(character)) || null;
        if (!particle && word === 'o' && hasParticle('を')) particle = 'を';
      }
      if (particle) PARTICLE_SPELLINGS[particle].forEach(spelling => spellings.add(spelling));
      return [...spellings];
    }),
  };
}

// The typed answer as plain romaji, plus for every romaji character the index
// right after the typed character(s) it comes from. Spaces, hyphens and
// apostrophes are ignored; kana (typed with a Japanese keyboard) is turned
// into romaji.
export function normalizeTypedAnswer(raw) {
  const characters = [...String(raw ?? '')];
  let text = '';
  const rawEnd = [];
  let index = 0;
  let rawLength = 0;
  while (index < characters.length) {
    let chunk;
    const startLength = rawLength;
    if (isKana(characters[index])) {
      let run = '';
      while (index < characters.length && isKana(characters[index])) {
        run += characters[index];
        rawLength += characters[index].length;
        index++;
      }
      chunk = toRomaji(run).replace(/'/g, '');
    } else {
      chunk = characters[index].normalize('NFKC').toLowerCase()
        .replace(/[\s\-'’​-‍﻿]/g, '');
      rawLength += characters[index].length;
      index++;
    }
    for (const romajiCharacter of chunk) {
      text += romajiCharacter;
      rawEnd.push(rawLength);
    }
    if (!chunk && startLength !== rawLength && rawEnd.length) {
      // Ignored characters (spaces) belong to what was typed before them
      rawEnd[rawEnd.length - 1] = rawLength;
    }
  }
  return { text, rawEnd };
}

// Compares a typed answer with the accepted spellings of an answer's words
function matchWords(typed, spellings) {
  const memo = new Map();
  const better = (a, b) => {
    if (!b) return a;
    if (a.onTrack !== b.onTrack) return a.onTrack ? a : b;
    if (a.complete !== b.complete) return a.complete ? a : b;
    if (a.matched !== b.matched) return a.matched > b.matched ? a : b;
    return a.wordsDone >= b.wordsDone ? a : b;
  };
  const walk = (position, wordIndex) => {
    const key = position * 1000 + wordIndex;
    if (memo.has(key)) return memo.get(key);
    let best;
    if (position === typed.length) {
      best = { onTrack: true, complete: wordIndex === spellings.length, matched: position, wordsDone: wordIndex };
    } else if (wordIndex === spellings.length) {
      best = { onTrack: false, complete: false, matched: position, wordsDone: wordIndex };
    } else {
      const rest = typed.slice(position);
      for (const spelling of spellings[wordIndex]) {
        let result;
        if (rest.startsWith(spelling)) {
          result = walk(position + spelling.length, wordIndex + 1);
        } else if (spelling.startsWith(rest)) {
          result = { onTrack: true, complete: false, matched: typed.length, wordsDone: wordIndex };
        } else {
          let common = 0;
          while (common < rest.length && rest[common] === spelling[common]) common++;
          result = { onTrack: false, complete: false, matched: position + common, wordsDone: wordIndex };
        }
        best = better(result, best);
      }
    }
    memo.set(key, best);
    return best;
  };
  return walk(0, 0);
}

// Builds the checker of one sentence ({ jp_character, romanji, particles, furigana })
export function createSentenceMatcher(sentence) {
  const answers = (Array.isArray(sentence.romanji) ? sentence.romanji : [sentence.romanji])
    .filter(Boolean)
    .map(romaji => answerWords(sentence, romaji));
  const main = answers[0];

  return {
    // Words of the main answer, lined up with the sentence (null if they can't be)
    words: main ? main.words : [],
    segments: main ? main.segments : null,

    // { correct, onTrack, wordsDone, validLength }
    //  - correct: the whole sentence is typed
    //  - onTrack: what is typed so far can still become the sentence
    //  - wordsDone: words of the main answer that are completely typed
    //  - validLength: length of the raw typed text that is right, the rest is
    //    where the first mistake is
    check(raw) {
      const { text, rawEnd } = normalizeTypedAnswer(raw);
      let best = null;
      for (const answer of answers) {
        const result = matchWords(text, answer.spellings);
        if (!best ||
          (result.onTrack && !best.onTrack) ||
          (result.onTrack === best.onTrack && result.complete && !best.complete) ||
          (result.onTrack === best.onTrack && result.complete === best.complete && result.matched > best.matched)) {
          best = result;
        }
      }
      if (!best) return { correct: false, onTrack: false, wordsDone: 0, validLength: 0 };
      const validLength = best.onTrack
        ? String(raw ?? '').length
        : (best.matched > 0 ? rawEnd[best.matched - 1] : 0);
      return {
        correct: best.onTrack && best.complete,
        onTrack: best.onTrack,
        wordsDone: best.wordsDone,
        validLength,
      };
    },
  };
}

// Builds one question of the sentence practice for the chosen exercise:
//  - type / listen: the whole sentence is typed
//  - particle: one particle is hidden and only that particle is typed;
//    blank = { start, end, text } (characters of the hidden particle)
//  - arrange: the words are shown shuffled and the sentence is typed in the
//    right order; order = word indices in the order they are shown
// Falls back to "type" when the sentence can't be used for the exercise.
export function createSentenceQuestion(sentence, exercise = 'type', random = Math.random) {
  const matcher = createSentenceMatcher(sentence);
  const segments = matcher.segments;

  if (exercise === 'particle' && segments) {
    const characters = [...sentence.jp_character];
    const particles = sentence.particles || [];
    const candidates = segments
      .map(({ start, end }, index) => {
        let textEnd = end;
        while (textEnd > start && PUNCTUATION.test(characters[textEnd - 1])) textEnd--;
        return { start, end: textEnd, word: matcher.words[index] };
      })
      .filter(({ start, end }) => end > start &&
        Array.from({ length: end - start }, (_, offset) => start + offset).every(index => particles.includes(index)));
    if (candidates.length) {
      const blank = candidates[Math.floor(random() * candidates.length)];
      const text = characters.slice(blank.start, blank.end).join('');
      return {
        exercise,
        blank: { start: blank.start, end: blank.end, text },
        matcher: createSentenceMatcher({
          jp_character: text,
          romanji: [blank.word],
          particles: [...text].map((_, index) => index),
        }),
      };
    }
  }

  if (exercise === 'arrange' && segments && segments.length > 1) {
    const order = segments.map((_, index) => index);
    // Shuffle until the words are out of order (always possible with 2+ words)
    do {
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    } while (order.every((wordIndex, index) => wordIndex === index));
    return { exercise, order, matcher };
  }

  if (exercise === 'listen') return { exercise, matcher };
  return { exercise: 'type', matcher };
}

/* Spoken answers (the mic button of the sentence practice).
 *
 * The recognizer returns Japanese text (kanji and kana), so a spoken answer
 * is judged as it sounds instead of as romaji: the sentence said as it is
 * written, and the sentence read with its furigana, are both accepted.
 */

// The reading of every kanji of the sentence, as kana (水 -> みず)
function furiganaReadings(sentence) {
  const furigana = sentence.furigana || {};
  const readings = {};
  [...sentence.jp_character].forEach((character, index) => {
    if (furigana[index] && !readings[character]) readings[character] = furigana[index];
  });
  return readings;
}

// The reading of a kanji the sentence does not use, as kana: the kun'yomi of
// the dictionary (the reading a sentence usually uses), otherwise the on'yomi
function dictionaryReading(character) {
  const readings = kanjiReadings[character];
  const reading = readings?.kunyomi?.[0] || readings?.onyomi?.[0];
  return reading ? toHiragana(reading) : '';
}

// Sounds the recognizer may write in more than one way: the particles は, へ
// and を are often written as they are spoken
const SOUND_ALIKE = { 'は': ['わ'], 'わ': ['は'], 'へ': ['え'], 'え': ['へ'], 'を': ['お'], 'お': ['を'] };

// The speech as a list of units: one kana each (katakana becomes hiragana,
// punctuation is dropped, a space is kept and marks where the speech paused).
// A run of kanji the sentence or the dictionary can read is already its kana
// (水 -> み, ず); a run nothing can read stays a run of kanji.
function speechUnits(sentence, transcript) {
  const readings = furiganaReadings(sentence);
  const text = toHiragana(String(transcript ?? '')).replace(/[、。！？!?・,.]/g, '');
  const units = [];
  let run = '';
  const flush = () => {
    if (!run) return;
    const kana = [...run].map(character => readings[character] || dictionaryReading(character));
    if (kana.every(Boolean)) kana.forEach(reading => [...reading].forEach(character => units.push(character)));
    else units.push({ kanji: run });
    run = '';
  };
  for (const character of text) {
    if (/[\u3400-\u9fff]/.test(character)) run += character;
    else {
      flush();
      units.push(character);
    }
  }
  flush();
  return units;
}

// What the speech covers of the sentence: how much of the reading of the
// sentence the speech follows from its start, kana by kana (particles heard
// as they sound, は as わ), and which units were used. A run of kanji that
// cannot be read still covers the reading of the word of the sentence the
// kana around it line up with - the recognizer may write 公園 for こうえん -
// the run picks the length that reaches as far as the rest of the speech fits.
function speechCoverage(sentence, transcript) {
  const characterKana = characterReadings(sentence);
  const reading = toHiragana(characterKana.join(''));
  const offsets = [0];
  for (const value of characterKana) offsets.push(offsets[offsets.length - 1] + value.length);
  const words = String(Array.isArray(sentence.romanji) ? sentence.romanji[0] : sentence.romanji ?? '')
    .split(/\s+/).filter(Boolean);
  const segments = words.length ? alignWords(sentence, words) : null;
  // A run of kanji covers the reading up to the end of the word it sits in
  const endOfWord = (position) => {
    if (segments) {
      for (const { start, end } of segments) {
        if (offsets[start] <= position && position < offsets[end]) return offsets[end];
      }
    }
    return reading.length;
  };

  const units = speechUnits(sentence, transcript);
  const seen = new Set(['0:0']);
  const pending = [[0, 0]];
  let used = 0;
  let matched = 0;
  while (pending.length) {
    const [unit, position] = pending.pop();
    if (position > matched || (position === matched && unit > used)) {
      matched = position;
      used = unit;
    }
    if (unit >= units.length) continue;
    const push = (nextUnit, nextPosition) => {
      const key = nextUnit + ':' + nextPosition;
      if (!seen.has(key)) {
        seen.add(key);
        pending.push([nextUnit, nextPosition]);
      }
    };
    const value = units[unit];
    if (typeof value !== 'string') {
      const end = endOfWord(position);
      for (let length = value.kanji.length; position + length <= end; length++) push(unit + 1, position + length);
    } else if (value === ' ') {
      push(unit + 1, position);
    } else {
      const target = reading[position];
      if (target !== undefined && (value === target || (SOUND_ALIKE[target] || []).includes(value))) {
        push(unit + 1, position + 1);
      }
    }
  }
  return { matched, used, units, reading, words, segments, offsets };
}

// Whether one spoken transcript is the sentence: all of the sentence was said
// (particles as they sound), with nothing else heard around it
export function matchesSpokenAnswer(sentence, transcript) {
  const { matched, used, units, reading } = speechCoverage(sentence, transcript);
  return units.length > 0 && matched === reading.length && used === units.length;
}

// Whether one spoken transcript could still become the sentence: everything
// heard so far fits the beginning of the sentence. Speech that no longer fits
// was mispronounced.
export function isSpokenAnswerPrefix(sentence, transcript) {
  const { used, units } = speechCoverage(sentence, transcript);
  return units.length > 0 && used === units.length;
}

// The spoken transcript as romaji, so a sentence the recognizer did not get
// right can still be corrected by hand. The words of the sentence the speech
// follows are written the way the answer is stored, separated by spaces
// ("kore wa mizu desu"); everything else is turned into romaji as it was
// heard. Kanji that cannot be read are left out: the preview is romaji only.
export function transcriptToRomaji(sentence, transcript) {
  const { matched, used, units, reading, words, segments, offsets } = speechCoverage(sentence, transcript);
  const pieces = [];
  let covered = 0;
  if (segments) {
    for (let index = 0; index < words.length && covered < matched; index++) {
      const { start, end } = segments[index];
      const wordKana = reading.slice(offsets[start], offsets[end]);
      if (covered + wordKana.length <= matched) {
        pieces.push(words[index]);
        covered += wordKana.length;
      } else {
        pieces.push(toRomaji(wordKana.slice(0, matched - covered)).replace(/'/g, ''));
        covered = matched;
      }
    }
  }
  // Everything heard beyond the sentence, romaji as it was heard
  const rest = units.slice(used).filter(unit => typeof unit === 'string').join('');
  if (rest) pieces.push(toRomaji(rest).replace(/'/g, ''));
  return pieces.filter(piece => piece !== '')
    .join(' ').replace(/[\u3400-\u9fff]/g, '').replace(/\s+/g, ' ').trim();
}
