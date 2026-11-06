import React from 'react';

/**
 * The "Renew U" mark: a U drawn as a refresh arrow, a phone given a second life.
 * Blue stroke, yellow dot. On a yellow background, pass tone="ink" to draw it in black.
 */
export function UltronMark({ size = 40, tone = 'brand', className = '' }: { size?: number; tone?: 'brand' | 'ink'; className?: string }) {
  const stroke = tone === 'ink' ? '#0A0A0A' : '#1A5CFF';
  const dot = tone === 'ink' ? '#1A5CFF' : '#FFE500';
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path d="M22 18 V54 a28 28 0 0 0 56 0 V30" fill="none" stroke={stroke} strokeWidth="16" strokeLinecap="round" />
      <path d="M64 32 L78 14 L92 32 Z" fill={stroke} />
      <circle cx="22" cy="18" r="8" fill={dot} />
    </svg>
  );
}

export interface UltronLogoProps {
  /** "full" shows the mark and the wordmark, "icon" shows the mark only. */
  variant?: 'full' | 'icon';
  /** "light" is for dark backgrounds. */
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { mark: 32, word: 'text-[22px]', sub: 'text-[8px]' },
  md: { mark: 42, word: 'text-[28px]', sub: 'text-[10px]' },
  lg: { mark: 56, word: 'text-[38px]', sub: 'text-[13px]' },
};

export function UltronLogo({ variant = 'full', theme = 'dark', size = 'md', className = '' }: UltronLogoProps) {
  const s = SIZES[size];
  const color = theme === 'light' ? 'text-white' : 'text-ink';

  if (variant === 'icon') {
    return <UltronMark size={s.mark} className={className} />;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${color} ${className}`}>
      <UltronMark size={s.mark} />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-black tracking-[-0.02em] ${s.word}`}>ULTRON</span>
        <span className={`font-display font-bold tracking-[0.5em] mt-[3px] ${s.sub}`}>STORE</span>
      </span>
    </span>
  );
}
