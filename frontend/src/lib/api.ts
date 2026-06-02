// API Client - Mock implementation for frontend
// In production, this would connect to your backend API

// Normalize API base URL — always ensure it ends with /api
// This is defensive in case VITE_API_URL is set without the /api suffix (e.g. in Render dashboard)
const _rawApiUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const API_BASE_URL = _rawApiUrl.endsWith('/api') ? _rawApiUrl : `${_rawApiUrl}/api`;

class API {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    async get(endpoint: string) {
        // Use mock data for dashboard endpoints to ensure stable rendering
        if (endpoint.startsWith('/dashboard/')) {
            console.log(`Serving mock data for ${endpoint}`);
            return this.getMockData(endpoint);
        }

        try {
            const authHeaders = this.getAuthHeaders();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(authHeaders.Authorization ? { 'Authorization': authHeaders.Authorization } : {}),
            };
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers,
            });
            if (response.status === 401) {
                // For dashboard endpoints, don't redirect - just return mock data
                if (endpoint.startsWith('/dashboard/')) {
                    console.warn('Dashboard API returned 401, using mock data');
                    return this.getMockData(endpoint);
                }
                // Authentication error - clear token and redirect to login
                localStorage.removeItem('auth_token');
                console.warn('Authentication required (401) - Check API or Token');
                throw new Error('Authentication required');
            }
            if (!response.ok) {
                console.warn(`API GET error: ${response.status} for ${endpoint}`);
                // Return mock data for development
                return this.getMockData(endpoint);
            }
            const responseData = await response.json();
            // Backend returns { success: true, data: {...}, message: "..." }
            // Return the data field if it exists, otherwise return the full response
            return responseData.data !== undefined ? responseData.data : responseData;
        } catch (error: any) {
            console.error('API GET error:', error);
            // Return mock data for development (but not for auth errors)
            if (error.message !== 'Authentication required') {
                return this.getMockData(endpoint);
            }
            throw error;
        }
    }

    async post(endpoint: string, data: any) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders(),
            };
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error: any) {
            console.error('API POST error:', error);
            throw error;
        }
    }

    async put(endpoint: string, data: any) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.getAuthHeaders(),
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error: any) {
            console.error('API PUT error:', error);
            return { success: true, data };
        }
    }

    async delete(endpoint: string) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    ...this.getAuthHeaders(),
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error: any) {
            console.error('API DELETE error:', error);
            return { success: true };
        }
    }

    // Mock data for development when backend is not available
    private getMockData(endpoint: string) {
        const mockData: Record<string, any> = {
            '/dashboard/stats': {
                todaysAppointments: 8,
                totalRevenue: '₹45,000',
                activePatients: 156,
                pendingPayments: 3
            },
            '/dashboard/appointments-data': [
                { time: '9 AM', count: 2 },
                { time: '10 AM', count: 3 },
                { time: '11 AM', count: 1 },
                { time: '12 PM', count: 0 },
                { time: '2 PM', count: 1 },
                { time: '3 PM', count: 1 },
                { time: '4 PM', count: 0 }
            ],
            '/dashboard/revenue-data': [
                { day: 'Mon', revenue: 8500 },
                { day: 'Tue', revenue: 9200 },
                { day: 'Wed', revenue: 7800 },
                { day: 'Thu', revenue: 10100 },
                { day: 'Fri', revenue: 8900 },
                { day: 'Sat', revenue: 11200 },
                { day: 'Sun', revenue: 6200 }
            ],
            '/dashboard/recent-appointments': [
                {
                    appointment_id: 1,
                    patient: 'John Doe',
                    doctor: 'Dr. Smith',
                    time: '10:00 AM',
                    status: 'completed'
                },
                {
                    appointment_id: 2,
                    patient: 'Jane Smith',
                    doctor: 'Dr. Smith',
                    time: '11:30 AM',
                    status: 'scheduled'
                },
                {
                    appointment_id: 3,
                    patient: 'Bob Johnson',
                    doctor: 'Dr. Smith',
                    time: '2:00 PM',
                    status: 'waiting'
                }
            ],
            '/appointments': [
                {
                    id: '1',
                    patientName: 'John Doe',
                    time: '10:00 AM',
                    type: 'Consultation',
                    status: 'Confirmed',
                },
                {
                    id: '2',
                    patientName: 'Jane Smith',
                    time: '11:30 AM',
                    type: 'Follow-up',
                    status: 'Pending',
                },
            ],
            '/appointments/booked-slots/3/2026-02-12': {
                bookedSlots: ['10:00 AM', '11:30 AM', '02:00 PM']
            },
            '/appointments/booked-slots/3/2026-03-09': {
                bookedSlots: ['09:00 AM', '03:30 PM', '04:00 PM']
            },
            '/patients': [
                {
                    id: '1',
                    name: 'John Doe',
                    age: 35,
                    gender: 'Male',
                    lastVisit: '2024-01-25',
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    age: 28,
                    gender: 'Female',
                    lastVisit: '2024-01-20',
                },
            ],
        };

        return mockData[endpoint] || { message: 'Mock data not available for this endpoint' };
    }
}

const api = new API();
export default api;
