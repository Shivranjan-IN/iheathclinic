import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Mail, Phone, 
  Award, Trash2, Edit, CheckCircle, 
  MoreVertical, RefreshCw, ArrowLeft
} from 'lucide-react';
import { doctorService, Doctor } from '../services/doctorService';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';
import { X, Save } from 'lucide-react';

interface DoctorManagementProps {
  user: any;
  onNavigate: (view: any) => void;
  onBack: () => void;
}

export function DoctorManagement({ user, onNavigate, onBack }: DoctorManagementProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  useEffect(() => {
    fetchDoctors();
  }, [user.clinic_id]);

  const fetchDoctors = async () => {
    if (!user?.clinic_id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await doctorService.getDoctors({ clinic_id: user.clinic_id });
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching clinic doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId: number) => {
    if (!window.confirm('Are you sure you want to remove this doctor from your clinic registry?')) return;
    try {
      const success = await clinicService.removeDoctor(doctorId);
      if (success) {
        toast.success('Doctor removed from registration');
        fetchDoctors();
      } else {
        toast.error('Failed to remove doctor');
      }
    } catch (error) {
      toast.error('Error during decommissioning');
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setEditFormData({
      fullName: doctor.full_name,
      specialization: doctor.specialization,
      qualification: doctor.qualifications,
      experience: doctor.experience_years,
      mciReg: doctor.medical_council_reg_no,
      bio: doctor.bio || '',
      gender: doctor.gender || 'Male',
      dob: doctor.date_of_birth ? new Date(doctor.date_of_birth).toISOString().split('T')[0] : ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    setLoading(true);
    try {
      const success = await clinicService.updateDoctor(editingDoctor.id, editFormData);
      if (success) {
        toast.success('Medical credentials recalibrated successfully');
        setIsEditModalOpen(false);
        fetchDoctors();
      } else {
        toast.error('Validation failure on profile update');
      }
    } catch (error) {
      toast.error('Strategic failure during update synchronization');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.specialization && doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm md:hidden"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              Clinic Doctor Management
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">
              Manage doctors associated with your clinic
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('clinic-register-doctor')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95 group"
          >
            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Register New Doctor
          </button>
          <button 
            onClick={fetchDoctors}
            className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total Doctors</p>
            <p className="text-2xl font-black text-gray-900">{doctors.length}</p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-green-50 border border-green-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Active Now</p>
            <p className="text-2xl font-black text-gray-900">
               {doctors.filter(d => ['verified', 'complete'].includes(d.verification_status?.toLowerCase())).length}
            </p>
          </div>
        </div>
        <div className="p-6 rounded-3xl bg-orange-50 border border-orange-100 flex items-center gap-4 md:col-span-2">
            <p className="text-sm font-medium text-orange-800">
              Note: Doctors registered by clinic will have "PENDING" status until their first login and document verification.
            </p>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, or doctor ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold animate-pulse tracking-widest text-xs uppercase">Fetching Roster...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-gray-400 gap-4">
            <Users className="w-16 h-16 opacity-10" />
            <p className="font-bold text-lg">No medical professionals found</p>
            <p className="text-sm">Try adjusting your search or register a new doctor.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Medical Professional</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-blue-700 text-lg font-black shadow-inner border border-blue-200">
                          {doctor.full_name[0]}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                          ['verified', 'complete'].includes(doctor.verification_status?.toLowerCase()) ? 'bg-green-500' : 'bg-orange-400'
                        }`}></div>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 group-hover:text-blue-700 transition-colors uppercase text-sm tracking-tight">{doctor.full_name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{doctor.qualifications || 'Qual. Pending'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-gray-700 capitalize">{doctor.specialization || 'General Physician'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {doctor.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium tracking-tight">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {doctor.mobile || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${
                      ['verified', 'complete'].includes(doctor.verification_status?.toLowerCase())
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {['verified', 'complete'].includes(doctor.verification_status?.toLowerCase()) ? <CheckCircle className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                      {doctor.verification_status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase flex flex-col">
                        <span>Reg No:</span>
                        <span className="text-gray-900 font-black">{doctor.medical_council_reg_no || 'TBD'}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(doctor)}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all border border-gray-100 group-hover:border-blue-200 shadow-sm"
                        title="Modify Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doctor.id)}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all border border-gray-100 group-hover:border-red-200 shadow-sm"
                        title="Decommission Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-all border border-gray-100 shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Edit Modal */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Recalibrate Profile</h2>
                <p className="text-blue-100 mt-1 font-medium">Updating credentials for {editingDoctor?.full_name}</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input
                    required
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Specialization</label>
                  <select
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
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
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Qualification</label>
                  <input
                    required
                    type="text"
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({...editFormData, qualification: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editFormData.experience}
                    onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">MCI/Reg Number</label>
                  <input
                    required
                    type="text"
                    value={editFormData.mciReg}
                    onChange={(e) => setEditFormData({...editFormData, mciReg: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dob}
                    onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Bio / Background</label>
                  <textarea
                    rows={2}
                    value={editFormData.bio}
                    onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-[1.5rem] font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  ABORT CHANGES
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  SYNC CREDENTIALS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
