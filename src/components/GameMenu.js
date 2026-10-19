import React, { useEffect, useMemo, useRef, useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GAME_MODES, gamePath, ROUTES } from '../routes';
import { getListOfKanjiWords, getWordTopic, wordInTopic } from '../practiceList.js';
import { kanaCharacters } from '../kanaCharacters.js'
import { addExtraNewKanji, getDueReviewCount, getNextReview, getSelectedKanjiGroupTitles, getSrsSession, NEW_KANJI_PER_DAY } from '../kanjiSrs.js'
import { useLanguage } from '../i18n'
import { OPEN_PROGRESS_EVENT } from '../progressNavigation.js'
import Icon from './Icon'
import { readSelectedGroups, writeSelectedGroups } from '../storage.js';

const legacyKanjiGroupSelections = {
  'N5 Basics': ['N5 Time & Days', 'N5 Nature & Environment', 'N5 People & Relationships'],
  'N5 Size': ['N5 Directions & Position', 'N5 People & Relationships'],
  'N5 School': ['N5 Activities & Basic Verbs'],
  'N5 Nature': ['N5 Nature & Environment'],
  'N5 Body': ['N5 People & Relationships'],
  'N5 Actions': ['N5 Activities & Basic Verbs'],
  'N5 Numbers': ['N5 Numbers'],
  'N5 Time': ['N5 Time & Days'],
  'N5 People': ['N5 People & Relationships'],
  'N5 Directions': ['N5 Directions & Position'],
  'N5 Descriptions': ['N5 Numbers', 'N5 Directions & Position', 'N5 Nature & Environment'],
  'N5 Places': ['N5 Nature & Environment', 'N5 Activities & Basic Verbs'],
  'N5 Study': ['N5 Activities & Basic Verbs'],
  'N5 More Actions': ['N5 Activities & Basic Verbs'],
  'N5 Time & Days': ['N5 Time & Days'],
  'N5 Directions & Position': ['N5 Directions & Position'],
  'N5 Nature & Environment': ['N5 Nature & Environment'],
  'N5 People & Relationships': ['N5 People & Relationships'],
  'N5 Activities & Basic Verbs': ['N5 Activities & Basic Verbs'],
  'N4 People & Family': ['N4 Relationships & Society'],
  'N4 Activities & Verbs': ['N4 Daily Verbs'],
  'N4 Study & Communication': ['N4 Daily Verbs'],
  'N4 Places & Travel': ['N4 Buildings & Places'],
  'N4 Daily Life & Nature': ['N4 Buildings & Places', 'N4 Weather, Time & Nature'],
  'N4 Descriptions': ['N4 Qualities & Conditions'],
  'N4 Relationships & Society': ['N4 Relationships & Society'],
  'N4 Daily Verbs': ['N4 Daily Verbs'],
  'N4 Buildings & Places': ['N4 Buildings & Places'],
  'N4 Weather, Time & Nature': ['N4 Weather, Time & Nature'],
  'N4 Qualities & Conditions': ['N4 Qualities & Conditions'],
};

function migrateKanjiGroupSelections() {
  let selectedGroups;
  try {
    selectedGroups = readSelectedGroups();
  } catch (error) {
    return;
  }

  const legacyGroups = Object.keys(legacyKanjiGroupSelections)
    .filter(group => selectedGroups.includes(group));
  if (legacyGroups.length === 0) return;

  const migratedGroups = selectedGroups.filter(group => !legacyKanjiGroupSelections[group]);
  legacyGroups.forEach(group => {
    const themes = legacyKanjiGroupSelections[group];
    Object.values(kanaCharacters.kanji)
      .filter(kanjiGroup => themes.includes(kanjiGroup.themeTitle))
      .forEach(kanjiGroup => {
        if (!migratedGroups.includes(kanjiGroup.title)) migratedGroups.push(kanjiGroup.title);
      });
  });
  writeSelectedGroups(migratedGroups);
}

// How many groups / characters are selected and how many words can be practiced with them
// The sentences are a download of their own (most of the app's data): the
// menu loads them only once a sentence or grammar practice is picked
function useSentenceData(needed) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!needed || data) return;
    let cancelled = false;
    Promise.all([import('../sentences.js'), import('../bunpou.js')]).then(([sentences, bunpou]) => {
      if (!cancelled) setData({ getPracticeSentences: sentences.getPracticeSentences, getBunpouQuestions: bunpou.getBunpouQuestions });
    });
    return () => { cancelled = true; };
  }, [needed, data]);
  return data;
}

// sentenceData: the sentence functions once loaded (null before); the
// sentence and grammar counts are null until then, and only counted for the
// practice picked
function getSelectionSummary(sentenceData, practice) {
  let checkedKanas = [];
  try {
    checkedKanas = readSelectedGroups();
  } catch (e) { }

  let kanaGroupCount = 0;
  let kanjiGroupCount = 0;
  let kanaCount = 0;
  let kanjiCount = 0;
  for (const script of ['hiragana', 'katakana', 'kanji']) {
    for (const group of Object.values(kanaCharacters[script] || {})) {
      if (!checkedKanas.includes(group.title)) continue;
      const characterCount = Object.keys(group.characters).length;
      if (script === 'kanji') {
        kanjiGroupCount++;
        kanjiCount += characterCount;
      } else {
        kanaGroupCount++;
        kanaCount += characterCount;
      }
    }
  }
  // Words readable with the selected groups, in the topic picked in the menu
  const wordTopic = getWordTopic();
  const wordCount = Object.values(kanaCharacters.words).filter(word =>
    wordInTopic(word, wordTopic) &&
    [...word.hiragana_groups, ...word.katakana_groups].every(group => checkedKanas.includes(group))
  ).length +
    // Kanji vocabulary of the selected kanji groups (水曜日, 時間...)
    getListOfKanjiWords(checkedKanas).filter(word => wordInTopic(word, wordTopic)).length;
  // Sentence practice only offers the sentences readable with the selected
  // groups that also match the sentence options (level, pattern, exercise)
  const sentenceCount = practice === 'long' && sentenceData ? sentenceData.getPracticeSentences(checkedKanas).length : null;
  // Grammar practice offers the readable sentences that end with a verb form
  // the practice can hide, minus the ones the menu options leave out
  const bunpouCount = practice === 'bunpou' && sentenceData ? sentenceData.getBunpouQuestions(checkedKanas).length : null;

  return { kanaGroupCount, kanjiGroupCount, kanaCount, kanjiCount, wordCount, sentenceCount, bunpouCount };
}

export default function GameMenu() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  // A game that could not start comes back here with the reason
  const gameError = location.state?.error || null;
  const dismissGameError = () => navigate(location.pathname, { replace: true, state: null });

  // Coming back from a game: scroll to the part of the menu it asked for
  // (e.g. #game-menu-title from "Back to menu" on the summary)
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView?.();
  }, [location.hash]);

  const [showStatsModal, setShowStatsModal] = useState(false);
  // Section to show and highlight when the window is opened from a notification
  const [statsFocusSection, setStatsFocusSection] = useState(null);

  useEffect(() => {
    const openAtSection = (event) => {
      setStatsFocusSection(event.detail?.section || null);
      setShowStatsModal(true);
    };
    window.addEventListener(OPEN_PROGRESS_EVENT, openAtSection);
    return () => window.removeEventListener(OPEN_PROGRESS_EVENT, openAtSection);
  }, []);

  // Opened from a notification on another tab (Dictionary): open it once here
  const openProgress = location.state?.openProgress;
  useEffect(() => {
    if (!openProgress) return;
    setStatsFocusSection(typeof openProgress === 'string' ? openProgress : null);
    setShowStatsModal(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [openProgress, navigate, location.pathname]);
  // On phones only one group is shown at a time (.kana-group-tabs); on larger screens
  // hiragana + katakana share one "Kana" tab next to a "Kanji" tab (.kana-group-tabs-wide)
  const [activeKanaTab, setActiveKanaTab] = useState('hiragana');
  const isKanjiTab = activeKanaTab === 'kanji';
  // Bumped whenever the selection or game mode changes, so the summary below is recomputed
  const [settingsVersion, setSettingsVersion] = useState(0);
  const refreshSummary = () => setSettingsVersion(version => version + 1);

  // On wide screens the mode options scroll above a Start bar that always
  // stays in view (App.css); when options are hidden below, the bar fades
  // the edge to show there is more
  const modeOptionsRef = useRef(null);
  const [modeOptionsMoreBelow, setModeOptionsMoreBelow] = useState(false);
  useEffect(() => {
    const options = modeOptionsRef.current;
    if (!options) return undefined;
    const update = () => {
      setModeOptionsMoreBelow(options.scrollHeight - options.scrollTop - options.clientHeight > 4);
    };
    update();
    options.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      options.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
    // Options come and go with the practice type (settingsVersion changes then)
  }, [settingsVersion]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSettingsVersion(version => version + 1);
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  if(localStorage.getItem('checkedKanas') === null) {
    writeSelectedGroups(["あ"])
  }
  migrateKanjiGroupSelections();

  const storedPractice = localStorage.getItem('game-mode-practice') ||
    (localStorage.getItem('game-mode-word') === 'true' ? 'words' : 'characters');
  // Older "kanji" values count as "characters", like in GameModeSelector
  const practice = ['words', 'mixed', 'long', 'bunpou', 'srs'].includes(storedPractice) ? storedPractice : 'characters';
  const sentenceData = useSentenceData(practice === 'long' || practice === 'bunpou');
  const { kanaGroupCount, kanjiGroupCount, kanaCount, kanjiCount, wordCount, sentenceCount, bunpouCount } = getSelectionSummary(sentenceData, practice);
  const selectedKanjiGroups = useMemo(
    () => getSelectedKanjiGroupTitles(),
    // settingsVersion: read again from localStorage when the selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settingsVersion]
  );
  // SRS session for the Kanji tab: the kanji due again plus the new kanji
  // left for today, exactly what the review will show
  const srsSession = useMemo(
    () => getSrsSession(selectedKanjiGroups),
    // settingsVersion: recounted every minute and when the selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedKanjiGroups, settingsVersion]
  );
  // Kanji practiced before that are due again, offered in the banner at the top
  const dueReviewCount = useMemo(
    () => getDueReviewCount(selectedKanjiGroups),
    [selectedKanjiGroups]
  );
  let summaryText;
  let canStart = true;
  let summaryLoading = false;
  // Kanji review: Start first allows NEW_KANJI_PER_DAY more new kanji today
  let learnMoreNewKanji = false;
  // "later today", "tomorrow" or the date, for when the next review comes
  const formatWhen = (at) => {
    const day = new Date(at);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (day.toDateString() === new Date().toDateString()) return t('srsSummaryToday');
    if (day.toDateString() === tomorrow.toDateString()) return t('srsSummaryTomorrow');
    return day.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };
  if (practice === 'srs') {
    // Kanji review: what the session holds (due again + new for today)
    if (kanjiGroupCount === 0) {
      summaryText = t('menuSummarySrsNoKanji');
      canStart = false;
    } else if (srsSession.total === 0 && srsSession.unlearned > 0) {
      // Today's new kanji are done but more are waiting: Start brings in more
      summaryText = t('menuSummarySrsMoreNew', { count: Math.min(NEW_KANJI_PER_DAY, srsSession.unlearned) });
      learnMoreNewKanji = true;
    } else if (srsSession.total === 0) {
      // Every kanji of the selection learned, none due: when the next ones are
      const next = getNextReview(selectedKanjiGroups);
      summaryText = next
        ? t('menuSummarySrsCaughtUp', { when: formatWhen(next.at), count: next.count })
        : t('kanjiSrsNothingDue');
      canStart = false;
    } else {
      summaryText = t('menuSummarySrs', { due: srsSession.due.length, fresh: srsSession.fresh.length });
    }
  } else if (practice === 'words' && wordCount === 0) {
    summaryText = t('menuSummaryNoWords');
    canStart = false;
  } else if (practice === 'mixed' && kanaCount + kanjiCount + wordCount === 0) {
    summaryText = t('menuSummaryNone');
    canStart = false;
  } else if (practice === 'characters' && kanaCount + kanjiCount === 0) {
    summaryText = t('menuSummaryNone');
    canStart = false;
  } else if ((practice === 'long' || practice === 'bunpou') && !sentenceData) {
    summaryText = t('menuSummaryLoading');
    canStart = false;
    summaryLoading = true;
  } else if (practice === 'long' && sentenceCount === 0) {
    summaryText = t('menuSummaryNoSentences');
    canStart = false;
  } else if (practice === 'bunpou' && bunpouCount === 0) {
    summaryText = t('menuSummaryNoBunpou');
    canStart = false;
  } else if (practice === 'words') {
    summaryText = t('menuSummaryWords', { words: wordCount, groups: kanaGroupCount });
  } else if (practice === 'mixed') {
    summaryText = t('menuSummaryMixed', { kanas: kanaCount, kanji: kanjiCount, words: wordCount });
  } else if (practice === 'long') {
    summaryText = t('menuSummaryLong', { count: sentenceCount });
  } else if (practice === 'bunpou') {
    summaryText = t('menuSummaryBunpou', { count: bunpouCount });
  } else {
    summaryText = t('menuSummaryCharacters', {
      groups: kanaGroupCount + kanjiGroupCount,
      kanas: kanaCount,
      kanji: kanjiCount,
    });
  }

  const handleButtonClick = () => {
    const checkboxes = document.querySelectorAll('.kana-checkbox');
    const checkedChars = new Set(getSelectedKanjiGroupTitles());

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedChars.add(checkbox.id);
      } else {
        checkedChars.delete(checkbox.id);
      }
    });

    writeSelectedGroups([...checkedChars]);
  };

  // Starts a game with only the given characters, the same way as "Try Problematics"
  const practiceWeakest = (characters) => {
    handleButtonClick();
    navigate(ROUTES.game, { state: { characters } });
  };

  // Practices the kana the user mixes up: all of the frequent pairs, or the
  // ones given (a single pair picked in Learning Progress)
  const practiceMixups = (characters) => {
    navigate(gamePath(GAME_MODES.mixups), characters ? { state: { characters } } : undefined);
  };

  return (
    <div className={`game-menu-page tab-${activeKanaTab}`}>
      <h2 id='game-menu-title'>{t('menuTitle')}</h2>
      {gameError && (
        <div className='game-menu-error' role='alert'>
          <span>{gameError}</span>
          <button type='button' onClick={dismissGameError} aria-label={t('menuDismiss')} title={t('menuDismiss')}>
            <Icon name='x' />
          </button>
        </div>
      )}
      {dueReviewCount > 0 && (
        <div className='srs-review-banner' role='status'>
          <span><Icon name='bell' className='icon-leading icon-bell' />{t('kanjiSrsDue', { count: dueReviewCount })}</span>
          <Link to={gamePath(GAME_MODES.review)} className='srs-review-banner-button'>
            {t('srsBannerStart')}
          </Link>
        </div>
      )}
      <div className='game-menu-groups'>
        <div className='kana-group-tabs-wide'>
          <button
            type='button'
            className={`kana-group-tab ${isKanjiTab ? '' : 'active'}`}
            onClick={() => setActiveKanaTab('hiragana')}
          >
            Kana
          </button>
          <button
            type='button'
            className={`kana-group-tab ${isKanjiTab ? 'active' : ''}`}
            onClick={() => setActiveKanaTab('kanji')}
          >
            Kanji
          </button>
        </div>
        <div className='kana-group-tabs'>
          {['hiragana', 'katakana', 'kanji'].map((group) => (
            <button
              key={group}
              type='button'
              className={`kana-group-tab ${activeKanaTab === group ? 'active' : ''}`}
              onClick={() => setActiveKanaTab(group)}
            >
              {group === 'hiragana' ? 'Hiragana' : group === 'katakana' ? 'Katakana' : 'Kanji'}
            </button>
          ))}
        </div>
        <div className={`kana-group-selector show-${activeKanaTab}`}>
          <KanaGroup groupToShow="hiragana" onSelectionChange={refreshSummary} />
          <KanaGroup groupToShow="katakana" onSelectionChange={refreshSummary} />
        </div>
        <div className="kana-group-kanji-block">
          <KanaGroup groupToShow="kanji" onSelectionChange={refreshSummary} />
        </div>
      </div>
      <aside className={'game-menu-side' + (modeOptionsMoreBelow ? ' has-more-below' : '')}>
        <div className='game-mode-selector' ref={modeOptionsRef}>
          <GameModeSelector onChange={refreshSummary} kanjiSelected={kanjiGroupCount > 0} />
        </div>
        <div className='game-menu-start-bar'>
          <button className='neoButton stats-button-floating' onClick={() => { setStatsFocusSection(null); setShowStatsModal(true); }} title={t('menuStats')}>
            <Icon name='bar-chart' title={t('menuStats')} />
          </button>
          <div className='game-menu-start'>
            <p className={'game-menu-summary' + (canStart || summaryLoading ? '' : ' game-menu-summary-warning')}>{summaryText}</p>
            {canStart ? (
              <Link to={practice === 'srs' ? gamePath(GAME_MODES.review) : ROUTES.game}>
                <button className='glowButton' onClick={() => {
                  if (learnMoreNewKanji) addExtraNewKanji();
                  handleButtonClick();
                }}><Icon name='play' className='icon-leading icon-play' />{t('menuStart')}</button>
              </Link>
            ) : (
              <button className='glowButton' disabled><Icon name='play' className='icon-leading icon-play' />{t('menuStart')}</button>
            )}
          </div>
        </div>
      </aside>
      <ProgressStatsModal
        visible={showStatsModal}
        focusSection={statsFocusSection}
        onClose={() => { setShowStatsModal(false); setStatsFocusSection(null); }}
        onPracticeWeakest={practiceWeakest}
        onPracticeMixups={practiceMixups}
      />
    </div>
  )
}
