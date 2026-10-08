// Kana the user mixes up: when ツ is shown and the answer is "shi", ツ was taken for シ.
// Stored as { shown: { answeredAs: { count, last } } }, apart from userStats
const STORAGE_KEY = 'kanaConfusions';

export function readConfusions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  } catch (error) {
    return {};
  }
}

export function recordConfusion(shown, answeredAs, now = Date.now()) {
  if (!shown || !answeredAs || shown === answeredAs) return;
  const confusions = readConfusions();
  const byShown = confusions[shown] || (confusions[shown] = {});
  const entry = byShown[answeredAs] || (byShown[answeredAs] = { count: 0, last: 0 });
  entry.count++;
  entry.last = now;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(confusions));
}

function getScript(character) {
  if (/^[぀-ゟ]/.test(character)) return 'hiragana';
  if (/^[゠-ヿ]/.test(character)) return 'katakana';
  return null;
}

// The kana among `candidates` that `answer` (normalized romaji) belongs to, other than `shown`.
// Prefers the script of `shown`, so "shi" for ツ means シ rather than し
export function findKanaForAnswer(candidates, answer, shown) {
  const matches = candidates.filter(candidate =>
    candidate.type === 'kana' &&
    candidate.jp_character !== shown &&
    (Array.isArray(candidate.romanji) ? candidate.romanji : [candidate.romanji]).includes(answer)
  );
  const sameScript = matches.find(candidate => getScript(candidate.jp_character) === getScript(shown));
  return (sameScript || matches[0])?.jp_character || null;
}

// Mix-ups in both directions added together, most frequent first
export function getConfusionPairs(confusions, limit = 8) {
  const pairs = {};
  for (const [shown, answers] of Object.entries(confusions || {})) {
    for (const [answeredAs, entry] of Object.entries(answers || {})) {
      const [first, second] = [shown, answeredAs].sort();
      const key = first + second;
      const pair = pairs[key] || (pairs[key] = { characters: [first, second], count: 0, last: 0 });
      pair.count += entry.count || 0;
      pair.last = Math.max(pair.last, entry.last || 0);
    }
  }
  return Object.values(pairs)
    .filter(pair => pair.count > 0)
    .sort((a, b) => b.count - a.count || b.last - a.last)
    .slice(0, limit);
}
