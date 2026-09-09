import React from 'react';
import { StoreProduct } from '../data/storeProducts';
import { BatteryCharging, MapPin } from 'lucide-react';

interface ProductGridProps {
  products: StoreProduct[];
  onSelectProduct: (product: StoreProduct) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onSelectProduct }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => {
        const isAvailable = product.status === 'AVAILABLE';
        const isHeldInCart = product.status === 'LOCKED_CHECKOUT_HOLD';
        const isSold = product.status === 'SOLD';
        
        return (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="cursor-pointer group flex flex-col items-center pt-10 pb-8 px-6 transition-all"
          >
            {/* Massive whitespace hero image */}
            <div className="relative w-full aspect-[4/5] flex items-center justify-center mb-8">
              <img
                src={product.imageUrl}
                alt={`${product.brand} ${product.model}`}
                referrerPolicy="no-referrer"
                className="w-[85%] object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            {/* Typography hierarchy */}
            <div className="flex flex-col items-center text-center space-y-2 w-full">
              {/* Unique Apple-style Specs - small, clean, uppercase, tracking-wider */}
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-semibold text-[#86868b] mb-1">
                <span>GRADE: {product.conditionGrade}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-[#d2d2d7] dark:bg-[#424245]"></span>
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3 h-3" />
                  BATT: {product.batteryHealthPct}%
                </span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
                {product.model}
              </h3>
              
              <p className="text-sm text-[#1d1d1f] dark:text-[#f5f5f7] mt-3 font-medium">
                From R{product.priceZar.toLocaleString()}
              </p>

              <div className="mt-5 pt-3 border-t border-[#d2d2d7]/50 dark:border-[#424245]/50 w-16 mx-auto" />
              
              {/* Status text */}
              <div className="text-[12px] font-medium mt-2">
                {isAvailable ? (
                  <span className="text-[#0071e3]">Available to Buy</span>
                ) : isHeldInCart ? (
                  <span className="text-[#f56300]">Reserved in Checkout</span>
                ) : (
                  <span className="text-[#86868b]">Sold Out</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
