import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { Search, Star, Calendar, TrendingUp, Award, Clock, Loader2, AlertCircle, Plus, X } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { Toaster, toast } from 'sonner';
import { DoctorRegistration } from '../doctor/DoctorRegistration';

interface DoctorManagementProps {
    userRole: UserRole;
}

interface Doctor {
    id: number;
    name: string;
    specialization: string;
    qualification: string;
    experience: number;
    totalConsultations: number;
    rating: number;
    availableDays: string[];
    availableTime: string;
    phone: string;
    email: string;
    status: 'active' | 'on-leave' | 'inactive';
}

export function DoctorManagement({ userRole: _userRole }: DoctorManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await clinicService.getDoctors();
            const mappedDoctors: Doctor[] = data.map((d: any) => ({
                id: d.doctor?.user_id || d.doctor_id,
                name: d.doctor?.full_name || 'Unknown Doctor',
                specialization: d.doctor?.specialization || 'General Physician',
                qualification: d.doctor?.qualifications || 'MBBS',
                experience: d.doctor?.experience_years || 0,
                totalConsultations: 0,
                rating: 4.5,
                availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                availableTime: '9:00 AM - 5:00 PM',
                status: 'active',
                phone: d.doctor?.mobile || '',
                email: d.doctor?.email || ''
            }));
            setDoctors(mappedDoctors);
        } catch (err) {
            console.error('Error fetching doctors:', err);
            setError('Failed to load doctors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);


    // Remove old handleRegisterDoctor — the full DoctorRegistration form handles its own submission

    const handleDeleteDoctor = async (id: number | string) => {
        if (!window.confirm('Are you sure you want to remove this doctor from your clinic?')) return;
        try {
            setLoading(true);
            await clinicService.removeDoctor(id);
            toast.success('Doctor removed from clinic roster');
            await fetchDoctors();
        } catch (err) {
            console.error('Error removing doctor:', err);
            toast.error('Failed to remove doctor');
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clinic Doctor Management</h1>
                    <p className="text-gray-600">Manage doctors associated with your clinic</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Register New Doctor
                </button>
            </div>
            <Toaster />

            {/* Search Bar */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, specialization, or doctor ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Loading doctors...</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {!loading && filteredDoctors.length === 0 && (
                <div className="text-center p-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-lg">No doctors found matching your search.</p>
                </div>
            )}

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                    <div
                        key={doctor.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                    {doctor.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.status === 'active' ? 'bg-green-100 text-green-700' :
                                    doctor.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {doctor.status === 'active' ? 'Active' : doctor.status === 'on-leave' ? 'On Leave' : 'Inactive'}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{doctor.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{doctor.specialization}</p>
                            <p className="text-xs text-gray-500 mb-4">{doctor.qualification}</p>

                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{doctor.totalConsultations} consults</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-gray-600">{doctor.availableTime}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {doctor.availableDays.map(day => (
                                                <span key={day} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                                    {day}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Doctor Details</h2>
                                <button
                                    onClick={() => setSelectedDoctor(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h3>
                                            <p className="text-gray-600">{selectedDoctor.specialization}</p>
                                            <p className="text-sm text-gray-500">{selectedDoctor.qualification}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDoctor.status === 'active' ? 'bg-green-100 text-green-700' :
                                            selectedDoctor.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {selectedDoctor.status === 'active' ? 'Active' : selectedDoctor.status === 'on-leave' ? 'On Leave' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                            <span className="font-semibold text-gray-900">{selectedDoctor.rating}</span>
                                            <span className="text-sm text-gray-600">Rating</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Award className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-gray-900">{selectedDoctor.experience}</span>
                                            <span className="text-sm text-gray-600">Years Exp.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Doctor ID</label>
                                    <p className="text-gray-900 font-medium">{selectedDoctor.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                    <p className="text-gray-900 font-medium">{selectedDoctor.phone}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                    <p className="text-gray-900 font-medium">{selectedDoctor.email}</p>
                                </div>
                            </div>

                            {/* Schedule */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Schedule & Availability</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-5 h-5 text-gray-600" />
                                        <span className="font-medium text-gray-900">{selectedDoctor.availableTime}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <span
                                                key={day}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedDoctor.availableDays.includes(day)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Analytics */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Performance Analytics</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">{selectedDoctor.totalConsultations}</p>
                                        <p className="text-sm text-gray-600">Total Consultations</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Star className="w-5 h-5 text-green-600" />
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-green-600">{selectedDoctor.rating}</p>
                                        <p className="text-sm text-gray-600">Avg. Rating</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <Award className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-purple-600">92%</p>
                                        <p className="text-sm text-gray-600">Patient Satisfaction</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Edit Details
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedDoctor) {
                                            handleDeleteDoctor(selectedDoctor.id);
                                            setSelectedDoctor(null);
                                        }
                                    }}
                                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Remove Doctor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Doctor — Full DoctorRegistration form in a full-screen overlay */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 overflow-y-auto">
                    <div className="relative">
                        {/* Close button floating top-right */}
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="fixed top-4 right-4 z-[60] p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                            title="Close registration form"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <DoctorRegistration
                            onBack={() => setShowAddModal(false)}
                            onSuccess={() => {
                                setShowAddModal(false);
                                toast.success('Doctor registered successfully! Refreshing list...');
                                fetchDoctors();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
