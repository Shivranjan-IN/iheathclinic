import axios from 'axios';

// Normalize API base URL — always ensure it ends with /api
const _rawApiUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_BASE_URL = _rawApiUrl.endsWith('/api') ? _rawApiUrl : `${_rawApiUrl}/api`;

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // Avoid hard redirect which resets app state
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    // Fixed path to match backend route `/appointments-data`
    getAppointmentData: () => api.get('/dashboard/appointments-data'),
    getRevenueData: () => api.get('/dashboard/revenue-data'),
    getRecentAppointments: () => api.get('/dashboard/recent-appointments'),
};

// Doctor API
export const doctorAPI = {
    getAll: (params?: { page?: number; limit?: number }) => api.get('/doctors', { params }),
    getById: (id: string) => api.get(`/doctors/${id}`),
    create: (data: any) => api.post('/doctors', data),
    update: (id: string, data: any) => api.put(`/doctors/${id}`, data),
    delete: (id: string) => api.delete(`/doctors/${id}`),
};

// Patient API
export const patientAPI = {
    getAll: (params?: { page?: number; limit?: number }) => api.get('/patients', { params }),
    getById: (id: string) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: string, data: any) => api.put(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
};

// Clinic API
export const clinicAPI = {
    getAll: (params?: { page?: number; limit?: number }) => api.get('/clinics', { params }),
    getById: (id: string) => api.get(`/clinics/${id}`),
    create: (data: any) => api.post('/clinics', data),
    update: (id: string, data: any) => api.put(`/clinics/${id}`, data),
    delete: (id: string) => api.delete(`/clinics/${id}`),
};

// Appointment API
export const appointmentAPI = {
    getAll: (params?: { page?: number; limit?: number; date?: string }) => api.get('/appointments', { params }),
    getById: (id: string) => api.get(`/appointments/${id}`),
    create: (data: any) => api.post('/appointments', data),
    update: (id: string, data: any) => api.put(`/appointments/${id}`, data),
    delete: (id: string) => api.delete(`/appointments/${id}`),
    getAvailableSlots: (params: { doctorId: string; date: string }) => api.get('/appointments/available-slots', { params }),
};

// Auth API
export const authAPI = {
    login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
    register: (data: any) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
};

// Lab API
export const labAPI = {
    getAll: (params?: any) => api.get('/labs', { params }),
    getById: (id: string) => api.get(`/labs/${id}`),
    create: (data: any) => api.post('/labs', data),
    update: (id: string, data: any) => api.put(`/labs/${id}`, data),
    delete: (id: string) => api.delete(`/labs/${id}`),
    getTestTypes: () => api.get('/labs/test-types'),
};

// Analytics API
export const analyticsAPI = {
    getStats: () => api.get('/analytics/stats'),
    getCharts: () => api.get('/analytics/charts'),
};

// Notification API
export const notificationAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
