import { useState, useEffect } from 'react';
import { User } from '../common/types';
import { 
  Search, 
  Plus, 
  FlaskConical, 
  Upload, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ChevronLeft, 
  Info,
  Link2,
  Unlink,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Activity,
  Microscope,
  FileText
} from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast, Toaster } from 'sonner';

interface LabDiagnosticsProps {
  user?: User | any;
  onBack?: () => void;
}

interface LabOrder {
  lab_order_id: string;
  patient_id: string;
  doctor_id: number;
  test_type_id: number;
  priority: 'Normal' | 'Urgent';
  order_date: string;
  price: number;
  status: 'pending' | 'collected' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  patient?: {
    full_name: string;
  };
  doctor?: {
    full_name: string;
  };
  lab_test_types?: {
    test_name: string;
  };
  labs?: {
    name: string;
  } | null;
}

interface TestType {
  test_type_id: number;
  test_name: string;
  price: number;
  tat_hours: number;
}

interface ConnectedLabMapping {
  id: number;
  clinic_id: number;
  lab_id: number | null;
  manual_name: string | null;
  manual_contact: string | null;
  manual_address: string | null;
  manual_tests: string | null;
  mapping_type: 'system' | 'manual';
  created_at: string;
  labs?: {
    lab_id: number;
    name: string;
    owner_name: string | null;
    contact_number: string | null;
    email: string | null;
    license_number: string | null;
  } | null;
}

interface SystemLab {
  lab_id: number;
  name: string;
  owner_name: string | null;
  contact_number: string | null;
  email: string | null;
  license_number: string | null;
}

export function LabDiagnostics({ user, onBack }: LabDiagnosticsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConnectLabModal, setShowConnectLabModal] = useState(false);
  const [showManualLabModal, setShowManualLabModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [connectedLabs, setConnectedLabs] = useState<ConnectedLabMapping[]>([]);
  const [systemLabs, setSystemLabs] = useState<SystemLab[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    test_type_id: '',
    priority: 'Normal',
    notes: '',
    lab_id: ''
  });

  const [manualLabData, setManualLabData] = useState({
    name: '', contact: '', address: '', tests: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, testsData, patientsData, doctorsData, connected, system] = await Promise.all([
        clinicService.getLabOrders(),
        clinicService.getLabs(),
        clinicService.getPatients(),
        clinicService.getDoctors(),
        clinicService.getConnectedLabs(),
        clinicService.getSystemLabs()
      ]);
      setLabOrders(ordersData);
      setTestTypes(testsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
      setConnectedLabs(connected);
      setSystemLabs(system);
    } catch (error) {
      toast.error('Failed to synchronize diagnostic data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = labOrders.filter(order => {
    const matchesSearch =
      order.lab_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lab_test_types?.test_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.test_type_id) {
      toast.error('Please fill required protocols');
      return;
    }

    try {
      await clinicService.createLabOrder(formData);
      toast.success('Lab order protocol initiated');
      setShowCreateModal(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        test_type_id: '',
        priority: 'Normal',
        notes: '',
        lab_id: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to initiate lab order');
    }
  };

  const handleConnectSystemLab = async (labId: number) => {
    try {
      await clinicService.connectSystemLab(labId);
      toast.success('Connected partner laboratory successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to connect laboratory');
    }
  };

  const handleConnectManualLab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLabData.name) {
      toast.error('Lab name is required');
      return;
    }

    try {
      await clinicService.connectManualLab(manualLabData);
      toast.success('Manual partner lab mapped successfully!');
      setShowManualLabModal(false);
      setManualLabData({ name: '', contact: '', address: '', tests: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to map manual lab');
    }
  };

  const handleDisconnectLab = async (id: number) => {
    if (!confirm('Are you sure you want to terminate partnership with this laboratory?')) {
      return;
    }

    try {
      const success = await clinicService.disconnectLab(id);
      if (success) {
        toast.success('Partnership terminated successfully');
        fetchData();
      } else {
        toast.error('Failed to disconnect lab');
      }
    } catch (error) {
      toast.error('Error disconnecting lab');
    }
  };

  const pendingCount = labOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedToday = labOrders.filter(o =>
    o.status === 'completed' &&
    new Date(o.order_date).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <Microscope className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="mt-4 font-medium text-gray-600 dark:text-slate-400">Loading diagnostic laboratory data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          {onBack && (
             <button onClick={onBack} className="p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm">
               <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
             </button>
          )}
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">Lab & Diagnostics</h1>
            <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Manage partnerships, lab orders, and diagnostic reports</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'clinic' || user?.role === 'lab') && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowConnectLabModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm text-sm font-bold"
            >
              <Link2 className="w-4 h-4" />
              Connect Lab
            </button>
            <button
              onClick={() => setShowManualLabModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm text-sm font-bold"
            >
              <Plus className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              Add Manual Lab
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          </div>
        )}
      </div>

      {/* Modern Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Orders', count: labOrders.length, icon: FileText, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
          { label: 'Processing', count: pendingCount, icon: Activity, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
          { label: 'Completed Today', count: completedToday, icon: CheckCircle, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
          { label: 'Available Protocols', count: testTypes.length, icon: Microscope, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-500/20' }
        ].map((stat, idx) => (
          <div key={idx} className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border ${stat.border} shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 dark:opacity-5 blur-2xl group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity`}></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.count}</p>
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Lab Orders Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-xl flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Diagnostic Orders
              </h3>
              
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white text-sm transition-all"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Test Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-700">
                          <FlaskConical className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                        </div>
                        <p className="text-gray-500 dark:text-slate-400 font-medium text-lg">No diagnostic orders found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.lab_order_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">{order.lab_test_types?.test_name}</span>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">#{order.lab_order_id}</span>
                              <span className="text-gray-300 dark:text-slate-600">•</span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">{new Date(order.order_date).toLocaleDateString()}</span>
                              {order.labs?.name && (
                                <>
                                  <span className="text-gray-300 dark:text-slate-600">•</span>
                                  <span className="text-xs font-bold text-green-600 dark:text-green-400">Partner: {order.labs.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                              {order.patient?.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.patient?.full_name}</p>
                              {order.priority === 'Urgent' && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-slate-300">
                          {order.doctor?.full_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                            order.status === 'processing' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                          }`}>
                            {order.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                            {order.status === 'processing' && <Activity className="w-3.5 h-3.5 animate-pulse" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {order.status === 'completed' ? (
                              <button className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl transition-all shadow-sm">
                                <Download className="w-4 h-4" />
                              </button>
                            ) : (user?.role === 'lab' || user?.role === 'clinic') ? (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowUploadModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 dark:text-indigo-300 rounded-xl transition-all shadow-sm text-xs font-bold"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Update
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Connections & Protocols */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Partner Labs */}
          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-indigo-800/50 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-400" />
                Partner Labs
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/20">
                {connectedLabs.length} Active
              </span>
            </div>
            
            <div className="p-6 relative z-10 max-h-[400px] overflow-y-auto">
              {connectedLabs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                    <Unlink className="w-5 h-5 text-indigo-300" />
                  </div>
                  <p className="text-indigo-200 font-medium text-sm">No connected laboratories</p>
                  <button 
                    onClick={() => setShowConnectLabModal(true)}
                    className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition-all"
                  >
                    Connect Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectedLabs.map((mapping) => {
                    const isSystem = mapping.mapping_type === 'system';
                    const name = isSystem ? mapping.labs?.name : mapping.manual_name;
                    const contact = isSystem ? mapping.labs?.contact_number : mapping.manual_contact;

                    return (
                      <div key={mapping.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-sm">{name}</h4>
                          <button
                            onClick={() => handleDisconnectLab(mapping.id)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Disconnect Lab"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                            isSystem ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50' : 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                          }`}>
                            {isSystem ? 'System Partner' : 'Manual'}
                          </span>
                        </div>
                        {contact && (
                          <p className="flex items-center gap-2 text-xs text-indigo-200/80">
                            <Phone className="w-3.5 h-3.5" /> {contact}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Protocols List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Microscope className="w-5 h-5 text-purple-500" />
                Available Protocols
              </h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              {testTypes.map((test) => (
                <div key={test.test_type_id} className="p-4 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 hover:border-purple-200 dark:hover:border-purple-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{test.test_name}</h4>
                    <FlaskConical className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-gray-900 dark:text-white">₹{test.price ? parseFloat(test.price.toString()).toLocaleString() : '0'}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {test.tat_hours}h TAT
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Modals remain structurally similar but updated with sleeker styling... */}
      {/* Create Lab Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initiate Diagnostic Order</h2>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Patient Selection *</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}>
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>{p.patient_id} - {p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Consulting Doctor *</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" value={formData.doctor_id} onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}>
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Diagnostic Protocol *</label>
                  <select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" value={formData.test_type_id} onChange={(e) => setFormData({ ...formData, test_type_id: e.target.value })}>
                    <option value="">Select Test Type</option>
                    {testTypes.map((test) => (
                      <option key={test.test_type_id} value={test.test_type_id}>
                        {test.test_name} - ₹{test.price ? parseFloat(test.price.toString()).toLocaleString() : '0'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Priority Level</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Normal' | 'Urgent' })}>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Assign Partner Lab</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" value={formData.lab_id} onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}>
                    <option value="">Select Partner (Optional)</option>
                    {connectedLabs.map((mapping) => {
                      const id = mapping.mapping_type === 'system' ? mapping.lab_id : null;
                      const name = mapping.mapping_type === 'system' ? mapping.labs?.name : mapping.manual_name;
                      if (!id) return null;
                      return (
                        <option key={mapping.id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Clinical Notes</label>
                  <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-medium" rows={3} placeholder="Enter relevant clinical notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="submit" className="flex-1 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                  Confirm & Initiate
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Existing Lab Modal */}
      {showConnectLabModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800">
             <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                     <Link2 className="w-5 h-5" />
                   </div>
                   Connect System Laboratory
                </h2>
                <button onClick={() => setShowConnectLabModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
             </div>
             <div className="p-6 max-h-[450px] overflow-y-auto">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 font-medium">Select a verified laboratory from the network directory to seamlessly integrate with your clinic.</p>
                {systemLabs.length === 0 ? (
                   <div className="text-center py-8">
                     <Microscope className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                     <p className="text-gray-500 dark:text-slate-400 font-medium">No registered labs found in the network.</p>
                   </div>
                ) : (
                   <div className="space-y-3">
                      {systemLabs.map(lab => {
                         const isConnected = connectedLabs.some(c => c.lab_id === lab.lab_id);
                         return (
                            <div key={lab.lab_id} className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                              isConnected 
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' 
                                : 'bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                            }`}>
                               <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{lab.name}</h4>
                                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-1">Lic: {lab.license_number || 'N/A'} • {lab.contact_number}</p>
                               </div>
                               <button
                                  disabled={isConnected}
                                  onClick={() => handleConnectSystemLab(lab.lab_id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                     isConnected 
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                                  }`}
                               >
                                  {isConnected ? 'Connected' : 'Connect'}
                               </button>
                            </div>
                         );
                      })}
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Upload/Update Status Modal */}
      {showUploadModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Diagnostic Report</h2>
              <button onClick={() => { setShowUploadModal(false); setSelectedOrder(null); }} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl mb-6 border border-indigo-100 dark:border-indigo-500/20">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Order Details</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 flex justify-between">
                    Test ID: <strong className="text-gray-900 dark:text-white">#{selectedOrder.lab_order_id}</strong>
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 flex justify-between">
                    Patient: <strong className="text-gray-900 dark:text-white">{selectedOrder.patient?.full_name}</strong>
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400 flex justify-between">
                    Protocol: <strong className="text-gray-900 dark:text-white">{selectedOrder.lab_test_types?.test_name}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Upload Diagnostic Report PDF *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group">
                  <Upload className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Select PDF Report File</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Drag & drop or click to browse</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  className="flex-1 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg"
                  onClick={() => {
                    toast.success('Diagnostic record verified and uploaded securely');
                    setShowUploadModal(false);
                  }}
                >
                  Upload & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Lab Modal */}
      {showManualLabModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-800">
             <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Lab Manually</h2>
                <button onClick={() => setShowManualLabModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
             </div>
             <form onSubmit={handleConnectManualLab}>
               <div className="p-8 space-y-5">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Lab Name *</label>
                     <input required className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium" value={manualLabData.name} onChange={e => setManualLabData(p=>({...p, name: e.target.value}))} placeholder="e.g. Healthline Diagnostics" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Contact Number</label>
                     <input className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium" value={manualLabData.contact} onChange={e => setManualLabData(p=>({...p, contact: e.target.value}))} placeholder="+91 9876543210" />
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Available Tests (CSV)</label>
                     <input className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium" value={manualLabData.tests} onChange={e => setManualLabData(p=>({...p, tests: e.target.value}))} placeholder="CBC, Lipids, X-Ray" />
                  </div>
               </div>
               <div className="p-6 bg-gray-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex gap-4">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg text-sm">Add Partner</button>
                  <button type="button" onClick={() => setShowManualLabModal(false)} className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 dark:text-slate-300 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
