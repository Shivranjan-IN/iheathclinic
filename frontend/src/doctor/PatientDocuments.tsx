import { useState, useEffect } from 'react';
import { 
    Upload, 
    FileText, 
    Eye, 
    Trash2, 
    User, 
    Plus, 
    X, 
    ExternalLink, 
    Paperclip, 
    CheckCircle,
    Search,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Stethoscope,
    Loader2
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';
import { toast } from 'sonner';
import { Card, CardContent } from '../common/ui/card';
import { Badge } from '../common/ui/badge';

export function PatientDocuments() {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    // Upload form state
    const [uploadData, setUploadData] = useState({
        file: null as File | null,
        type: 'Report'
    });

    const docTypes = [
        'Report',
        'X-Ray',
        'Prescription',
        'Lab Result',
        'External',
        'Discharge Summary',
        'Consent Form',
        'Other'
    ];

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchPatients();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    const fetchPatients = async () => {
        try {
            setPatientsLoading(true);
            const data = await patientService.getPatients(searchTerm);
            setPatients(data);
        } catch (error) {
            console.error('fetchPatients error:', error);
            toast.error('Failed to load patients list');
        } finally {
            setPatientsLoading(false);
        }
    };

    const fetchDocuments = async (patientId: string) => {
        if (!patientId) return;
        try {
            setLoading(true);
            const data = await doctorService.getPatientDocuments(patientId);
            setDocuments(data);
        } catch (error) {
            toast.error('Failed to load patient records');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = e.target.value;
        setSelectedPatientId(pId);
        const patient = patients.find(p => p.patient_id === pId);
        setSelectedPatient(patient || null);
        if (pId) {
            fetchDocuments(pId);
        } else {
            setDocuments([]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId) return toast.error('Please select a patient first');
        if (!uploadData.file) return toast.error('Please select a file');

        try {
            setUploading(true);
            await doctorService.uploadPatientDocument(selectedPatientId, uploadData.file, uploadData.type);
            toast.success('Document uploaded successfully');
            setShowUploadModal(false);
            setUploadData({ file: null, type: 'Report' });
            fetchDocuments(selectedPatientId);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!window.confirm('Delete this clinical record definitively?')) return;
        try {
            await doctorService.deletePatientDocument(docId);
            toast.success('Document removed');
            fetchDocuments(selectedPatientId);
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase">
                        <FileText className="w-4 h-4" />
                        <span>Medical Records Archive</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Patient Records</h1>
                    <p className="text-slate-500 font-medium">Access and manage comprehensive medical documentation and diagnostics.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Search and Select Section */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4 ml-1">Find Patient Record</label>
                        
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or mobile..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 outline-none transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    value={selectedPatientId}
                                    onChange={handlePatientChange}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/30 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">{patientsLoading ? 'Syncing...' : 'Select Target Profile'}</option>
                                    {patients.map((patient: any) => (
                                        <option key={patient.patient_id} value={patient.patient_id}>
                                            {patient.full_name} ({patient.patient_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedPatient && (
                            <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
                                        {selectedPatient.profile_photo_url ? (
                                            <img src={selectedPatient.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none">{selectedPatient.full_name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">ID: {selectedPatient.patient_id}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                                        <Mail className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="truncate">{selectedPatient.email || 'No email record'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                                        <Phone className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>{selectedPatient.phone || 'No mobile record'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>{selectedPatient.age || 'N/A'} Yrs • {selectedPatient.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-xs font-bold">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="truncate">{selectedPatient.address || 'Address not logged'}</span>
                                    </div>
                                </div>
                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    <button className="py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        <Plus className="w-3 h-3" />
                                        LAB TEST
                                    </button>
                                    <button className="py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                                        ORDER RX
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents Content Section */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-[200px] -mr-16 -mt-16 pointer-events-none" />
                        
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between relative z-10">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 leading-none">Document Repository</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Found {documents.length} medical records</p>
                            </div>
                            {selectedPatientId && (
                                <button 
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>UPLOAD</span>
                                </button>
                            )}
                        </div>

                        <div className="flex-1 p-8 overflow-y-auto relative z-10">
                            {!selectedPatientId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                        <Stethoscope className="w-12 h-12" />
                                    </div>
                                    <div className="max-w-xs">
                                        <h3 className="text-xl font-black text-slate-900">No Patient Selected</h3>
                                        <p className="text-slate-400 text-sm font-medium mt-2">Please select a patient from the archive to view their medical history and biological data.</p>
                                    </div>
                                </div>
                            ) : loading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Vault...</p>
                                    </div>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                    <div className="w-20 h-20 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6">
                                        <FileText className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Vault Empty</h3>
                                    <p className="text-slate-400 text-sm font-medium mt-2">No documents found for this profile yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                    {documents.map((doc: any) => (
                                        <div key={doc.document_id} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[60px] -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors" />
                                            
                                            <div className="flex items-start justify-between mb-6 relative z-10">
                                                <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={doc.document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(doc.document_id)}
                                                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight truncate pr-8">{doc.document_type}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="mt-8 flex items-center justify-between relative z-10">
                                                <span className="text-[10px] font-black uppercase tracking-tighter px-3 py-1 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    VERIFIED RECORD
                                                </span>
                                                <button className="flex items-center gap-1.5 text-xs font-black text-indigo-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                                    VIEW <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowUploadModal(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Upload Clinical Record</h2>
                                <p className="text-sm text-slate-500 font-medium">Attach PDF, image, or X-ray files</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Classification</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {docTypes.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setUploadData({ ...uploadData, type })}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${uploadData.type === type
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-600/50 hover:text-indigo-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select File</label>
                                <div 
                                    className={`relative group h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${uploadData.file 
                                        ? 'border-emerald-500 bg-emerald-50/50' 
                                        : 'border-slate-200 bg-slate-50 hover:border-indigo-500/50 hover:bg-indigo-50/50'}`}
                                >
                                    <input
                                        type="file"
                                        onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    {uploadData.file ? (
                                        <>
                                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-lg shadow-emerald-500/10">
                                                <Paperclip className="w-8 h-8" />
                                            </div>
                                            <p className="font-black text-emerald-900 text-sm truncate max-w-[200px]">{uploadData.file.name}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mt-1">{formatFileSize(uploadData.file.size)}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-3 shadow-sm group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <p className="font-black text-slate-500 text-sm">Click or drag record here</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">MAX 20MB • PDF, JPG, PNG</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !uploadData.file}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Encrypting & Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Confirm Secure Upload</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
