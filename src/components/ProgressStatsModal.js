import React, { useState, useEffect } from 'react';
import { kanaCharacters } from '../kanaCharacters.js';
import { useLanguage } from '../i18n';

function ProgressStatsModal(props) {
    const { t, meaningOf } = useLanguage();
    const [activeTab, setActiveTab] = useState('characters');
    const [userStats, setUserStats] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        // Load user stats from localStorage
        const stats = JSON.parse(localStorage.getItem('userStats')) || {};
        setUserStats(stats);
    }, [props.visible]);

    useEffect(() => {
        // Clear hovered item when switching tabs
        setHoveredItem(null);
    }, [activeTab]);

    useEffect(() => {
        // Prevent background scrolling when modal is open
        if (props.visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore scrolling when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [props.visible]);

    // Calculate mastery level based on stats (0-100)
    const calculateMastery = (character) => {
        const stats = userStats[character];
        if (!stats) return null;

        const totalAttempts = stats.totalRightGuesses + stats.totalWrongGuesses;
        if (totalAttempts === 0) return null;

        // Calculate accuracy (0-1)
        const accuracy = stats.totalRightGuesses / totalAttempts;

        // Calculate average response time (lower is better, cap at 5 seconds)
        const avgResponseTime = stats.totaltotalResponseTime / stats.totalRightGuesses / 1000;
        const timeScore = Math.max(0, 1 - (avgResponseTime / 5));

        // Calculate help factor (less help is better)
        const helpFactor = Math.max(0, 1 - (stats.totalAskForHelpCounter / totalAttempts));

        // Calculate edit efficiency (fewer edits per correct answer is better)
        const avgEditsPerCorrect = stats.totalRightGuesses > 0 
            ? (stats.totalEditCount || 0) / stats.totalRightGuesses 
            : 0;
        const editEfficiency = Math.max(0, 1 - (avgEditsPerCorrect / 5)); // Cap at 5 edits

        // Calculate wrong submission penalty (fewer wrong submissions is better)
        const wrongSubmissionRate = (stats.totalWrongSubmissions || 0) / totalAttempts;
        const submissionAccuracy = Math.max(0, 1 - wrongSubmissionRate);

        // Calculate experience factor (more practice is better, cap at 20 attempts)
        const experienceFactor = Math.min(totalAttempts / 20, 1);

        // Weighted formula: accuracy (40%), time (15%), help (10%), edits (15%), submissions (10%), experience (10%)
        const mastery = (
            accuracy * 0.4 + 
            timeScore * 0.15 + 
            helpFactor * 0.1 + 
            editEfficiency * 0.15 + 
            submissionAccuracy * 0.1 + 
            experienceFactor * 0.1
        ) * 100;

        return Math.round(mastery);
    };

    // Get color based on mastery level
    const getMasteryColor = (mastery) => {
        if (mastery === null) return '#ffffff10'; // No data - very subtle
        if (mastery >= 80) return '#4ade80'; // Green - excellent
        if (mastery >= 60) return '#22d3ee'; // Cyan - good
        if (mastery >= 40) return '#fbbf24'; // Yellow - ok
        if (mastery >= 20) return '#fb923c'; // Orange - needs work
        return '#f87171'; // Red - struggling
    };

    // Get mastery bracket for sorting
    const getMasteryBracket = (mastery) => {
        if (mastery === null) return 0; // No data
        if (mastery >= 80) return 5; // Excellent
        if (mastery >= 60) return 4; // Good
        if (mastery >= 40) return 3; // OK
        if (mastery >= 20) return 2; // Needs Work
        return 1; // Struggling
    };

    // Get all characters from kanaCharacters
    const getAllCharacters = () => {
        const characters = [];
        let index = 0;

        ['hiragana', 'katakana'].forEach(type => {
            Object.keys(kanaCharacters[type]).forEach(groupKey => {
                const group = kanaCharacters[type][groupKey];
                Object.keys(group.characters).forEach(charKey => {
                    const char = group.characters[charKey];
                    characters.push({
                        character: char.jp_character,
                        romanji: char.romanji[0],
                        type: type,
                        originalIndex: index++
                    });
                });
            });
        });

        // Sort: characters with data first (by mastery bracket), then characters without data
        // Within same bracket, sort by original order
        return characters.sort((a, b) => {
            const masteryA = calculateMastery(a.character);
            const masteryB = calculateMastery(b.character);

            const bracketA = getMasteryBracket(masteryA);
            const bracketB = getMasteryBracket(masteryB);

            if (bracketA !== bracketB) {
                return bracketB - bracketA; // Higher bracket first
            }

            return a.originalIndex - b.originalIndex; // Original order
        });
    };

    const getAllKanji = () => {
        const kanji = [];
        let index = 0;

        Object.values(kanaCharacters.kanji).forEach(group => {
            Object.values(group.characters).forEach(character => {
                kanji.push({
                    character: character.jp_character,
                    romanji: character.romanji[0],
                    meaning: meaningOf(character.jp_character, character.meaning),
                    originalIndex: index++
                });
            });
        });

        return kanji.sort((a, b) => {
            const masteryA = calculateMastery(a.character);
            const masteryB = calculateMastery(b.character);
            const bracketDifference = getMasteryBracket(masteryB) - getMasteryBracket(masteryA);
            return bracketDifference || a.originalIndex - b.originalIndex;
        });
    };

    // Get all words from kanaCharacters
    const getAllWords = () => {
        const words = [];

        Object.keys(kanaCharacters.words).forEach(wordKey => {
            const word = kanaCharacters.words[wordKey];
            words.push({
                character: word.jp_character,
                romanji: word.romanji[0],
                meaning: meaningOf(word.jp_character, word.meaning)
            });
        });

        // Sort: words with data first (by mastery), then words without data
        return words.sort((a, b) => {
            const masteryA = calculateMastery(a.character);
            const masteryB = calculateMastery(b.character);

            if (masteryA === null && masteryB === null) return 0;
            if (masteryA === null) return 1;
            if (masteryB === null) return -1;

            return masteryB - masteryA; // Higher mastery first
        });
    };

    // Format stats for tooltip
    const getStatsText = (character) => {
        const stats = userStats[character];
        if (!stats) {
            return t('statsNoPracticeData');
        }

        const totalAttempts = stats.totalRightGuesses + stats.totalWrongGuesses;
        const accuracy = totalAttempts > 0 ? Math.round((stats.totalRightGuesses / totalAttempts) * 100) : 0;
        const avgResponseTime = stats.totalRightGuesses > 0
            ? (stats.totaltotalResponseTime / stats.totalRightGuesses / 1000).toFixed(2)
            : 0;
        const avgEditsPerCorrect = stats.totalRightGuesses > 0
            ? ((stats.totalEditCount || 0) / stats.totalRightGuesses).toFixed(1)
            : 0;

        let statsLines = [
            t('statsTimesShown', { count: stats.totalTimesShown || 'N/A' }),
            t('statsCorrectWrong', { correct: stats.totalRightGuesses, wrong: stats.totalWrongGuesses }),
            t('statsAccuracy', { percent: accuracy }),
            t('statsAvgTime', { seconds: avgResponseTime }),
        ];

        if (stats.totalEditCount > 0) {
            statsLines.push(t('statsEdits', { count: stats.totalEditCount, average: avgEditsPerCorrect }));
        }

        if (stats.totalWrongSubmissions > 0) {
            statsLines.push(t('statsWrongSubmissions', { count: stats.totalWrongSubmissions }));
        }

        if (stats.totalAskForHelpCounter > 0) {
            statsLines.push(t('statsHelpRequested', { count: stats.totalAskForHelpCounter }));
        }

        return statsLines.join('\n');
    };

    // Render character grid item
    const renderGridItem = (item, index) => {
        const mastery = calculateMastery(item.character);
        const color = getMasteryColor(mastery);

        return (
            <div
                key={`${activeTab}-${item.character}-${item.romanji}-${index}`}
                className="progress-stats-grid-item"
                style={{ 
                    backgroundColor: color,
                    '--mastery-color': color
                }}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                // Touch screens have no mouseleave: a tap shows the tooltip and a tap elsewhere hides it
                onClick={(e) => {
                    e.stopPropagation();
                    setHoveredItem(item);
                }}
            >
                <div className={`progress-stats-grid-item-character${activeTab === 'kanji' ? ' progress-stats-kanji-character' : ''}`}>
                    {item.character}
                </div>
                <div className="progress-stats-grid-item-romanji">
                    {item.romanji}
                </div>
                {/* {mastery !== null && (
                    <div className="progress-stats-grid-item-mastery">
                        {mastery}%
                    </div>
                )} */}
            </div>
        );
    };

    // Render tooltip
    const renderTooltip = () => {
        if (!hoveredItem) return null;

        return (
            <div className="progress-stats-tooltip">
                <div className="progress-stats-tooltip-title">
                    {hoveredItem.character} ({hoveredItem.romanji})
                    {hoveredItem.meaning && <span className="progress-stats-tooltip-meaning"> - {hoveredItem.meaning}</span>}
                </div>
                <div className="progress-stats-tooltip-content">
                    {getStatsText(hoveredItem.character).split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            </div>
        );
    };

    // Get summary stats
    const getSummaryStats = () => {
        const items = activeTab === 'characters'
            ? getAllCharacters()
            : activeTab === 'kanji' ? getAllKanji() : getAllWords();
        const withData = items.filter(item => calculateMastery(item.character) !== null);
        const withoutData = items.filter(item => calculateMastery(item.character) === null);

        const avgMastery = withData.length > 0
            ? Math.round(withData.reduce((sum, item) => sum + calculateMastery(item.character), 0) / withData.length)
            : 0;

        return {
            total: items.length,
            practiced: withData.length,
            notPracticed: withoutData.length,
            avgMastery: avgMastery
        };
    };

    if (!props.visible) {
        return null;
    }

    const items = activeTab === 'characters'
        ? getAllCharacters()
        : activeTab === 'kanji' ? getAllKanji() : getAllWords();
    const summary = getSummaryStats();

    return (
        <div className='progress-stats-modal-background' onClick={props.onClose}>
            <div className='progress-stats-modal' onClick={(e) => { e.stopPropagation(); setHoveredItem(null); }}>
                <div className='progress-stats-modal-header'>
                    <h2>{t('statsTitle')}</h2>
                    <button className='progress-stats-modal-close' onClick={props.onClose}>×</button>
                </div>

                <div className='progress-stats-modal-tabs'>
                    <button
                        className={`progress-stats-tab ${activeTab === 'characters' ? 'active' : ''}`}
                        onClick={() => setActiveTab('characters')}
                    >
                        {t('practiceCharacters')}
                    </button>
                    <button
                        className={`progress-stats-tab ${activeTab === 'words' ? 'active' : ''}`}
                        onClick={() => setActiveTab('words')}
                    >
                        {t('practiceWords')}
                    </button>
                    <button
                        className={`progress-stats-tab ${activeTab === 'kanji' ? 'active' : ''}`}
                        onClick={() => setActiveTab('kanji')}
                    >
                        {t('practiceKanji')}
                    </button>
                </div>

                <div className='progress-stats-summary'>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.practiced}/{summary.total}</div>
                        <div className='progress-stats-summary-label'>{t('statsPracticed')}</div>
                    </div>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.avgMastery}%</div>
                        <div className='progress-stats-summary-label'>{t('statsAvgMastery')}</div>
                    </div>
                    <div className='progress-stats-summary-item'>
                        <div className='progress-stats-summary-value'>{summary.notPracticed}</div>
                        <div className='progress-stats-summary-label'>{t('statsNotPracticed')}</div>
                    </div>
                </div>

                <div className='progress-stats-legend'>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#4ade80'}}></div>
                        <span>{t('statsExcellent')}</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#22d3ee'}}></div>
                        <span>{t('statsGood')}</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#fbbf24'}}></div>
                        <span>{t('statsOk')}</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#fb923c'}}></div>
                        <span>{t('statsNeedsWork')}</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#f87171'}}></div>
                        <span>{t('statsStruggling')}</span>
                    </div>
                    <div className='progress-stats-legend-item'>
                        <div className='progress-stats-legend-color' style={{backgroundColor: '#ffffff10'}}></div>
                        <span>{t('statsNoData')}</span>
                    </div>
                </div>

                <div className='progress-stats-grid-container'>
                    <div className='progress-stats-grid' key={activeTab}>
                        {items.map((item, index) => renderGridItem(item, index))}
                    </div>
                </div>

                {renderTooltip()}
            </div>
        </div>
    );
}

export default ProgressStatsModal;
