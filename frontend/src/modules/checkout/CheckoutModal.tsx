
import React from 'react';
import { UltronLogo } from '../../components/UltronLogo';
import { X, ShieldCheck, CreditCard, Truck, CheckCircle2, Check, ArrowRight } from 'lucide-react';

export const CheckoutModal = ({
  isCheckoutOpen, setIsCheckoutOpen, checkoutStep, setCheckoutStep,
  customerInfo, setCustomerInfo, cardDetails, setCardDetails, handleCheckout, cart, subtotal, total, formatZar
}: any) => {
  if (!isCheckoutOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {checkoutStep === 1 && 'Step 1 of 2: Insured Delivery Address'}
                  {checkoutStep === 2 && 'Step 2 of 2: Payment & Final Review'}
                  {checkoutStep === 3 && 'Order Confirmed!'}
                </h3>
              </div>
              {checkoutStep !== 3 && (
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {checkoutStep === 1 && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Full Recipient Name</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Phone (SMS Delivery Updates)</label>
                    <input
                      type="text"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">City / Province</label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={customerInfo.postalCode}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 2 && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'instant-eft', label: 'Instant EFT (Ozow)' },
                      { id: 'card', label: 'Credit/Debit Card' },
                      { id: 'crypto', label: 'BTC Lightning' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setCustomerInfo({ ...customerInfo, paymentMethod: m.id })}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          customerInfo.paymentMethod === m.id
                            ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 font-bold'
                            : 'bg-slate-50 dark:bg-[#010409] border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {customerInfo.paymentMethod === 'card' && (
                    <div className="mt-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-[#010409] space-y-3">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="0000 0000 0000 0000"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#010409] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">Order Summary</div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Items ({cart.length}):</span>
                    <span>{formatZar(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>Courier Insured Delivery:</span>
                    <span className="text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span>Grand Total:</span>
                    <span className="text-cyan-300">{formatZar(total)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Your IMEI lock is guaranteed active. No race conditions possible.</span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-bold transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize & Complete Order</span>
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="text-center py-6 space-y-4 font-mono">
                <div className="flex justify-center pb-2">
                  <UltronLogo variant="full" size="sm" theme="dark" />
                </div>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payment Authorized!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Order Reference: <span className="text-cyan-300 font-bold">{confirmedOrderId}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#010409] rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left text-slate-700 dark:text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recipient:</span>
                    <span>{customerInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span>{customerInfo.address}, {customerInfo.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courier:</span>
                    <span className="text-emerald-400">The Courier Guy (Express Overnight)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-cyan-400 font-bold">DISPATCHING FROM WAREHOUSE</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutStep(1);
                  }}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Return to Storefront
                </button>
              </div>
            )}
          </div>
        </div>
      
    </>
  );
};
    