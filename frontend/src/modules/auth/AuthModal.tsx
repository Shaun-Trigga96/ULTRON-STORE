
import React from 'react';
import { X } from 'lucide-react';

export const AuthModal = ({
  showAuthModal, setShowAuthModal, authMode, setAuthMode, authForm, setAuthForm, handleAuth
}: any) => {
  if (!showAuthModal) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h3>
                <button onClick={() => setShowAuthModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"><X className="w-5 h-5"/></button>
             </div>
             <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                    <input type="text" required value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-sm" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                  <input type="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">Password</label>
                  <input type="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-50 dark:bg-[#010409] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono text-sm" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-bold transition-colors">
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
      </>
  );
};
    