import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics';

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
