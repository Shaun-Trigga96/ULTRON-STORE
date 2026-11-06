import React from 'react';
import { X, ListOrdered } from 'lucide-react';

interface OrderHistoryModalProps {
  showOrderHistory: boolean;
  setShowOrderHistory: (open: boolean) => void;
  orderHistory: any[];
}

export const OrderHistoryModal = ({
  showOrderHistory, setShowOrderHistory, orderHistory
}: OrderHistoryModalProps) => {
  if (!showOrderHistory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      onClick={() => setShowOrderHistory(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-[28px] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-display font-extrabold text-ink flex items-center gap-2.5">
            <ListOrdered className="w-5 h-5 text-volt" />
            Order history
          </h3>
          <button
            onClick={() => setShowOrderHistory(false)}
            aria-label="Close"
            className="p-1.5 rounded-full text-muted hover:bg-paper transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {orderHistory.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No orders yet — anything you buy will show up here.
          </div>
        ) : (
          <div className="space-y-3">
            {orderHistory.map((order) => (
              <div key={order.id} className="p-5 bg-paper rounded-2xl">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-line">
                  <span className="text-sm text-muted">
                    Order #{order.id.split('-')[0]}
                  </span>
                  <span className="text-base font-semibold text-ink">
                    R {(order.total_amount_cents / 100).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-ink">
                      <span>Device · IMEI {item.imei}</span>
                      <span>R {(item.price_cents / 100).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-line text-xs text-muted">
                  Placed on {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
