// QR Code Generator for I Health Clinic Patient Data Sharing System
// Generates QR codes for patients that can be scanned by doctors/clinics

export interface PatientQRData {
  uniqueID: string;
  name: string;
  age: number;
  bloodGroup?: string;
  abhaID?: string;
  emergencyContact?: string;
  allergies?: string[];
  chronicConditions?: string[];
  lastVisit?: string;
  url: string;
}

export interface QRCodeOptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

/**
 * Generates a QR code URL for a patient
 * This URL will be encoded in the QR code
 */
export function generatePatientQRURL(uniqueID: string): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://ihealthclinic.com';
  return `${baseURL}/patient/view/${uniqueID}`;
}

/**
 * Generates QR code data payload for a patient
 * This creates a structured data object that can be encoded
 */
export function createPatientQRPayload(patientData: {
  uniqueID: string;
  name: string;
  age: number;
  bloodGroup?: string;
  abhaID?: string;
  emergencyContact?: string;
  allergies?: string[];
  chronicConditions?: string[];
  lastVisit?: string;
}): PatientQRData {
  return {
    ...patientData,
    url: generatePatientQRURL(patientData.uniqueID)
  };
}

/**
 * Default QR code options for healthcare use
 * High error correction for damaged/partially obscured codes
 */
export const defaultQROptions: QRCodeOptions = {
  size: 300,
  errorCorrectionLevel: 'H', // High error correction (30% recovery)
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
};

/**
 * Branded QR options with I Health Clinic colors
 */
export const brandedQROptions: QRCodeOptions = {
  size: 300,
  errorCorrectionLevel: 'H',
  margin: 4,
  color: {
    dark: '#ec4899', // Pink-500 from I Health Clinic theme
    light: '#FFFFFF'
  }
};

/**
 * Generate QR code as Data URL (for display in browser)
 * Note: Actual QR generation happens in the React component using qrcode.react
 * This function prepares the data
 */
export function prepareQRCodeData(
  patientData: PatientQRData,
  options: QRCodeOptions = defaultQROptions
): {
  value: string;
  options: QRCodeOptions;
} {
  // Create a simple URL-based QR for easy scanning
  // Alternative: JSON.stringify(patientData) for full data embed
  const value = patientData.url;

  return {
    value,
    options
  };
}

/**
 * Generate QR code filename
 */
export function generateQRFilename(uniqueID: string, format: string = 'png'): string {
  return `qr_${uniqueID}.${format}`;
}

/**
 * Validate scanned QR data
 */
export function validateScannedQR(scannedData: string): {
  isValid: boolean;
  uniqueID: string | null;
  url: string | null;
  error?: string;
} {
  try {
    // Check if it's a URL
    if (scannedData.startsWith('http')) {
      const url = new URL(scannedData);
      const pathParts = url.pathname.split('/');
      const uniqueID = pathParts[pathParts.length - 1];

      // Validate ID format
      const idPattern = /^(PAT|DOC|CLN)-\d{8}-\d{5,6}-\d{4}$/;
      if (!idPattern.test(uniqueID)) {
        return {
          isValid: false,
          uniqueID: null,
          url: null,
          error: 'Invalid ID format in QR code'
        };
      }

      return {
        isValid: true,
        uniqueID,
        url: scannedData
      };
    }

    // Check if it's JSON data
    const jsonData = JSON.parse(scannedData);
    if (jsonData.uniqueID && jsonData.url) {
      return {
        isValid: true,
        uniqueID: jsonData.uniqueID,
        url: jsonData.url
      };
    }

    return {
      isValid: false,
      uniqueID: null,
      url: null,
      error: 'Invalid QR code format'
    };
  } catch (error) {
    return {
      isValid: false,
      uniqueID: null,
      url: null,
      error: 'Failed to parse QR code data'
    };
  }
}

/**
 * Extract patient ID from QR URL
 */
export function extractPatientIDFromQR(qrData: string): string | null {
  const validation = validateScannedQR(qrData);
  return validation.isValid ? validation.uniqueID : null;
}

/**
 * Generate emergency card QR (minimal data for quick access)
 */
export function generateEmergencyQR(patientData: {
  uniqueID: string;
  name: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string[];
}): string {
  const emergencyData = {
    id: patientData.uniqueID,
    name: patientData.name,
    blood: patientData.bloodGroup,
    contact: patientData.emergencyContact,
    allergies: patientData.allergies.join(', '),
    type: 'emergency'
  };

  // For emergency cards, embed data directly in QR
  return JSON.stringify(emergencyData);
}

/**
 * Generate appointment QR (for appointment confirmation)
 */
export function generateAppointmentQR(appointmentData: {
  appointmentID: string;
  patientID: string;
  doctorName: string;
  clinicName: string;
  dateTime: string;
  tokenNumber?: string;
}): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://ihealthclinic.com';
  return `${baseURL}/appointment/verify/${appointmentData.appointmentID}`;
}

/**
 * Generate prescription QR (for pharmacy verification)
 */
export function generatePrescriptionQR(prescriptionData: {
  prescriptionID: string;
  patientID: string;
  doctorID: string;
  issueDate: string;
  validUntil: string;
}): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://ihealthclinic.com';
  return `${baseURL}/prescription/verify/${prescriptionData.prescriptionID}`;
}

/**
 * Generate lab report QR (for report access)
 */
export function generateLabReportQR(reportData: {
  reportID: string;
  patientID: string;
  testType: string;
  reportDate: string;
}): string {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://ihealthclinic.com';
  return `${baseURL}/lab/report/${reportData.reportID}`;
}

/**
 * QR Code access log entry (for tracking who scanned when)
 */
export interface QRAccessLog {
  qrType: 'patient' | 'appointment' | 'prescription' | 'lab';
  qrID: string;
  scannedBy: string;
  scannedByType: 'doctor' | 'clinic' | 'pharmacy' | 'lab';
  scanTime: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: string;
}

/**
 * Log QR code scan (for audit trail)
 */
export function logQRScan(log: QRAccessLog): void {
  // In production, send to backend API
  console.log('QR Scan Log:', log);
  
  // Example API call:
  // fetch('/api/qr/log', {
  //   method: 'POST',
  //   body: JSON.stringify(log),
  //   headers: { 'Content-Type': 'application/json' }
  // });
}

/**
 * Check QR code expiry (for time-limited QR codes)
 */
export function isQRExpired(issuedDate: Date, expiryHours: number = 24): boolean {
  const now = new Date();
  const expiryTime = new Date(issuedDate.getTime() + expiryHours * 60 * 60 * 1000);
  return now > expiryTime;
}

/**
 * Generate time-limited QR code
 */
export function generateTimeLimitedQR(
  data: string,
  expiryHours: number = 24
): {
  qrData: string;
  expiryTime: Date;
} {
  const now = new Date();
  const expiryTime = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);
  
  const payload = {
    data,
    issued: now.toISOString(),
    expires: expiryTime.toISOString()
  };

  return {
    qrData: JSON.stringify(payload),
    expiryTime
  };
}

// Export all functions
export default {
  generatePatientQRURL,
  createPatientQRPayload,
  prepareQRCodeData,
  generateQRFilename,
  validateScannedQR,
  extractPatientIDFromQR,
  generateEmergencyQR,
  generateAppointmentQR,
  generatePrescriptionQR,
  generateLabReportQR,
  logQRScan,
  isQRExpired,
  generateTimeLimitedQR,
  defaultQROptions,
  brandedQROptions
};
