import React, { useState } from 'react';
import { Card, CardContent } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { User, Mail, Lock, Smartphone, HeartPulse, ArrowRight, ShieldCheck, Activity, Calendar } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { supabase } from '../lib/supabase';

interface PatientRegistrationProps {
  onSuccess: () => void;
  onBack: () => void;
  onLogin: () => void;
}

export function PatientRegistration({ onSuccess, onBack, onLogin }: PatientRegistrationProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input format validation checks
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format (e.g., name@example.com)";
    }
    
    const cleanMobile = formData.mobile.replace(/[\s-+]/g, '');
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile Number is required";
    } else if (!/^[0-9]{10}$/.test(cleanMobile)) {
      newErrors.mobile = "Mobile Number must be exactly 10 digits";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please correct the form errors before submitting");
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: 'patient',
          mobile: formData.mobile
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const { token, user } = await res.json();
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success("Registration successful!");
      
      // Call success callback to immediately log in and redirect
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      <Toaster />
      
      {/* Left side marketing area */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-pink-600 via-purple-600 to-blue-700 text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={onBack}>
            <HeartPulse className="w-8 h-8 text-pink-200" />
            <span className="text-2xl font-bold tracking-tight">I Health Clinic</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">Your Health Journey Starts Here</h1>
          <p className="text-lg lg:text-xl text-pink-100 mb-12 opacity-90">
            Join thousands of patients who manage their health records, book appointments, and consult top doctors on I Health Clinic.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                <ShieldCheck className="w-6 h-6 text-pink-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                <p className="text-pink-100/80 text-sm leading-relaxed">Your medical data is encrypted and securely stored following HIPAA guidelines.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                <Activity className="w-6 h-6 text-pink-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Health Insights</h3>
                <p className="text-pink-100/80 text-sm leading-relaxed">Get personalized health analytics and predictive risk assessments powered by AI.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/20">
                <Calendar className="w-6 h-6 text-pink-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Instant Booking</h3>
                <p className="text-pink-100/80 text-sm leading-relaxed">Book in-clinic visits or video consultations with verified specialists 24/7.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="md:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={onBack}>
            <HeartPulse className="w-8 h-8 text-pink-600" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">I Health Clinic</span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Join our healthcare platform today.</p>
          </div>

          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input id="fullName" value={formData.fullName} onChange={handleChange} className={`pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-pink-500 ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`} placeholder="John Doe" />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} className={`pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-pink-500 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`} placeholder="name@example.com" />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mobile" className="text-slate-700 dark:text-slate-300">Mobile Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input id="mobile" type="tel" value={formData.mobile} onChange={handleChange} className={`pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-pink-500 ${errors.mobile ? 'border-red-500 focus-visible:ring-red-500' : ''}`} placeholder="9876543210" />
                  </div>
                  {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input id="password" type="password" value={formData.password} onChange={handleChange} className={`pl-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-pink-500 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`} placeholder="Create a strong password" />
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long.</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 mt-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg">
                  {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <button onClick={onLogin} className="text-pink-600 dark:text-pink-400 font-semibold hover:underline">
                  Sign in
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
