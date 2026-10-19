import { readUserStats } from '../storage.js';

// Picks the next question of a game: every character gets a weight from how
// it was answered over the last 30 days (error rate, response time, edits,
// wrong submissions), compared with the median of the characters practiced,
// and one is drawn at random by weight. Characters never practiced weigh a
// bit more, so new ones come up early.
//
// previous: the character shown right before, never shown twice in a row
// when there is anything else to show
export function selectNextCharacter(charactersToShow, previous = null, userStats = readUserStats(), random = Math.random) {
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
    const randomIndex = Math.floor(random() * charactersToShow.length);
    return charactersToShow[randomIndex];
  }

  let randomNum = random() * totalWeight;
  let accumulatedWeight = 0;

  for (const char of weightedCharacters) {
    accumulatedWeight += char.weight;
    if (char.weight > 0 && randomNum <= accumulatedWeight) {
      return char;
    }
  }

  // Fallback in case something goes wrong (should ideally not be reached)
  return charactersToShow[Math.floor(random() * charactersToShow.length)];
}
