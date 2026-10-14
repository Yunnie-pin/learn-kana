import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics';
import { useLanguage } from '../i18n';
import { ROUTES } from '../routes';

// The <meta> tag with this name, created when index.html has none
function metaTag(name) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
    }
    return meta;
}

export default function Layout() {
    const location = useLocation();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

    const updateThemeColor = (nextTheme) => {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'theme-color';
            document.head.appendChild(meta);
        }
        meta.content = nextTheme === 'dark' ? '#2a373d' : '#155263';
    };

    useEffect(() => {
        trackPageView(location.pathname);
    }, [location]);

    // Title and description of the page in the app's language. Only the menu
    // is worth finding in search results: the game screen and unknown
    // addresses ask search engines not to index them.
    const { t } = useLanguage();
    useEffect(() => {
        const page = location.pathname === ROUTES.menu ? 'menu'
            : location.pathname === ROUTES.game ? 'game'
            : 'notFound';
        document.title = t({ menu: 'seoTitleMenu', game: 'seoTitleGame', notFound: 'seoTitleNotFound' }[page]);
        metaTag('description').content = t('seoDescription');
        metaTag('robots').content = page === 'menu' ? 'index, follow' : 'noindex, follow';
    }, [location.pathname, t]);

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme;
        updateThemeColor(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        updateThemeColor(nextTheme);
        setTheme(nextTheme);
    };

    return <Outlet context={{
        theme,
        toggleTheme,
    }} />;
}
