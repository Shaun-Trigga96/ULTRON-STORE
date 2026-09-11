import React from 'react';
import { StoreProduct } from '../data/storeProducts';
import { BatteryCharging, ShieldCheck } from 'lucide-react';

interface ProductGridProps {
  products: StoreProduct[];
  onSelectProduct: (product: StoreProduct) => void;
}

const gradeLabel: Record<string, string> = {
  MINT: 'Mint',
  GOOD: 'Good',
  FAIR: 'Fair',
};

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onSelectProduct }) => {
  return (
    // Wider gutters, capped at 2 columns above the fold on large screens — fewer, better-lit
    // products read as curated inventory rather than a discount bin.
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-20">
      {products.map((product) => {
        const isAvailable = product.status === 'AVAILABLE';
        const isHeldInCart = product.status === 'LOCKED_CHECKOUT_HOLD';

        return (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="cursor-pointer group flex flex-col items-center pt-2 pb-2 px-4"
          >
            {/* Hero image, generous negative space */}
            <div className="relative w-full aspect-[4/5] flex items-center justify-center mb-10">
              <img
                src={product.imageUrl}
                alt={`${product.brand} ${product.model}`}
                referrerPolicy="no-referrer"
                className="w-[78%] object-contain transition-transform duration-500 transition-luxe group-hover:scale-[1.03] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Verified-unit signal — reframes "used" as "individually inspected" */}
              <div className="absolute top-0 left-0 flex items-center gap-1 text-[10px] font-medium text-[#6e6e73] dark:text-[#a1a1a6] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ShieldCheck className="w-3 h-3" />
                <span>Unit verified</span>
              </div>
            </div>

            {/* Typography hierarchy */}
            <div className="flex flex-col items-center text-center space-y-2.5 w-full">
              <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.14em] font-semibold text-[#86868b]">
                <span>Grade {gradeLabel[product.conditionGrade] ?? product.conditionGrade}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#d2d2d7] dark:bg-[#424245]" />
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3" />
                  {product.batteryHealthPct}%
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-[28px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                {product.model}
              </h3>

              <p className="text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
                From R{product.priceZar.toLocaleString()}
              </p>

              {/* Status — quiet by default, color only where it signals real urgency */}
              <div className="pt-3 text-[12px] font-medium tracking-wide">
                {isAvailable ? (
                  <span className="text-[#6e6e73] dark:text-[#a1a1a6] group-hover:text-[#0071e3] transition-colors">
                    Available
                  </span>
                ) : isHeldInCart ? (
                  <span className="text-[#f56300]">Reserved</span>
                ) : (
                  <span className="text-[#86868b]">Sold</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};