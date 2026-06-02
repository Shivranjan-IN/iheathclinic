import { prescriptionAPI } from './api';

export interface Medicine {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

export interface LabTest {
    test_name: string;
    instructions: string;
}

export interface Prescription {
    prescription_id: string;
    patient_id: string;
    doctor_id?: number;
    appointment_id?: string;
    diagnosis: string;
    follow_up_date?: string;
    notes?: string;
    created_at?: string;
    medicines?: Medicine[];
    lab_tests?: LabTest[];
    patient?: {
        full_name: string;
    };
    doctor?: {
        full_name: string;
    };
}

class PrescriptionService {
    async getPrescriptions() {
        try {
            const response = await prescriptionAPI.getAll();
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            throw error;
        }
    }

    async createPrescription(data: Partial<Prescription>) {
        try {
            const response = await prescriptionAPI.create(data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating prescription:', error);
            throw error;
        }
    }

    async getPrescriptionById(id: string) {
        try {
            const response = await prescriptionAPI.getById(id);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching prescription:', error);
            throw error;
        }
    }

    async getPatientPrescriptions(patientId: string) {
        try {
            const response = await prescriptionAPI.getByPatient(patientId);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching patient prescriptions:', error);
            throw error;
        }
    }
}

export const prescriptionService = new PrescriptionService();
