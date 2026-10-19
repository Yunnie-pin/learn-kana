import React, { useEffect, useRef } from 'react';
import Icon from './Icon';
import { useLanguage } from '../i18n';
import { getExampleSentences, getKanjiOfWord, getWordsWithKanji } from '../dictionary';
import {
  EntryActions,
  EntryHeadword,
  KanjiReadings,
  Progress,
  SentenceList,
  WithKanjiLinks,
  entryKind,
  meaningIn,
  showsReadingLine,
} from './DictionaryEntry';

// Related entries as small buttons that open them in the same window
function RelatedEntries({ title, entries, onOpen }) {
  const { language } = useLanguage();
  if (!entries.length) return null;
  return (
    <section className='dictionary-detail-section'>
      <h3>{title}</h3>
      <div className='dictionary-related'>
        {entries.map(entry => (
          <button key={entry.id} type='button' className='dictionary-related-entry' onClick={() => onOpen(entry)}>
            <span lang='ja'>{entry.jp}</span>
            <span className='dictionary-related-meaning'>{meaningIn(language, entry.meaning, entry.meaningId)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// Everything about one entry: all its readings, more sentences, the words
// with that kanji or the kanji of that word. A sheet from the bottom on
// phones, a window in the middle on larger screens.
export default function DictionaryDetail({ entry, mastery, srsStage, onOpen, onPractice, onClose }) {
  const { language, t } = useLanguage();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, entry]);

  const sentences = getExampleSentences(entry, 5);
  const usage = entry.type === 'kanji' && entry.usage;

  return (
    <div className='dictionary-detail-background' onClick={onClose}>
      <div
        className='dictionary-detail'
        role='dialog'
        aria-modal='true'
        aria-labelledby='dictionary-detail-title'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='dictionary-detail-header'>
          <span className='dictionary-entry-kind'>{entryKind(entry, t)}</span>
          <button type='button' ref={closeButtonRef} className='about-dialog-close' onClick={onClose} aria-label={t('aboutClose')}>
            <Icon name='x' strokeWidth={2.5} />
          </button>
        </div>
        <div className='dictionary-detail-headword' id='dictionary-detail-title' lang='ja'>
          <EntryHeadword entry={entry} />
        </div>
        {entry.meaning && <p className='dictionary-entry-meaning'>{meaningIn(language, entry.meaning, entry.meaningId)}</p>}
        {showsReadingLine(entry) && <div className='dictionary-entry-reading-kana' lang='ja'>{entry.reading}</div>}
        <div className='dictionary-entry-romaji'>{entry.romaji.join(' · ')}</div>
        {entry.type === 'kanji' && <KanjiReadings entry={entry} />}
        {usage && (
          <div className='dictionary-entry-usage'>
            <span className='dictionary-entry-label'>{t('dictionaryExample')}</span>
            <span lang='ja'><WithKanjiLinks text={usage.word} /></span>{' '}
            <span className='dictionary-entry-romaji'>{usage.romanji}</span>{' – '}
            {meaningIn(language, usage.meaning, usage.meaning_id)}
          </div>
        )}
        <Progress mastery={mastery} srsStage={srsStage} />
        <EntryActions entry={entry} onPractice={onPractice} />

        {sentences.length > 0 && (
          <section className='dictionary-detail-section'>
            <h3>{t('dictionarySentences')}</h3>
            <SentenceList sentences={sentences} />
          </section>
        )}
        {entry.type === 'kanji' && (
          <RelatedEntries title={t('dictionaryWordsWith', { kanji: entry.jp })} entries={getWordsWithKanji(entry.jp)} onOpen={onOpen} />
        )}
        {entry.type === 'word' && (
          <RelatedEntries title={t('dictionaryKanjiOfWord')} entries={getKanjiOfWord(entry)} onOpen={onOpen} />
        )}
      </div>
    </div>
  );
}
