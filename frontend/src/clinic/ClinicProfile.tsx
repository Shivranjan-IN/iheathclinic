import { useState, useEffect } from 'react';
import { User } from '../common/types';
import { clinicService, Clinic } from '../services/clinicService';
import { Toaster, toast } from 'sonner';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Shield,
  Users,
  Stethoscope,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Landmark,
  Hash,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ClinicProfileProps {
  user: User | null;
  onBack: () => void;
}

export function ClinicProfile({ user, onBack }: ClinicProfileProps) {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable form state
  const [form, setForm] = useState({
    clinic_name: '',
    tagline: '',
    description: '',
    establishment_year: '',
    website: '',
    landmark: '',
    medical_council_reg_no: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    email: '',
    mobile: '',
    pan_number: '',
    gstin: '',
    bank_account_name: '',
    bank_account_number: '',
    ifsc_code: '',
  });

  const [services, setServices] = useState<string[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [paymentModes, setPaymentModes] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newPaymentMode, setNewPaymentMode] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      const data = await clinicService.getProfile();
      if (data) {
        setClinic(data);
        setForm({
          clinic_name: data.clinic_name || '',
          tagline: data.tagline || '',
          description: data.description || '',
          establishment_year: data.establishment_year?.toString() || '',
          website: data.website || '',
          landmark: data.landmark || '',
          medical_council_reg_no: data.medical_council_reg_no || '',
          address: data.address?.address || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          pin_code: data.address?.pin_code || '',
          email: data.email || '',
          mobile: data.mobile || '',
          pan_number: data.pan_number || '',
          gstin: data.gstin || '',
          bank_account_name: data.bank_account_name || '',
          bank_account_number: data.bank_account_number || '',
          ifsc_code: data.ifsc_code || '',
        });
        setServices(data.clinic_services?.map(s => s.service || '').filter(Boolean) || []);
        setFacilities(data.clinic_facilities?.map(f => f.facility || '').filter(Boolean) || []);
        setPaymentModes(data.clinic_payment_modes?.map(p => p.payment_mode || '').filter(Boolean) || []);
      }
    } catch (error) {
      console.error('Failed to load clinic profile:', error);
      toast.error('Failed to load clinic profile');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      await clinicService.updateProfile({
        clinic_name: form.clinic_name,
        tagline: form.tagline,
        description: form.description,
        establishment_year: form.establishment_year ? parseInt(form.establishment_year) : undefined,
        website: form.website,
        landmark: form.landmark,
        medical_council_reg_no: form.medical_council_reg_no,
        address: form.address,
        city: form.city,
        state: form.state,
        pin_code: form.pin_code,
        email: form.email,
        mobile: form.mobile,
        pan_number: form.pan_number,
        gstin: form.gstin,
        bank_account_name: form.bank_account_name,
        bank_account_number: form.bank_account_number,
        ifsc_code: form.ifsc_code,
        services,
        facilities,
        payment_modes: paymentModes,
      } as any);
      toast.success('Clinic profile updated successfully!');
      setIsEditing(false);
      await loadProfile();
    } catch (error) {
      console.error('Failed to update clinic profile:', error);
      toast.error('Failed to update clinic profile');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (clinic) {
      setForm({
        clinic_name: clinic.clinic_name || '',
        tagline: clinic.tagline || '',
        description: clinic.description || '',
        establishment_year: clinic.establishment_year?.toString() || '',
        website: clinic.website || '',
        landmark: clinic.landmark || '',
        medical_council_reg_no: clinic.medical_council_reg_no || '',
        address: clinic.address?.address || '',
        city: clinic.address?.city || '',
        state: clinic.address?.state || '',
        pin_code: clinic.address?.pin_code || '',
        email: clinic.email || '',
        mobile: clinic.mobile || '',
        pan_number: clinic.pan_number || '',
        gstin: clinic.gstin || '',
        bank_account_name: clinic.bank_account_name || '',
        bank_account_number: clinic.bank_account_number || '',
        ifsc_code: clinic.ifsc_code || '',
      });
      setServices(clinic.clinic_services?.map(s => s.service || '').filter(Boolean) || []);
      setFacilities(clinic.clinic_facilities?.map(f => f.facility || '').filter(Boolean) || []);
      setPaymentModes(clinic.clinic_payment_modes?.map(p => p.payment_mode || '').filter(Boolean) || []);
    }
    setIsEditing(false);
  }

  function handleInputChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function addService() {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices(prev => [...prev, newService.trim()]);
      setNewService('');
    }
  }

  function removeService(s: string) {
    setServices(prev => prev.filter(item => item !== s));
  }

  function addFacility() {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities(prev => [...prev, newFacility.trim()]);
      setNewFacility('');
    }
  }

  function removeFacility(f: string) {
    setFacilities(prev => prev.filter(item => item !== f));
  }

  function addPaymentMode() {
    if (newPaymentMode.trim() && !paymentModes.includes(newPaymentMode.trim())) {
      setPaymentModes(prev => [...prev, newPaymentMode.trim()]);
      setNewPaymentMode('');
    }
  }

  function removePaymentMode(pm: string) {
    setPaymentModes(prev => prev.filter(item => item !== pm));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 text-lg">Loading clinic profile...</span>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg">Clinic profile not found</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">Go back</button>
      </div>
    );
  }

  const verificationColor = clinic.verification_status === 'APPROVED'
    ? 'green' : clinic.verification_status === 'PENDING'
    ? 'yellow' : 'red';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinic Profile</h1>
            <p className="text-gray-500 text-sm">Manage complete clinic information</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProfile}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Verification Status */}
      <div className={`bg-gradient-to-r ${verificationColor === 'green'
        ? 'from-green-50 to-emerald-50 border-green-200'
        : verificationColor === 'yellow'
        ? 'from-yellow-50 to-amber-50 border-yellow-200'
        : 'from-red-50 to-rose-50 border-red-200'
      } border rounded-xl p-5`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${verificationColor === 'green'
            ? 'bg-green-600' : verificationColor === 'yellow'
            ? 'bg-yellow-500' : 'bg-red-500'}`}>
            {verificationColor === 'green'
              ? <CheckCircle className="w-6 h-6 text-white" />
              : <AlertCircle className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${verificationColor === 'green'
              ? 'text-green-900' : verificationColor === 'yellow'
              ? 'text-yellow-900' : 'text-red-900'}`}>
              {clinic.verification_status === 'APPROVED' ? 'Clinic Verified' : `Status: ${clinic.verification_status}`}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Registration No: <strong>{clinic.medical_council_reg_no}</strong> | Clinic ID: <strong>{clinic.id}</strong>
            </p>
            {clinic.created_at && (
              <p className="text-xs text-gray-500 mt-1">
                Registered: {new Date(clinic.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {clinic.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-7 h-7 text-blue-600" />} label="Active Doctors" value={clinic.stats.total_doctors} bg="bg-blue-50" />
          <StatCard icon={<Users className="w-7 h-7 text-green-600" />} label="Support Staff" value={clinic.stats.total_staff} bg="bg-green-50" />
          <StatCard icon={<Calendar className="w-7 h-7 text-purple-600" />} label="Total Appointments" value={clinic.stats.total_appointments} bg="bg-purple-50" />
          <StatCard icon={<Stethoscope className="w-7 h-7 text-orange-600" />} label="Patients Served" value={clinic.stats.total_patients} bg="bg-orange-50" />
        </div>
      )}

      {/* Basic Information */}
      <SectionCard title="Basic Information" icon={<Building2 className="w-5 h-5 text-blue-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Clinic Name *" value={form.clinic_name} field="clinic_name" editing={isEditing} onChange={handleInputChange} icon={<Building2 className="w-4 h-4" />} />
          <FormField label="Tagline" value={form.tagline} field="tagline" editing={isEditing} onChange={handleInputChange} />
          <FormField label="Email *" value={form.email} field="email" editing={isEditing} onChange={handleInputChange} type="email" icon={<Mail className="w-4 h-4" />} />
          <FormField label="Mobile *" value={form.mobile} field="mobile" editing={isEditing} onChange={handleInputChange} type="tel" icon={<Phone className="w-4 h-4" />} />
          <FormField label="Website" value={form.website} field="website" editing={isEditing} onChange={handleInputChange} icon={<Globe className="w-4 h-4" />} />
          <FormField label="Establishment Year" value={form.establishment_year} field="establishment_year" editing={isEditing} onChange={handleInputChange} type="number" icon={<Calendar className="w-4 h-4" />} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            {isEditing ? (
              <textarea
                value={form.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                maxLength={500}
                placeholder="Brief description of your clinic..."
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[60px]">{form.description || 'No description added'}</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address Details" icon={<MapPin className="w-5 h-5 text-red-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <FormField label="Full Address *" value={form.address} field="address" editing={isEditing} onChange={handleInputChange} icon={<MapPin className="w-4 h-4" />} />
          </div>
          <FormField label="Landmark" value={form.landmark} field="landmark" editing={isEditing} onChange={handleInputChange} icon={<Landmark className="w-4 h-4" />} />
          <FormField label="City *" value={form.city} field="city" editing={isEditing} onChange={handleInputChange} />
          <FormField label="State *" value={form.state} field="state" editing={isEditing} onChange={handleInputChange} />
          <FormField label="PIN Code *" value={form.pin_code} field="pin_code" editing={isEditing} onChange={handleInputChange} />
        </div>
      </SectionCard>

      {/* Legal & Compliance */}
      <SectionCard title="Legal & Compliance" icon={<Shield className="w-5 h-5 text-yellow-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Medical Council Reg No *" value={form.medical_council_reg_no} field="medical_council_reg_no" editing={isEditing} onChange={handleInputChange} icon={<FileText className="w-4 h-4" />} />
          <FormField label="PAN Number" value={form.pan_number} field="pan_number" editing={isEditing} onChange={handleInputChange} icon={<Hash className="w-4 h-4" />} />
          <FormField label="GSTIN" value={form.gstin} field="gstin" editing={isEditing} onChange={handleInputChange} icon={<Hash className="w-4 h-4" />} />
        </div>
      </SectionCard>

      {/* Bank Details */}
      <SectionCard title="Bank Account Details" icon={<CreditCard className="w-5 h-5 text-indigo-600" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Account Holder Name" value={form.bank_account_name} field="bank_account_name" editing={isEditing} onChange={handleInputChange} />
          <FormField label="Account Number" value={form.bank_account_number} field="bank_account_number" editing={isEditing} onChange={handleInputChange} />
          <FormField label="IFSC Code" value={form.ifsc_code} field="ifsc_code" editing={isEditing} onChange={handleInputChange} />
        </div>
      </SectionCard>

      {/* Services */}
      <SectionCard title="Services Offered" icon={<Stethoscope className="w-5 h-5 text-teal-600" />}>
        <div className="flex flex-wrap gap-2 mb-4">
          {services.length === 0 && !isEditing && (
            <p className="text-gray-400 text-sm italic">No services added yet</p>
          )}
          {services.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full text-sm font-medium">
              {s}
              {isEditing && (
                <button onClick={() => removeService(s)} className="text-teal-600 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
              placeholder="Add a service..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button onClick={addService} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </SectionCard>

      {/* Facilities */}
      <SectionCard title="Facilities" icon={<Building2 className="w-5 h-5 text-purple-600" />}>
        <div className="flex flex-wrap gap-2 mb-4">
          {facilities.length === 0 && !isEditing && (
            <p className="text-gray-400 text-sm italic">No facilities added yet</p>
          )}
          {facilities.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-full text-sm font-medium">
              {f}
              {isEditing && (
                <button onClick={() => removeFacility(f)} className="text-purple-600 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              placeholder="Add a facility..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button onClick={addFacility} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </SectionCard>

      {/* Payment Modes */}
      <SectionCard title="Accepted Payment Modes" icon={<CreditCard className="w-5 h-5 text-green-600" />}>
        <div className="flex flex-wrap gap-2 mb-4">
          {paymentModes.length === 0 && !isEditing && (
            <p className="text-gray-400 text-sm italic">No payment modes added yet</p>
          )}
          {paymentModes.map((pm, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-800 border border-green-200 rounded-full text-sm font-medium">
              <CreditCard className="w-3.5 h-3.5" />
              {pm}
              {isEditing && (
                <button onClick={() => removePaymentMode(pm)} className="text-green-600 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newPaymentMode}
              onChange={(e) => setNewPaymentMode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPaymentMode())}
              placeholder="Add payment mode (e.g., Cash, UPI, Card)..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button onClick={addPaymentMode} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </SectionCard>

      {/* Doctors */}
      {clinic.doctor_clinic_mapping && clinic.doctor_clinic_mapping.length > 0 && (
        <SectionCard title="Associated Doctors" icon={<Stethoscope className="w-5 h-5 text-blue-600" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinic.doctor_clinic_mapping.map((mapping: any, i: number) => {
              const doc = mapping.doctors;
              const specs = doc?.doctor_specializations?.map(
                (ds: any) => ds.specializations_master?.specialization_name
              ).filter(Boolean).join(', ') || 'General';
              return (
                <div key={i} className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {doc?.full_name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{doc?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{specs}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Documents */}
      {clinic.clinic_documents && clinic.clinic_documents.length > 0 && (
        <SectionCard title="Uploaded Documents" icon={<FileText className="w-5 h-5 text-gray-600" />}>
          <div className="space-y-2">
            {clinic.clinic_documents.map((doc: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.document_type || doc.file_name || 'Document'}</p>
                    <p className="text-xs text-gray-500">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// Reusable Section Card component
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Reusable Form Field component
function FormField({
  label,
  value,
  field,
  editing,
  onChange,
  type = 'text',
  icon,
}: {
  label: string;
  value: string;
  field: string;
  editing: boolean;
  onChange: (field: string, value: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {editing ? (
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
          )}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2 text-gray-900 bg-gray-50 px-4 py-2.5 rounded-lg min-h-[42px]">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span>{value || <span className="text-gray-400 italic">Not provided</span>}</span>
        </div>
      )}
    </div>
  );
}

// Reusable Stat Card component
function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-5 border border-gray-100 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}
