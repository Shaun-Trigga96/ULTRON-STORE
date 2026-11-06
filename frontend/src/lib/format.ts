import type { StoreProduct } from '../data/storeProducts';

export const formatZar = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(amount);

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

type Grade = StoreProduct['conditionGrade'];

/** Display name, badge style and short description for each cosmetic grade. */
export const GRADES: Record<Grade, { label: string; badge: string; dot: string; blurb: string }> = {
  MINT: {
    label: 'Mint',
    badge: 'bg-sun text-ink',
    dot: 'bg-mint',
    blurb: 'Looks new. No visible marks on the screen or body.',
  },
  GOOD: {
    label: 'Good',
    badge: 'bg-white text-ink border border-ink',
    dot: 'bg-good',
    blurb: 'Light signs of use you can only spot up close.',
  },
  FAIR: {
    label: 'Fair',
    badge: 'bg-ink text-white',
    dot: 'bg-fair',
    blurb: 'Visible wear on the body. Works perfectly, at the best price.',
  },
};
