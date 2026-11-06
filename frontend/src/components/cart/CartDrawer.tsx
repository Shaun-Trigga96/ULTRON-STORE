import React from 'react';
import { X, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../../types';
import { formatTime, formatZar } from '../../lib/format';
import { ProductImage } from '../ProductImage';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  lockTimeRemaining: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open, onClose, cart, lockTimeRemaining, subtotal, shippingCost, total, onRemove, onCheckout,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
      >
        <div className="px-6 h-[72px] border-b border-line flex items-center justify-between">
          <h2 className="font-display font-extrabold text-[22px]">Your cart ({cart.length})</h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-paper cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length > 0 && (
          <div className="bg-sun px-6 py-3 flex items-center justify-between text-[14px]">
            <span className="flex items-center gap-2"><Clock aria-hidden="true" className="w-4 h-4" /> Your devices are reserved for</span>
            <span className="font-display font-extrabold tabular-nums">{formatTime(lockTimeRemaining)}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto mb-5">
                <ShoppingBag aria-hidden="true" className="w-7 h-7" />
              </div>
              <p className="font-display font-bold text-[19px]">Your cart is empty</p>
              <p className="text-[15px] text-muted mt-2 max-w-xs mx-auto">Add a certified device and we&apos;ll hold it for you while you check out.</p>
              <button type="button" onClick={onClose} className="btn btn-outline btn-sm mt-6">Continue shopping</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.phone.id} className="flex gap-4 items-center">
                <ProductImage product={item.phone} className="w-20 h-20 rounded-2xl shrink-0" placeholderSize="w-[32%]" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-[16px] truncate">{item.phone.model}</div>
                  <div className="text-[13px] text-muted mt-0.5">{item.phone.storageGb > 0 ? `${item.phone.storageGb}GB · ` : ''}{item.phone.color}</div>
                  <div className="text-[12px] text-muted mt-0.5">IMEI {item.phone.imei}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display font-extrabold text-[16px]">{formatZar(item.phone.priceZar)}</div>
                  <button type="button" onClick={() => onRemove(item.phone.id)} className="text-[13px] underline underline-offset-4 mt-1 cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-line space-y-4">
            <dl className="space-y-2 text-[15px]">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatZar(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{shippingCost === 0 ? 'Free' : formatZar(shippingCost)}</dd></div>
              <div className="flex justify-between pt-3 border-t border-line font-display font-extrabold text-[19px]"><dt>Total</dt><dd>{formatZar(total)}</dd></div>
            </dl>
            <button type="button" onClick={onCheckout} className="btn btn-primary w-full">
              Check out <ArrowRight aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
