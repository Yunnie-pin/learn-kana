import React, { useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link } from "react-router-dom";
import { kanaCharacters } from '../kanaCharacters.js'
import { useLanguage } from '../i18n'

// How many groups / characters are selected and how many words can be practiced with them
function getSelectionSummary() {
  let checkedKanas = [];
  try {
    checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
  } catch (e) { }

  let groupCount = 0;
  let characterCount = 0;
  for (const script of ['hiragana', 'katakana']) {
    for (const group of Object.values(kanaCharacters[script])) {
      if (checkedKanas.includes(group.title)) {
        groupCount++;
        characterCount += Object.keys(group.characters).length;
      }
    }
  }
  const wordCount = Object.values(kanaCharacters.words).filter(word =>
    [...word.hiragana_groups, ...word.katakana_groups].every(group => checkedKanas.includes(group))
  ).length;

  return { groupCount, characterCount, wordCount };
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

  const { groupCount, characterCount, wordCount } = getSelectionSummary();
  const isWordPractice = localStorage.getItem('game-mode-word') === 'true';
  let summaryText;
  let canStart = true;
  if (groupCount === 0) {
    summaryText = t('menuSummaryNone');
    canStart = false;
  } else if (isWordPractice && wordCount === 0) {
    summaryText = t('menuSummaryNoWords');
    canStart = false;
  } else if (isWordPractice) {
    summaryText = t('menuSummaryWords', { words: wordCount, groups: groupCount });
  } else {
    summaryText = t('menuSummaryCharacters', { groups: groupCount, characters: characterCount });
  }

  const handleButtonClick = () => {
    const checkboxes = document.querySelectorAll('.kana-checkbox');
    const checkedChars = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checkedChars.push(checkbox.id);
      }
    });

    // Save result to local storage
    localStorage.setItem('checkedKanas', JSON.stringify(checkedChars));

  };

  return (
    <div className='game-menu-page'>
      <h2 id='game-menu-title'>{t('menuTitle')}</h2>
      <div className='kana-group-tabs'>
        {['hiragana', 'katakana'].map((group) => (
          <button
            key={group}
            className={`kana-group-tab ${activeKanaTab === group ? 'active' : ''}`}
            onClick={() => setActiveKanaTab(group)}
          >
            {group === 'hiragana' ? 'Hiragana' : 'Katakana'}
          </button>
        ))}
      </div>
      <div className={`kana-group-selector show-${activeKanaTab}`}>
        <KanaGroup groupToShow="hiragana" onSelectionChange={refreshSummary} />
        <KanaGroup groupToShow="katakana" onSelectionChange={refreshSummary} />
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
