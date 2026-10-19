import fs from 'fs';
import path from 'path';

/*
 * Text colours keep a readable contrast (WCAG AA: 4.5:1 for normal text) on
 * the light theme's teal and the dark theme's grey. Secondary text uses
 * --text-muted instead of fading the orange with opacity, which went down to
 * about 2.3:1.
 */
const css = ['App.css', 'InGame.css'].map(file => fs.readFileSync(path.join(__dirname, file), 'utf8')).join('\n');

function luminance(hex) {
  const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(value => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const LIGHT_BACKGROUND = '#155263';
const DARK_BACKGROUND = '#2a373d';

test('secondary text is readable on both themes', () => {
  const muted = /--text-muted:\s*(#[0-9a-f]{6})/i.exec(css)[1];
  expect(contrast(muted, LIGHT_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(muted, DARK_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
});

test('no text in the grey-blue that was nearly invisible on teal (furigana, romaji)', () => {
  expect(contrast('#445760', LIGHT_BACKGROUND)).toBeLessThan(1.5);
  expect(css).not.toMatch(/color:\s*#445760/i);
});

test('the main text of the Dictionary cards is readable on both themes', () => {
  const strong = /--text-strong:\s*(#[0-9a-f]{6})/i.exec(css)[1];
  expect(contrast(strong, LIGHT_BACKGROUND)).toBeGreaterThanOrEqual(7);
  expect(contrast(strong, DARK_BACKGROUND)).toBeGreaterThanOrEqual(7);
});
