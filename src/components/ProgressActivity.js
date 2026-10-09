import React, { useMemo, useState } from 'react';
import { getCalendarWeeks, getDailyTotals, getStreaks, getWeeklyTrend } from '../activityStats.js';
import { kanaCharacters } from '../kanaCharacters.js';
import { BEST_PRACTICE_STREAK_KEY } from '../statsStorage.js';
import BackupPanel from './BackupPanel.js';

const WEEKS = 12;

let kanaRomanji;

// Romaji shown under each kana of a mix-up pair
function getKanaRomanji(character) {
  if (!kanaRomanji) {
    kanaRomanji = {};
    for (const script of ['hiragana', 'katakana']) {
      for (const group of Object.values(kanaCharacters[script])) {
        for (const kana of Object.values(group.characters)) {
          kanaRomanji[kana.jp_character] = kana.romanji[0];
        }
      }
    }
  }
  return kanaRomanji[character] || '';
}

function ConfusionPairs({ pairs, practicableKana, onPractice, t }) {
  return (
    <div className='progress-activity-calendar-block' data-progress-section='confusions'>
      <div className='progress-stats-weakest-header progress-activity-panel-header'>
        <span>{t('statsConfusionsTitle')}</span>
        {practicableKana.length > 0 && (
          <button className='progress-stats-weakest-button' onClick={() => onPractice(practicableKana)}>
            {t('statsPracticeWeakest')}
          </button>
        )}
      </div>
      {pairs.length > 0 ? (
        <div className='progress-activity-confusions'>
          {pairs.map(pair => (
            <div
              key={pair.characters.join('')}
              className='progress-activity-confusion'
              aria-label={t('statsConfusionPair', { first: pair.characters[0], second: pair.characters[1], count: pair.count })}
            >
              {pair.characters.map(character => (
                <span key={character} className='progress-activity-confusion-kana'>
                  <span className='progress-activity-confusion-character'>{character}</span>
                  <span className='progress-activity-confusion-romanji'>{getKanaRomanji(character)}</span>
                </span>
              ))}
              <span className='progress-activity-confusion-count'>{pair.count}×</span>
            </div>
          ))}
        </div>
      ) : (
        <p className='progress-stats-weakest-empty'>{t('statsConfusionsEmpty')}</p>
      )}
    </div>
  );
}

// Calendar shade for a day: 0 is no practice, 4 is the most
function getActivityLevel(answers) {
  if (answers === 0) return 0;
  if (answers < 10) return 1;
  if (answers < 30) return 2;
  if (answers < 60) return 3;
  return 4;
}

function TrendChart({ title, points, maxValue, formatValue, formatWeek, noDataText }) {
  const [selected, setSelected] = useState(null);
  const width = 300;
  const height = 110;
  const left = 34;
  const right = 8;
  const top = 8;
  const bottom = 20;
  const step = (width - left - right) / (points.length - 1);
  const x = index => left + index * step;
  const y = value => top + (1 - value / maxValue) * (height - top - bottom);

  // The line breaks at weeks without answers
  const segments = [];
  let segment = [];
  points.forEach((point, index) => {
    if (point.value === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else {
      segment.push(`${x(index)},${y(point.value)}`);
    }
  });
  if (segment.length) segments.push(segment);

  const selectedPoint = selected !== null ? points[selected] : null;
  // Without a selection, the readout shows the latest week with answers
  const lastIndex = points.map(point => point.value !== null).lastIndexOf(true);
  const readoutIndex = selected !== null ? selected : lastIndex;
  const readoutPoint = readoutIndex >= 0 ? points[readoutIndex] : null;

  return (
    <div className='progress-activity-chart'>
      <div className='progress-activity-chart-title'>{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} role='img' aria-label={title}>
        {[0, maxValue / 2, maxValue].map(tick => (
          <g key={tick}>
            <line className='progress-activity-grid' x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} />
            <text className='progress-activity-axis' x={left - 6} y={y(tick)} textAnchor='end' dominantBaseline='middle'>
              {formatValue(tick)}
            </text>
          </g>
        ))}
        <text className='progress-activity-axis' x={left} y={height - 4} textAnchor='start'>
          {formatWeek(points[0])}
        </text>
        <text className='progress-activity-axis' x={width - right} y={height - 4} textAnchor='end'>
          {formatWeek(points[points.length - 1])}
        </text>
        {selectedPoint && (
          <line className='progress-activity-crosshair' x1={x(selected)} x2={x(selected)} y1={top} y2={height - bottom} />
        )}
        {segments.map(linePoints => (
          <polyline key={linePoints[0]} className='progress-activity-line' points={linePoints.join(' ')} />
        ))}
        {points.map((point, index) => point.value !== null && (
          <circle
            key={index}
            className={'progress-activity-dot' + (index === readoutIndex ? ' selected' : '')}
            cx={x(index)}
            cy={y(point.value)}
            r={index === readoutIndex ? 5 : 4}
          />
        ))}
        {/* Hit areas: a full-height column per week, so the pointer only has to be near the week */}
        {points.map((point, index) => (
          <rect
            key={index}
            className='progress-activity-hit'
            x={x(index) - step / 2}
            y={0}
            width={step}
            height={height}
            tabIndex={0}
            aria-label={`${formatWeek(point)}: ${point.value === null ? noDataText : formatValue(point.value)}`}
            onMouseEnter={() => setSelected(index)}
            onMouseLeave={() => setSelected(null)}
            onFocus={() => setSelected(index)}
            onBlur={() => setSelected(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(index);
            }}
          />
        ))}
      </svg>
      <div className='progress-activity-readout'>
        {readoutPoint && (
          <>
            <strong>{readoutPoint.value === null ? noDataText : formatValue(readoutPoint.value)}</strong>
            {' · '}{formatWeek(readoutPoint, true)}
          </>
        )}
      </div>
    </div>
  );
}

function ProgressActivity({ userStats, confusionPairs, practicableConfusedKana, onPractice, language, t }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const locale = language === 'id' ? 'id-ID' : 'en-US';
  const formatDate = timestamp =>
    new Date(timestamp).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const { streaks, calendar, trend, daysPracticed } = useMemo(() => {
    const now = Date.now();
    const dailyTotals = getDailyTotals(userStats);
    const calendar = getCalendarWeeks(dailyTotals, WEEKS, now);
    return {
      streaks: getStreaks(dailyTotals, now, Number(localStorage.getItem(BEST_PRACTICE_STREAK_KEY)) || 0),
      calendar,
      trend: getWeeklyTrend(dailyTotals, WEEKS, now),
      daysPracticed: calendar.flat().filter(day => day && day.answers > 0).length,
    };
  }, [userStats]);

  if (daysPracticed === 0 && streaks.best === 0) {
    return (
      <div className='progress-activity'>
        <p className='progress-activity-empty'>{t('statsActivityEmpty')}</p>
        <BackupPanel t={t} />
      </div>
    );
  }

  const answersThisWeek = trend[trend.length - 1].answers;
  const accuracyPoints = trend.map(week => ({ ...week, value: week.accuracy }));
  const speedPoints = trend.map(week => ({ ...week, value: week.averageSeconds }));
  const slowestWeek = Math.max(...speedPoints.map(point => point.value || 0));
  // The next even number above the slowest week, so the line never runs along the top edge
  const speedMax = Math.floor(slowestWeek / 2) * 2 + 2;
  // Week labels: the week's last day on the axis, the whole range in the readout
  const formatWeek = (week, withStart = false) =>
    withStart ? `${formatDate(week.start)} – ${formatDate(week.end)}` : formatDate(week.end);


  return (
    <div className='progress-activity'>
      <div className='progress-stats-summary'>
        {[
          [streaks.current, t('statsCurrentStreak')],
          [streaks.best, t('statsBestStreak')],
          [daysPracticed, t('statsDaysPracticed')],
          [answersThisWeek, t('statsAnswersThisWeek')],
        ].map(([value, label]) => (
          <div key={label} className='progress-stats-summary-item'>
            <div className='progress-stats-summary-value'>{value}</div>
            <div className='progress-stats-summary-label'>{label}</div>
          </div>
        ))}
      </div>

      <ConfusionPairs pairs={confusionPairs} practicableKana={practicableConfusedKana} onPractice={onPractice} t={t} />

      <div className='progress-activity-calendar-block'>
        <div className='progress-activity-chart-title'>{t('statsCalendarTitle')}</div>
        <div className='progress-activity-calendar' role='grid' aria-label={t('statsCalendarTitle')}>
          {calendar.map((week, weekIndex) => (
            <div key={weekIndex} className='progress-activity-week' role='row'>
              {week.map((day, weekday) => day ? (
                <div
                  key={weekday}
                  role='gridcell'
                  tabIndex={0}
                  className={`progress-activity-day level-${getActivityLevel(day.answers)}` +
                    (selectedDay && selectedDay.date === day.date ? ' selected' : '')}
                  aria-label={day.answers > 0
                    ? t('statsDayReadout', { date: formatDate(day.date), answers: day.answers, accuracy: Math.round(day.right / day.answers * 100) })
                    : t('statsDayNoPractice', { date: formatDate(day.date) })}
                  onMouseEnter={() => setSelectedDay(day)}
                  onMouseLeave={() => setSelectedDay(null)}
                  onFocus={() => setSelectedDay(day)}
                  onBlur={() => setSelectedDay(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay(day);
                  }}
                />
              ) : (
                <div key={weekday} className='progress-activity-day future' />
              ))}
            </div>
          ))}
        </div>
        <div className='progress-activity-calendar-footer'>
          <span className='progress-activity-readout'>
            {selectedDay
              ? (selectedDay.answers > 0
                ? t('statsDayReadout', { date: formatDate(selectedDay.date), answers: selectedDay.answers, accuracy: Math.round(selectedDay.right / selectedDay.answers * 100) })
                : t('statsDayNoPractice', { date: formatDate(selectedDay.date) }))
              : t('statsCalendarHint')}
          </span>
          <span className='progress-activity-scale'>
            {t('statsLess')}
            {[0, 1, 2, 3, 4].map(level => (
              <span key={level} className={`progress-activity-day level-${level}`} />
            ))}
            {t('statsMore')}
          </span>
        </div>
      </div>

      <div className='progress-activity-charts'>
        <TrendChart
          title={t('statsAccuracyTrend')}
          points={accuracyPoints}
          maxValue={100}
          formatValue={value => `${Math.round(value)}%`}
          formatWeek={formatWeek}
          noDataText={t('statsWeekNoData')}
        />
        <TrendChart
          title={t('statsSpeedTrend')}
          points={speedPoints}
          maxValue={speedMax}
          formatValue={value => `${Number(value.toFixed(1))}s`}
          formatWeek={formatWeek}
          noDataText={t('statsWeekNoData')}
        />
      </div>

      <BackupPanel t={t} />
    </div>
  );
}

export default ProgressActivity;
