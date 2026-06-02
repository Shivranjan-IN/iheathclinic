import axios from 'axios';

const _BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${_BASE.replace(/\/$/, '')}/lab`;

const getAuthToken = () => localStorage.getItem('auth_token');

const labService = {
    getDashboardStats: async () => {
        const response = await axios.get(`${API_URL}/dashboard-stats`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getBookings: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params: filters
        });
        return response.data;
    },

    getTransactions: async (filters = {}) => {
        const response = await axios.get(`${API_URL}/transactions`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params: filters
        });
        return response.data;
    },

    bulkAssignTechnicians: async (orderIds: string[], technicianId: number) => {
        const response = await axios.put(`${API_URL}/bookings/bulk-assign`, { orderIds, technicianId }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    bulkUploadReports: async (formData: FormData) => {
        const response = await axios.post(`${API_URL}/reports/bulk-upload`, formData, {
            headers: { 
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    getInventory: async () => {
        const response = await axios.get(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    saveInventory: async (data: any) => {
        const response = await axios.post(`${API_URL}/inventory`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getStaff: async (params = {}) => {
        const response = await axios.get(`${API_URL}/staff`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params
        });
        return response.data;
    },

    onboardStaff: async (staffData: any) => {
        const response = await axios.post(`${API_URL}/staff`, staffData, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getShifts: async () => {
        const response = await axios.get(`${API_URL}/shifts`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    createShift: async (shiftData: any) => {
        const response = await axios.post(`${API_URL}/shifts`, shiftData, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getClinicConnections: async () => {
        const response = await axios.get(`${API_URL}/connections`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },
    
    getPotentialPartners: async () => {
        const response = await axios.get(`${API_URL}/partners`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getMappingReports: async () => {
        const response = await axios.get(`${API_URL}/mapping-reports`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    updateBookingStatus: async (orderId: string, status: string, notes?: string) => {
        const response = await axios.put(`${API_URL}/${orderId}`, { status, notes }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    updateProfile: async (data: any) => {
        const response = await axios.put(`${API_URL}/profile`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getBillingReport: async (filters: any = {}) => {
        const response = await axios.get(`${API_URL}/billing/report`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
            params: filters
        });
        return response.data;
    },

    getManualInvoices: async () => {
        const response = await axios.get(`${API_URL}/billing/invoices`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    createManualInvoice: async (data: any) => {
        const response = await axios.post(`${API_URL}/billing/invoice`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getBillingArchive: async () => {
        const response = await axios.get(`${API_URL}/billing/archive`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getReviews: async () => {
        const response = await axios.get(`${API_URL}/reviews`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    exportReviews: async () => {
        const response = await axios.get(`${API_URL}/reviews/export`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    markReviewHelpful: async (id: number) => {
        const response = await axios.put(`${API_URL}/reviews/${id}/helpful`, {}, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    flagReview: async (id: number) => {
        const response = await axios.put(`${API_URL}/reviews/${id}/flag`, {}, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getReviewArchives: async () => {
        const response = await axios.get(`${API_URL}/reviews/archive`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getScheduling: async () => {
        const response = await axios.get(`${API_URL}/scheduling`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    updateScheduling: async (data: any) => {
        const response = await axios.put(`${API_URL}/scheduling`, data, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    getLabDocuments: async () => {
        const response = await axios.get(`${API_URL}/documents`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    },

    uploadLabDocument: async (file: File, type: string) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('document_type', type);
        const response = await axios.post(`${API_URL}/documents/upload`, formData, {
            headers: { 
                Authorization: `Bearer ${getAuthToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteLabDocument: async (id: number) => {
        const response = await axios.delete(`${API_URL}/documents/${id}`, {
            headers: { Authorization: `Bearer ${getAuthToken()}` }
        });
        return response.data;
    }
};

export default labService;
