import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import './App.css';
import './InGame.css';
import App from './App';
import InGame from './pages/InGame'
import NotFound from './NotFound';
import './fonts/Belanosima/Belanosima-SemiBold.ttf'
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { loadAnalytics } from './analytics';
import { LanguageProvider } from './i18n';
import { runStatsMaintenance } from './statsStorage';



import Layout from './components/Layout';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: < App />,
      },
      {
        path: "/learn-kana",
        element: < App />,
      },
      {
        path: "/learn-kana∕game",
        element: <InGame />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Keeps the saved practice history small; does nothing when it already ran today
try {
  runStatsMaintenance();
} catch (error) {
  console.warn('Stats maintenance failed.', error);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </React.StrictMode>
);

// Deploy updates without users having to clear their cache.
// By default a new service worker waits until every tab of the app is closed, so a
// rebuilt site kept showing the old version. Instead, activate it as soon as it's ready.
if ('serviceWorker' in navigator) {
  // On the very first visit the service worker also takes control, that must not reload the page
  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return;
    // Don't interrupt a running game: the next page load (menu / play again) picks up the new version
    if (window.location.pathname.includes('game')) return;
    reloading = true;
    window.location.reload();
  });
}

serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    // An update downloaded during an earlier visit can still be waiting: activate it too
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    // Tabs left open for a long time check for a new version when the user comes back to them
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        registration.update();
      }
    });
  });
}

loadAnalytics();