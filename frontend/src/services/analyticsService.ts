import { analyticsAPI } from './api';

export interface DashboardStats {
    totalAppointments: number;
    totalPatients: number;
    totalRevenue: number;
    avgRating: number;
}

export interface ChartData {
    dailyAppointments: { date: string, count: number }[];
    revenueTrend: { month: string, revenue: number }[];
    visitDist: { name: string, value: number }[];
    doctorPerf: { name: string, consultations: number, revenue: number, rating: number }[];
}

export const analyticsService = {
    async getStats() {
        try {
            const response = await analyticsAPI.getStats();
            return response.data.data as DashboardStats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    async getChartData() {
        try {
            const response = await analyticsAPI.getCharts();
            return response.data.data as ChartData;
        } catch (error) {
            console.error('Error fetching chart data:', error);
            throw error;
        }
    }
};
