import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { clinicService, Clinic } from '../services/clinicService';
import {
    Building2,
    CreditCard,
    Shield,
    Users,
    Stethoscope,
    Edit,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface ClinicProfileProps {
    userRole?: UserRole;
    user?: any;
    onBack?: () => void;
}

export function ClinicProfile({ userRole, user, onBack }: ClinicProfileProps) {
    const effectiveRole = userRole || user?.role;
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [clinic, setClinic] = useState<Clinic | null>(null);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchClinic = async () => {
            try {
                setLoading(true);
                const data = await clinicService.getProfile();
                if (data) {
                    setClinic({
                        ...data,
                        services: data.clinic_services?.map(s => s.service || '') || [],
                        facilities: data.clinic_facilities?.map(f => f.facility || '') || [],
                        payment_modes: data.clinic_payment_modes?.map(p => p.payment_mode || '') || []
                    });
                } else {
                    setError('No clinic data found.');
                }

                // Fetch real stats
                try {
                    const reportsData = await clinicService.getReports();
                    setStats(reportsData);
                } catch (reportErr) {
                    console.error('Error fetching clinic reports:', reportErr);
                }
            } catch (err) {
                console.error('Error fetching clinic:', err);
                setError('Failed to load clinic information.');
            } finally {
                setLoading(false);
            }
        };

        fetchClinic();
    }, []);

    const handleSave = async () => {
        if (!clinic) return;
        try {
            setLoading(true);
            const payload = {
                ...clinic,
                address: clinic.address?.address,
                city: clinic.address?.city,
                state: clinic.address?.state,
                pin_code: clinic.address?.pin_code
            };
            const updatedClinic = await clinicService.updateProfile(payload);
            if (updatedClinic) {
                setClinic({
                    ...updatedClinic,
                    services: updatedClinic.clinic_services?.map(s => s.service || '') || [],
                    facilities: updatedClinic.clinic_facilities?.map(f => f.facility || '') || [],
                    payment_modes: updatedClinic.clinic_payment_modes?.map(p => p.payment_mode || '') || []
                });
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Error updating clinic:', err);
            setError('Failed to save changes.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !clinic) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading clinic profile...</p>
            </div>
        );
    }

    if (error && !clinic) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!clinic) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clinic Profile & Legal Details</h1>
                    <p className="text-gray-600">Manage clinic information and registration</p>
                </div>
                {effectiveRole === 'clinic' && (
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />)}
                        {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                )}
            </div>

            {/* Verification Status */}
            {clinic.verification_status === 'APPROVED' ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 dark:from-emerald-950/20 dark:to-green-950/20 dark:border-emerald-900">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-600 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-green-900 dark:text-emerald-300 mb-1">Clinic Verified</h3>
                            <p className="text-sm text-green-800 dark:text-emerald-400">
                                Your clinic has been verified and approved. Registration ID: <strong>{clinic.medical_council_reg_no}</strong>
                            </p>
                            <p className="text-xs text-green-700 dark:text-emerald-500 mt-2">Status: APPROVED</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-900">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Verification Pending</h3>
                            <p className="text-sm text-amber-800 dark:text-amber-400">
                                Your clinic verification is currently in progress. Registration ID: <strong>{clinic.medical_council_reg_no}</strong>
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-2">Status: {clinic.verification_status || 'PENDING'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Basic Information</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name *</label>
                            <input
                                type="text"
                                value={clinic.clinic_name}
                                onChange={(e) => setClinic({ ...clinic, clinic_name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
                            <input
                                type="text"
                                value={clinic.medical_council_reg_no}
                                onChange={(e) => setClinic({ ...clinic, medical_council_reg_no: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                value={clinic.email}
                                onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                            <input
                                type="tel"
                                value={clinic.mobile}
                                onChange={(e) => setClinic({ ...clinic, mobile: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <textarea
                                value={clinic.address?.address || ''}
                                onChange={(e) => setClinic({ ...clinic, address: { ...clinic.address, address_id: clinic.address?.address_id || 0, address: e.target.value } })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                                rows={2}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal & Compliance */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Legal & Compliance Details</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                            <input
                                type="text"
                                value={clinic.gstin || ''}
                                onChange={(e) => setClinic({ ...clinic, gstin: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                            <input
                                type="text"
                                value={clinic.pan_number || ''}
                                onChange={(e) => setClinic({ ...clinic, pan_number: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Number</label>
                            <input
                                type="text"
                                value={clinic.medical_council_reg_no}
                                onChange={(e) => setClinic({ ...clinic, medical_council_reg_no: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Establishment Year</label>
                            <input
                                type="text"
                                value={clinic.establishment_year?.toString() || ''}
                                onChange={(e) => setClinic({ ...clinic, establishment_year: parseInt(e.target.value) || undefined })}
                                disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Services & Facilities */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Services & Facilities</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Services</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                'General Consultation',
                                'Cardiology',
                                'Pediatrics',
                                'Orthopedics',
                                'Laboratory',
                                'Pharmacy',
                                'Emergency Services',
                                'Dental Care',
                                'Physiotherapy'
                            ].map((service, index) => {
                                const isChecked = clinic.services?.includes(service);
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!isChecked}
                                            disabled={!isEditing}
                                            onChange={(e) => {
                                                const updatedServices = e.target.checked
                                                    ? [...(clinic.services || []), service]
                                                    : (clinic.services || []).filter((s: string) => s !== service);
                                                setClinic({ ...clinic, services: updatedServices });
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                        <label className="text-sm text-gray-700">{service}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                'Parking',
                                'Wheelchair Access',
                                'WiFi',
                                'Cafeteria',
                                'Waiting Room',
                                'Emergency Care'
                            ].map((facility, index) => {
                                const isChecked = clinic.facilities?.includes(facility);
                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={!!isChecked}
                                            disabled={!isEditing}
                                            onChange={(e) => {
                                                const updatedFacilities = e.target.checked
                                                    ? [...(clinic.facilities || []), facility]
                                                    : (clinic.facilities || []).filter((f: string) => f !== facility);
                                                setClinic({ ...clinic, facilities: updatedFacilities });
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-50"
                                        />
                                        <label className="text-sm text-gray-700">{facility}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Working Hours</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                            <div key={day} className="flex items-center gap-4">
                                <div className="w-32">
                                    <span className="text-sm font-medium text-gray-900">{day}</span>
                                </div>
                                <input
                                    type="time"
                                    defaultValue={day === 'Sunday' ? '' : '09:00'}
                                    disabled={!isEditing || day === 'Sunday'}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="time"
                                    defaultValue={day === 'Sunday' ? '' : '18:00'}
                                    disabled={!isEditing || day === 'Sunday'}
                                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                                />
                                {day === 'Sunday' && (
                                    <span className="text-sm text-red-600">Closed</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/20 dark:border-blue-900">
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="emergency_services"
                                    checked={clinic.emergency_services !== 'Not Available'}
                                    onChange={(e) => setClinic({
                                        ...clinic,
                                        emergency_services: e.target.checked ? 'Available 24/7' : 'Not Available'
                                    })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="emergency_services" className="text-sm font-semibold text-blue-900 dark:text-blue-300 cursor-pointer">
                                    24/7 Emergency Services Available
                                </label>
                            </div>
                        ) : (
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                                <strong>Emergency Services:</strong> {clinic.emergency_services || 'Available 24/7'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modes */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Accepted Payment Modes</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { name: 'Cash', icon: CreditCard },
                            { name: 'Credit/Debit Card', icon: CreditCard },
                            { name: 'UPI', icon: CreditCard },
                            { name: 'Insurance', icon: Shield },
                        ].map((mode, index) => {
                            const isEnabled = clinic.payment_modes?.includes(mode.name);
                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (!isEditing) return;
                                        const updatedModes = isEnabled
                                            ? (clinic.payment_modes || []).filter((pm: string) => pm !== mode.name)
                                            : [...(clinic.payment_modes || []), mode.name];
                                        setClinic({ ...clinic, payment_modes: updatedModes });
                                    }}
                                    className={`p-4 border-2 rounded-lg text-center ${
                                        isEnabled
                                            ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20'
                                            : 'border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900'
                                    } ${isEditing ? 'cursor-pointer hover:border-blue-500' : ''}`}
                                >
                                    <mode.icon className={`w-6 h-6 mx-auto mb-2 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{mode.name}</p>
                                    {isEnabled && (
                                        <p className="text-xs text-green-600 mt-1">Active</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_doctors || 0}</p>
                    <p className="text-sm text-gray-600">Active Doctors</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_patients || 0}</p>
                    <p className="text-sm text-gray-600">Total Patients</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <Stethoscope className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_appointments || 0}</p>
                    <p className="text-sm text-gray-600">Total Appointments</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <Building2 className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{stats?.total_revenue || 0}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
            </div>
        </div>
    );
}
