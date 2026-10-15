import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
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

describe('practicing mix-ups', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const setConfusions = (confusions) => localStorage.setItem('kanaConfusions', JSON.stringify(confusions));
  const recent = (count) => ({ count, last: Date.now() - DAY });

  test('the menu has no mix-up banner', async () => {
    setConfusions({ 'ツ': { 'シ': recent(4) } });
    await open('/');
    expect(document.querySelector('.mixup-call')).toBeNull();
  });

  test('a mix-up game shows only those kana, whatever groups are selected', async () => {
    // Only the あ group is selected, the mix-ups are katakana
    setConfusions({ 'ツ': { 'シ': recent(4) }, 'ソ': { 'ン': recent(2) } });
    await open('/game?mode=mixups');
    expect(path()).toBe('/game');
    expect(score()).toHaveTextContent(translate('en', 'gameScoreMixups').trim());
    const shown = new Set();
    for (let round = 0; round < 12; round++) {
      shown.add(displayed());
      // Answer it to move on to the next kana
      const romaji = { 'シ': 'shi', 'ツ': 'tsu', 'ソ': 'so', 'ン': 'n' }[displayed()];
      expect(romaji).toBeDefined();
      await act(async () => {
        romaji.split('').forEach(key => fireEvent.keyDown(window, { key }));
        await new Promise(resolve => setTimeout(resolve, 250));
      });
    }
    expect([...shown].every(kana => ['シ', 'ツ', 'ソ', 'ン'].includes(kana))).toBe(true);
  });

  test('a mix-up game can practice a single pair', async () => {
    setConfusions({ 'ツ': { 'シ': recent(4) }, 'ソ': { 'ン': recent(2) } });
    await open({ pathname: '/game', search: '?mode=mixups', state: { characters: ['ソ', 'ン'] } });
    expect(['ソ', 'ン']).toContain(displayed());
  });

  test('without mix-ups it goes back to the menu and says why', async () => {
    await open('/game?mode=mixups');
    expect(path()).toBe('/');
    expect(screen.getByRole('alert')).toHaveTextContent(translate('en', 'gameErrorNoMixups'));
  });

  test('the summary offers to practice the kana mixed up in that game', async () => {
    await open('/game');
    // Answer the shown vowel with another vowel's reading: a mix-up
    const shownKana = displayed();
    const romaji = { 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o' };
    const [otherKana, otherRomaji] = Object.entries(romaji).find(([kana]) => kana !== shownKana);
    fireEvent.keyDown(window, { key: otherRomaji });
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 650));
    });

    const call = document.querySelector('.mixup-call-summary');
    expect(call).toHaveTextContent([shownKana, otherKana].sort().join(' ⇄ '));
    await act(async () => {
      fireEvent.click(call.querySelector('button'));
    });
    expect(router.state.location.search).toBe('?mode=mixups');
    expect([shownKana, otherKana]).toContain(displayed());
  });

  test('no call in the summary when nothing was mixed up', async () => {
    await open('/game');
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 650));
    });
    expect(document.querySelector('.inGameUserGameScoreWindow')).toBeInTheDocument();
    expect(document.querySelector('.mixup-call-summary')).toBeNull();
  });
});

describe('About window', () => {
  test('the navbar has no author credit, its GitHub button opens the About window', async () => {
    await open('/');
    expect(document.querySelector('.navbar')).not.toHaveTextContent('Eldoprano');
    expect(screen.queryByRole('dialog', { name: 'Learn Kana' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: translate('en', 'navbarAbout') }));
    const dialog = screen.getByRole('dialog', { name: 'Learn Kana' });
    expect(dialog).toHaveTextContent(translate('en', 'aboutOpenSource'));

    const links = [...dialog.querySelectorAll('a')].map(link => link.getAttribute('href'));
    expect(links).toContain('https://github.com/Yunnie-pin/learn-kana');
    expect(links).toContain('https://github.com/Eldoprano/learn-kana');
    expect(dialog).toHaveTextContent('Yunnie-pin/learn-kana');
    expect(dialog).toHaveTextContent('Eldoprano/learn-kana');
    // Links open in a new tab, the app stays where it was
    dialog.querySelectorAll('a').forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
    // The close button gets the focus, for keyboard users
    expect(document.activeElement).toBe(screen.getByRole('button', { name: translate('en', 'aboutClose') }));
  });

  test('closes with Escape, the close button or a click outside', async () => {
    await open('/');
    const openAbout = () => fireEvent.click(screen.getByRole('button', { name: translate('en', 'navbarAbout') }));

    openAbout();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();

    openAbout();
    fireEvent.click(screen.getByRole('button', { name: translate('en', 'aboutClose') }));
    expect(screen.queryByRole('dialog')).toBeNull();

    openAbout();
    fireEvent.click(document.querySelector('.about-dialog-background'));
    expect(screen.queryByRole('dialog')).toBeNull();

    // A click inside the window keeps it open
    openAbout();
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('in Indonesian', async () => {
    localStorage.setItem('language', 'id');
    await open('/');
    fireEvent.click(screen.getByRole('button', { name: translate('id', 'navbarAbout') }));
    expect(screen.getByRole('dialog')).toHaveTextContent(translate('id', 'aboutForkedFrom'));
  });
});

test('the Learning Progress tooltip shows the mastery and what lowers it', async () => {
  const DAY = 24 * 60 * 60 * 1000;
  // あ: right 3 times out of 3 in 0.86s, 14 days ago (100% accuracy, 83% mastery)
  localStorage.setItem('userStats', JSON.stringify({
    'あ': {
      totalTimesShown: 3,
      totalRightGuesses: 3,
      totalWrongGuesses: 0,
      totaltotalResponseTime: 2580,
      dailyPerformance: [{ date: Date.now() - 14 * DAY, rightGuesses: 3, wrongGuesses: 0, responseTimeSum: 2580 }],
    },
  }));
  await open('/');
  fireEvent.click(document.querySelector('.stats-button-floating'));
  const tile = [...document.querySelectorAll('.progress-stats-grid-item')].find(item => item.textContent.startsWith('あ'));
  fireEvent.mouseEnter(tile);

  const tooltip = document.querySelector('.progress-stats-tooltip');
  expect(tooltip).toHaveTextContent(translate('en', 'masteryValue', { percent: 83 }));
  expect(tooltip).toHaveTextContent(translate('en', 'statsAccuracy', { percent: 100 }));
  const reasons = [...tooltip.querySelectorAll('.progress-stats-tooltip-mastery-reasons li')].map(li => li.textContent);
  expect(reasons).toEqual([
    translate('en', 'masteryLossExperience', { count: 3, needed: 20 }) + '−9',
    translate('en', 'masteryLossRetention', { days: 14 }) + '−6',
    translate('en', 'masteryLossSpeed', { seconds: '0.86' }) + '−3',
  ]);
});

test('the menu fades the edge of the mode options while more are hidden below', async () => {
  await open('/');
  const side = document.querySelector('.game-menu-side');
  const options = document.querySelector('.game-mode-selector');
  // jsdom has no layout: give the options list a size
  Object.defineProperty(options, 'scrollHeight', { configurable: true, value: 1000 });
  Object.defineProperty(options, 'clientHeight', { configurable: true, value: 300 });

  options.scrollTop = 0;
  fireEvent.scroll(options);
  expect(side).toHaveClass('has-more-below');

  options.scrollTop = 700;
  fireEvent.scroll(options);
  expect(side).not.toHaveClass('has-more-below');
});

describe('character order', () => {
  const romaji = { 'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko' };
  async function answerShown() {
    await act(async () => {
      romaji[displayed()].split('').forEach(key => fireEvent.keyDown(window, { key }));
      await new Promise(resolve => setTimeout(resolve, 250));
    });
  }

  test('in order: the kana table order, starting again at the end', async () => {
    practiceCharacters(['あ', 'か']);
    localStorage.setItem('game-mode-order', 'sequential');
    await open('/game');
    const shown = [];
    for (let round = 0; round < 12; round++) {
      shown.push(displayed());
      await answerShown();
    }
    expect(shown.join('')).toBe('あいうえおかきくけこあい');
  });

  test('random: not the table order', async () => {
    practiceCharacters(['あ', 'か']);
    localStorage.setItem('game-mode-order', 'random');
    await open('/game');
    const shown = [];
    for (let round = 0; round < 10; round++) {
      shown.push(displayed());
      await answerShown();
    }
    // 10 random picks matching the table order by chance is (1/10)^9
    expect(shown.join('')).not.toBe('あいうえおかきくけこ');
  });

  test('Try Problematics keeps picking what needs practice, even in order mode', async () => {
    practiceCharacters(['あ']);
    localStorage.setItem('game-mode-order', 'sequential');
    await open({ pathname: '/game', state: { characters: ['お'] } });
    expect(displayed()).toBe('お');
  });
});

test('words practice with the IT topic only shows IT words', async () => {
  const { kanaCharacters } = require('./kanaCharacters.js');
  const allKanaGroups = ['hiragana', 'katakana'].flatMap(script => Object.values(kanaCharacters[script]).map(group => group.title));
  const itWords = Object.values(kanaCharacters.words).filter(word => (word.tags || []).includes('it'));
  localStorage.setItem('checkedKanas', JSON.stringify(allKanaGroups));
  localStorage.setItem('game-mode-practice', 'words');
  localStorage.setItem('game-mode-word', 'true');
  localStorage.setItem('game-mode-word-topic', 'it');
  await open('/game');
  for (let round = 0; round < 8; round++) {
    const word = itWords.find(item => item.jp_character === displayed());
    expect(word).toBeDefined();
    await act(async () => {
      word.romanji[0].split('').forEach(key => fireEvent.keyDown(window, { key }));
    });
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Enter' });
    });
  }
});

test('words practice with only kanji groups selected shows kanji words', async () => {
  const { kanaCharacters } = require('./kanaCharacters.js');
  const { getListOfKanjiWords } = require('./practiceList.js');
  const kanjiGroups = Object.values(kanaCharacters.kanji).map(group => group.title);
  const kanjiWords = getListOfKanjiWords(kanjiGroups);
  localStorage.setItem('checkedKanas', JSON.stringify(kanjiGroups));
  localStorage.setItem('game-mode-practice', 'words');
  localStorage.setItem('game-mode-word', 'true');

  // The menu counts them
  await open('/');
  expect(document.querySelector('.game-menu-summary')).toHaveTextContent(String(kanjiWords.length));
  expect(document.querySelector('.game-menu-start a')).toBeInTheDocument();
  cleanup();

  // The game shows them and takes their romaji
  await open('/game');
  const word = kanjiWords.find(item => item.jp_character === displayed());
  expect(word).toBeDefined();
  await act(async () => {
    word.romanji[0].split('').forEach(key => fireEvent.keyDown(window, { key }));
  });
  expect(score()).toHaveTextContent('1');
});

describe('kanji readings with kanji words', () => {
  const { kanaCharacters } = require('./kanaCharacters.js');
  const { getListOfKanjiWords } = require('./practiceList.js');
  const { kanjiReadings } = require('./kanjiReadings.js');
  const kanjiGroups = Object.values(kanaCharacters.kanji).map(group => group.title);

  async function answerKanjiWord(readingsOn) {
    localStorage.setItem('checkedKanas', JSON.stringify(kanjiGroups));
    localStorage.setItem('game-mode-practice', 'words');
    localStorage.setItem('game-mode-word', 'true');
    localStorage.setItem('game-mode-kanji-readings', String(readingsOn));
    await open('/game');
    const word = getListOfKanjiWords(kanjiGroups).find(item => item.jp_character === displayed());
    // Not shown before answering: they would give the answer away
    expect(document.querySelector('#in-game-solution')).toHaveClass('hidden-element');
    await act(async () => {
      word.romanji[0].split('').forEach(key => fireEvent.keyDown(window, { key }));
    });
    return word;
  }

  test('on: once answered, every kanji of the word with its on / kun readings', async () => {
    const word = await answerKanjiWord(true);
    const kanji = [...new Set([...word.jp_character])].filter(character => kanjiReadings[character]);
    const blocks = [...document.querySelectorAll('#in-game-solution .kanji-word-reading')];
    expect(blocks.map(block => block.querySelector('.kanji-word-reading-character').textContent)).toEqual(kanji);
    expect(blocks[0]).toHaveTextContent(translate('en', 'kanjiOnShort'));
    expect(blocks[0]).toHaveTextContent(translate('en', 'kanjiKuShort'));
  });

  test('off: no readings', async () => {
    await answerKanjiWord(false);
    expect(document.querySelector('.kanji-word-reading')).toBeNull();
  });
});
