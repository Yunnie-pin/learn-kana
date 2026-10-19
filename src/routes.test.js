import { gamePath, getBasename, isGamePath, restoreRedirectedPath } from './routes';

// A document whose main script was loaded from the given address
function documentWithScript(src, baseURI) {
  const doc = document.implementation.createHTMLDocument('');
  const script = doc.createElement('script');
  script.setAttribute('src', src);
  doc.head.appendChild(script);
  Object.defineProperty(doc, 'baseURI', { value: baseURI });
  return doc;
}

describe('basename', () => {
  test('is empty at the root of a domain (Docker)', () => {
    expect(getBasename(documentWithScript('./static/js/main.123.js', 'http://localhost:8080/game'))).toBe('');
    expect(getBasename(documentWithScript('/static/js/bundle.js', 'http://localhost:3000/'))).toBe('');
  });

  test('is the sub folder on GitHub Pages, from any page of the app', () => {
    expect(getBasename(documentWithScript('./static/js/main.123.js', 'https://user.github.io/learn-kana/'))).toBe('/learn-kana');
    expect(getBasename(documentWithScript('./static/js/main.123.js', 'https://user.github.io/learn-kana/game'))).toBe('/learn-kana');
  });

  test('is empty without the main script (tests)', () => {
    expect(getBasename(document.implementation.createHTMLDocument(''))).toBe('');
    expect(getBasename(null)).toBe('');
  });
});

test('game paths', () => {
  expect(gamePath()).toBe('/game');
  expect(gamePath('review')).toBe('/game?mode=review');

  expect(isGamePath('/game', '')).toBe(true);
  expect(isGamePath('/game/', '')).toBe(true);
  expect(isGamePath('/learn-kana/game', '/learn-kana')).toBe(true);
  expect(isGamePath('/learn-kana%E2%88%95game', '')).toBe(true);
  expect(isGamePath('/', '')).toBe(false);
  expect(isGamePath('/learn-kana/', '/learn-kana')).toBe(false);
  // Only the game screen, not any path with "game" in it
  expect(isGamePath('/games-list', '')).toBe(false);
});

describe('coming back from public/404.html (GitHub Pages)', () => {
  const restore = (href) => {
    const url = new URL(href);
    const replaced = [];
    restoreRedirectedPath(url, { replaceState: (state, title, path) => replaced.push(path) });
    return replaced[0];
  };

  test('puts the requested path back', () => {
    expect(restore('https://user.github.io/learn-kana/?/game')).toBe('/learn-kana/game');
    expect(restore('https://user.github.io/learn-kana/?/game&mode=review')).toBe('/learn-kana/game?mode=review');
    expect(restore('https://user.github.io/learn-kana/?/game&a=1~and~b=2#top')).toBe('/learn-kana/game?a=1&b=2#top');
  });

  test('leaves normal addresses alone', () => {
    expect(restore('https://user.github.io/learn-kana/')).toBeUndefined();
    expect(restore('http://localhost:8080/game?mode=review')).toBeUndefined();
  });
});
