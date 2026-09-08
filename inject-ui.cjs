const fs = require('fs');
let file = 'src/components/StorefrontView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header UI - Add Auth Buttons
const authHeaderUI = `
            {/* Auth Buttons */}
            {authToken ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowOrderHistory(true)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2"
                >
                  <ListOrdered className="w-4 h-4" /> My Orders
                </button>
                <button 
                  onClick={() => { setAuthToken(null); localStorage.removeItem('token'); setUserProfile(null); }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500 text-cyan-300 text-xs font-bold hover:bg-cyan-900 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Sign In
              </button>
            )}
`;

content = content.replace(
  /\{serverStatus === 'CONNECTED' \? \(/,
  authHeaderUI + '\n            {serverStatus === \'CONNECTED\' ? ('
);

// Modals UI
const modalsUI = `
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0d1117] border border-slate-800 rounded-2xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>
                <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Full Name</label>
                    <input type="text" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
                  <input type="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Password</label>
                  <input type="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-[#010409] border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-sm" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors">
                  {authMode === 'login' ? 'Secure Login' : 'Register'}
                </button>
             </form>
             <div className="mt-4 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-xs text-cyan-400 hover:underline">
                  {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Sign In"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0d1117] border border-slate-800 rounded-2xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><ListOrdered className="w-5 h-5 text-cyan-400"/> Order History</h3>
                <button onClick={() => setShowOrderHistory(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
             </div>
             {orderHistory.length === 0 ? (
               <div className="text-center py-12 text-slate-500 font-mono text-sm">No orders found.</div>
             ) : (
               <div className="space-y-4">
                 {orderHistory.map(order => (
                   <div key={order.id} className="p-4 bg-[#010409] border border-slate-800 rounded-xl">
                     <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                       <span className="font-mono text-xs text-slate-400">Order #{order.id.split('-')[0]}</span>
                       <span className="text-sm font-bold text-emerald-400">R {(order.total_amount_cents / 100).toLocaleString()}</span>
                     </div>
                     <div className="space-y-2">
                       {order.items?.map((item: any) => (
                         <div key={item.id} className="flex justify-between text-sm text-slate-300">
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
      )}
`;

content = content.replace(
  /\{isCheckoutOpen && \(/,
  modalsUI + '\n      {isCheckoutOpen && ('
);

fs.writeFileSync(file, content);
