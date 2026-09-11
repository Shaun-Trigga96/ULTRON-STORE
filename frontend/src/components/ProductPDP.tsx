import React, { useEffect, useRef, useState } from 'react';
import { StoreProduct } from '../data/storeProducts';
import { ShieldCheck, ChevronDown, X, Lock, Truck, RotateCcw, BadgeCheck } from 'lucide-react';

interface ProductPDPProps {
  product: StoreProduct | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct) => void;
  isAddingToCart: boolean;
}

export const ProductPDP: React.FC<ProductPDPProps> = ({ product, onClose, onAddToCart, isAddingToCart }) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const mainCtaRef = useRef<HTMLDivElement>(null);

  // Reveal the sticky mini-CTA only once the primary CTA has scrolled out of view.
  useEffect(() => {
    if (!product) return;
    const el = mainCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product]);

  if (!product) return null;

  const isAvailable = product.status === 'AVAILABLE';

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-[#000000] animate-in fade-in duration-300 overflow-y-auto">
      {/* Sticky top nav — swaps in the mini-CTA once the main one scrolls away */}
      <div className="sticky top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 bg-white/80 dark:bg-[#000000]/80 backdrop-blur-md z-50 border-b border-[#d2d2d7]/30 dark:border-[#424245]/30">
        <h2 className="text-[15px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight truncate pr-4">
          {product.brand} {product.model}
        </h2>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`hidden sm:flex items-center gap-3 transition-all duration-300 transition-luxe ${
              showStickyCta ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
            }`}
          >
            <span className="text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
              R{product.priceZar.toLocaleString()}
            </span>
            <button
              onClick={() => onAddToCart(product)}
              disabled={!isAvailable || isAddingToCart}
              className={`px-5 py-2 rounded-full text-[13px] font-medium transition-all active:scale-[0.97] ${
                !isAvailable
                  ? 'bg-[#f5f5f7] dark:bg-[#424245] text-[#86868b] cursor-not-allowed'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
              }`}
            >
              {isAvailable ? 'Buy' : 'Out of Stock'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#1d1d1f] dark:text-[#f5f5f7] hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-24 min-h-screen flex flex-col md:flex-row gap-16 md:gap-24 items-start">

        {/* Left: hero image with subtle zoom-on-hover, plus a cosmetic macro shot */}
        <div className="w-full md:w-1/2 md:sticky md:top-24 flex flex-col items-center gap-6">
          <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.model}
              className="w-[85%] object-contain filter drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 transition-luxe hover:scale-110 cursor-zoom-in"
            />
          </div>
          <p className="text-[12px] text-[#86868b] text-center">
            This exact unit — photographed as inspected, not a stock image.
          </p>
        </div>

        {/* Right: provenance dossier */}
        <div className="w-full md:w-1/2 flex flex-col space-y-10">

          <div>
            <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#86868b] mb-4">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Verified unit · IMEI ···{product.imei.slice(-6)}</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.08]">
              {product.model}
            </h1>

            <p className="text-[22px] text-[#1d1d1f] dark:text-[#f5f5f7] mt-4 font-medium tracking-tight">
              R{product.priceZar.toLocaleString()}
            </p>
          </div>

          <div className="w-full h-px bg-[#d2d2d7]/40 dark:bg-[#424245]/40" />

          {/* Reassurance strip — provenance, not discount */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
              <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">12-month warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#0071e3]" />
              <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">Free overnight</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#0071e3]" />
              <span className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">7-day returns</span>
            </div>
          </div>

          <div className="w-full h-px bg-[#d2d2d7]/40 dark:bg-[#424245]/40" />

          {/* Diagnostics, presented like a provenance card */}
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mb-6">
              Inspection dossier
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

            {/* Accordion, not a link-out — keeps the report on-page */}
            <div className="mt-6 border-t border-[#d2d2d7]/40 dark:border-[#424245]/40">
              <button
                onClick={() => setReportOpen((v) => !v)}
                className="w-full flex items-center justify-between py-4 text-[14px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
              >
                <span>Full 40-point inspection report</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#86868b] transition-transform duration-300 transition-luxe ${
                    reportOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 transition-luxe ${
                  reportOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="pb-5 space-y-2.5 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                    <li>Screen, digitizer &amp; True Tone response verified</li>
                    <li>Battery cycle count and max capacity benchmarked</li>
                    <li>Cameras, biometric sensors &amp; charging port function-tested</li>
                    <li>Chassis and glass inspected under raking light for micro-fractures</li>
                    <li>IMEI cross-checked against loss, theft &amp; finance-lock registries</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA — its position is what the sticky header watches */}
          <div ref={mainCtaRef} className="pt-2">
            <button
              onClick={() => onAddToCart(product)}
              disabled={!isAvailable || isAddingToCart}
              className={`w-full md:w-auto px-12 py-4 rounded-full font-medium text-[17px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                !isAvailable
                  ? 'bg-[#f5f5f7] dark:bg-[#424245] text-[#86868b] cursor-not-allowed'
                  : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
              }`}
            >
              {isAddingToCart ? 'Holding...' : isAvailable ? 'Buy' : 'Out of Stock'}
            </button>

            {isAvailable && (
              <p className="text-[12px] text-[#86868b] mt-4 flex items-center justify-center md:justify-start gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                As a one-of-a-kind unit, this device is held for 10 minutes once added to your bag.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};