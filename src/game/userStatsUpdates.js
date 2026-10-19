// How a game updates the per-character stats (userStats in storage.js,
// keyed by the shown jp_character). Each function changes the stats object
// it is given and returns it; the game reads and writes the storage.
//
// One character's stats:
// {
//   totalTimesShown, totalRightGuesses, totalWrongGuesses, totalWrongSubmissions,
//   totalEditCount, totaltotalResponseTime (ms, correct answers), totalAskForHelpCounter,
//   currentGameStats: { rightGuesses, wrongGuesses, wrongSubmissions, editCount,
//                       totalResponseTime, askForHelpCounter },   // this game only
//   dailyPerformance: [{ date (midnight), rightGuesses, wrongGuesses, wrongSubmissions,
//                        editCount, askForHelpCounter, responseTimeSum }],
//                     // older days are merged into weeks, see statsStorage.js
// }

export const GUESS_TYPES = ['correct', 'wrong', 'wrongSubmission', 'edit', 'askForHelp'];
// A slow answer counts as this long at most, so a break does not skew the stats
export const MAX_RESPONSE_TIME = 10000;

const emptyGameStats = () => ({ rightGuesses: 0, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, totalResponseTime: 0, askForHelpCounter: 0 });

const newCharacterStats = (timesShown) => ({
  totalTimesShown: timesShown,
  totalRightGuesses: 0,
  totalWrongGuesses: 0,
  totalWrongSubmissions: 0,
  totalEditCount: 0,
  totaltotalResponseTime: 0,
  totalAskForHelpCounter: 0,
  currentGameStats: emptyGameStats(),
  dailyPerformance: [],
});

function startOfDay(now) {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

// A new game: every character's currentGameStats back to zero
export function resetCurrentGameStats(userStats) {
  for (const character in userStats) {
    if (userStats[character].currentGameStats === undefined) {
      userStats[character].currentGameStats = {};
    }
    Object.assign(userStats[character].currentGameStats, emptyGameStats());
  }
  return userStats;
}

// The character is shown as a question
export function recordShown(userStats, character) {
  const stats = userStats[character];
  if (!stats) {
    userStats[character] = newCharacterStats(1);
    return userStats;
  }
  stats.totalTimesShown = (stats.totalTimesShown || 0) + 1;
  // Fields older versions of the app did not have
  if (!stats.dailyPerformance) stats.dailyPerformance = [];
  if (!stats.hasOwnProperty('totalWrongGuesses') && !stats.hasOwnProperty('totalTouchWrongGuesses')) {
    stats.totalWrongGuesses = 0;
  }
  if (!stats.hasOwnProperty('totalWrongSubmissions')) stats.totalWrongSubmissions = 0;
  if (!stats.hasOwnProperty('totalEditCount')) stats.totalEditCount = 0;
  return userStats;
}

// An answer to the character (guessType: one of GUESS_TYPES); responseTime
// (ms since it was shown) only counts for a correct answer
export function recordGuess(userStats, character, guessType, responseTime = 0, now = Date.now()) {
  if (!userStats[character]) {
    userStats[character] = newCharacterStats(0);
  } else {
    const stats = userStats[character];
    // Fields older versions of the app named or did not have
    if (stats.hasOwnProperty('totalTouchWrongGuesses')) {
      stats.totalWrongGuesses = stats.totalTouchWrongGuesses;
      delete stats.totalTouchWrongGuesses;
    }
    if (stats.currentGameStats && stats.currentGameStats.hasOwnProperty('touchWrongGuesses')) {
      stats.currentGameStats.wrongGuesses = stats.currentGameStats.touchWrongGuesses;
      delete stats.currentGameStats.touchWrongGuesses;
    }
    if (!stats.hasOwnProperty('totalWrongSubmissions')) stats.totalWrongSubmissions = 0;
    if (!stats.hasOwnProperty('totalEditCount')) stats.totalEditCount = 0;
  }
  const stats = userStats[character];
  if (!stats.currentGameStats) stats.currentGameStats = emptyGameStats();
  const game = stats.currentGameStats;
  if (!game.hasOwnProperty('wrongSubmissions')) game.wrongSubmissions = 0;
  if (!game.hasOwnProperty('editCount')) game.editCount = 0;
  if (!stats.dailyPerformance) stats.dailyPerformance = [];

  const today = startOfDay(now);
  let daily = stats.dailyPerformance.find(entry => entry.date === today);
  if (!daily) {
    daily = { date: today, rightGuesses: 0, wrongGuesses: 0, wrongSubmissions: 0, editCount: 0, askForHelpCounter: 0, responseTimeSum: 0.0 };
    stats.dailyPerformance.push(daily);
  }

  if (guessType === 'correct') {
    const time = Math.min(responseTime, MAX_RESPONSE_TIME);
    game.totalResponseTime += time;
    game.rightGuesses++;
    stats.totalRightGuesses = (stats.totalRightGuesses || 0) + 1;
    stats.totaltotalResponseTime = (stats.totaltotalResponseTime || 0) + time;
    daily.rightGuesses++;
    daily.responseTimeSum += time;
  } else if (guessType === 'wrong') {
    game.wrongGuesses++;
    stats.totalWrongGuesses = (stats.totalWrongGuesses || 0) + 1;
    daily.wrongGuesses++;
  } else if (guessType === 'wrongSubmission') {
    game.wrongSubmissions++;
    stats.totalWrongSubmissions = (stats.totalWrongSubmissions || 0) + 1;
    daily.wrongSubmissions++;
  } else if (guessType === 'edit') {
    game.editCount++;
    stats.totalEditCount = (stats.totalEditCount || 0) + 1;
    daily.editCount++;
  } else if (guessType === 'askForHelp') {
    game.askForHelpCounter++;
    stats.totalAskForHelpCounter = (stats.totalAskForHelpCounter || 0) + 1;
    daily.askForHelpCounter++;
  }
  return userStats;
}
