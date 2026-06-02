// Unique Health ID Generator for I Health Clinic System
// Generates unique IDs for Patients, Doctors, and Clinics

export type UserType = 'patient' | 'doctor' | 'clinic';

interface UniqueIDConfig {
  prefix: string;
  includeDate: boolean;
  includeRandom: boolean;
  sequenceLength: number;
}

/**
 * Generates a unique health ID based on user type
 * Format: PREFIX-YYYYMMDD-SEQUENCE-RANDOM
 * Examples:
 * - PAT-20250113-000123-4567
 * - DOC-20250113-000045-8901
 * - CLN-20250113-000012-2345
 */
export function generateUniqueHealthID(
  userType: UserType,
  sequence: number = 1
): string {
  const config: Record<UserType, UniqueIDConfig> = {
    patient: {
      prefix: 'PAT',
      includeDate: true,
      includeRandom: true,
      sequenceLength: 6
    },
    doctor: {
      prefix: 'DOC',
      includeDate: true,
      includeRandom: true,
      sequenceLength: 5
    },
    clinic: {
      prefix: 'CLN',
      includeDate: true,
      includeRandom: true,
      sequenceLength: 5
    }
  };

  const settings = config[userType];
  const parts: string[] = [settings.prefix];

  // Add date component (YYYYMMDD)
  if (settings.includeDate) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    parts.push(`${year}${month}${day}`);
  }

  // Add sequence number
  const sequenceStr = String(sequence).padStart(settings.sequenceLength, '0');
  parts.push(sequenceStr);

  // Add random component for extra uniqueness
  if (settings.includeRandom) {
    const random = Math.floor(Math.random() * 9000) + 1000; // 4-digit random
    parts.push(String(random));
  }

  return parts.join('-');
}

/**
 * Validates if a health ID follows the correct format
 */
export function validateHealthID(healthID: string): {
  isValid: boolean;
  type: UserType | null;
  error?: string;
} {
  const pattern = /^(PAT|DOC|CLN)-(\d{8})-(\d{5,6})-(\d{4})$/;
  const match = healthID.match(pattern);

  if (!match) {
    return {
      isValid: false,
      type: null,
      error: 'Invalid ID format'
    };
  }

  const typeMap: Record<string, UserType> = {
    PAT: 'patient',
    DOC: 'doctor',
    CLN: 'clinic'
  };

  return {
    isValid: true,
    type: typeMap[match[1]]
  };
}

/**
 * Extracts information from a health ID
 */
export function parseHealthID(healthID: string): {
  type: UserType | null;
  date: Date | null;
  sequence: number | null;
  random: number | null;
} {
  const validation = validateHealthID(healthID);
  
  if (!validation.isValid) {
    return { type: null, date: null, sequence: null, random: null };
  }

  const parts = healthID.split('-');
  const [prefix, dateStr, sequenceStr, randomStr] = parts;

  // Parse date (YYYYMMDD)
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const date = new Date(year, month, day);

  return {
    type: validation.type,
    date,
    sequence: parseInt(sequenceStr),
    random: parseInt(randomStr)
  };
}

/**
 * Generate ABHA-like ID (Ayushman Bharat Health Account)
 * Format: 12-3456-7890-1234 (14 digits in groups of 2-4-4-4)
 */
export function generateABHAID(): string {
  const part1 = String(Math.floor(Math.random() * 90) + 10); // 2 digits
  const part2 = String(Math.floor(Math.random() * 9000) + 1000); // 4 digits
  const part3 = String(Math.floor(Math.random() * 9000) + 1000); // 4 digits
  const part4 = String(Math.floor(Math.random() * 9000) + 1000); // 4 digits

  return `${part1}-${part2}-${part3}-${part4}`;
}

/**
 * Generate appointment ID
 * Format: APT-YYMMDD-HHMM-XXXX
 */
export function generateAppointmentID(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);

  return `APT-${year}${month}${day}-${hours}${minutes}-${random}`;
}

/**
 * Generate prescription ID
 * Format: RX-YYYYMMDD-DOCID-XXXX
 */
export function generatePrescriptionID(doctorSequence: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);

  return `RX-${year}${month}${day}-${doctorSequence}-${random}`;
}

/**
 * Generate invoice ID
 * Format: INV-YYYYMMDD-XXXX
 */
export function generateInvoiceID(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);

  return `INV-${year}${month}${day}-${random}`;
}

/**
 * Generate lab test ID
 * Format: LAB-YYYYMMDD-TESTTYPE-XXXX
 */
export function generateLabTestID(testType: string = 'GEN'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 9000) + 1000);

  return `LAB-${year}${month}${day}-${testType.toUpperCase()}-${random}`;
}

/**
 * Get next sequence number from database (mock implementation)
 * In production, this should query the database for the last sequence
 */
export async function getNextSequence(userType: UserType): Promise<number> {
  // Mock implementation - in production, query database
  // Example: SELECT MAX(sequence) FROM users WHERE type = userType
  return Math.floor(Math.random() * 1000) + 1;
}

/**
 * Complete ID generation with database check
 */
export async function createUniqueHealthID(userType: UserType): Promise<string> {
  const sequence = await getNextSequence(userType);
  return generateUniqueHealthID(userType, sequence);
}

// Export all generator functions
export default {
  generateUniqueHealthID,
  validateHealthID,
  parseHealthID,
  generateABHAID,
  generateAppointmentID,
  generatePrescriptionID,
  generateInvoiceID,
  generateLabTestID,
  getNextSequence,
  createUniqueHealthID
};
