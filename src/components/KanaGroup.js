import React, { useState, useRef } from 'react';
import { kanaCharacters } from '../kanaCharacters.js'
import { useLanguage } from '../i18n'


/*
Structure of kanaCharacters:
{
    "hiragana": {
        "a" {
            "title": "あ",
            "tags": ["main_kana"],
            "characters": {
                "a": { "jp_character": "あ", "romanji": ["a"], "sound": "あ" },
                "i": { "jp_character": "い", "romanji": ["i"], "sound": "い" },
                . . .
            }
        }, . . .
    },
    "katakana": {
        . . .
    }
}
*/

function uppercaseFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Adds or removes a group title from the checkedKanas list in localStorage
function updateCheckedKana(title, isChecked) {
  let checkedKanas = [];
  try {
    checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
  } catch (e) {
    localStorage.setItem('checkedKanas', JSON.stringify([]));
  }
  if (isChecked) {
    if (!checkedKanas.includes(title)) {
      checkedKanas.push(title);
    }
  } else {
    checkedKanas = checkedKanas.filter(item => item !== title);
  }
  localStorage.setItem('checkedKanas', JSON.stringify(checkedKanas));
}


export default function KanaGroup(props) {
  const { t, language } = useLanguage();
  const [mainKanaSelected, setMainKanaSelected] = useState(false);
  const [dakutenKanaSelected, setDakutenKanaSelected] = useState(false);
  const [kanjiLevel, setKanjiLevel] = useState('N5');
  const [showAllKanjiThemes, setShowAllKanjiThemes] = useState(false);
  const groupRef = useRef(null);
  const isKanjiGroup = props.groupToShow === 'kanji';

  const toggleSelectAll = (tag) => {
    if (tag === "main_kana") {
      setMainKanaSelected(!mainKanaSelected);
      toggleCheckboxes("main_kana", !mainKanaSelected);
    } else if (tag === "dakuten_kana") {
      setDakutenKanaSelected(!dakutenKanaSelected);
      toggleCheckboxes("dakuten_kana", !dakutenKanaSelected);
    }
  };

  const toggleCheckboxes = (tag, isChecked) => {
    const checkboxes = groupRef.current.querySelectorAll(`.${tag}-characters .kana-checkbox`);
    checkboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
      // Update localStorage accordingly
      updateCheckedKana(checkbox.id, isChecked);
    });
    if (props.onSelectionChange) {
      props.onSelectionChange();
    }
  };

  const toggleKanjiTheme = (themeTitle) => {
    const themeCheckboxes = Array.from(
      groupRef.current.querySelectorAll('.main_kana-characters .kana-checkbox')
    ).filter(checkbox => checkbox.dataset.theme === themeTitle);
    const shouldSelect = !themeCheckboxes.every(checkbox => checkbox.checked);

    themeCheckboxes.forEach(checkbox => {
      checkbox.checked = shouldSelect;
      updateCheckedKana(checkbox.id, shouldSelect);
    });
    if (props.onSelectionChange) {
      props.onSelectionChange();
    }
  };

  const isKanjiThemeSelected = (themeTitle) => {
    let checkedKanas = [];
    try {
      checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
    } catch (e) {
      return false;
    }
    const themeGroups = Object.values(kanaCharacters.kanji)
      .filter(group => group.level === kanjiLevel && group.themeTitle === themeTitle);
    return themeGroups.length > 0 && themeGroups.every(group => checkedKanas.includes(group.title));
  };

  return (
    <div className={'kana-group-elements kana-group-' + props.groupToShow} ref={groupRef}>
      {!isKanjiGroup && <h2>{uppercaseFirstLetter(props.groupToShow)}</h2>}
      <div className="character-title-group">
        {isKanjiGroup && (
          <div className="kanji-level-tabs" role="tablist" aria-label="Kanji level">
            {['N5', 'N4'].map(level => (
              <button
                key={level}
                type="button"
                role="tab"
                aria-selected={kanjiLevel === level}
                className={`character-title-group-button kanji-level-tab${kanjiLevel === level ? ' selected' : ''}`}
                onClick={() => {
                  setKanjiLevel(level);
                  setMainKanaSelected(false);
                  setShowAllKanjiThemes(false);
                }}
              >
                <h3>{level}</h3>
              </button>
            ))}
          </div>
        )}
        {!isKanjiGroup && (
          <div className={`character-title-group-button ${mainKanaSelected ? 'selected' : ''}`}
               onClick={() => toggleSelectAll("main_kana")}>
            <h3>{t('mainKana')}</h3>
          </div>
        )}
        {character_button_group_builder(props, "main_kana", language, kanjiLevel, {
          toggleKanjiTheme,
          isKanjiThemeSelected,
          showAllKanjiThemes,
          onToggleShowAll: () => setShowAllKanjiThemes(visible => !visible),
          showAllLabel: t(showAllKanjiThemes ? 'kanjiShowLess' : 'kanjiShowAll'),
        })}

        {!isKanjiGroup && (
          <>
            <div className={`character-title-group-button ${dakutenKanaSelected ? 'selected' : ''}`}
                 onClick={() => toggleSelectAll("dakuten_kana")}>
              <h3>{t('dakutenKana')}</h3>
            </div>
            {character_button_group_builder(props, "dakuten_kana", language)}
          </>
        )}
      </div>
    </div>
  );
}

function character_button_group_builder(props, tag, language, kanjiLevel, kanjiThemeActions) {
  const groups = Object.entries(kanaCharacters[props.groupToShow])
    .filter(([, group]) => group.tags.includes(tag))
    .filter(([, group]) => props.groupToShow !== 'kanji' || group.level === kanjiLevel);
  const visibleThemes = props.groupToShow === 'kanji'
    ? [...new Set(groups.map(([, group]) => group.themeTitle))]
    : [];
  const displayedThemes = kanjiThemeActions?.showAllKanjiThemes
    ? visibleThemes
    : visibleThemes.slice(0, 2);
  const displayedGroups = props.groupToShow === 'kanji'
    ? groups.filter(([, group]) => displayedThemes.includes(group.themeTitle))
    : groups;
  const renderCharacter = ([character, group]) => {
    const { title, title_id, characters } = group;
    const characterValues = Object.values(characters);
    const kanjiSample = characterValues[0];
    const characterTitle = props.groupToShow === 'kanji'
      ? kanjiSample.jp_character
      : group.title;
    const characterText = props.groupToShow === 'kanji'
      ? kanjiSample.romanji[0]
      : language === 'id' ? title_id || title : title;

    return (
      <label className={`character-checkbox-element${props.groupToShow === 'kanji' ? ' kanji-character-element' : ''}`} key={character}>
        <input type="checkbox"
          defaultChecked={localStorage.checkedKanas.includes(title)}
          id={title}
          data-theme={group.themeTitle}
          className="character-checkbox-input kana-checkbox"
          onChange={(e) => {
            updateCheckedKana(title, e.target.checked);
            if (props.onSelectionChange) {
              props.onSelectionChange();
            }
          }} />
        <div className="character-checkbox-content">
          <h3>{characterTitle}</h3>
          <p>{characterText}</p>
          {props.groupToShow === 'kanji' && kanjiSample.usage && (
            <p className="kanji-usage-example">
              {kanjiSample.usage.word} · {kanjiSample.usage.romanji}
            </p>
          )}
        </div>
        <div className="kana-group-preview" aria-hidden="true">
          {characterValues.map((groupCharacter) => (
            <div className="kana-group-preview-item" key={groupCharacter.jp_character}>
              <span className="kana-group-preview-kana">{groupCharacter.jp_character}</span>
              <span className="kana-group-preview-romanji">{groupCharacter.romanji[0]}</span>
            </div>
          ))}
        </div>
      </label>
    );
  };

  if (props.groupToShow === 'kanji') {
    return (
      <div className={`${tag}-characters kanji-theme-list`}>
        {displayedThemes.map(themeKey => {
          const themeGroups = displayedGroups.filter(([, group]) => group.themeTitle === themeKey);
          const themeTitle = language === 'id' ? themeGroups[0][1].themeTitle_id : themeKey;
          const themeSelected = kanjiThemeActions.isKanjiThemeSelected(themeKey);
          return (
            <section className="kanji-theme-section" key={themeKey}>
              <button
                type="button"
                className={`character-title-group-button kanji-theme-title${themeSelected ? ' selected' : ''}`}
                aria-pressed={themeSelected}
                onClick={() => kanjiThemeActions.toggleKanjiTheme(themeKey)}
              >
                <h3>{themeTitle}</h3>
              </button>
              <div className="kanji-theme-groups">
                {themeGroups.map(renderCharacter)}
              </div>
            </section>
          );
        })}
        {visibleThemes.length > 2 && (
          <div className="segmented-control kanji-show-all">
            <button
              type="button"
              className="segmented-option active"
              aria-expanded={kanjiThemeActions.showAllKanjiThemes}
              onClick={kanjiThemeActions.onToggleShowAll}
            >
              {kanjiThemeActions.showAllLabel}
            </button>
          </div>
        )}
      </div>
    );
  }

  return <div className={`${tag}-characters`}>{displayedGroups.map(renderCharacter)}</div>;
}