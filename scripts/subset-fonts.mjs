// Shrinks the Japanese fonts to the characters the app can show and converts them to WOFF2.
// Run it again after adding kana, words or kanji: npm run fonts
//
// The characters come from every .js file in src (kana, words, kanji, usage examples, UI text),
// plus the full hiragana and katakana blocks, Japanese punctuation and printable ASCII.
import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const outDir = path.join(srcDir, 'fonts', 'subset');

// Source font (kept in the repo so the subset can be regenerated) -> output name
const FONTS = {
  'Klee_One/KleeOne-Regular.ttf': 'KleeOne-Regular.woff2',
  'Kaisei_Tokumin/KaiseiTokumin-Regular.ttf': 'KaiseiTokumin-Regular.woff2',
  'Noto_Serif_JP/NotoSerifJP-Regular.otf': 'NotoSerifJP-Regular.woff2',
  'Shippori_Mincho/ShipporiMincho-Regular.ttf': 'ShipporiMincho-Regular.woff2',
  'Tsukimi_Rounded/TsukimiRounded-Regular.ttf': 'TsukimiRounded-Regular.woff2',
  'YokoMoji/yokomoji.otf': 'yokomoji.woff2',
  'freefont_lefthanded/freefont_lefthanded.otf': 'freefont_lefthanded.woff2',
  'JiyunoTsubasa/JiyunoTsubasa.ttf': 'JiyunoTsubasa.woff2',
  'Yuji_Boku/YujiBoku-Regular.ttf': 'YujiBoku-Regular.woff2',
};

const JAPANESE = /[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/u;

function range(from, to) {
  let text = '';
  for (let code = from; code <= to; code++) text += String.fromCodePoint(code);
  return text;
}

async function listJsFiles(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listJsFiles(fullPath));
    else if (entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

async function collectCharacters() {
  const characters = new Set([
    ...range(0x20, 0x7e),
    ...range(0x3000, 0x303f),
    ...range(0x3041, 0x309f),
    ...range(0x30a0, 0x30ff),
  ]);
  for (const file of await listJsFiles(srcDir)) {
    for (const character of await readFile(file, 'utf8')) {
      if (JAPANESE.test(character)) characters.add(character);
    }
  }
  return [...characters].join('');
}

const kb = bytes => `${Math.round(bytes / 1024)} KB`;

const text = await collectCharacters();
console.log(`${[...text].length} characters`);
await mkdir(outDir, { recursive: true });

let before = 0;
let after = 0;
for (const [source, output] of Object.entries(FONTS)) {
  const sourcePath = path.join(srcDir, 'fonts', source);
  const subset = await subsetFont(await readFile(sourcePath), text, { targetFormat: 'woff2' });
  await writeFile(path.join(outDir, output), subset);
  const sourceSize = (await stat(sourcePath)).size;
  before += sourceSize;
  after += subset.length;
  console.log(`${output.padEnd(32)} ${kb(sourceSize).padStart(9)} -> ${kb(subset.length)}`);
}
console.log(`${'total'.padEnd(32)} ${kb(before).padStart(9)} -> ${kb(after)}`);
