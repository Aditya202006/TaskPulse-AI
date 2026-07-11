import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SignIn } from '@clerk/clerk-react';
import { Activity, ShieldAlert, Sparkles, UserCheck, ArrowLeft } from 'lucide-react';

export const AuthPage = () => {
  const { loginMock, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setOrderLoading] = useState(false);

  // Redirect to dashboard if session exists
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleMockLogin = async () => {
    setError(null);
    setOrderLoading(true);
    try {
      await loginMock();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Mock login failed. Please ensure the backend server is running.');
    } finally {
      setOrderLoading(false);
    }
  };

  // Check if Clerk Publishable Key exists in Vite environment variables
  const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 justify-center items-center px-4 py-12 dot-grid">
      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {isClerkConfigured ? (
        <div className="flex flex-col items-center space-y-6 max-w-md w-full">
          {/* Clerk native Login Box */}
          <SignIn
            routing="path"
            path="/auth"
            fallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
          />

          {/* Dev Bypass Link underneath Clerk Box */}
          <div className="text-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm w-full">
            <p className="text-xs text-slate-500 mb-2.5">
              Testing locally? You can bypass Clerk login using the button below.
            </p>
            <button
              onClick={handleMockLogin}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-slate-800 focus:outline-none transition-all disabled:opacity-50"
            >
              <UserCheck className="h-3.5 w-3.5" />
              {loading ? 'Authenticating...' : 'Sign In as Demo User (Bypass)'}
            </button>
          </div>
        </div>
      ) : (
        /* Setup Fallback Box if Clerk Key is missing */
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />

          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Welcome to TaskPulse AI</h2>
            <p className="text-sm text-slate-500 mt-2">
              Organize scattered deadlines in seconds using OCR & Gemini AI.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-rose-700 text-sm">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-xs text-amber-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="h-4 w-4 text-amber-600" />
                Clerk Authentication Pending Setup
              </div>
              <p className="leading-relaxed">
                Vite client has not detected a <code className="font-mono bg-amber-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> in your environment. Add it to your client `.env` to enable full production Clerk authentication.
              </p>
            </div>

            {/* Mock Mode Trigger */}
            <button
              onClick={handleMockLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-slate-800 focus:outline-none transition-all duration-200 disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              {loading ? 'Authenticating...' : 'Sign In as Demo User (Mock Bypass)'}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
            Files are processed entirely in-memory and are never stored on persistent storage.
          </p>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
