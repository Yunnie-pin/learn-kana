import React, { useState, useEffect, useMemo } from 'react';
import { kanaCharacters } from '../kanaCharacters.js';
import { useLanguage } from '../i18n';
import { getKanjiSrsProgress, getKanjiSrsStage, getSelectedKanjiGroupTitles } from '../kanjiSrs.js';
import { calculateMastery, getWeakestItems } from '../mastery.js';
import { getConfusionPairs, readConfusions } from '../confusions.js';
import { getListForPractice, getStoredPracticeMode } from '../practiceList.js';
import ProgressActivity from './ProgressActivity.js';
import KanjiSrsPanel from './KanjiSrsPanel.js';

const SRS_STAGE_LABEL_KEYS = {
    learning: 'srsStageLearning',
    young: 'srsStageYoung',
    mature: 'srsStageMature',
};

function ProgressStatsModal(props) {
    const { t, meaningOf, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('characters');
    const [userStats, setUserStats] = useState({});
    const [confusions, setConfusions] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    useEffect(() => {
        // Load user stats from localStorage
        const stats = JSON.parse(localStorage.getItem('userStats')) || {};
        setUserStats(stats);
        setConfusions(readConfusions());
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

    // Mastery of every practiced item, calculated once each time the stats are loaded
    const masteryByCharacter = useMemo(() => {
        const now = Date.now();
        const result = {};
        for (const character of Object.keys(userStats)) {
            result[character] = calculateMastery(userStats[character], character, now);
        }
        return result;
    }, [userStats]);

    const getMastery = (character) => masteryByCharacter[character] ?? null;

    // What a game would show now: the selected groups and practice type
    const practiceList = useMemo(
        () => props.visible ? getListForPractice(getSelectedKanjiGroupTitles(), getStoredPracticeMode()) : [],
        [props.visible]
    );

    const weakestItems = useMemo(() => {
        return getWeakestItems(practiceList, userStats).map(item => ({
            character: item.jp_character,
            romanji: item.romanji[0],
            meaning: item.meaning ? meaningOf(item.jp_character, item.meaning) : undefined,
            mastery: item.mastery,
        }));
        // meaningOf changes on every render, the language it depends on does not
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [practiceList, userStats, language]);

    // Most frequent mix-ups, and which of their kana a game with the current selection can show
    const confusionPairs = useMemo(() => getConfusionPairs(confusions), [confusions]);
    const practicableConfusedKana = useMemo(() => {
        const available = new Set(practiceList.map(item => item.jp_character));
        return [...new Set(confusionPairs.flatMap(pair => pair.characters))]
            .filter(character => available.has(character));
    }, [confusionPairs, practiceList]);

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
            const masteryA = getMastery(a.character);
            const masteryB = getMastery(b.character);

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
            const masteryA = getMastery(a.character);
            const masteryB = getMastery(b.character);
            const bracketDifference = getMasteryBracket(masteryB) - getMasteryBracket(masteryA);
            return bracketDifference || a.originalIndex - b.originalIndex;
        });
    };

    // Get all words from kanaCharacters
    const getAllWords = () => {
        const words = Object.values(kanaCharacters.words).map((word, index) => ({
            character: word.jp_character,
            romanji: word.romanji[0],
            meaning: meaningOf(word.jp_character, word.meaning),
            originalIndex: index
        }));

        // Same order as the other tabs: by mastery bracket, then the original order
        return words.sort((a, b) => {
            const bracketDifference = getMasteryBracket(getMastery(b.character)) - getMasteryBracket(getMastery(a.character));
            return bracketDifference || a.originalIndex - b.originalIndex;
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

        if (activeTab === 'kanji') {
            const srsEntry = getKanjiSrsProgress()[character];
            const stage = getKanjiSrsStage(srsEntry);
            if (stage !== 'new') {
                const dueAt = Number(srsEntry.dueAt);
                const next = dueAt <= Date.now()
                    ? t('srsForecastNow')
                    : new Date(dueAt).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' });
                statsLines.push(t('srsTooltip', { stage: t(SRS_STAGE_LABEL_KEYS[stage]), next }));
            }
        }

        return statsLines.join('\n');
    };

    // Render character grid item
    const renderGridItem = (item, index) => {
        const mastery = getMastery(item.character);
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
                {mastery !== null && (
                    <div className="progress-stats-grid-item-mastery">
                        {mastery}%
                    </div>
                )}
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
    const getSummaryStats = (items) => {
        const withData = items.filter(item => getMastery(item.character) !== null);

        const masterySum = withData.reduce((sum, item) => sum + getMastery(item.character), 0);
        const avgMastery = withData.length > 0 ? Math.round(masterySum / withData.length) : 0;
        // Over everything in the tab: an item never practiced counts as 0%
        const overallProgress = items.length > 0 ? Math.round(masterySum / items.length) : 0;

        return {
            total: items.length,
            practiced: withData.length,
            avgMastery: avgMastery,
            overallProgress: overallProgress
        };
    };

    if (!props.visible) {
        return null;
    }

    const items = activeTab === 'characters' ? getAllCharacters()
        : activeTab === 'kanji' ? getAllKanji()
        : activeTab === 'words' ? getAllWords() : [];
    const summary = getSummaryStats(items);

    return (
        <div className='progress-stats-modal-background' onClick={props.onClose}>
            <div className='progress-stats-modal' onClick={(e) => { e.stopPropagation(); setHoveredItem(null); }}>
                <div className='progress-stats-modal-header'>
                    <h2>{t('statsTitle')}</h2>
                    <button className='progress-stats-modal-close' onClick={props.onClose}>×</button>
                </div>

                <div className='progress-stats-weakest'>
                    <div className='progress-stats-weakest-header'>
                        <span>{t('statsWeakestTitle')}</span>
                        {weakestItems.length > 0 && (
                            <button
                                className='progress-stats-weakest-button'
                                onClick={() => props.onPracticeWeakest(weakestItems.map(item => item.character))}
                            >
                                {t('statsPracticeWeakest')}
                            </button>
                        )}
                    </div>
                    {weakestItems.length > 0 ? (
                        <div className='progress-stats-weakest-list'>
                            {weakestItems.map(item => (
                                <div
                                    key={item.character}
                                    className='progress-stats-weakest-item'
                                    style={{ backgroundColor: getMasteryColor(item.mastery) }}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHoveredItem(item);
                                    }}
                                >
                                    <span className='progress-stats-weakest-character'>{item.character}</span>
                                    <span className='progress-stats-weakest-mastery'>{item.mastery}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className='progress-stats-weakest-empty'>{t('statsWeakestEmpty')}</p>
                    )}
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
                    <button
                        className={`progress-stats-tab ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        {t('statsTabActivity')}
                    </button>
                </div>

                {activeTab === 'activity' ? (
                    <div className='progress-activity-scroll'>
                        <ProgressActivity
                            userStats={userStats}
                            confusionPairs={confusionPairs}
                            practicableConfusedKana={practicableConfusedKana}
                            onPractice={props.onPracticeWeakest}
                            language={language}
                            t={t}
                        />
                    </div>
                ) : (
                    <>
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
                                <div className='progress-stats-summary-value'>{summary.overallProgress}%</div>
                                <div className='progress-stats-summary-label'>{t('statsOverallProgress')}</div>
                            </div>
                        </div>

                        {activeTab === 'kanji' && <KanjiSrsPanel visible={props.visible} language={language} t={t} />}

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
                    </>
                )}

                {renderTooltip()}
            </div>
        </div>
    );
}

export default ProgressStatsModal;
