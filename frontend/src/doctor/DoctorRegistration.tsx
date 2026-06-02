import React, { useState } from 'react';
import {
  User,
  Briefcase,
  FileText,
  Building2,
  DollarSign,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Globe,
  Calendar,
  MapPin,
  CreditCard,
  Award,
  AlertCircle,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Textarea } from '../common/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Checkbox } from '../common/ui/checkbox';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../common/types';

interface DoctorRegistrationProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: 'Personal', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Practice', icon: Building2 },
  { id: 5, title: 'Financial', icon: DollarSign }
];

const specializations = [
  'General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology',
  'Orthopedics', 'ENT', 'Gynecology', 'Ophthalmology',
  'Dentistry', 'Physiotherapy', 'Psychiatry', 'Neurology'
];

const languages = [
  'Hindi', 'English', 'Marathi', 'Bengali',
  'Tamil', 'Telugu', 'Gujarati', 'Punjabi'
];

const conditionsTreated = [
  'Diabetes', 'Hypertension', 'Asthma', 'Arthritis',
  'Heart Disease', 'Skin Problems', 'Hair Loss', 'Fever & Infection',
  'Pregnancy Care', 'Child Health', 'Mental Health', 'Pain Management'
];

const servicesOffered = [
  'Teleconsultation', 'Lab Referral', 'Prescription Renewal', 'Health Checkup',
  'Vaccination', 'Home Visit', 'Emergency Care'
];

const consultationModes = ['Walk-in', 'Video Call', 'Chat', 'Home Visit'];

export function DoctorRegistration({ onBack, onSuccess }: DoctorRegistrationProps) {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dob: '',
    mobile: '',
    email: '',
    mciReg: '',
    council: '',
    regYear: '',
    degrees: '',
    university: '',
    gradYear: '',
    experience: '',
    clinicName: '',
    clinicAddress: '',
    inClinicFee: '',
    onlineFee: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    pan: '',
    gstin: '',
    bio: '',
    password: '',
    termsAccepted: false,
    registeredPractitioner: false,
    verificationConsent: false
  });

  const [files, setFiles] = useState<Record<string, File>>({});
  const [customService, setCustomService] = useState('');
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [showCustomSpecializationInput, setShowCustomSpecializationInput] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [showCustomConditionInput, setShowCustomConditionInput] = useState(false);

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
      toast.success(`${key} selected: ${e.target.files![0].name}`);
    }
  };

  const handleAddCustomService = () => {
    if (customService.trim()) {
      setSelectedServices(prev => [...prev, customService.trim()]);
      setCustomService('');
      setShowCustomServiceInput(false);
      toast.success("Custom service added!");
    }
  };

  const handleAddCustomSpecialization = () => {
    if (customSpecialization.trim()) {
      setSelectedSpecializations(prev => [...prev, customSpecialization.trim()]);
      setCustomSpecialization('');
      setShowCustomSpecializationInput(false);
      toast.success("Custom specialization added!");
    }
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim()) {
      setSelectedLanguages(prev => [...prev, customLanguage.trim()]);
      setCustomLanguage('');
      setShowCustomLanguageInput(false);
      toast.success("Custom language added!");
    }
  };

  const handleAddCustomCondition = () => {
    if (customCondition.trim()) {
      setSelectedConditions(prev => [...prev, customCondition.trim()]);
      setCustomCondition('');
      setShowCustomConditionInput(false);
      toast.success("Custom condition added!");
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = "Full Name is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dob) newErrors.dob = "Date of Birth is required";
      else {
        const dob = new Date(formData.dob);
        const today = new Date();
        const age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

        if (dob > today) newErrors.dob = "Date of Birth cannot be in the future";
        else if (actualAge < 18) newErrors.dob = "You must be at least 18 years old to register as a doctor";
        else if (actualAge > 100) newErrors.dob = "Please enter a valid date of birth";
      }
      if (!formData.mobile) newErrors.mobile = "Mobile Number is required";
      else if (formData.mobile.length !== 10) newErrors.mobile = "Mobile Number must be 10 digits";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.password) newErrors.password = "Password is required";
    }

    if (step === 2) {
      if (!formData.mciReg) newErrors.mciReg = "MCI Registration Number is required";
      if (!formData.council) newErrors.council = "Medical Council Name is required";
      if (!formData.regYear) newErrors.regYear = "Registration Year is required";
      if (!formData.degrees) newErrors.degrees = "Degrees are required";
      if (!formData.university) newErrors.university = "University Name is required";
      if (!formData.gradYear) newErrors.gradYear = "Graduation Year is required";
      if (!formData.experience) newErrors.experience = "Experience is required";
      if (selectedSpecializations.length === 0) newErrors.specializations = "Select at least one specialization";
      if (selectedLanguages.length === 0) newErrors.languages = "Select at least one language";
    }

    if (step === 5) {
      if (!formData.accountName) newErrors.accountName = "Account Holder Name is required";
      if (!formData.accountNumber) newErrors.accountNumber = "Account Number is required";
      if (!formData.ifsc) newErrors.ifsc = "IFSC Code is required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) newErrors.ifsc = "Invalid IFSC format (e.g., SBIN0001234)";

      if (!formData.pan) newErrors.pan = "PAN Number is required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";

      if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format";
      }

      if (formData.bio.length > 200) newErrors.bio = "Bio cannot exceed 200 characters";

      if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms and conditions";
      if (!formData.registeredPractitioner) newErrors.registeredPractitioner = "Compliance confirmation is required";
      if (!formData.verificationConsent) newErrors.verificationConsent = "Verification consent is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Please fill in all required fields correctly.");
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const registrationData: any = {
        name: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        dob: formData.dob,
        mciReg: formData.mciReg,
        councilName: formData.council,
        regYear: parseInt(formData.regYear),
        degrees: formData.degrees,
        university: formData.university,
        gradYear: parseInt(formData.gradYear),
        experience: parseInt(formData.experience),
        specializations: selectedSpecializations,
        languages: selectedLanguages,
        clinicName: formData.clinicName,
        clinicAddress: formData.clinicAddress,
        inClinicFee: parseFloat(formData.inClinicFee),
        onlineFee: parseFloat(formData.onlineFee),
        consultationModes: selectedModes,
        conditionsTreated: selectedConditions,
        servicesOffered: selectedServices,
        workingDays: workingDays,
        bankDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          pan: formData.pan.toUpperCase(),
          gstin: formData.gstin.toUpperCase()
        },
        bio: formData.bio
      };

      const response = await authService.signUpDoctor(registrationData, formData.password, files);

      toast.success("Registration successful!");
      
      // Auto-login
      if (response.token && response.user) {
        const userData = {
          id: String(response.user.user_id),
          full_name: response.user.full_name,
          name: response.user.full_name,
          email: response.user.email,
          role: response.user.role as UserRole,
          doctor_id: response.doctor?.id
        };
        login(userData, response.token);
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

    const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Dr. Full Name *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <User className="w-5 h-5" />
          </div>
          <Input
            id="fullName"
            placeholder="Dr. First Middle Last"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm transition-all focus:bg-white dark:focus:bg-slate-950 ${errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={formData.fullName}
            onChange={handleInputChange}
          />
        </div>
        {errors.fullName && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="gender" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Gender *</Label>
          <Select onValueChange={(v) => handleSelectChange('gender', v)}>
            <SelectTrigger id="gender" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.gender ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Gender" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905">
              <SelectItem value="male" className="font-bold">Male</SelectItem>
              <SelectItem value="female" className="font-bold">Female</SelectItem>
              <SelectItem value="other" className="font-bold">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.gender}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Date of Birth *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
              <Calendar className="w-5 h-5" />
            </div>
            <Input
              id="dob"
              type="date"
              className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.dob ? 'border-red-500' : ''}`}
              value={formData.dob}
              onChange={handleInputChange}
            />
          </div>
          {errors.dob && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.dob}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Login Password *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Lock className="w-5 h-5" />
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Create a secure login password"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.password ? 'border-red-500' : ''}`}
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        {errors.password && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.password}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Mobile Number *</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <Phone className="w-4 h-4" />
              </div>
              <Input
                id="mobile"
                placeholder="10-digit mobile"
                maxLength={10}
                className={`pl-10 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.mobile ? 'border-red-500' : ''}`}
                value={formData.mobile}
                onChange={handleInputChange}
              />
            </div>
            {!mobileVerified ? (
              <Button type="button" onClick={() => { if (formData.mobile.length === 10) setMobileVerified(true); else toast.error("Invalid mobile"); }} className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-2xl px-6 font-black uppercase text-xs tracking-wider border-4 border-blue-500/20 active:scale-95 shadow-lg shadow-blue-500/10">
                Verify
              </Button>
            ) : (
              <Button type="button" disabled className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-2xl px-6 border-4 border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="size-5" />
              </Button>
            )}
          </div>
          {errors.mobile && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.mobile}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Email Address *</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                id="email"
                placeholder="doctor@example.com"
                className={`pl-10 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {!emailVerified ? (
              <Button type="button" onClick={() => { if (/\S+@\S+\.\S+/.test(formData.email)) setEmailVerified(true); else toast.error("Invalid email"); }} className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-2xl px-6 font-black uppercase text-xs tracking-wider border-4 border-blue-500/20 active:scale-95 shadow-lg shadow-blue-500/10">
                Verify
              </Button>
            ) : (
              <Button type="button" disabled className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-2xl px-6 border-4 border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                <CheckCircle className="size-5" />
              </Button>
            )}
          </div>
          {errors.email && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.email}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="mciReg" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">MCI / State Medical Council Registration No. *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <FileText className="w-5 h-5 text-indigo-500" />
          </div>
          <Input
            id="mciReg"
            placeholder="e.g., MH/12345/2015"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.mciReg ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={formData.mciReg}
            onChange={handleInputChange}
          />
        </div>
        <p className="text-[10px] font-bold text-slate-450 uppercase tracking-widest pl-1">This ID is crucial for authentication verification audits</p>
        {errors.mciReg && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.mciReg}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="council" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Medical Council Name *</Label>
          <Input
            id="council"
            placeholder="e.g., Maharashtra Medical Council"
            className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.council ? 'border-red-500' : ''}`}
            value={formData.council}
            onChange={handleInputChange}
          />
          {errors.council && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.council}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="regYear" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Registration Year *</Label>
          <Select onValueChange={(v) => handleSelectChange('regYear', v)}>
            <SelectTrigger id="regYear" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.regYear ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905 max-h-60">
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()} className="font-bold">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regYear && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.regYear}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="degrees" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Degrees *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <Input
            id="degrees"
            placeholder="MBBS, MD, BDS, etc. (comma-separated)"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.degrees ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={formData.degrees}
            onChange={handleInputChange}
          />
        </div>
        {errors.degrees && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.degrees}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="university" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">University *</Label>
          <Input
            id="university"
            placeholder="University name"
            className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.university ? 'border-red-500' : ''}`}
            value={formData.university}
            onChange={handleInputChange}
          />
          {errors.university && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.university}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gradYear" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Graduation Year *</Label>
          <Select onValueChange={(v) => handleSelectChange('gradYear', v)}>
            <SelectTrigger id="gradYear" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.gradYear ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905 max-h-60">
              {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()} className="font-bold">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gradYear && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.gradYear}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Years of Experience *</Label>
        <Select onValueChange={(v) => handleSelectChange('experience', v)}>
          <SelectTrigger id="experience" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.experience ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Select Experience Level" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905 max-h-60">
            {Array.from({ length: 51 }, (_, i) => i).map(exp => (
              <SelectItem key={exp} value={exp.toString()} className="font-bold">{exp} {exp === 1 ? 'Year' : 'Years'}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.experience && <p className="text-xs text-red-555 font-bold mt-1 pl-1">{errors.experience}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Specializations *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {specializations.map((spec) => (
            <div
              key={spec}
              onClick={() => toggleSelection(spec, selectedSpecializations, setSelectedSpecializations)}
              className={`p-3.5 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs select-none ${selectedSpecializations.includes(spec)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider scale-95">{spec}</p>
            </div>
          ))}
          {selectedSpecializations.filter(s => !specializations.includes(s)).map((spec) => (
            <div
              key={spec}
              onClick={() => toggleSelection(spec, selectedSpecializations, setSelectedSpecializations)}
              className="p-3.5 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02] select-none"
            >
              <p className="text-[10px] font-black uppercase tracking-wider scale-95">{spec}</p>
            </div>
          ))}

          {!showCustomSpecializationInput ? (
            <div
              onClick={() => setShowCustomSpecializationInput(true)}
              className="p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-blue-500 dark:hover:border-blue-800 hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center"
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-550 dark:text-slate-400">+ Other</p>
            </div>
          ) : (
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customSpecialization}
                onChange={(e) => setCustomSpecialization(e.target.value)}
                placeholder="Type specialization..."
                className="h-8 text-sm rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomSpecialization} className="h-8 w-8 p-0 bg-blue-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
        {errors.specializations && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.specializations}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Languages Spoken *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {languages.map((lang) => (
            <div
              key={lang}
              onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
              className={`p-3.5 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs select-none border ${selectedLanguages.includes(lang)
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider scale-95">{lang}</p>
            </div>
          ))}
          {selectedLanguages.filter(l => !languages.includes(l)).map((lang) => (
            <div
              key={lang}
              onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
              className="p-3.5 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02] border-transparent select-none"
            >
              <p className="text-[10px] font-black uppercase tracking-wider scale-95">{lang}</p>
            </div>
          ))}

          {!showCustomLanguageInput ? (
            <div
              onClick={() => setShowCustomLanguageInput(true)}
              className="p-3.5 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center"
            >
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-550 dark:text-slate-400">+ Other</p>
            </div>
          ) : (
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Type language..."
                className="h-8 text-sm rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomLanguage} className="h-8 w-8 p-0 bg-indigo-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
        {errors.languages && <p className="text-xs text-red-550 font-bold mt-1 pl-1">{errors.languages}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] flex gap-4 items-center text-left">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 grow-0 shrink-0"><FileText className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Verification Credentials REQUIRED</h4>
          <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase tracking-wide mt-1">Please upload clear scanned copies or PDF files. All documents are mandatory for verification audit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'mciReg', label: 'Medical Council Registration Document *', desc: 'MCI Certificate copy' },
          { key: 'degree', label: 'Degree Certificate *', desc: 'MBBS / MD Graduation proof' },
          { key: 'idProof', label: 'Government ID *', desc: 'Aadhaar, Passport or PAN Card' },
          { key: 'clinicLetter', label: 'Clinic Authorization Letter', desc: 'Clinic attachment proof (Optional)' },
          { key: 'signature', label: 'Prescription Digital Signature *', desc: 'Transparent background preferred' }
        ].map((doc) => (
          <div key={doc.key} className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{doc.label}</Label>
            <div className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative overflow-hidden group ${files[doc.key] ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-800 bg-white/40 dark:bg-slate-950/20'}`}>
              <input
                type="file"
                id={`file-${doc.key}`}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={(e) => handleFileChange(doc.key, e)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {files[doc.key] ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="size-10 text-emerald-500 mb-2 animate-bounce" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-xs">{files[doc.key].name}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-555 uppercase tracking-widest mt-1">{(files[doc.key].size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Upload className="size-5" /></div>
                  <p className="text-xs text-slate-655 dark:text-slate-350 font-bold">{doc.desc}</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <Label htmlFor="clinicName" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Primary Consulting Clinic Name</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Building2 className="w-5 h-5" />
          </div>
          <Input
            id="clinicName"
            placeholder="Clinic or Hospital name"
            className="pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100"
            value={formData.clinicName}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clinicAddress" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Clinic Address</Label>
        <div className="relative">
          <div className="absolute top-4 left-4 pointer-events-none text-slate-400 dark:text-slate-600">
            <MapPin className="w-5 h-5" />
          </div>
          <Textarea
            id="clinicAddress"
            placeholder="Complete address details"
            rows={3}
            className="pl-12 pt-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100"
            value={formData.clinicAddress}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Practice Weekly Calendar</Label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              onClick={() => toggleSelection(day, workingDays, setWorkingDays)}
              className={`p-3 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none ${workingDays.includes(day)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-355 dark:hover:border-slate-700'
                }`}
            >
              <p className="text-[10px] font-black uppercase tracking-wider scale-95">{day}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="inClinicFee" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">In-Clinic Consultation Fee (₹)</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <Input
              id="inClinicFee"
              placeholder="e.g., 500"
              type="number"
              className="pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100"
              value={formData.inClinicFee}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="onlineFee" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Online Consultation Fee (₹)</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <Input
              id="onlineFee"
              placeholder="e.g., 300"
              type="number"
              className="pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100"
              value={formData.onlineFee}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Consultation Modes Accepted *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {consultationModes.map((mode) => (
            <div
              key={mode}
              onClick={() => toggleSelection(mode, selectedModes, setSelectedModes)}
              className={`p-3.5 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none border ${selectedModes.includes(mode)
                ? 'bg-gradient-to-r from-purple-600 to-indigo-650 text-white border-transparent shadow-md shadow-purple-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">{mode}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Target Medical Conditions You Treat *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {conditionsTreated.map((condition) => (
            <div
              key={condition}
              onClick={() => toggleSelection(condition, selectedConditions, setSelectedConditions)}
              className={`p-3 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border select-none ${selectedConditions.includes(condition)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{condition}</p>
              {selectedConditions.includes(condition) && <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />}
            </div>
          ))}
          {selectedConditions.filter(c => !conditionsTreated.includes(c)).map((condition) => (
            <div
              key={condition}
              onClick={() => toggleSelection(condition, selectedConditions, setSelectedConditions)}
              className="p-3 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02] select-none"
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{condition}</p>
              <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />
            </div>
          ))}

          {!showCustomConditionInput ? (
            <div
              onClick={() => setShowCustomConditionInput(true)}
              className="p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer text-slate-555 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-800 hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" />
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">+ Add Custom</p>
            </div>
          ) : (
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customCondition}
                onChange={(e) => setCustomCondition(e.target.value)}
                placeholder="Type condition..."
                className="h-8 text-sm rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomCondition} className="h-8 w-8 p-0 bg-blue-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Practice Services Offered *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {servicesOffered.map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className={`p-3 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border select-none ${selectedServices.includes(service)
                ? 'bg-gradient-to-r from-indigo-600 to-purple-650 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{service}</p>
              {selectedServices.includes(service) && <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />}
            </div>
          ))}
          {selectedServices.filter(s => !servicesOffered.includes(s)).map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className="p-3 border rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border bg-gradient-to-r from-indigo-600 to-purple-650 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02] select-none"
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{service}</p>
              <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />
            </div>
          ))}

          {!showCustomServiceInput ? (
            <div
              onClick={() => setShowCustomServiceInput(true)}
              className="p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer text-slate-555 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" />
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">+ Add Custom</p>
            </div>
          ) : (
            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Type service..."
                className="h-8 text-sm rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomService} className="h-8 w-8 p-0 bg-indigo-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] flex gap-4 items-center text-left">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 grow-0 shrink-0"><DollarSign className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Financial settlement setup</h4>
          <p className="text-[10px] text-slate-555 dark:text-slate-400 uppercase tracking-wide mt-1">Bank credentials are required to dispatch telemedicine payouts directly to your savings/current ledger.</p>
        </div>
      </div>

      <div className="space-y-6 bg-slate-50/50 dark:bg-slate-950/10 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-850">
        <div className="space-y-2">
          <Label htmlFor="accountName" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Account Holder Name *</Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="accountName"
              placeholder="As per bank passbook"
              className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
              value={formData.accountName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Account Number *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <Input
                id="accountNumber"
                placeholder="Account number"
                className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
                value={formData.accountNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">IFSC Code *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <Building2 className="w-4 h-4" />
              </div>
              <Input
                id="ifsc"
                placeholder="e.g. SBIN0001234"
                className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold"
                value={formData.ifsc}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pan" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">PAN Number *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
              <Input
                id="pan"
                placeholder="e.g. ABCDE1234F"
                className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold uppercase"
                value={formData.pan}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">GSTIN (if applicable)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                <FileText className="w-4 h-4" />
              </div>
              <Input
                id="gstin"
                placeholder="15-digit GSTIN"
                maxLength={15}
                className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-bold uppercase"
                value={formData.gstin}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Self-Introduction (Bio) *</Label>
        <Textarea
          id="bio"
          placeholder="Introduce yourself to your patients. Explain your medical background, treatment philosophies..."
          rows={4}
          maxLength={200}
          className={`rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm p-4 resize-none ${errors.bio ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          value={formData.bio}
          onChange={handleInputChange}
        />
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          {errors.bio ? <span className="text-red-550 font-bold normal-case">{errors.bio}</span> : <div />}
          <span className={`${formData.bio.length >= 200 ? 'text-red-500 font-bold' : ''}`}>{formData.bio.length}/200 characters</span>
        </div>
      </div>

      <div className="border-t dark:border-slate-800 pt-6">
        <h3 className="text-sm font-black italic uppercase text-slate-855 dark:text-white mb-4">Compliance Declaration</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: !!checked }))}
              className="rounded-md h-5 w-5 border-slate-350 dark:border-slate-800 focus:ring-blue-500/20 data-[state=checked]:bg-blue-600 text-white"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="termsAccepted" className="text-xs font-bold text-slate-655 dark:text-slate-400 cursor-pointer select-none leading-none uppercase tracking-wide">
                I accept the Terms & Conditions and Privacy Policy *
              </label>
              {errors.termsAccepted && <p className="text-xs text-red-550 font-bold mt-1">{errors.termsAccepted}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="registeredPractitioner"
              checked={formData.registeredPractitioner}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registeredPractitioner: !!checked }))}
              className="rounded-md h-5 w-5 border-slate-350 dark:border-slate-800 focus:ring-blue-500/20 data-[state=checked]:bg-blue-600 text-white"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="registeredPractitioner" className="text-xs font-bold text-slate-655 dark:text-slate-400 cursor-pointer select-none leading-tight uppercase tracking-wide">
                I confirm that I am a registered medical practitioner authorized to provide medical consultations *
              </label>
              {errors.registeredPractitioner && <p className="text-xs text-red-555 font-bold mt-1">{errors.registeredPractitioner}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="verificationConsent"
              checked={formData.verificationConsent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verificationConsent: !!checked }))}
              className="rounded-md h-5 w-5 border-slate-350 dark:border-slate-800 focus:ring-blue-500/20 data-[state=checked]:bg-blue-600 text-white"
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="verificationConsent" className="text-xs font-bold text-slate-655 dark:text-slate-400 cursor-pointer select-none leading-tight uppercase tracking-wide">
                I consent to I Health Clinic verifying my uploaded documents and credentials *
              </label>
              {errors.verificationConsent && <p className="text-xs text-red-555 font-bold mt-1">{errors.verificationConsent}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] p-6 text-left">
        <h4 className="font-black text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Next Steps in Verification Flow</h4>
        <ul className="space-y-2 text-[10px] text-slate-655 dark:text-slate-400 font-bold uppercase tracking-wider">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Documents will be audited by the medical vetting board within 24-48 hours</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Audit alerts will be dispatched via real-time email or SMS logs</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Upon approval, a "✅ Verified Doctor" badge will be permanently linked to your profile</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Your scheduling and telemedicine options will immediately go live</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-105 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-12 transition-colors duration-300 relative overflow-hidden flex items-center justify-center">
      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-10">
        {/* Back Link */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-black uppercase text-[10px] tracking-widest transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to login portal
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 border border-blue-400/20 mx-auto transform -rotate-3 hover:rotate-0 transition-transform">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white tracking-tighter leading-none">Doctor Registration</h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Join I Health Clinic as a verified medical professional</p>
        </div>

        {/* Steps Tracker */}
        <div className="flex items-center justify-between pb-4 overflow-x-auto custom-scrollbar gap-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 p-6 rounded-[2rem] backdrop-blur-md">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1 min-w-[90px] last:flex-initial">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2.5 transition-all duration-300 shadow-md ${isActive
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-650 text-white ring-4 ring-blue-500/20 scale-110 shadow-blue-500/10 font-bold border-transparent'
                      : isCompleted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                        : 'bg-white dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border border-slate-200/60 dark:border-slate-850'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-6 animate-in zoom-in duration-300" />
                    ) : (
                      <StepIcon className="size-5" />
                    )}
                  </div>
                  <p
                    className={`text-[9px] font-black uppercase tracking-wider transition-colors duration-300 text-center select-none ${isActive ? 'text-blue-600 dark:text-blue-400' : isCompleted ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'
                      }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] mx-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="border-none bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 dark:shadow-none border border-slate-100 dark:border-slate-800/80 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900/5 to-slate-900/[0.02] dark:from-slate-950/20 dark:to-slate-950/[0.01] p-8 md:p-10 border-b border-slate-150 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">Step {currentStep} of {steps.length}</span>
                <CardTitle className="text-2xl font-black italic uppercase text-slate-850 dark:text-white mt-3">
                  {steps[currentStep - 1].title}
                  {currentStep === 2 && ' Details'}
                  {currentStep === 4 && ' Details'}
                  {currentStep === 5 && ' Details & Compliance'}
                </CardTitle>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 shadow-inner">
                {(() => {
                  const CurrentIcon = steps[currentStep - 1].icon;
                  return <CurrentIcon className="w-5 h-5 animate-pulse" />;
                })()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-10">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}

            {/* Navigation */}
            <div className="flex gap-4 mt-10 pt-8 border-t dark:border-slate-850">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 h-13 rounded-2xl font-black uppercase text-xs tracking-wider border-slate-200 dark:border-slate-855 dark:text-white dark:hover:bg-slate-850"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-13 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black uppercase text-xs tracking-wider border-4 border-blue-500/20 active:scale-95 shadow-lg shadow-blue-500/10"
                >
                  Next
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => { if (validateStep(5)) handleSubmit(); }}
                  disabled={loading}
                  className="flex-1 h-13 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black uppercase text-xs tracking-wider border-4 border-emerald-500/20 active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {loading ? (
                    'Registering...'
                  ) : (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
              {currentStep === 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1 h-13 rounded-2xl font-black uppercase text-xs tracking-wider border-slate-200 dark:border-slate-855 dark:text-white dark:hover:bg-slate-850"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
