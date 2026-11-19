import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'green' | 'cream' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withLink?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'green',
  size = 'md',
  withLink = true,
  className = '',
}) => {
  const colorHex = variant === 'green' ? '#15370D' : variant === 'cream' ? '#F5EFE1' : '#FFFFFF';

  const sizeDimensions = {
    sm: { width: 120, height: 48, scale: 0.65 },
    md: { width: 160, height: 64, scale: 0.85 },
    lg: { width: 220, height: 88, scale: 1.1 },
    xl: { width: 280, height: 112, scale: 1.4 },
  }[size];

  const content = (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ color: colorHex }}
      aria-label="Sapori Café & Eatery Logo"
    >
      <svg
        viewBox="0 0 240 100"
        width={sizeDimensions.width}
        height={sizeDimensions.height}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200"
      >
        {/* Emblem: Double Oval with Chili Peppers */}
        <g transform="translate(120, 24)">
          {/* Outer Oval Ring */}
          <ellipse cx="0" cy="0" rx="46" ry="18" fill="none" stroke="currentColor" strokeWidth="1.8" />
          {/* Inner Oval Ring */}
          <ellipse cx="0" cy="0" rx="42" ry="15" fill="none" stroke="currentColor" strokeWidth="0.9" />

          {/* Top Arched Chili */}
          <path
            d="M -16 -4 C -7 -12, 10 -11, 19 -1 C 21 0, 19 2, 16 1 C 8 -5, -4 -6, -14 0 Z"
            fill="currentColor"
          />
          {/* Top Chili Stem */}
          <path d="M -16 -4 C -21 -6, -23 -3, -20 -1 Z" fill="currentColor" />

          {/* Bottom Arched Chili */}
          <path
            d="M -23 4 C -12 -3, 8 -3, 29 4 C 33 6, 27 8, 22 7 C 5 2, -10 2, -20 7 Z"
            fill="currentColor"
          />
          {/* Bottom Chili Stem */}
          <path d="M -24 4 C -28 3, -31 5, -29 8 Z" fill="currentColor" />
        </g>

        {/* Wordmark: SAPORI */}
        <text
          x="120"
          y="74"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: "36px",
            letterSpacing: "4px",
          }}
        >
          SAPORI
        </text>

        {/* Sub-tagline: CAFE & EATERY */}
        <text
          x="120"
          y="93"
          textAnchor="middle"
          fill="currentColor"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 600,
            fontSize: "9px",
            letterSpacing: "7px",
          }}
        >
          CAFE & EATERY
        </text>
      </svg>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
