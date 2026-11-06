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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
      <div className="bg-white rounded-[28px] max-w-[560px] w-full shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-volt" />
            <h3 className="text-lg font-display font-extrabold text-ink">
              {checkoutStep === 1 && 'Delivery details'}
              {checkoutStep === 2 && 'Payment'}
              {checkoutStep === 3 && 'Order confirmed'}
            </h3>
          </div>
          {checkoutStep !== 3 && (
            <button
              onClick={close}
              aria-label="Close"
              className="p-1.5 rounded-full text-muted hover:bg-paper transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {checkoutStep !== 3 && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <span className={checkoutStep === 1 ? 'text-volt' : ''}>1. Delivery</span>
            <span className="w-6 h-px bg-line" />
            <span className={checkoutStep === 2 ? 'text-volt' : ''}>2. Payment</span>
          </div>
        )}

        {checkoutStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  type="text"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="field"
                />
              </div>
            </div>
            <div>
              <label className="field-label">Street address</label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">City / Province</label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Postal code</label>
                <input
                  type="text"
                  value={customerInfo.postalCode}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                  className="field"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={goToPayment}
                className="btn btn-primary"
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
              <label className="field-label">Payment method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'instant-eft', label: 'Instant EFT' },
                  { id: 'card', label: 'Card' },
                  { id: 'crypto', label: 'Crypto' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: m.id })}
                    className={`py-3 rounded-full border-[1.5px] text-center text-sm font-medium transition-all ${
                      customerInfo.paymentMethod === m.id
                        ? 'bg-ink border-ink text-white'
                        : 'bg-paper border-line text-ink hover:border-ink'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {customerInfo.paymentMethod === 'card' && (
                <div className="mt-4 p-4 bg-paper rounded-2xl space-y-3">
                  <div>
                    <label className="field-label">Card number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="0000 0000 0000 0000"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      className="field"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label className="field-label">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-paper rounded-2xl space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Items ({cart.length})</span>
                <span>{formatZar(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Delivery</span>
                <span className="text-mint">Free</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-ink pt-2 border-t border-line">
                <span>Total</span>
                <span>{formatZar(cartTotal || subtotal + shipping)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-muted">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-volt" />
              <span>Your stock hold stays locked until payment is authorized.</span>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setCheckoutStep(1)}
                className="btn btn-outline btn-sm"
              >
                Back
              </button>
              <button
                onClick={placeOrder}
                className="btn btn-primary"
              >
                <Check className="w-4 h-4" />
                <span>Place order</span>
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 3 && (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 rounded-full bg-sun text-ink flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-xl font-display font-extrabold text-ink">Order placed</h4>
              <p className="text-sm text-muted mt-1">
                Reference <span className="text-ink font-medium">{orderRef}</span>
              </p>
            </div>

            <div className="p-4 bg-paper rounded-2xl text-sm text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Recipient</span>
                <span className="text-ink">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Destination</span>
                <span className="text-ink">{customerInfo.address}, {customerInfo.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className="text-volt font-medium">Preparing for dispatch</span>
              </div>
            </div>

            <button
              onClick={close}
              className="btn btn-primary"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
