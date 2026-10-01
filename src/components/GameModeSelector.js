import React, { useState } from 'react'
import ButtonWithArrows from './ButtonWithArrows'
import CheckMark from './CheckMark';

// A row of mutually exclusive buttons, e.g. Practice: [Characters | Words]
function SegmentedControl(props) {
  return (
    <div className='segmented-row'>
      <span className='segmented-label'>{props.label}</span>
      <div className='segmented-control' role='radiogroup' aria-label={props.label}>
        {props.options.map((option) => (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={props.value === option.value}
            className={'segmented-option' + (props.value === option.value ? ' active' : '')}
            disabled={option.disabled}
            title={option.disabled ? option.disabledReason : undefined}
            onClick={() => props.onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GameModeSelector(props) {
  // Checks if the current device has a touchscreen
  const touchDefault = ('ontouchstart' in window | navigator.msMaxTouchPoints) === 1;

  // "game-mode-word" and "game-mode-touch" can't both be on: multiple choice only exists for characters
  const [practice, setPractice] = useState(() =>
    localStorage.getItem("game-mode-word") === "true" ? "words" : "characters");
  const [answerBy, setAnswerBy] = useState(() => {
    const storedTouch = localStorage.getItem("game-mode-touch");
    const useTouch = storedTouch === null ? touchDefault : storedTouch === "true";
    return useTouch && localStorage.getItem("game-mode-word") !== "true" ? "touch" : "typing";
  });

  React.useEffect(() => {
    localStorage.setItem("game-mode-word", practice === "words");
    localStorage.setItem("game-mode-touch", answerBy === "touch");
    if (props.onChange) {
      props.onChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice, answerBy]);

  const handlePracticeChange = (value) => {
    setPractice(value);
    if (value === "words") {
      setAnswerBy("typing");
    }
  };

  // At start with react we check if we have values for the buttons saved on localStorage
  React.useEffect(() => {
    // Check if we have a value for the time-selector
    if (localStorage.getItem("gameMode")) {
      const gameMode = JSON.parse(localStorage.getItem("gameMode"));
      if (gameMode.type === "kana-selector" && gameMode.value === -1) {
        document.getElementById("time-selector-unlimited-radio-button").checked = true;
      } else if (gameMode.type === "time-selector") {
        document.getElementById("time-selector-radio-button").checked = true;
        gameMode.value = 5;
      } else if (gameMode.type === "kana-selector") {
          document.getElementById("kana-selector-radio-button").checked = true;
          gameMode.value = 5;
      }
      localStorage.setItem("gameMode", JSON.stringify(gameMode));
    } else {
      // Initialize localStorage
      localStorage.setItem("gameMode", JSON.stringify({
        "type": "kana-selector",
        "value": -1
      }));
    }
    // Only on first render: running it again would reset the chosen amount back to 5
  }, []);

  const handleCheckMarked = (e) => {
    // Mark the checkbox as checked
    localStorage.setItem("gameMode", JSON.stringify(
      {
        "type": "kana-selector",
        "value": -1
      }
    ));
  }

  return (
    <div className='game-mode-selector-group'>
      <h2>Select a mode:</h2>
      <div className='game-mode-selector-button-group'>
        <ButtonWithArrows description="Give me" unit="Kanas" id="kana-selector"/>
        <div className='button-with-arrows'>
          <label data-gamemode="kana-selector">
            <input type="radio" 
              onClick={handleCheckMarked} 
              name="button-with-arrows-group" 
              id='time-selector-unlimited-radio-button' 
              className="character-checkbox-input game-mode-select-checkbox">
            </input>
            <div className="character-checkbox-content">
              <p>Unlimited</p>
            </div>
          </label>
        </div>
        <ButtonWithArrows description="Give me" unit="minutes" id="time-selector"/>
      </div>
      <div className='game-mode-selector-segments'>
        <SegmentedControl
          label="Practice"
          value={practice}
          onChange={handlePracticeChange}
          options={[
            { value: "characters", label: "Characters" },
            { value: "words", label: "Words" },
          ]}
        />
        <SegmentedControl
          label="Answer by"
          value={answerBy}
          onChange={setAnswerBy}
          options={[
            { value: "typing", label: "Typing" },
            { value: "touch", label: "Multiple choice", disabled: practice === "words", disabledReason: "Only available when practicing characters" },
          ]}
        />
      </div>
      <div className='game-mode-selector-button-group'>
        <CheckMark characterText="Handwritten Fonts" class="game-mode-selector-button-group-row-2" id="game-mode-random-fonts"/>
        <CheckMark characterText="Auto Next" class="game-mode-selector-button-group-row-2" id="game-mode-auto-next" default="true"/>
      </div>
    </div>
  )
}
