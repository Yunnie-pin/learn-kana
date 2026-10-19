import React, { useMemo } from 'react';
import { toHiragana } from 'wanakana';
import { kanjiReadings } from '../../kanjiReadings.js';
import { readingsUsedInWord } from '../../kanjiWordReadings.js';
import { useLanguage } from '../../i18n';
import { kanjiEntryByCharacter, kanjiOfWord } from '../../game/kanjiEntries.js';

// How the game shows the kanji of a question: the readings of a kanji once it
// is answered, and for a kanji word (水曜日) each of its kanji, with the
// readings the word uses marked.

// The on'yomi and kun'yomi of a kanji in hiragana. `used` (from
// readingsUsedInWord) marks the ones the shown word reads it with.
export function KanjiReadingLines({ readings, used }) {
  const { t } = useLanguage();
  return ['on', 'kun'].map(type => {
    const list = type === 'on' ? readings.onyomi : readings.kunyomi;
    return (
      <span key={type}>
        <span className='kanji-answer-reading-label'>{t(type === 'on' ? 'kanjiOnShort' : 'kanjiKuShort')}</span>
        {list.length === 0 ? '—' : list.map((reading, index) => (
          <React.Fragment key={reading}>
            {index > 0 && ' ・ '}
            {used && used[type].has(reading)
              ? <strong className='kanji-reading-used'>{toHiragana(reading)}</strong>
              : toHiragana(reading)}
          </React.Fragment>
        ))}
      </span>
    );
  });
}

// The readings beside a kanji of a usage question (人 of 人口), one column
// for the on'yomi and one for the kun'yomi
export function KanjiReadingColumns({ readings }) {
  const { t } = useLanguage();
  return (
    <span className='kanji-reading-question-columns'>
      {[['on', readings.onyomi], ['kun', readings.kunyomi]].map(([type, list]) => (
        <span key={type} className='kanji-reading-question-column'>
          <span className='kanji-reading-question-label'>{t(type === 'on' ? 'kanjiOnShort' : 'kanjiKuShort')}</span>
          {list.length === 0
            ? <span>—</span>
            : list.map((reading, index) => <span key={`${type}-${index}`}>{toHiragana(reading)}</span>)}
        </span>
      ))}
    </span>
  );
}

// A kanji question, answered: its readings
export function KanjiAnswerReadings({ character }) {
  const readings = kanjiReadings[character];
  if (!readings) return null;
  return (
    <span className='kanji-answer-readings'>
      <KanjiReadingLines readings={readings} />
    </span>
  );
}

function useReadingsUsed(word, romanji) {
  return useMemo(() => (romanji ? readingsUsedInWord(word, romanji) : null), [word, romanji]);
}

// A kanji word, answered: the readings of each of its kanji
export function KanjiWordReadings({ word, romanji }) {
  const { t } = useLanguage();
  const used = useReadingsUsed(word, romanji);
  const characters = [...new Set([...word])].filter(character => kanjiReadings[character]);
  if (characters.length === 0) return null;
  return (
    <span className='kanji-word-readings'>
      {characters.map(character => (
        <span key={character} className='kanji-answer-readings kanji-word-reading'>
          <span className='kanji-word-reading-character'>{character}</span>
          <KanjiReadingLines readings={kanjiReadings[character]} used={used?.get(character)} />
        </span>
      ))}
      {!used && <span className='kanji-word-special-reading'>{t('kanjiSpecialReading')}</span>}
    </span>
  );
}

// The help on a kanji word: the meaning of each of its kanji, and with
// showReadings their readings too (the steps are hintSteps, game/questions.js)
export function KanjiWordHint({ word, romanji, showReadings }) {
  const { t, language } = useLanguage();
  const used = useReadingsUsed(word, romanji);
  const characters = kanjiOfWord(word);
  if (characters.length === 0) return null;
  return (
    <span className='kanji-word-readings kanji-word-hint'>
      {characters.map(character => {
        const entry = kanjiEntryByCharacter.get(character);
        const readings = kanjiReadings[character];
        return (
          <span key={character} className='kanji-answer-readings kanji-word-reading'>
            <span className='kanji-word-hint-head'>
              <span className='kanji-word-reading-character'>{character}</span>
              <span className='kanji-word-hint-meaning'>{language === 'id' && entry.meaning_id ? entry.meaning_id : entry.meaning}</span>
            </span>
            {readings && showReadings && (
              <span className='kanji-word-hint-readings'>
                <KanjiReadingLines readings={readings} used={used?.get(character)} />
              </span>
            )}
          </span>
        );
      })}
      {showReadings && !used && (
        <span className='kanji-word-special-reading'>{t('kanjiSpecialReading')}</span>
      )}
    </span>
  );
}
