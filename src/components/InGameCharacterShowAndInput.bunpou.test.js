import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InGameCharacterShowAndInput from './InGameCharacterShowAndInput';
import { bunpouFormNote, bunpouPhraseOf } from '../bunpou.js';
import { sentences } from '../sentences.js';
import { kanaCharacters } from '../kanaCharacters.js';
import { translate } from '../i18n.js';

/*
 * Grammar ("bunpou") practice in the game: a real sentence is shown with the
 * verb form at its end hidden (父はコーヒーを？...), and the player completes it
 * - by typing the form's romaji (nomimasen) or by picking it among four forms
 * of the same verb (nomimasu ・ nomimashita ・ nomimasen), shown in
 * kanji / kana. The answer explains the chosen form instead of repeating the
 * meaning.
 *
 * The sentence is picked at random, so the tests read what the game shows and
 * look its data up in sentences.js. In typing mode the game itself gives the
 * form away in steps (help twice), which is the ground truth the tests type.
 */
// Every selectable group: with all of them picked every sentence is readable
const ALL_GROUP_TITLES = ['hiragana', 'katakana', 'kanji'].flatMap(script =>
  Object.values(kanaCharacters[script] || {}).map(group => group.title)
);

const displayedSentence = () => document.querySelector('#in-game-kana-character > p').textContent;
const cursorGroup = () => document.querySelector('#in-game-text-input-cursor-group');
const inputText = () => document.querySelector('#in-game-text-input-before-cursor').textContent;
const solution = () => document.querySelector('#in-game-solution');
const nextButton = () => document.querySelector('#in-game-next-button');
const hint = () => document.querySelector('#in-game-sentence-hint');
const options = () => [...document.querySelectorAll('.in-game-bunpou-option')];
const scoreValue = () => parseInt(document.getElementById('in-game-score').textContent.replace(/\D+/g, ''), 10);
const sentenceStats = (jp) => (JSON.parse(localStorage.getItem('userStats')) || {})[jp];

// The sentence as the game shows it (？ over the hidden form)
const maskedSentenceOf = (sentence) => {
  const phrase = bunpouPhraseOf(sentence);
  return [...sentence.jp_character].map((character, index) =>
    index >= phrase.blank.start && index < phrase.blank.end ? '？' : character).join('');
};
// The sentences the shown question could be: the mask and the hidden form both fit
const candidateSentences = (masked, phrase) => sentences.filter(sentence => {
  const own = bunpouPhraseOf(sentence);
  return own && own.phrase === phrase && maskedSentenceOf(sentence) === masked;
});

function pressKeys(...keys) {
  keys.forEach(key => fireEvent.keyDown(window, { key }));
}

// Reads the hidden form from the game's own help (furigana, then the form
// word by word) and types it back. Returns the form as the game spells it.
function typeHiddenFormWithHelp() {
  const typedWords = [];
  for (let step = 0; step < 5 && !cursorGroup().classList.contains('answer-correct'); step++) {
    pressKeys('?');
    if (!hint()) continue;
    typedWords.push(hint().textContent);
    pressKeys(...hint().textContent.split(''));
  }
  return typedWords.join(' ');
}

async function renderBunpouPractice({ answer = 'typing' } = {}) {
  localStorage.setItem('checkedKanas', JSON.stringify(ALL_GROUP_TITLES));
  localStorage.setItem('game-mode-practice', 'bunpou');
  localStorage.setItem('game-mode-bunpou-answer', answer);
  localStorage.setItem('game-mode-bunpou-topic', 'all');
  localStorage.setItem('game-mode-bunpou-jlpt', 'all');
  localStorage.setItem('game-mode-touch', 'false');
  localStorage.setItem('game-mode-auto-next', 'false');
  localStorage.setItem('gameMode', JSON.stringify({ type: 'kana-selector', value: -1 }));
  localStorage.setItem('userStats', '{}');
  // The first question is loaded asynchronously when the game mounts
  await act(async () => {
    render(
      <MemoryRouter>
        <InGameCharacterShowAndInput />
      </MemoryRouter>
    );
  });
}

async function tapNextButton() {
  await act(async () => {
    fireEvent.click(nextButton());
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('grammar practice, typing', () => {
  test('the form at the end of the sentence is hidden and only it is typed', async () => {
    await renderBunpouPractice();

    const masked = displayedSentence();
    const hidden = (masked.match(/？/g) || []).length;
    expect(hidden).toBeGreaterThan(0);
    // Sentences are answered by typing, and the prompt says what to do
    expect(document.querySelector('#in-game-text-input')).toBeInTheDocument();
    expect(document.querySelector('.in-game-touch-answer-group')).toBeNull();
    expect(document.querySelector('.in-game-sentence-prompt')).toHaveTextContent('Type the missing form');
    expect(solution()).toHaveClass('hidden-element');

    // Help comes in steps: furigana first, then the form itself - word by
    // word, for the forms written with two (〜ませんでした)
    const phrase = typeHiddenFormWithHelp();
    expect(cursorGroup()).toHaveClass('answer-correct');
    expect(scoreValue()).toBe(1);

    // The sentence the game was showing: its mask and its form both fit
    const candidates = candidateSentences(masked, phrase);
    expect(candidates.length).toBeGreaterThan(0);
    const entry = candidates.find(sentence =>
      ((sentenceStats(sentence.jp_character) || {}).currentGameStats || {}).rightGuesses === 1);
    expect(entry).toBeDefined();

    // The whole sentence counts as one correct answer
    expect(sentenceStats(entry.jp_character).currentGameStats.rightGuesses).toBe(1);
    // The answer shows the whole sentence and why its form fits - the
    // meaning is in the prompt above the sentence
    expect(solution()).not.toHaveClass('hidden-element');
    expect(solution().querySelector('#in-game-solution-romanji-one')).toHaveTextContent(entry.romanji[0]);
    expect(solution()).toHaveTextContent(bunpouFormNote(phrase, (key) => translate('en', key)));
    expect(solution()).not.toHaveTextContent(entry.meaning);
    // Maybe the hint gave the form away word by word: it is gone once answered
    expect(hint()).toBeNull();

    // The masked form is shown whole again on the answer
    const shown = document.querySelector('#in-game-kana-character > p').cloneNode(true);
    shown.querySelectorAll('rt').forEach(rt => rt.remove());
    expect(shown.textContent).toBe(entry.jp_character);

    // Auto next is off, so the Next button starts a new question
    expect(nextButton()).not.toHaveClass('hidden-element');
    await tapNextButton();
    expect(inputText()).toBe('');
    expect(solution()).toHaveClass('hidden-element');
    expect(nextButton()).toHaveClass('hidden-element');
    expect(displayedSentence()).toContain('？');
  });

  test('typing a wrong form is flagged and lets the player fix it', async () => {
    await renderBunpouPractice();

    // The mask as shown (furigana added later would get in the way)
    const masked = displayedSentence();

    // "x" can never start the form
    pressKeys('x');
    expect(cursorGroup()).toHaveClass('answer-wrong');

    pressKeys('Backspace');
    expect(inputText()).toBe('');
    expect(cursorGroup()).not.toHaveClass('answer-wrong');

    // The form can still be completed after the fix, read from the help
    const phrase = typeHiddenFormWithHelp();
    expect(cursorGroup()).toHaveClass('answer-correct');
    expect(scoreValue()).toBe(1);

    const entry = candidateSentences(masked, phrase).find(sentence =>
      ((sentenceStats(sentence.jp_character) || {}).currentGameStats || {}).rightGuesses === 1);
    expect(entry).toBeDefined();

    // Start the next question so the game drops its Enter / tap listeners
    await tapNextButton();
  });
});

describe('grammar practice, multiple choice', () => {
  test('the form is picked among four buttons, wrong picks stay on the question', async () => {
    await renderBunpouPractice({ answer: 'choice' });

    const masked = displayedSentence();
    expect(masked).toContain('？');
    // Four different forms of the same verb, and nothing to type into
    const buttons = options();
    expect(buttons).toHaveLength(4);
    expect(new Set(buttons.map(button => button.textContent)).size).toBe(4);
    // The buttons show the forms in kanji / kana; the romaji for the check
    // stays in data-value
    for (const button of buttons) {
      expect(button.textContent).not.toMatch(/[a-z]/i);
      expect(button.dataset.value).toMatch(/^[a-z ]+$/);
    }
    expect(document.querySelector('#in-game-text-input')).toBeNull();
    expect(document.querySelector('.in-game-touch-answer-group')).toBeNull();
    // No help that would give the answer away in choice mode
    expect(document.querySelector('.in-game-help-button')).toBeNull();
    expect(document.querySelector('.in-game-sentence-prompt')).toHaveTextContent('Choose the missing form');
    expect(solution()).toHaveClass('hidden-element');

    // Exactly one of the four is right: the wrong ones flash and count
    let wrongClicks = 0;
    for (const button of buttons) {
      await act(async () => {
        fireEvent.click(button);
      });
      if (scoreValue() === 1) break;
      wrongClicks++;
      expect(button).toHaveClass('bunpou-option-wrong');
    }
    expect(scoreValue()).toBe(1);
    const correctButton = buttons[wrongClicks];
    expect(correctButton).toHaveClass('touch-answer-correct');

    // The answered question shows its full romaji and why the form fits
    expect(solution()).not.toHaveClass('hidden-element');
    const solutionRomanji = document.querySelector('#in-game-solution-romanji-one').textContent;
    const candidates = sentences.filter(sentence => {
      const phrase = bunpouPhraseOf(sentence);
      return phrase && maskedSentenceOf(sentence) === masked;
    });
    expect(candidates.map(sentence => sentence.romanji[0])).toContain(solutionRomanji);
    const entry = candidates.find(sentence =>
      ((sentenceStats(sentence.jp_character) || {}).currentGameStats || {}).rightGuesses === 1);
    expect(entry).toBeDefined();
    // The right button was the hidden form of the shown sentence
    expect(correctButton.dataset.value).toBe(bunpouPhraseOf(entry).phrase);
    expect(sentenceStats(entry.jp_character).currentGameStats.wrongGuesses).toBe(wrongClicks);
    // The result explains the form instead of repeating the meaning
    expect(solution()).toHaveTextContent(bunpouFormNote(correctButton.dataset.value, (key) => translate('en', key)));
    expect(solution()).not.toHaveTextContent(entry.meaning);

    // More clicks after the answer do nothing
    const clickCount = sentenceStats(entry.jp_character).currentGameStats.wrongGuesses;
    await act(async () => {
      fireEvent.click(buttons[0]);
    });
    expect(scoreValue()).toBe(1);
    expect(sentenceStats(entry.jp_character).currentGameStats.wrongGuesses).toBe(clickCount);

    // Next shows a new question with four fresh buttons
    await tapNextButton();
    expect(solution()).toHaveClass('hidden-element');
    expect(displayedSentence()).toContain('？');
    expect(options()).toHaveLength(4);
    expect(scoreValue()).toBe(1);
  });

  test('Escape opens the summary with the grammar title', async () => {
    await renderBunpouPractice({ answer: 'choice' });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    const summary = document.querySelector('.inGameUserGameScoreWindow');
    expect(summary).toBeInTheDocument();
    expect(summary.querySelector('h2')).toHaveTextContent('Grammar done!');
  });
});
