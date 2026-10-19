# Kana and kanji data

The characters the app teaches. `src/kanaCharacters.js` builds the
`kanaCharacters` object the app uses from these files; the code never needs
to change to add data.

| File | What it holds |
|---|---|
| `kana/hiragana.json`, `kana/katakana.json` | The kana groups: `{ key: { title, tags, characters: { key: { jp_character, romanji: [], sound } } } }`. A group `title` is what the menu stores in `checkedKanas`, so never rename one. |
| `words.json` | The kana words: `{ key: { jp_character, romanji: [], sound, meaning, meaning_id, tags: [], hiragana_groups: [], katakana_groups: [] } }`. A word is offered once all its groups are selected. Tag `it` = IT and workplace words. |
| `kanji/n5.json` | `categories`: the N5 themes, `{ key, title, title_id, characters: ['一', ...] }`; `kanji`: every N5 entry, `{ jp_character, romanji: [], sound, meaning, meaning_id }`. |
| `kanji/n4.json` | `categories`: the N4 themes, each with its entries: `{ key, title, title_id, kanji: [{ key, jp_character, romanji: [], sound, meaning, meaning_id }] }`. |

Every kanji also needs an entry in `src/kanjiUsage.js` (a word using it),
`src/kanjiUsageMeanings.js` (that word's meaning) and `src/kanjiReadings.js`
(its on'yomi / kun'yomi, also for the kanji of the usage word).

Each theme is split into groups of 10 (`KANJI_PER_GROUP`), titled
`<theme title> - 1`, `- 2`... Those titles are stored in `checkedKanas` too:
adding kanji at the end of a theme is safe, inserting one in the middle moves
the following kanji into another group.

## Checking the data

`src/data/validateKanaData.js` lists every problem (a theme kanji without an
entry, a kanji in two themes, missing readings, a word needing a group that
does not exist...). `src/kanaCharacters.test.js` fails when it finds any, so
run the tests after editing:

```bash
npx vitest run src/kanaCharacters.test.js
```

Then, when the edit brings new characters, `npm run fonts` (it reads the
`.js` and `.json` files of `src`).

## Adding a JLPT level

1. Add `kanji/n3.json` in the format of `n4.json`.
2. Import it in `src/kanaCharacters.js` and add `{ level: 'N3', categories: n3Kanji.categories }` to `kanjiLevels`.
3. Add its kanji to `kanjiUsage.js`, `kanjiUsageMeanings.js` and `kanjiReadings.js`, run the tests and `npm run fonts`.

The menu (`KanaGroup.js`) gets a tab for every level of `kanjiLevels`. The
sentence and grammar practices have their own JLPT filter
(`SENTENCE_JLPT_LEVELS`, `BUNPOU_JLPT_LEVELS` in `src/practiceOptions.js`).
