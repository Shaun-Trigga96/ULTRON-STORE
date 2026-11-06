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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50"
      onClick={() => setShowAuthModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] bg-white rounded-[28px] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-display font-extrabold text-ink">
              {authMode === 'login' ? 'Sign in' : 'Create your account'}
            </h3>
            <p className="text-sm text-muted mt-1">
              {authMode === 'login' ? 'Welcome back to ULTRON.' : 'Takes less than a minute.'}
            </p>
          </div>
          <button
            onClick={() => setShowAuthModal(false)}
            aria-label="Close"
            className="p-1.5 -mr-1.5 -mt-1.5 rounded-full text-muted hover:bg-paper transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="field-label">
                Full name
              </label>
              <input
                type="text"
                required
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                className="field"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="field-label">
              Email address
            </label>
            <input
              type="email"
              required
              value={authForm.email}
              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              className="field"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="field-label">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              className="field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
          >
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-line text-center">
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-[13px] text-volt hover:underline"
          >
            {authMode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
