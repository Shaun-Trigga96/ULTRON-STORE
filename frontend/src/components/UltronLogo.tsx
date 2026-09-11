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
  className = '',
  size = 'md',
  height,
}: UltronLogoProps) {
  const sizeHeightMap = {
    xs: 24,
    sm: 32,
    md: 42,
    lg: 56,
    xl: 72,
  };

  const computedHeight = height || sizeHeightMap[size] || 42;

  return (
    <img 
      src="/Logo.png" 
      alt="ULTRON STORE" 
      style={{ height: computedHeight, width: 'auto' }}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
