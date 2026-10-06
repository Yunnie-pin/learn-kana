import React, { useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link } from "react-router-dom";
import { kanaCharacters } from '../kanaCharacters.js'
import { getSelectedKanjiGroupTitles, getSrsKanjiCharacters } from '../kanjiSrs.js'
import { useLanguage } from '../i18n'

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
    selectedGroups = JSON.parse(localStorage.getItem('checkedKanas')) || [];
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
  localStorage.setItem('checkedKanas', JSON.stringify(migratedGroups));
}

// How many groups / characters are selected and how many words can be practiced with them
function getSelectionSummary() {
  let checkedKanas = [];
  try {
    checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
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
  const wordCount = Object.values(kanaCharacters.words).filter(word =>
    [...word.hiragana_groups, ...word.katakana_groups].every(group => checkedKanas.includes(group))
  ).length;

  return { kanaGroupCount, kanjiGroupCount, kanaCount, kanjiCount, wordCount };
}

export default function GameMenu() {
  const { t } = useLanguage();
  const [showStatsModal, setShowStatsModal] = useState(false);
  // On phones only one kana group is shown at a time (see .kana-group-tabs in App.css)
  const [activeKanaTab, setActiveKanaTab] = useState('hiragana');
  // Bumped whenever the selection or game mode changes, so the summary below is recomputed
  const [, setSettingsVersion] = useState(0);
  const refreshSummary = () => setSettingsVersion(version => version + 1);

  if(localStorage.getItem('checkedKanas') === null) {
    localStorage.setItem('checkedKanas', JSON.stringify(["あ"]))
  }
  migrateKanjiGroupSelections();

  const { kanaGroupCount, kanjiGroupCount, kanaCount, kanjiCount, wordCount } = getSelectionSummary();
  const practice = localStorage.getItem('game-mode-practice') ||
    (localStorage.getItem('game-mode-word') === 'true' ? 'words' : 'characters');
  const srsDueCount = practice === 'srs'
    ? getSrsKanjiCharacters(getSelectedKanjiGroupTitles()).due.length
    : 0;
  let summaryText;
  let canStart = true;
  if (practice === 'srs') {
    summaryText = t('menuSummaryKanjiSrs', { count: srsDueCount });
    canStart = srsDueCount > 0;
  } else if (practice === 'words' && wordCount === 0) {
    summaryText = t('menuSummaryNoWords');
    canStart = false;
  } else if (practice === 'kanji' && kanjiCount === 0) {
    summaryText = t('menuSummaryNoKanji');
    canStart = false;
  } else if (practice === 'mixed' && kanaCount + kanjiCount + wordCount === 0) {
    summaryText = t('menuSummaryNone');
    canStart = false;
  } else if (practice === 'characters' && kanaCount === 0) {
    summaryText = t('menuSummaryNone');
    canStart = false;
  } else if (practice === 'words') {
    summaryText = t('menuSummaryWords', { words: wordCount, groups: kanaGroupCount });
  } else if (practice === 'kanji') {
    summaryText = t('menuSummaryCharacters', { groups: kanjiGroupCount, characters: kanjiCount });
  } else if (practice === 'mixed') {
    summaryText = t('menuSummaryMixed', { kanas: kanaCount, kanji: kanjiCount, words: wordCount });
  } else {
    summaryText = t('menuSummaryCharacters', { groups: kanaGroupCount, characters: kanaCount });
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

    localStorage.setItem('checkedKanas', JSON.stringify([...checkedChars]));
    localStorage.setItem('game-mode-srs', String(practice === 'srs'));

  };

  return (
    <div className={`game-menu-page mobile-tab-${activeKanaTab}`}>
      <h2 id='game-menu-title'>{t('menuTitle')}</h2>
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
      <div className='game-mode-selector'>
        <GameModeSelector onChange={refreshSummary} />
      </div>
      <div className='game-menu-start-bar'>
        <button className='neoButton stats-button-floating' onClick={() => setShowStatsModal(true)} title={t('menuStats')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-6h2v16h-2V5z"/>
          </svg>
        </button>
        <div className='game-menu-start'>
          <p className={'game-menu-summary' + (canStart ? '' : ' game-menu-summary-warning')}>{summaryText}</p>
          {canStart ? (
            <Link to='/learn-kana∕game'>
              <button className='glowButton' onClick={handleButtonClick}>{t('menuStart')}</button>
            </Link>
          ) : (
            <button className='glowButton' disabled>{t('menuStart')}</button>
          )}
        </div>
      </div>
      <ProgressStatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </div>
  )
}
