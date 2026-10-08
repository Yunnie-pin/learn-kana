import React, { useEffect, useState } from 'react'
import { kanaCharacters } from '../kanaCharacters.js'
import { useLanguage } from '../i18n'
import { isSpeechSupported, speak } from '../speech'
import Icon from './Icon'

/* userStats object structure:
{
    "あ": {
        "totalRightGuesses": 6,
        "totalWrongGuesses": 1,
        "totalWrongSubmissions": 2,
        "totalEditCount": 15,
        "totaltotalResponseTime":2.36,
        "totalAskForHelpCounter": 3,
        "currentGameStats": {
          "rightGuesses":1,
          "wrongGuesses":0,
          "wrongSubmissions":0,
          "editCount":3,
          "totalResponseTime":1.33,
          "askForHelpCounter":0
        }
        "dailyPerformance": [
            {
                "date": 1678886400000,
                "rightGuesses": 3,
                "wrongGuesses": 1,
                "wrongSubmissions": 2,
                "editCount": 8,
                "askForHelpCounter": 1,
                "responseTimeSum": 1.45
            }
        ]
    }
}
*/

// jp_character -> first romanji, for showing the right answer next to a kana / word
const romanjiOf = {};
for (const script of ['hiragana', 'katakana']) {
    for (const group of Object.values(kanaCharacters[script])) {
        for (const character of Object.values(group.characters)) {
            romanjiOf[character.jp_character] = character.romanji[0];
        }
    }
}
for (const word of Object.values(kanaCharacters.words)) {
    romanjiOf[word.jp_character] = word.romanji[0];
}

function getThirtyDaysAgoTimestamp() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return thirtyDaysAgo.getTime();
}

function goToMainMenu() {
    localStorage.removeItem('problematicKanasFilter');
    // Changing to window.location because of some react problems
    // (game-mode-word change wasn't being respected)
    window.location.href = "/learn-kana#game-menu-title";
}

function playAgain() {
    localStorage.removeItem('problematicKanasFilter');
    window.location.reload(false);
}

export default function UserGameScoreWindow(props) {
    const { t } = useLanguage();

    // Tapping a chip reads it aloud (when the browser has speech synthesis)
    const listenProps = (text) => isSpeechSupported() ? {
        role: 'button',
        tabIndex: 0,
        title: t('summaryListenTitle'),
        className: 'score-chip score-chip-listen',
        onClick: () => speak(text),
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                speak(text);
            }
        },
    } : {};
    const userStats = JSON.parse(localStorage.getItem('userStats')) || {};
    const [isNewStreakRecord, setIsNewStreakRecord] = useState(false);

    // Everything the player did in this game, per kana / word
    const sessionEntries = Object.entries(userStats)
        .map(([kana, stats]) => ({ kana, ...(stats.currentGameStats || {}) }))
        .map(entry => ({
            kana: entry.kana,
            right: entry.rightGuesses || 0,
            mistakes: (entry.wrongGuesses || 0) + (entry.wrongSubmissions || 0),
            hints: entry.askForHelpCounter || 0,
            responseTime: entry.totalResponseTime || 0,
        }));

    const totalRight = sessionEntries.reduce((sum, entry) => sum + entry.right, 0);
    const totalMistakes = sessionEntries.reduce((sum, entry) => sum + entry.mistakes, 0);
    const totalHints = sessionEntries.reduce((sum, entry) => sum + entry.hints, 0);
    const totalResponseTime = sessionEntries.reduce((sum, entry) => sum + entry.responseTime, 0);
    const accuracy = totalRight + totalMistakes > 0 ? Math.round(totalRight / (totalRight + totalMistakes) * 100) : 0;
    const averageTime = totalRight > 0 ? totalResponseTime / totalRight / 1000 : 0;

    // Kana that needed a hint or got a wrong answer this game, most troublesome first
    const needsPractice = sessionEntries
        .filter(entry => entry.mistakes + entry.hints > 0)
        .sort((a, b) => (b.mistakes + b.hints) - (a.mistakes + a.hints))
        .slice(0, 8);

    const slowest = sessionEntries
        .filter(entry => entry.right > 0)
        .map(entry => ({ kana: entry.kana, seconds: entry.responseTime / entry.right / 1000 }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5);

    // Average time per answer over the last 30 days, without this game
    function getPreviousAverageTime() {
        const since = getThirtyDaysAgoTimestamp();
        let right = 0;
        let time = 0;
        for (const stats of Object.values(userStats)) {
            for (const daily of stats.dailyPerformance || []) {
                if (daily.date >= since) {
                    right += daily.rightGuesses || 0;
                    time += daily.responseTimeSum || 0;
                }
            }
        }
        right -= totalRight;
        time -= totalResponseTime;
        // Too little history to compare against
        if (right < 10) return null;
        return time / right / 1000;
    }

    // Get problematic characters based on recent performance (last 30 days)
    function getProblematicCharactersForFilter() {
        const thirtyDaysAgoTimestamp = getThirtyDaysAgoTimestamp();

        // Collect metrics for all characters with recent data
        let allMetrics = [];
        for (const kana in userStats) {
            const stats = userStats[kana];
            if (!stats || !stats.dailyPerformance || stats.dailyPerformance.length === 0) {
                continue;
            }

            let recentRightGuesses = 0;
            let recentWrongGuesses = 0;
            let recentAskForHelpCounter = 0;
            let recentResponseTimeSum = 0;

            stats.dailyPerformance.forEach(daily => {
                if (daily.date >= thirtyDaysAgoTimestamp) {
                    recentRightGuesses += daily.rightGuesses || 0;
                    recentWrongGuesses += daily.wrongGuesses || 0;
                    recentAskForHelpCounter += daily.askForHelpCounter || 0;
                    recentResponseTimeSum += daily.responseTimeSum || 0;
                }
            });

            const totalAttempts = recentRightGuesses + recentWrongGuesses + recentAskForHelpCounter;
            if (totalAttempts >= 2) { // Minimum 2 attempts to be considered
                const errorRate = (recentWrongGuesses + recentAskForHelpCounter) / totalAttempts;
                const avgResponseTime = recentRightGuesses > 0 ? recentResponseTimeSum / recentRightGuesses : 0;

                allMetrics.push({
                    kana,
                    errorRate,
                    avgResponseTime,
                    problemScore: errorRate * 100 + (avgResponseTime / 1000) * 2 // Combined score
                });
            }
        }

        // Sort by problem score and take top 30% or at least 5 characters
        allMetrics.sort((a, b) => b.problemScore - a.problemScore);
        const numberOfProblematic = Math.max(5, Math.ceil(allMetrics.length * 0.3));
        const topProblematic = allMetrics.slice(0, numberOfProblematic);

        return topProblematic.map(m => m.kana);
    }

    function handleTryProblematicsClick() {
        const problematicChars = getProblematicCharactersForFilter();

        if (problematicChars.length === 0) {
            alert(t('summaryNoProblematics'));
            return;
        }

        // Store the problematic characters filter in localStorage
        localStorage.setItem('problematicKanasFilter', JSON.stringify(problematicChars));

        // Reload to start a new game with filtered characters
        window.location.reload(false);
    }

    // Compare the best streak with the all-time record once, when the summary opens
    useEffect(() => {
        if (!props.visible) return;
        const previousRecord = parseInt(localStorage.getItem('bestStreakRecord'), 10) || 0;
        if (props.bestStreak > previousRecord) {
            localStorage.setItem('bestStreakRecord', props.bestStreak);
            setIsNewStreakRecord(props.bestStreak >= 3);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.visible]);

    // Keyboard shortcuts on the summary
    useEffect(() => {
        if (!props.visible) return;
        const openedAt = Date.now();
        function handleKeyDown(e) {
            // Ignore keys still being typed for the last answer when the summary pops up
            if (Date.now() - openedAt < 600) return;
            if (e.key === 'Enter') {
                playAgain();
            } else if (e.key === 'Escape') {
                goToMainMenu();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [props.visible]);

    if (!props.visible) {
        return <></>;
    }

    let comparisonText = null;
    const previousAverageTime = totalRight > 0 ? getPreviousAverageTime() : null;
    if (previousAverageTime !== null) {
        const difference = averageTime - previousAverageTime;
        if (Math.abs(difference) < 0.05) {
            comparisonText = t('summarySamePace');
        } else if (difference < 0) {
            comparisonText = <><Icon name='arrow-up' className='icon-leading' />{t('summaryFaster', { seconds: Math.abs(difference).toFixed(1) })}</>;
        } else {
            comparisonText = <><Icon name='arrow-down' className='icon-leading' />{t('summarySlower', { seconds: difference.toFixed(1) })}</>;
        }
    }

    const isWordMode = localStorage.getItem("game-mode-word") === "true";

    let userStatsElement;
    if (totalRight > 0) {
        userStatsElement = <>
            <div className='score-cards'>
                <div className='score-card'>
                    <div className='score-card-value'>{accuracy}%</div>
                    <div className='score-card-label'>{t('summaryAccuracy')}</div>
                </div>
                <div className='score-card'>
                    <div className='score-card-value'>{averageTime.toFixed(1)}s</div>
                    <div className='score-card-label'>{t('summaryAvgTime')}</div>
                    {comparisonText && <div className='score-card-note'>{comparisonText}</div>}
                </div>
                <div className='score-card'>
                    <div className='score-card-value'><Icon name='flame' className='icon-flame icon-leading' />{props.bestStreak}</div>
                    <div className='score-card-label'>{t('summaryBestStreak')}</div>
                    {isNewStreakRecord && <div className='score-card-note score-card-note-highlight'>{t('summaryNewRecord')}</div>}
                </div>
                <div className='score-card'>
                    <div className='score-card-value'>{totalHints}</div>
                    <div className='score-card-label'>{t('summaryHintsUsed')}</div>
                </div>
            </div>
            {needsPractice.length > 0 && (
                <div className='score-section'>
                    <h3>{t('summaryNeedsPractice')}</h3>
                    <div className='score-chips'>
                        {needsPractice.map(entry => (
                            <span className='score-chip' key={'practice-' + entry.kana} {...listenProps(entry.kana)}>
                                <span className='score-chip-kana'>{entry.kana}</span>
                                <span className='score-chip-detail'>{romanjiOf[entry.kana] || ''}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
            <div className='score-section'>
                <h3>{t('summarySlowest')}</h3>
                <div className='score-chips'>
                    {slowest.map(entry => (
                        <span className='score-chip' key={'slow-' + entry.kana} {...listenProps(entry.kana)}>
                            <span className='score-chip-kana'>{entry.kana}</span>
                            <span className='score-chip-detail'>{entry.seconds.toFixed(1)}s</span>
                        </span>
                    ))}
                </div>
            </div>
        </>
    } else {
        userStatsElement = <div className='inGameUserGameScoreWindow_stats'>
            <div className='inGameUserGameScoreWindow_stats_speed'>
                <p>{t('summaryTryAgain')}</p>
            </div>
        </div>
    }

    return (
        <div className='inGameUserGameScoreBackground'>
            <div className='inGameUserGameScoreWindow'>
                <div className='inGameUserGameScoreWindow_header'>
                    <h1>{totalRight}</h1>
                    <h2>{isWordMode ? t('summaryCompletedWords') : t('summaryCompletedKanas')}</h2>
                </div>
                {userStatsElement}
                <div className='inGameUserGameScoreWindow_buttons'>
                    <button onClick={goToMainMenu}>{t('summaryBackToMenu')}</button>
                    <button onClick={handleTryProblematicsClick}>{t('summaryTryProblematics')}</button>
                    <button className='score-button-primary' onClick={playAgain}>{t('summaryPlayAgain')}</button>
                </div>
                <div className='score-shortcuts label-keyboard'>{t('summaryShortcuts')}</div>
            </div>
        </div>
    )
}
