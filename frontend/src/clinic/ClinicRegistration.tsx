import React, { useState } from 'react';
import {
  Building2,
  Phone,
  FileText,
  Users,
  Stethoscope,
  DollarSign,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  ArrowLeft,
  Mail,
  Lock,
  Globe,
  Calendar,
  MapPin,
  CreditCard,
  Award,
  AlertCircle,
  ShieldCheck
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

interface ClinicRegistrationProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Staff', icon: Users },
  { id: 5, title: 'Services', icon: Stethoscope },
  { id: 6, title: 'Financial', icon: DollarSign }
];

const specializations = [
  'General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology',
  'Orthopedics', 'ENT', 'Gynecology', 'Ophthalmology',
  'Dentistry', 'Physiotherapy', 'Pathology', 'Radiology'
];

const languages = [
  'Hindi', 'English', 'Marathi', 'Bengali',
  'Tamil', 'Telugu', 'Gujarati', 'Punjabi'
];

const bookingModes = ['Walk-in', 'Call Booking', 'Online Booking'];

const servicesProvided = [
  'General Checkup', 'Blood Test', 'ECG', 'X-Ray',
  'Ultrasound', 'Vaccination', 'Minor Surgery', 'Physiotherapy',
  'Dental Care', 'Eye Checkup', 'Pregnancy Care', 'Emergency Care'
];

const facilities = [
  'Wi-Fi', 'Parking', 'Wheelchair Access', 'Pharmacy',
  'Laboratory', '24/7 Emergency', 'Ambulance', 'Cafeteria',
  'Waiting Room', 'AC'
];

const paymentModes = ['Cash', 'UPI', 'Card', 'Insurance'];

export function ClinicRegistration({ onBack, onSuccess }: ClinicRegistrationProps) {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emergencyServices, setEmergencyServices] = useState(false);
  const [onlineConsultation, setOnlineConsultation] = useState(false);
  const [selectedBookingModes, setSelectedBookingModes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    clinicType: '',
    establishedYear: '',
    tagline: '',
    description: '',
    address: '',
    pinCode: '',
    city: '',
    state: '',
    mobile: '',
    email: '',
    website: '',
    medicalCouncilRegNo: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    pan: '',
    gstin: '',
    password: ''
  });

  const [files, setFiles] = useState<Record<string, File>>({});
  const [customService, setCustomService] = useState('');
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customFacility, setCustomFacility] = useState('');
  const [showCustomFacilityInput, setShowCustomFacilityInput] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [showCustomSpecializationInput, setShowCustomSpecializationInput] = useState(false);

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

  const handleAddCustomFacility = () => {
    if (customFacility.trim()) {
      setSelectedFacilities(prev => [...prev, customFacility.trim()]);
      setCustomFacility('');
      setShowCustomFacilityInput(false);
      toast.success("Custom facility added!");
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

  const handleAddCustomSpecialization = () => {
    if (customSpecialization.trim()) {
      setSelectedSpecializations(prev => [...prev, customSpecialization.trim()]);
      setCustomSpecialization('');
      setShowCustomSpecializationInput(false);
      toast.success("Custom specialization added!");
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.clinicName) newErrors.clinicName = "Clinic Name is required";
      if (!formData.clinicType) newErrors.clinicType = "Clinic Type is required";
      if (!formData.establishedYear) newErrors.establishedYear = "Established Year is required";
      if (!formData.description) newErrors.description = "Description is required";
      if (!formData.password) newErrors.password = "Password is required";
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.pinCode) newErrors.pinCode = "PIN Code is required";
      else if (formData.pinCode.length !== 6) newErrors.pinCode = "PIN Code must be 6 digits";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.mobile) newErrors.mobile = "Contact Number is required";
      else if (formData.mobile.length !== 10) newErrors.mobile = "Mobile Number must be 10 digits";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.medicalCouncilRegNo) newErrors.medicalCouncilRegNo = "Medical Council Reg No is required";
    }

    if (step === 6) {
      if (!formData.accountName) newErrors.accountName = "Account Holder Name is required";
      if (!formData.accountNumber) newErrors.accountNumber = "Account Number is required";
      if (!formData.ifsc) newErrors.ifsc = "IFSC Code is required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) newErrors.ifsc = "Invalid IFSC format (e.g., SBIN0001234)";

      if (!formData.pan) newErrors.pan = "PAN Number is required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";

      if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format";
      }
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

  const validateAllRequiredFields = () => {
    const errors: Record<string, string> = {};
    let stepWithError = 0;

    // Required field checks (Step 1)
    if (!formData.clinicName) { errors.clinicName = "Clinic Name is required"; if (!stepWithError) stepWithError = 1; }
    else if (formData.clinicName.length > 150) { errors.clinicName = "Clinic Name must be less than 150 characters"; if (!stepWithError) stepWithError = 1; }
    if (!formData.clinicType) { errors.clinicType = "Clinic Type is required"; if (!stepWithError) stepWithError = 1; }
    if (!formData.establishedYear) { errors.establishedYear = "Established Year is required"; if (!stepWithError) stepWithError = 1; }
    if (!formData.description) { errors.description = "Description is required"; if (!stepWithError) stepWithError = 1; }
    else if (formData.description.length > 500) { errors.description = "Description must be less than 500 characters"; if (!stepWithError) stepWithError = 1; }
    if (!formData.password) { errors.password = "Password is required"; if (!stepWithError) stepWithError = 1; }
    if (formData.tagline && formData.tagline.length > 200) { errors.tagline = "Tagline must be less than 200 characters"; if (!stepWithError) stepWithError = 1; }

    // Step 2
    if (!formData.address) { errors.address = "Address is required"; if (!stepWithError) stepWithError = 2; }
    if (!formData.pinCode) { errors.pinCode = "PIN Code is required"; if (!stepWithError) stepWithError = 2; }
    else if (formData.pinCode.length !== 6) { errors.pinCode = "PIN Code must be exactly 6 digits"; if (!stepWithError) stepWithError = 2; }
    if (!formData.city) { errors.city = "City is required"; if (!stepWithError) stepWithError = 2; }
    else if (formData.city.length > 100) { errors.city = "City must be less than 100 characters"; if (!stepWithError) stepWithError = 2; }
    if (!formData.state) { errors.state = "State is required"; if (!stepWithError) stepWithError = 2; }
    else if (formData.state.length > 100) { errors.state = "State must be less than 100 characters"; if (!stepWithError) stepWithError = 2; }
    if (!formData.mobile) { errors.mobile = "Contact Number is required"; if (!stepWithError) stepWithError = 2; }
    else if (formData.mobile.length !== 10) { errors.mobile = "Mobile Number must be exactly 10 digits"; if (!stepWithError) stepWithError = 2; }
    if (!formData.email) { errors.email = "Email is required"; if (!stepWithError) stepWithError = 2; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { errors.email = "Invalid email format"; if (!stepWithError) stepWithError = 2; }
    else if (formData.email.length > 150) { errors.email = "Email must be less than 150 characters"; if (!stepWithError) stepWithError = 2; }
    if (!formData.medicalCouncilRegNo) { errors.medicalCouncilRegNo = "Medical Council Reg No is required"; if (!stepWithError) stepWithError = 2; }
    else if (formData.medicalCouncilRegNo.length > 100) { errors.medicalCouncilRegNo = "Medical Council Reg No must be less than 100 characters"; if (!stepWithError) stepWithError = 2; }
    if (formData.website && formData.website.length > 200) { errors.website = "Website must be less than 200 characters"; if (!stepWithError) stepWithError = 2; }

    // Bank details length checks - only validate if not empty (Step 6)
    if (formData.accountName && formData.accountName.length > 150) { errors.accountName = "Account Holder Name must be less than 150 characters"; if (!stepWithError) stepWithError = 6; }
    if (formData.accountNumber && formData.accountNumber.length > 50) { errors.accountNumber = "Account Number must be less than 50 characters"; if (!stepWithError) stepWithError = 6; }
    if (formData.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) { errors.ifsc = "Invalid IFSC format"; if (!stepWithError) stepWithError = 6; }
    if (formData.pan && formData.pan.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) { errors.pan = "Invalid PAN format"; if (!stepWithError) stepWithError = 6; }
    if (formData.gstin && formData.gstin.trim() !== '' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) { errors.gstin = "Invalid GSTIN format"; if (!stepWithError) stepWithError = 6; }

    if (Object.keys(errors).length > 0) {
      console.error('Validation errors:', errors);
      console.log('Form data:', formData);
      setErrors(errors);
      
      // Navigate to the step containing the first error
      if (stepWithError > 0 && stepWithError !== currentStep) {
        setCurrentStep(stepWithError);
      }

      // Show the first error in detail
      const firstError = Object.entries(errors)[0];
      toast.error(`${firstError[0]}: ${firstError[1]}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAllRequiredFields()) return;

    try {
      setLoading(true);
      const response = await authService.signUpClinic({
        name: formData.clinicName,
        type: formData.clinicType,
        establishedYear: parseInt(formData.establishedYear),
        tagline: formData.tagline,
        description: formData.description,
        address: formData.address,
        pinCode: formData.pinCode,
        city: formData.city,
        state: formData.state,
        mobile: formData.mobile,
        email: formData.email,
        website: formData.website,
        medicalCouncilRegNo: formData.medicalCouncilRegNo,
        bankDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          pan: formData.pan.toUpperCase(),
          gstin: formData.gstin.toUpperCase()
        }
      }, {
        services: selectedServices,
        facilities: selectedFacilities,
        paymentModes: selectedPaymentModes,
        bookingModes: selectedBookingModes
      }, formData.password, files);

      toast.success('Registration successful!');

      // Auto-login
      if (response.token && response.user) {
        const userData = {
          id: String(response.user.user_id),
          full_name: response.user.full_name,
          name: response.user.full_name,
          email: response.user.email,
          role: response.user.role as UserRole,
          clinic_id: response.clinic?.id
        };
        login(userData, response.token);
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register clinic');
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

  const addDoctor = () => {
    setDoctors([
      ...doctors,
      {
        id: Date.now(),
        name: '',
        degrees: '',
        registration: '',
        experience: '',
        specializations: [],
        languages: []
      }
    ]);
  };

  const removeDoctor = (id: number) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clinicName" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Clinic / Hospital Name *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Building2 className="w-5 h-5" />
          </div>
          <Input
            id="clinicName"
            placeholder="e.g. Lifeline Wellness Center"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm transition-all focus:bg-white dark:focus:bg-slate-950 ${errors.clinicName ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            value={formData.clinicName}
            onChange={handleInputChange}
          />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">As per government registration certificate</p>
        {errors.clinicName && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.clinicName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="clinicType" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Clinic Type *</Label>
          <Select onValueChange={(v) => handleSelectChange('clinicType', v)}>
            <SelectTrigger id="clinicType" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.clinicType ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Institution Type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905">
              <SelectItem value="clinic" className="font-bold">Clinic</SelectItem>
              <SelectItem value="hospital" className="font-bold">Hospital</SelectItem>
              <SelectItem value="nursing_home" className="font-bold">Nursing Home</SelectItem>
              <SelectItem value="diagnostic_center" className="font-bold">Diagnostic Center</SelectItem>
            </SelectContent>
          </Select>
          {errors.clinicType && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.clinicType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="establishedYear" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Established Year *</Label>
          <Select onValueChange={(v) => handleSelectChange('establishedYear', v)}>
            <SelectTrigger id="establishedYear" className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus:ring-blue-500/20 ${errors.establishedYear ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 dark:bg-slate-905 max-h-60">
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()} className="font-bold">{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.establishedYear && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.establishedYear}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tagline" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tagline</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Award className="w-5 h-5" />
          </div>
          <Input
            id="tagline"
            placeholder="e.g. Care Beyond Compare"
            className="pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm"
            value={formData.tagline}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Institution Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your specialties, general timing, primary care vision..."
          rows={4}
          className={`rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm p-4 ${errors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          value={formData.description}
          onChange={handleInputChange}
        />
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
          <span>{formData.description.length}/500 characters</span>
          {errors.description && <span className="text-red-500 font-bold normal-case">{errors.description}</span>}
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
            placeholder="Create a highly secure password"
            className={`pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.password ? 'border-red-500' : ''}`}
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        {errors.password && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.password}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Complete Address *</Label>
        <div className="relative">
          <div className="absolute top-4 left-4 pointer-events-none text-slate-400 dark:text-slate-600">
            <MapPin className="w-5 h-5" />
          </div>
          <Textarea
            id="address"
            placeholder="Full physical address"
            rows={3}
            className={`pl-12 pt-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.address ? 'border-red-500' : ''}`}
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
        {errors.address && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pinCode" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">PIN Code *</Label>
          <Input
            id="pinCode"
            placeholder="6-digit PIN"
            maxLength={6}
            className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.pinCode ? 'border-red-500' : ''}`}
            value={formData.pinCode}
            onChange={handleInputChange}
          />
          {errors.pinCode && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.pinCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">City *</Label>
          <Input
            id="city"
            placeholder="City"
            className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.city ? 'border-red-500' : ''}`}
            value={formData.city}
            onChange={handleInputChange}
          />
          {errors.city && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.city}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="state" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">State *</Label>
        <Input
          id="state"
          placeholder="State"
          className={`h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.state ? 'border-red-500' : ''}`}
          value={formData.state}
          onChange={handleInputChange}
        />
        {errors.state && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.state}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Contact Number *</Label>
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
          {errors.mobile && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.mobile}</p>}
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
                placeholder="Official email"
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
          {errors.email && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Website (Optional)</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <Globe className="w-4 h-4" />
          </div>
          <Input
            id="website"
            placeholder="https://yourclinic.com"
            className="pl-10 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalCouncilRegNo" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Medical Council Registration No. *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <FileText className="w-4 h-4" />
          </div>
          <Input
            id="medicalCouncilRegNo"
            placeholder="Council registration key"
            className={`pl-10 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold text-slate-800 dark:text-slate-100 focus-visible:ring-blue-500 shadow-sm ${errors.medicalCouncilRegNo ? 'border-red-500' : ''}`}
            value={formData.medicalCouncilRegNo}
            onChange={handleInputChange}
          />
        </div>
        {errors.medicalCouncilRegNo && <p className="text-xs text-red-500 font-bold mt-1 pl-1">{errors.medicalCouncilRegNo}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] flex gap-4 items-center text-left">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 grow-0 shrink-0"><FileText className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Verification Materials REQUIRED</h4>
          <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase tracking-wide mt-1">Please upload clear scanned copies or PDF files. All documents are mandatory for verification audit.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'registration', label: 'Registration Certificate', desc: 'Govt. Registration document' },
          { key: 'license', label: 'Medical Council License', desc: 'State or MCI certificate proof' },
          { key: 'idProof', label: 'Premise Proof / ID Proof', desc: 'Rent deed, bill or clinic photos' },
          { key: 'gst', label: 'GST Certificate (if applicable)', desc: 'Optional GST registration' }
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
                  <p className="text-[9px] text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-1">{(files[doc.key].size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Upload className="size-5" /></div>
                  <p className="text-xs text-slate-600 dark:text-slate-350 font-bold">{doc.desc}</p>
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-black italic uppercase text-slate-850 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Clinic Doctors roster</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Add medical professionals who will consult under your facility license</p>
        </div>
        <Button type="button" onClick={addDoctor} className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-2xl h-11 px-6 font-black uppercase text-[10px] tracking-wider border-4 border-blue-500/20 active:scale-95 shadow-lg shadow-blue-500/10">
          <Plus className="size-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-16 border-4 border-dashed border-slate-100 dark:border-slate-900 rounded-[2.5rem] bg-slate-50/30 dark:bg-slate-950/20">
          <Users className="size-14 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No doctors configured yet</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-550 uppercase tracking-wider mt-1 mb-6">You can add them now or create them later from the panel</p>
          <Button type="button" onClick={addDoctor} className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-2xl h-12 px-8 font-black uppercase text-xs tracking-wider border-4 border-blue-500/20 active:scale-95 shadow-xl shadow-blue-500/10">
            <Plus className="size-4 mr-2" />
            Roster First Practitioner
          </Button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {doctors.map((doctor, index) => (
            <Card key={doctor.id} className="border-2 border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] bg-white/40 dark:bg-slate-950/10 overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 p-6 px-8 border-b dark:border-slate-800 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black italic">D{index + 1}</div>
                  <CardTitle className="text-sm font-black italic uppercase text-slate-800 dark:text-white">Doctor Profile #{index + 1}</CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDoctor(doctor.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-xl"
                >
                  <X className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Dr. Full Name *</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                      <User className="w-4 h-4" />
                    </div>
                    <Input 
                      placeholder="e.g. Dr. Jane Smith" 
                      className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 font-bold" 
                      value={doctor.name}
                      onChange={(e) => {
                        const newDocs = [...doctors];
                        newDocs[index].name = e.target.value;
                        setDoctors(newDocs);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Degrees *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                        <Award className="w-4 h-4" />
                      </div>
                      <Input 
                        placeholder="MBBS, MD, BDS, etc." 
                        className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 font-bold" 
                        value={doctor.degrees}
                        onChange={(e) => {
                          const newDocs = [...doctors];
                          newDocs[index].degrees = e.target.value;
                          setDoctors(newDocs);
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">MCI / State Council Reg No. *</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Input 
                        placeholder="Registration Number" 
                        className="pl-10 h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 font-bold" 
                        value={doctor.registration}
                        onChange={(e) => {
                          const newDocs = [...doctors];
                          newDocs[index].registration = e.target.value;
                          setDoctors(newDocs);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Years of Experience *</Label>
                  <Select 
                    value={doctor.experience} 
                    onValueChange={(v) => {
                      const newDocs = [...doctors];
                      newDocs[index].experience = v;
                      setDoctors(newDocs);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/30 font-bold text-left">
                      <SelectValue placeholder="Select Experience Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-905">
                      {Array.from({ length: 51 }, (_, i) => i).map(exp => (
                        <SelectItem key={exp} value={exp.toString()} className="font-bold">{exp} {exp === 1 ? 'Year' : 'Years'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Specializations *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {specializations.map((spec) => (
                      <div
                        key={spec}
                        onClick={() => {
                          const newDocs = [...doctors];
                          if (newDocs[index].specializations.includes(spec)) {
                            newDocs[index].specializations = newDocs[index].specializations.filter((s: string) => s !== spec);
                          } else {
                            newDocs[index].specializations.push(spec);
                          }
                          setDoctors(newDocs);
                        }}
                        className={`p-3 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none ${doctor.specializations.includes(spec)
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                          : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider scale-95">{spec}</p>
                      </div>
                    ))}
                    {doctor.specializations.filter((s: string) => !specializations.includes(s)).map((spec: string) => (
                      <div
                        key={spec}
                        onClick={() => {
                          const newDocs = [...doctors];
                          newDocs[index].specializations = newDocs[index].specializations.filter((s: string) => s !== spec);
                          setDoctors(newDocs);
                        }}
                        className="p-3 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02] select-none"
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
                          placeholder="Type spec..."
                          className="h-8 text-xs rounded-xl"
                        />
                        <Button size="sm" type="button" onClick={() => {
                          if (customSpecialization.trim()) {
                            const newDocs = [...doctors];
                            if (!newDocs[index].specializations.includes(customSpecialization.trim())) {
                              newDocs[index].specializations.push(customSpecialization.trim());
                            }
                            setDoctors(newDocs);
                            setCustomSpecialization('');
                            setShowCustomSpecializationInput(false);
                            toast.success("Custom specialization added!");
                          }
                        }} className="h-6 w-6 p-0 bg-blue-600">
                          <CheckCircle className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Languages Spoken</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {languages.map((lang) => (
                      <div
                        key={lang}
                        onClick={() => {
                          const newDocs = [...doctors];
                          if (newDocs[index].languages.includes(lang)) {
                            newDocs[index].languages = newDocs[index].languages.filter((l: string) => l !== lang);
                          } else {
                            newDocs[index].languages.push(lang);
                          }
                          setDoctors(newDocs);
                        }}
                        className={`p-2.5 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none ${doctor.languages.includes(lang)
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02]'
                          : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider scale-95">{lang}</p>
                      </div>
                    ))}
                    {doctor.languages.filter((l: string) => !languages.includes(l)).map((lang: string) => (
                      <div
                        key={lang}
                        onClick={() => {
                          const newDocs = [...doctors];
                          newDocs[index].languages = newDocs[index].languages.filter((l: string) => l !== lang);
                          setDoctors(newDocs);
                        }}
                        className="p-2.5 border rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02] select-none"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider scale-95">{lang}</p>
                      </div>
                    ))}

                    {!showCustomLanguageInput ? (
                      <div
                        onClick={() => setShowCustomLanguageInput(true)}
                        className="p-2.5 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-550 dark:text-slate-400">+ Other</p>
                      </div>
                    ) : (
                      <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
                        <Input
                          value={customLanguage}
                          onChange={(e) => setCustomLanguage(e.target.value)}
                          placeholder="Type lang..."
                          className="h-8 text-xs rounded-xl"
                        />
                        <Button size="sm" type="button" onClick={() => {
                          if (customLanguage.trim()) {
                            const newDocs = [...doctors];
                            if (!newDocs[index].languages.includes(customLanguage.trim())) {
                              newDocs[index].languages.push(customLanguage.trim());
                            }
                            setDoctors(newDocs);
                            setCustomLanguage('');
                            setShowCustomLanguageInput(false);
                            toast.success("Custom language added!");
                          }
                        }} className="h-6 w-6 p-0 bg-indigo-600">
                          <CheckCircle className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-3">
          <Checkbox
            id="emergency"
            checked={emergencyServices}
            onCheckedChange={(checked) => setEmergencyServices(!!checked)}
            className="rounded-lg h-6 w-6 border-slate-300 dark:border-slate-800 focus:ring-blue-500/20 text-blue-600 data-[state=checked]:bg-blue-600"
          />
          <label htmlFor="emergency" className="text-xs font-black uppercase tracking-wider cursor-pointer text-slate-700 dark:text-slate-300">
            24/7 Emergency Available
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="online"
            checked={onlineConsultation}
            onCheckedChange={(checked) => setOnlineConsultation(!!checked)}
            className="rounded-lg h-6 w-6 border-slate-300 dark:border-slate-800 focus:ring-blue-500/20 text-blue-600 data-[state=checked]:bg-blue-600"
          />
          <label htmlFor="online" className="text-xs font-black uppercase tracking-wider cursor-pointer text-slate-700 dark:text-slate-300">
            Online Consultations Available
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avgFee" className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Average Consultation Fee (₹) *</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <Input id="avgFee" placeholder="e.g., 500" type="number" className="pl-12 h-13 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 font-bold" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Appointment Booking Modes *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {bookingModes.map((mode) => (
            <div
              key={mode}
              onClick={() => toggleSelection(mode, selectedBookingModes, setSelectedBookingModes)}
              className={`p-3.5 rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none border ${selectedBookingModes.includes(mode)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">{mode}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Services Provided *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {servicesProvided.map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border select-none ${selectedServices.includes(service)
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{service}</p>
              {selectedServices.includes(service) && <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />}
            </div>
          ))}
          {selectedServices.filter(s => !servicesProvided.includes(s)).map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className="p-3 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs flex items-center justify-between border bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/10 scale-[1.02] select-none"
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95 truncate mr-1">{service}</p>
              <CheckCircle className="size-4 shrink-0 animate-in zoom-in" />
            </div>
          ))}

          {!showCustomServiceInput ? (
            <div
              onClick={() => setShowCustomServiceInput(true)}
              className="p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer text-slate-500 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-indigo-800 hover:bg-indigo-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" />
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">+ Add Custom</p>
            </div>
          ) : (
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Type service..."
                className="h-8 text-xs rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomService} className="h-8 w-8 p-0 bg-indigo-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Facilities Available *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {facilities.map((facility) => (
            <div
              key={facility}
              onClick={() => toggleSelection(facility, selectedFacilities, setSelectedFacilities)}
              className={`p-3 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs text-center border select-none ${selectedFacilities.includes(facility)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95">{facility}</p>
            </div>
          ))}
          {selectedFacilities.filter(f => !facilities.includes(f)).map((facility) => (
            <div
              key={facility}
              onClick={() => toggleSelection(facility, selectedFacilities, setSelectedFacilities)}
              className="p-3 rounded-2xl cursor-pointer transition-all duration-300 font-bold text-xs text-center border bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/10 scale-[1.02] select-none"
            >
              <p className="font-bold uppercase tracking-wider text-[10px] scale-95">{facility}</p>
            </div>
          ))}

          {!showCustomFacilityInput ? (
            <div
              onClick={() => setShowCustomFacilityInput(true)}
              className="p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl cursor-pointer text-slate-500 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-800 hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="size-4" />
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">+ Add Custom</p>
            </div>
          ) : (
            <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 flex items-center gap-2">
              <Input
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                placeholder="Type facility..."
                className="h-8 text-sm rounded-xl"
              />
              <Button size="sm" type="button" onClick={handleAddCustomFacility} className="h-8 w-8 p-0 bg-blue-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Modes Accepted *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {paymentModes.map((mode) => (
            <div
              key={mode}
              onClick={() => toggleSelection(mode, selectedPaymentModes, setSelectedPaymentModes)}
              className={`p-3.5 rounded-2xl cursor-pointer text-center transition-all duration-300 font-bold text-xs select-none border ${selectedPaymentModes.includes(mode)
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-md shadow-purple-500/10 scale-[1.02]'
                : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <p className="font-black uppercase tracking-wider text-[10px] scale-95">{mode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] flex gap-4 items-center text-left">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 grow-0 shrink-0"><DollarSign className="w-5 h-5" /></div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-slate-800 dark:text-white leading-tight">Financial settlement setup</h4>
          <p className="text-[10px] text-slate-550 dark:text-slate-400 uppercase tracking-wide mt-1">Bank details are required to settle payouts from online consultation bookings directly into your ledger.</p>
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
              placeholder="As per bank records"
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

      <div className="border-t dark:border-slate-800 pt-6">
        <h3 className="text-sm font-black italic uppercase text-slate-800 dark:text-white mb-4">Compliance Declaration</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" className="rounded-md h-5 w-5 border-slate-350 dark:border-slate-800 focus:ring-blue-500/20 data-[state=checked]:bg-blue-600 text-white" />
            <label htmlFor="terms" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-none pt-0.5 uppercase tracking-wide">
              I accept the Terms & Conditions and Privacy Policy of I Health Clinic
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="accurate" defaultChecked className="rounded-md h-5 w-5 border-slate-350 dark:border-slate-800 focus:ring-blue-500/20 data-[state=checked]:bg-blue-600 text-white" />
            <label htmlFor="accurate" className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none leading-relaxed uppercase tracking-wide">
              I confirm that all the information provided is true and accurate. I understand that
              I Health Clinic is not meant for collecting PII or securing sensitive data beyond what is
              necessary for healthcare services.
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/5 dark:from-blue-950/20 dark:to-slate-950/30 border border-blue-150 dark:border-blue-900/30 rounded-[1.5rem] p-6 text-left">
        <h4 className="font-black text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Next Steps in Verification Flow</h4>
        <ul className="space-y-2 text-[10px] text-slate-650 dark:text-slate-400 font-bold uppercase tracking-wider">
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Our verification team will review your credentials within 24-48 hours</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> You'll receive real-time email/SMS updates on audit progress</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Upon approval, a "✅ Verified Clinic" badge will show on the dashboard</li>
          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full shrink-0" /> Your clinic profile is instantly published onto the search registry</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-12 transition-colors duration-300 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 border border-blue-400/20 mx-auto transform -rotate-3 hover:rotate-0 transition-transform">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black italic uppercase text-slate-900 dark:text-white tracking-tighter leading-none">Clinic Registration</h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">Register your diagnostic/clinical establishment on I Health network</p>
        </div>

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

        <Card className="border-none bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-blue-900/5 dark:shadow-none border border-slate-100 dark:border-slate-800/80 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900/5 to-slate-900/[0.02] dark:from-slate-950/20 dark:to-slate-950/[0.01] p-8 md:p-10 border-b border-slate-150 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">Step {currentStep} of {steps.length}</span>
                <CardTitle className="text-2xl font-black italic uppercase text-slate-850 dark:text-white mt-3">
                  {steps[currentStep - 1].title}
                  {currentStep === 2 && ' & Location'}
                  {currentStep === 5 && ' & Facilities'}
                  {currentStep === 6 && ' & Compliance'}
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
            {currentStep === 6 && renderStep6()}

            <div className="flex gap-4 mt-10 pt-8 border-t dark:border-slate-850">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 h-13 rounded-2xl font-black uppercase text-xs tracking-wider border-slate-200 dark:border-slate-850 dark:text-white dark:hover:bg-slate-850"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep < 6 ? (
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
                  onClick={handleSubmit}
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
                  className="flex-1 h-13 rounded-2xl font-black uppercase text-xs tracking-wider border-slate-200 dark:border-slate-850 dark:text-white dark:hover:bg-slate-850"
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