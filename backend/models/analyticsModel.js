const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const analyticsModel = {
    // Get daily appointment counts for the last 7 days
    getDailyAppointments: async (clinicId, doctorId) => {
        let query = Prisma.sql`
            SELECT 
                TO_CHAR(appointment_date, 'Mon DD') as date,
                COALESCE(COUNT(*)::int, 0) as count
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE - INTERVAL '30 days'
        `;

        if (clinicId) {
            query = Prisma.sql`${query} AND clinic_id = ${clinicId}`;
        }
        if (doctorId) {
            query = Prisma.sql`${query} AND doctor_id = ${doctorId}`;
        }

        query = Prisma.sql`${query} GROUP BY appointment_date ORDER BY appointment_date ASC`;
        
        return await prisma.$queryRaw(query);
    },

    // Get monthly revenue trend
    getRevenueTrend: async (clinicId, doctorId) => {
        let query = Prisma.sql`
            SELECT 
                TO_CHAR(appointment_date, 'Mon') as month,
                COALESCE(SUM(earnings)::float, 0) as revenue
            FROM appointments
            WHERE appointment_date >= CURRENT_DATE - INTERVAL '6 months'
        `;

        if (clinicId) {
            query = Prisma.sql`${query} AND clinic_id = ${clinicId}`;
        }
        if (doctorId) {
            query = Prisma.sql`${query} AND doctor_id = ${doctorId}`;
        }

        query = Prisma.sql`${query} GROUP BY TO_CHAR(appointment_date, 'Mon'), DATE_TRUNC('month', appointment_date)
            ORDER BY DATE_TRUNC('month', appointment_date) ASC`;
        
        return await prisma.$queryRaw(query);
    },

    // Get patient visit distribution (New vs Follow-up)
    getPatientVisitDistribution: async (clinicId, doctorId) => {
        let query = Prisma.sql`
            SELECT 
                COALESCE(appointment_type, 'General') as name,
                COUNT(*)::int as value
            FROM appointments
            WHERE 1=1
        `;

        if (clinicId) {
            query = Prisma.sql`${query} AND clinic_id = ${clinicId}`;
        }
        if (doctorId) {
            query = Prisma.sql`${query} AND doctor_id = ${doctorId}`;
        }

        query = Prisma.sql`${query} GROUP BY appointment_type`;
        
        return await prisma.$queryRaw(query);
    },

    // Get doctor performance metrics
    getDoctorPerformance: async (clinicId, doctorId) => {
        let query = Prisma.sql`
            SELECT 
                d.full_name as name,
                COALESCE(COUNT(a.appointment_id)::int, 0) as consultations,
                COALESCE(SUM(a.earnings)::float, 0) as revenue,
                4.8 as rating
            FROM doctors d
            LEFT JOIN appointments a ON d.id = a.doctor_id
            WHERE 1=1
        `;

        if (clinicId) {
            query = Prisma.sql`${query} AND a.clinic_id = ${clinicId}`;
        }
        if (doctorId) {
            query = Prisma.sql`${query} AND d.id = ${doctorId}`;
        }

        query = Prisma.sql`${query} GROUP BY d.id, d.full_name ORDER BY revenue DESC`;
        
        return await prisma.$queryRaw(query);
    },

    // Key Dashboard Metrics
    getDashboardStats: async (clinicId, doctorId) => {
        const where = {};
        if (clinicId) where.clinic_id = parseInt(clinicId);
        if (doctorId) where.doctor_id = parseInt(doctorId);

        const [totalAppointments, totalPatients, totalRevenue] = await Promise.all([
            prisma.appointments.count({ where }),
            doctorId 
                ? prisma.appointments.groupBy({
                    by: ['patient_id'],
                    where: { doctor_id: parseInt(doctorId) },
                    _count: true
                }).then(res => res.length)
                : prisma.patients.count(),
            prisma.appointments.aggregate({
                where,
                _sum: {
                    earnings: true
                }
            })
        ]);

        return {
            totalAppointments,
            totalPatients,
            totalRevenue: totalRevenue._sum.earnings || 0,
            avgRating: 4.75
        };
    }
};

module.exports = analyticsModel;
