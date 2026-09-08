import React from 'react';

export interface UltronLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  height?: number | string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export function UltronLogo({
  variant = 'full',
  theme = 'auto',
  className = '',
  size = 'md',
  height,
  showSubtitle = false,
  subtitleText = 'Cloud Native Platform'
}: UltronLogoProps) {
  // Height presets
  const sizeHeightMap = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
  };

  const computedHeight = height || sizeHeightMap[size] || 42;

  // Icon only (Square aspect ratio)
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 250 220"
        height={computedHeight}
        className={`inline-block shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ULTRON STORE"
      >
        <defs>
          <linearGradient id="ui-logo-loop-left" x1="0%" y1="80%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="40%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#00D8F6" />
          </linearGradient>

          <linearGradient id="ui-logo-loop-top" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id="ui-logo-basket" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id="ui-logo-arrow" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        <g transform="translate(10, 5)">
          {/* Left Loop of Infinity */}
          <path
            d="M 128,105 C 128,75 106,52 76,52 C 46,52 24,76 24,106 C 24,136 47,158 77,158 C 104,158 122,138 138,114"
            stroke="url(#ui-logo-loop-left)"
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crossing Ribbon */}
          <path
            d="M 68,155 C 95,152 118,128 136,104 C 152,80 170,54 200,54 C 214,54 226,63 232,76"
            stroke="url(#ui-logo-loop-top)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Shopping Cart Basket */}
          <path
            d="M 230,74 L 223,105 C 218,128 198,144 174,144 L 138,144 C 126,144 116,134 118,122 C 119,112 128,104 138,104 L 142,104"
            stroke="url(#ui-logo-basket)"
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Cart Upper Rim */}
          <path d="M 222,76 L 236,76" stroke="url(#ui-logo-basket)" strokeWidth="14" strokeLinecap="round" />

          {/* Arrow */}
          <path d="M 134,105 L 175,105" stroke="url(#ui-logo-arrow)" strokeWidth="14" strokeLinecap="round" />
          <path d="M 166,88 L 194,105 L 166,122 Z" fill="url(#ui-logo-arrow)" strokeLinejoin="round" />

          {/* Wheels */}
          <circle cx="146" cy="168" r="9" fill="#6D28D9" />
          <circle cx="188" cy="168" r="9" fill="#7C3AED" />
        </g>
      </svg>
    );
  }

  // Full Horizontal Logo
  const isDarkTheme = theme === 'dark' || theme === 'auto';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 780 220"
        height={computedHeight}
        className="w-auto shrink-0 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ULTRON STORE"
      >
        <defs>
          <linearGradient id={`ui-full-left-${theme}`} x1="0%" y1="80%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="40%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#00D8F6" />
          </linearGradient>

          <linearGradient id={`ui-full-top-${theme}`} x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="40%" stopColor="#38BDF8" />
            <stop offset="70%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <linearGradient id={`ui-full-basket-${theme}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6D28D9" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          <linearGradient id={`ui-full-arrow-${theme}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <filter id={`ui-glow-${theme}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00D8F6" floodOpacity={isDarkTheme ? 0.35 : 0.2} />
          </filter>
        </defs>

        {/* LOGO ICON */}
        <g transform="translate(10, 5)" filter={`url(#ui-glow-${theme})`}>
          <path
            d="M 128,105 C 128,75 106,52 76,52 C 46,52 24,76 24,106 C 24,136 47,158 77,158 C 104,158 122,138 138,114"
            stroke={`url(#ui-full-left-${theme})`}
            strokeWidth="19"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 68,155 C 95,152 118,128 136,104 C 152,80 170,54 200,54 C 214,54 226,63 232,76"
            stroke={`url(#ui-full-top-${theme})`}
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 230,74 L 223,105 C 218,128 198,144 174,144 L 138,144 C 126,144 116,134 118,122 C 119,112 128,104 138,104 L 142,104"
            stroke={`url(#ui-full-basket-${theme})`}
            strokeWidth="17"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path d="M 222,76 L 236,76" stroke={`url(#ui-full-basket-${theme})`} strokeWidth="14" strokeLinecap="round" />

          {/* Arrow */}
          <path d="M 134,105 L 175,105" stroke={`url(#ui-full-arrow-${theme})`} strokeWidth="14" strokeLinecap="round" />
          <path d="M 166,88 L 194,105 L 166,122 Z" fill={`url(#ui-full-arrow-${theme})`} strokeLinejoin="round" />

          {/* Wheels */}
          <circle cx="146" cy="168" r="9" fill="#6D28D9" />
          <circle cx="188" cy="168" r="9" fill="#7C3AED" />
        </g>

        {/* LOGO TYPOGRAPHY */}
        <g transform="translate(265, 0)">
          <text
            x="0"
            y="108"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif"
            fontSize="78"
            fontWeight="900"
            letterSpacing="2.5"
            fill={isDarkTheme ? '#FFFFFF' : '#0B0F19'}
          >
            ULTRON
          </text>

          <text
            x="2"
            y="168"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif"
            fontSize="52"
            fontWeight="700"
            letterSpacing="7"
            fill={isDarkTheme ? '#94A3B8' : '#374151'}
          >
            STORE
          </text>
        </g>
      </svg>

      {showSubtitle && (
        <div className="hidden sm:flex flex-col border-l border-slate-700 pl-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            ENTERPRISE
          </span>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {subtitleText}
          </span>
        </div>
      )}
    </div>
  );
}
