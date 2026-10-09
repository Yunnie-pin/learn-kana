import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import Icon from './Icon';
import { getDailyTotals } from '../activityStats.js';
import { getDueReviewCount, getSelectedKanjiGroupTitles } from '../kanjiSrs.js';
import { getWeakestItems } from '../mastery.js';
import { getConfusionPairs, readConfusions } from '../confusions.js';
import { getListForPractice, getStoredPracticeMode } from '../practiceList.js';
import { BEST_PRACTICE_STREAK_KEY, LAST_BACKUP_KEY, downloadBackup } from '../statsStorage.js';
import {
  buildNotifications,
  countUnseen,
  dismissNotification,
  markNotificationsSeen,
  readNotificationState,
  visibleNotifications,
} from '../notifications.js';
import { openLearningProgress } from '../progressNavigation.js';

const GAME_PATH = '/learn-kana∕game';

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

// Everything the notifications are made from, read fresh from localStorage
function collectNotifications() {
  // What a game would show now, the same list the Learning Progress window uses
  const practiceList = getListForPractice(getSelectedKanjiGroupTitles(), getStoredPracticeMode());
  const userStats = readJson('userStats', {});
  return buildNotifications({
    dailyTotals: getDailyTotals(userStats),
    weakest: getWeakestItems(practiceList, userStats)
      .map(item => ({ character: item.jp_character, mastery: item.mastery })),
    dueKanji: getDueReviewCount(getSelectedKanjiGroupTitles()),
    confusionPairs: getConfusionPairs(readConfusions()),
    hasSelection: practiceList.length > 0,
    lastBackupAt: Number(localStorage.getItem(LAST_BACKUP_KEY)) || null,
    storedBestStreak: Number(localStorage.getItem(BEST_PRACTICE_STREAK_KEY)) || 0,
  });
}

export default function NotificationMenu() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unseen, setUnseen] = useState(0);
  const menuRef = useRef(null);

  const refresh = useCallback(() => {
    const all = collectNotifications();
    const state = readNotificationState();
    setNotifications(visibleNotifications(all, state));
    setUnseen(countUnseen(all, state));
  }, []);

  // Reminders depend on the time of day too, so check again when the user comes back to the tab
  useEffect(() => {
    refresh();
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  // Opening the panel marks everything in it as seen, the badge goes away
  useEffect(() => {
    if (!open) return;
    refresh();
    markNotificationsSeen(collectNotifications());
    setUnseen(0);

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, refresh]);

  const dismiss = (id) => {
    dismissNotification(id);
    refresh();
  };

  const runAction = (notification) => {
    switch (notification.action) {
      case 'srs':
        localStorage.setItem('game-mode-srs', 'true');
        navigate(GAME_PATH);
        break;
      case 'practice':
        localStorage.setItem('game-mode-srs', 'false');
        navigate(GAME_PATH);
        break;
      case 'open-progress':
        openLearningProgress(notification.section);
        break;
      case 'backup':
        downloadBackup();
        dismiss(notification.id);
        return;
      default:
        return;
    }
    setOpen(false);
  };

  const actionLabels = {
    srs: t('notifyActionReview'),
    practice: t('notifyActionPractice'),
    backup: t('notifyActionBackup'),
    'open-progress': t('notifyActionOpenProgress'),
  };

  return (
    <div className='notification-menu' ref={menuRef}>
      <button
        type='button'
        className='navbar-icon-button notification-button'
        aria-label={unseen > 0 ? `${t('navbarNotifications')} (${unseen})` : t('navbarNotifications')}
        aria-haspopup='dialog'
        aria-expanded={open}
        title={t('navbarNotifications')}
        onClick={() => setOpen(current => !current)}
      >
        <Icon name='bell' className={unseen > 0 ? 'icon-bell' : undefined} />
        {unseen > 0 && <span className='notification-badge' aria-hidden='true'>{unseen > 9 ? '9+' : unseen}</span>}
      </button>

      {open && (
        <div className='notification-panel' role='dialog' aria-label={t('navbarNotifications')}>
          <h2 className='notification-panel-title'>{t('navbarNotifications')}</h2>
          {notifications.length === 0 ? (
            <p className='notification-empty'>
              <Icon name='circle-check' className='icon-leading' />{t('notifyEmpty')}
            </p>
          ) : (
            <ul className='notification-list'>
              {notifications.map(notification => (
                <li key={notification.id} className={`notification-item notification-${notification.icon}`}>
                  <span className='notification-item-icon'><Icon name={notification.icon} /></span>
                  <div className='notification-item-body'>
                    {notification.titleKey && <h3 className='notification-item-title'>{t(notification.titleKey)}</h3>}
                    <p>{t(notification.key, notification.params)}</p>
                    {notification.chips && (
                      <div className='notification-chips'>
                        {notification.chips.map(chip => (
                          <span key={chip.text} className='notification-chip'>
                            <span className='notification-chip-text'>{chip.text}</span>
                            <span className='notification-chip-detail'>{chip.detail}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {notification.action && (
                      <button type='button' className='notification-action' onClick={() => runAction(notification)}>
                        {actionLabels[notification.action]}
                      </button>
                    )}
                  </div>
                  <button
                    type='button'
                    className='notification-dismiss'
                    aria-label={t('notifyDismiss')}
                    title={t('notifyDismiss')}
                    onClick={() => dismiss(notification.id)}
                  >
                    <Icon name='x' strokeWidth={2.5} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
