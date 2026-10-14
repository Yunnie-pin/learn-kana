import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { appRoutes } from './router';
import { LanguageProvider } from './i18n';
import { translate } from './i18n';

/*
 * The routes of the app, with the same route list as the real app: the menu
 * at /, the game at /game, the old /learn-kana∕game address, session modes
 * passed with the address, and the game restarting without a page reload.
 */
let router;

async function open(entry) {
  router = createMemoryRouter(appRoutes, { initialEntries: [entry] });
  await act(async () => {
    render(
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    );
  });
}

const path = () => router.state.location.pathname;
const displayed = () => document.querySelector('#in-game-kana-character > p')?.textContent;
const score = () => document.getElementById('in-game-score');

function practiceCharacters(groups) {
  localStorage.setItem('language', 'en');
  localStorage.setItem('checkedKanas', JSON.stringify(groups));
  localStorage.setItem('game-mode-practice', 'characters');
  localStorage.setItem('game-mode-touch', 'false');
  localStorage.setItem('game-mode-auto-next', 'false');
  localStorage.setItem('gameMode', JSON.stringify({ type: 'kana-selector', value: -1 }));
}

beforeEach(() => {
  localStorage.clear();
  practiceCharacters(['あ']);
});

test('the game is at /game', async () => {
  await open('/game');
  expect(path()).toBe('/game');
  expect(['あ', 'い', 'う', 'え', 'お']).toContain(displayed());
});

test('the old game address leads to /game', async () => {
  await open('/learn-kana∕game');
  expect(path()).toBe('/game');
  expect(displayed()).toBeTruthy();
});

test('the old menu address leads to the menu', async () => {
  await open('/learn-kana');
  expect(path()).toBe('/');
  expect(document.getElementById('game-menu-title')).toBeInTheDocument();
});

test('the menu starts kanji reviews with ?mode=review', async () => {
  await open('/');
  const reviewLinks = [...document.querySelectorAll('a.srs-review-banner-button')];
  reviewLinks.forEach(link => expect(link.getAttribute('href')).toBe('/game?mode=review'));
  expect(document.querySelector('.game-menu-start a').getAttribute('href')).toBe('/game');
});

test('Try Problematics characters come with the navigation, not from localStorage', async () => {
  await open({ pathname: '/game', state: { characters: ['い'] } });
  for (let round = 0; round < 5; round++) {
    expect(displayed()).toBe('い');
    await act(async () => {
      fireEvent.keyDown(window, { key: 'i' });
      await new Promise(resolve => setTimeout(resolve, 250));
    });
  }
  // A normal game afterwards shows the whole group again
  expect(localStorage.getItem('problematicKanasFilter')).toBeNull();
});

test('a game that cannot start goes back to the menu with the reason', async () => {
  practiceCharacters([]);
  await open('/game');
  expect(path()).toBe('/');
  expect(screen.getByRole('alert')).toHaveTextContent(translate('en', 'gameErrorNoKana'));

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('alert')).toBeNull();
});

describe('after a game', () => {
  async function finishWord() {
    // Answer one kana, then end the game with Escape
    await act(async () => {
      fireEvent.keyDown(window, { key: displayedRomaji() });
      await new Promise(resolve => setTimeout(resolve, 250));
    });
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 650));
    });
  }
  const displayedRomaji = () => ({ 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o' })[displayed()];

  test('Play again starts a new game without reloading the page', async () => {
    await open('/game');
    await finishWord();
    expect(score()).toHaveTextContent('1');
    expect(document.querySelector('.score-button-primary')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(document.querySelector('.score-button-primary'));
    });
    expect(path()).toBe('/game');
    expect(score()).toHaveTextContent('0');
    expect(document.querySelector('.score-button-primary')).toBeNull();
  });

  test('Play again keeps a kanji review a review', async () => {
    // No kanji are due, so the review ends right away on its summary
    await open('/game?mode=review');
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 650));
    });
    const firstGame = router.state.location.key;
    await act(async () => {
      fireEvent.click(document.querySelector('.score-button-primary'));
    });
    expect(router.state.location.key).not.toBe(firstGame);
    expect(router.state.location.search).toBe('?mode=review');
  });

  test('Back to menu goes to the menu', async () => {
    await open('/game');
    await finishWord();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    });
    expect(path()).toBe('/');
    expect(router.state.location.hash).toBe('#game-menu-title');
  });

  test('leaving a game with the browser Back button leaves nothing running', async () => {
    localStorage.setItem('checkedKanas', JSON.stringify(['ア', 'サ']));
    localStorage.setItem('game-mode-practice', 'words');
    localStorage.setItem('game-mode-word', 'true');
    router = createMemoryRouter(appRoutes, { initialEntries: ['/', '/game'], initialIndex: 1 });
    await act(async () => {
      render(
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      );
    });
    // Answer the word: its Enter / Next listeners wait for the next question
    const romaji = { 'アイス': 'aisu', 'ソース': 'soosu' }[displayed()];
    expect(romaji).toBeDefined();
    romaji.split('').forEach(key => fireEvent.keyDown(window, { key }));
    expect(document.querySelector('#in-game-next-button')).not.toHaveClass('hidden-element');

    await act(async () => {
      router.navigate(-1);
    });
    expect(path()).toBe('/');

    // A leftover listener would run against the game screen that is gone
    const errors = [];
    const onError = (event) => {
      errors.push(event.error);
      event.preventDefault();
    };
    window.addEventListener('error', onError);
    const userStats = localStorage.getItem('userStats');
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });
    window.removeEventListener('error', onError);
    expect(errors).toEqual([]);
    expect(path()).toBe('/');
    expect(localStorage.getItem('userStats')).toBe(userStats);
  });
});

describe('search engines', () => {
  const robots = () => document.querySelector('meta[name="robots"]').content;

  test('the menu is indexed, with a title and description in the app language', async () => {
    await open('/');
    expect(document.title).toBe(translate('en', 'seoTitleMenu'));
    expect(document.querySelector('meta[name="description"]').content).toBe(translate('en', 'seoDescription'));
    expect(robots()).toBe('index, follow');
  });

  test('the title follows the language', async () => {
    localStorage.setItem('language', 'id');
    await open('/');
    expect(document.title).toBe(translate('id', 'seoTitleMenu'));
  });

  test('the game screen is not indexed', async () => {
    await open('/game');
    expect(document.title).toBe(translate('en', 'seoTitleGame'));
    expect(robots()).toBe('noindex, follow');
  });

  test('unknown addresses are not indexed', async () => {
    await open('/nothing-here');
    expect(document.title).toBe(translate('en', 'seoTitleNotFound'));
    expect(robots()).toBe('noindex, follow');
  });
});
