import React, { useState } from 'react'
import KanaGroup from './KanaGroup'
import GameModeSelector from './GameModeSelector'
import ProgressStatsModal from './ProgressStatsModal'
import { Link } from "react-router-dom";

export default function GameMenu() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  // On phones only one kana group is shown at a time (see .kana-group-tabs in App.css)
  const [activeKanaTab, setActiveKanaTab] = useState('hiragana');

  if(localStorage.getItem('checkedKanas') === null) {
    localStorage.setItem('checkedKanas', JSON.stringify(["あ"]))
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
      <h2 id='game-menu-title'>Select a group to learn</h2>
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
        <KanaGroup groupToShow="hiragana" />
        <KanaGroup groupToShow="katakana" />
      </div>
      <div className='game-mode-selector'>
        <GameModeSelector />
      </div>
      <div className='game-menu-start-bar'>
        <button className='neoButton stats-button-floating' onClick={() => setShowStatsModal(true)} title='View Progress Stats'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-6h2v16h-2V5z"/>
          </svg>
        </button>
        <Link to='/learn-kana∕game'>
          <button className='glowButton' onClick={handleButtonClick}>Let's start!</button>
        </Link>
      </div>
      <ProgressStatsModal visible={showStatsModal} onClose={() => setShowStatsModal(false)} />
    </div>
  )
}
