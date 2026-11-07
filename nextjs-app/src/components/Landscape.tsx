import React from 'react';

interface LandscapeProps {
  className?: string;
  preserveAspectRatio?: string;
}

/**
 * Flat, layered meadow: pale sky, sun and clouds, rolling sage hills with a
 * winding path, round bushes and a tall tree. Colours come from CSS variables
 * so the scene switches to a night palette in dark mode.
 */
export const Landscape: React.FC<LandscapeProps> = ({
  className,
  preserveAspectRatio = 'xMidYMax slice',
}) => (
  <svg
    viewBox="0 0 1440 760"
    preserveAspectRatio={preserveAspectRatio}
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <rect width="1440" height="760" fill="var(--l-sky)" />

    {/* Sun and clouds */}
    <circle cx="1130" cy="190" r="78" fill="var(--l-sun)" />
    <g fill="var(--l-cloud)">
      <path d="M980 262 C990 236 1024 228 1046 244 C1060 222 1100 220 1116 244 C1140 236 1172 246 1176 268 L1176 276 L980 276 Z" />
      <path d="M150 330 C160 300 200 292 226 310 C244 284 292 284 308 312 C336 302 372 316 374 342 L374 350 L150 350 Z" />
    </g>

    {/* Far hills */}
    <path
      d="M0 470 C160 420 300 410 450 440 C600 470 700 400 860 395 C1020 390 1150 450 1290 430 C1360 420 1410 410 1440 405 L1440 760 L0 760 Z"
      fill="var(--l-hill-far)"
    />
    {/* Mid hills */}
    <path
      d="M0 540 C140 500 260 480 400 505 C540 530 640 470 800 470 C960 470 1060 530 1200 515 C1300 505 1380 480 1440 470 L1440 760 L0 760 Z"
      fill="var(--l-hill-mid)"
    />
    {/* Winding path */}
    <path
      d="M650 760 C700 690 820 660 900 620 C960 590 960 560 900 540 C960 545 1010 565 1000 600 C985 650 860 690 820 760 Z"
      fill="var(--l-path)"
    />
    {/* Near hills */}
    <path
      d="M0 620 C150 580 300 590 440 620 C540 640 610 630 680 640 C700 680 670 720 650 760 L0 760 Z"
      fill="var(--l-hill-near)"
    />
    <path
      d="M860 760 C900 700 990 660 1100 640 C1220 618 1330 630 1440 600 L1440 760 Z"
      fill="var(--l-hill-near)"
    />

    {/* Tall tree on the right */}
    <path d="M1240 330 L1310 600 L1170 600 Z" fill="var(--l-tree-2)" />
    <path d="M1240 360 L1240 640" stroke="var(--l-trunk)" strokeWidth="6" strokeLinecap="round" />
    <path
      d="M1240 450 L1270 420 M1240 500 L1212 472 M1240 540 L1272 508"
      stroke="var(--l-trunk)"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Front bushes framing both sides */}
    <g fill="var(--l-hill-front)">
      <circle cx="40" cy="640" r="110" />
      <circle cx="170" cy="700" r="95" />
      <circle cx="300" cy="740" r="80" />
      <circle cx="1440" cy="660" r="120" />
      <circle cx="1320" cy="725" r="90" />
      <circle cx="1190" cy="760" r="70" />
    </g>
    <g fill="var(--l-tree)">
      <circle cx="-10" cy="560" r="80" />
      <circle cx="90" cy="600" r="60" />
      <circle cx="1460" cy="580" r="70" />
    </g>
  </svg>
);
