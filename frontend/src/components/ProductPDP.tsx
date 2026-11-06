import React, { useEffect } from 'react';
import { StoreProduct } from '../data/storeProducts';
import { ArrowLeft, ShieldCheck, Lock, Truck, RotateCcw, BadgeCheck, Check } from 'lucide-react';
import { formatZar, GRADES } from '../lib/format';
import { ProductImage } from './ProductImage';

interface ProductPDPProps {
  product: StoreProduct | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct) => void;
  isAddingToCart: boolean;
}

export const ProductPDP: React.FC<ProductPDPProps> = ({ product, onClose, onAddToCart, isAddingToCart }) => {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [product, onClose]);

  if (!product) return null;

  const isAvailable = product.status === 'AVAILABLE';
  const grade = GRADES[product.conditionGrade];
  const isAccessory = product.category === 'accessories';

  const diagnostics = [
    !isAccessory && { label: 'Battery health', value: `${product.batteryHealthPct}%` },
    !isAccessory && { label: 'Battery cycles', value: `${product.batteryCycleCount}` },
    { label: 'Cosmetic grade', value: grade.label },
    !isAccessory && { label: 'Storage', value: `${product.storageGb}GB` },
    { label: 'Original parts', value: product.originalPartVerified ? 'Verified' : 'Some replaced' },
    { label: 'Warranty', value: `${product.warrantyMonths} months` },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div role="dialog" aria-modal="true" aria-label={product.model} className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-line">
        <div className="container-page h-[64px] flex items-center justify-between gap-4">
          <button type="button" onClick={onClose} className="inline-flex items-center gap-2 min-h-[44px] text-[15px] hover:underline underline-offset-4 cursor-pointer">
            <ArrowLeft aria-hidden="true" className="w-5 h-5" /> Back to shop
          </button>
          <span className="font-display font-bold text-[15px] truncate hidden sm:block">{product.brand} {product.model}</span>
        </div>
      </div>

      <div className="container-page py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-24 self-start">
          <div className="relative">
            <ProductImage product={product} className="aspect-square rounded-[var(--radius-panel)]" placeholderSize="w-[26%] max-w-[160px]" />
            <span className={`badge absolute left-5 top-5 ${grade.badge}`}>{grade.label}</span>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <p className="eyebrow">Certified pre-owned · {product.brand}</p>
            <h1 className="mt-3 font-display font-black text-[40px] sm:text-[52px] leading-[0.95] tracking-[-0.02em]">{product.model}</h1>
            <p className="mt-3 text-[17px] text-ink-2">{product.tagline}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display font-black text-[34px]">{formatZar(product.priceZar)}</span>
              {product.monthlyFinancingZar > 0 && (
                <span className="text-[15px] text-muted">or {formatZar(product.monthlyFinancingZar)}/month</span>
              )}
            </div>
            <p className="mt-2 text-[14px] text-muted">
              {product.color}{!isAccessory && ` · ${product.storageGb}GB`} · IMEI ending {product.imei.slice(-6)}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={!isAvailable || isAddingToCart}
              className="btn btn-primary sm:flex-1 !min-h-[54px] !text-[17px]"
            >
              {isAddingToCart ? 'Reserving…' : isAvailable ? 'Add to cart' : product.status === 'SOLD' ? 'Sold out' : 'Reserved in a cart'}
            </button>
          </div>
          {isAvailable && (
            <p className="-mt-5 text-[13px] text-muted flex items-center gap-1.5">
              <Lock aria-hidden="true" className="w-3.5 h-3.5" /> We&apos;ll hold this unit for 10 minutes while you check out.
            </p>
          )}

          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[14px]">
            <li className="flex items-center gap-2 rounded-2xl bg-paper px-4 py-3"><Truck aria-hidden="true" className="w-4 h-4 text-volt shrink-0" /> Free overnight delivery</li>
            <li className="flex items-center gap-2 rounded-2xl bg-paper px-4 py-3"><RotateCcw aria-hidden="true" className="w-4 h-4 text-volt shrink-0" /> 7-day returns</li>
            <li className="flex items-center gap-2 rounded-2xl bg-paper px-4 py-3"><BadgeCheck aria-hidden="true" className="w-4 h-4 text-volt shrink-0" /> IMEI checked</li>
          </ul>

          <section className="border-2 border-ink rounded-[var(--radius-card)] p-6">
            <h2 className="font-display font-extrabold text-[20px] flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="w-5 h-5 text-volt" /> Inspection report
            </h2>
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              {diagnostics.map((d) => (
                <div key={d.label}>
                  <dt className="text-[12px] uppercase tracking-[0.1em] text-muted">{d.label}</dt>
                  <dd className="mt-1 font-display font-bold text-[18px]">{d.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 pt-5 border-t border-line text-[15px] text-ink-2">{grade.blurb}</p>
          </section>

          <section>
            <h2 className="font-display font-extrabold text-[20px]">Specs</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3 text-[15px]">
                  <dt className="text-muted capitalize">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {product.inTheBox?.length > 0 && (
            <section>
              <h2 className="font-display font-extrabold text-[20px]">In the box</h2>
              <ul className="mt-3 flex flex-col gap-2 text-[15px]">
                {product.inTheBox.map((item) => (
                  <li key={item} className="flex items-center gap-2"><Check aria-hidden="true" className="w-4 h-4 text-volt" /> {item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
