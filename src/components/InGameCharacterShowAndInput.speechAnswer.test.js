import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InGameCharacterShowAndInput from './InGameCharacterShowAndInput';
import { kanaCharacters } from '../kanaCharacters.js';

/*
 * Tests for answering the sentence practice by voice: the mic button in the
 * right corner of the answer field listens to the sentence being read out
 * loud, shows what it hears in the input as romaji word by word, and counts
 * the answer as soon as the whole sentence was heard. Kanji are written as
 * their reading. Speech the recognizer got wrong stays in the input in red,
 * so it can be corrected by hand.
 */

const kanjiGroupOf = (character) => Object.values(kanaCharacters.kanji)
  .find(group => Object.values(group.characters).some(item => item.jp_character === character))?.title;

// これは水です is the only sentence this selection can show
const ONE_SENTENCE = ['か', 'ら', 'は', 'だ', 'さ', kanjiGroupOf('水')];

const cursorGroup = () => document.querySelector('#in-game-text-input-cursor-group');
const beforeCursor = () => document.querySelector('#in-game-text-input-before-cursor');
const hiddenInput = () => document.querySelector('#in-game-text-input');
const micButton = () => document.querySelector('#in-game-speech-button');
const nextButton = () => document.querySelector('#in-game-next-button');
const score = () => document.getElementById('in-game-score');
const sentenceStats = (sentence) => (JSON.parse(localStorage.getItem('userStats')) || {})[sentence];

function pressKeys(...keys) {
  keys.forEach(key => fireEvent.keyDown(window, { key }));
}

// The browser API the game listens with: every session is recorded
let recognitions = [];
class FakeSpeechRecognition {
  constructor() {
    this.start = jest.fn();
    this.stop = jest.fn();
    recognitions.push(this);
  }
}

// One result of the recognizer: a transcript with its alternatives
const speechResult = (transcript, isFinal) => Object.assign([{ transcript }], { isFinal });

// The recognizer reports what it heard into the session running now
function speakIntoTheMic(transcript, isFinal = false) {
  act(() => {
    recognitions[recognitions.length - 1].onresult({
      resultIndex: 0,
      results: [speechResult(transcript, isFinal)],
    });
  });
}

async function renderLongPractice({ exercise = 'type' } = {}) {
  localStorage.setItem('checkedKanas', JSON.stringify(ONE_SENTENCE));
  localStorage.setItem('game-mode-sentence-exercise', exercise);
  localStorage.setItem('game-mode-practice', 'long');
  localStorage.setItem('game-mode-word', 'false');
  localStorage.setItem('game-mode-touch', 'false');
  localStorage.setItem('game-mode-auto-next', 'false');
  localStorage.setItem('gameMode', JSON.stringify({ type: 'kana-selector', value: -1 }));
  localStorage.setItem('userStats', '{}');
  await act(async () => {
    render(
      <MemoryRouter>
        <InGameCharacterShowAndInput />
      </MemoryRouter>
    );
  });
}

function tapMic() {
  act(() => {
    fireEvent.click(micButton());
  });
}

async function tapNextButton() {
  await act(async () => {
    fireEvent.click(nextButton());
  });
}

beforeEach(() => {
  localStorage.clear();
  recognitions = [];
  window.SpeechRecognition = FakeSpeechRecognition;
  // The listen exercise needs a voice; the game never actually speaks here
  window.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) { this.text = text; };
  window.speechSynthesis = { speak: () => {}, cancel: () => {}, getVoices: () => [] };
});

afterEach(() => {
  delete window.SpeechRecognition;
  delete window.SpeechSynthesisUtterance;
  delete window.speechSynthesis;
});

describe('answering sentences by voice', () => {
  test('the mic listens, previews the heard sentence in romaji and answers with it', async () => {
    await renderLongPractice();

    // The mic sits right after the answer field, below its line (by the styles)
    expect(cursorGroup().querySelector('#in-game-speech-button')).toBeNull();
    expect(document.querySelector('.in-game-answer-field')).toContainElement(micButton());
    expect(micButton()).toHaveAttribute('aria-label', 'Answer with your voice');
    expect(micButton()).toHaveAttribute('aria-pressed', 'false');

    tapMic();
    expect(recognitions).toHaveLength(1);
    expect(recognitions[0].lang).toBe('ja-JP');
    expect(micButton()).toHaveClass('is-listening');
    expect(micButton()).toHaveAttribute('aria-label', 'Stop listening');

    // A part of the sentence heard so far is shown as romaji word by word
    speakIntoTheMic('これは');
    expect(beforeCursor().textContent).toBe('kore wa');
    expect(hiddenInput().value).toBe('kore wa');
    expect(cursorGroup()).not.toHaveClass('answer-correct');
    // A part of the sentence in the right order is not a mispronunciation
    expect(cursorGroup()).not.toHaveClass('answer-wrong');

    // The whole sentence heard: counted as the answer right away, with the
    // accepted romaji of the sentence
    speakIntoTheMic('これは水です', true);
    expect(beforeCursor().textContent).toBe('kore wa mizu desu');
    expect(cursorGroup()).toHaveClass('answer-correct');
    expect(score()).toHaveTextContent('1');
    expect(sentenceStats('これは水です').currentGameStats.rightGuesses).toBe(1);
    // Listening stops and the mic goes away once answered
    expect(recognitions[0].stop).toHaveBeenCalled();
    expect(micButton()).toBeNull();

    await tapNextButton();
    expect(beforeCursor().textContent).toBe('');
    expect(micButton()).not.toBeNull();
  });

  test('the words heard are shown one by one, separated by spaces', async () => {
    await renderLongPractice();

    tapMic();
    // A part the recognizer closed off means the speech paused there
    speakIntoTheMic('これは', true);
    expect(beforeCursor().textContent).toBe('kore wa');
    expect(cursorGroup()).not.toHaveClass('answer-wrong');

    // The part it is still guessing follows after a space too
    speakIntoTheMic('みず', false);
    expect(beforeCursor().textContent).toBe('kore wa mizu');

    // Heard whole: counted as the answer, with the accepted romaji
    speakIntoTheMic('水です', true);
    expect(beforeCursor().textContent).toBe('kore wa mizu desu');
    expect(cursorGroup()).toHaveClass('answer-correct');
    expect(score()).toHaveTextContent('1');

    await tapNextButton();
  });

  test('speech the recognizer got wrong stays as romaji and can be fixed by hand', async () => {
    await renderLongPractice();

    tapMic();
    speakIntoTheMic('それは水です', true);
    // Another sentence: still shown as romaji, but already in red while
    // listening, and not answered
    expect(beforeCursor().textContent).toBe('sorehamizudesu');
    expect(cursorGroup()).toHaveClass('answer-wrong');
    expect(cursorGroup()).not.toHaveClass('answer-correct');

    // Tapping the mic again stops listening; what was heard stays for editing
    tapMic();
    expect(recognitions[0].stop).toHaveBeenCalled();
    expect(micButton()).not.toHaveClass('is-listening');
    expect(beforeCursor().textContent).toBe('sorehamizudesu');
    expect(cursorGroup()).toHaveClass('answer-wrong');
    expect(sentenceStats('これは水です').currentGameStats.wrongSubmissions).toBe(1);

    // Correct it by hand: backspace the wrong part, type the sentence
    pressKeys(...Array(14).fill('Backspace'));
    expect(beforeCursor().textContent).toBe('');
    pressKeys(...'korewamizudesu'.split(''));
    expect(cursorGroup()).toHaveClass('answer-correct');
    expect(score()).toHaveTextContent('1');

    await tapNextButton();
  });

  test('typing while listening is never overwritten by what is heard', async () => {
    await renderLongPractice();

    tapMic();
    speakIntoTheMic('それは');
    expect(beforeCursor().textContent).toBe('soreha');

    pressKeys('x');
    expect(beforeCursor().textContent).toBe('sorehax');
    speakIntoTheMic('それは水です', true);
    // The typed answer is left alone: speech only fills an empty input
    expect(beforeCursor().textContent).toBe('sorehax');

    // Stopping by hand does not submit either
    tapMic();
    expect(beforeCursor().textContent).toBe('sorehax');
  });

  test('the listen exercise can be answered by voice too', async () => {
    await renderLongPractice({ exercise: 'listen' });
    expect(micButton()).not.toBeNull();

    tapMic();
    speakIntoTheMic('これは水です', true);
    expect(cursorGroup()).toHaveClass('answer-correct');
    // The answered sentence is revealed
    expect(document.querySelector('#in-game-kana-character > p').textContent).toBe('これは水です');

    await tapNextButton();
  });

  test('no mic for the particle exercise', async () => {
    await renderLongPractice({ exercise: 'particle' });
    expect(micButton()).toBeNull();
  });

  test('no mic when the browser cannot listen, typing keeps working', async () => {
    delete window.SpeechRecognition;
    await renderLongPractice();

    expect(micButton()).toBeNull();
    pressKeys('k', 'o');
    expect(beforeCursor().textContent).toBe('ko');
  });
});
