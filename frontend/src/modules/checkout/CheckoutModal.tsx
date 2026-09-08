import React, { useState } from 'react';
import { X, ShieldCheck, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  checkoutStep: 1 | 2 | 3;
  setCheckoutStep: (step: 1 | 2 | 3) => void;
  customerInfo: any;
  setCustomerInfo: (info: any) => void;
  cardDetails: { number: string; expiry: string; cvv: string };
  setCardDetails: (details: { number: string; expiry: string; cvv: string }) => void;
  handleCheckout: () => void | Promise<void>;
  cart: any[];
  cartTotal: number;
}

const formatZar = (amount: number) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0
  }).format(amount);

export const CheckoutModal = ({
  isCheckoutOpen, setIsCheckoutOpen, checkoutStep, setCheckoutStep,
  customerInfo, setCustomerInfo, cardDetails, setCardDetails, handleCheckout, cart, cartTotal
}: CheckoutModalProps) => {
  const [orderRef, setOrderRef] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.phone.priceZar, 0);
  const shipping = 0; // free courier delivery on every order

  const goToPayment = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.address) {
      alert('Please fill in your name, email, and delivery address.');
      return;
    }
    setCheckoutStep(2);
  };

  const placeOrder = async () => {
    if (customerInfo.paymentMethod === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      alert('Please fill in your card details.');
      return;
    }
    setOrderRef(`ULT-${Math.floor(100000 + Math.random() * 900000)}`);
    await handleCheckout();
  };

  const close = () => {
    setIsCheckoutOpen(false);
    setCheckoutStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white dark:bg-[#1d1d1f] rounded-2xl max-w-[560px] w-full shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#0071e3]" />
            <h3 className="text-lg font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              {checkoutStep === 1 && 'Delivery details'}
              {checkoutStep === 2 && 'Payment'}
              {checkoutStep === 3 && 'Order confirmed'}
            </h3>
          </div>
          {checkoutStep !== 3 && (
            <button
              onClick={close}
              aria-label="Close"
              className="p-1.5 rounded-full text-[#86868b] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {checkoutStep !== 3 && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
            <span className={checkoutStep === 1 ? 'text-[#0071e3]' : ''}>1. Delivery</span>
            <span className="w-6 h-px bg-black/10 dark:bg-white/15" />
            <span className={checkoutStep === 2 ? 'text-[#0071e3]' : ''}>2. Payment</span>
          </div>
        )}

        {checkoutStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Full name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Phone</label>
                <input
                  type="text"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Street address</label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">City / Province</label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Postal code</label>
                <input
                  type="text"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={goToPayment}
                className="px-6 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[15px] transition-colors flex items-center gap-2 active:scale-[0.98]"
              >
                <span>Continue to payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Payment method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'instant-eft', label: 'Instant EFT' },
                  { id: 'card', label: 'Card' },
                  { id: 'crypto', label: 'Crypto' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: m.id })}
                    className={`py-3 rounded-xl border text-center text-sm font-medium transition-all ${
                      customerInfo.paymentMethod === m.id
                        ? 'bg-[#0071e3]/5 border-[#0071e3] text-[#0071e3]'
                        : 'bg-[#f5f5f7] dark:bg-[#2c2c2e] border-transparent text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#1d1d1f] dark:hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {customerInfo.paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl space-y-3">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Card number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-[#1d1d1f] rounded-lg text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-[#1d1d1f] rounded-lg text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-[#1d1d1f] rounded-lg text-[15px] text-[#1d1d1f] dark:text-white outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl space-y-2">
              <div className="flex justify-between text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                <span>Items ({cart.length})</span>
                <span>{formatZar(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                <span>Delivery</span>
                <span className="text-[#1d7a3c]">Free</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#1d1d1f] dark:text-white pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <span>Total</span>
                <span>{formatZar(cartTotal || subtotal + shipping)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0071e3]" />
              <span>Your stock hold stays locked until payment is authorized.</span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setCheckoutStep(1)}
                className="px-4 py-2.5 rounded-xl text-[#1d1d1f] dark:text-white text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                onClick={placeOrder}
                className="px-6 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[15px] transition-colors flex items-center gap-2 active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Place order</span>
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">Order placed</h4>
              <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mt-1">
                Reference <span className="text-[#1d1d1f] dark:text-white font-medium">{orderRef}</span>
              </p>
            </div>

            <div className="p-4 bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-xl text-sm text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6e6e73] dark:text-[#a1a1a6]">Recipient</span>
                <span className="text-[#1d1d1f] dark:text-white">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73] dark:text-[#a1a1a6]">Destination</span>
                <span className="text-[#1d1d1f] dark:text-white">{customerInfo.address}, {customerInfo.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6e6e73] dark:text-[#a1a1a6]">Status</span>
                <span className="text-[#0071e3] font-medium">Preparing for dispatch</span>
              </div>
            </div>

            <button
              onClick={close}
              className="px-6 py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-sm transition-colors"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
