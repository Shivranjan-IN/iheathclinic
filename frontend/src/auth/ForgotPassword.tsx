import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';

export function ForgotPassword() {
  const { navigateTo } = useNavigation();
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api';
      const response = await fetch(`${apiBase}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('sent');
        setMessage({ type: 'success', text: 'Password reset link sent successfully.' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send reset link.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300 transform">
        {/* Header Decoration */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
        
        <div className="p-8">
          <button 
            onClick={() => step === 'email' ? navigateTo('login') : setStep('email')}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors mb-6 group bg-transparent border-0 outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
              {step === 'email' ? (
                <Mail className="w-8 h-8 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 'email' ? 'Forgot Password?' : 'Check Your Email'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              {step === 'email' 
                ? 'Enter your registered email address below. We will send you a secure link to reset your password.' 
                : `We have sent a secure password reset link to your email address: ${email}. Please check your inbox and click the link to proceed.`}
            </p>
          </div>

          {message && message.type === 'error' && (
            <div className="p-4 rounded-xl mb-6 flex items-start space-x-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50">
              <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendResetLink} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <span>Send Reset Link</span>}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl flex items-start space-x-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/50">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
                <span className="text-sm font-medium">Reset email dispatched. Note that it will expire in 15 minutes.</span>
              </div>
              <button 
                onClick={() => setStep('email')}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                Resend Link
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
