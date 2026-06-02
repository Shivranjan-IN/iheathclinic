// Patient QR Card Component
// Displays patient's QR code for easy scanning by doctors/clinics

import { useState } from "react";
import { Card } from "../common/ui/card";
import { Button } from "../common/ui/button";
import { Badge } from "../common/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../common/ui/avatar";
import {
  Download,
  Share2,
  Printer,
  QrCode,
  AlertCircle,
  CheckCircle,
  Copy,
  Maximize2,
  Shield,
  Heart,
  Phone,
  Calendar,
  User
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  generatePatientQRURL,
  createPatientQRPayload,
  brandedQROptions
} from "../utils/qrCodeGenerator";

interface PatientQRCardProps {
  patient: {
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
  };
  showFullCard?: boolean;
}

export function PatientQRCard({ patient, showFullCard = true }: PatientQRCardProps) {
  const [copied, setCopied] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);

  const qrData = createPatientQRPayload(patient);
  const qrURL = generatePatientQRURL(patient.uniqueID);

  const handleCopyID = () => {
    navigator.clipboard.writeText(patient.uniqueID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(qrURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('patient-qr-code') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${patient.uniqueID}.png`;
      link.click();
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Patient QR Card - ${patient.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .qr-card {
                border: 2px solid #ec4899;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
              }
              .qr-code {
                margin: 20px 0;
              }
              h2 { color: #ec4899; margin: 10px 0; }
              .info { margin: 10px 0; font-size: 14px; }
              .emergency { background: #fee2e2; padding: 10px; border-radius: 8px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="qr-card">
              <h2>${patient.name}</h2>
              <div class="info"><strong>ID:</strong> ${patient.uniqueID}</div>
              <div class="info"><strong>Blood Group:</strong> ${patient.bloodGroup}</div>
              <div class="info"><strong>Age:</strong> ${patient.age} years</div>
              ${patient.abhaID ? `<div class="info"><strong>ABHA ID:</strong> ${patient.abhaID}</div>` : ''}
              <div class="qr-code">
                <svg id="qr-svg">${document.querySelector('#patient-qr-code svg')?.outerHTML}</svg>
              </div>
              <div class="emergency">
                <strong>Emergency Contact:</strong><br/>
                ${patient.emergencyContact}
              </div>
              ${patient.allergies && patient.allergies.length > 0 ? `
                <div class="emergency">
                  <strong>⚠️ Allergies:</strong><br/>
                  ${patient.allergies.join(', ')}
                </div>
              ` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${patient.name} - Health QR`,
          text: `Patient ID: ${patient.uniqueID}`,
          url: qrURL
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyURL();
    }
  };

  if (!showFullCard) {
    // Compact QR only view
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <div id="patient-qr-code">
            <QRCodeSVG
              value={qrURL}
              size={200}
              level="H"
              fgColor={brandedQROptions.color.dark}
              bgColor={brandedQROptions.color.light}
              includeMargin={true}
            />
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm font-medium">{patient.uniqueID}</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl flex items-center gap-2">
            <QrCode className="w-6 h-6 text-pink-600" />
            Your Health QR Card
          </h3>
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Patient Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                {patient.avatar ? (
                  <AvatarImage src={patient.avatar} alt={patient.name} />
                ) : (
                  <AvatarFallback className="bg-pink-100 text-pink-600 text-2xl">
                    {patient.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h4 className="text-lg font-medium">{patient.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {patient.age} years • {patient.gender}
                </p>
              </div>
            </div>

            <Card className="p-4 bg-gradient-to-br from-pink-50 to-purple-50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unique Health ID</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyID}
                    className="h-6"
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="font-mono text-sm font-medium">{patient.uniqueID}</p>
              </div>
            </Card>

            {patient.abhaID && (
              <Card className="p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">ABHA ID</span>
                </div>
                <p className="font-mono text-sm">{patient.abhaID}</p>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-muted-foreground">Blood Group</span>
                </div>
                <p className="text-lg font-medium">{patient.bloodGroup}</p>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Age</span>
                </div>
                <p className="text-lg font-medium">{patient.age} yrs</p>
              </Card>
            </div>

            {patient.emergencyContact && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Emergency Contact</span>
                </div>
                <p className="text-sm font-mono">{patient.emergencyContact}</p>
              </Card>
            )}

            {patient.allergies && patient.allergies.length > 0 && (
              <Card className="p-4 bg-orange-50 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Allergies</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.map((allergy, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {patient.lastVisit && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Last Visit: {patient.lastVisit}</span>
              </div>
            )}
          </div>

          {/* Right: QR Code */}
          <div className="flex flex-col items-center justify-center">
            <Card className="p-6 bg-white border-2 border-pink-200">
              <div id="patient-qr-code" className="flex items-center justify-center">
                <QRCodeSVG
                  value={qrURL}
                  size={250}
                  level="H"
                  fgColor={brandedQROptions.color.dark}
                  bgColor={brandedQROptions.color.light}
                  includeMargin={true}
                />
              </div>
            </Card>

            <p className="text-sm text-center text-muted-foreground mt-4 mb-4">
              Scan this QR code to access my health records
            </p>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" size="sm" onClick={handleDownloadQR}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrintQR}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareQR}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowLargeQR(true)}>
                <Maximize2 className="w-4 h-4 mr-2" />
                Enlarge
              </Button>
            </div>

            <Card className="p-3 bg-blue-50 mt-4 w-full">
              <p className="text-xs text-center text-blue-900">
                🔒 Your data is encrypted and secure. Only authorized healthcare professionals can access it.
              </p>
            </Card>
          </div>
        </div>

        {/* QR Usage Instructions */}
        <Card className="p-4 mt-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            How to Use Your QR Code
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">1. Show to Doctor</p>
              <p className="text-muted-foreground">Display QR during consultation</p>
            </div>
            <div>
              <p className="font-medium mb-1">2. Quick Check-in</p>
              <p className="text-muted-foreground">Scan at clinic reception</p>
            </div>
            <div>
              <p className="font-medium mb-1">3. Emergency Access</p>
              <p className="text-muted-foreground">Instant medical history access</p>
            </div>
          </div>
        </Card>
      </Card>

      {/* Large QR Modal */}
      {showLargeQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLargeQR(false)}
        >
          <Card className="p-8 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Scan QR Code</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowLargeQR(false)}>
                ✕
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <QRCodeSVG
                value={qrURL}
                size={400}
                level="H"
                fgColor={brandedQROptions.color.dark}
                bgColor={brandedQROptions.color.light}
                includeMargin={true}
              />
            </div>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              {patient.name} - {patient.uniqueID}
            </p>
          </Card>
        </div>
      )}
    </>
  );
}

export default PatientQRCard;
