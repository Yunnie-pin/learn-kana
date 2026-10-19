# AGENT.md

This file provides guidance to AI Code (claude.ai/code, gpt, and some ai agent) when working with code in this repository.

## What this is

A client-only React (Create React App via CRACO) PWA for practicing kana, kanji, words and Japanese sentences. There is no backend: all progress, settings and selections live in browser `localStorage`. Keep it deployable as a static build (served by nginx in Docker, or GitHub/Cloudflare Pages). The UI is in English and Indonesian.

## Commands

```bash
npm install
npm start                                   # dev server, http://localhost:3000
npm run build                               # production build in ./build
npm run fonts                               # re-subset the Japanese fonts (see below)
node scripts/generateSentences.mjs          # regenerate the sentence data (see below)

# Tests (Jest via craco; CI=true makes it run once instead of watching)
CI=true npx craco test --watchAll=false
CI=true npx craco test --watchAll=false --testPathPattern sentenceMatching   # one file
CI=true npx craco test --watchAll=false --testPathPattern longPractice -t "particle"   # one test
```

There is no lint script; CRA's ESLint (`react-app`) runs during `npm start` / `npm run build`, and `CI=true npm run build` fails on lint warnings. GitHub Actions (`.github/workflows/test.yml`) runs `npm ci` + the test suite on Node 20 for pushes to `main` and for pull requests.

## Architecture

**Routing** (`src/routes.js`, `src/router.js`): the navbar has two tabs, Games at `/` (the menu, `App` → `GameMenu`) and Dictionary at `/dictionary` (`src/pages/Dictionary.js`, data and search in `src/dictionary.js`); the game is at `/game`. Keep every route one level deep (see `routes.js`). Only the menu is in the first download: the other pages are `React.lazy` in `router.js` (the `Suspense` is in `Layout`, which also renders the one `Navbar` of the tabbed pages). The sentence data (`sentences.js`, `bunpou.js` and what imports them) must stay out of the menu's static imports: the menu loads it with `import()` when a sentence or grammar practice is picked, and the menu options live in `practiceOptions.js`. The old `/learn-kana` and `/learn-kana∕game` addresses (`∕` is U+2215 DIVISION SLASH) redirect to the new ones.

**Storage** (`src/storage.js`): read and write through its helpers (`readJson`, `write`, `readUserStats` / `writeUserStats`, `readSelectedGroups` / `writeSelectedGroups`): they never throw on corrupt data, blocked storage or a full quota (a failed save fires `STORAGE_FULL_EVENT`, which the navbar notifications pick up). When the layout of a stored value changes, add a function at the end of `MIGRATIONS` (never edit a shipped one); migrations run at startup and after a backup is restored.

**Settings flow through localStorage, not props.** The menu (`GameMenu`, `GameModeSelector`, `KanaGroup`, `CheckMark`) writes keys such as `checkedKanas` (selected group titles), `game-mode-practice` (`characters` | `words` | `mixed` | `long` = sentences), `game-mode-touch`, `game-mode-auto-next`, `game-mode-hints`, `game-mode-sentence-*`, `gameMode` (session limit); the game screen reads them when it mounts. New settings follow the `game-mode-*` naming. Per-character stats are in `userStats`, keyed by the shown `jp_character` (for sentences: the whole sentence) and used by the weighted picker `selectNextCharacter`.

**The game screen** is mostly `src/components/InGameCharacterShowAndInput.js` (`src/pages/InGame.js` only wraps it). Logic that needs no React lives in `src/game/` (`questions.js`: `QUESTION_TYPES`, what each kind of question does after a correct answer, whether it takes kana input, records mix-ups or is read aloud, and `createQuestion`, the shown text, accepted answers, solution, meaning and `hintSteps` of a picked entry; `selectNextCharacter.js`: the weighted pick; `userStatsUpdates.js`: how answers update `userStats`). A new kind of question starts there: a `QUESTION_TYPES` entry and its case in `createQuestion`, then only its rendering in the component, with unit tests in `src/game/game.test.js`; the kanji readings and the kanji-word hint are components in `src/components/game/KanjiBreakdown.js`. The question list of characters / words / mixed games is `getListForPractice` in `practiceList.js`, shared with the Learning Progress window. Move more out the same way rather than growing the component. Things to know before editing it:
- The typed answer is managed by direct DOM manipulation of `#in-game-text-input-before-cursor` / `-after-cursor`, plus a hidden `<input>` for mobile keyboards; checks read `textContent` from those elements.
- The keyboard/input handlers are registered once in a `useEffect([], ...)`, so they see stale state. Anything they need that changes per question must be in a ref (`questionAnsweredRef`, `currentCharacterTypeRef`, `sentenceHelpRef`, ...), not in state.
- `questionAnsweredRef` blocks all input between a correct answer and the next question; without it extra keys re-count the answer and stack Enter listeners.
- Navigation state picks what is practiced: `{ characters }` filters the selected groups (Try Problematics), `{ characters, anyGroup: true }` practices those entries from every group in `mixed` mode, typed (Dictionary "Practice"); Play again keeps the `anyGroup` state.
- Question types (`kana`, `kanji`, `word`, `long`) share one flow: `showNewCharacter` (builds the question with `createQuestion`) → `checkAnswer` → the `afterCorrect` of its `QUESTION_TYPES` entry. Sentences (`long`) use the matcher from `sentenceMatching.js` instead of the exact-string answer list.

**Character data** lives in `src/data/*.json` (kana groups, words, kanji themes per JLPT level; see `src/data/README.md`). `src/kanaCharacters.js` only builds the `kanaCharacters` object from it (kanji themes split into groups of 10, plus `kanjiUsage.js`, `kanjiUsageMeanings.js` and `kanjiReadings.js`). The data is checked by `src/data/validateKanaData.js` in the tests, not at runtime. Add a JLPT level as a new JSON file and an entry in `kanjiLevels`. Group `title`s are what `checkedKanas` stores.

**Sentence pipeline** — the most interconnected part:
- `scripts/generateSentences.mjs` builds sentences from word banks × grammar templates, with per-template quotas, and writes two generated files: `src/generatedSentences.js` and `src/generatedGlossary.js` (meanings of conjugated words). Never edit those two by hand. It validates every sentence (only kanji taught in `kanaCharacters.js`; every kanji run must be in its `furiganaByKanjiRun` dictionary) and also checks the furigana of the hand-written sentences. Output is deterministic (seeded shuffle), so re-running without changes produces no diff.
- `src/sentences.js`: hand-written sentences + the generated ones; `getReadableSentences` keeps only sentences whose kana/kanji groups are all selected, and `getPracticeSentences` adds the menu filters (length, pattern, JLPT, exercise).
- Sentence entries: `romanji` is word-spaced Hepburn (spaces matter: each word is lined up with the Japanese characters), `particles` are character indices, `furigana` maps kanji indices to readings, and templates may set `jlpt` (`N4`) and `pattern` (otherwise inferred from the ending).
- `src/sentenceMatching.js`: aligns romaji words to characters (via furigana + wanakana), accepts alternative spellings (Kunrei-shiki, long vowels, は=ha, kana input), and builds the per-exercise questions (type / listen / particle / arrange).
- `src/sentenceGlossary.js`: the word-by-word breakdown shown after a correct answer (meanings from kanaCharacters + generated + hand-written glossary, and particle roles).
- Tests enforce data integrity over **all** sentences: every sentence aligns, every typed prefix of every answer stays "on track", and every word has a meaning in both languages. After adding sentences or templates, run the generator and then the test suite.

**i18n**: UI strings live in `src/locales/<code>.js`, one file per language (`en.js` is the reference; a value is a string or a function of the params), wired up in `src/i18n.js` (`LANGUAGES`, `translations`). Every key goes in every language: `src/i18n.test.js` checks the keys match, every text renders with params, every `t('key')` in the code exists and no key is unused (keys built at run time go in its `KEYS_BUILT_AT_RUN_TIME`). Indonesian meanings of data use `meaning_id` fields.

**Fonts**: Japanese fonts in `src/fonts` are subset to the characters the app uses. After adding kana, words, kanji or sentences with new characters, run `npm run fonts` (it scans every `.js` file in `src`).

## Tests

Tests live next to the code (`src/**/*.test.js`). Game-screen tests render `InGameCharacterShowAndInput` and drive it with `fireEvent.keyDown(window, { key })`. Since questions are picked at random, tests pin one by selecting groups that make exactly one word or sentence readable (e.g. `['か','ら','は','だ','さ', <kanji group of 水>]` → only これは水です). A test that ends while an answer is shown should tap Next, or its Enter listener leaks into the next test.

## Conventions

- Plain CSS files (`App.css`, `InGame.css`), not CSS modules. Note that `#in-game-text-input-cursor-group span` floats every span inside the answer field.
- Keep dependencies minimal; the app must work on mobile browsers and offline (service worker in `src/service-worker.js`).
- Umami analytics is configured with `REACT_APP_UMAMI_*` env vars at build time (`.env.example`); in Docker they are build args.
