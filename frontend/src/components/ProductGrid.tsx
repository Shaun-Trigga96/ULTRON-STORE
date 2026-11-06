import React from 'react';
import { StoreProduct } from '../data/storeProducts';
import { formatZar, GRADES } from '../lib/format';
import { ProductImage } from './ProductImage';

interface ProductGridProps {
  products: StoreProduct[];
  onSelectProduct: (product: StoreProduct) => void;
  onAddToCart: (product: StoreProduct) => void;
}

export const ProductCard: React.FC<{
  product: StoreProduct;
  onSelect: () => void;
  onAdd: () => void;
}> = ({ product, onSelect, onAdd }) => {
  const grade = GRADES[product.conditionGrade];
  const isAvailable = product.status === 'AVAILABLE';
  const isHeld = product.status === 'LOCKED_CHECKOUT_HOLD';
  const isAccessory = product.category === 'accessories';

  return (
    <article className="group flex flex-col gap-3">
      <button
        type="button"
        onClick={onSelect}
        className="relative block w-full text-left rounded-[var(--radius-card)] overflow-hidden cursor-pointer"
        aria-label={`View ${product.model}`}
      >
        <ProductImage
          product={product}
          className="aspect-[4/5] rounded-[var(--radius-card)] transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <span className={`badge absolute left-3.5 top-3.5 ${grade.badge}`}>{grade.label}</span>
        {!isAvailable && (
          <span className={`badge absolute right-3.5 top-3.5 ${isHeld ? 'bg-volt text-white' : 'bg-ink text-white'}`}>
            {isHeld ? 'In a cart' : 'Sold'}
          </span>
        )}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-3 mt-1">
        <h3 className="font-display font-bold text-[18px] leading-tight">
          <button type="button" onClick={onSelect} className="text-left hover:underline underline-offset-4 cursor-pointer">
            {product.model}
          </button>
        </h3>
        <span className="font-display font-extrabold text-[18px] whitespace-nowrap">{formatZar(product.priceZar)}</span>
      </div>

      <p className="text-[14px] text-muted">
        {isAccessory
          ? `${product.brand} · ${product.warrantyMonths}-month warranty`
          : `${product.storageGb}GB · Battery ${product.batteryHealthPct}%`}
      </p>

      <button
        type="button"
        onClick={onAdd}
        disabled={!isAvailable}
        className="btn btn-outline btn-sm w-full mt-1"
      >
        {isAvailable ? 'Add to cart' : isHeld ? 'Reserved' : 'Sold out'}
      </button>
    </article>
  );
};

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onSelectProduct, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] bg-paper py-20 text-center">
        <p className="font-display font-bold text-[20px]">No devices match those filters</p>
        <p className="text-muted mt-2">Try another brand or grade, or clear your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={() => onSelectProduct(product)}
          onAdd={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
};
