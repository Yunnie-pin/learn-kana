import React, { useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n';
import { isSpeechSupported, speak } from '../speech';
import { kunyomiKana, onyomiKana, searchDictionary } from '../dictionary';

// Entries shown at first, and added by each "Show more"
const PAGE_SIZE = 60;

const TYPES = [
  { value: 'all', label: 'dictionaryAll' },
  { value: 'kana', label: 'dictionaryKana' },
  { value: 'kanji', label: 'dictionaryKanji' },
  { value: 'word', label: 'dictionaryWords' },
];

function Readings({ label, readings, toKana }) {
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

function DictionaryEntry({ entry }) {
  const { language, t } = useLanguage();
  const meaningOf = (english, indonesian) => (language === 'id' && indonesian) || english;
  const kind = entry.type === 'kana'
    ? t(entry.script === 'hiragana' ? 'dictionaryHiragana' : 'dictionaryKatakana')
    : entry.type === 'kanji' ? `${t('dictionaryKanji')} ${entry.level}` : t('dictionaryWord');

  return (
    <li className={`dictionary-entry dictionary-entry-${entry.type}`}>
      <div className='dictionary-entry-character' lang='ja'>{entry.jp}</div>
      <div className='dictionary-entry-body'>
        <div className='dictionary-entry-head'>
          <span className='dictionary-entry-kind'>{kind}</span>
          {isSpeechSupported() && (
            <button
              type='button'
              className='dictionary-entry-listen'
              onClick={() => speak(entry.reading || entry.jp)}
              aria-label={`${t('dictionaryListen')}: ${entry.jp}`}
              title={t('dictionaryListen')}
            >
              <Icon name='volume' />
            </button>
          )}
        </div>
        {entry.reading && <div className='dictionary-entry-kana' lang='ja'>{entry.reading}</div>}
        <div className='dictionary-entry-romaji'>{entry.romaji.join(' · ')}</div>
        {entry.meaning && <div className='dictionary-entry-meaning'>{meaningOf(entry.meaning, entry.meaningId)}</div>}
        {entry.type === 'kanji' && (
          <>
            <Readings label={t('kanjiOnShort')} readings={entry.onyomi} toKana={onyomiKana} />
            <Readings label={t('kanjiKuShort')} readings={entry.kunyomi} toKana={kunyomiKana} />
            {entry.usage && (
              <div className='dictionary-entry-usage'>
                <span className='dictionary-entry-label'>{t('dictionaryExample')}</span>
                <span lang='ja'>{entry.usage.word}</span>{' '}
                <span className='dictionary-entry-romaji'>{entry.usage.romanji}</span>{' – '}
                {meaningOf(entry.usage.meaning, entry.usage.meaning_id)}
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}

export default function Dictionary() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [shown, setShown] = useState(PAGE_SIZE);
  const results = useMemo(() => searchDictionary(query, type), [query, type]);

  const changeQuery = (value) => {
    setQuery(value);
    setShown(PAGE_SIZE);
  };
  const changeType = (value) => {
    setType(value);
    setShown(PAGE_SIZE);
  };
  const more = Math.min(PAGE_SIZE, results.length - shown);

  return (
    <>
      <Navbar />
      <main className='dictionary-page'>
        <h1 id='dictionary-title'>{t('dictionaryTitle')}</h1>
        <div className='dictionary-search'>
          <Icon name='search' className='dictionary-search-icon' />
          <input
            type='search'
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder={t('dictionarySearch')}
            aria-label={t('dictionarySearch')}
            autoComplete='off'
            autoCapitalize='off'
            spellCheck='false'
          />
          {query && (
            <button type='button' className='dictionary-search-clear' onClick={() => changeQuery('')} aria-label={t('dictionaryClear')}>
              <Icon name='x' />
            </button>
          )}
        </div>
        <div className='dictionary-toolbar'>
          <div className='segmented-control dictionary-filter' role='radiogroup' aria-label={t('dictionaryFilter')}>
            {TYPES.map(option => (
              <button
                key={option.value}
                type='button'
                role='radio'
                aria-checked={type === option.value}
                className={'segmented-option' + (type === option.value ? ' active' : '')}
                onClick={() => changeType(option.value)}
              >
                {t(option.label)}
              </button>
            ))}
          </div>
          <span className='dictionary-count' aria-live='polite'>{t('dictionaryCount', { count: results.length })}</span>
        </div>
        {results.length === 0 ? (
          <p className='dictionary-empty'>{t('dictionaryEmpty')}</p>
        ) : (
          <ul className='dictionary-list'>
            {results.slice(0, shown).map(entry => <DictionaryEntry key={entry.id} entry={entry} />)}
          </ul>
        )}
        {more > 0 && (
          <button type='button' className='dictionary-more' onClick={() => setShown(count => count + PAGE_SIZE)}>
            {t('dictionaryShowMore', { count: more })}
          </button>
        )}
      </main>
    </>
  );
}
