import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { User, Bell, Save, Loader2, FileText, Upload, Trash2, ExternalLink, Paperclip } from 'lucide-react';
import { doctorService, Doctor } from '../services/doctorService';

interface SettingsProps {
    userRole: UserRole;
}

export function Settings({ userRole }: SettingsProps) {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [doctorData, setDoctorData] = useState<Doctor | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [docFile, setDocFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('Degree/Credential');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        mobile: '',
        bio: '',
        specialization: '',
        date_of_birth: '',
        gender: '',
        qualifications: '',
        experience_years: '',
        medical_council_reg_no: '',
        medical_council_name: '',
        registration_year: '',
        university_name: '',
        graduation_year: '',
        bank_account_name: '',
        bank_account_number: '',
        ifsc_code: '',
        pan_number: '',
        gstin: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const profile = await doctorService.getCurrentDoctorProfile();
                if (profile) {
                    setDoctorData(profile);
                    setFormData({
                        full_name: profile.full_name || '',
                        email: profile.email || '',
                        mobile: profile.mobile || '',
                        bio: profile.bio || '',
                        specialization: profile.specialization || '',
                        date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
                        gender: profile.gender || '',
                        qualifications: profile.qualifications || '',
                        experience_years: profile.experience_years?.toString() || '',
                        medical_council_reg_no: profile.medical_council_reg_no || '',
                        medical_council_name: profile.medical_council_name || '',
                        registration_year: profile.registration_year?.toString() || '',
                        university_name: profile.university_name || '',
                        graduation_year: profile.graduation_year?.toString() || '',
                        bank_account_name: profile.bank_account_name || '',
                        bank_account_number: profile.bank_account_number || '',
                        ifsc_code: profile.ifsc_code || '',
                        pan_number: profile.pan_number || '',
                        gstin: profile.gstin || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching doctor profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const fetchDocs = async () => {
        try {
            setDocsLoading(true);
            const docs = await doctorService.getMyDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error('Error fetching doctor docs:', error);
        } finally {
            setDocsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'documents') {
            fetchDocs();
        }
    }, [activeTab]);

    const handleUploadDoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!docFile) return alert('Please select a file to upload');

        try {
            setUploadingDoc(true);
            await doctorService.uploadDocument(docFile, docType);
            alert('Document uploaded successfully!');
            setDocFile(null);
            fetchDocs();
        } catch (error) {
            console.error('Error uploading doc:', error);
            alert('Failed to upload document.');
        } finally {
            setUploadingDoc(false);
        }
    };

    const handleDeleteDoc = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        try {
            await doctorService.deleteDocument(id);
            alert('Document deleted successfully');
            fetchDocs();
        } catch (error) {
            console.error('Error deleting doc:', error);
            alert('Failed to delete document');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            // Convert numeric strings back to numbers for backend
            const submitData = {
                ...formData,
                experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
                registration_year: formData.registration_year ? parseInt(formData.registration_year) : null,
                graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
                date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : null
            };

            const updated = await doctorService.updateCurrentDoctorProfile(submitData as any);
            if (updated) {
                setDoctorData(updated);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'documents', label: 'Verification Documents', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your professional profile and configuration details</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 bg-white dark:bg-[#111625] rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 h-fit lg:sticky lg:top-24 shadow-sm transition-colors duration-300">
                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm tracking-wide">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 pb-10">
                    {activeTab === 'profile' && (
                        <div className="space-y-8">
                            {/* Personal Information */}
                            <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Email (Primary)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800/50 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Gender</label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="Tell patients about yourself..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">Professional Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Specialization</label>
                                        <input
                                            type="text"
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Qualifications</label>
                                        <input
                                            type="text"
                                            name="qualifications"
                                            value={formData.qualifications}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="e.g. MBBS, MD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Experience (Years)</label>
                                        <input
                                            type="number"
                                            name="experience_years"
                                            value={formData.experience_years}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">University Name</label>
                                        <input
                                            type="text"
                                            name="university_name"
                                            value={formData.university_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Graduation Year</label>
                                        <input
                                            type="number"
                                            name="graduation_year"
                                            value={formData.graduation_year}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Registration Year</label>
                                        <input
                                            type="number"
                                            name="registration_year"
                                            value={formData.registration_year}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Council Registration No.</label>
                                        <input
                                            type="text"
                                            name="medical_council_reg_no"
                                            value={formData.medical_council_reg_no}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Medical Council Name</label>
                                        <input
                                            type="text"
                                            name="medical_council_name"
                                            value={formData.medical_council_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bank & Tax Details */}
                            <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">Bank & Tax Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Bank Account Name</label>
                                        <input
                                            type="text"
                                            name="bank_account_name"
                                            value={formData.bank_account_name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Account Number</label>
                                        <input
                                            type="text"
                                            name="bank_account_number"
                                            value={formData.bank_account_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">IFSC Code</label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            value={formData.ifsc_code}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">PAN Number</label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={formData.pan_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">GSTIN (Optional)</label>
                                        <input
                                            type="text"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Save Bar */}
                            <div className="flex justify-end pt-4 sticky bottom-4 bg-[#F0F2F5]/80 dark:bg-[#0a0d14]/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 z-10 shadow-sm transition-colors duration-300">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 hover:shadow-xl hover:shadow-blue-600/20 transition-all font-black uppercase tracking-widest text-sm"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    {saving ? 'Saving Changes...' : 'Save All Information'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-8">
                            {/* Upload Section */}
                            <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">Upload Credentials & Documents</h2>
                                <form onSubmit={handleUploadDoc} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Document Classification</label>
                                            <select
                                                value={docType}
                                                onChange={(e) => setDocType(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                                            >
                                                <option value="Degree/Credential">Degree/Credential</option>
                                                <option value="Medical Council Registration">Medical Council Registration</option>
                                                <option value="Board Certification">Board Certification</option>
                                                <option value="ID Verification">ID Verification</option>
                                                <option value="Affiliation Proof">Affiliation Proof</option>
                                                <option value="Other Certification">Other Certification</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Select File (PDF, Image)</label>
                                            <div className="relative group border border-dashed border-slate-350 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1b2234] hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all p-3 flex items-center justify-between cursor-pointer">
                                                <input
                                                    type="file"
                                                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <Paperclip className="w-5 h-5 text-slate-400" />
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                        {docFile ? docFile.name : 'Choose file...'}
                                                    </span>
                                                </div>
                                                <Upload className="w-5 h-5 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={uploadingDoc || !docFile}
                                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/10 hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {uploadingDoc ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4" />
                                            )}
                                            {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* List Section */}
                            <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">My Credentials Repository</h2>
                                {docsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    </div>
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-12 space-y-4">
                                        <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto animate-pulse" />
                                        <p className="text-slate-500 dark:text-slate-400 font-bold">No verification documents uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {documents.map((doc: any) => (
                                            <div key={doc.id} className="bg-slate-50 dark:bg-[#1b2234] border border-slate-100 dark:border-slate-800/50 rounded-2xl p-5 flex items-center justify-between transition-colors shadow-sm">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h4 className="font-bold text-slate-850 dark:text-slate-250 truncate">{doc.document_type}</h4>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteDoc(doc.id)}
                                                        className="p-2 bg-white dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-[#111625] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-sm transition-colors duration-300">
                            <div>
                                <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 mb-2">Notification Preferences</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose how you want to receive alerts and digests</p>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Email Notifications</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates, updates, and news via email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">SMS Notifications</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Get direct text message alerts for critical events</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Appointment Reminders</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Daily appointment digest sent directly to you</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/10 hover:shadow-xl transition-all">
                                    <Save className="w-4 h-4" />
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
