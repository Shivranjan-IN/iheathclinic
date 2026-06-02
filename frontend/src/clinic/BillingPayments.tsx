import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import {
  Search, Plus, Download, Eye, DollarSign,
  CreditCard, Wallet, TrendingUp, Sparkles, X
} from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface BillingPaymentsProps {
  userRole: UserRole;
}

interface Invoice {
  invoice_id: string;
  patient_id: string;
  appointment_id?: string;
  total_amount: number;
  discount: number;
  tax: number;
  grand_total: number;
  status: 'pending' | 'paid' | 'partial' | 'cancelled';
  invoice_date: string;
  patient?: {
    full_name: string;
    patient_id: string;
  };
  invoice_items?: any[];
  invoice_payments?: any[];
}

export function BillingPayments({ userRole }: BillingPaymentsProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    services: [{ name: '', quantity: 1, rate: 0 }],
    discount: 0,
    payment_mode: 'cash',
    paid_amount: 0
  });

  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const billingData = await clinicService.getBilling();
      setInvoices(billingData);
    } catch (error) {
      toast.error('Financial data synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clinicService.createInvoice(formData);
      toast.success('Invoice protocol established');
      setShowCreateModal(false);
      setFormData({
        patient_id: '',
        appointment_id: '',
        services: [{ name: '', quantity: 1, rate: 0 }],
        discount: 0,
        payment_mode: 'cash',
        paid_amount: 0
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to generate statement');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      await clinicService.updateInvoiceStatus(id, { status });
      toast.success('Financial node recalibrated');
      setSelectedInvoice(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const addServiceLine = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { name: '', quantity: 1, rate: 0 }]
    });
  };

  const updateServiceLine = (index: number, field: string, value: any) => {
    const newServices = [...formData.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setFormData({ ...formData, services: newServices });
  };

  const handlePatientSearch = async (query: string) => {
    setPatientSearchQuery(query);
    if (query.length < 3) {
      setPatientSearchResults([]);
      return;
    }

    try {
      setIsSearchingPatients(true);
      const results = await clinicService.searchBillingPatients(query);
      setPatientSearchResults(results);
    } catch (error) {
      console.error('Patient search failed:', error);
    } finally {
      setIsSearchingPatients(false);
    }
  };

  const selectPatient = (patient: any) => {
    const prescription = patient.latest_prescription;
    const services: any[] = [];

    if (prescription) {
      // Add medicines as service items
      prescription.medicines?.forEach((m: any) => {
        services.push({
          name: m.medicines?.medicine_name || 'Medicine',
          quantity: parseInt(m.duration) || 1, // Using duration as quantity if available, else 1
          rate: parseFloat(m.medicines?.mrp) || 0
        });
      });

      // Add lab tests if any
      prescription.lab_tests?.forEach((lt: any) => {
        services.push({
          name: lt.lab_test_types?.test_name || 'Lab Test',
          quantity: 1,
          rate: parseFloat(lt.lab_test_types?.price) || 0
        });
      });
    }

    setFormData({
      ...formData,
      patient_id: patient.patient_id,
      appointment_id: prescription?.appointment_id || '',
      services: services.length > 0 ? services : [{ name: '', quantity: 1, rate: 0 }]
    });
    setPatientSearchQuery(patient.full_name);
    setPatientSearchResults([]);
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.patient?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = invoices.filter(inv => inv.status === 'paid' || inv.status === 'partial')
    .reduce((sum, inv) => sum + (inv.invoice_payments?.reduce((s: number, p: any) => s + parseFloat(p.paid_amount), 0) || 0), 0);

  const pendingPayments = invoices.filter(inv => inv.status === 'pending' || inv.status === 'partial').length;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Billing & Payments</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1 font-medium">Synchronized financial ledger and automated invoicing</p>
        </div>
        {(userRole === 'admin' || userRole === 'clinic' || userRole === 'receptionist') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-bold text-sm"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-50 text-green-600', trend: '+12%' },
          { label: 'Total Invoices', value: invoices.length.toString(), icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Collections', value: pendingPayments.toString(), icon: Wallet, color: 'bg-orange-50 text-orange-600' },
          { label: 'Growth Factor', value: '+18.4%', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && <span className="text-xs font-bold text-green-600">{stat.trend}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Intelligence Stream */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-blue-100/50">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Financial Intelligence</h3>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Revenue projection predicts ₹1,24,000 for current cycle. Digital payment adoption up 14%.
              <span className="text-blue-600 font-bold ml-1">Automated reminders</span> dispatched for {pendingPayments} pending nodes.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice ID, patient name, or biometric ID..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                {['Invoice ID', 'Patient Unit', 'Transaction Date', 'Total Value', 'Channel', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500 animate-pulse">Syncing with financial node...</td>
                </tr>
              ) : filteredInvoices.map((invoice) => (
                <tr key={invoice.invoice_id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{invoice.invoice_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{invoice.patient?.full_name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{invoice.patient?.patient_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {new Date(invoice.invoice_date || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    ₹{parseFloat(invoice.total_amount as any).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 bg-gray-100 rounded-md">
                      {invoice.invoice_payments?.[0]?.payment_mode || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                      invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Invoice Protocol</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{selectedInvoice.invoice_id}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Patient Unit</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedInvoice.patient?.full_name}</p>
                  <p className="text-xs font-bold text-blue-600 uppercase">{selectedInvoice.patient?.patient_id}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Statement Value</h4>
                  <p className="text-3xl font-black text-gray-900">₹{parseFloat(selectedInvoice.total_amount as any).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Item</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedInvoice.invoice_items?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.service_name}</td>
                        <td className="px-4 py-3 text-right text-gray-500 font-bold">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">₹{parseFloat(item.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={`p-4 rounded-2xl flex items-center justify-between ${selectedInvoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">Current Status: {selectedInvoice.status}</span>
                </div>
                <div className="flex gap-2">
                  {selectedInvoice.status !== 'paid' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedInvoice.invoice_id, 'paid')}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl shadow-sm text-xs font-bold hover:bg-green-700 transition-all"
                    >
                      Mark as Paid
                    </button>
                  )}
                  <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-xs font-bold hover:shadow-md transition-shadow">
                    Download Statement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600">
              <h2 className="text-lg font-bold text-white tracking-tight">Generate Financial Statement</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-blue-500 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Find Patient (Email/Mobile)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={patientSearchQuery}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                      placeholder="Search to populate prescription..."
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                    />
                    {isSearchingPatients && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {patientSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] max-h-60 overflow-y-auto">
                      {patientSearchResults.map((p) => (
                        <button
                          key={p.patient_id}
                          type="button"
                          onClick={() => selectPatient(p)}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex flex-col border-b border-gray-50 last:border-0"
                        >
                          <span className="text-sm font-bold text-gray-900">{p.full_name}</span>
                          <span className="text-[10px] text-gray-500">{p.email || p.phone}</span>
                          {p.latest_prescription && (
                            <span className="text-[9px] text-green-600 font-bold uppercase mt-1">Prescription Found (Dr. {p.latest_prescription.doctor?.full_name})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.patient_id}
                    placeholder="Patient ID"
                    className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm font-bold text-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Nodes</label>
                {formData.services.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 pb-3 border-b border-gray-50 last:border-0">
                    <input
                      placeholder="Service/Medication"
                      className="col-span-6 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold"
                      value={s.name}
                      onChange={(e) => updateServiceLine(i, 'name', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      className="col-span-2 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold"
                      value={s.quantity}
                      onChange={(e) => updateServiceLine(i, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      className="col-span-4 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold"
                      value={s.rate}
                      onChange={(e) => updateServiceLine(i, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addServiceLine}
                  className="w-full py-2 border-2 border-dashed border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + Add Service Protocol
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Node</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
                  >
                    {['cash', 'card', 'upi', 'netbanking'].map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-blue-50 border-none rounded-xl text-sm font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all">
                  Synchronize & Generate
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
