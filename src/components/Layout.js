import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics';

export default function Layout() {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname);
    }, [location]);

    return <Outlet />;
}
