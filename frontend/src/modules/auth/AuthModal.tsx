import React from 'react';
import { X } from 'lucide-react';

interface AuthForm {
  email: string;
  password: string;
  name: string;
}

interface AuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authForm: AuthForm;
  setAuthForm: (form: AuthForm) => void;
  handleAuth: (e: React.FormEvent) => void;
}

export const AuthModal = ({
  showAuthModal, setShowAuthModal, authMode, setAuthMode, authForm, setAuthForm, handleAuth
}: AuthModalProps) => {
  if (!showAuthModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] bg-white dark:bg-[#1d1d1f] rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-[#1d1d1f] dark:text-white tracking-tight">
              {authMode === 'login' ? 'Sign in' : 'Create your account'}
            </h3>
            <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] mt-1">
              {authMode === 'login' ? 'Welcome back to ULTRON.' : 'Takes less than a minute.'}
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            aria-label="Close"
            className="p-1.5 -mr-1.5 -mt-1.5 rounded-full text-[#86868b] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Full name
              </label>
              <input
                type="text"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] dark:text-white outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] dark:text-white outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="w-full bg-[#f5f5f7] dark:bg-[#2c2c2e] border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] dark:text-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-[15px] transition-colors active:scale-[0.98]"
          >
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-[13px] text-[#0071e3] hover:underline"
          >
            {authMode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
