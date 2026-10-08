import React from 'react'

// Inline line icons (24x24 grid, Lucide style) used instead of emoji so they look the same
// on every platform and follow the text color (light and dark theme)
const ICON_PATHS = {
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  lightbulb: <>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </>,
  target: <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>,
  type: <>
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </>,
  volume: <>
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>,
  'arrow-right': <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
  'arrow-up': <>
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </>,
  'arrow-down': <>
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </>,
  x: <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
  check: <path d="M20 6 9 17l-5-5" />,
  plus: <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>,
  sun: <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
};

// Sized in em so an icon matches the text next to it; decorative unless a title is given
export default function Icon({ name, className, title, strokeWidth = 2 }) {
  return (
    <svg
      className={'icon' + (className ? ` ${className}` : '')}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {ICON_PATHS[name]}
    </svg>
  );
}
