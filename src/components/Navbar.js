import React, { useCallback, useState, useEffect } from 'react';
import { NavLink, useOutletContext } from 'react-router-dom';
import { LANGUAGES, useLanguage } from '../i18n';
import { ROUTES } from '../routes';
import Icon from './Icon';
import NotificationMenu from './NotificationMenu';
import AboutDialog, { GitHubMark } from './AboutDialog';

const NAVBAR_TABS = [
  { to: ROUTES.menu, icon: 'gamepad', label: 'tabGames' },
  { to: ROUTES.dictionary, icon: 'book-open', label: 'tabDictionary' },
  { to: ROUTES.materi, icon: 'graduation-cap', label: 'tabMateri' },
];

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useOutletContext();
  const darkMode = theme === 'dark';
  const [aboutOpen, setAboutOpen] = useState(false);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  // Code snippet for the PWA install button
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-brand'>
          <span className='navbar-title'>日本語</span>
        </div>
        {/* The app's tabs: the practice menu (Games), the Dictionary and the Materials */}
        <div className='segmented-control navbar-tabs' aria-label={t('navbarTabs')}>
          {NAVBAR_TABS.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end
              className={({ isActive }) => 'segmented-option navbar-tab' + (isActive ? ' active' : '')}
            >
              <Icon name={tab.icon} />
              <span>{t(tab.label)}</span>
            </NavLink>
          ))}
        </div>
        <div className='navbar-actions'>
          <NotificationMenu />
          <button
            type='button'
            className='navbar-theme-toggle'
            aria-label={darkMode ? t('navbarLightMode') : t('navbarDarkMode')}
            aria-pressed={darkMode}
            title={darkMode ? t('navbarLightMode') : t('navbarDarkMode')}
            onClick={toggleTheme}
          >
            <Icon name={darkMode ? 'sun' : 'moon'} />
          </button>
          <div className='segmented-control navbar-language' role='radiogroup' aria-label={t('navbarLanguage')}>
            {LANGUAGES.map((option) => (
              <button
                key={option.code}
                type='button'
                role='radio'
                aria-checked={language === option.code}
                className={'segmented-option' + (language === option.code ? ' active' : '')}
                onClick={() => setLanguage(option.code)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {deferredPrompt && (
            <button className='navbar-install' onClick={handleInstallClick} aria-label={t('navbarInstall')} title={t('navbarInstall')}>
              <Icon name='download' />
              <span className='navbar-install-label'>{t('navbarInstall')}</span>
            </button>
          )}
          {/* About the app: open source, its repository and the project it was forked from */}
          <button
            type='button'
            className='github-icon'
            onClick={() => setAboutOpen(true)}
            aria-haspopup='dialog'
            aria-label={t('navbarAbout')}
            title={t('navbarAbout')}
          >
            <GitHubMark />
          </button>
        </div>
      </nav>
      {aboutOpen && <AboutDialog onClose={closeAbout} />}
    </>
  );
}
