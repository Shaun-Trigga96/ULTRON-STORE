
import React from 'react';
import { X, ListOrdered } from 'lucide-react';

export const OrderHistoryModal = ({
  showOrderHistory, setShowOrderHistory, orderHistory
}: any) => {
  if (!showOrderHistory) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><ListOrdered className="w-5 h-5 text-cyan-400"/> Order History</h3>
                <button onClick={() => setShowOrderHistory(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"><X className="w-5 h-5"/></button>
             </div>
             {orderHistory.length === 0 ? (
               <div className="text-center py-12 text-slate-500 font-mono text-sm">No orders found.</div>
             ) : (
               <div className="space-y-4">
                 {orderHistory.map(order => (
                   <div key={order.id} className="p-4 bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-xl">
                     <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                       <span className="font-mono text-xs text-slate-500 dark:text-slate-400">Order #{order.id.split('-')[0]}</span>
                       <span className="text-sm font-bold text-emerald-400">R {(order.total_amount_cents / 100).toLocaleString()}</span>
                     </div>
                     <div className="space-y-2">
                       {order.items?.map((item: any) => (
                         <div key={item.id} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                           <span>1x Device (IMEI: {item.imei})</span>
                           <span>R {(item.price_cents / 100).toLocaleString()}</span>
                         </div>
                       ))}
                     </div>
                     <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono">
                       Placed on {new Date(order.created_at).toLocaleString()}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      
    </>
  );
};
    