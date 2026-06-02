import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { Search, FileText, Download, Eye, Upload, Sparkles, Loader2, X } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface PrescriptionRecordsProps {
  userRole: UserRole;
}




export function PrescriptionRecords({ userRole }: PrescriptionRecordsProps) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const data = await clinicService.getPrescriptions();
        setPrescriptions(data);
      } catch (error) {
        toast.error('Failed to load clinic prescriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.prescription_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Synchronizing medical records...</p>
      </div>
    );
  }

  if (prescriptions.length === 0 && !searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registry is Clear</h2>
        <p className="text-gray-500 max-w-sm text-center">No prescriptions have been recorded by clinic doctors yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription & Medical Records</h1>
          <p className="text-gray-600">View and manage patient prescriptions from your doctors</p>
        </div>
        {(userRole === 'admin' || userRole === 'doctor' || userRole === 'clinic') && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload External Prescription
          </button>
        )}
      </div>

      {/* AI Insights - Mocked for demo but logic could be added */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-purple-600 rounded-xl shadow-lg shadow-purple-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Medical Intelligence Engine</h3>
            <p className="text-sm text-gray-700">
              <span className="font-bold text-purple-700">Sync Status:</span> Database synchronized. {prescriptions.length} records found in clinic network.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Patient name, or Diagnosis..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-bold"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => (
          <div key={prescription.prescription_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-gray-900">{prescription.prescription_id}</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full tracking-wider">
                        {new Date(prescription.created_at || prescription.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        <strong className="text-gray-900">Patient:</strong> {prescription.patient?.full_name} <span className="text-gray-400 font-mono text-xs">({prescription.patient?.patient_id})</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong className="text-gray-900">Doctor:</strong> Dr. {prescription.doctor?.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong className="text-gray-900">Diagnosis:</strong> <span className="text-blue-600">{prescription.diagnosis || 'General Consultation'}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPrescription(prescription)}
                    className="p-3 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                    title="View Comprehensive Report"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    className="p-3 text-gray-400 bg-gray-50 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all"
                    title="Digital Archive Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-50">
                <div className="bg-gray-50/50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pharma Node ({prescription.medicines?.length || 0})</p>
                  <div className="space-y-2">
                    {prescription.medicines?.slice(0, 3).map((med: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-bold text-gray-700">{med.medicine_name || med.name}</span>
                        <span className="text-gray-400 text-xs">{med.dosage}</span>
                      </div>
                    ))}
                    {prescription.medicines?.length > 3 && (
                      <p className="text-xs text-blue-500 font-bold mt-2">+ {prescription.medicines.length - 3} additional medications</p>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50/50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Diagnostic Node ({prescription.lab_tests?.length || 0})</p>
                  <div className="space-y-2">
                    {prescription.lab_tests?.slice(0, 3).map((test: any, index: number) => (
                      <div key={index} className="flex items-center text-sm font-bold text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                        {test.test_name || test.name || 'Clinical Test'}
                      </div>
                    ))}
                    {!prescription.lab_tests?.length && <p className="text-xs text-gray-400 italic">No lab tests required</p>}
                  </div>
                </div>
              </div>

              {prescription.follow_up_date && (
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-500 bg-orange-50 px-4 py-2 rounded-xl w-fit">
                  FOLLOW-UP ARCHIVED: {new Date(prescription.follow_up_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prescription Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-600">
              <h2 className="text-lg font-bold text-white tracking-tight">Full Medical Protocol</h2>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-blue-500 rounded-xl transition-colors">
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="p-2 hover:bg-blue-500 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-10 overflow-y-auto space-y-10">
              {/* Header */}
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-blue-600 tracking-tighter italic uppercase">Clinic Network Node</h3>
                <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Digital Prescription Archive</p>
              </div>

              {/* Prescription Info */}
              <div className="grid grid-cols-2 gap-10">
                <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Identity</h4>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-gray-900">{selectedPrescription.patient?.full_name}</p>
                    <p className="text-sm font-mono text-gray-500">ID: {selectedPrescription.patient?.patient_id}</p>
                    <p className="text-sm text-gray-500">Date: {new Date(selectedPrescription.created_at || selectedPrescription.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Medical Authority</h4>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-gray-900">Dr. {selectedPrescription.doctor?.full_name}</p>
                    <p className="text-sm font-mono text-gray-500">REF: {selectedPrescription.prescription_id}</p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-blue-50/50 rounded-3xl p-8 border-2 border-dashed border-blue-100">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Diagnosis & Assessment</h4>
                <p className="text-xl font-bold text-gray-900 leading-relaxed">{selectedPrescription.diagnosis || 'General Clinical Assessment'}</p>
              </div>

              {/* Medications */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pharmacology Protocol (Rx)</h4>
                <div className="rounded-3xl border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Medicine</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Dosage</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequency</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedPrescription.medicines?.map((med: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-gray-900">{med.medicine_name || med.name}</td>
                          <td className="px-6 py-5 text-sm text-gray-600 font-medium">{med.dosage}</td>
                          <td className="px-6 py-5 text-sm text-gray-600 font-medium">{med.frequency}</td>
                          <td className="px-6 py-5 text-sm text-blue-600 font-bold">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Tests */}
              {selectedPrescription.lab_tests && selectedPrescription.lab_tests.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Laboratory Directives</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedPrescription.lab_tests.map((test: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-bold text-gray-700">{test.test_name || test.name || 'Clinical Analysis'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Doctor's Clinical Notes</h4>
                  <div className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100">
                    <p className="text-sm font-medium text-amber-900 leading-relaxed">{selectedPrescription.notes}</p>
                  </div>
                </div>
              )}

              {/* Follow-up */}
              {selectedPrescription.follow_up_date && (
                <div className="bg-emerald-50 rounded-3xl p-6 flex items-center justify-center text-center">
                  <p className="text-sm font-bold text-emerald-700">
                    NEXT SYNCHRONIZATION: {new Date(selectedPrescription.follow_up_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Signature */}
              <div className="pt-10 flex justify-end">
                <div className="text-right border-t-2 border-gray-100 pt-4 w-64">
                    <p className="text-xl font-black text-gray-900 leading-none mb-1">Dr. {selectedPrescription.doctor?.full_name}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Certified Authority Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload External Prescription Modal - Remains functionally same for manual uploads */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-900">
              <h2 className="text-lg font-bold text-white tracking-tight">External Archive Upload</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-8">
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Patient Profile</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold">
                    <option>Select Registered Patient</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document Source</label>
                  <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center hover:border-blue-200 transition-all cursor-pointer bg-gray-50 group">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                    <p className="text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">DRAG & DROP MEDICAL ARCHIVE</p>
                    <p className="text-[9px] text-gray-400 mt-2">Maximum Signal Strength: 5MB (PDF/JPG)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transcription Metadata</label>
                  <textarea className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold" rows={3} placeholder="Add context for this record..."></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all"
                  >
                    Initiate Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
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

