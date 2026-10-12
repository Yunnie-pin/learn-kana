import React from 'react';
import { fireEvent, render } from '@testing-library/react';
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
