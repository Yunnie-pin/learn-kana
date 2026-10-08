import React, { useMemo } from 'react';
import { getKanjiSrsSummary } from '../kanjiSrs.js';

const STAGES = ['new', 'learning', 'young', 'mature'];
// Most kanji are usually still new, so the meter shows only the reviewed ones
const REVIEWED_STAGES = ['learning', 'young', 'mature'];
const STAGE_LABEL_KEYS = {
  new: 'srsStageNew',
  learning: 'srsStageLearning',
  young: 'srsStageYoung',
  mature: 'srsStageMature',
};

// Review progress of every kanji: how far along each one is and when reviews come due
function KanjiSrsPanel({ visible, language, t }) {
  const summary = useMemo(() => getKanjiSrsSummary(), [visible]);
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  const columns = [{ label: t('srsForecastNow'), count: summary.dueNow }];
  summary.forecast.forEach((count, day) => {
    const date = new Date();
    date.setDate(date.getDate() + day);
    columns.push({
      label: day === 0 ? t('srsForecastToday') : date.toLocaleDateString(locale, { weekday: 'short' }),
      count,
    });
  });
  const maxCount = Math.max(1, ...columns.map(column => column.count));

  return (
    <div className='progress-activity-calendar-block kanji-srs-panel'>
      <div className='progress-stats-weakest-header progress-activity-panel-header'>
        <span>{t('srsPanelTitle')}</span>
        <span className='kanji-srs-panel-due'>{t('srsPanelDue', { count: summary.dueNow })}</span>
      </div>

      <div className='kanji-srs-panel-body'>
        <div className='kanji-srs-stages'>
          <div className='kanji-srs-meter' role='img' aria-label={STAGES.map(stage => `${t(STAGE_LABEL_KEYS[stage])}: ${summary.stages[stage]}`).join(', ')}>
            {REVIEWED_STAGES.filter(stage => summary.stages[stage] > 0).map(stage => (
              <div
                key={stage}
                className={`kanji-srs-meter-segment stage-${stage}`}
                style={{ flexGrow: summary.stages[stage] }}
              />
            ))}
          </div>
          <div className='kanji-srs-legend'>
            {STAGES.map(stage => (
              <span key={stage} className='kanji-srs-legend-item'>
                {stage !== 'new' && <span className={`kanji-srs-legend-swatch stage-${stage}`} />}
                {t(STAGE_LABEL_KEYS[stage])} <strong>{summary.stages[stage]}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className='kanji-srs-forecast' role='img' aria-label={columns.map(column => `${column.label}: ${column.count}`).join(', ')}>
          {columns.map((column, index) => (
            <div key={index} className='kanji-srs-forecast-column'>
              <div className='kanji-srs-forecast-plot'>
                <span className='kanji-srs-forecast-value'>{column.count || ''}</span>
                <div
                  className='kanji-srs-forecast-bar'
                  style={{ height: `calc((100% - 1.2em) * ${column.count / maxCount})` }}
                />
              </div>
              <span className='kanji-srs-forecast-label'>{column.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default KanjiSrsPanel;
