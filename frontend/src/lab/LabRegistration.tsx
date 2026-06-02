import React, { useState } from 'react';
import { Building2, Phone, FileText, Activity, Shield, CheckCircle, ChevronRight, ChevronLeft, Upload, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Textarea } from '../common/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Checkbox } from '../common/ui/checkbox';
import { toast } from 'sonner';
import { authService } from '../services/authService';

interface LabRegistrationProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const steps = [
  { id: 1, title: 'Basic Details', icon: Building2 },
  { id: 2, title: 'Contact Info', icon: Phone },
  { id: 3, title: 'License & Cert', icon: FileText },
  { id: 4, title: 'Services & Tests', icon: Activity },
  { id: 5, title: 'Account Setup', icon: Shield }
];

export function LabRegistration({ onBack, onSuccess }: LabRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [_errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    labName: '',
    ownerName: '',
    labType: 'pathology',
    registrationNumber: '',
    establishedYear: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    licenseNumber: '',
    certification: '',
    gstNumber: '',
    username: '',
    password: '',
    homeCollection: false,
    reportTime: '24 Hours'
  });

  const [tests, setTests] = useState<any[]>([]);
  const [files, setFiles] = useState<Record<string, File>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
      toast.success(`${key} selected: ${e.target.files![0].name}`);
    }
  };

  const addTest = () => {
    setTests([
      ...tests,
      { id: Date.now(), testName: '', category: 'Blood', price: '' }
    ]);
  };

  const removeTest = (id: number) => {
    setTests(tests.filter(t => t.id !== id));
  };

  const updateTest = (id: number, field: string, value: string) => {
    setTests(tests.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.labName) newErrors.labName = "Lab Name is required";
      if (!formData.ownerName) newErrors.ownerName = "Owner Name is required";
    }

    if (step === 2) {
      if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = "Valid 10-digit mobile is required";
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
    }

    if (step === 3) {
      if (!formData.licenseNumber) newErrors.licenseNumber = "License Number is required";
    }

    if (step === 5) {
      if (!formData.username) newErrors.username = "Username is required";
      if (!formData.password) newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Please fill required fields");
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    try {
      setLoading(true);
      // Construct payload
      const payload = {
        name: formData.labName,
        owner_name: formData.ownerName,
        lab_type: formData.labType,
        registration_number: formData.registrationNumber,
        established_year: parseInt(formData.establishedYear),
        contact_number: formData.mobile,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pinCode,
        license_number: formData.licenseNumber,
        certification: formData.certification,
        gst_number: formData.gstNumber,
        username: formData.username,
        password: formData.password,
        role: 'LAB_ADMIN',
        tests: tests,
        homeCollection: formData.homeCollection,
        reportTime: formData.reportTime
      };

      // Call Backend API Endpoint
      await authService.signUpLab(payload, files);
      
      toast.success('Registration successful!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return (
        <div className="space-y-4">
          <div><Label htmlFor="labName">Lab Name *</Label>
            <Input id="labName" value={formData.labName} onChange={handleInputChange} className={_errors.labName ? 'border-red-500' : ''} />
            {_errors.labName && <p className="text-red-500 text-xs mt-1">{_errors.labName}</p>}
          </div>
          <div><Label htmlFor="ownerName">Owner Name *</Label>
            <Input id="ownerName" value={formData.ownerName} onChange={handleInputChange} className={_errors.ownerName ? 'border-red-500' : ''} />
            {_errors.ownerName && <p className="text-red-500 text-xs mt-1">{_errors.ownerName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-6 pb-2">
            <div className="relative z-[60]"><Label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Lab Type</Label>
              <Select onValueChange={v => handleSelectChange('labType', v)} defaultValue="pathology">
                <SelectTrigger className="h-12 rounded-2xl border-gray-100 shadow-sm focus:ring-blue-500/20"><SelectValue placeholder="Pathology" /></SelectTrigger>
                <SelectContent><SelectItem value="pathology">Pathology</SelectItem><SelectItem value="radiology">Radiology</SelectItem><SelectItem value="both">Both</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="establishedYear" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Established Year</Label>
              <Input id="establishedYear" type="number" value={formData.establishedYear} onChange={handleInputChange} className="h-12 rounded-2xl border-gray-100 shadow-sm" /></div>
          </div>
          <div className="pt-2"><Label htmlFor="registrationNumber" className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Registration Number</Label>
            <Input id="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} placeholder="Unique Lab ID" className="h-12 rounded-2xl border-gray-100 shadow-sm" /></div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="mobile">Mobile Number *</Label>
              <Input id="mobile" value={formData.mobile} onChange={handleInputChange} maxLength={10} className={_errors.mobile ? 'border-red-500' : ''} />
              {_errors.mobile && <p className="text-red-500 text-xs mt-1">{_errors.mobile}</p>}
            </div>
            <div><Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className={_errors.email ? 'border-red-500' : ''} />
              {_errors.email && <p className="text-red-500 text-xs mt-1">{_errors.email}</p>}
            </div>
          </div>
          <div><Label htmlFor="address">Address *</Label>
            <Textarea id="address" value={formData.address} onChange={handleInputChange} className={_errors.address ? 'border-red-500' : ''} />
            {_errors.address && <p className="text-red-500 text-xs mt-1">{_errors.address}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="city">City *</Label>
              <Input id="city" value={formData.city} onChange={handleInputChange} className={_errors.city ? 'border-red-500' : ''} />
              {_errors.city && <p className="text-red-500 text-xs mt-1">{_errors.city}</p>}
            </div>
            <div><Label htmlFor="state">State</Label>
              <Input id="state" value={formData.state} onChange={handleInputChange} /></div>
            <div><Label htmlFor="pinCode">PIN Code</Label>
              <Input id="pinCode" value={formData.pinCode} onChange={handleInputChange} /></div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div><Label htmlFor="licenseNumber">Lab License Number *</Label>
            <Input id="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} className={_errors.licenseNumber ? 'border-red-500' : ''} />
            {_errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{_errors.licenseNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="certification">NABL/ISO Certification</Label>
              <Input id="certification" value={formData.certification} onChange={handleInputChange} placeholder="Optional" /></div>
            <div><Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" value={formData.gstNumber} onChange={handleInputChange} /></div>
          </div>
          <div className="mt-4">
            <Label>Upload Documents</Label>
            <div className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center shadow-sm relative ${files['docs'] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
               <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleFileChange('docs', e)} accept=".pdf,.png,.jpg" multiple />
               {files['docs'] ? <CheckCircle className="mx-auto text-blue-500" /> : <Upload className="mx-auto text-gray-400" />}
               <p className="mt-2 text-sm text-gray-500">{files['docs'] ? files['docs'].name : 'Click to Upload Documents'}</p>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <div className="flex justify-between items-center"><Label>Available Tests</Label><Button variant="outline" size="sm" onClick={addTest}><Plus className="size-4 mr-1"/> Add Test</Button></div>
          {tests.length === 0 ? <p className="text-sm text-gray-500 border border-dashed p-4 text-center rounded">No tests added.</p> : tests.map(t => (
            <div key={t.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
               <Select onValueChange={v => updateTest(t.id, 'category', v)} defaultValue="Blood">
                  <SelectTrigger className="w-1/4"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="Blood">Blood</SelectItem><SelectItem value="Urine">Urine</SelectItem><SelectItem value="MRI">MRI</SelectItem><SelectItem value="CT Scan">CT Scan</SelectItem><SelectItem value="X-Ray">X-Ray</SelectItem></SelectContent>
               </Select>
               <Input className="flex-1" placeholder="Test Name" value={t.testName} onChange={e => updateTest(t.id, 'testName', e.target.value)} />
               <Input className="w-1/4" placeholder="Price (₹)" type="number" value={t.price} onChange={e => updateTest(t.id, 'price', e.target.value)} />
               <Button variant="ghost" size="sm" onClick={() => removeTest(t.id)}><X className="size-4 text-red-500"/></Button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4 mt-4">
             <div><Label>Report Delivery Time</Label>
               <Select onValueChange={v => handleSelectChange('reportTime', v)} defaultValue="24 Hours">
                <SelectTrigger><SelectValue placeholder="24 Hours"/></SelectTrigger>
                <SelectContent><SelectItem value="Same Day">Same Day</SelectItem><SelectItem value="24 Hours">24 Hours</SelectItem><SelectItem value="48 Hours">48 Hours</SelectItem></SelectContent>
               </Select>
             </div>
             <div className="flex items-end pb-2">
                 <div className="flex items-center space-x-2">
                    <Checkbox id="homeCollection" checked={formData.homeCollection} onCheckedChange={(c) => setFormData(p => ({...p, homeCollection: !!c}))} />
                    <Label htmlFor="homeCollection">Home Collection Available</Label>
                 </div>
             </div>
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <div><Label htmlFor="username">Username *</Label>
            <Input id="username" value={formData.username} onChange={handleInputChange} className={_errors.username ? 'border-red-500' : ''} />
            {_errors.username && <p className="text-red-500 text-xs mt-1">{_errors.username}</p>}
          </div>
          <div><Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={formData.password} onChange={handleInputChange} className={_errors.password ? 'border-red-500' : ''} />
            {_errors.password && <p className="text-red-500 text-xs mt-1">{_errors.password}</p>}
          </div>
          <div className="p-4 bg-blue-50 rounded text-blue-800 text-sm mt-4 text-center border border-blue-200">
             Your role will be securely created as <strong>LAB_ADMIN</strong>.
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex justify-center transition-colors duration-300">
       <Card className="w-full max-w-2xl shadow-lg border-blue-100">
           <CardHeader className="bg-blue-600 rounded-t-lg">
               <div className="flex items-center text-white">
                   <Button variant="ghost" className="text-white hover:bg-blue-700 hover:text-white" onClick={onBack}>
                      <ChevronLeft className="w-5 h-5 mr-1" /> Back
                  </Button>
                  <CardTitle className="ml-auto flex items-center gap-2">
                      <Activity className="size-5" /> Lab & Diagnostics Registration
                  </CardTitle>
               </div>
           </CardHeader>
           <CardContent className="p-6">
               <div className="flex justify-between mb-8 overflow-x-auto">
                    {steps.map((step) => {
                       const Icon = step.icon;
                       const active = currentStep === step.id;
                       const done = currentStep > step.id;
                       return (
                         <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-blue-600 text-white' : done ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-xs mt-2 font-medium text-center ${active ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</span>
                         </div>
                       )
                    })}
               </div>

               <div className="mb-8">
                   {renderStep()}
               </div>

               <div className="flex justify-between pt-4 border-t">
                  <Button onClick={() => currentStep === 1 ? onBack() : setCurrentStep(p => p - 1)} variant="outline">Back</Button>
                  <Button onClick={currentStep === steps.length ? handleSubmit : handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
                      {currentStep === steps.length ? (loading ? 'Submitting...' : 'Register Lab') : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
               </div>
           </CardContent>
       </Card>
    </div>
  );
}
