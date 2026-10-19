import { toRomaji } from 'wanakana';
import { kanjiReadings } from './kanjiReadings.js';

// Which reading of each kanji a word uses: 水曜日 (suiyoubi) reads 水 as sui
// (on'yomi), 曜 as you and 日 as hi (voiced to bi). The romaji of the word is
// split over its kanji and kana, trying for every kanji its readings with the
// sound changes of compounds: voicing (rendaku, hi → bi), a doubled consonant
// (gaku → gak-kou) and okurigana left out of a kun'yomi (manabu → mana-bu).
// Words read as a whole (今日 kyou, 大人 otona) match nothing.

const letters = text => text.toLowerCase().replace(/[^a-z]/g, '');

const VOICED = [['sh', 'j'], ['ch', 'j'], ['ts', 'z'], ['k', 'g'], ['s', 'z'], ['t', 'd'], ['h', 'b'], ['h', 'p'], ['f', 'b'], ['f', 'p']];
const LAST_SYLLABLE = /(tsu|chi|ku|ki)$/;

// The spellings the readings of a kanji can take inside a word: first the
// readings as they are, then voiced, then the kun'yomi without okurigana
// (written in kana after the kanji), longest first
function spellingsOf(readings) {
  const whole = readings.map(({ reading, type }) => ({ reading, type, spelling: letters(reading) }));
  const voiced = whole.flatMap(form => VOICED
    .filter(([from]) => form.spelling.startsWith(from))
    .map(([from, to]) => ({ ...form, spelling: to + form.spelling.slice(from.length) })));
  const stems = [...whole, ...voiced]
    .filter(form => form.type === 'kun')
    .flatMap(form => [...Array(form.spelling.length - 1)].map((_, index) => ({ ...form, spelling: form.spelling.slice(0, index + 1) })))
    .sort((a, b) => b.spelling.length - a.spelling.length);
  return [...whole, ...voiced, ...stems];
}

// Splits the romaji over the characters; null when it cannot be split
function split(characters, target) {
  const memo = new Map();
  function from(index, position) {
    if (index === characters.length) return position === target.length ? [] : null;
    const key = `${index}:${position}`;
    if (memo.has(key)) return memo.get(key);
    let result = null;
    const part = characters[index];
    if (part.readings) {
      for (const { reading, type, spelling } of part.spellings) {
        const candidates = [spelling];
        // A doubled consonant replaces the last syllable: gaku + kou = gakkou
        const stem = spelling.replace(LAST_SYLLABLE, '');
        const doubled = target[position + stem.length];
        if (stem !== spelling && stem && doubled && !'aeioun'.includes(doubled) && target[position + stem.length + 1] === doubled) {
          candidates.push(stem + doubled);
        }
        for (const candidate of candidates) {
          if (!target.startsWith(candidate, position)) continue;
          const rest = from(index + 1, position + candidate.length);
          if (rest) {
            result = [{ reading, type }, ...rest];
            break;
          }
        }
        if (result) break;
      }
    } else if (target.startsWith(part.romaji, position)) {
      let end = position + part.romaji.length;
      // っ before a kanji doubles the consonant its reading starts with
      if (part.sokuon) {
        const doubled = target[end];
        end = doubled && !'aeioun'.includes(doubled) && target[end + 1] === doubled ? end + 1 : -1;
      }
      const rest = end >= 0 && from(index + 1, end);
      if (rest) result = [null, ...rest];
    }
    memo.set(key, result);
    return result;
  }
  return from(0, 0);
}

// For every kanji of the word, the readings it uses there, as a Map of
// character → { on: Set, kun: Set }; null when the word is read as a whole
export function readingsUsedInWord(word, romanji) {
  const characters = [];
  for (const character of [...word]) {
    // 々 repeats the kanji before it (人々 hitobito)
    const kanji = character === '々' && characters.length ? characters[characters.length - 1].kanji : character;
    const readings = kanjiReadings[kanji];
    if (readings) {
      characters.push({
        kanji,
        readings: [
          ...readings.onyomi.map(reading => ({ reading, type: 'on' })),
          ...readings.kunyomi.map(reading => ({ reading, type: 'kun' })),
        ],
      });
    } else {
      // Kana between the kanji stay as they are, read together (きょう, って)
      const previous = characters[characters.length - 1];
      if (previous && !previous.readings) previous.kana += character;
      else characters.push({ kana: character });
    }
  }
  for (const part of characters) {
    if (part.readings) part.spellings = spellingsOf(part.readings);
    else if (part.kana.endsWith('っ')) {
      part.sokuon = true;
      part.romaji = letters(toRomaji(part.kana.slice(0, -1)));
    } else part.romaji = letters(toRomaji(part.kana));
  }
  const answers = Array.isArray(romanji) ? romanji : [romanji];
  for (const answer of answers) {
    const parts = split(characters, letters(answer));
    if (!parts) continue;
    const used = new Map();
    parts.forEach((match, index) => {
      if (!match) return;
      const { kanji } = characters[index];
      if (!used.has(kanji)) used.set(kanji, { on: new Set(), kun: new Set() });
      used.get(kanji)[match.type].add(match.reading);
    });
    return used;
  }
  return null;
}
