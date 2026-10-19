import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import GameModeSelector from './GameModeSelector';

/*
 * The On'yomi & Kun'yomi option only affects kanji, so it is disabled while
 * no kanji group is selected. The saved choice is kept for later.
 */
const readingsOption = () => document.querySelector('#game-mode-kanji-readings');

beforeEach(() => {
  localStorage.clear();
});

describe('kanji readings option', () => {
  test('is disabled and shown off when no kanji group is selected', () => {
    localStorage.setItem('game-mode-kanji-readings', 'true');
    render(<GameModeSelector kanjiSelected={false} />);

    expect(readingsOption()).toBeDisabled();
    expect(readingsOption()).not.toBeChecked();
    // The player's choice is not lost
    expect(localStorage.getItem('game-mode-kanji-readings')).toBe('true');
  });

  test('comes back with the saved choice once a kanji group is selected', () => {
    localStorage.setItem('game-mode-kanji-readings', 'true');
    const { rerender } = render(<GameModeSelector kanjiSelected={false} />);

    rerender(<GameModeSelector kanjiSelected={true} />);
    expect(readingsOption()).toBeEnabled();
    expect(readingsOption()).toBeChecked();

    fireEvent.click(readingsOption());
    expect(localStorage.getItem('game-mode-kanji-readings')).toBe('false');
  });
});

describe('sentence options', () => {
  const radio = (name) => screen.getByRole('radio', { name });

  test('are only shown for sentence practice', () => {
    localStorage.setItem('game-mode-practice', 'words');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.queryByRole('radiogroup', { name: 'Exercise' })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Sentences' }));
    expect(screen.getByRole('radiogroup', { name: 'Exercise' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Sentence length' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Pattern' })).toBeInTheDocument();
  });

  test('are saved for the game', () => {
    localStorage.setItem('game-mode-practice', 'long');
    render(<GameModeSelector kanjiSelected={true} />);

    fireEvent.click(radio('Particles'));
    fireEvent.click(radio('Long'));
    fireEvent.click(radio('〜ます'));
    fireEvent.click(radio('N4'));
    expect(localStorage.getItem('game-mode-sentence-exercise')).toBe('particle');
    expect(localStorage.getItem('game-mode-sentence-level')).toBe('hard');
    expect(localStorage.getItem('game-mode-sentence-pattern')).toBe('verb');
    expect(localStorage.getItem('game-mode-sentence-jlpt')).toBe('N4');
  });

  test('listening is disabled when the browser cannot speak', () => {
    localStorage.setItem('game-mode-practice', 'long');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(radio('Listen')).toBeDisabled();
  });
});

describe('grammar options', () => {
  const radio = (name) => screen.getByRole('radio', { name });

  test('the missing form is typed by default, or picked among four', () => {
    localStorage.setItem('game-mode-practice', 'bunpou');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(radio('Typing')).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(radio('Multiple choice'));
    expect(localStorage.getItem('game-mode-bunpou-answer')).toBe('choice');
  });

  test('topic and level are kept apart from the sentences and the words', () => {
    localStorage.setItem('game-mode-practice', 'bunpou');
    localStorage.setItem('game-mode-sentence-topic', 'it');
    localStorage.setItem('game-mode-sentence-jlpt', 'N4');
    localStorage.setItem('game-mode-word-topic', 'it');
    render(<GameModeSelector kanjiSelected={true} />);
    const topic = within(screen.getByRole('radiogroup', { name: 'Topic' }));
    expect(topic.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(topic.getByRole('radio', { name: 'General' }));
    expect(localStorage.getItem('game-mode-bunpou-topic')).toBe('general');
    // The sentences and the words keep their own choices
    expect(localStorage.getItem('game-mode-sentence-topic')).toBe('it');
    expect(localStorage.getItem('game-mode-word-topic')).toBe('it');

    fireEvent.click(radio('N5'));
    expect(localStorage.getItem('game-mode-bunpou-jlpt')).toBe('N5');
    expect(localStorage.getItem('game-mode-sentence-jlpt')).toBe('N4');
  });

  test('the description says what the practice does', () => {
    localStorage.setItem('game-mode-practice', 'bunpou');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(document.querySelector('.practice-description'))
      .toHaveTextContent('Complete the verb form hidden in a real sentence');
  });
});

describe('options that do not apply to sentences are hidden', () => {
  test('sentences: no "Answer by" (always typed) and no kanji readings option', () => {
    localStorage.setItem('game-mode-practice', 'long');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.queryByRole('radiogroup', { name: 'Answer by' })).toBeNull();
    expect(document.querySelector('#game-mode-kanji-readings')).toBeNull();
  });

  test('characters: both are there', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.getByRole('radiogroup', { name: 'Answer by' })).toBeInTheDocument();
    expect(document.querySelector('#game-mode-kanji-readings')).toBeInTheDocument();
  });

  test('words: no "Answer by" either (words are always typed)', () => {
    localStorage.setItem('game-mode-practice', 'words');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.queryByRole('radiogroup', { name: 'Answer by' })).toBeNull();
  });
});

describe('character order', () => {
  test('is offered for characters practice only, random by default', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.getByRole('radio', { name: 'Random' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: 'In order' }));
    expect(localStorage.getItem('game-mode-order')).toBe('sequential');

    fireEvent.click(screen.getByRole('tab', { name: 'Words' }));
    expect(screen.queryByRole('radiogroup', { name: 'Order' })).toBeNull();
  });
});

describe('word topic', () => {
  test('is offered for words and mixed practice, and saved', () => {
    localStorage.setItem('game-mode-practice', 'words');
    render(<GameModeSelector kanjiSelected={true} />);
    const topic = within(screen.getByRole('radiogroup', { name: 'Topic' }));
    expect(topic.getAllByRole('radio').map(radio => radio.textContent))
      .toEqual(['General', 'IT & work', 'All words']);
    expect(topic.getByRole('radio', { name: 'All words' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(topic.getByRole('radio', { name: 'General' }));
    expect(localStorage.getItem('game-mode-word-topic')).toBe('general');
    fireEvent.click(topic.getByRole('radio', { name: 'IT & work' }));
    expect(localStorage.getItem('game-mode-word-topic')).toBe('it');

    fireEvent.click(screen.getByRole('tab', { name: 'Mixed' }));
    expect(screen.getByRole('radiogroup', { name: 'Topic' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Characters' }));
    expect(screen.queryByRole('radiogroup', { name: 'Topic' })).toBeNull();
  });

  test('sentences have their own: general, IT or all, kept apart from the words', () => {
    localStorage.setItem('game-mode-word-topic', 'it');
    localStorage.setItem('game-mode-practice', 'long');
    render(<GameModeSelector kanjiSelected={true} />);
    const topic = within(screen.getByRole('radiogroup', { name: 'Topic' }));
    expect(topic.getAllByRole('radio').map(radio => radio.textContent))
      .toEqual(['General', 'IT & work', 'All']);
    expect(topic.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(topic.getByRole('radio', { name: 'General' }));
    expect(localStorage.getItem('game-mode-sentence-topic')).toBe('general');
    // The words keep their own topic
    expect(localStorage.getItem('game-mode-word-topic')).toBe('it');
  });
});

test('the kanji review is one of the practice options', () => {
  localStorage.setItem('game-mode-practice', 'characters');
  render(<GameModeSelector kanjiSelected={true} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Kanji review' }));
  expect(localStorage.getItem('game-mode-practice')).toBe('srs');
  expect(screen.queryByRole('radiogroup', { name: 'Answer by' })).toBeNull();
  expect(screen.queryByRole('radiogroup', { name: 'Order' })).toBeNull();
});

describe('practice tabs', () => {
  const tab = (name) => screen.getByRole('tab', { name });
  const toggleIds = () => [...document.querySelectorAll('.more-options input[type="checkbox"]')].map(input => input.id);

  test('the practice type is a row of tabs at the top, with what it is about', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.getAllByRole('tab').map(element => element.textContent))
      .toEqual(['Characters', 'Words', 'Mixed', 'Sentences', 'Grammar', 'Kanji review']);
    expect(tab('Characters')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'practice-tab-characters');
    expect(document.querySelector('.practice-description')).toHaveTextContent('one character at a time');

    fireEvent.click(tab('Sentences'));
    expect(tab('Sentences')).toHaveAttribute('aria-selected', 'true');
    expect(document.querySelector('.practice-description')).toHaveTextContent('Real sentences');
  });

  test('each practice type only shows its own options', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);
    const groups = () => screen.getAllByRole('radiogroup').map(group => group.getAttribute('aria-label'));

    expect(groups()).toEqual(['Length', 'Order', 'Answer by']);
    fireEvent.click(tab('Words'));
    expect(groups()).toEqual(['Length', 'Topic']);
    fireEvent.click(tab('Sentences'));
    expect(groups()).toEqual(['Length', 'Topic', 'Exercise', 'JLPT grammar', 'Sentence length', 'Pattern']);
    // Grammar: how the form is answered, and where the sentences come from
    fireEvent.click(tab('Grammar'));
    expect(groups()).toEqual(['Length', 'Answer by', 'Topic', 'JLPT grammar']);
    // A review session is set by the schedule: no length
    fireEvent.click(tab('Kanji review'));
    expect(screen.queryAllByRole('radiogroup')).toEqual([]);
  });

  test('the on / off options are folded, with only the ones that apply', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(document.querySelector('details.more-options')).not.toHaveAttribute('open');
    expect(toggleIds()).toEqual(['game-mode-hints', 'game-mode-random-fonts', 'game-mode-auto-next', 'game-mode-kanji-readings']);

    fireEvent.click(tab('Sentences'));
    expect(toggleIds()).toEqual(['game-mode-hints', 'game-mode-auto-next']);
    fireEvent.click(tab('Grammar'));
    expect(toggleIds()).toEqual(['game-mode-hints', 'game-mode-auto-next']);
    fireEvent.click(tab('Kanji review'));
    expect(toggleIds()).toEqual(['game-mode-random-fonts']);
  });

  test('the fold lists the options that are on, and follows the switches', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    localStorage.setItem('game-mode-hints', 'true');
    localStorage.setItem('game-mode-auto-next', 'false');
    localStorage.setItem('game-mode-random-fonts', 'false');
    localStorage.setItem('game-mode-kanji-readings', 'false');
    render(<GameModeSelector kanjiSelected={true} />);
    const active = () => document.querySelector('.more-options-active').textContent;
    expect(active()).toBe('Hints');

    fireEvent.click(document.querySelector('#game-mode-auto-next'));
    expect(active()).toBe('Hints · Auto Next');
    fireEvent.click(document.querySelector('#game-mode-hints'));
    fireEvent.click(document.querySelector('#game-mode-auto-next'));
    expect(active()).toBe('none on');
  });
});

describe('session length per practice type', () => {
  const tab = (name) => screen.getByRole('tab', { name });
  const gameMode = () => JSON.parse(localStorage.getItem('gameMode'));
  const stepperText = () => document.querySelector('.limit-stepper span')?.textContent;

  test('each practice type keeps its own length', () => {
    localStorage.setItem('game-mode-practice', 'characters');
    render(<GameModeSelector kanjiSelected={true} />);

    // Characters: 50 kana
    fireEvent.click(screen.getByRole('radio', { name: 'Count' }));
    for (let step = 0; step < 9; step++) fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(gameMode()).toEqual({ type: 'kana-selector', value: 50 });

    // Sentences: its own, unlimited until set; then 2 minutes
    fireEvent.click(tab('Sentences'));
    expect(gameMode()).toEqual({ type: 'kana-selector', value: -1 });
    fireEvent.click(screen.getByRole('radio', { name: 'Time' }));
    fireEvent.click(screen.getByRole('button', { name: 'Less' }));
    fireEvent.click(screen.getByRole('button', { name: 'Less' }));
    fireEvent.click(screen.getByRole('button', { name: 'Less' }));
    expect(gameMode()).toEqual({ type: 'time-selector', value: 2 });

    // Back to characters: its 50 again, and the game reads it from gameMode
    fireEvent.click(tab('Characters'));
    expect(gameMode()).toEqual({ type: 'kana-selector', value: 50 });
    expect(stepperText()).toContain('50');
    fireEvent.click(tab('Sentences'));
    expect(gameMode()).toEqual({ type: 'time-selector', value: 2 });
  });

  test('the length set before this existed stays with the practice type in use', () => {
    localStorage.setItem('game-mode-practice', 'words');
    localStorage.setItem('gameMode', JSON.stringify({ type: 'kana-selector', value: 15 }));
    render(<GameModeSelector kanjiSelected={true} />);
    expect(gameMode()).toEqual({ type: 'kana-selector', value: 15 });
    fireEvent.click(tab('Characters'));
    expect(gameMode()).toEqual({ type: 'kana-selector', value: -1 });
    fireEvent.click(tab('Words'));
    expect(gameMode()).toEqual({ type: 'kana-selector', value: 15 });
  });
});

test('the length counts what the practice type practices', () => {
  localStorage.setItem('game-mode-practice', 'characters');
  localStorage.setItem('gameMode', JSON.stringify({ type: 'kana-selector', value: 10 }));
  render(<GameModeSelector kanjiSelected={true} />);
  const stepper = () => document.querySelector('.limit-stepper span').textContent;
  expect(stepper()).toBe('10 characters');
  for (const [tab, label] of [['Words', 'words'], ['Mixed', 'questions'], ['Sentences', 'sentences'], ['Grammar', 'sentences']]) {
    fireEvent.click(screen.getByRole('tab', { name: tab }));
    fireEvent.click(screen.getByRole('radio', { name: 'Count' }));
    expect(stepper()).toBe(`5 ${label}`);
  }
});
