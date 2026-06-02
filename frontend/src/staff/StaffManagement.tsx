import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { Users, UserPlus, Clock, CheckCircle, XCircle, Camera, Calendar, Mail, Phone, Trash2, MoreVertical, Loader2, Search, Filter, Sparkles, ArrowLeft } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface StaffManagementProps {
  user?: any;
  onBack?: () => void;
}

interface StaffMember {
  id: number;
  full_name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  created_at: string;
  is_active: boolean;
  // Metadata for UI
  performance?: {
    tasksCompleted: number;
    rating: number;
  };
}

export function StaffManagement({ user, onBack }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.role?.toLowerCase() as UserRole;

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'Receptionist',
    department: 'Front Desk'
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await clinicService.getStaff();
      setStaffList(data);
    } catch (error) {
      toast.error('Failed to load staff records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await clinicService.addStaff(formData);
      toast.success('New staff member archived in registry');
      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'Receptionist',
        department: 'Front Desk'
      });
      fetchStaff();
    } catch (error) {
      toast.error('Failed to archive staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to decommission this staff unit?')) return;
    try {
      await clinicService.deleteStaff(id);
      toast.success('Staff unit decommissioned');
      fetchStaff();
    } catch (error) {
      toast.error('Decommissioning failed');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await clinicService.updateStaff(id, { is_active: !currentStatus });
      toast.success(`Staff status recalibrated to ${!currentStatus ? 'Active' : 'Inactive'}`);
      fetchStaff();
    } catch (error) {
      toast.error('Status recalibration failed');
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = staffList.filter(s => s.is_active).length;
  const onLeaveCount = staffList.filter(s => !s.is_active).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Personnel Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {onBack && (
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-all mb-2"
        >
          <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Command Center</span>
        </button>
      )}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Personnel Command
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded-full border border-blue-200">System Live</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Synchronizing clinic staff hierarchy and operational status.</p>
        </div>
        {userRole === 'clinic' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="group flex items-center gap-3 px-6 py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 hover:-translate-y-1 active:translate-y-0"
          >
            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Enlist Staff</span>
          </button>
        )}
      </div>

      {/* Industrial Analytics Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-blue-500 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-[1.5rem] bg-blue-50 group-hover:bg-blue-600 transition-colors">
              <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <Sparkles className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{staffList.length}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Active Registry</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-emerald-500 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-[1.5rem] bg-emerald-50 group-hover:bg-emerald-600 transition-colors">
              <CheckCircle className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">{activeCount}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Operational Status</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-amber-500 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-[1.5rem] bg-amber-50 group-hover:bg-amber-600 transition-colors">
              <Clock className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-black text-amber-600 tracking-tighter">04</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Shift Overlap</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all border-b-4 border-b-rose-500 group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded-[1.5rem] bg-rose-50 group-hover:bg-rose-600 transition-colors">
              <Calendar className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-4xl font-black text-rose-600 tracking-tighter">{onLeaveCount}</p>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Offline/Leave</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Query Registry (Name, Role, Dept)..."
            className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-sm font-bold placeholder:text-gray-400"
          />
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-all font-bold text-xs uppercase tracking-widest border border-gray-100">
          <Filter className="w-4 h-4" />
          Global Filters
        </button>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div key={staff.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  {staff.full_name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${staff.is_active ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
                    {staff.is_active ? 'Operational' : 'Decommissioned'}
                  </span>
                  <div className="flex gap-1">
                     <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="p-2.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                        title="Decommission Staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    <button 
                      onClick={() => handleToggleStatus(staff.id, staff.is_active)}
                      className={`p-2.5 rounded-xl transition-all ${staff.is_active ? 'text-amber-400 hover:bg-amber-50 hover:text-amber-600' : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      title={staff.is_active ? "Mark Inactive" : "Mark Active"}
                    >
                      {staff.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{staff.full_name}</h3>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{staff.role}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wider">{staff.department}</span>
                  <span>•</span>
                  <span>Unit {staff.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t border-gray-50 pt-8 mt-2">
                <div className="flex items-center gap-4 group/item">
                  <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-blue-50 transition-colors">
                    <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="p-2 bg-gray-50 rounded-xl group-hover/item:bg-blue-50 transition-colors">
                    <Phone className="w-4 h-4 text-gray-400 group-hover/item:text-blue-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-600">{staff.phone}</span>
                </div>
              </div>
            </div>

            {/* Matrix Decorative Overlay */}
            <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none font-black text-6xl italic transform rotate-12 -mr-4 -mb-4 uppercase select-none">
              {staff.department}
            </div>
          </div>
        ))}
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="p-6 bg-white rounded-3xl shadow-sm mb-6">
               <Users className="w-16 h-16 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Personnel Not Found</h3>
            <p className="text-gray-500 text-sm max-w-xs mt-2 uppercase tracking-widest font-bold">Registry query returned zero matches for current sector</p>
          </div>
        )}
      </div>

      {/* Enlistment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl overflow-hidden border border-white/20">
            <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-900 text-white">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/30">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Registry Enlistment</h2>
                  <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase opacity-70">Unit Deployment Protocol</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors backdrop-blur-md border border-white/5"
              >
                <XCircle className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="p-12">
              <form onSubmit={handleAddStaff} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 group">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block group-focus-within:text-blue-500 transition-colors">Personnel Identity (Full Name)</label>
                    <input
                      required
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="e.g. MARCUS AURELIUS"
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500/50 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Command Assignment (Role)</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500/50 outline-none transition-all font-bold text-gray-900"
                    >
                      <option>Receptionist</option>
                      <option>Nurse</option>
                      <option>Lab Technician</option>
                      <option>Pharmacist</option>
                      <option>Helper</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Operational Sector (Dept)</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500/50 outline-none transition-all font-bold text-gray-900"
                    >
                      <option>Front Desk</option>
                      <option>General Ward</option>
                      <option>Emergency</option>
                      <option>Laboratory</option>
                      <option>Pharmacy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Signal Address (Email)</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="hq@command.med"
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500/50 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Communication Link (Phone)</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91-0000-000-000"
                      className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500/50 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-6 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-blue-200 transform hover:-translate-y-1 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Archiving Hub Data...' : 'Finalize Enlistment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-10 py-6 bg-gray-100 text-gray-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-gray-200 transition-all font-bold"
                  >
                    Abort
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
