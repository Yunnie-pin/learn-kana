import { sentences } from './sentences.js';
import { bunpouPhraseOf } from './bunpou.js';

/* The Materials ("materi") tab: the Japanese the practice modes use, as
 * lessons instead of questions. Two kinds:
 * - the particles marked in the sentence data (the particle exercise of the
 *   sentences practice asks for them: type the missing は, が, を...), with
 *   the sentences they appear in as examples;
 * - the grammar ("bunpou") the game hides at the end of a sentence: the
 *   copula 〜です and the polite verb forms (〜ます, 〜ました...), explained with
 *   the same notes the game shows once a form is answered (bunpou.js).
 *
 * Nothing is written by hand that the corpus already has: the examples come
 * from sentences.js and the verb form notes are the i18n keys of bunpou.js.
 * Only the particle notes and the copula notes are written here.
 */

// The particles the corpus marks, from the most common one. より is one
// particle written with two kana, both marked in the sentences.
const PARTICLES = [
  { jp: 'は', romaji: 'wa', note: 'materiParticleWa' },
  { jp: 'を', romaji: 'wo', note: 'materiParticleWo' },
  { jp: 'が', romaji: 'ga', note: 'materiParticleGa' },
  { jp: 'に', romaji: 'ni', note: 'materiParticleNi' },
  { jp: 'で', romaji: 'de', note: 'materiParticleDe' },
  { jp: 'か', romaji: 'ka', note: 'materiParticleKa' },
  { jp: 'へ', romaji: 'e', note: 'materiParticleE' },
  { jp: 'の', romaji: 'no', note: 'materiParticleNo' },
  { jp: 'と', romaji: 'to', note: 'materiParticleTo' },
  { jp: 'も', romaji: 'mo', note: 'materiParticleMo' },
  { jp: 'より', romaji: 'yori', note: 'materiParticleYori' },
  { jp: 'ね', romaji: 'ne', note: 'materiParticleNe' },
];

// The grammar lessons: the copula first (the simplest sentences), then the
// polite verb forms in teaching order. `endings` are the romaji endings of
// bunpou.js the examples end with; a lesson with a `copula` takes the です /
// でした sentences no verb form is hidden in.
const BUNPOU_LESSONS = [
  { jp: '〜です', romaji: 'desu', note: 'materiBunpouDesu', copula: 'です' },
  { jp: '〜ます', romaji: 'masu', note: 'bunpouNoteMasu', endings: ['masu'] },
  { jp: '〜ました', romaji: 'mashita', note: 'bunpouNoteMashita', endings: ['mashita'] },
  { jp: '〜ません', romaji: 'masen', note: 'bunpouNoteMasen', endings: ['masen'] },
  { jp: '〜ませんでした', romaji: 'masen deshita', note: 'bunpouNoteMasenDeshita', endings: ['masen deshita'] },
  { jp: '〜でした', romaji: 'deshita', note: 'materiBunpouDeshita', copula: 'でした' },
  { jp: '〜ましょう', romaji: 'mashou', note: 'bunpouNoteMashou', endings: ['mashou'] },
  { jp: '〜たいです', romaji: 'tai desu', note: 'bunpouNoteTai', endings: ['tai desu'] },
  { jp: '〜て/でください', romaji: 'te/de kudasai', note: 'bunpouNoteKudasai', endings: ['te kudasai', 'de kudasai'] },
  { jp: '〜て/でいます', romaji: 'te/de imasu', note: 'bunpouNoteTeImasu', endings: ['te imasu', 'de imasu'] },
];

// Up to `count` sentences, shortest first: a short sentence reads faster (the
// Dictionary picks its examples the same way)
function exampleSentences(candidates, count = 2) {
  return [...candidates]
    .sort((a, b) => a.jp_character.length - b.jp_character.length)
    .slice(0, count);
}

// The sentences a particle is marked in (the corpus marks every particle,
// see sentences.js); より matches the two kana it is written with
function sentencesWithParticle(particle) {
  return sentences.filter(sentence => (sentence.particles || []).some(index =>
    [...sentence.jp_character].slice(index, index + particle.length).join('') === particle));
}

// The sentences whose hidden form ends with the ending
function sentencesWithEnding(ending) {
  return sentences.filter(sentence => {
    const phrase = bunpouPhraseOf(sentence);
    return phrase && phrase.ending === ending;
  });
}

// The です / でした sentences no verb form is hidden in. The question marker
// か can follow the copula (それはなんですか); 〜でした is the past of 〜です and
// has a lesson of its own.
function sentencesWithCopula(copula) {
  return sentences.filter(sentence => {
    if (bunpouPhraseOf(sentence)) return false;
    const ending = sentence.jp_character.replace(/[。！？、か]+$/, '');
    return copula === 'でした'
      ? ending.endsWith('でした')
      : ending.endsWith('です') && !ending.endsWith('でした');
  });
}

// The lessons, built once (the corpus never changes while the app runs)
let particleLessons = null;
export function getParticleLessons() {
  if (!particleLessons) {
    particleLessons = PARTICLES.map(({ jp, romaji, note }) => ({
      jp,
      romaji,
      note,
      examples: exampleSentences(sentencesWithParticle(jp)),
    }));
  }
  return particleLessons;
}

let bunpouLessons = null;
export function getBunpouLessons() {
  if (!bunpouLessons) {
    bunpouLessons = BUNPOU_LESSONS.map(({ jp, romaji, note, endings, copula }) => ({
      jp,
      romaji,
      note,
      endings,
      copula,
      examples: exampleSentences(
        copula ? sentencesWithCopula(copula) : endings.flatMap(sentencesWithEnding)
      ),
    }));
  }
  return bunpouLessons;
}
