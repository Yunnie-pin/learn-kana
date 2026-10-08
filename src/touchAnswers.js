const VOWELS = ['a', 'i', 'u', 'e', 'o'];
// How many of the wrong options may be look-alikes, the rest stay random
const MAX_SIMILAR_OPTIONS = 2;

function readingsOf(item) {
  return Array.isArray(item?.romanji) ? item.romanji : [item?.romanji || ''];
}

function shuffle(array, random) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// The romaji shown on the multiple choice buttons for `picked`.
// Wrong options are kana it gets mixed up with (`similar`, in order of priority) when they are
// in `pool`, then random ones. Options never repeat the text of a right answer or of each other.
// When the options are one kana per vowel they are ordered a i u e o, like the rows of the kana table.
export function chooseTouchOptions(picked, pool, similar = [], count = 5, random = Math.random) {
  const rightAnswers = readingsOf(picked);
  const options = [{ text: rightAnswers[0], vocal: picked.vocal }];
  const usedTexts = new Set(rightAnswers);

  const addOption = (item) => {
    const text = readingsOf(item)[0];
    if (!text || usedTexts.has(text)) return false;
    usedTexts.add(text);
    options.push({ text, vocal: item.vocal });
    return true;
  };

  const others = pool.filter(item => item && item.jp_character !== picked.jp_character);

  let similarAdded = 0;
  for (const character of similar) {
    if (similarAdded >= MAX_SIMILAR_OPTIONS || options.length >= count) break;
    const item = others.find(other => other.jp_character === character);
    if (item && addOption(item)) similarAdded++;
  }

  // Random fill, preferring vowels not used yet so the a i u e o layout stays possible
  const usedVowels = () => new Set(options.map(option => option.vocal));
  const shuffled = shuffle(others, random);
  for (const item of shuffled) {
    if (options.length >= count) break;
    if (picked.vocal && VOWELS.includes(picked.vocal) && usedVowels().has(item.vocal)) continue;
    addOption(item);
  }
  for (const item of shuffled) {
    if (options.length >= count) break;
    addOption(item);
  }

  const vowelLayout = options.length === count &&
    options.every(option => VOWELS.includes(option.vocal)) &&
    usedVowels().size === options.length;
  const ordered = vowelLayout
    ? [...options].sort((a, b) => VOWELS.indexOf(a.vocal) - VOWELS.indexOf(b.vocal))
    : shuffle(options, random);

  // Too few different answers to fill every button: repeat wrong options, like before
  const texts = ordered.map(option => option.text);
  const wrongTexts = texts.filter(text => !rightAnswers.includes(text));
  while (texts.length < count) {
    texts.push(wrongTexts.length ? wrongTexts[Math.floor(random() * wrongTexts.length)] : rightAnswers[0]);
  }
  return texts;
}
