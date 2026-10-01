// Umami analytics, configured at build time through .env:
//   REACT_APP_UMAMI_SCRIPT_URL  e.g. https://umami.example.com/script.js
//   REACT_APP_UMAMI_WEBSITE_ID  the website id from the Umami dashboard
// When either is missing, no tracking script is loaded at all.
const scriptUrl = process.env.REACT_APP_UMAMI_SCRIPT_URL;
const websiteId = process.env.REACT_APP_UMAMI_WEBSITE_ID;

let lastTrackedPath = null;

// Sends a page view. The path always starts with /learn-kana, so GitHub Pages
// (served under /learn-kana) and root deployments (Cloudflare, Docker) report the same URLs
export function trackPageView(pathname) {
  if (!window.umami) return;
  const trackPath = pathname.startsWith('/learn-kana')
    ? pathname
    : `/learn-kana${pathname === '/' ? '' : pathname}`;
  // The script can finish loading right as the first page renders: don't count that view twice
  if (trackPath === lastTrackedPath) return;
  lastTrackedPath = trackPath;

  window.umami.track(props => ({
    ...props,
    url: trackPath
  }));
}

export function loadAnalytics() {
  if (!scriptUrl || !websiteId) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = scriptUrl;
  script.dataset.websiteId = websiteId;
  // Page views are sent by trackPageView on every route change instead
  script.dataset.autoTrack = 'false';
  // The first page has usually rendered before the script arrives, so track it once loaded
  script.onload = () => trackPageView(window.location.pathname);
  document.head.appendChild(script);
}
