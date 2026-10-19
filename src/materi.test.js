import { getBunpouLessons, getParticleLessons } from './materi.js';
import { bunpouPhraseOf } from './bunpou.js';
import { translate } from './i18n.js';

/*
 * The Materials ("materi") tab: the particles and the grammar (bunpou) of
 * the practice, as lessons. Everything is built from the sentence data, so
 * the tests check against the very corpus: every lesson shows sentences
 * that really carry its particle or its form.
 */

// The particle is one of the marked particles of the sentence (より is
// written with two kana, both marked)
const marksParticle = (sentence, particle) => (sentence.particles || []).some(index =>
  [...sentence.jp_character].slice(index, index + particle.length).join('') === particle);

const allLessons = () => [...getParticleLessons(), ...getBunpouLessons()];

describe('the particle lessons', () => {
  test('are the particles the corpus marks, from the most common one', () => {
    expect(getParticleLessons().map(lesson => lesson.jp))
      .toEqual(['は', 'を', 'が', 'に', 'で', 'か', 'へ', 'の', 'と', 'も', 'より', 'ね']);
  });

  test('every lesson has examples that really mark its particle', () => {
    for (const lesson of getParticleLessons()) {
      expect(lesson.examples.length).toBeGreaterThan(0);
      for (const example of lesson.examples) {
        expect(example.jp_character).toContain(lesson.jp);
        expect(marksParticle(example, lesson.jp)).toBe(true);
      }
    }
  });
});

describe('the grammar lessons', () => {
  test('cover the copula and the forms the game hides, in teaching order', () => {
    expect(getBunpouLessons().map(lesson => lesson.jp)).toEqual([
      '〜です', '〜ます', '〜ました', '〜ません', '〜ませんでした', '〜でした',
      '〜ましょう', '〜たいです', '〜て/でください', '〜て/でいます',
    ]);
  });

  test('every lesson has examples that really carry its form', () => {
    for (const lesson of getBunpouLessons()) {
      expect(lesson.examples.length).toBeGreaterThan(0);
      for (const example of lesson.examples) {
        const phrase = bunpouPhraseOf(example);
        if (lesson.endings) {
          expect(phrase).not.toBeNull();
          expect(lesson.endings).toContain(phrase.ending);
        } else {
          // The copula sentences have no verb form to hide
          expect(phrase).toBeNull();
          const ending = example.jp_character.replace(/[。！？、か]+$/, '');
          expect(ending.endsWith(lesson.copula)).toBe(true);
          // 〜でした is the past of 〜です, a lesson of its own
          if (lesson.copula === 'です') expect(ending.endsWith('でした')).toBe(false);
        }
      }
    }
  });
});

describe('the lessons of both sections', () => {
  test('show up to two examples each, shortest first', () => {
    for (const lesson of allLessons()) {
      const lengths = lesson.examples.map(example => example.jp_character.length);
      expect(lengths.length).toBeGreaterThan(0);
      expect(lengths.length).toBeLessThanOrEqual(2);
      expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    }
  });

  test('have their note written in English and Indonesian', () => {
    for (const lesson of allLessons()) {
      // translate falls back to the key itself when a language misses it
      expect(translate('en', lesson.note)).not.toBe(lesson.note);
      expect(translate('id', lesson.note)).not.toBe(lesson.note);
    }
  });
});
