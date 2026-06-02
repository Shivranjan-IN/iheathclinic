// QR Code Scanner Component for Doctors/Clinics
// Allows scanning patient QR codes to instantly access health records

import { useState, useRef, useEffect } from "react";
import { Card } from "../common/ui/card";
import { Button } from "../common/ui/button";
import { Badge } from "../common/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../common/ui/avatar";
import {
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Heart,
  Phone,
  Shield,
  Calendar,
  FileText,
  Clock,
  Pill,
  Activity,
  Download,
  Eye,
  Loader2
} from "lucide-react";
import {
  validateScannedQR,
  extractPatientIDFromQR,
  logQRScan
} from "../utils/qrCodeGenerator";

interface QRScannerProps {
  onScanSuccess: (patientID: string) => void;
  onClose: () => void;
  scannerType: 'doctor' | 'clinic' | 'pharmacy' | 'lab';
  scannerID: string;
}

interface PatientData {
  uniqueID: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  abhaID?: string;
  emergencyContact: string;
  allergies?: string[];
  chronicConditions?: string[];
  lastVisit?: string;
  avatar?: string;
  medicalHistory?: Array<{
    date: string;
    diagnosis: string;
    doctor: string;
    prescription: string;
  }>;
  recentReports?: Array<{
    name: string;
    date: string;
    type: string;
  }>;
  currentMedications?: string[];
}

export function QRScanner({ onScanSuccess, onClose, scannerType, scannerID }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualID, setManualID] = useState("");
  const [useManualInput, setUseManualInput] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  useEffect(() => {
    if (scanning && !useManualInput) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanning, useManualInput]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions or use manual input.");
      setUseManualInput(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Mock QR scan detection (In production, use a QR library like jsQR)
  const detectQRCode = () => {
    // This is a mock implementation
    // In production, use jsQR or similar library to detect QR from video feed

    // Simulate QR detection after 2 seconds
    setTimeout(() => {
      const mockQRData = "https://ihealthclinic.com/patient/view/PAT-20250113-000123-4567";
      handleScannedData(mockQRData);
    }, 2000);
  };

  const handleScannedData = async (data: string) => {
    setScanning(false);
    setScannedData(data);
    setLoading(true);
    setError(null);

    const validation = validateScannedQR(data);

    if (!validation.isValid) {
      setError(validation.error || "Invalid QR code");
      setLoading(false);
      return;
    }

    // Log the scan
    logQRScan({
      qrType: 'patient',
      qrID: validation.uniqueID || '',
      scannedBy: scannerID,
      scannedByType: scannerType,
      scanTime: new Date()
    });

    // Fetch patient data (mock API call)
    await fetchPatientData(validation.uniqueID!);
  };

  const fetchPatientData = async (patientID: string) => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock patient data
      const mockPatient: PatientData = {
        uniqueID: patientID,
        name: "Ramesh Patel",
        age: 45,
        gender: "Male",
        bloodGroup: "O+",
        abhaID: "12-3456-7890-1234",
        emergencyContact: "+91 98765 43210",
        allergies: ["Penicillin", "Sulfa drugs"],
        chronicConditions: ["Hypertension", "Type 2 Diabetes"],
        lastVisit: "2025-01-10",
        avatar: "https://i.pravatar.cc/150?img=33",
        medicalHistory: [
          {
            date: "2025-01-10",
            diagnosis: "Hypertension",
            doctor: "Dr. Priya Sharma",
            prescription: "Amlodipine 5mg - Once daily"
          },
          {
            date: "2024-12-15",
            diagnosis: "Routine Checkup",
            doctor: "Dr. Rajesh Kumar",
            prescription: "Multivitamins"
          }
        ],
        recentReports: [
          { name: "Blood Test Report", date: "2025-01-10", type: "Lab" },
          { name: "ECG Report", date: "2024-12-15", type: "Diagnostic" }
        ],
        currentMedications: [
          "Amlodipine 5mg - Once daily",
          "Metformin 500mg - Twice daily",
          "Aspirin 75mg - Once daily"
        ]
      };

      setPatientData(mockPatient);
      setLoading(false);
      onScanSuccess(patientID);
    } catch (err) {
      setError("Failed to fetch patient data");
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualID.trim()) {
      handleScannedData(`https://ihealthclinic.com/patient/view/${manualID}`);
    }
  };

  const handleRescan = () => {
    setScannedData(null);
    setPatientData(null);
    setError(null);
    setScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              Scan Patient QR Code
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Scanner View */}
          {scanning && !patientData && (
            <div className="space-y-4">
              {!useManualInput ? (
                <>
                  <Card className="p-4 bg-black relative overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border-4 border-pink-500 rounded-lg relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-pink-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-pink-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pink-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-pink-500"></div>
                      </div>
                    </div>
                  </Card>

                  <p className="text-center text-muted-foreground">
                    Position the QR code within the frame
                  </p>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={detectQRCode}>
                      <Camera className="w-4 h-4 mr-2" />
                      Scan QR Code
                    </Button>
                    <Button variant="outline" onClick={() => setUseManualInput(true)}>
                      Enter ID Manually
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Card className="p-6 bg-blue-50">
                    <p className="text-sm mb-4">Enter Patient ID manually if camera is not available</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="PAT-XXXXXXXX-XXXXXX-XXXX"
                        className="flex-1 px-4 py-2 border rounded-lg"
                        value={manualID}
                        onChange={(e) => setManualID(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                      />
                      <Button onClick={handleManualSubmit}>Submit</Button>
                    </div>
                  </Card>
                  <Button variant="outline" onClick={() => setUseManualInput(false)}>
                    <Camera className="w-4 h-4 mr-2" />
                    Use Camera Instead
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading patient data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900">Scan Failed</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRescan}>
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {/* Patient Data Display */}
          {patientData && !loading && (
            <div className="space-y-6">
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Patient Verified</p>
                    <p className="text-sm text-green-700">Health records retrieved successfully</p>
                  </div>
                </div>
              </Card>

              {/* Patient Summary */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="w-20 h-20">
                    {patientData.avatar ? (
                      <AvatarImage src={patientData.avatar} alt={patientData.name} />
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                        {patientData.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-medium">{patientData.name}</h3>
                    <p className="text-muted-foreground">{patientData.age} years • {patientData.gender}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{patientData.uniqueID}</Badge>
                      {patientData.abhaID && (
                        <Badge variant="outline" className="bg-blue-50">
                          <Shield className="w-3 h-3 mr-1" />
                          {patientData.abhaID}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Critical Info Grid */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">Blood Group</span>
                    </div>
                    <p className="text-2xl font-medium">{patientData.bloodGroup}</p>
                  </Card>

                  <Card className="p-4 bg-orange-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium">Allergies</span>
                    </div>
                    {patientData.allergies && patientData.allergies.length > 0 ? (
                      <div className="space-y-1">
                        {patientData.allergies.map((allergy, idx) => (
                          <p key={idx} className="text-sm">⚠️ {allergy}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">None reported</p>
                    )}
                  </Card>

                  <Card className="p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Emergency</span>
                    </div>
                    <p className="text-sm font-mono">{patientData.emergencyContact}</p>
                  </Card>
                </div>

                {/* Chronic Conditions */}
                {patientData.chronicConditions && patientData.chronicConditions.length > 0 && (
                  <Card className="p-4 bg-purple-50 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Chronic Conditions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patientData.chronicConditions.map((condition, idx) => (
                        <Badge key={idx} className="bg-purple-600">{condition}</Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Current Medications */}
                {patientData.currentMedications && patientData.currentMedications.length > 0 && (
                  <Card className="p-4 bg-green-50 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Pill className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Current Medications</span>
                    </div>
                    <ul className="space-y-2">
                      {patientData.currentMedications.map((med, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Medical History */}
                {patientData.medicalHistory && patientData.medicalHistory.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Medical History
                    </h4>
                    <div className="space-y-3">
                      {patientData.medicalHistory.map((record, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{record.diagnosis}</p>
                              <p className="text-sm text-muted-foreground">
                                {record.doctor} • {record.date}
                              </p>
                              <p className="text-sm mt-1">Rx: {record.prescription}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Reports */}
                {patientData.recentReports && patientData.recentReports.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Recent Reports
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {patientData.recentReports.map((report, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{report.name}</p>
                              <p className="text-xs text-muted-foreground">{report.date} • {report.type}</p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => {
                  onClose();
                  // Proceed with consultation
                }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Proceed with Consultation
                </Button>
                <Button variant="outline" onClick={handleRescan}>
                  Scan Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default QRScanner;
