// Clinic Service - API implementation for backend
// Uses HTTP requests to backend API

const API_BASE_URL = (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
    : 'http://localhost:5000');

export interface Clinic {
    id: number;
    clinic_name: string;
    establishment_year?: number;
    tagline?: string;
    description?: string;
    landmark?: string;
    website?: string;
    mobile_verified?: boolean;
    email_verified?: boolean;
    medical_council_reg_no: string;
    terms_accepted?: boolean;
    declaration_accepted?: boolean;
    verification_status: string;
    created_at?: string;
    updated_at?: string;
    user_id?: number;
    address_id?: number;
    // Flattened from related tables
    email?: string;
    mobile?: string;
    pan_number?: string;
    gstin?: string;
    bank_account_name?: string;
    bank_account_number?: string;
    ifsc_code?: string;
    // Address
    address?: {
        address_id: number;
        address?: string;
        city?: string;
        state?: string;
        pin_code?: string;
    };
    // Related data
    clinic_services?: { id: number; service?: string }[];
    clinic_facilities?: { id: number; facility?: string }[];
    clinic_payment_modes?: { id: number; payment_mode?: string }[];
    clinic_booking_modes?: { id: number; booking_mode?: string }[];
    clinic_documents?: any[];
    doctor_clinic_mapping?: any[];
    stats?: {
        total_doctors: number;
        total_staff: number;
        total_appointments: number;
        total_patients: number;
    };
}

export interface SearchPatientResult {
    patient_id: string;
    full_name: string;
    gender?: string;
    date_of_birth?: string;
    blood_group?: string;
    abha_id?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    user_id?: number;
    profile_photo_url?: string;
}

export interface ClinicDoctor {
    id: number;
    full_name: string;
    specializations: string;
    profile_photo_url?: string;
}

class ClinicService {
    private async getAuthHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    // 1 & 2. Profile Management
    async getProfile(): Promise<Clinic | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/profile`, {
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error('Error fetching clinic profile:', error);
            return null;
        }
    }

    async updateProfile(updates: Partial<Clinic> & Record<string, any>): Promise<Clinic | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/profile`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error('Error updating clinic profile:', error);
            throw error;
        }
    }

    // Patient Search
    async searchPatient(query: string): Promise<SearchPatientResult[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/patients/search?query=${encodeURIComponent(query)}`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error searching patients:', error);
            return [];
        }
    }

    // Add new patient
    async addNewPatient(patientData: {
        full_name: string;
        email?: string;
        phone?: string;
        gender?: string;
        date_of_birth?: string;
        blood_group?: string;
        abha_id?: string;
        address?: string;
    }): Promise<{ patient: any; is_existing: boolean } | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/patients`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(patientData),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to add patient');
            }
            return result.data;
        } catch (error) {
            console.error('Error adding patient:', error);
            throw error;
        }
    }

    // Book appointment (patient + doctor mapping)
    async bookAppointment(data: {
        patient_id: string;
        doctor_id: number;
        appointment_date: string;
        appointment_time: string;
        type?: string;
        reason?: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments/book`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to book appointment');
            }
            return result.data;
        } catch (error) {
            console.error('Error booking appointment:', error);
            throw error;
        }
    }

    // Get clinic doctors for booking dropdown
    async getClinicDoctorsList(): Promise<ClinicDoctor[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors/list`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching clinic doctors list:', error);
            return [];
        }
    }

    // 12. Reports & Analytics
    async getReports(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/reports`, {
                headers: await this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching clinic reports:', error);
            throw error;
        }
    }

    // 3. Patient Management
    async getPatients(type?: 'today' | 'upcoming' | 'completed'): Promise<any[]> {
        try {
            const url = type ? `${API_BASE_URL}/api/clinics/patients/${type}` : `${API_BASE_URL}/api/clinics/patients`;
            const response = await fetch(url, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error(`Error fetching patients:`, error);
            return [];
        }
    }

    async getAllPatients(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data?.map((a: any) => a.patient) || [];
        } catch (error) {
            console.error('Error fetching all patients:', error);
            return [];
        }
    }

    // 5. Queue Management
    async getQueue(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/queue`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching queue:', error);
            return [];
        }
    }

    async updateAppointmentStatus(appointmentId: string, status: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ status }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            return false;
        }
    }

    // 6. Doctor Management
    async getDoctors(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching clinic doctors:', error);
            return [];
        }
    }

    async registerDoctor(doctorData: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(doctorData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error registering doctor:', error);
            return false;
        }
    }

    async updateDoctor(doctorId: number | string, doctorData: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors/${doctorId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(doctorData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating doctor:', error);
            return false;
        }
    }

    async addDoctor(doctorId: number | string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ doctor_id: doctorId }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error adding doctor to clinic:', error);
            return false;
        }
    }

    async removeDoctor(doctorId: number | string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/doctors/${doctorId}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            return response.ok;
        } catch (error) {
            console.error('Error removing doctor from clinic:', error);
            return false;
        }
    }

    // 7. Staff Management
    async getStaff(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/staff`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching clinic staff:', error);
            return [];
        }
    }

    async addStaff(staffData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/staff`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(staffData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error adding staff member:', error);
            throw error;
        }
    }

    async updateStaff(staffId: number | string, updates: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/staff/${staffId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error updating staff member:', error);
            throw error;
        }
    }

    async deleteStaff(staffId: number | string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/staff/${staffId}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting staff member:', error);
            return false;
        }
    }

    // 8. Prescription & Medical Records
    async getPrescriptions(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/prescriptions`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            return [];
        }
    }

    // 9. Lab & Diagnostics
    async getLabs(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching labs:', error);
            return [];
        }
    }

    async getLabOrders(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/orders`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching lab orders:', error);
            return [];
        }
    }

    async createLabOrder(orderData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/orders`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating lab order:', error);
            throw error;
        }
    }

    async getConnectedLabs(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/connected`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching connected labs:', error);
            return [];
        }
    }

    async getSystemLabs(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/system-provided`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching system labs:', error);
            return [];
        }
    }

    async connectSystemLab(labId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/connect-system`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify({ lab_id: labId }),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error connecting system lab:', error);
            throw error;
        }
    }

    async connectManualLab(labData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/connect-manual`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(labData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error connecting manual lab:', error);
            throw error;
        }
    }

    async disconnectLab(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs/connected/${id}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.success || false;
        } catch (error) {
            console.error('Error disconnecting lab:', error);
            return false;
        }
    }

    async addLab(labData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/labs`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(labData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error adding lab test:', error);
            throw error;
        }
    }

    // 10. Billing & Payments
    async getBilling(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/billing`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching billing data:', error);
            return [];
        }
    }

    async searchBillingPatients(query: string): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/billing/patients/search?query=${encodeURIComponent(query)}`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error searching billing patients:', error);
            return [];
        }
    }

    async createInvoice(invoiceData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/billing`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(invoiceData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    }

    async updateInvoiceStatus(invoiceId: string, updates: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/billing/${invoiceId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating invoice status:', error);
            return false;
        }
    }

    // Legacy support for older components
    async getClinics(): Promise<Clinic[]> {
        const profile = await this.getProfile();
        return profile ? [profile] : [];
    }

    async updateClinic(_id: any, updates: Partial<Clinic>): Promise<Clinic | null> {
        return this.updateProfile(updates);
    }

    // 13. Notifications
    async getNotifications(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/notifications`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching clinic notifications:', error);
            return [];
        }
    }

    // 14. Settings
    async getSettings(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/settings`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || {};
        } catch (error) {
            console.error('Error fetching clinic settings:', error);
            return {};
        }
    }

    async updateSettings(settings: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/settings`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(settings),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating clinic settings:', error);
            return false;
        }
    }

    // 15. Support
    async submitTicket(ticketData: { type: string; subject: string; description: string }): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/support/ticket`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(ticketData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Ticket submission failed');
            return true;
        } catch (error) {
            console.error('Error submitting ticket:', error);
            return false;
        }
    }

    // 16. Send Notification
    async sendNotification(data: {
        channel: string;
        category: string;
        recipient: string;
        title: string;
        message: string;
    }): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/notifications`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Broadcast failed');
            return true;
        } catch (error) {
            console.error('Error sending notification:', error);
            return false;
        }
    }

    // Pharmacy & Inventory (Medicines)
    async getMedicines(mineOnly: boolean = false): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/medicines?mine=${mineOnly}`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching medicines:', error);
            return [];
        }
    }

    async addMedicine(medicineData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/medicines`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(medicineData),
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error adding medicine:', error);
            throw error;
        }
    }

    // 4. Appointment Management
    async getAppointments(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments`, {
                headers: await this.getAuthHeaders(),
            });
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
    }

    async createAppointment(appointmentData: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments`, {
                method: 'POST',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(appointmentData),
            });
            return response.ok;
        } catch (error) {
            console.error('Error creating appointment:', error);
            return false;
        }
    }
    async updateAppointment(appointmentId: string | number, updates: any): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: await this.getAuthHeaders(),
                body: JSON.stringify(updates),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating appointment:', error);
            return false;
        }
    }

    async deleteAppointment(appointmentId: string | number): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinics/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting appointment:', error);
            return false;
        }
    }

    // --- Clinic Documents ---
    async getClinicDocuments(): Promise<any[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinic-documents`, {
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching clinic documents:', error);
            throw error;
        }
    }

    async uploadClinicDocument(file: File, type: string): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('document_type', type);

            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_BASE_URL}/api/clinic-documents/upload`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: formData
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading clinic document:', error);
            throw error;
        }
    }

    async deleteClinicDocument(documentId: number): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clinic-documents/${documentId}`, {
                method: 'DELETE',
                headers: await this.getAuthHeaders(),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('Error deleting clinic document:', error);
            return false;
        }
    }
}

export const clinicService = new ClinicService();
