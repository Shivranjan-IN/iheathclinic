import React, { useState, useEffect } from 'react';
import { User } from '../common/types';
import { HeartPulse, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { authService } from '../services/authService';
import { Toaster, toast } from 'sonner';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (user: User, token?: string) => void;
  onBack: () => void;
  onRegister: (role: 'doctor' | 'clinic' | 'lab' | 'patient') => void;
}

export function LoginPage({ onLogin, onBack, onRegister }: LoginPageProps) {
  const { navigateTo } = useNavigation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);

  useEffect(() => {
    if (shouldNavigate && user) {
      navigateTo('dashboard');
      setShouldNavigate(false);
    }
  }, [user, shouldNavigate, navigateTo]);

  const handleProviderLogin = async (token: string) => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/provider-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (!res.ok) throw new Error('Authentication sync failed');
      const data = await res.json();
      localStorage.setItem('auth_token', data.token);
      onLogin(data.user, data.token);
      setShouldNavigate(true);
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First try Supabase
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data?.session) {
        await handleProviderLogin(data.session.access_token);
        toast.success('Welcome back!');
        return;
      }
      
      // Fallback to traditional backend login
      const user = await authService.signInWithEmail(email, password);
      const token = localStorage.getItem('auth_token');
      onLogin(user, token || undefined);
      toast.success('Welcome back!');
      setShouldNavigate(true);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      toast.error('Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <Toaster />
      
      {/* Left Marketing Section */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={onBack}>
            <HeartPulse className="w-8 h-8 text-blue-200" />
            <span className="text-2xl font-bold tracking-tight">I Health Clinic</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Welcome to I Health Clinic</h1>
          <p className="text-lg lg:text-xl text-blue-100 mb-12 opacity-90">
            Access your unified healthcare dashboard. Seamlessly manage appointments, records, and consultations.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                <ArrowRight className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Experience</h3>
                <p className="text-blue-100/80 text-sm leading-relaxed">Experience faster checkouts and smarter diagnostics tailored for you.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                <Shield className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Enterprise Security</h3>
                <p className="text-blue-100/80 text-sm leading-relaxed">Your account is secured with multi-factor authentication and enterprise-grade encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="md:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={onBack}>
            <HeartPulse className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">I Health Clinic</span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500" placeholder="name@example.com" required />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500" placeholder="Enter your password" required />
              </div>
              <div className="flex justify-end pt-2">
                <button type="button" onClick={() => navigateTo('forgot-password')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
              </div>
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg">{error}</div>}

            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg">
              {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-500 font-medium tracking-wider">Or continue with</span>
            </div>
          </div>

          <Button type="button" onClick={handleGoogleLogin} variant="outline" className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium shadow-sm flex items-center justify-center gap-3 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-10 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">New to I Health Clinic? Create an account</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button onClick={() => onRegister('patient')} className="py-2.5 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-semibold shadow-sm border border-blue-100 dark:border-blue-800/50">
                Patient
              </button>
              <button onClick={() => onRegister('doctor')} className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-sm">
                Doctor
              </button>
              <button onClick={() => onRegister('clinic')} className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-sm">
                Clinic
              </button>
              <button onClick={() => onRegister('lab')} className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold shadow-sm">
                Lab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
