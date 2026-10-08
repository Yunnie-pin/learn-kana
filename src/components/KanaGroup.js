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


// How many groups with this tag are selected, read from localStorage so it always
// matches the checkboxes (also when they were checked one by one)
function getTagSelection(script, tag) {
  let checkedKanas = [];
  try {
    checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
  } catch (e) { }
  const groups = Object.values(kanaCharacters[script]).filter(group => group.tags.includes(tag));
  const selected = groups.filter(group => checkedKanas.includes(group.title)).length;
  return { selected, total: groups.length, allSelected: selected === groups.length };
}

export default function KanaGroup(props) {
  const { t, language } = useLanguage();
  const [kanjiLevel, setKanjiLevel] = useState('N5');
  const groupRef = useRef(null);
  const isKanjiGroup = props.groupToShow === 'kanji';

  // Selects every group with this tag, or clears them when they are all selected already
  const toggleSelectAll = (tag) => {
    toggleCheckboxes(tag, !getTagSelection(props.groupToShow, tag).allSelected);
  };

  const renderSelectAllButton = (tag, label) => {
    const { selected, total, allSelected } = getTagSelection(props.groupToShow, tag);
    return (
      <button
        type="button"
        className={`character-title-group-button select-all-button ${allSelected ? 'selected' : ''}`}
        aria-pressed={allSelected}
        onClick={() => toggleSelectAll(tag)}
      >
        <h3>
          <span className="select-all-check" aria-hidden="true">{allSelected ? '✓' : '+'}</span>
          {label}
          <span className="select-all-count">{selected}/{total}</span>
        </h3>
      </button>
    );
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

  // Selected / total groups of a kanji theme, shown on its button like the kana select-all buttons
  const getKanjiThemeSelection = (themeTitle) => {
    let checkedKanas = [];
    try {
      checkedKanas = JSON.parse(localStorage.getItem('checkedKanas')) || [];
    } catch (e) { }
    const themeGroups = Object.values(kanaCharacters.kanji)
      .filter(group => group.level === kanjiLevel && group.themeTitle === themeTitle);
    const selected = themeGroups.filter(group => checkedKanas.includes(group.title)).length;
    return { selected, total: themeGroups.length, allSelected: themeGroups.length > 0 && selected === themeGroups.length };
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
                onClick={() => setKanjiLevel(level)}
              >
                <h3>{level}</h3>
              </button>
            ))}
          </div>
        )}
        {!isKanjiGroup && renderSelectAllButton("main_kana", t('mainKana'))}
        {character_button_group_builder(props, "main_kana", language, kanjiLevel, {
          toggleKanjiTheme,
          getKanjiThemeSelection,
        })}

        {!isKanjiGroup && (
          <>
            {renderSelectAllButton("dakuten_kana", t('dakutenKana'))}
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
  const renderCharacter = ([character, group]) => {
    const { title, characters } = group;
    const characterValues = Object.values(characters);
    const kanjiSample = characterValues[0];
    const characterTitle = props.groupToShow === 'kanji'
      ? kanjiSample.jp_character
      : group.title;
    // Kana groups show the romaji range they cover (e.g. "ka–ko"), the full list is in the hover preview
    const characterText = props.groupToShow === 'kanji'
      ? kanjiSample.romanji[0]
      : `${characterValues[0].romanji[0]}–${characterValues[characterValues.length - 1].romanji[0]}`;

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
        {visibleThemes.map(themeKey => {
          const themeGroups = groups.filter(([, group]) => group.themeTitle === themeKey);
          const themeTitle = language === 'id' ? themeGroups[0][1].themeTitle_id : themeKey;
          const { selected, total, allSelected } = kanjiThemeActions.getKanjiThemeSelection(themeKey);
          return (
            <section className="kanji-theme-section" key={themeKey}>
              <button
                type="button"
                className={`character-title-group-button select-all-button kanji-theme-title${allSelected ? ' selected' : ''}`}
                aria-pressed={allSelected}
                onClick={() => kanjiThemeActions.toggleKanjiTheme(themeKey)}
              >
                <h3>
                  <span className="select-all-check" aria-hidden="true">{allSelected ? '✓' : '+'}</span>
                  {themeTitle}
                  <span className="select-all-count">{selected}/{total}</span>
                </h3>
              </button>
              <div className="kanji-theme-groups">
                {themeGroups.map(renderCharacter)}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return <div className={`${tag}-characters`}>{groups.map(renderCharacter)}</div>;
}