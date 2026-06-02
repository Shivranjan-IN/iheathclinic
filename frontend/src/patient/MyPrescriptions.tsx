import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import {
  FileText,
  Eye,
  Calendar,
  User,
  Pill,
  Brain,
  Upload,
  Trash2,
  Download,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Badge } from '../common/ui/badge';
import { Input } from '../common/ui/input';
import { toast } from 'sonner';
import type { PatientUser } from './PatientPortal';

export function MyPrescriptions({ patient }: { patient: PatientUser }) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAIExplanation, setShowAIExplanation] = useState<string | null>(null);
  const [aiContent, setAIContent] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scannedData, setScannedData] = useState<any[]>([]);
  const [scannedFileUrl, setScannedFileUrl] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    if (patient.id) {
      fetchPrescriptions();
      fetchDocuments();
      fetchScanHistory();
    }
  }, [patient.id]);

  const fetchScanHistory = async () => {
    try {
      const data = await patientService.getScannedPrescriptionHistory();
      setScanHistory(data);
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const data = await patientService.getMyPrescriptions();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const data = await patientService.getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const filteredPrescriptions = prescriptions.filter((rx: any) => {
    // 1. Text Search (ID, Doctor, Diagnosis)
    const matchesSearch = 
      rx.prescription_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.doctor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Medicine Search
    const matchesMedicine = !medicineSearch || rx.medicines?.some((m: any) => 
      m.medicine_name?.toLowerCase().includes(medicineSearch.toLowerCase())
    );

    // 3. Date Range
    const rxDate = new Date(rx.created_at);
    const matchesDate = 
      (!dateFrom || rxDate >= new Date(dateFrom)) &&
      (!dateTo || rxDate <= new Date(dateTo));

    return matchesSearch && matchesMedicine && matchesDate;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleGetAIExplanation = async (rxId: string, prescriptionText: string) => {
    try {
      setAILoading(true);
      setShowAIExplanation(rxId);
      const explanation = await patientService.explainPrescription(prescriptionText, selectedLanguage);
      setAIContent(explanation);
    } catch (error) {
      console.error('AI Explanation Error:', error);
      setAIContent('Error generating explanation.');
    } finally {
      setAILoading(false);
    }
  };

  const toggleAIExplanation = async (rxId: string, prescriptionText: string) => {
    if (showAIExplanation === rxId) {
      setShowAIExplanation(null);
      setAIContent(null);
    } else {
      await handleGetAIExplanation(rxId, prescriptionText);
    }
  };

  const handleScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanFile(file);
    setIsScanning(true);
    try {
      const result = await patientService.scanPrescriptionImage(file);
      setScannedData(result.extractedData || []);
      setScannedFileUrl(result.fileUrl || '');
      toast.success('Prescription scanned successfully. Please review the details.');
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan prescription.');
      setIsScanning(false);
      setScanFile(null);
    }
  };

  const handleSaveScannedPrescription = async () => {
    try {
      // 1. Save scan record in DB
      await patientService.saveScannedPrescription(scannedFileUrl, scannedData);

      // 2. Save medicines to profile
      const currentMeds = patient.currentMedications || [];
      const newMeds = scannedData.map(m => `${m.name || m.medicine_name} - ${m.dosage} (${m.frequency})`);
      
      const updated = await patientService.updatePatientProfile({
        currentMedications: [...newMeds, ...currentMeds]
      });
      
      if (updated) {
        toast.success('Medicines saved to your profile.');
        setIsScanning(false);
        setScanFile(null);
        setScannedData([]);
        setScannedFileUrl('');
        fetchScanHistory();
      }
    } catch (err) {
      console.error('Save scanned error:', err);
      toast.error('Failed to save medicines.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">My Prescriptions & Documents</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">View your medical documents and get AI-powered insights</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            id="scan-prescription-input"
            className="hidden"
            onChange={handleScanUpload}
          />
          <Button onClick={() => document.getElementById('scan-prescription-input')?.click()} className="bg-pink-600 hover:bg-pink-700 text-white">
            <Upload className="size-4 mr-2" />
            Scan Prescription
          </Button>
        </div>
      </div>

      {isScanning && scanFile && (
        <Card className="border-pink-200 dark:border-pink-800/30 mb-6">
          <CardHeader>
            <CardTitle>Review Scanned Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">We found the following medicines. Please review and correct if necessary.</p>
            {scannedData.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2">
                <Input value={item.name || ''} onChange={(e) => {
                  const newData = [...scannedData];
                  newData[idx].name = e.target.value;
                  setScannedData(newData);
                }} placeholder="Medicine Name" />
                <Input value={item.dosage || ''} onChange={(e) => {
                  const newData = [...scannedData];
                  newData[idx].dosage = e.target.value;
                  setScannedData(newData);
                }} placeholder="Dosage" />
                <Input value={item.frequency || ''} onChange={(e) => {
                  const newData = [...scannedData];
                  newData[idx].frequency = e.target.value;
                  setScannedData(newData);
                }} placeholder="Frequency" />
                <Input value={item.duration || ''} onChange={(e) => {
                  const newData = [...scannedData];
                  newData[idx].duration = e.target.value;
                  setScannedData(newData);
                }} placeholder="Duration" />
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSaveScannedPrescription} className="bg-green-600 hover:bg-green-700 text-white">Save to Profile</Button>
              <Button variant="outline" onClick={() => { setIsScanning(false); setScanFile(null); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-pink-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="ID, Doctor, or Diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Pill className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Filter by medicine name..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-2 flex-1 w-full">
                <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 min-w-12">From:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2 flex-1 w-full">
                <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 min-w-12">To:</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setMedicineSearch('');
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-pink-600 dark:text-pink-400"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Pill className="size-5 text-pink-600 dark:text-pink-400" />
              Clinic Prescriptions
            </h2>
            {filteredPrescriptions.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">No prescriptions found.</p>
              </Card>
            ) : (
              filteredPrescriptions.map((rx: any) => (
                <Card key={rx.prescription_id} className="overflow-hidden border-pink-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{rx.prescription_id}</h3>
                          <Badge className={rx.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                            {rx.status || 'Active'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="size-4" /> {new Date(rx.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><User className="size-4" /> {rx.doctor?.full_name || 'Clinic Doctor'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => patientService.downloadWithAuth(
                            patientService.downloadPrescriptionUrl(rx.prescription_id),
                            `prescription-${rx.prescription_id}.txt`
                          )}
                          className="text-green-600 border-green-200"
                        >
                          <Download className="size-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpand(rx.prescription_id)}
                        >
                          {expandedId === rx.prescription_id ? 'Hide' : 'View Details'}
                        </Button>
                      </div>
                    </div>

                    {expandedId === rx.prescription_id && (
                      <div className="pt-4 border-t space-y-4">
                        {/* Medicines Section */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Pill className="size-4 text-pink-600 dark:text-pink-400" />
                            Prescribed Medicines
                          </h4>
                          {(rx.medicines || []).map((med: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center border border-gray-100">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100">{med.medicine_name || med.name || 'Medicine'}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{med.dosage} • {med.frequency} • {med.duration}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Lab Tests Section */}
                        {rx.lab_tests && rx.lab_tests.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <Activity className="size-4 text-pink-600 dark:text-pink-400" />
                              Recommended Lab Tests
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {rx.lab_tests.map((test: any, idx: number) => (
                                <div key={idx} className="p-3 bg-pink-50 dark:bg-pink-900/20/30 rounded-lg border border-pink-100 flex items-center gap-2">
                                  <div className="size-2 bg-pink-400 rounded-full" />
                                  <span className="text-sm text-gray-800 dark:text-gray-200">{test.test_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes & Follow-up */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rx.diagnosis && (
                            <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                              <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Diagnosis</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{rx.diagnosis}</p>
                            </div>
                          )}
                          {rx.follow_up_date && (
                            <div className="p-3 bg-orange-50/30 rounded-lg border border-orange-100">
                              <p className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">Follow-up Date</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <Calendar className="size-4 text-orange-600" />
                                {new Date(rx.follow_up_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {rx.notes && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Doctor's Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{rx.notes}"</p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAIExplanation(rx.prescription_id, JSON.stringify(rx))}
                          disabled={aiLoading}
                          className="w-full bg-purple-50 text-purple-700 border-purple-200"
                        >
                          <Brain className="size-4 mr-2" />
                          AI Explanation
                        </Button>
                        {showAIExplanation === rx.prescription_id && (
                          <div className="p-4 bg-white dark:bg-gray-800 border border-purple-100 rounded-lg text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {aiLoading ? (
                              <div className="flex items-center gap-2 text-purple-600">
                                <Clock className="size-4 animate-spin" />
                                Analyzing your prescription...
                              </div>
                            ) : (
                              <div className="whitespace-pre-line">{aiContent}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Documents Sidebar */}
        <div className="space-y-6">
          <Card className="border-pink-200 dark:border-pink-800/30 shadow-md">
            <CardHeader className="bg-pink-50 dark:bg-pink-900/20/50">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Upload Documents</span>
                <Upload className="size-4 text-pink-600 dark:text-pink-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-pink-100 rounded-lg p-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-3">Upload lab reports or external prescriptions</p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        setUploading(true);
                        await patientService.uploadDocument(file);
                        toast.success('Document uploaded successfully');
                        fetchDocuments();
                      } catch (error: any) {
                        toast.error(error.message || 'Failed to upload document');
                      } finally {
                        setUploading(false);
                      }
                    }
                  }}
                />
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose Files'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-800/30 shadow-md">
            <CardHeader className="bg-pink-50 dark:bg-pink-900/20">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Scan History</span>
                <Clock className="size-4 text-pink-600 dark:text-pink-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {scanHistory.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No scanned prescriptions yet.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {scanHistory.map((scan) => {
                    const meds = (scan.extracted_data || []) as any[];
                    return (
                      <div key={scan.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900 dark:text-slate-200">
                            {scan.created_at ? new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                          </span>
                          {scan.file_url && (
                            <a href={scan.file_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 hover:underline">
                              View Image
                            </a>
                          )}
                        </div>
                        <div className="space-y-1 mt-1 text-gray-600 dark:text-slate-400">
                          {meds.map((med, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-medium text-gray-800 dark:text-slate-300">{med.name || med.medicine_name}</span>
                              <span>{med.dosage} ({med.frequency})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Storage</h3>
            {documents.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">No uploaded documents yet.</p>
            ) : (
              documents.map((doc) => (
                <Card key={doc.id} className="border-gray-100 hover:border-pink-200 dark:border-pink-800/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-pink-50 dark:bg-pink-900/20 rounded flex items-center justify-center">
                          <FileText className="size-4 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{doc.file_name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 dark:text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-7 text-purple-600"
                          onClick={() => handleGetAIExplanation(doc.id, doc.file_name)}
                          disabled={aiLoading}
                        >
                          <Brain className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => window.open(doc.file_url, '_blank')}><Eye className="size-3" /></Button>
                        <Button variant="ghost" size="icon" className="size-7 text-red-400"
                          onClick={async () => {
                            if (await patientService.deleteDocument(doc.id)) {
                              setDocuments(prev => prev.filter((d: any) => d.id !== doc.id));
                            }
                          }}
                        ><Trash2 className="size-3" /></Button>
                      </div>
                    </div>
                    {showAIExplanation === doc.id && (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-[10px] text-gray-700 dark:text-gray-300 leading-relaxed">
                        {aiLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin size-3 border-b-2 border-purple-600 rounded-full"></div>
                            Analyzing...
                          </div>
                        ) : aiContent}
                        {!aiLoading && (
                          <Button variant="ghost" size="sm" className="h-4 p-0 ml-2 text-[10px] text-purple-600" onClick={() => setShowAIExplanation(null)}>Close</Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
