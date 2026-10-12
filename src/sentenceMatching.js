import { isKana, toRomaji } from 'wanakana';

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
