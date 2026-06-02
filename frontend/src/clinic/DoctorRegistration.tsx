import React, { useState } from 'react';
import { 
  User, Mail, Phone, Lock, Award, 
  ArrowLeft, CheckCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { toast } from 'sonner';

interface DoctorRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function DoctorRegistration({ onBack, onSuccess }: DoctorRegistrationProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialization: 'General Physician',
    qualification: '',
    experience_years: '',
    medical_council_reg_no: '',
    bio: '',
    gender: 'Male',
    date_of_birth: '',
    languages: 'English, Hindi',
    password: 'Doctor@123'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorService.registerDoctor(formData);
      toast.success('Doctor registered successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Doctor Management
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <ShieldCheck className="w-8 h-8" />
                Register New Doctor
              </h1>
              <p className="text-blue-100 mt-2 font-medium">Fill in the details to add a new medical professional to your clinic.</p>
            </div>
            {/* Abstract shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Alexander Pierce"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  placeholder="name@clinic.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white appearance-none"
                >
                  <option>General Physician</option>
                  <option>Cardiologist</option>
                  <option>Dermatologist</option>
                  <option>Pediatrician</option>
                  <option>Neurologist</option>
                  <option>Orthopedic</option>
                  <option>Gynecologist</option>
                  <option>Psychiatrist</option>
                </select>
              </div>

              {/* Qualification */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Qualification *
                </label>
                <input
                  required
                  type="text"
                  placeholder="MBBS, MD (Med)"
                  value={formData.qualification}
                  onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-500" />
                  Experience (Years)
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={formData.experience_years}
                  onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Council Reg No */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  MCI / Reg Number *
                </label>
                <input
                  required
                  type="text"
                  placeholder="MCI-123456"
                  value={formData.medical_council_reg_no}
                  onChange={e => setFormData({ ...formData, medical_council_reg_no: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <User className="w-4 h-4 text-pink-500" />
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white appearance-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Award className="w-4 h-4 text-blue-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Languages */}
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-400" />
                  Languages Known
                </label>
                <input
                  type="text"
                  placeholder="English, Spanish, French"
                  value={formData.languages}
                  onChange={e => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description about the doctor's expertise and background..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white resize-none"
                />
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-500" />
                  Initial Password *
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-900 transition-all focus:bg-white"
                  />
                  <p className="text-[10px] font-bold text-gray-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Doctor should change this password upon first login for security.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    REGISTER DOCTOR
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
