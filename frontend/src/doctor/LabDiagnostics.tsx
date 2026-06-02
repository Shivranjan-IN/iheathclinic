import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import {
    TestTube,
    Search,
    Plus,
    Eye,
    Download,
    Calendar,
    User,
    AlertCircle,
    CheckCircle,
    Clock,
    X,
    Activity
} from 'lucide-react';
import labService from '../services/labService';
import { doctorService } from '../services/doctorService';

interface LabDiagnosticsProps {
    userRole: UserRole;
    doctorName?: string;
}

export function LabDiagnostics({ userRole, doctorName }: LabDiagnosticsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Remote data states
    const [labTests, setLabTests] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [testTypes, setTestTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal & Selection states
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    
    // New Order Form state
    const [newOrder, setNewOrder] = useState({
        patient_id: '',
        patientName: '',
        testType: 'Hematology',
        testName: '',
        priority: 'Normal',
        order_date: new Date().toISOString().split('T')[0],
        notes: '',
        price: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, patientsRes, testTypesRes] = await Promise.all([
                labService.getLabOrders(),
                doctorService.getDoctorPatients('WithAppointments'),
                labService.getTestTypes()
            ]);
            setLabTests(ordersRes || []);
            setPatients(patientsRes || []);
            setTestTypes(testTypesRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value;
        const patient = patients.find(p => p.patient_id === patientId);
        
        setNewOrder({
            ...newOrder,
            patient_id: patientId,
            patientName: patient ? patient.full_name : ''
        });
    };

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newOrder.patient_id || !newOrder.testName) {
            alert("Please fill required fields (Patient, Test Name).");
            return;
        }

        try {
            // Find test_type_id if it exists in testTypes
            const testTypeObj = testTypes.find(t => t.test_name === newOrder.testName);

            await labService.createLabOrder({
                patient_id: newOrder.patient_id,
                test_name: newOrder.testName,
                test_type: newOrder.testType, // Added test_type
                priority: newOrder.priority,
                order_date: newOrder.order_date,
                notes: newOrder.notes,
                price: newOrder.price,
                test_type_id: testTypeObj?.test_type_id || null, stage: 'ORDERED',
                doctor_id: null // handled by backend from token automatically
            });
            setShowOrderModal(false);
            setNewOrder({
                patient_id: '',
                patientName: '',
                testType: 'Hematology',
                testName: '',
                priority: 'Normal',
                order_date: new Date().toISOString().split('T')[0],
                notes: '',
                price: 0
            });
            fetchData();
        } catch (error) {
            console.error('Failed to submit order', error);
            alert("Failed to submit lab order. Check console for details.");
        }
    };

    const filteredTests = labTests.filter(test => {
        const testName = test.test_name || test.lab_test_types?.test_name || '';
        const matchesSearch = 
            (test.patient?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (test.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (testName.toLowerCase()).includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (test.status?.toLowerCase() || '') === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const canOrder = userRole === 'doctor' || userRole === 'admin';

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || '';
        if (s === 'completed') return 'bg-green-100 text-green-700';
        if (s === 'processing' || s === 'in-progress') return 'bg-blue-100 text-blue-700';
        if (s === 'pending') return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lab Diagnostics – Manage Lab Tests and View Results</h1>
                    <p className="text-gray-600">Optimize your medical workflow and track patient diagnostics in real-time.</p>
                </div>
                {canOrder && (
                    <button
                        onClick={() => setShowOrderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Order Test
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by patient, test name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium text-gray-700"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Clock className="w-6 h-6 text-yellow-600" />} 
                    bg="bg-yellow-50" 
                    count={labTests.filter(t => t.status?.toLowerCase() === 'pending').length} 
                    label="Pending" 
                />
                <StatCard 
                    icon={<Activity className="w-6 h-6 text-blue-600" />} 
                    bg="bg-blue-50" 
                    count={labTests.filter(t => t.status?.toLowerCase() === 'processing').length} 
                    label="Processing" 
                />
                <StatCard 
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
                    bg="bg-green-50" 
                    count={labTests.filter(t => t.status?.toLowerCase() === 'completed').length} 
                    label="Completed" 
                />
                <StatCard 
                    icon={<AlertCircle className="w-6 h-6 text-red-600" />} 
                    bg="bg-red-50" 
                    count={labTests.filter(t => (t.priority?.toLowerCase() || '') === 'urgent' || (t.priority?.toLowerCase() || '') === 'stat').length} 
                    label="Urgent" 
                />
            </div>

            {/* Test List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Details</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 font-medium">Loading records...</p>
                                    </td>
                                </tr>
                            ) : filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                                        No laboratory orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.lab_order_id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                                    <User className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{test.patient?.full_name || 'Unknown Patient'}</p>
                                                    <p className="text-xs font-medium text-gray-500">ID: {test.patient_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <TestTube className="w-4 h-4 text-purple-600 shrink-0" />
                                                    <span className="text-sm font-bold text-gray-900">{test.test_name || test.lab_test_types?.test_name || 'N/A'}</span>
                                                </div>
                                                <p className="text-xs font-medium text-gray-500 mt-1 pl-6">Lab ID: {test.lab_order_id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                {test.order_date ? new Date(test.order_date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                                                    (test.priority?.toLowerCase() || '') === 'stat' ? 'bg-red-100 text-red-700' :
                                                    (test.priority?.toLowerCase() || '') === 'urgent' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {(test.priority || 'Normal').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(test.status)}`}>
                                                {test.status?.toLowerCase() === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                                                {test.status?.toLowerCase() === 'processing' && <Activity className="w-3.5 h-3.5" />}
                                                {test.status?.toLowerCase() === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                                {test.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedTest(test)}
                                                    className="p-2 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-xl transition-colors shadow-sm"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {test.status?.toLowerCase() === 'completed' && (
                                                    <button
                                                        className="p-2 text-green-600 bg-green-50 border border-green-100 hover:bg-green-600 hover:text-white rounded-xl transition-colors shadow-sm"
                                                        title="Download Report"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Test Details Modal */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <TestTube className="w-5 h-5" />
                                    Lab Test Record
                                </h2>
                                <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mt-1">Ref ID: {selectedTest.lab_order_id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedTest(null)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-8">
                            
                            {/* Patient Info Row */}
                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Name</p>
                                        <p className="font-bold text-gray-900">{selectedTest.patient?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient ID</p>
                                        <p className="font-bold text-gray-900">{selectedTest.patient_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordered By</p>
                                        <p className="font-bold text-gray-900">{selectedTest.doctor?.full_name || doctorName || 'Doctor'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                                        <p className="font-bold text-gray-900">{selectedTest.order_date ? new Date(selectedTest.order_date).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Test Info */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-purple-600" />
                                    Test Diagnostics
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailCard label="Test Name" value={selectedTest.test_name || selectedTest.lab_test_types?.test_name || 'N/A'} />
                                    <DetailCard label="Priority" value={(selectedTest.priority || 'Normal').toUpperCase()} highlight={selectedTest.priority?.toLowerCase() === 'stat' || selectedTest.priority?.toLowerCase() === 'urgent'} />
                                    <DetailCard label="Status" value={selectedTest.status || 'Pending'} highlight={selectedTest.status?.toLowerCase() === 'completed'} />
                                    <DetailCard label="Price" value={selectedTest.price ? `$${selectedTest.price}` : 'N/A'} />
                                </div>
                            </div>

                            {selectedTest.notes && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-blue-500" />
                                        Clinical Notes
                                    </h4>
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-gray-700 italic text-sm">
                                        {selectedTest.notes}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-4">
                            {selectedTest.status?.toLowerCase() === 'completed' && (
                                <button className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-md flex items-center justify-center gap-2 transition-all">
                                    <Download className="w-5 h-5" />
                                    Download Report
                                </button>
                            )}
                            <button 
                                onClick={() => setSelectedTest(null)}
                                className={`py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all ${selectedTest.status?.toLowerCase() === 'completed' ? 'px-8' : 'flex-1'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Test Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white text-gray-900">
                            <h2 className="text-xl font-bold">Order Lab Test</h2>
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="p-2 hover:bg-gray-100 text-gray-500 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 bg-gray-50">
                            <form onSubmit={handleOrderSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 object-left">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Patient</label>
                                        <select 
                                            required
                                            value={newOrder.patient_id} 
                                            onChange={handlePatientChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium"
                                        >
                                            <option value="" disabled>Select a Patient...</option>
                                            {patients.map(p => (
                                                <option key={p.patient_id} value={p.patient_id}>{p.full_name} ({p.patient_id})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Patient ID (Auto)</label>
                                        <input 
                                            type="text" 
                                            disabled 
                                            value={newOrder.patient_id}
                                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Test Type</label>
                                        <select 
                                            value={newOrder.testType}
                                            onChange={(e) => setNewOrder({...newOrder, testType: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium"
                                        >
                                            <option value="Hematology">Hematology</option>
                                            <option value="Biochemistry">Biochemistry</option>
                                            <option value="Microbiology">Microbiology</option>
                                            <option value="Immunology">Immunology</option>
                                            <option value="Pathology">Pathology</option>
                                            <option value="Radiology">Radiology</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Test Name</label>
                                        <div className="relative group">
                                            <input 
                                                list="test-name-list"
                                                required
                                                placeholder="e.g. Complete Blood Count – CBC"
                                                value={newOrder.testName}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const selected = testTypes.find(t => t.test_name === val);
                                                    setNewOrder({
                                                        ...newOrder, 
                                                        testName: val,
                                                        price: selected ? Number(selected.price) : 0
                                                    });
                                                }}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium" 
                                            />
                                            <datalist id="test-name-list">
                                                {testTypes.length > 0 ? (
                                                    testTypes.map((t, idx) => (
                                                        <option key={idx} value={t.test_name} />
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="Complete Blood Count – CBC" />
                                                        <option value="Liver Function Test - LFT" />
                                                        <option value="Renal Function Test - RFT" />
                                                        <option value="Lipid Profile" />
                                                        <option value="Blood Glucose (Fasting)" />
                                                        <option value="Thyroid Profile (T3, T4, TSH)" />
                                                    </>
                                                )}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Priority</label>
                                        <select 
                                            value={newOrder.priority}
                                            onChange={(e) => setNewOrder({...newOrder, priority: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium"
                                        >
                                            <option value="Normal">Normal</option>
                                            <option value="Urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Collection Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={newOrder.order_date}
                                            onChange={(e) => setNewOrder({...newOrder, order_date: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Clinical Notes</label>
                                    <textarea 
                                        rows={3} 
                                        value={newOrder.notes}
                                        onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm font-medium resize-none cursor-text"
                                        placeholder="Add any specific instructions or clinical context..."
                                    ></textarea>
                                </div>
                                <div className="flex gap-4 pt-4 border-t border-gray-200">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowOrderModal(false);
                                            setNewOrder({
                                                patient_id: '',
                                                patientName: '',
                                                testType: 'Hematology',
                                                testName: '',
                                                priority: 'Normal',
                                                order_date: new Date().toISOString().split('T')[0],
                                                notes: '',
                                                price: 0
                                            });
                                        }}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                        Order Test
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

function StatCard({ icon, count, label, bg }: { icon: React.ReactNode, count: number, label: string, bg: string }) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-black text-gray-900 leading-none">{count}</p>
                <p className="text-sm font-bold text-gray-500 mt-1">{label}</p>
            </div>
        </div>
    );
}

function DetailCard({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
}
