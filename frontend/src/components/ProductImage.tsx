import React, { useState } from 'react';
import type { StoreProduct } from '../data/storeProducts';

interface ProductImageProps {
  product: StoreProduct;
  /** Tailwind sizing for the phone outline shown when there is no photo. */
  placeholderSize?: string;
  className?: string;
  imgClassName?: string;
  src?: string;
}

/**
 * Shows the product photo, cropped to fill its frame, or a tinted phone outline
 * when the photo is missing or fails to load.
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  placeholderSize = 'w-[34%] max-w-[120px]',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  src,
}) => {
  const [failed, setFailed] = useState(false);
  const url = src || product.imageUrl;
  const tint = product.imageColorHex || '#d4d4d4';

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-paper ${className}`}
      style={{ backgroundImage: `radial-gradient(circle at 50% 60%, ${tint}33 0%, transparent 65%)` }}
    >
      {!failed && url ? (
        <img
          src={url}
          alt={`${product.brand} ${product.model}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className={imgClassName}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          role="img"
          aria-label={`${product.brand} ${product.model}`}
          className={`${placeholderSize} aspect-[1/2] rounded-[22%/11%] border-[3px] border-ink relative`}
          style={{ background: `linear-gradient(160deg, #ffffff 0%, ${tint}55 100%)` }}
        >
          <span className="absolute left-1/2 top-[5%] -translate-x-1/2 w-[28%] h-[3%] rounded-full bg-ink" />
        </div>
      )}
    </div>
  );
};
