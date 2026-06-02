import { useEffect, useState } from 'react';
import { UserRole } from '../common/types';
import { Users, UserPlus, Clock, CheckCircle, Camera, Calendar, Loader2, AlertCircle, CalendarClock } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface StaffManagementProps {
    userRole: UserRole;
}

interface StaffMember {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    joinDate: string;
    status: 'active' | 'on-leave' | 'inactive';
}

export function StaffManagement({ userRole }: StaffManagementProps) {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        role: 'Receptionist',
        department: 'Front Desk',
        email: '',
        mobile: '',
        status: 'active'
    });
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await clinicService.getStaff();
            const mappedStaff: StaffMember[] = data.map((s: any) => ({
                id: s.id?.toString() || s.staff_id?.toString() || '0',
                name: s.full_name || 'Staff Member',
                role: s.role || 'Personnel',
                department: s.department || 'General',
                email: s.email || '',
                phone: s.mobile || '',
                joinDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A',
                status: (s.status?.toLowerCase() || 'active') as any
            }));
            setStaff(mappedStaff);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError('Failed to load staff directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await clinicService.addStaff(formData);
            setShowAddModal(false);
            setFormData({
                full_name: '',
                role: 'Receptionist',
                department: 'Front Desk',
                email: '',
                mobile: '',
                status: 'active'
            });
            await fetchStaff();
        } catch (err) {
            console.error('Error adding staff:', err);
            alert('Failed to add staff member');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStaff = async (id: string) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await clinicService.deleteStaff(id);
            await fetchStaff();
        } catch (err) {
            console.error('Error deleting staff:', err);
            alert('Failed to remove staff member');
        }
    };

    const presentCount = staff.filter(s => s.status === 'active').length;
    const onLeaveCount = staff.filter(s => s.status === 'on-leave').length;

    if (loading && staff.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading staff directory...</p>
            </div>
        );
    }

    if (error && staff.length === 0) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600">Manage your clinic's medical and administrative staff</p>
                </div>
                {userRole === 'clinic' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Staff Member
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-blue-50">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{staff.length}</p>
                    <p className="text-sm text-gray-600">Total Staff</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-green-50">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                    <p className="text-sm text-gray-600">Active Staff</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-yellow-50">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">--</p>
                    <p className="text-sm text-gray-600">Late Arrivals</p>
                </div>

                <div className="bg-white rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-orange-50">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{onLeaveCount}</p>
                    <p className="text-sm text-gray-600">On Leave</p>
                </div>
            </div>

            {/* Staff Attendance Modalities */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-lg shadow-md">
                        <CalendarClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">Staff Attendance Modalities</h3>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">MVP Options Active</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-4">
                            Configure alternative high-reliability check-in methods. Replaces face recognition to eliminate privacy concerns.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-white border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-gray-900">QR Check-In</p>
                                    <p className="text-[10px] text-gray-500">Scan code via mobile</p>
                                </div>
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
                            </div>
                            
                            <div className="bg-white border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Staff PIN Login</p>
                                    <p className="text-[10px] text-gray-500">4-digit security code</p>
                                </div>
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
                            </div>

                            <div className="bg-white border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Manual Attendance</p>
                                    <p className="text-[10px] text-gray-500">Admin-approved override</p>
                                </div>
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Staff Directory</h3>
                    <p className="text-sm text-gray-600">All registered staff members</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Attendance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {staff.map((s) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.id}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                            <p className="text-xs text-gray-500">{s.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{s.role}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{s.department}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-gray-500 italic">Integration pending</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-700' :
                                            s.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedStaff(s);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Details
                                            </button>
                                            {userRole === 'clinic' && (
                                                <button
                                                    onClick={() => handleDeleteStaff(s.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Add Staff Member</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option>Receptionist</option>
                                            <option>Nurse</option>
                                            <option>Lab Technician</option>
                                            <option>Pharmacist</option>
                                            <option>Helper</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option>Front Desk</option>
                                            <option>General Ward</option>
                                            <option>Emergency</option>
                                            <option>Laboratory</option>
                                            <option>Pharmacy</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="active">Active</option>
                                            <option value="on-leave">On Leave</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                    >
                                        {loading ? 'Adding...' : 'Add Staff'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Details Modal */}
            {showDetailsModal && selectedStaff && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-lg w-full">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Staff Member Details</h2>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-full">
                                    <Users className="w-12 h-12 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedStaff.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedStaff.role} • {selectedStaff.department}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Joining Date</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedStaff.joinDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${selectedStaff.status === 'active' ? 'bg-green-100 text-green-700' :
                                        selectedStaff.status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {selectedStaff.status.charAt(0).toUpperCase() + selectedStaff.status.slice(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                {userRole === 'clinic' && (
                                    <button
                                        onClick={() => {
                                            handleDeleteStaff(selectedStaff.id);
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Remove Staff
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
