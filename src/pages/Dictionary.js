import React, { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import { useLanguage } from '../i18n';
import { isSpeechSupported, speak } from '../speech';
import { ROUTES } from '../routes';
import { calculateMastery } from '../mastery';
import { getKanjiSrsProgress, getKanjiSrsStage } from '../kanjiSrs';
import {
  getExampleSentences,
  getKanaTable,
  getKanjiEntry,
  getWordTopics,
  kunyomiKana,
  onyomiKana,
  searchDictionary,
  topicLabel,
} from '../dictionary';

// Entries shown at first, and added by each "Show more"
const PAGE_SIZE = 60;
// "Practice these" takes the first results, up to this many
export const PRACTICE_LIMIT = 50;
// Below this mastery an entry "needs practice" (same line as the Learning Progress)
const WEAK_MASTERY = 80;
// The search and filters, kept while the user is on the Games tab or in a game
const SEARCH_KEY = 'dictionary-search';

const TYPES = [
  { value: 'all', label: 'dictionaryAll' },
  { value: 'kana', label: 'dictionaryKana' },
  { value: 'kanji', label: 'dictionaryKanji' },
  { value: 'word', label: 'dictionaryWords' },
];
const LEVELS = ['all', 'N5', 'N4'];
const SRS_STAGE_LABELS = {
  learning: 'srsStageLearning',
  young: 'srsStageYoung',
  mature: 'srsStageMature',
};

const DEFAULT_SEARCH = { query: '', type: 'all', level: 'all', topic: 'all', weakOnly: false };

function readSearch() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SEARCH_KEY)) || {};
    return {
      query: typeof saved.query === 'string' ? saved.query : '',
      type: TYPES.some(option => option.value === saved.type) ? saved.type : 'all',
      level: LEVELS.includes(saved.level) ? saved.level : 'all',
      topic: saved.topic === 'all' || getWordTopics().includes(saved.topic) ? saved.topic : 'all',
      weakOnly: saved.weakOnly === true,
    };
  } catch (error) {
    return DEFAULT_SEARCH;
  }
}

function readUserStats() {
  try {
    return JSON.parse(localStorage.getItem('userStats')) || {};
  } catch (error) {
    return {};
  }
}

// A game with these entries, whatever groups are picked in the menu
// (see isDictionaryPractice in InGameCharacterShowAndInput)
function usePractice() {
  const navigate = useNavigate();
  return (entries) => navigate(ROUTES.game, {
    state: { characters: entries.map(entry => entry.jp), anyGroup: true },
  });
}

// The text with each kanji the app teaches as a link to its entry
function WithKanjiLinks({ text, onLookUp }) {
  const { t } = useLanguage();
  return [...text].map((character, index) => getKanjiEntry(character) ? (
    <button
      key={index}
      type='button'
      className='dictionary-kanji-link'
      onClick={() => onLookUp(character)}
      title={t('dictionaryLookUp', { kanji: character })}
    >
      {character}
    </button>
  ) : character);
}

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

// How well the user knows it: the mastery bar, and the review stage of a kanji
function Progress({ mastery, srsStage }) {
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

function DictionaryEntry({ entry, mastery, srsStage, onPractice, onLookUp }) {
  const { language, t, meaningOf: sentenceMeaning } = useLanguage();
  const meaningOf = (english, indonesian) => (language === 'id' && indonesian) || english;
  const kind = entry.type === 'kana'
    ? t(entry.script === 'hiragana' ? 'dictionaryHiragana' : 'dictionaryKatakana')
    : entry.type === 'kanji' ? `${t('dictionaryKanji')} ${entry.level}` : t('dictionaryWord');
  const examples = getExampleSentences(entry);

  return (
    <li className={`dictionary-entry dictionary-entry-${entry.type}`}>
      <div className='dictionary-entry-character' lang='ja'>
        {entry.type === 'word' ? <WithKanjiLinks text={entry.jp} onLookUp={onLookUp} /> : entry.jp}
      </div>
      <div className='dictionary-entry-body'>
        <div className='dictionary-entry-head'>
          <span className='dictionary-entry-kind'>{kind}</span>
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
              className='dictionary-entry-button'
              onClick={() => onPractice([entry])}
              aria-label={`${t('dictionaryPractice')}: ${entry.jp}`}
              title={t('dictionaryPractice')}
            >
              <Icon name='play' />
            </button>
          </span>
        </div>
        {entry.reading && <div className='dictionary-entry-reading-kana' lang='ja'>{entry.reading}</div>}
        <div className='dictionary-entry-romaji'>{entry.romaji.join(' · ')}</div>
        {entry.meaning && <div className='dictionary-entry-meaning'>{meaningOf(entry.meaning, entry.meaningId)}</div>}
        {entry.type === 'kanji' && (
          <>
            <Readings label={t('kanjiOnShort')} readings={entry.onyomi} toKana={onyomiKana} />
            <Readings label={t('kanjiKuShort')} readings={entry.kunyomi} toKana={kunyomiKana} />
            {entry.usage && (
              <div className='dictionary-entry-usage'>
                <span className='dictionary-entry-label'>{t('dictionaryExample')}</span>
                <span lang='ja'><WithKanjiLinks text={entry.usage.word} onLookUp={onLookUp} /></span>{' '}
                <span className='dictionary-entry-romaji'>{entry.usage.romanji}</span>{' – '}
                {meaningOf(entry.usage.meaning, entry.usage.meaning_id)}
              </div>
            )}
          </>
        )}
        {examples.length > 0 && (
          <ul className='dictionary-entry-sentences' aria-label={t('dictionarySentences')}>
            {examples.map(sentence => (
              <li key={sentence.jp_character}>
                <span lang='ja'>{sentence.jp_character}</span>
                <span className='dictionary-entry-sentence-meaning'>{sentenceMeaning(sentence.jp_character, sentence.meaning)}</span>
              </li>
            ))}
          </ul>
        )}
        <Progress mastery={mastery} srsStage={srsStage} />
      </div>
    </li>
  );
}

// Hiragana and katakana in the order of the gojūon table; a tap looks the kana up
function KanaTables({ masteryOf, onLookUp }) {
  const { t } = useLanguage();
  return (
    <div className='dictionary-kana-tables'>
      {['hiragana', 'katakana'].map(script => (
        <section key={script} className='dictionary-kana-table' aria-label={t(script === 'hiragana' ? 'dictionaryHiragana' : 'dictionaryKatakana')}>
          <h2>{t(script === 'hiragana' ? 'dictionaryHiragana' : 'dictionaryKatakana')}</h2>
          <div className='dictionary-kana-grid'>
            {getKanaTable(script).flatMap(({ row, cells }) => cells.map((entry, index) => {
              if (!entry) return <span key={`${row}-${index}`} className='dictionary-kana-cell is-empty' />;
              const mastery = masteryOf(entry);
              return (
                <button
                  key={entry.id}
                  type='button'
                  className={'dictionary-kana-cell' + (mastery !== null && mastery < WEAK_MASTERY ? ' is-weak' : '')}
                  onClick={() => onLookUp(entry.jp)}
                  aria-label={`${entry.jp} ${entry.romaji[0]}`}
                >
                  <span className='dictionary-kana-cell-character' lang='ja'>{entry.jp}</span>
                  <span className='dictionary-kana-cell-romaji'>{entry.romaji[0]}</span>
                  {mastery !== null && <span className='dictionary-mastery-bar'><span style={{ width: `${mastery}%` }} /></span>}
                </button>
              );
            }))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Dictionary() {
  const { t } = useLanguage();
  const practice = usePractice();
  const [search, setSearch] = useState(readSearch);
  const { query, type, level, topic, weakOnly } = search;
  const [shown, setShown] = useState(PAGE_SIZE);
  // The input follows every key; the list catches up when the browser has time
  const deferredQuery = useDeferredValue(query);

  // What the user knows, read once when the tab opens
  const userStats = useMemo(readUserStats, []);
  const srsProgress = useMemo(getKanjiSrsProgress, []);
  const masteryOf = (entry) => calculateMastery(userStats[entry.jp], entry.jp);
  const srsStageOf = (entry) => entry.type === 'kanji' ? getKanjiSrsStage(srsProgress[entry.jp]) : null;

  const results = useMemo(() => searchDictionary(deferredQuery, type).filter(entry =>
    (type !== 'kanji' || level === 'all' || entry.level === level) &&
    (type !== 'word' || topic === 'all' || (entry.tags || []).includes(topic)) &&
    (!weakOnly || (calculateMastery(userStats[entry.jp], entry.jp) ?? 100) < WEAK_MASTERY)
  ), [deferredQuery, type, level, topic, weakOnly, userStats]);

  useEffect(() => {
    try {
      sessionStorage.setItem(SEARCH_KEY, JSON.stringify(search));
    } catch (error) { }
  }, [search]);

  const changeSearch = (changes) => {
    setSearch(previous => ({ ...previous, ...changes }));
    setShown(PAGE_SIZE);
  };
  // A kanji or kana tapped in an entry or the table: its entry first
  const lookUp = (text) => {
    changeSearch({ ...DEFAULT_SEARCH, query: text });
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };
  const more = Math.min(PAGE_SIZE, results.length - shown);
  const practiced = results.slice(0, PRACTICE_LIMIT);
  const filtered = deferredQuery.trim() || weakOnly || (type === 'kanji' && level !== 'all') || (type === 'word' && topic !== 'all');
  const showKanaTables = type === 'kana' && !deferredQuery.trim() && !weakOnly;

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
            onChange={(event) => changeSearch({ query: event.target.value })}
            placeholder={t('dictionarySearch')}
            aria-label={t('dictionarySearch')}
            autoComplete='off'
            autoCapitalize='off'
            spellCheck='false'
          />
          {query && (
            <button type='button' className='dictionary-search-clear' onClick={() => changeSearch({ query: '' })} aria-label={t('dictionaryClear')}>
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
                onClick={() => changeSearch({ type: option.value })}
              >
                {t(option.label)}
              </button>
            ))}
          </div>
          <div className='dictionary-subfilters'>
            {type === 'kanji' && (
              <select value={level} onChange={(event) => changeSearch({ level: event.target.value })} aria-label={t('dictionaryLevel')}>
                {LEVELS.map(value => (
                  <option key={value} value={value}>{value === 'all' ? t('dictionaryLevelAll') : `JLPT ${value}`}</option>
                ))}
              </select>
            )}
            {type === 'word' && (
              <select value={topic} onChange={(event) => changeSearch({ topic: event.target.value })} aria-label={t('wordTopicLabel')}>
                <option value='all'>{t('dictionaryTopicAll')}</option>
                {getWordTopics().map(tag => (
                  <option key={tag} value={tag}>{tag === 'it' ? t('wordTopicIt') : topicLabel(tag)}</option>
                ))}
              </select>
            )}
            <label className='dictionary-weak-toggle'>
              <input type='checkbox' checked={weakOnly} onChange={(event) => changeSearch({ weakOnly: event.target.checked })} />
              {t('dictionaryWeakOnly')}
            </label>
          </div>
        </div>
        <div className='dictionary-results-bar'>
          <span className='dictionary-count' aria-live='polite'>{t('dictionaryCount', { count: results.length })}</span>
          {/* Only for a search or a filter: the first 50 of everything is not a useful practice */}
          {filtered && results.length > 0 && (
            <button type='button' className='dictionary-practice' onClick={() => practice(practiced)}>
              <Icon name='play' />
              {t('dictionaryPracticeResults', { count: practiced.length })}
            </button>
          )}
        </div>
        {showKanaTables ? (
          <KanaTables masteryOf={masteryOf} onLookUp={lookUp} />
        ) : results.length === 0 ? (
          <p className='dictionary-empty'>{t(weakOnly ? 'dictionaryEmptyWeak' : 'dictionaryEmpty')}</p>
        ) : (
          <ul className='dictionary-list'>
            {results.slice(0, shown).map(entry => (
              <DictionaryEntry
                key={entry.id}
                entry={entry}
                mastery={masteryOf(entry)}
                srsStage={srsStageOf(entry)}
                onPractice={practice}
                onLookUp={lookUp}
              />
            ))}
          </ul>
        )}
        {!showKanaTables && more > 0 && (
          <button type='button' className='dictionary-more' onClick={() => setShown(count => count + PAGE_SIZE)}>
            {t('dictionaryShowMore', { count: more })}
          </button>
        )}
      </main>
    </>
  );
}
