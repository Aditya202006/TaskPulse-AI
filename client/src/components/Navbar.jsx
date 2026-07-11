import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Activity, LogOut, LayoutDashboard, User, Menu, X } from 'lucide-react';

import { UserButton, useAuth as useClerkAuth } from '@clerk/clerk-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isSignedIn: isClerkSignedIn } = useClerkAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                TaskPulse<span className="text-blue-600 font-semibold">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {!isDashboard && (
              <>
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How It Works</a>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {!isDashboard ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:-translate-y-0.5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    {isClerkSignedIn ? (
                      <UserButton afterSignOutUrl="/" />
                    ) : (
                      <div className="flex items-center gap-2">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <span className="hidden lg:block text-sm font-medium text-slate-700">
                          {user.name}
                        </span>
                      </div>
                    )}
                    
                    {!isClerkSignedIn && (
                      <button
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 transition-colors"
                        title="Log Out"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4.5 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:-translate-y-0.5"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-2">
          {!isDashboard && (
            <>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                How It Works
              </a>
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-slate-200 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-base font-semibold text-white justify-center shadow-sm hover:bg-blue-700"
              >
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-base font-semibold text-slate-600 justify-center hover:bg-slate-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-base font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
