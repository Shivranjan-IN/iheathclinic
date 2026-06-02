import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export function ResetPassword() {
  const { navigateTo } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Extract token & email from query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setLoading(false);
        return;
      }

      try {
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api';
        const response = await fetch(
          `${apiBase}/auth/validate-reset-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
        );

        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Validation error:', error);
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api';
      const response = await fetch(
        `${apiBase}/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            resetToken: token,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully! Redirecting to login...' });
        // Clear query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          navigateTo('login');
        }, 2500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleGoToLogin = () => {
    // Clear query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    navigateTo('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Validating secure security token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300 transform">
        {/* Header Decoration */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        
        <div className="p-8">
          <button 
            onClick={handleGoToLogin}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-6 group bg-transparent border-0 outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          {tokenValid ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                  <Lock className="w-8 h-8 animate-bounce" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                  Enter your new password to regain access to your medical account.
                </p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-start space-x-3 border ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Minimum 8 characters.</span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                >
                  {updating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Update Password</span>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed mb-8">
                Your password reset link is invalid, has expired, or has already been used. Password reset tokens are valid for 15 minutes.
              </p>
              <button 
                onClick={() => navigateTo('forgot-password')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Request New Reset Link
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 p-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-slate-400 mr-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Secure Healthcare Platform</p>
        </div>
      </div>
    </div>
  );
}
