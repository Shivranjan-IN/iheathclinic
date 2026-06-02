import { dashboardAPI } from './api';

export interface DashboardStats {
    todaysAppointments: number;
    activePatients: number;
    totalRevenue: string;
    pendingPayments: number;
}

export interface AppointmentChartData {
    time: string;
    count: number;
}

export interface RevenueChartData {
    day: string;
    revenue: number;
}

export interface RecentAppointment {
    appointment_id: number | string;
    patient: string;
    doctor: string;
    time: string;
    status: string;
}

class DashboardService {
    async getStats(): Promise<DashboardStats> {
        try {
            const response = await dashboardAPI.getStats();
            // Backend wraps results as { success, message, data }
            return (response.data?.data ?? response.data) as DashboardStats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getAppointmentData(): Promise<AppointmentChartData[]> {
        try {
            const response = await dashboardAPI.getAppointmentData();
            return (response.data?.data ?? response.data) as AppointmentChartData[];
        } catch (error) {
            console.error('Error fetching appointment data:', error);
            throw error;
        }
    }

    async getRevenueData(): Promise<RevenueChartData[]> {
        try {
            const response = await dashboardAPI.getRevenueData();
            return (response.data?.data ?? response.data) as RevenueChartData[];
        } catch (error) {
            console.error('Error fetching revenue data:', error);
            throw error;
        }
    }

    async getRecentAppointments(): Promise<RecentAppointment[]> {
        try {
            const response = await dashboardAPI.getRecentAppointments();
            return (response.data?.data ?? response.data) as RecentAppointment[];
        } catch (error) {
            console.error('Error fetching recent appointments:', error);
            throw error;
        }
    }
}

export const dashboardService = new DashboardService();
