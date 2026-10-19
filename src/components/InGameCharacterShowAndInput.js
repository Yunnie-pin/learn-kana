import React from 'react'
import {  useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { GAME_MODES, ROUTES } from '../routes.js'
import { toHiragana } from 'wanakana';
import { kanaCharacters } from '../kanaCharacters.js'
import { getPracticeSentences, getSentenceOptions } from '../sentences.js'
import { kanjiReadings } from '../kanjiReadings.js'
import { getKanjiSrsProgress, getKanjiSrsStage, getNextReview, getSelectedKanjiGroupTitles, getSrsKanjiCharacters, getSrsSession, previewSrsIntervals, recordKanjiSrsAnswer, SRS_GRADES } from '../kanjiSrs.js'
import { getCharacterOrder, getListForPractice, getListOfKanjiWords, getWordTopic, wordInTopic } from '../practiceList.js'
import { findKanaForAnswer, getConfusionPairs, getMixupKana, getSimilarKana, MIXUP_PRACTICE_PAIRS, readConfusions, recordConfusion } from '../confusions.js'
import { chooseTouchOptions } from '../touchAnswers.js'
import { isSpeechSupported, speak, speakIfEnabled } from '../speech.js'
import { createSentenceQuestion } from '../sentenceMatching.js'
import { bunpouFormNote, createBunpouQuestion, getBunpouOptions, getBunpouQuestions } from '../bunpou.js'
import { particleRoleOf, sentenceBreakdown } from '../sentenceGlossary.js'
import Icon from './Icon.js'
import UserGameScoreWindow from './UserGameScoreWindow.js'
import { useLanguage } from '../i18n'

// Every kanji entry by its character: the hint of a kanji word lists them
const kanjiEntryByCharacter = new Map(
  Object.values(kanaCharacters.kanji).flatMap(group => Object.values(group.characters))
    .map(entry => [entry.jp_character, entry])
);

let fontClassList = [
  // "Belanosima",
  "KleeOne",
  "Kaisei_Tokumin",
  "Noto_Serif_JP",
  "Shippori_Mincho",
  "Tsukimi_Rounded",
  "YokoMoji",
  "LeftHanded",
  // "JiyunoTsubasa",
  // "KleeOne",
  "YujiBoku",
]

/* userStats object structure:
{
    "あ": {
        "totalTimesShown": 10, // New: Total times this character has been shown
        "totalRightGuesses": 6,
        "totalWrongGuesses": 1, // Changed from totalTouchWrongGuesses
        "totalWrongSubmissions": 2, // New: Total wrong complete submissions (keyboard mode)
        "totalEditCount": 15, // New: Total backspace/delete key presses
        "totaltotalResponseTime": 2.36, // Sum of response times for correct guesses
        "totalAskForHelpCounter": 3,
        "currentGameStats": { // Stats for the current session/game
          "rightGuesses":1,
          "wrongGuesses":0, // Changed from touchWrongGuesses
          "wrongSubmissions":0, // New: Wrong complete submissions this session
          "editCount":3, // New: Backspace/delete presses this session
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        },
        "dailyPerformance": [ // New: Array to store daily performance metrics
            {
                "date": 1678886400000, // Timestamp for the day (e.g., midnight UTC)
                "rightGuesses": 3,
                "wrongGuesses": 1,
                "wrongSubmissions": 2, // New: Wrong complete submissions this day
                "editCount": 8, // New: Backspace/delete presses this day
                "askForHelpCounter": 1,
                "responseTimeSum": 1.45 // Sum of response times for correct guesses this day
            }

            // ... more entries for other days
        ],
        "last7DaysStats": [ // Potentially deprecated or to be phased out in favor of dailyPerformance
            {
                "date": 12379898722,
                "rightGuesses": 3,
                "wrongGuesses": 1, // Changed from TouchwrongGuesses
                "totalResponseTime": 1.45,
                "askForHelpCounter": 1
            }
        ]
    }
}
*/
if (localStorage.getItem('userStats') === null) {
  localStorage.setItem('userStats', "{}")
}

// This timer is set to current time when a new kana is showned. 
// We use it to calculate how long it takes the user to respond.
let kanaTimeToAnswerTimer = 0;
let inGameKanaOnScreen = "";

function normalizeAnswer(answer) {
  return String(answer ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\s-]/g, '');
}

// previous: the character shown right before, never shown twice in a row
// when there is anything else to show
async function selectNextCharacter(charactersToShow, previous = null) {
  let userStats = JSON.parse(localStorage.getItem('userStats')) || {};
  let weightedCharacters = [];
  const baseWeight = 50;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();

  // First pass: collect performance metrics for all characters
  let characterMetrics = [];

  for (const character of charactersToShow) {
    const stats = userStats[character.jp_character];
    let errorRate = 0;
    let avgResponseTime = 0;
    let avgEditCount = 0;
    let wrongSubmissionRate = 0;
    let hasData = false;

    if (stats && stats.dailyPerformance && stats.dailyPerformance.length > 0) {
      let recentRightGuesses = 0;
      let recentWrongGuesses = 0;
      let recentAskForHelpCounter = 0;
      let recentResponseTimeSum = 0;
      let recentEditCount = 0;
      let recentWrongSubmissions = 0;

      stats.dailyPerformance.forEach(daily => {
        if (daily.date >= thirtyDaysAgoTimestamp) {
          recentRightGuesses += daily.rightGuesses || 0;
          recentWrongGuesses += daily.wrongGuesses || 0;
          recentAskForHelpCounter += daily.askForHelpCounter || 0;
          recentResponseTimeSum += daily.responseTimeSum || 0;
          recentEditCount += daily.editCount || 0;
          recentWrongSubmissions += daily.wrongSubmissions || 0;
        }
      });

      const totalAttempts = recentRightGuesses + recentWrongGuesses + recentAskForHelpCounter;

      if (totalAttempts > 0) {
        // Sentences take longer and get more edits the longer they are: compare
        // them per 10 typed letters, so long sentences aren't picked just for
        // being long
        const lengthFactor = character.type === 'long'
          ? 10 / Math.max(1, String([].concat(character.romanji)[0] || '').replace(/ /g, '').length)
          : 1;
        errorRate = (recentWrongGuesses + recentAskForHelpCounter) / totalAttempts;
        avgResponseTime = recentRightGuesses > 0 ? recentResponseTimeSum / recentRightGuesses * lengthFactor : 0;
        avgEditCount = recentRightGuesses > 0 ? recentEditCount / recentRightGuesses * lengthFactor : 0;
        wrongSubmissionRate = totalAttempts > 0 ? recentWrongSubmissions / totalAttempts : 0;
        hasData = true;
      }
    }

    characterMetrics.push({
      character,
      errorRate,
      avgResponseTime,
      avgEditCount,
      wrongSubmissionRate,
      hasData
    });
  }

  // Calculate median values for characters with data
  const charsWithData = characterMetrics.filter(m => m.hasData);

  let medianErrorRate = 0;
  let medianResponseTime = 0;
  let medianEditCount = 0;
  let medianWrongSubmissionRate = 0;

  if (charsWithData.length > 0) {
    const sortedByError = [...charsWithData].sort((a, b) => a.errorRate - b.errorRate);
    const sortedByTime = [...charsWithData].sort((a, b) => a.avgResponseTime - b.avgResponseTime);
    const sortedByEdits = [...charsWithData].sort((a, b) => a.avgEditCount - b.avgEditCount);
    const sortedByWrongSub = [...charsWithData].sort((a, b) => a.wrongSubmissionRate - b.wrongSubmissionRate);

    const midPoint = Math.floor(sortedByError.length / 2);
    medianErrorRate = sortedByError.length % 2 === 0
      ? (sortedByError[midPoint - 1].errorRate + sortedByError[midPoint].errorRate) / 2
      : sortedByError[midPoint].errorRate;

    medianResponseTime = sortedByTime.length % 2 === 0
      ? (sortedByTime[midPoint - 1].avgResponseTime + sortedByTime[midPoint].avgResponseTime) / 2
      : sortedByTime[midPoint].avgResponseTime;

    medianEditCount = sortedByEdits.length % 2 === 0
      ? (sortedByEdits[midPoint - 1].avgEditCount + sortedByEdits[midPoint].avgEditCount) / 2
      : sortedByEdits[midPoint].avgEditCount;

    medianWrongSubmissionRate = sortedByWrongSub.length % 2 === 0
      ? (sortedByWrongSub[midPoint - 1].wrongSubmissionRate + sortedByWrongSub[midPoint].wrongSubmissionRate) / 2
      : sortedByWrongSub[midPoint].wrongSubmissionRate;
  }

  // Second pass: assign weights based on comparison to median
  for (const metric of characterMetrics) {
    let weight = baseWeight;

    if (metric.hasData) {
      // Calculate how much worse than median this character is
      const errorDiff = metric.errorRate - medianErrorRate;
      const timeDiff = metric.avgResponseTime - medianResponseTime;
      const editDiff = metric.avgEditCount - medianEditCount;
      const wrongSubDiff = metric.wrongSubmissionRate - medianWrongSubmissionRate;

      // Characters worse than median get more weight
      if (errorDiff > 0) {
        // Error rate above median: increase weight significantly
        weight += errorDiff * 150;
      }

      if (timeDiff > 0 && medianResponseTime > 0) {
        // Response time above median: increase weight
        weight += (timeDiff / 1000) * 20;
      }

      if (editDiff > 0) {
        // More edits than median indicates uncertainty
        weight += editDiff * 10;
      }

      if (wrongSubDiff > 0) {
        // More wrong submissions than median indicates confusion
        weight += wrongSubDiff * 120;
      }

      // Characters better than median get reduced weight
      if (errorDiff < 0) {
        weight += errorDiff * 100; // Reduces weight for low error rates
      }

      if (timeDiff < 0 && medianResponseTime > 0) {
        weight += (timeDiff / 1000) * 10; // Reduces weight for fast responses
      }

      if (editDiff < 0) {
        weight += editDiff * 5; // Slight reduction for low edits
      }

      if (wrongSubDiff < 0) {
        weight += wrongSubDiff * 60; // Reduction for low wrong submissions
      }

    } else {
      // No data: give slightly higher weight to encourage learning new characters
      weight = baseWeight * 1.3;
    }

    weight = Math.max(5, weight); // Ensure minimum weight
    if (previous !== null && metric.character.jp_character === previous && charactersToShow.length > 1) {
      weight = 0;
    }
    weightedCharacters.push({ ...metric.character, weight });
  }

  // Weighted random selection
  let totalWeight = weightedCharacters.reduce((sum, char) => sum + char.weight, 0);

  // Handle cases where all weights are zero (e.g., initial state or after filtering)
  // In such a scenario, pick a character completely at random.
  if (totalWeight === 0) {
    const randomIndex = Math.floor(Math.random() * charactersToShow.length);
    return charactersToShow[randomIndex];
  }

  let randomNum = Math.random() * totalWeight;
  let accumulatedWeight = 0;

  for (const char of weightedCharacters) {
    accumulatedWeight += char.weight;
    if (char.weight > 0 && randomNum <= accumulatedWeight) {
      return char;
    }
  }

  // Fallback in case something goes wrong (should ideally not be reached)
  return charactersToShow[Math.floor(Math.random() * charactersToShow.length)];
}

export default function InGameCharacterShowAndInput() {
  const { t, meaningOf, language } = useLanguage();
  const isMacOS = /Mac/i.test(navigator.userAgentData?.platform || navigator.platform);

  /*
    ##########################################
    # Creates and handles the Kana character #
    ##########################################
  */
  const [onScreenKana, setKana] = useState('');
  const [srsCardRevealed, setSrsCardRevealed] = useState(false);
  const [srsCardDragOffset, setSrsCardDragOffset] = useState(0);
  const [srsCardSwipeDirection, setSrsCardSwipeDirection] = useState(null);
  const [onScreenCharacterType, setOnScreenCharacterType] = useState(null);
  // Character indices of the particles in the shown sentence, so they can be highlighted
  const [onScreenParticles, setOnScreenParticles] = useState([]);
  // Furigana of the shown sentence (character index of the kanji -> its kana
  // reading), revealed in small print above the kanji when the player asks for help
  const [onScreenFurigana, setOnScreenFurigana] = useState({});
  const [furiganaVisible, setFuriganaVisible] = useState(false);
  // Sentence practice exercise chosen in the menu: type, listen, particle or
  // arrange (listening needs speech, so it falls back to typing without it)
  const sentenceExercise = useMemo(() => {
    const { exercise } = getSentenceOptions();
    return exercise === 'listen' && !isSpeechSupported() ? 'type' : exercise;
  }, []);
  // The shown sentence question (see createSentenceQuestion in sentenceMatching.js)
  const [sentenceQuestion, setSentenceQuestion] = useState({ exercise: 'type' });
  // Sentence practice: checks the typed sentence word by word (see sentenceMatching.js)
  const sentenceMatcherRef = useRef(null);
  const sentenceQuestionRef = useRef({ exercise: 'type' });
  // Words of the shown sentence already typed, to mark them in the sentence
  const [sentenceWordsDone, setSentenceWordsDone] = useState(0);
  const sentenceWordsDoneRef = useRef(0);
  // Listening: the sentence text stays hidden until help or a correct answer
  const [sentenceTextVisible, setSentenceTextVisible] = useState(false);
  const [sentenceAnswered, setSentenceAnswered] = useState(false);
  // Help in sentence practice comes in steps (see handleUserAskForHelp); the
  // last step is a hint shown under the sentence, once per word
  const [sentenceHint, setSentenceHint] = useState(null);
  const sentenceHelpRef = useRef({ step: 0, hintWord: null });
  const [onScreenKanjiUsage, setOnScreenKanjiUsage] = useState(null);
  const [isKanjiUsageQuestion, setIsKanjiUsageQuestion] = useState(false);
  const [onScreenSolution, setSolution] = useState('');
  const [onScreenWordMeaning, setWordMeaning] = useState('');
  const [onScreenScore, setScore] = useState(0);
  const [userGameScoreWindowVisible, setUserGameScoreWindowVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  // Correct answers in a row, resets on a wrong answer or when asking for help
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  // Read by the keyboard handlers (registered once on mount) to ignore input behind the summary window
  const scoreWindowVisibleRef = useRef(false);
  const hasStartedInitialCharacterRef = useRef(false);
  const currentCharacterTypeRef = useRef(null);
  const waitingForKanjiNextRef = useRef(false);
  // Set once the shown question is answered correctly, until the next one is
  // shown: keys pressed in between (a space, Shift, Gboard's auto space...)
  // must not count the same answer again
  const questionAnsweredRef = useRef(false);
  const kanjiAutoAdvanceTimeoutRef = useRef(null);
  // A word / sentence answered with auto next: the pending move to the next
  // question, and without auto next: removes its Enter / tap listeners. Both
  // are undone when the game unmounts (Play again, back to the menu), so they
  // can't act on the next game's screen.
  const advanceTimeoutRef = useRef(null);
  const removeNextListenersRef = useRef(null);
  const inGameAnswerListRef = useRef([]);
  const srsQueueRef = useRef(null);
  // Kanji review progress: cards graded / cards in the session (a forgotten
  // card comes back, so it counts again), what the card on screen is (new,
  // review or forgotten earlier in the session), and what the session did,
  // for its summary
  const [srsProgress, setSrsProgress] = useState({ done: 0, total: 0 });
  const [srsCardKind, setSrsCardKind] = useState('review');
  const srsForgottenRef = useRef(new Set());
  const srsResultRef = useRef({ reviewed: 0, forgot: 0, promoted: 0, learned: 0 });
  const [srsResult, setSrsResult] = useState(null);
  const srsFailedRef = useRef(false);
  // A typed mix-up ("shi" for ツ) is recorded once per character shown
  const confusionRecordedRef = useRef(false);
  const srsCurrentCardRef = useRef(null);
  const srsCardPointerStartRef = useRef(null);
  const srsCardDraggedRef = useRef(false);

  // Hints ("?" key / Hint button) can be turned off in the menu
  const hintsEnabled = localStorage.getItem("game-mode-hints") !== "false";

  // "Give me N Kanas" mode: N is the goal shown next to the score
  const gameModeSetting = JSON.parse(localStorage.getItem("gameMode"));
  const kanaGoal = (gameModeSetting && gameModeSetting.type === "kana-selector" && gameModeSetting.value !== -1)
    ? gameModeSetting.value
    : null;

  // Session-only modes come with the address (see routes.js): ?mode=review is
  // a kanji review, ?mode=mixups practices the kana the user mixes up, and
  // Try Problematics passes its characters in the state
  const location = useLocation();
  // When this game started: the summary offers to practice what was mixed up since
  const [gameStartedAt] = useState(() => Date.now());
  const sessionMode = new URLSearchParams(location.search).get('mode');
  // A review: ?mode=review, or a plain game while the menu's practice is the
  // kanji review (e.g. started from a notification)
  const isSrsPractice = sessionMode === GAME_MODES.review ||
    (!sessionMode && !location.state?.characters && localStorage.getItem('game-mode-practice') === 'srs');
  const isMixupPractice = sessionMode === GAME_MODES.mixups;
  // Practice from the Dictionary: the kana, kanji or words passed in the
  // state, whatever groups and practice type are picked in the menu
  const isDictionaryPractice = !isMixupPractice && Boolean(location.state?.anyGroup) &&
    Array.isArray(location.state?.characters);

  // Mix-ups are practiced from every kana, whatever groups are selected
  const characterGroupsToShow = useMemo(() => {
    if (isMixupPractice || isDictionaryPractice) {
      const scripts = isDictionaryPractice ? ['hiragana', 'katakana', 'kanji'] : ['hiragana', 'katakana'];
      return scripts.flatMap(script => Object.values(kanaCharacters[script]).map(group => group.title));
    }
    const storedCharacterGroups = JSON.parse(localStorage.getItem("checkedKanas") || '[]');
    return Array.isArray(storedCharacterGroups) ? storedCharacterGroups : [];
  }, [isMixupPractice, isDictionaryPractice]);
  const practiceMode = isMixupPractice ? 'characters' : isDictionaryPractice ? 'mixed' : localStorage.getItem('game-mode-practice') ||
    (localStorage.getItem("game-mode-word") === "true" ? "words" : "characters");
  // SRS reviews are always answered by typing, whatever is picked in the menu;
  // so is a Dictionary practice: a few entries are too few wrong options.
  // The grammar practice has its own answer mode, picked in the menu: the
  // missing form is typed, or chosen among four buttons
  const useTouchAnswers = !isSrsPractice && !isDictionaryPractice && practiceMode !== 'bunpou' && localStorage.getItem("game-mode-touch") === "true";
  const bunpouOptions = practiceMode === 'bunpou' ? getBunpouOptions() : null;
  const isBunpouChoice = Boolean(bunpouOptions) && bunpouOptions.answer === 'choice';
  const selectedKanjiGroups = useMemo(() => getSelectedKanjiGroupTitles(), []);
  // A review session: the kanji due again, then the new kanji left for today
  // (NEW_KANJI_PER_DAY), see getSrsSession
  const srsSession = useMemo(
    () => isSrsPractice ? getSrsSession(selectedKanjiGroups) : null,
    [isSrsPractice, selectedKanjiGroups]
  );


  // Creates a list of all possible Kanas/Words to show, the element outputs look like this:
  // { "jp_character": "あ", "romanji": ["a"], "sound": "あ", "type": "kana/word", *"vocal": "a", *"meaning": "dog" }
  // *The key "vocal" only shows up when the type is "kana"
  // *The key "meaning" only shows up when the type is "word"
  // eslint-disable-next-line react-hooks/exhaustive-deps
  let charactersToShow = useMemo(
    () => isSrsPractice
      ? [...srsSession.due, ...srsSession.fresh]
      : getListForPractice(characterGroupsToShow, practiceMode),
    [isSrsPractice, srsSession, characterGroupsToShow, practiceMode]
  );
  if (isSrsPractice && srsQueueRef.current === null) {
    srsQueueRef.current = [...charactersToShow];
  }
  // The session size, once (the queue itself shrinks as cards are shown)
  useEffect(() => {
    if (isSrsPractice) setSrsProgress({ done: 0, total: charactersToShow.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSrsPractice]);

  // Mix-up practice: only the kana of the most frequent mix-ups, or of the
  // pairs passed with the navigation (one pair from Learning Progress, or the
  // ones mixed up during the game that just ended)
  const stateCharacters = Array.isArray(location.state?.characters) ? location.state.characters : null;
  if (isMixupPractice) {
    const mixupKana = stateCharacters ||
      getMixupKana(getConfusionPairs(readConfusions(), MIXUP_PRACTICE_PAIRS));
    charactersToShow = charactersToShow.filter(char => mixupKana.includes(char.jp_character));
  }

  // Filter to problematic characters if that mode is active
  const problematicChars = isMixupPractice ? null : stateCharacters;
  let isProblematicsMode = false;
  if (problematicChars && !isSrsPractice) {
    charactersToShow = charactersToShow.filter(char => problematicChars.includes(char.jp_character));
    isProblematicsMode = true;

    // If filter resulted in no characters, use the original list
    if (charactersToShow.length === 0) {
      isProblematicsMode = false;
      // Restore original list
      charactersToShow = isSrsPractice
        ? getSrsKanjiCharacters(getSelectedKanjiGroupTitles()).due
        : getListForPractice(characterGroupsToShow, practiceMode);
    }
  }

  // Characters practice can go through the selection in the order of the kana
  // table instead of picking by how well each one is known. Only for a normal
  // game: reviews, mix-ups and problematics pick what needs practice.
  const isSequentialOrder = practiceMode === 'characters' && !sessionMode && !isProblematicsMode &&
    getCharacterOrder() === 'sequential';
  const sequentialIndexRef = useRef(0);

  // Be mad at the user if the charactersToShow is empty
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (charactersToShow.length === 0 && !isSrsPractice) {
      navigate(ROUTES.menu, { replace: true, state: { error: t(isMixupPractice ? 'gameErrorNoMixups' : 'gameErrorNoKana') } });
    }
  }, [charactersToShow, isSrsPractice, isMixupPractice, navigate, t]);

  // game-mode-auto-next
  let autoNext = false;
  if (localStorage.getItem("game-mode-auto-next") === "true") {
    autoNext = true;
  }


  function getListOfKanas(charGroups) {
    let output = []
    const selectedGroups = Array.isArray(charGroups) ? charGroups : [];
    Object.entries(kanaCharacters).forEach(([categoryKey, category]) => {
      if (categoryKey === 'words') return;
      Object.entries(category).forEach(([groupKey, charGroup]) => {
        if (!charGroup || !charGroup.title || !selectedGroups.includes(charGroup.title)) return;
        Object.entries(charGroup.characters).forEach(([charKey, char]) => {
          if (!char || typeof char !== 'object') return;
          const normalizedChar = { ...char };
          if (categoryKey === 'kanji') {
            normalizedChar.type = 'kanji';
          } else {
            normalizedChar.vocal = normalizedChar.vocal || charKey;
            normalizedChar.type = 'kana';
          }
          output.push(normalizedChar);
        });
      });
    });
    return output;
  }

  function getListOfWords(charGroups) {
    let output = []
    const selectedGroups = Array.isArray(charGroups) ? charGroups : [];
    // Only the words of the topic picked in the menu (e.g. IT words)
    const wordTopic = getWordTopic();
    Object.entries(kanaCharacters.words).forEach(([key, value]) => {
      let ignoreWord = !wordInTopic(value, wordTopic);
      for (let i = 0; i < value.hiragana_groups.length; i++) {
        if (!selectedGroups.includes(value.hiragana_groups[i])) {
          ignoreWord = true;
        }
      }
      for (let i = 0; i < value.katakana_groups.length; i++) {
        if (!selectedGroups.includes(value.katakana_groups[i])) {
          ignoreWord = true;
        }
      }
      if (!ignoreWord) {
        output.push({
          "jp_character": value.jp_character,
          "romanji": value.romanji,
          "sound": value.sound,
          "meaning": value.meaning,
          "type": "word",
        })
      }
    })
    return output;
  }

  // Sentence practice: real beginner sentences, each one typed as a single
  // romaji answer. Only sentences the player can read with the selected
  // hiragana / katakana / kanji groups are shown, and the meaning is
  // revealed once the sentence is completed.
  function getListOfSentences(charGroups) {
    return getPracticeSentences(charGroups).map(sentence => ({
      "jp_character": sentence.jp_character,
      "romanji": sentence.romanji,
      "particles": sentence.particles || [],
      "furigana": sentence.furigana || {},
      "sound": "",
      "meaning": sentence.meaning,
      "type": "long",
    }));
  }

  function getListForPractice(charGroups, mode) {
    const characters = getListOfKanas(charGroups);
    // Kana words, plus the kanji vocabulary of the selected kanji groups
    // (not in the IT topic: those words have no topic)
    const kanjiWords = getListOfKanjiWords(charGroups).filter(word => wordInTopic(word));
    if (mode === 'mixed') {
      return [...characters, ...getListOfWords(charGroups), ...kanjiWords];
    }
    if (mode === 'words') return [...getListOfWords(charGroups), ...kanjiWords];
    if (mode === 'long') return getListOfSentences(charGroups);
    if (mode === 'bunpou') return getBunpouQuestions(charGroups);
    // "characters": every selected kana and kanji group
    return characters;
  }

  /*
  ##########################################
  # Creates and handles the touch answers #
  ##########################################
  */
  // Kana the user mixes up (or that look alike) are offered as wrong options more often
  function fillTouchAnswers(picked_kana) {
    const similar = picked_kana.type === 'kana' ? getSimilarKana(picked_kana.jp_character) : [];
    const elements = document.querySelectorAll('.in-game-touch-answer>p');
    const options = chooseTouchOptions(picked_kana, charactersToShow, similar, elements.length || 5);
    elements.forEach((element, i) => {
      element.textContent = options[i] || '';
    });
  }

  function resetCurentGameStats() {
    let currentUserStats = JSON.parse(localStorage.getItem('userStats'));
    for (const kana in currentUserStats) {
      if (currentUserStats[kana].currentGameStats === undefined) {
        currentUserStats[kana].currentGameStats = {}
      }
      currentUserStats[kana].currentGameStats.rightGuesses = 0;
      currentUserStats[kana].currentGameStats.wrongGuesses = 0;
      currentUserStats[kana].currentGameStats.wrongSubmissions = 0;
      currentUserStats[kana].currentGameStats.editCount = 0;
      currentUserStats[kana].currentGameStats.totalResponseTime = 0;
      currentUserStats[kana].currentGameStats.askForHelpCounter = 0;
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }

  function updateCurrentGameStats(guessType) {
    if (guessType === "correct") {
      setStreak(prevStreak => prevStreak + 1);
    } else if (guessType === "wrong" || guessType === "askForHelp") {
      setStreak(0);
    }
    const currentTime = Date.now();
    let currentUserStats = JSON.parse(localStorage.getItem('userStats')) || {};
    const character = inGameKanaOnScreen;

    // Initialize stats for the character if it's new
    if (!currentUserStats[character]) {
      currentUserStats[character] = {
        totalTimesShown: 0,
        totalRightGuesses: 0,
        totalWrongGuesses: 0,
        totalWrongSubmissions: 0,
        totalEditCount: 0,
        totaltotalResponseTime: 0,
        totalAskForHelpCounter: 0,
        currentGameStats: { rightGuesses: 0, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, totalResponseTime: 0, askForHelpCounter: 0 },
        dailyPerformance: [],
        // last7DaysStats: [], // Retain if needed for other purposes, or phase out
      };
    } else {
      // Handle migration from totalTouchWrongGuesses to totalWrongGuesses
      if (currentUserStats[character].hasOwnProperty('totalTouchWrongGuesses')) {
        currentUserStats[character].totalWrongGuesses = currentUserStats[character].totalTouchWrongGuesses;
        delete currentUserStats[character].totalTouchWrongGuesses;
      }
      if (currentUserStats[character].currentGameStats && currentUserStats[character].currentGameStats.hasOwnProperty('touchWrongGuesses')) {
        currentUserStats[character].currentGameStats.wrongGuesses = currentUserStats[character].currentGameStats.touchWrongGuesses;
        delete currentUserStats[character].currentGameStats.touchWrongGuesses;
      }
      // Initialize new fields if they don't exist
      if (!currentUserStats[character].hasOwnProperty('totalWrongSubmissions')) {
        currentUserStats[character].totalWrongSubmissions = 0;
      }
      if (!currentUserStats[character].hasOwnProperty('totalEditCount')) {
        currentUserStats[character].totalEditCount = 0;
      }
    }

    // Ensure currentGameStats exists
    if (!currentUserStats[character].currentGameStats) {
        currentUserStats[character].currentGameStats = { rightGuesses: 0, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, totalResponseTime: 0, askForHelpCounter: 0 };
    }
    // Ensure new fields exist in currentGameStats
    if (!currentUserStats[character].currentGameStats.hasOwnProperty('wrongSubmissions')) {
      currentUserStats[character].currentGameStats.wrongSubmissions = 0;
    }
    if (!currentUserStats[character].currentGameStats.hasOwnProperty('editCount')) {
      currentUserStats[character].currentGameStats.editCount = 0;
    }
     // Ensure dailyPerformance array exists
    if (!currentUserStats[character].dailyPerformance) {
        currentUserStats[character].dailyPerformance = [];
    }

    // Update currentGameStats
    if (guessType === "correct") {
      let responseTime = currentTime - kanaTimeToAnswerTimer;
      responseTime = Math.min(responseTime, 10000); // Cap response time at 10 seconds
      currentUserStats[character].currentGameStats.totalResponseTime += responseTime;
      currentUserStats[character].currentGameStats.rightGuesses++;
      // Update overall totals
      currentUserStats[character].totalRightGuesses = (currentUserStats[character].totalRightGuesses || 0) + 1;
      currentUserStats[character].totaltotalResponseTime = (currentUserStats[character].totaltotalResponseTime || 0) + responseTime;
    } else if (guessType === "wrong") {
      currentUserStats[character].currentGameStats.wrongGuesses++;
      currentUserStats[character].totalWrongGuesses = (currentUserStats[character].totalWrongGuesses || 0) + 1;
    } else if (guessType === "wrongSubmission") {
      currentUserStats[character].currentGameStats.wrongSubmissions++;
      currentUserStats[character].totalWrongSubmissions = (currentUserStats[character].totalWrongSubmissions || 0) + 1;
    } else if (guessType === "edit") {
      currentUserStats[character].currentGameStats.editCount++;
      currentUserStats[character].totalEditCount = (currentUserStats[character].totalEditCount || 0) + 1;
    } else if (guessType === "askForHelp") {
      currentUserStats[character].currentGameStats.askForHelpCounter++;
      currentUserStats[character].totalAskForHelpCounter = (currentUserStats[character].totalAskForHelpCounter || 0) + 1;
    }

    // Update dailyPerformance
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Get timestamp for midnight
    const todayTimestamp = today.getTime();

    let dailyEntry = currentUserStats[character].dailyPerformance.find(entry => entry.date === todayTimestamp);

    if (!dailyEntry) {
      dailyEntry = {
        date: todayTimestamp,
        rightGuesses: 0,
        wrongGuesses: 0,
        wrongSubmissions: 0,
        editCount: 0,
        askForHelpCounter: 0,
        responseTimeSum: 0.0
      };
      currentUserStats[character].dailyPerformance.push(dailyEntry);
    }

    if (guessType === "correct") {
      let responseTime = currentTime - kanaTimeToAnswerTimer;
      responseTime = Math.min(responseTime, 10000); // Cap response time at 10 seconds
      dailyEntry.rightGuesses++;
      dailyEntry.responseTimeSum += responseTime;
    } else if (guessType === "wrong") {
      dailyEntry.wrongGuesses++;
    } else if (guessType === "wrongSubmission") {
      dailyEntry.wrongSubmissions++;
    } else if (guessType === "edit") {
      dailyEntry.editCount++;
    } else if (guessType === "askForHelp") {
      dailyEntry.askForHelpCounter++;
    }

    localStorage.setItem('userStats', JSON.stringify(currentUserStats));
  }


  // Function gets called at the beginning and every time the kana changes
  async function showNewCharacter() {
    setSrsCardRevealed(false);

    // Check if the user already answered its kana limits. If so, show stats.
    const gameScoreElement = document.getElementById("in-game-score");
    const gameMode = JSON.parse(localStorage.getItem("gameMode"));
    if (!isSrsPractice && gameMode && gameMode.type === "kana-selector" && gameMode.value !== -1 &&
        gameScoreElement &&
        parseInt(gameScoreElement.textContent.replace(/^\D+/g, ''), 10) >= gameMode.value) {
      setUserGameScoreWindowVisible(true);
      return; // Exit early if score window is shown
    }

    const kanaElement = document.querySelector('#in-game-kana-character');
    if (kanaElement) {
      kanaElement.classList.remove("answer-correct");
    }

    // Never carry the previous character's answer or meaning into the next question.
    document.querySelector('#in-game-kana-solution')?.classList.add('hidden-element');
    document.querySelector('#in-game-kanji-usage')?.classList.add('hidden-element');
    document.querySelector('#in-game-solution')?.classList.add('hidden-element');

    // Get and show the current Kana using the weighted selection logic
    let pickedElement = isSrsPractice
      ? srsQueueRef.current?.shift()
      : isSequentialOrder && charactersToShow.length > 0
        ? charactersToShow[sequentialIndexRef.current++ % charactersToShow.length]
        : await selectNextCharacter(charactersToShow, inGameKanaOnScreen || null);

    if (!pickedElement) {
      if (isSrsPractice) {
        setSrsResult({ ...srsResultRef.current, next: getNextReview(selectedKanjiGroups) });
        setUserGameScoreWindowVisible(true);
        return;
      }
      console.warn("selectNextCharacter returned undefined. Fallback to random selection from charactersToShow.");
      if (charactersToShow.length > 0) {
        pickedElement = charactersToShow[Math.floor(Math.random() * charactersToShow.length)];
      } else {
        // Nothing to show: the effect that checks charactersToShow already
        // went back to the menu with the reason
        return;
      }
    }

    inGameKanaOnScreen = pickedElement.jp_character;
    currentCharacterTypeRef.current = pickedElement.type;
    questionAnsweredRef.current = false;
    srsFailedRef.current = false;
    confusionRecordedRef.current = false;
    srsCurrentCardRef.current = isSrsPractice ? pickedElement : null;
    if (isSrsPractice) {
      setSrsCardKind(
        srsForgottenRef.current.has(pickedElement.jp_character) ? 'relearn'
          : getKanjiSrsProgress()[pickedElement.jp_character] ? 'review'
          : 'new'
      );
    }
    setOnScreenCharacterType(pickedElement.type);

    // Update totalTimesShown
    let currentUserStats = JSON.parse(localStorage.getItem('userStats')) || {};
    if (!currentUserStats[inGameKanaOnScreen]) {
      currentUserStats[inGameKanaOnScreen] = {
        totalTimesShown: 1,
        totalRightGuesses: 0,
        totalWrongGuesses: 0,
        totalWrongSubmissions: 0,
        totalEditCount: 0,
        totaltotalResponseTime: 0,
        totalAskForHelpCounter: 0,
        currentGameStats: { rightGuesses: 0, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, totalResponseTime: 0, askForHelpCounter: 0 },
        dailyPerformance: [],
      };
    } else {
      currentUserStats[inGameKanaOnScreen].totalTimesShown = (currentUserStats[inGameKanaOnScreen].totalTimesShown || 0) + 1;
       // Ensure dailyPerformance exists for older data structures
      if (!currentUserStats[inGameKanaOnScreen].dailyPerformance) {
        currentUserStats[inGameKanaOnScreen].dailyPerformance = [];
      }
       // Handle migration for totalWrongGuesses if necessary from an even older state (pre-totalTouchWrongGuesses)
      if (!currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalWrongGuesses') && !currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalTouchWrongGuesses')) {
        currentUserStats[inGameKanaOnScreen].totalWrongGuesses = 0;
      }
      // Initialize new fields if they don't exist
      if (!currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalWrongSubmissions')) {
        currentUserStats[inGameKanaOnScreen].totalWrongSubmissions = 0;
      }
      if (!currentUserStats[inGameKanaOnScreen].hasOwnProperty('totalEditCount')) {
        currentUserStats[inGameKanaOnScreen].totalEditCount = 0;
      }
    }
    localStorage.setItem('userStats', JSON.stringify(currentUserStats));

    const useKanjiUsageQuestion = !isSrsPractice &&
      pickedElement.type === 'kanji' &&
      pickedElement.usage &&
      practiceMode === 'mixed' &&
      Math.random() < 0.5;
    const questionCharacter = useKanjiUsageQuestion
      ? pickedElement.usage.word
      : pickedElement.jp_character;
    setKana(questionCharacter);
    setOnScreenParticles(
      pickedElement.type === 'long' && Array.isArray(pickedElement.particles)
        ? pickedElement.particles
        : []
    );
    setOnScreenFurigana(
      pickedElement.type === 'long' && pickedElement.furigana
        ? pickedElement.furigana
        : {}
    );
    setFuriganaVisible(false);
    const question = pickedElement.type === 'long'
      ? pickedElement.bunpou
        ? createBunpouQuestion(pickedElement)
        : createSentenceQuestion(pickedElement, sentenceExercise)
      : { exercise: 'type', matcher: null };
    sentenceQuestionRef.current = question;
    setSentenceQuestion(question);
    sentenceMatcherRef.current = question.matcher;
    sentenceWordsDoneRef.current = 0;
    setSentenceWordsDone(0);
    sentenceHelpRef.current = { step: 0, hintWord: null };
    setSentenceHint(null);
    setSentenceTextVisible(false);
    setSentenceAnswered(false);
    // Listening: the sentence is read out as soon as it is shown
    if (pickedElement.type === 'long' && question.exercise === 'listen') {
      speak(pickedElement.jp_character);
    }
    const charTextElement = document.querySelector("#in-game-kana-character>p");
    if (charTextElement) {
      const displayLength = [...questionCharacter].length;
      const showReadingHints = useKanjiUsageQuestion &&
        localStorage.getItem('game-mode-kanji-readings') === 'true';
      charTextElement.dataset.displayLength = String(displayLength);
      charTextElement.style.fontSize = showReadingHints
        ? `min(35vh, ${72 / displayLength}vw)`
        : "35vh";
      charTextElement.setAttribute("data-word-wraped", "false");
    }
    setOnScreenKanjiUsage(pickedElement.type === 'kanji' ? pickedElement.usage : null);
    setIsKanjiUsageQuestion(Boolean(useKanjiUsageQuestion));
    // @ts-ignore
    const readings = Array.isArray(pickedElement.romanji) ? pickedElement.romanji : [pickedElement.romanji];
    const answerReadings = useKanjiUsageQuestion
      ? [pickedElement.usage.romanji]
      : readings;
    const acceptedAnswers = pickedElement.type === 'kanji'
      ? answerReadings.flatMap(reading => [reading, toHiragana(reading)])
      : answerReadings;
    inGameAnswerListRef.current = acceptedAnswers
      .map(normalizeAnswer)
      .filter(Boolean);
    // @ts-ignore
    setSolution(pickedElement.type === 'kanji' ? answerReadings : pickedElement.romanji);
    // @ts-ignore
    if (useKanjiUsageQuestion) {
      setWordMeaning(meaningOf(pickedElement.usage.word, pickedElement.usage.meaning));
    } else if (pickedElement.type === "word" || pickedElement.type === "kanji" ||
               pickedElement.type === "long") {
      // @ts-ignore
      setWordMeaning(meaningOf(pickedElement.jp_character, pickedElement.meaning));
    } else {
      setWordMeaning('');
    }

    const charDisplayElement = document.querySelector('#in-game-kana-character');
    if (charDisplayElement) {
      Array.from(charDisplayElement.classList)
        .filter(cls => cls.startsWith('font-'))
        .forEach(cls => charDisplayElement.classList.remove(cls));

      if (localStorage.getItem("game-mode-random-fonts") === "true") {
        const randomFontIndex = Math.floor(Math.random() * fontClassList.length);
        const fontClass = fontClassList[randomFontIndex];
        charDisplayElement.classList.add("font-" + fontClass);
      } else if (isMacOS) {
        charDisplayElement.classList.add("font-forceDefault");
      }
    }

    if (useTouchAnswers) {
      // @ts-ignore
      fillTouchAnswers({ ...pickedElement, romanji: answerReadings });
    }

    kanaTimeToAnswerTimer = Date.now();

  }

  function advanceToNextKanji() {
    if (!waitingForKanjiNextRef.current) return;
    window.clearTimeout(kanjiAutoAdvanceTimeoutRef.current);
    kanjiAutoAdvanceTimeoutRef.current = null;

    const beforeCursor = document.querySelector('#in-game-text-input-before-cursor');
    const afterCursor = document.querySelector('#in-game-text-input-after-cursor');
    const cursorGroup = document.querySelector('#in-game-text-input-cursor-group');
    const hiddenInput = document.querySelector('#in-game-text-input');
    if (beforeCursor) beforeCursor.textContent = '';
    if (afterCursor) afterCursor.textContent = '';
    if (cursorGroup) cursorGroup.classList.remove('answer-correct', 'answer-wrong');
    if (hiddenInput) hiddenInput.value = '';

    waitingForKanjiNextRef.current = false;
    document.querySelector('#in-game-kana-solution')?.classList.add('hidden-element');
    document.querySelector('#in-game-kanji-usage')?.classList.add('hidden-element');
    document.querySelector('#in-game-next-button')?.classList.add('hidden-element');
    showNewCharacter();
  }

  function showKanjiAnswer(showNextButton = true) {
    document.querySelector('#in-game-kana-solution')?.classList.add('hidden-element');
    document.querySelector('#in-game-solution')?.classList.remove('hidden-element');
    document.querySelector('#in-game-kanji-usage')?.classList.remove('hidden-element');
    document.querySelector('#in-game-next-button')?.classList.toggle('hidden-element', !showNextButton);
  }

  // Grades the kanji on screen: "again" (forgot), "hard", "good" or "easy"
  // (true / false from a swipe: good / again). A forgotten kanji comes back at
  // the end of the session, until it is remembered.
  function rateSrsCard(grade) {
    const card = srsCurrentCardRef.current;
    if (!isSrsPractice || !card || waitingForKanjiNextRef.current) return;
    const resolvedGrade = grade === true ? 'good' : grade === false ? 'again' : grade;
    const remembered = resolvedGrade !== 'again';

    // What this card does for the session summary: stages go new ->
    // learning -> young -> mature; moving up from learning or young counts
    const STAGES = ['new', 'learning', 'young', 'mature'];
    const stageBefore = getKanjiSrsStage(getKanjiSrsProgress()[card.jp_character]);
    recordKanjiSrsAnswer(card.jp_character, resolvedGrade);
    const stageAfter = getKanjiSrsStage(getKanjiSrsProgress()[card.jp_character]);
    const result = srsResultRef.current;
    result.reviewed++;
    if (!remembered) result.forgot++;
    if (stageBefore === 'new') result.learned++;
    else if (STAGES.indexOf(stageAfter) > STAGES.indexOf(stageBefore)) result.promoted++;

    updateCurrentGameStats(remembered ? 'correct' : 'wrong');
    setSrsProgress(progress => ({
      done: progress.done + 1,
      total: progress.total + (remembered ? 0 : 1),
    }));
    if (remembered) {
      setScore(score => score + 1);
    } else {
      srsForgottenRef.current.add(card.jp_character);
      srsQueueRef.current?.push(card);
    }

    srsCurrentCardRef.current = null;
    setSrsCardRevealed(false);
    setSrsCardDragOffset(0);
    setSrsCardSwipeDirection(null);
    showNewCharacter();
  }

  function handleSrsCardPointerDown(event) {
    if (srsCardSwipeDirection) return;
    srsCardPointerStartRef.current = event.clientX;
    srsCardDraggedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSrsCardPointerMove(event) {
    if (srsCardPointerStartRef.current === null || srsCardSwipeDirection) return;
    const offset = event.clientX - srsCardPointerStartRef.current;
    if (Math.abs(offset) > 6) srsCardDraggedRef.current = true;
    setSrsCardDragOffset(offset);
  }

  function handleSrsCardPointerUp(event) {
    if (srsCardPointerStartRef.current === null) return;
    const offset = event.clientX - srsCardPointerStartRef.current;
    srsCardPointerStartRef.current = null;
    if (srsCardSwipeDirection) {
      setSrsCardDragOffset(0);
      return;
    }
    if (Math.abs(offset) >= 140) {
      setSrsCardSwipeDirection(offset < 0 ? 'left' : 'right');
      return;
    }
    setSrsCardDragOffset(0);
  }

  /*
  #######################
  # Text input handlers #
  #######################
  */
  // How much of the typed sentence was right when it was last checked: kept so
  // the marking of the first mistake survives a move of the caret (a tap on
  // the typed answer)
  const typedMistakeFromRef = useRef(null);

  // Timer countdown effect
  React.useEffect(() => {
    const gameMode = JSON.parse(localStorage.getItem("gameMode"));

    // Initialize timer if in time-selector mode (a kanji review has no time
    // limit: its session is set by the schedule)
    if (!isSrsPractice && gameMode && gameMode.type === "time-selector" && gameMode.value !== -1) {
      setRemainingTime(gameMode.value * 60); // Convert minutes to seconds
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const gameMode = JSON.parse(localStorage.getItem("gameMode"));

    // Only run timer if in time-selector mode
    if (gameMode && gameMode.type === "time-selector" && remainingTime !== null) {
      if (remainingTime <= 0) {
        setUserGameScoreWindowVisible(true);
        return;
      }

      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  React.useEffect(() => {
    let timeoutInProgress = false;
    let wrongSubmissionCounted = false; // A mistake counts at most once per kana shown

    // Keep the hidden <input> in sync with the displayed answer, so mobile
    // keyboards (which edit the input's value directly) see the same text
    function syncHiddenInput() {
      const hiddenInput = document.querySelector('#in-game-text-input');
      if (!hiddenInput) return;
      const beforeCursor = document.querySelector('#in-game-text-input-before-cursor');
      hiddenInput.value = beforeCursor.textContent +
        document.querySelector('#in-game-text-input-after-cursor').textContent;
      // The caret the player sees (and moved) is the one that counts: keep the
      // input's own caret on it, so mobile keyboards edit where it sits
      try {
        const caret = beforeCursor.textContent.length;
        hiddenInput.setSelectionRange(caret, caret);
      } catch (error) { }
    }

    function clearAnswerInput() {
      const beforeCursor = document.querySelector('#in-game-text-input-before-cursor');
      const afterCursor = document.querySelector('#in-game-text-input-after-cursor');
      const cursorGroup = document.querySelector('#in-game-text-input-cursor-group');
      if (!beforeCursor || !afterCursor || !cursorGroup) return;
      beforeCursor.textContent = '';
      afterCursor.textContent = '';
      cursorGroup.classList.remove("answer-correct", "answer-wrong");
      // Restore the default size right away for the next character
      fitTypedAnswerFontSize();
      syncHiddenInput();
    }

    // Mobile virtual keyboards (e.g. Android Gboard) send keydown events with
    // key "Unidentified", so typed text is read from the input event instead
    function handleInput(e) {
      if (scoreWindowVisibleRef.current || waitingForKanjiNextRef.current) return;
      const InGameTextInput = document.querySelector('#in-game-text-input-before-cursor');
      const InGameTextInputAfterCursor = document.querySelector('#in-game-text-input-after-cursor');
      const previousAnswer = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent;
      // Already answered: keep the correct answer shown as it is
      if (questionAnsweredRef.current) {
        e.target.value = previousAnswer;
        return;
      }
      let newAnswer = e.target.value;

      if (newAnswer.includes('?')) {
        newAnswer = newAnswer.replace(/\?/g, '');
        e.target.value = newAnswer;
        handleUserAskForHelp();
      }

      // A mobile keyboard edits at its own caret, which is kept on the
      // visible caret: the text in front of it goes into its own part, the
      // rest stays behind the caret instead of disappearing
      const caret = Math.max(0, Math.min(newAnswer.length,
        typeof e.target.selectionStart === 'number' ? e.target.selectionStart : newAnswer.length));
      InGameTextInput.textContent = newAnswer.slice(0, caret);
      InGameTextInputAfterCursor.textContent = newAnswer.slice(caret);
      InGameTextInputAfterCursor.style.visibility = newAnswer.length > caret ? "visible" : "hidden";
      document.querySelector('#in-game-text-input-cursor-group').classList.remove('answer-wrong');

      if (newAnswer.length < previousAnswer.length) {
        updateCurrentGameStats("edit");
      } else if (newAnswer === previousAnswer) {
        return;
      }
      checkAnswer();
    }

    function handleKeyDown(e) {
      if (scoreWindowVisibleRef.current) return;
      if (waitingForKanjiNextRef.current) {
        if (e.key === 'Enter') {
          e.preventDefault();
          advanceToNextKanji();
        }
        return;
      }
      // Already answered: only leaving the game still works, Enter / Next
      // are handled by the listeners set up for the correct answer
      if (questionAnsweredRef.current) {
        if (e.key === 'Escape') {
          setUserGameScoreWindowVisible(true);
        } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
        }
        return;
      }
      // Let the input event handle keys coming from mobile IMEs
      if (e.key === 'Unidentified' || e.isComposing || e.keyCode === 229) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const currentAnswer =
          document.querySelector('#in-game-text-input-before-cursor').textContent +
          document.querySelector('#in-game-text-input-after-cursor').textContent;
        if (currentCharacterTypeRef.current === 'kanji' && /[\u3040-\u30ff]/.test(currentAnswer)) {
          checkAnswer(true);
        }
        return;
      }

      const hiddenInput = document.querySelector('#in-game-text-input');
      const isTextEdit = e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete';
      if (e.target === hiddenInput && isTextEdit) return;

      // Check if key is a printable character and append it to the input field
      const InGameTextInput = document.querySelector('#in-game-text-input-before-cursor');
      const InGameTextInputAfterCursor = document.querySelector('#in-game-text-input-after-cursor');

      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        // The displayed answer is managed manually, don't let the hidden input change on its own
        e.preventDefault();
      }

      if (e.key.match(/^[^?]$/)) {
        InGameTextInput.textContent += e.key;
      } else if (e.key === 'Backspace') {
        InGameTextInput.textContent = InGameTextInput.textContent.slice(0, -1);
        // Track edit
        updateCurrentGameStats("edit");
      } else if (e.key === 'Shift') {
        const charDisplayElement = document.querySelector('#in-game-kana-character');
        charDisplayElement.classList.add("font-forceDefault");
        if (!isMacOS || localStorage.getItem("game-mode-random-fonts") === "true") {
          setTimeout(function () {
            charDisplayElement.classList.remove("font-forceDefault");
          }, 1500)
        }
      } else if (e.key === 'Escape') {
        setUserGameScoreWindowVisible(true);
      } else if (e.key === '?') {
        handleUserAskForHelp()
      } else if (e.key === 'ArrowLeft') {
        if (InGameTextInput.textContent.length > 0) {
          InGameTextInputAfterCursor.textContent = InGameTextInput.textContent.slice(-1) + InGameTextInputAfterCursor.textContent;
          InGameTextInput.textContent = InGameTextInput.textContent.slice(0, -1);
          InGameTextInputAfterCursor.style.visibility = "visible";
        }
      } else if (e.key === 'ArrowRight') {
        InGameTextInput.textContent = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent.slice(0, 1);
        InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
        if (InGameTextInputAfterCursor.textContent.length === 0) {
          InGameTextInputAfterCursor.style.visibility = "hidden";
        }
      } else if (e.key === 'Delete') {
        if (InGameTextInputAfterCursor.textContent.length > 0) {
          InGameTextInputAfterCursor.textContent = InGameTextInputAfterCursor.textContent.slice(1);
          // Track edit
          updateCurrentGameStats("edit");
        }
      }

      syncHiddenInput();
      document.querySelector('#in-game-text-input-cursor-group').classList.remove('answer-wrong');
      checkAnswer();
    }

    // A tap / click on the typed answer puts the caret where the tap landed,
    // like in a real text field: a sentence can then be fixed in the middle
    // instead of only at its end (mobile keyboards have no arrow keys)
    function handleCursorPlacement(e) {
      if (scoreWindowVisibleRef.current || waitingForKanjiNextRef.current || questionAnsweredRef.current) return;
      const beforeCursor = document.querySelector('#in-game-text-input-before-cursor');
      const afterCursor = document.querySelector('#in-game-text-input-after-cursor');
      if (!beforeCursor || !afterCursor) return;
      // The text position the browser sees under the tapped point, when it can
      // tell us (no layout in jsdom, so there this stays untouched)
      let node = null;
      let offset = 0;
      if (document.caretRangeFromPoint) {
        const caretRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (!caretRange) return;
        node = caretRange.startContainer;
        offset = caretRange.startOffset;
      } else if (document.caretPositionFromPoint) {
        const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (!caretPosition) return;
        node = caretPosition.offsetNode;
        offset = caretPosition.offset;
      } else {
        return;
      }
      if (!node || node.nodeType !== Node.TEXT_NODE) return;

      // How much text stands in front of the tapped position inside a part
      const textIndexWithin = (container) => {
        let index = 0;
        const textNodes = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = textNodes.nextNode())) {
          if (textNode === node) return index + offset;
          index += textNode.textContent.length;
        }
        return null;
      };
      let caret = beforeCursor.contains(node) ? textIndexWithin(beforeCursor) : null;
      if (caret === null && afterCursor.contains(node)) {
        const afterIndex = textIndexWithin(afterCursor);
        if (afterIndex !== null) caret = beforeCursor.textContent.length + afterIndex;
      }
      if (caret === null || caret === beforeCursor.textContent.length) return;

      // Move the caret: everything in front of it goes into the first span,
      // everything behind it into the second one
      const answer = beforeCursor.textContent + afterCursor.textContent;
      beforeCursor.textContent = answer.slice(0, caret);
      afterCursor.textContent = answer.slice(caret);
      afterCursor.style.visibility = afterCursor.textContent ? 'visible' : 'hidden';
      // The red mark of the first mistake would be dropped by the move: put it
      // back where it was
      markTypedMistake(typedMistakeFromRef.current ?? Infinity);
      syncHiddenInput();
    }

    // A correct long answer (words, sentences, grammar) waits for the player:
    // the romaji and the meaning are revealed and the Next button is shown.
    // With auto next on, the next question comes by itself after a moment.
    function revealAnswerAndWait() {
      if (!document.querySelector('#in-game-kana-solution').classList.contains("hidden-element")) {
        document.querySelector('#in-game-kana-solution').classList.add("hidden-element");
      }
      document.querySelector('#in-game-solution').classList.remove("hidden-element");

      if (!autoNext) {
        const solutionElement = document.querySelector('#in-game-solution');
        const nextButton = document.querySelector('#in-game-next-button');
        nextButton.classList.remove("hidden-element");
        // Remove the listeners to prevent multiple listeners from being added
        const removeListeners = () => {
          document.removeEventListener('keydown', handleKeyDown);
          solutionElement.removeEventListener('click', goToNextWord);
          nextButton.removeEventListener('click', goToNextWord);
          removeNextListenersRef.current = null;
        };
        const goToNextWord = () => {
          clearAnswerInput();
          solutionElement.classList.add("hidden-element");
          nextButton.classList.add("hidden-element");
          showNewCharacter();
          removeListeners();
        };
        // Define the function for keydown event
        const handleKeyDown = (event) => {
          if (event.key === 'Enter' && !scoreWindowVisibleRef.current) {
            goToNextWord();
          }
        };

        // Listen for 'Enter' key press, or a tap on the translation / Next button (mobile)
        document.addEventListener('keydown', handleKeyDown);
        solutionElement.addEventListener('click', goToNextWord);
        nextButton.addEventListener('click', goToNextWord);
        removeNextListenersRef.current = removeListeners;
      } else {
        timeoutInProgress = true;
        advanceTimeoutRef.current = window.setTimeout(function () {
          clearAnswerInput();
          document.querySelector('#in-game-solution').classList.add("hidden-element");
          showNewCharacter();
          timeoutInProgress = false;
        }, 1000);
      }
    }

    // Grammar with multiple choice: the four buttons under the sentence are
    // picked with a click / tap. Correct: like a typed long answer (the
    // solution is revealed and the game waits). Wrong: the button flashes, the
    // sentence shakes and the streak starts over - the question stays, so the
    // right form can still be picked.
    function handleBunpouOptionClick(event) {
      if (!isBunpouChoice || scoreWindowVisibleRef.current || waitingForKanjiNextRef.current) return;
      if (questionAnsweredRef.current || timeoutInProgress) return;
      const button = event.target.closest ? event.target.closest('.in-game-bunpou-option') : null;
      if (!button) return;
      const question = sentenceQuestionRef.current;
      if (!question || question.exercise !== 'bunpou' || !question.choice) return;

      if (button.dataset.value === question.choice.correct) {
        questionAnsweredRef.current = true;
        setSentenceAnswered(true);
        setSentenceHint(null);
        updateCurrentGameStats("correct");
        speakCorrectAnswer();
        button.classList.add("touch-answer-correct");
        setTimeout(function () {
          button.classList.remove("touch-answer-correct");
        }, 300);
        document.querySelector('#in-game-kana-character').classList.add("answer-correct");
        wrongSubmissionCounted = false; // Reset for next question
        setScore(prevScore => prevScore + 1);
        revealAnswerAndWait();
      } else {
        updateCurrentGameStats("wrong");
        // Short haptic feedback on phones that support it (Android)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        button.classList.add("bunpou-option-wrong");
        setTimeout(function () {
          button.classList.remove("bunpou-option-wrong");
        }, 300);
        const charDisplayElement = document.querySelector('#in-game-kana-character');
        if (charDisplayElement) {
          charDisplayElement.classList.remove("animation-wrong1");
          void charDisplayElement.offsetWidth;
          charDisplayElement.classList.add("animation-wrong1");
          setTimeout(function () {
            charDisplayElement.classList.remove("animation-wrong1");
          }, 300);
        }
      }
    }

    function checkAnswer(isSubmission = false) {
      const InGameTextInput = document.querySelector('#in-game-text-input-before-cursor');
      const InGameTextInputAfterCursor = document.querySelector('#in-game-text-input-after-cursor');
      const InGameUserCurrentAnswer = InGameTextInput.textContent + InGameTextInputAfterCursor.textContent;
      const typedAnswer = normalizeAnswer(InGameUserCurrentAnswer);
      if (questionAnsweredRef.current) return;
      const sentenceMatcher = currentCharacterTypeRef.current === 'long' ? sentenceMatcherRef.current : null;
      if (!typedAnswer) {
        if (sentenceMatcher) updateSentenceWordsDone(0);
        return;
      }

      const isKanaInput = currentCharacterTypeRef.current === 'kanji' &&
        /[\u3040-\u30ff]/.test(InGameUserCurrentAnswer);
      if (isKanaInput && !isSubmission) return;

      const answerGroup = document.querySelector('#in-game-text-input-cursor-group');
      let isCorrect;
      let isOnTrack;
      if (sentenceMatcher) {
        // Sentences accept other spellings (si, kyoo, ha...) and kana, and
        // know which words are typed and where the first mistake is
        const result = sentenceMatcher.check(InGameUserCurrentAnswer);
        isCorrect = result.correct;
        isOnTrack = result.onTrack;
        updateSentenceWordsDone(result.wordsDone);
        typedMistakeFromRef.current = isOnTrack || !hintsEnabled ? Infinity : result.validLength;
        markTypedMistake(typedMistakeFromRef.current);
      } else {
        isCorrect = inGameAnswerListRef.current.includes(typedAnswer);
        isOnTrack = isSubmission
          ? isCorrect
          : inGameAnswerListRef.current.some(answer => answer.startsWith(typedAnswer));
      }
      if (!isOnTrack) {
        setStreak(0);
      }
      answerGroup.classList.toggle("answer-wrong", !isOnTrack && hintsEnabled);

      // Only a finished answer: "n" on the way to "na" is not a mix-up with ん
      if (!isCorrect && (!isOnTrack || isSubmission) && !confusionRecordedRef.current &&
        currentCharacterTypeRef.current === 'kana') {
        const answeredAs = findKanaForAnswer(charactersToShow, typedAnswer, inGameKanaOnScreen);
        if (answeredAs) {
          recordConfusion(inGameKanaOnScreen, answeredAs);
          confusionRecordedRef.current = true;
        }
      }

      if (!isOnTrack && !wrongSubmissionCounted) {
        updateCurrentGameStats("wrongSubmission");
        wrongSubmissionCounted = true;
        if (isSrsPractice && currentCharacterTypeRef.current === 'kanji') {
          recordKanjiSrsAnswer(inGameKanaOnScreen, false);
          srsFailedRef.current = true;
        }
      }


      ///////////////////////////////////////////////////////////////
      //////////// If the user types the correct answer! ////////////
      ///////////////////////////////////////////////////////////////

      if (timeoutInProgress) return;
      //  Make that known and pass to the next character
      if (isCorrect) {
        questionAnsweredRef.current = true;
        if (sentenceMatcher) {
          // The whole sentence is shown with its meaning, without the hint
          setSentenceAnswered(true);
          setSentenceHint(null);
        }
        updateCurrentGameStats("correct");
        speakCorrectAnswer();
        if (isSrsPractice && currentCharacterTypeRef.current === 'kanji' && !srsFailedRef.current) {
          recordKanjiSrsAnswer(inGameKanaOnScreen, true);
        }
        answerGroup.classList.add("answer-correct");
        document.querySelector('#in-game-kana-character').classList.add("answer-correct");
        wrongSubmissionCounted = false; // Reset for next character
        setScore(prevScore => prevScore + 1)

        // Long answers (words and sentences) wait for the player:
        // reveal the romanji (and translation) and show the Next button
        if (currentCharacterTypeRef.current === 'word' || currentCharacterTypeRef.current === 'long') {
          revealAnswerAndWait();
        }
        else {
          if (currentCharacterTypeRef.current === 'kanji') {
            if (isSrsPractice && !srsFailedRef.current) {
              recordKanjiSrsAnswer(inGameKanaOnScreen, true);
            }
            waitingForKanjiNextRef.current = true;
            showKanjiAnswer(!autoNext);
            if (autoNext) {
              timeoutInProgress = true;
              kanjiAutoAdvanceTimeoutRef.current = window.setTimeout(() => {
                clearAnswerInput();
                waitingForKanjiNextRef.current = false;
                document.querySelector('#in-game-solution').classList.add('hidden-element');
                document.querySelector('#in-game-kana-solution').classList.add('hidden-element');
                document.querySelector('#in-game-kanji-usage').classList.add('hidden-element');
                document.querySelector('#in-game-next-button').classList.add('hidden-element');
                showNewCharacter();
                kanjiAutoAdvanceTimeoutRef.current = null;
                timeoutInProgress = false;
              }, 700);
            }
          } else {
            // Kana continues to advance automatically.
            advanceTimeoutRef.current = window.setTimeout(function () {
              clearAnswerInput();
              showNewCharacter();
            }, 200)
          }
        }
      }
    }
    if (!isSrsPractice && !useTouchAnswers && !isBunpouChoice) {
      const hiddenInput = document.querySelector('#in-game-text-input');
      if (!hiddenInput) return;

      window.addEventListener('keydown', handleKeyDown);
      hiddenInput.addEventListener('input', handleInput);
      // Tapping the typed answer aims the caret there, so the caret can be
      // moved on touch screens too, where the keyboard has no arrow keys
      const cursorGroup = document.querySelector('#in-game-text-input-cursor-group');
      if (cursorGroup) cursorGroup.addEventListener('click', handleCursorPlacement);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        hiddenInput.removeEventListener('input', handleInput);
        if (cursorGroup) cursorGroup.removeEventListener('click', handleCursorPlacement);
      };
    }

    // Grammar with multiple choice: the option buttons are React elements that
    // change with every question, so their clicks are caught from one listener
    // on the document. Escape still opens the summary; Enter on the Next
    // button is handled by the long answer flow.
    if (isBunpouChoice) {
      const handleBunpouKeyDown = (event) => {
        if (event.key === 'Escape' && !scoreWindowVisibleRef.current && !waitingForKanjiNextRef.current) {
          setUserGameScoreWindowVisible(true);
        }
      };
      document.addEventListener('click', handleBunpouOptionClick);
      document.addEventListener('keydown', handleBunpouKeyDown);
      return () => {
        document.removeEventListener('click', handleBunpouOptionClick);
        document.removeEventListener('keydown', handleBunpouKeyDown);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the game screen the size of the visible area, so the on-screen keyboard
  // never covers the answer (needed for iOS, which ignores interactive-widget)
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.add('in-game-scroll-lock');
    const viewport = window.visualViewport;
    function updateAppHeight() {
      root.style.setProperty('--app-height', viewport.height + 'px');
      window.scrollTo(0, 0);
    }
    if (viewport) {
      updateAppHeight();
      viewport.addEventListener('resize', updateAppHeight);
    }
    return () => {
      root.classList.remove('in-game-scroll-lock');
      root.style.removeProperty('--app-height');
      if (viewport) {
        viewport.removeEventListener('resize', updateAppHeight);
      }
    };
  }, []);

  // The background gets slightly lighter the longer the streak (max at 10 in a row)
  React.useEffect(() => {
    const container = document.querySelector('.in-game-container');
    if (container) {
      container.style.setProperty('--streak-level', Math.min(streak, 10) * 5 + '%');
    }
    setBestStreak(prevBest => Math.max(prevBest, streak));
  }, [streak]);

  // Once the summary is open the game stops taking answers, and the mobile keyboard is closed
  React.useEffect(() => {
    scoreWindowVisibleRef.current = userGameScoreWindowVisible;
    if (userGameScoreWindowVisible) {
      const hiddenInput = document.querySelector('#in-game-text-input');
      if (hiddenInput) {
        hiddenInput.blur();
      }
    }
  }, [userGameScoreWindowVisible]);

  // Keep long answers (words, sentences) inside the input line: when the
  // typed text grows wider than the field, shrink the text and the cursor so
  // the whole answer stays visible instead of being clipped at the edges
  function fitTypedAnswerFontSize() {
    try {
      const cursorGroup = document.querySelector('#in-game-text-input-cursor-group');
      const cursor = document.querySelector('#in-game-text-input-cursor');
      const beforeCursor = document.querySelector('#in-game-text-input-before-cursor');
      const afterCursor = document.querySelector('#in-game-text-input-after-cursor');
      if (!cursorGroup || !cursor || !beforeCursor || !afterCursor) {
        return;
      }
      // Back to the CSS sizes first, to measure the natural text width
      beforeCursor.style.fontSize = '';
      afterCursor.style.fontSize = '';
      cursor.style.height = '';
      const textWidth = beforeCursor.scrollWidth + afterCursor.scrollWidth;
      // Nothing typed (also the case in jsdom, which has no layout)
      if (!textWidth) {
        return;
      }
      // clientWidth includes the padding of the field on both sides: only the
      // text area counts when shrinking the answer to fit.
      // The cursor is 3px wide with -6px of margins, plus a small safety margin
      const groupStyles = window.getComputedStyle(cursorGroup);
      const contentWidth = cursorGroup.clientWidth -
        (parseFloat(groupStyles.paddingLeft) || 0) -
        (parseFloat(groupStyles.paddingRight) || 0);
      const availableWidth = contentWidth - 4;
      if (availableWidth <= 0 || textWidth <= availableWidth) {
        return;
      }
      // Same values as the CSS: text min(13vh, 11vw), cursor height min(11.5vh, 10vw)
      const ratio = availableWidth / textWidth;
      const fontSize = `min(${(13 * ratio).toFixed(2)}vh, ${(11 * ratio).toFixed(2)}vw)`;
      beforeCursor.style.fontSize = fontSize;
      afterCursor.style.fontSize = fontSize;
      cursor.style.height = `min(${(11.5 * ratio).toFixed(2)}vh, ${(10 * ratio).toFixed(2)}vw)`;
    } catch (error) { }
  }

  const cursorBlinkInterval = useRef(null);

  // An element's computed font size expressed in viewport-height units
  function getFontSizeInVH(element) {
    const fontSizeInPixels = parseFloat(window.getComputedStyle(element).fontSize);
    return (fontSizeInPixels / window.innerHeight) * 100;
  }

  // Long sentences do not fit on one line at the default 35vh, so shrink them
  // to a per-character size as soon as they wrap. This runs in a layout effect
  // (before paint) so switching questions never flashes an oversized, wrapped
  // frame, and again on an interval to catch late webfont metrics.
  function fitCharacterToLine() {
    try {
      const kanaCharacter = document.querySelector("#in-game-kana-character>p");
      if (!kanaCharacter) return;
      const lineHeightParsed = parseInt(window.getComputedStyle(kanaCharacter).fontSize, 10);
      const amountOfLinesTilAdjust = 2;
      const isWraped = kanaCharacter.getAttribute("data-word-wraped") === "true";
      const displayLength = Number(kanaCharacter.dataset.displayLength) || kanaCharacter.textContent.length;
      if (isWraped && getFontSizeInVH(kanaCharacter) >= 35) {
        kanaCharacter.style.fontSize = "35vh";
        kanaCharacter.setAttribute("data-word-wraped", "false");
      } else if (isWraped) {
        kanaCharacter.style.fontSize = (90 / displayLength) + "vw";
        kanaCharacter.setAttribute("data-word-wraped", "true");
      } else if (kanaCharacter.offsetHeight >= lineHeightParsed * amountOfLinesTilAdjust) {
        kanaCharacter.style.fontSize = (90 / displayLength) + "vw";
        kanaCharacter.setAttribute("data-word-wraped", "true");
      }
    } catch (error) { }
  }

  // Fit the new question before it is painted, so the oversized wrapped frame
  // is never shown while the question swaps
  React.useLayoutEffect(() => {
    fitCharacterToLine();
  }, [onScreenKana, onScreenCharacterType, isKanjiUsageQuestion]);
  React.useEffect(() => {
    //handles style changes on banner to check wrapping
    const lineWrapInterval = setInterval(() => {
      fitCharacterToLine();
      // Also keep the typed answer fitting inside the input line
      fitTypedAnswerFontSize();
    }, 100)

    function handleFocus() {
      document.querySelector('#in-game-text-input').focus();
      cursorBlinkInterval.current = window.setInterval(function () {
        try {
          if (document.querySelector('#in-game-text-input-cursor').style.visibility === 'visible') {
            document.querySelector('#in-game-text-input-cursor').style.visibility = 'hidden';
          } else {
            document.querySelector('#in-game-text-input-cursor').style.visibility = 'visible';
          }
        } catch (error) {

        }
      }, 700);
    }
    if (!isSrsPractice && !useTouchAnswers && !isBunpouChoice) {
      handleFocus();
    }
    if (!hasStartedInitialCharacterRef.current) {
      hasStartedInitialCharacterRef.current = true;
      resetCurentGameStats();
      showNewCharacter();
    }
    return () => {
      clearInterval(cursorBlinkInterval.current);
      clearInterval(lineWrapInterval);
      window.clearTimeout(kanjiAutoAdvanceTimeoutRef.current);
      window.clearTimeout(advanceTimeoutRef.current);
      if (removeNextListenersRef.current) removeNextListenersRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard in kanji reviews: Space / Enter turns the card over, 1-4 grade it
  // (forgot / hard / good / easy), ← forgot, → remembered, Esc ends the review
  useEffect(() => {
    if (!isSrsPractice) return undefined;
    const handleSrsKeyDown = (event) => {
      if (scoreWindowVisibleRef.current || event.ctrlKey || event.metaKey || event.altKey) return;
      if (!srsCurrentCardRef.current || srsCardSwipeDirection) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setSrsCardRevealed(revealed => !revealed);
      } else if (event.key === 'ArrowLeft') {
        rateSrsCard('again');
      } else if (event.key === 'ArrowRight') {
        rateSrsCard('good');
      } else if (/^[1-4]$/.test(event.key) && srsCardRevealed) {
        rateSrsCard(SRS_GRADES[Number(event.key) - 1]);
      } else if (event.key === 'Escape') {
        setUserGameScoreWindowVisible(true);
      }
    };
    window.addEventListener('keydown', handleSrsKeyDown);
    return () => window.removeEventListener('keydown', handleSrsKeyDown);
    // rateSrsCard reads the current card from refs; the effect follows the card state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSrsPractice, srsCardRevealed, srsCardSwipeDirection]);

  // Kana and words are read aloud; a lone kanji is skipped since the voice can't know which reading is asked
  function speakCorrectAnswer() {
    if (currentCharacterTypeRef.current === 'kanji') return;
    speakIfEnabled(inGameKanaOnScreen);
  }

  // Sentence practice: remembers how many words are typed, and drops the
  // word hint once its word is typed
  function updateSentenceWordsDone(wordsDone) {
    sentenceWordsDoneRef.current = wordsDone;
    setSentenceWordsDone(wordsDone);
    const help = sentenceHelpRef.current;
    if (help.hintWord !== null && wordsDone > help.hintWord) {
      help.hintWord = null;
      setSentenceHint(null);
    }
  }

  // Sentence practice: shows the typed text from its first mistake on in its
  // own color (validLength = how much of the typed text is right)
  function markTypedMistake(validLength) {
    let remaining = validLength;
    for (const selector of ['#in-game-text-input-before-cursor', '#in-game-text-input-after-cursor']) {
      const element = document.querySelector(selector);
      if (!element) continue;
      const text = element.textContent;
      const valid = Math.max(0, Math.min(text.length, remaining));
      remaining -= text.length;
      element.textContent = text.slice(0, valid);
      if (valid < text.length) {
        const mistake = document.createElement('span');
        mistake.className = 'in-game-typed-mistake';
        mistake.textContent = text.slice(valid);
        element.appendChild(mistake);
      }
    }
  }

  function handleUserAskForHelp() {
    if (!hintsEnabled) {
      return;
    }
    // Sentence questions give help in steps instead of the whole romaji
    // (refs, since the keyboard handler is set up once):
    //   type / arrange: furigana, then the romaji of the word being typed
    //   listen: the sentence text, furigana, then the word being typed
    //   particle: furigana, then what the missing particle does
    // Every step counts as asking for help; the word hint once per word.
    if (currentCharacterTypeRef.current === 'long') {
      if (questionAnsweredRef.current) return;
      const help = sentenceHelpRef.current;
      const question = sentenceQuestionRef.current;
      const steps = {
        listen: ['text', 'furigana', 'word'],
        particle: ['furigana', 'role'],
      }[question.exercise] || ['furigana', 'word'];
      const step = steps[Math.min(help.step, steps.length - 1)];
      if (step === 'word') {
        const wordIndex = sentenceWordsDoneRef.current;
        const matcher = sentenceMatcherRef.current;
        const words = matcher ? matcher.words : [];
        if (help.hintWord === wordIndex || wordIndex >= words.length) return;
        help.hintWord = wordIndex;
        let hint = words[wordIndex];
        // Arrange: also say which of the shown words comes next
        if (question.exercise === 'arrange' && matcher.segments) {
          const { start, end } = matcher.segments[wordIndex];
          hint = `${[...inGameKanaOnScreen].slice(start, end).join('').replace(/[、。]/g, '')} · ${hint}`;
        }
        setSentenceHint(hint);
      } else {
        if (help.step >= steps.length) return;
        if (step === 'text') setSentenceTextVisible(true);
        if (step === 'furigana') setFuriganaVisible(true);
        if (step === 'role') setSentenceHint(particleRoleOf(question.blank.text, language));
      }
      help.step++;
      updateCurrentGameStats('askForHelp');
      return;
    }
    if (document.querySelector('#in-game-kana-solution').classList.contains("hidden-element")) {
      updateCurrentGameStats('askForHelp')
      document.querySelector('#in-game-kana-solution').classList.remove("hidden-element")
    }
  }

  /*
  ########################
  # Touch input handlers #
  ########################
  */
  function onClickAnswerButtonHandler(event) {
    if (waitingForKanjiNextRef.current || scoreWindowVisibleRef.current) return;

    if (onScreenSolution.includes(event.target.firstChild.textContent)) {
      updateCurrentGameStats("correct");
      speakCorrectAnswer();
      const answerButton = event.currentTarget;
      answerButton.classList.add("touch-answer-correct");
      setTimeout(function () {
        answerButton.classList.remove("touch-answer-correct");
      }, 300);
      setScore(onScreenScore + 1)
      if (currentCharacterTypeRef.current === 'kanji') {
        if (isSrsPractice && !srsFailedRef.current) {
          recordKanjiSrsAnswer(inGameKanaOnScreen, true);
        }
        waitingForKanjiNextRef.current = true;
        showKanjiAnswer(!autoNext);
        if (autoNext) {
          kanjiAutoAdvanceTimeoutRef.current = window.setTimeout(() => {
            waitingForKanjiNextRef.current = false;
            document.querySelector('#in-game-solution').classList.add('hidden-element');
            document.querySelector('#in-game-kana-solution').classList.add('hidden-element');
            document.querySelector('#in-game-kanji-usage').classList.add('hidden-element');
            document.querySelector('#in-game-next-button').classList.add('hidden-element');
            showNewCharacter();
            kanjiAutoAdvanceTimeoutRef.current = null;
          }, 700);
        }
      } else {
        showNewCharacter();
      }
    } else {
      updateCurrentGameStats("wrong");
      if (currentCharacterTypeRef.current === 'kana') {
        const pickedAnswer = normalizeAnswer(event.target.firstChild.textContent);
        recordConfusion(inGameKanaOnScreen, findKanaForAnswer(charactersToShow, pickedAnswer, inGameKanaOnScreen));
      }
      if (isSrsPractice && currentCharacterTypeRef.current === 'kanji' && !srsFailedRef.current) {
        recordKanjiSrsAnswer(inGameKanaOnScreen, false);
        srsFailedRef.current = true;
      }
      // Short haptic feedback on phones that support it (Android)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Animate the element in ID in-game-kana-character using the class animation-wrong
      document.querySelector('#in-game-kana-character').classList.add("animation-wrong1");
      setTimeout(function () {
        document.querySelector('#in-game-kana-character')?.classList.remove("animation-wrong1");
      }, 300)
    }
  }

  function onClickChangeFontToDefault(event) {
    const charDisplayElement = document.querySelector('#in-game-kana-character');
    charDisplayElement.classList.add("font-forceDefault");
    if (!isMacOS || localStorage.getItem("game-mode-random-fonts") === "true") {
      setTimeout(function () {
        charDisplayElement.classList.remove("font-forceDefault");
      }, 1500)
    }
  }

  // Mobile browsers only open the virtual keyboard when the input is focused by a user tap
  function focusTextInput() {
    const hiddenInput = document.querySelector('#in-game-text-input');
    if (hiddenInput) hiddenInput.focus();
  }

  function onClickExitButton(event) {
    setUserGameScoreWindowVisible(true);
  }

  // Format time as MM:SS
  function formatTime(seconds) {
    if (seconds === null) return null;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate time percentage for styling
  function getTimePercentage() {
    const gameMode = JSON.parse(localStorage.getItem("gameMode"));
    if (!gameMode || gameMode.type !== "time-selector" || remainingTime === null) {
      return 100;
    }
    const totalSeconds = gameMode.value * 60;
    return (remainingTime / totalSeconds) * 100;
  }

  /*
  ######################################################
  # Decide wether to use touch or keyboard for answers #
  ######################################################
  */

  // Make answer input via touch buttons
  let inGameInputElement = <></>
  if (isBunpouChoice) {
    // Grammar: the missing verb form picked among four buttons, labelled in
    // kanji / kana (data-value keeps the romaji the answer is checked with).
    // The click is caught by the listener on the document (see the keydown
    // effect), so the buttons stay plain text and re-render with every new
    // question
    const choiceOptions = (sentenceQuestion.choice && sentenceQuestion.choice.options) || [];
    const choiceLabels = (sentenceQuestion.choice && sentenceQuestion.choice.labels) || [];
    inGameInputElement = (
      <div className='in-game-bunpou-options' role='group' aria-label={t('bunpouPromptChoice')}>
        {choiceOptions.map((option, index) => (
          <button
            key={option}
            type='button'
            className='in-game-bunpou-option'
            data-value={option}
          >
            {choiceLabels[index] || option}
          </button>
        ))}
      </div>
    );
  } else if (useTouchAnswers) {
    function makeTouchAnswerDivs(params) {
      const numberOfAnswers = 5;
      const answerElements = [];

      for (let i = 0; i < numberOfAnswers; i++) {
        answerElements.push((
          <div key={'in-game-touch-answer-' + i} className='in-game-touch-answer' onClick={onClickAnswerButtonHandler}>
            <p></p>
          </div>
        ));
      }
      return answerElements;
    }

    inGameInputElement = <>
      <div className='in-game-touch-answer-group'>
        {
          makeTouchAnswerDivs()
        }
      </div>
    </>

    // Make answer input via keyboard
  } else if (!isSrsPractice) {
    inGameInputElement = <>
      <div className='in-game-answer-field'>
        <div id='in-game-text-input-cursor-group'>
          <span id='in-game-text-input-before-cursor'></span>
          <div id='in-game-text-input-cursor'></div>
          <span id='in-game-text-input-after-cursor'></span>
          <span id='in-game-text-input-placeholder'>
            {t(onScreenCharacterType === 'kanji' ? 'kanjiGamePlaceholder' : 'gamePlaceholder')}
          </span>
        </div>
      </div>
      <input
        type="text"
        id='in-game-text-input'
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        enterKeyHint="next"
      />
    </>
  }

  // Grade buttons, once the card is turned over: each says when the kanji
  // comes back with that grade (keys 1-4, or ← / → for forgot / remembered)
  const formatSrsInterval = (milliseconds) => {
    const minutes = Math.round(milliseconds / 60000);
    if (minutes < 60) return t('srsIntervalMinutes', { count: minutes });
    const days = Math.round(milliseconds / 86400000);
    if (days < 31) return t('srsIntervalDays', { count: days });
    return t('srsIntervalMonths', { count: Math.round(days / 30) });
  };
  const srsIntervals = isSrsPractice && srsCardRevealed && onScreenKana ? previewSrsIntervals(onScreenKana) : null;
  // The row keeps its room while the card is face up, so nothing moves when it turns over
  const srsGradeButtons = isSrsPractice && !userGameScoreWindowVisible ? (
    <div className='kanji-srs-grades' role='group' aria-label={t('srsGradeLabel')}>
      {srsIntervals && SRS_GRADES.map((grade, index) => (
        <button
          key={grade}
          type='button'
          className={`kanji-srs-grade grade-${grade}`}
          onClick={() => rateSrsCard(grade)}
        >
          <span className='kanji-srs-grade-name'>{t({ again: 'srsGradeAgain', hard: 'srsGradeHard', good: 'srsGradeGood', easy: 'srsGradeEasy' }[grade])}</span>
          <span className='kanji-srs-grade-interval'>{formatSrsInterval(srsIntervals[grade])}</span>
          <span className='kanji-srs-grade-key label-keyboard'>{index + 1}</span>
        </button>
      ))}
    </div>
  ) : null;

  const kanjiSrsCardBack = (
    <div className='kanji-srs-card-back'>
      <div className='kanji-srs-card-meaning'>{onScreenWordMeaning}</div>
      <div className='kanji-answer-readings'>
        <span>
          <span className='kanji-answer-reading-label'>{t('kanjiOnShort')}</span>
          {kanjiReadings[onScreenKana]?.onyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
        </span>
        <span>
          <span className='kanji-answer-reading-label'>{t('kanjiKuShort')}</span>
          {kanjiReadings[onScreenKana]?.kunyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
        </span>
      </div>
      {onScreenKanjiUsage && (
        <div className='kanji-srs-card-example'>
          <strong>{onScreenKanjiUsage.word}</strong>
          <span>{onScreenKanjiUsage.romanji}</span>
          <span>{meaningOf(onScreenKanjiUsage.word, onScreenKanjiUsage.meaning)}</span>
        </div>
      )}
    </div>
  );

  // Sentence practice: characters of the words already typed, and the word
  // breakdown shown with the meaning
  const sentenceExerciseShown = onScreenCharacterType === 'long' ? sentenceQuestion.exercise : 'type';
  const sentenceSegments = onScreenCharacterType === 'long' ? sentenceMatcherRef.current?.segments : null;
  // Only reading and listening dim the typed words in the sentence itself
  const sentenceTypedEnd = (sentenceExerciseShown === 'type' || sentenceExerciseShown === 'listen') &&
    sentenceSegments && sentenceWordsDone > 0
    ? sentenceSegments[Math.min(sentenceWordsDone, sentenceSegments.length) - 1].end
    : 0;

  // Characters start..end of the sentence: particles in their own color, the
  // words typed so far dimmed, and furigana above the kanji when asked for
  function renderSentenceCharacters(start, end) {
    return [...onScreenKana].slice(start, end).map((character, offset) => {
      const index = start + offset;
      const className = [
        onScreenParticles.includes(index) ? 'in-game-particle' : '',
        index < sentenceTypedEnd ? 'in-game-sentence-typed' : '',
      ].filter(Boolean).join(' ');
      const body = className
        ? <span className={className}>{character}</span>
        : character;
      return furiganaVisible && onScreenFurigana[index]
        ? <ruby key={`furigana-${index}`}>{body}<rt>{onScreenFurigana[index]}</rt></ruby>
        : <React.Fragment key={`long-char-${index}`}>{body}</React.Fragment>;
    });
  }

  // The question shown for the sentence exercise
  function renderSentence() {
    const length = [...onScreenKana].length;
    if (sentenceAnswered || sentenceExerciseShown === 'type') {
      return renderSentenceCharacters(0, length);
    }
    if (sentenceExerciseShown === 'listen') {
      if (sentenceTextVisible) return renderSentenceCharacters(0, length);
      return (
        <button
          type='button'
          className='in-game-sentence-listen'
          title={t('sentenceListen')}
          aria-label={t('sentenceListen')}
          onClick={(event) => {
            event.stopPropagation();
            speak(onScreenKana);
          }}
        >
          <Icon name='volume' />
        </button>
      );
    }
    if ((sentenceExerciseShown === 'particle' || sentenceExerciseShown === 'bunpou') && sentenceQuestion.blank) {
      const { start, end } = sentenceQuestion.blank;
      return [
        ...renderSentenceCharacters(0, start),
        <span key='blank' className='in-game-sentence-blank'>{'？'.repeat(end - start)}</span>,
        ...renderSentenceCharacters(end, length),
      ];
    }
    if (sentenceExerciseShown === 'arrange' && sentenceSegments && sentenceQuestion.order) {
      // The words in shuffled order; the ones already typed are dimmed
      return sentenceQuestion.order.map(wordIndex => {
        const { start, end } = sentenceSegments[wordIndex];
        let textEnd = end;
        while (textEnd > start && /[、。]/.test([...onScreenKana][textEnd - 1])) textEnd--;
        return (
          <span
            key={`word-${wordIndex}`}
            className={'in-game-sentence-chip' + (wordIndex < sentenceWordsDone ? ' is-used' : '')}
          >
            {renderSentenceCharacters(start, textEnd)}
          </span>
        );
      });
    }
    return renderSentenceCharacters(0, length);
  }

  // Exercises other than reading say what to do; particles and arranging
  // also need the meaning of the sentence
  const sentencePrompt = onScreenCharacterType === 'long' && sentenceExerciseShown !== 'type' ? (
    <div className='in-game-sentence-prompt'>
      <span className='in-game-sentence-prompt-instruction'>
        {t({ listen: 'sentencePromptListen', particle: 'sentencePromptParticle', arrange: 'sentencePromptArrange', bunpou: isBunpouChoice ? 'bunpouPromptChoice' : 'sentencePromptBunpou' }[sentenceExerciseShown])}
      </span>
      {sentenceExerciseShown !== 'listen' && onScreenWordMeaning && (
        <span className='in-game-sentence-prompt-meaning'>{onScreenWordMeaning}</span>
      )}
    </div>
  ) : null;
  const sentenceWords = onScreenCharacterType === 'long'
    ? sentenceBreakdown({
        jp_character: onScreenKana,
        particles: onScreenParticles,
        furigana: onScreenFurigana,
        romanji: onScreenSolution,
      }, language)
    : [];
  // Grammar: the result explains the chosen form - the meaning of the
  // sentence is already in the prompt above it
  const bunpouNote = sentenceQuestion.exercise === 'bunpou' && sentenceQuestion.choice
    ? bunpouFormNote(sentenceQuestion.choice.correct, t)
    : null;

  return (
    <>
      <div className="in-game-top-var">
        <div className='in-game-score-group'>
          <div className='in-game-score' id='in-game-score'>
            {isProblematicsMode && <Icon name='target' className='icon-leading' />}
            {isMixupPractice && <Icon name='arrow-left-right' className='icon-leading' />}
            {isProblematicsMode ? t('gameScoreProblematics')
              : isMixupPractice ? t('gameScoreMixups')
              : t({ long: 'gameScoreSentences', bunpou: 'gameScoreBunpou', words: 'gameScoreWords', mixed: 'gameScoreMixed' }[practiceMode] || 'gameScoreKanas')}{onScreenScore}
            {kanaGoal !== null && <span className='in-game-score-goal'> / {kanaGoal}</span>}
          </div>
          {streak >= 3 && <div className='in-game-streak' title={t('gameStreakTitle')}><Icon name='flame' className='icon-flame icon-leading' />{streak}</div>}
        </div>
        {remainingTime !== null ? (
          <div
            className={`in-game-timer ${getTimePercentage() <= 10 ? 'timer-critical' : getTimePercentage() <= 25 ? 'timer-warning' : ''}`}
            id='in-game-timer'
          >
            {formatTime(remainingTime)}
          </div>
        ) : (
          <div className='in-game-help-bar'>
            {hintsEnabled && !isBunpouChoice ? <div className='in-game-help-button' onClick={handleUserAskForHelp}>
              <span className='label-keyboard'><strong>?</strong>: {t('gameHelpKey')}</span>
              <span className='label-touch'><Icon name='lightbulb' className='icon-leading' />{t('gameHintButton')}</span>
            </div> : null}
            {(localStorage.getItem("game-mode-random-fonts") === "true") ? <div className='in-game-help-button' onClick={onClickChangeFontToDefault}>
              <span className='label-keyboard'><strong>shift</strong>: {t('gameFontKey')}</span>
              <span className='label-touch'><Icon name='type' className='icon-leading' />{t('gameFontButton')}</span>
            </div> : <div></div>}
          </div>
        )}
        <div onClick={onClickExitButton} className='in-game-exit-button' title={t('gameEnd')}><Icon name='x' strokeWidth={2.5} /></div>
      </div>
      {kanaGoal !== null && (
        <div className='in-game-progress'>
          <div className='in-game-progress-fill' style={{ width: Math.min(onScreenScore / kanaGoal, 1) * 100 + '%' }}></div>
        </div>
      )}
      <div className='in-game-game-screen' onClick={focusTextInput}>

        <div className='in-game-kana-area'>
          {isSrsPractice ? (<>
            <div className='kanji-srs-session' aria-live='polite'>
              <span className={`kanji-srs-kind kind-${srsCardKind}`}>{t({ new: 'srsKindNew', review: 'srsKindReview', relearn: 'srsKindRelearn' }[srsCardKind])}</span>
              <div className='kanji-srs-session-bar'>
                <div className='kanji-srs-session-fill' style={{ width: `${srsProgress.total ? Math.min(1, srsProgress.done / srsProgress.total) * 100 : 0}%` }} />
              </div>
              <span className='kanji-srs-session-count'>{Math.min(srsProgress.done + 1, srsProgress.total)} / {srsProgress.total}</span>
            </div>
            <div
              id='in-game-kana-character'
              className={`in-game-kana-character kanji-srs-flip-card${isMacOS && localStorage.getItem("game-mode-random-fonts") !== "true" ? ' font-forceDefault' : ''}`}
              style={{
                transform: srsCardSwipeDirection
                  ? `translate3d(${srsCardSwipeDirection === 'left' ? '-120vw' : '120vw'}, 0, 0) rotate(${srsCardSwipeDirection === 'left' ? '-8deg' : '8deg'})`
                  : srsCardDragOffset !== 0
                    ? `translate3d(${srsCardDragOffset}px, 0, 0)`
                    : undefined
              }}
              onPointerDown={handleSrsCardPointerDown}
              onPointerMove={handleSrsCardPointerMove}
              onPointerUp={handleSrsCardPointerUp}
              onPointerCancel={handleSrsCardPointerUp}
              onClick={() => {
                if (srsCardDraggedRef.current) {
                  srsCardDraggedRef.current = false;
                  return;
                }
                setSrsCardRevealed(revealed => !revealed);
              }}
              onTransitionEnd={event => {
                if (event.target !== event.currentTarget || event.propertyName !== 'transform' || !srsCardSwipeDirection) return;
                rateSrsCard(srsCardSwipeDirection === 'right');
              }}
            >
              {/* While the card is dragged: forgot on the left, remembered on the right */}
              {srsCardDragOffset !== 0 && (
                <span
                  className={`kanji-srs-swipe-hint ${srsCardDragOffset < 0 ? 'hint-again' : 'hint-good'}`}
                  style={{ opacity: Math.min(1, Math.abs(srsCardDragOffset) / 60) }}
                >
                  {srsCardDragOffset < 0 ? t('srsGradeAgain') : t('srsGradeGood')}
                </span>
              )}
              <div className={`kanji-srs-flip-inner${srsCardRevealed ? ' is-flipped' : ''}`}>
                <div className='kanji-srs-flip-face kanji-srs-flip-front'>
                  <span>{onScreenKana}</span>
                </div>
                <div className='kanji-srs-flip-face kanji-srs-flip-back'>
                  {kanjiSrsCardBack}
                </div>
              </div>
            </div>
            {srsGradeButtons}
          </>) : <>{sentencePrompt}<div
            id='in-game-kana-character'
            onClick={onClickChangeFontToDefault}
            className={`in-game-kana-character${isMacOS && localStorage.getItem("game-mode-random-fonts") !== "true" ? ' font-forceDefault' : ''}`}
          >
            <p className={
              onScreenCharacterType === 'kanji' &&
              isKanjiUsageQuestion &&
              localStorage.getItem('game-mode-kanji-readings') === 'true'
                ? 'kanji-reading-question-prompt'
                : ''
            }>
              {onScreenCharacterType === 'kanji' &&
              isKanjiUsageQuestion &&
              localStorage.getItem('game-mode-kanji-readings') === 'true'
                ? [...onScreenKana].map((character, index) => kanjiReadings[character] ? (
                  <span
                    className={`kanji-reading-question ${index === 0 ? 'reading-left' : 'reading-right'}`}
                    key={`${character}-${index}`}
                  >
                    {index === 0 && (
                      <span className='kanji-reading-question-columns'>
                        <span className='kanji-reading-question-column'>
                          <span className='kanji-reading-question-label'>{t('kanjiOnShort')}</span>
                          {kanjiReadings[character].onyomi.length === 0
                            ? <span>—</span>
                            : kanjiReadings[character].onyomi.map((reading, readingIndex) => (
                            <span key={`on-${readingIndex}`}>{toHiragana(reading)}</span>
                          ))}
                        </span>
                        <span className='kanji-reading-question-column'>
                          <span className='kanji-reading-question-label'>{t('kanjiKuShort')}</span>
                          {kanjiReadings[character].kunyomi.length === 0
                            ? <span>—</span>
                            : kanjiReadings[character].kunyomi.map((reading, readingIndex) => (
                            <span key={`kun-${readingIndex}`}>{toHiragana(reading)}</span>
                          ))}
                        </span>
                      </span>
                    )}
                    <span className='kanji-reading-question-character'>{character}</span>
                    {index > 0 && (
                      <span className='kanji-reading-question-columns'>
                      <span className='kanji-reading-question-column'>
                        <span className='kanji-reading-question-label'>{t('kanjiOnShort')}</span>
                        {kanjiReadings[character].onyomi.length === 0
                          ? <span>—</span>
                          : kanjiReadings[character].onyomi.map((reading, readingIndex) => (
                          <span key={`on-${readingIndex}`}>{toHiragana(reading)}</span>
                        ))}
                      </span>
                      <span className='kanji-reading-question-column'>
                        <span className='kanji-reading-question-label'>{t('kanjiKuShort')}</span>
                        {kanjiReadings[character].kunyomi.length === 0
                          ? <span>—</span>
                          : kanjiReadings[character].kunyomi.map((reading, readingIndex) => (
                          <span key={`kun-${readingIndex}`}>{toHiragana(reading)}</span>
                        ))}
                      </span>
                      </span>
                    )}
                  </span>
                ) : character)
                : onScreenCharacterType === 'long'
                  ? renderSentence()
                  : onScreenKana}
            </p>
          </div></>}
          <div id='in-game-solution' className='in-game-solution hidden-element'>
            <span id='in-game-solution-romanji-one'  className='in-game-solution-romanji-one'>{onScreenSolution[0]}</span>
            <br></br>
            {/* Sentence answers show the meaning only; the reading is the furigana above the kanji */}
            {onScreenCharacterType !== 'long' && (
              <span className='in-game-solution-romanji'>{onScreenSolution[0]}</span>
            )}
            {/* Grammar answers explain the chosen form; the other answers the meaning */}
            {bunpouNote ? (
              <span className='in-game-solution-bunpou-note'>{bunpouNote}</span>
            ) : onScreenWordMeaning ? (
              <>
                {onScreenCharacterType !== 'long' && (
                  <span className='in-game-solution-separator'> · </span>
                )}
                {onScreenWordMeaning}
              </>
            ) : null}
            {/* Sentences: every word with its romaji and meaning, and what each particle does */}
            {onScreenCharacterType === 'long' && sentenceWords.length > 0 && (
              <span className='sentence-breakdown'>
                {sentenceWords.map((word, index) => (
                  <span key={`word-${index}`} className={'sentence-breakdown-word' + (word.particle ? ' is-particle' : '')}>
                    <span className='sentence-breakdown-jp'>{word.text}</span>
                    <span className='sentence-breakdown-romaji'>{word.romaji}</span>
                    <span className='sentence-breakdown-meaning'>{word.meaning}</span>
                  </span>
                ))}
                {isSpeechSupported() && (
                  <button
                    type='button'
                    className='sentence-breakdown-listen'
                    title={t('sentenceListen')}
                    aria-label={t('sentenceListen')}
                    onClick={(event) => {
                      // A tap on the meaning moves on: listening must not
                      event.stopPropagation();
                      speak(onScreenKana);
                    }}
                  >
                    <Icon name='volume' />
                  </button>
                )}
              </span>
            )}
            {onScreenCharacterType === 'kanji' &&
              !isKanjiUsageQuestion &&
              localStorage.getItem('game-mode-kanji-readings') === 'true' &&
              kanjiReadings[onScreenKana] && (
                <span className='kanji-answer-readings'>
                  <span>
                    <span className='kanji-answer-reading-label'>{t('kanjiOnShort')}</span>
                    {kanjiReadings[onScreenKana].onyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                  </span>
                  <span>
                    <span className='kanji-answer-reading-label'>{t('kanjiKuShort')}</span>
                    {kanjiReadings[onScreenKana].kunyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                  </span>
                </span>
              )}
            {/* Kanji words (水曜日, 時間...): the readings of each of their kanji, once answered */}
            {onScreenCharacterType === 'word' &&
              localStorage.getItem('game-mode-kanji-readings') === 'true' &&
              [...onScreenKana].some(character => kanjiReadings[character]) && (
                <span className='kanji-word-readings'>
                  {[...new Set([...onScreenKana])].filter(character => kanjiReadings[character]).map(character => (
                    <span key={character} className='kanji-answer-readings kanji-word-reading'>
                      <span className='kanji-word-reading-character'>{character}</span>
                      <span>
                        <span className='kanji-answer-reading-label'>{t('kanjiOnShort')}</span>
                        {kanjiReadings[character].onyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                      </span>
                      <span>
                        <span className='kanji-answer-reading-label'>{t('kanjiKuShort')}</span>
                        {kanjiReadings[character].kunyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                      </span>
                    </span>
                  ))}
                </span>
              )}
          </div>
          <div id='in-game-kana-solution' className='in-game-solution hidden-element'>
            {/* Sentence help reveals furigana instead of the romaji reading */}
            {onScreenCharacterType !== 'long' &&
              (Array.isArray(onScreenSolution) ? onScreenSolution.join(' / ') : onScreenSolution)}
            {/* Kanji words: the kanji they are made of, each with its meaning and readings */}
            {onScreenCharacterType === 'word' &&
              [...onScreenKana].some(character => kanjiEntryByCharacter.has(character)) && (
                <span className='kanji-word-readings kanji-word-hint'>
                  {[...new Set([...onScreenKana])].filter(character => kanjiEntryByCharacter.has(character)).map(character => {
                    const entry = kanjiEntryByCharacter.get(character);
                    const readings = kanjiReadings[character];
                    return (
                      <span key={character} className='kanji-answer-readings kanji-word-reading'>
                        <span className='kanji-word-reading-character'>{character}</span>
                        <span className='kanji-word-hint-meaning'>{language === 'id' && entry.meaning_id ? entry.meaning_id : entry.meaning}</span>
                        {readings && (
                          <>
                            <span>
                              <span className='kanji-answer-reading-label'>{t('kanjiOnShort')}</span>
                              {readings.onyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                            </span>
                            <span>
                              <span className='kanji-answer-reading-label'>{t('kanjiKuShort')}</span>
                              {readings.kunyomi.map(reading => toHiragana(reading)).join(' ・ ') || '—'}
                            </span>
                          </>
                        )}
                      </span>
                    );
                  })}
                </span>
              )}
          </div>
          {/* Last step of sentence help: the word being typed, or what the missing particle does */}
          {onScreenCharacterType === 'long' && sentenceHint && (
            <div id='in-game-sentence-hint' className='in-game-solution in-game-sentence-hint'>
              {sentenceHint}
            </div>
          )}
          {onScreenKanjiUsage && (
            <div id='in-game-kanji-usage' className='in-game-solution in-game-kanji-usage hidden-element'>
              {!isKanjiUsageQuestion && <span className='kanji-usage-word'>{onScreenKanjiUsage.word}</span>}
              <span className='kanji-usage-romanji'>{onScreenKanjiUsage.romanji}</span>
            </div>
          )}
          <button id='in-game-next-button' className='in-game-next-button hidden-element' onClick={advanceToNextKanji}>
            {t('gameNext')}<Icon name='arrow-right' className='icon-trailing' /><span className='label-keyboard'> (Enter)</span>
          </button>
        </div>
        {!isSrsPractice && inGameInputElement}
        <div className='hidden-text-for-font-loading'>
          {
            // Go with a for loop over every font, and create an element p with a class of the font
            fontClassList.map((fontClass) => {
              return (
                <p className={"font-" + fontClass} key={"font-" + fontClass}>a</p>
              )
            })
          }
        </div>
      </div>
      <UserGameScoreWindow
        visible={userGameScoreWindowVisible}
        bestStreak={bestStreak}
        gameStartedAt={gameStartedAt}
        srsResult={isSrsPractice ? (srsResult || { ...srsResultRef.current, next: getNextReview(selectedKanjiGroups) }) : null}
      />
    </>
  )
}
