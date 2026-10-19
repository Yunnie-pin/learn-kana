import fs from 'fs';
import path from 'path';
import { LANGUAGES, translate } from './i18n';
import { en } from './locales/en.js';
import { id } from './locales/id.js';

const locales = { en, id };

// Any param a text may ask for: a number that reads as a plural
const anyParams = new Proxy({}, { get: () => 2 });

test('every language of the menu has its texts', () => {
  expect(LANGUAGES.map(language => language.code).sort()).toEqual(Object.keys(locales).sort());
});

test.each(Object.keys(locales).filter(code => code !== 'en'))('%s has the same keys as English', code => {
  const keys = Object.keys(locales[code]);
  expect(Object.keys(en).filter(key => !keys.includes(key))).toEqual([]);
  expect(keys.filter(key => !(key in en))).toEqual([]);
});

test.each(Object.keys(locales))('every %s text gives a text, also with params', code => {
  for (const key of Object.keys(locales[code])) {
    const text = translate(code, key, anyParams);
    expect(typeof text).toBe('string');
    expect(text).not.toMatch(/undefined|NaN|\[object/);
  }
});

// Every t('key') / translate(language, 'key') written in the code has a text
// (keys built at run time, like t(item.key), are checked where they are listed)
test('every key used in the code exists', () => {
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.js$/.test(entry.name) && !/\.test\.js$/.test(entry.name)) files.push(full);
    }
  };
  walk(__dirname);
  const missing = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\b(?:t|translate\([^,()]+,)\s*\(?\s*'([A-Za-z0-9_]+)'/g)) {
      if (!(match[1] in en)) missing.push(`${path.relative(__dirname, file)}: ${match[1]}`);
    }
  }
  expect(missing).toEqual([]);
});

// A text no code asks for is left over from a removed feature. Keys built at
// run time are listed here with the code that builds them.
const KEYS_BUILT_AT_RUN_TIME = [];

test('every key is used by the code', () => {
  let source = '';
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'locales') walk(full); }
      else if (/\.js$/.test(entry.name) && !/\.test\.js$/.test(entry.name)) source += fs.readFileSync(full, 'utf8');
    }
  };
  walk(__dirname);
  const unused = Object.keys(en).filter(key =>
    !KEYS_BUILT_AT_RUN_TIME.includes(key) && !new RegExp(`\\b${key}\\b`).test(source));
  expect(unused).toEqual([]);
});
