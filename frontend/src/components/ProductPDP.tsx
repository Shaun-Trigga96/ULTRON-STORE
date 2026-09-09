import React from 'react';
import { StoreProduct } from '../data/storeProducts';
import { ShieldCheck, CheckCircle2, ChevronRight, X, Sparkles, Clock, Lock, Truck } from 'lucide-react';

interface ProductPDPProps {
  product: StoreProduct | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct) => void;
  isAddingToCart: boolean;
}

export const ProductPDP: React.FC<ProductPDPProps> = ({ product, onClose, onAddToCart, isAddingToCart }) => {
  if (!product) return null;

  const isAvailable = product.status === 'AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-[#000000]/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      {/* Sticky top nav for PDP */}
      <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 bg-white/70 dark:bg-[#000000]/70 backdrop-blur-md z-50 border-b border-[#d2d2d7]/30 dark:border-[#424245]/30">
        <h2 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
          {product.brand} {product.model}
        </h2>
        <button
          onClick={onClose}
          className="p-2 -mr-2 text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-28 pb-20 min-h-screen flex flex-col md:flex-row gap-16 md:gap-24 items-center md:items-start">
        
        {/* Left: Oversized Hero Imagery */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.model}
            className="w-[90%] md:w-[100%] max-w-lg object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Right: Product Details & Typography */}
        <div className="w-full md:w-1/2 flex flex-col space-y-10">
          
          {/* Header & Specs */}
          <div>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#86868b] mb-4">
              <span>PRE-OWNED & CERTIFIED</span>
              <span className="w-[3px] h-[3px] rounded-full bg-[#d2d2d7] dark:bg-[#424245]"></span>
              <span>UNIQUE IMEI: {product.imei.slice(-6)}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight leading-tight">
              {product.model}.
            </h1>
            
            <p className="text-[21px] text-[#1d1d1f] dark:text-[#f5f5f7] mt-4 font-medium tracking-tight">
              R{product.priceZar.toLocaleString()}
            </p>
          </div>

          <div className="w-full h-px bg-[#d2d2d7]/50 dark:bg-[#424245]/50" />

          {/* Diagnostics Grid */}
          <div>
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0071e3]" />
              40-Point Diagnostic Inspection
            </h3>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#86868b]">Battery Health</p>
                <p className="text-[17px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{product.batteryHealthPct}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#86868b]">Cosmetic Grade</p>
                <p className="text-[17px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{product.conditionGrade}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#86868b]">Original Box</p>
                <p className="text-[17px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{product.hasOriginalBox ? 'Included' : 'No'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-[#86868b]">Original Charger</p>
                <p className="text-[17px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{product.hasOriginalCharger ? 'Included' : 'No'}</p>
              </div>
            </div>
            
            <a href="#" className="inline-flex items-center gap-1 text-[14px] text-[#0071e3] hover:underline mt-6 font-medium">
              See full inspection report <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* CTA Area */}
          <div className="pt-6">
            <button
              onClick={() => onAddToCart(product)}
              disabled={!isAvailable || isAddingToCart}
              className={`w-full md:w-auto px-12 py-4 rounded-full font-medium text-[17px] transition-all flex items-center justify-center gap-2 ${
                !isAvailable
                  ? 'bg-[#f5f5f7] dark:bg-[#424245] text-[#86868b] cursor-not-allowed'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
              }`}
            >
              {isAddingToCart ? 'Holding...' : isAvailable ? 'Buy' : 'Out of Stock'}
            </button>
            
            {isAvailable && (
              <p className="text-[12px] text-[#86868b] mt-4 flex items-center justify-center md:justify-start gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Stock will be held for 10 minutes at checkout.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
