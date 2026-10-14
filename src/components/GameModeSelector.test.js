import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

    fireEvent.click(radio('Sentences'));
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

  test('words: multiple choice stays visible but disabled', () => {
    localStorage.setItem('game-mode-practice', 'words');
    render(<GameModeSelector kanjiSelected={true} />);
    expect(screen.getByRole('radio', { name: 'Multiple choice' })).toBeDisabled();
  });
});
