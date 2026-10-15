import React from 'react';
import Icon from './Icon';
import { useLanguage } from '../i18n';
import { isSpeechSupported, speak } from '../speech';
import { findMatch, getExampleSentences, getKanjiEntry, isKanji, kunyomiKana, onyomiKana } from '../dictionary';

// Below this mastery an entry "needs practice" (same line as the Learning Progress)
export const WEAK_MASTERY = 80;
const SRS_STAGE_LABELS = {
  learning: 'srsStageLearning',
  young: 'srsStageYoung',
  mature: 'srsStageMature',
};

export const meaningIn = (language, english, indonesian) => (language === 'id' && indonesian) || english;

export function entryKind(entry, t) {
  if (entry.type === 'kana') return t(entry.script === 'hiragana' ? 'dictionaryHiragana' : 'dictionaryKatakana');
  return entry.type === 'kanji' ? `${t('dictionaryKanji')} ${entry.level}` : t('dictionaryWord');
}

// The part of the text the search found, highlighted
export function Highlight({ text, query }) {
  const match = findMatch(text, query);
  if (!match) return text;
  const [start, end] = match;
  return <>{text.slice(0, start)}<mark className='dictionary-match'>{text.slice(start, end)}</mark>{text.slice(end)}</>;
}

// The text with each kanji the app teaches as a link to its entry
export function WithKanjiLinks({ text, onLookUp }) {
  const { t } = useLanguage();
  return [...text].map((character, index) => getKanjiEntry(character) && onLookUp ? (
    <button
      key={index}
      type='button'
      className='dictionary-kanji-link'
      onClick={(event) => {
        event.stopPropagation();
        onLookUp(character);
      }}
      title={t('dictionaryLookUp', { kanji: character })}
    >
      {character}
    </button>
  ) : character);
}

// How a word is written, with its reading above when it has kanji (furigana)
export function EntryHeadword({ entry, onLookUp }) {
  if (entry.type !== 'word') return entry.jp;
  const text = <WithKanjiLinks text={entry.jp} onLookUp={onLookUp} />;
  if (!entry.reading || ![...entry.jp].some(isKanji)) return text;
  return <ruby>{text}<rt>{entry.reading}</rt></ruby>;
}

// A reading line only for kana words read differently from how they are written
export const showsReadingLine = (entry) => Boolean(entry.reading) && ![...entry.jp].some(isKanji);

export function Readings({ label, readings, toKana }) {
  if (!readings.length) return null;
  return (
    <div className='dictionary-entry-readings'>
      <span className='dictionary-entry-label'>{label}</span>
      {readings.map(reading => (
        <span key={reading} className='dictionary-entry-reading'>
          <span lang='ja'>{toKana(reading)}</span> <span className='dictionary-entry-romaji'>{reading}</span>
        </span>
      ))}
    </div>
  );
}

export function KanjiReadings({ entry }) {
  const { t } = useLanguage();
  return (
    <>
      <Readings label={t('kanjiOnShort')} readings={entry.onyomi} toKana={onyomiKana} />
      <Readings label={t('kanjiKuShort')} readings={entry.kunyomi} toKana={kunyomiKana} />
    </>
  );
}

// How well the user knows it: the mastery bar, and the review stage of a kanji
export function Progress({ mastery, srsStage }) {
  const { t } = useLanguage();
  if (mastery === null && !SRS_STAGE_LABELS[srsStage]) return null;
  return (
    <div className='dictionary-entry-progress'>
      {mastery !== null && (
        <span className={'dictionary-mastery' + (mastery < WEAK_MASTERY ? ' is-weak' : '')}>
          <span className='dictionary-mastery-bar'><span style={{ width: `${mastery}%` }} /></span>
          {t('masteryValue', { percent: mastery })}
        </span>
      )}
      {SRS_STAGE_LABELS[srsStage] && <span className='dictionary-srs-stage'>{t(SRS_STAGE_LABELS[srsStage])}</span>}
    </div>
  );
}

export function EntryActions({ entry, onPractice }) {
  const { t } = useLanguage();
  return (
    <span className='dictionary-entry-actions'>
      {isSpeechSupported() && (
        <button
          type='button'
          className='dictionary-entry-button'
          onClick={() => speak(entry.reading || entry.jp)}
          aria-label={`${t('dictionaryListen')}: ${entry.jp}`}
          title={t('dictionaryListen')}
        >
          <Icon name='volume' />
        </button>
      )}
      <button
        type='button'
        className='dictionary-entry-button dictionary-entry-practice'
        onClick={() => onPractice([entry])}
        aria-label={`${t('dictionaryPractice')}: ${entry.jp}`}
      >
        <Icon name='target' />
        <span aria-hidden='true'>{t('dictionaryPractice')}</span>
      </button>
    </span>
  );
}

export function SentenceList({ sentences }) {
  const { t, meaningOf } = useLanguage();
  if (!sentences.length) return null;
  return (
    <ul className='dictionary-entry-sentences' aria-label={t('dictionarySentences')}>
      {sentences.map(sentence => (
        <li key={sentence.jp_character}>
          <span lang='ja'>{sentence.jp_character}</span>
          <span className='dictionary-entry-sentence-meaning'>{meaningOf(sentence.jp_character, sentence.meaning)}</span>
        </li>
      ))}
    </ul>
  );
}

// A card of the results: the essentials, everything else in the details
export function DictionaryEntry({ entry, query, mastery, srsStage, onPractice, onLookUp, onOpen }) {
  const { language, t } = useLanguage();

  return (
    <li className={`dictionary-entry dictionary-entry-${entry.type}`}>
      <div className='dictionary-entry-character' lang='ja'>
        <EntryHeadword entry={entry} onLookUp={onLookUp} />
      </div>
      <div className='dictionary-entry-body'>
        <div className='dictionary-entry-head'>
          <span className='dictionary-entry-kind'>{entryKind(entry, t)}</span>
          <EntryActions entry={entry} onPractice={onPractice} />
        </div>
        {entry.meaning && (
          <div className='dictionary-entry-meaning'>
            <Highlight text={meaningIn(language, entry.meaning, entry.meaningId)} query={query} />
          </div>
        )}
        {showsReadingLine(entry) && <div className='dictionary-entry-reading-kana' lang='ja'><Highlight text={entry.reading} query={query} /></div>}
        <div className='dictionary-entry-romaji'><Highlight text={entry.romaji.join(' · ')} query={query} /></div>
        {entry.type === 'kanji' && <KanjiReadings entry={entry} />}
        <SentenceList sentences={getExampleSentences(entry)} />
        <Progress mastery={mastery} srsStage={srsStage} />
        <button type='button' className='dictionary-entry-details' onClick={() => onOpen(entry)}>
          {t('dictionaryDetails')}
          <Icon name='arrow-right' />
        </button>
      </div>
    </li>
  );
}

// A kana in the results: small, like a cell of the kana table; a tap opens it.
// No highlight: the whole kana is what was found, and a mark crowds the chip.
export function KanaChip({ entry, mastery, onOpen }) {
  return (
    <button
      type='button'
      className={'dictionary-kana-cell dictionary-kana-chip' + (mastery !== null && mastery < WEAK_MASTERY ? ' is-weak' : '')}
      onClick={() => onOpen(entry)}
      aria-label={`${entry.jp} ${entry.romaji[0]}`}
    >
      <span className='dictionary-kana-cell-character' lang='ja'>{entry.jp}</span>
      <span className='dictionary-kana-cell-romaji'>{entry.romaji[0]}</span>
      {mastery !== null && <span className='dictionary-mastery-bar'><span style={{ width: `${mastery}%` }} /></span>}
    </button>
  );
}
