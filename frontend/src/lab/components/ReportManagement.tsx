import React, { useState, useEffect, useRef } from 'react';
import { 
    Upload, 
    FileText, 
    Download, 
    CheckCircle2, 
    Search, 
    Clock, 
    AlertCircle, 
    User, 
    Calendar,
    ArrowRight,
    FileType,
    Eye,
    Activity,
    X,
    FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../common/ui/dialog';
import labService from '../../services/labService';

interface FileToUpload {
    file: File;
    orderId: string;
    isValid: boolean;
    error?: string;
}

export function ReportManagement() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Bulk upload states
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileToUpload[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings({ all: true });
            if (res.success) {
                // All bookings are effectively "report placeholders"
                setReports(res.bookings || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
        }
    };

    const processFiles = (files: File[]) => {
        const processed: FileToUpload[] = files.map(file => {
            const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
            const sizeOk = file.size <= 10 * 1024 * 1024; // 10MB limit
            
            // Extract Order ID from filename (e.g. REP-LAB-DEMO-1.pdf, LAB-DEMO-1.pdf, or just LAB-1.pdf)
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const matches = nameWithoutExt.match(/(LAB-[a-zA-Z0-9-]+)/i);
            const orderId = matches ? matches[1].toUpperCase() : nameWithoutExt.toUpperCase();

            let isValid = isPdf && sizeOk;
            let error = '';

            if (!isPdf) {
                error = 'File is not a PDF';
            } else if (!sizeOk) {
                error = 'Size exceeds 10MB';
            }

            return {
                file,
                orderId,
                isValid,
                error
            };
        });

        setSelectedFiles(prev => [...prev, ...processed]);
    };

    const removeFile = (idx: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleBulkUploadSubmit = async () => {
        const validList = selectedFiles.filter(f => f.isValid);
        if (validList.length === 0) return;

        setUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        validList.forEach(item => {
            // Rename file buffer in form to map orderId for match
            const renamedFile = new File([item.file], `${item.orderId}.pdf`, { type: item.file.type });
            formData.append('reports', renamedFile);
        });

        try {
            const res = await labService.bulkUploadReports(formData);
            if (res.success || res.data) {
                const results = res.data?.results || [];
                const errors = res.data?.errors || [];

                setUploadResult({
                    success: results.length,
                    failed: errors.length,
                    errors: errors.map((e: any) => `${e.file}: ${e.error}`)
                });
                
                setSelectedFiles([]);
                fetchReports();
            } else {
                alert(res.message || 'Bulk upload failed');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.response?.data?.message || 'Server upload connection error');
        } finally {
            setUploading(false);
        }
    };

    const openSingleUpload = (_orderId: string) => {
        // Clear previous state and open modal pre-populated
        setSelectedFiles([]);
        setUploadResult(null);
        setIsUploadModalOpen(true);
        
        // Wait for dialog opening and focus input
        setTimeout(() => {
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }, 100);
    };

    const filteredReports = reports.filter(r => 
        r.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lab_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.lab_order_items?.some((i: any) => i.lab_test_types?.test_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 italic">Diagnostic Report Management</h1>
                    <p className="text-gray-600 font-medium">Generate, upload, and dispatch test reports to clinics and patients</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => { setSelectedFiles([]); setUploadResult(null); setIsUploadModalOpen(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 rounded-xl"
                    >
                        <Upload className="w-4 h-4" /> Bulk Upload Reports
                    </Button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                   { label: 'Reports Pending', count: reports.filter(r => r.status !== 'Completed').length, icon: Clock, color: 'orange' },
                   { label: 'Completed Reports', count: reports.filter(r => r.status === 'Completed').length, icon: CheckCircle2, color: 'green' },
                   { label: 'Total Logs', count: reports.length, icon: FileText, color: 'blue' },
                   { label: 'Pending Delivery', count: reports.filter(r => r.status === 'Sample Collected').length, icon: AlertCircle, color: 'purple' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex flex-row items-center gap-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-gray-900 italic">{stat.count}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Reports ledger */}
            <Card className="shadow-lg border-blue-50 overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gray-50/50">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200"><FileText className="w-5 h-5" /></div>
                        <CardTitle className="text-lg uppercase italic font-black text-gray-900">Report Dispatch Center</CardTitle>
                     </div>
                     <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-bold" />
                          <Input 
                             placeholder="Search reports..." 
                             className="pl-10 h-10 shadow-sm"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                          />
                     </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-left">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredReports.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Report ID</th>
                                        <th className="px-6 py-4">Patient / Test</th>
                                        <th className="px-6 py-4">Date Added</th>
                                        <th className="px-6 py-4">Dispatcher Status</th>
                                        <th className="px-6 py-4">File Details</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-left bg-white">
                                    {filteredReports.map((report) => (
                                        <tr key={report.lab_order_id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-left">
                                                <Badge className="bg-gray-900 group-hover:bg-blue-600 transition-colors uppercase font-bold text-[10px] tracking-widest px-2 py-0.5">REP-{report.lab_order_id.replace('LAB-','')}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 mb-1"><User className="w-3.5 h-3.5 text-gray-400" /><span className="font-black text-gray-900 uppercase italic text-xs">{report.patient?.full_name || 'N/A'}</span></div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest italic border-l-2 border-blue-600 pl-2 ml-1">
                                                    <FileType className="w-3 h-3" /> {report.lab_order_items?.map((i: any) => i.lab_test_types?.test_name).join(', ') || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-gray-600 font-black italic text-[10px] uppercase">
                                                    <Calendar className="w-3 h-3" /> {new Date(report.order_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                {report.status === 'Completed' ? (
                                                    <Badge className="bg-green-50 text-green-700 border-green-200 uppercase font-black text-[10px] tracking-widest flex w-fit gap-1 items-center px-2 py-1 shadow-sm border">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> DISPATCHED
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 uppercase font-black text-[10px] tracking-widest flex w-fit gap-1 items-center px-2 py-1 border animate-pulse">
                                                        <Clock className="w-3.5 h-3.5" /> PENDING UPLOAD
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                {report.report_url || report.status === 'Completed' ? (
                                                    <div className="text-[10px] space-y-0.5">
                                                        <p className="font-black text-gray-700 uppercase tracking-widest truncate max-w-[150px]">
                                                            {report.report_url ? report.report_url.split('/').pop()?.slice(-20) || 'REPORT_SECURED.PDF' : 'REPORT_SECURED.PDF'}
                                                        </p>
                                                        <p className="text-green-600 font-bold italic">Verification Locked</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-300 italic text-xs uppercase font-black">Waiting for Results</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {report.report_url || report.status === 'Completed' ? (
                                                        <React.Fragment>
                                                            <a 
                                                                href={report.report_url || '#'} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border shadow-sm bg-white" 
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                            <a 
                                                                href={report.report_url || '#'} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border shadow-sm bg-white" 
                                                                title="Preview"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </a>
                                                        </React.Fragment>
                                                    ) : (
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => openSingleUpload(report.lab_order_id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-8 px-3 shadow-md font-black uppercase text-[9px] tracking-widest rounded-lg"
                                                        >
                                                            <Upload className="w-3 h-3" /> Upload Report <ArrowRight className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 italic">No reportable data found</h3>
                                <p className="text-gray-500">Only bookings with active status will appear in the dispatch center.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Upload Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="sm:max-w-[500px] text-left">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Upload className="w-5 h-5 text-blue-600 animate-bounce" /> Bulk Upload Laboratory Reports
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {/* Drag and Drop Zone */}
                        <div 
                            onClick={triggerFileSelect}
                            className="border-2 border-dashed border-blue-200 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-all"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="application/pdf"
                                multiple
                                onChange={handleFileChange}
                            />
                            <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                            <p className="text-xs font-black uppercase text-blue-700 tracking-wider">Drag and Drop PDF files</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-semibold">Or click to browse storage (Max size: 10MB)</p>
                        </div>

                        {/* List of files selected */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Files ({selectedFiles.length})</label>
                                <div className="space-y-1.5">
                                    {selectedFiles.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border rounded-xl text-xs">
                                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                                <FileType className={`w-4 h-4 shrink-0 ${item.isValid ? 'text-red-500' : 'text-gray-300'}`} />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 truncate leading-none mb-1">{item.file.name}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                                        SIZE: {(item.file.size / 1024 / 1024).toFixed(2)}MB • ID: <span className="text-blue-600 font-bold">{item.orderId}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {item.isValid ? (
                                                    <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">Ready</span>
                                                ) : (
                                                    <span className="bg-red-100 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded" title={item.error}>{item.error || 'Invalid'}</span>
                                                )}
                                                <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Results summary */}
                        {uploadResult && (
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-2">
                                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-green-400" /> Upload Results</h4>
                                <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-wider text-gray-400 my-2">
                                    <div className="bg-green-500/10 p-2 border border-green-500/20 rounded-xl"><span className="block text-[8px] text-green-500 mb-0.5">SUCCESS</span><span className="text-white text-base font-mono">{uploadResult.success}</span></div>
                                    <div className="bg-red-500/10 p-2 border border-red-500/20 rounded-xl"><span className="block text-[8px] text-red-500 mb-0.5">FAILED</span><span className="text-white text-base font-mono">{uploadResult.failed}</span></div>
                                </div>
                                {uploadResult.errors.length > 0 && (
                                    <div className="text-[9px] font-bold text-red-400 max-h-24 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                                        {uploadResult.errors.map((err, i) => <div key={i} className="bg-red-500/5 p-1 border-l-2 border-red-500 pl-1.5">{err}</div>)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => { setIsUploadModalOpen(false); setSelectedFiles([]); setUploadResult(null); }}
                            className="text-xs font-bold uppercase rounded-xl"
                        >
                            Close
                        </Button>
                        {selectedFiles.length > 0 && !uploadResult && (
                            <Button 
                                onClick={handleBulkUploadSubmit}
                                disabled={selectedFiles.filter(f => f.isValid).length === 0 || uploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-xl px-5"
                            >
                                {uploading ? 'Processing Upload...' : 'Begin Bulk Upload'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

