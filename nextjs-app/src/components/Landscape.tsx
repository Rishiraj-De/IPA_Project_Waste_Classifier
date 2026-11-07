import React from 'react';

interface LandscapeProps {
  className?: string;
  preserveAspectRatio?: string;
}

/**
 * Flat, layered landscape: blush sky, lavender ridges, green meadow and a
 * sorted set of bins in the grass. Colours come from CSS variables so the
 * scene switches to a dusk palette in dark mode.
 */
export const Landscape: React.FC<LandscapeProps> = ({
  className,
  preserveAspectRatio = 'xMaxYMid slice',
}) => (
  <svg
    viewBox="0 0 1440 640"
    preserveAspectRatio={preserveAspectRatio}
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <rect width="1440" height="640" fill="var(--l-sky)" />
    <circle cx="1130" cy="150" r="64" fill="var(--l-sun)" />

    {/* Far ridges */}
    <path
      d="M0 330 L120 230 L210 280 L330 170 L450 260 L560 190 L700 290 L820 160 L930 240 L1040 150 L1170 250 L1290 180 L1440 270 L1440 640 L0 640 Z"
      fill="var(--l-ridge-far)"
    />
    {/* Mid ridges */}
    <path
      d="M0 380 L150 300 L260 350 L400 250 L520 330 L660 270 L780 350 L900 240 L1010 320 L1150 230 L1270 310 L1440 250 L1440 640 L0 640 Z"
      fill="var(--l-ridge-mid)"
    />
    {/* Near ridge with snow-free flat facets */}
    <path
      d="M0 470 L130 420 L260 455 L400 395 L560 420 L700 330 L790 380 L900 300 L1000 370 L1120 310 L1240 380 L1340 330 L1440 370 L1440 640 L0 640 Z"
      fill="var(--l-ridge-near)"
    />

    {/* Meadow hills */}
    <path
      d="M0 520 C150 490 300 480 420 470 C620 390 820 400 1000 430 C1160 455 1300 400 1440 380 L1440 640 L0 640 Z"
      fill="var(--l-hill-far)"
    />
    <path
      d="M0 575 C200 545 380 550 520 540 C700 460 900 470 1080 500 C1240 525 1340 480 1440 470 L1440 640 L0 640 Z"
      fill="var(--l-hill-mid)"
    />
    <path
      d="M0 625 C250 600 450 605 640 610 C820 560 1000 560 1180 585 C1300 600 1380 580 1440 575 L1440 640 L0 640 Z"
      fill="var(--l-hill-near)"
    />

    {/* Trees */}
    <g fill="var(--l-tree)">
      <ellipse cx="960" cy="425" rx="34" ry="26" />
      <ellipse cx="1000" cy="432" rx="26" ry="20" />
      <ellipse cx="1300" cy="402" rx="30" ry="24" />
      <ellipse cx="1338" cy="410" rx="22" ry="17" />
    </g>
    <g fill="var(--l-tree-2)">
      <path d="M760 470 L782 410 L804 470 Z" />
      <path d="M792 476 L810 428 L828 476 Z" />
      <path d="M1192 500 L1214 440 L1236 500 Z" />
    </g>

    {/* Three sorting bins standing in the grass */}
    <g transform="translate(1040 520)">
      <rect x="0" y="0" width="38" height="50" rx="5" fill="#5b8fc9" />
      <rect x="-3" y="-8" width="44" height="10" rx="4" fill="#4878ad" />
      <rect x="52" y="0" width="38" height="50" rx="5" fill="#5f8c1e" />
      <rect x="49" y="-8" width="44" height="10" rx="4" fill="#4a7016" />
      <rect x="104" y="0" width="38" height="50" rx="5" fill="#d0743f" />
      <rect x="101" y="-8" width="44" height="10" rx="4" fill="#b55f30" />
    </g>

  </svg>
);
