import { appointmentAPI } from './api';

export interface Appointment {
    appointment_id: string;
    patient_id: string;
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    type: string;
    mode: string;
    status: string;
    token_number?: number;
    patient?: {
        full_name: string;
    };
    doctor?: {
        full_name: string;
    };
}

class AppointmentService {
    async getAppointments() {
        try {
            const response = await appointmentAPI.getAll();
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    }

    async createAppointment(data: any) {
        try {
            const response = await appointmentAPI.create(data);
            return response.data.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    }

    async updateStatus(id: string, status: string) {
        try {
            const response = await appointmentAPI.update(id, { status });
            return response.data.data;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }

    async deleteAppointment(id: string) {
        try {
            const response = await appointmentAPI.delete(id);
            return response.data;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            throw error;
        }
    }
}

export const appointmentService = new AppointmentService();
