import * as React from 'react';
import { Navigate } from 'react-router-dom';
import App from './App';
import InGame from './pages/InGame';
import Dictionary from './pages/Dictionary';
import NotFound from './NotFound';
import Layout from './components/Layout';
import { LEGACY_ROUTES, ROUTES } from './routes';

// The routes of the app (see routes.js for the paths and the basename)
export const appRoutes = [
  {
    element: <Layout />,
    children: [
      { path: ROUTES.menu, element: <App /> },
      { path: ROUTES.game, element: <InGame /> },
      { path: ROUTES.dictionary, element: <Dictionary /> },
      // Old addresses from bookmarks and installed apps
      { path: LEGACY_ROUTES.menu, element: <Navigate to={ROUTES.menu} replace /> },
      { path: LEGACY_ROUTES.game, element: <Navigate to={ROUTES.game} replace /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
