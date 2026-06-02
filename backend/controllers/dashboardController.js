const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const cache = require('../utils/cache');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;
        const doctorId = req.user.doctor_id;

        const cacheKey = `dashboard_stats_${userId}_${userRole}_${doctorId || ''}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return ResponseHandler.success(res, cachedData, 'Dashboard stats retrieved successfully (cached)');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Todays Appointments
        let todaysAppointmentsWhere = {
            appointment_date: {
                gte: today,
                lt: tomorrow
            }
        };

        if (userRole === 'doctor' && doctorId) {
            // Scope today's appointments to the logged-in doctor
            todaysAppointmentsWhere.doctor_id = doctorId;
        }

        const todaysAppointments = await prisma.appointments.count({
            where: todaysAppointmentsWhere
        });

        // Active Patients (distinct patients in last 30 days)
        const activePatientData = await prisma.appointments.findMany({
            where: {
                appointment_date: {
                    gte: last30Days
                }
            },
            select: {
                patient_id: true
            },
            distinct: ['patient_id']
        });

        const activePatientsCount = activePatientData.length;

        let stats = {
            todaysAppointments: todaysAppointments || 0,
            activePatients: activePatientsCount || 0,
            totalRevenue: '₹0',
            pendingPayments: 0
        };

        // Revenue and Pending Payments (Admin/Receptionist/Doctor)
        if (userRole === 'doctor' && doctorId) {
            // Doctor-specific earnings using doctor_earnings table (see data.sql)
            const doctorRevenue = await prisma.doctor_earnings.findMany({
                where: {
                    doctor_id: doctorId,
                    created_at: {
                        gte: last7Days
                    }
                },
                select: {
                    amount: true,
                    payout_status: true
                }
            });

            const totalRev = doctorRevenue.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
            const pendingCount = doctorRevenue.filter(row => row.payout_status === 'Pending').length;

            stats.totalRevenue = `₹${totalRev.toLocaleString()}`;
            stats.pendingPayments = pendingCount || 0;
        } else if (userRole === 'admin' || userRole === 'receptionist') {
            // Global revenue stats for non-doctor roles using invoices
            const revenueData = await prisma.invoices.findMany({
                where: {
                    invoice_date: {
                        gte: last7Days
                    }
                },
                select: {
                    total_amount: true,
                    status: true
                }
            });

            const totalRev = revenueData.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
            const pendingCount = revenueData.filter(inv => inv.status === 'Pending').length;

            stats.totalRevenue = `₹${totalRev.toLocaleString()}`;
            stats.pendingPayments = pendingCount || 0;
        }

        // Cache the dashboard stats for 5 minutes
        cache.set(cacheKey, stats, 300);

        ResponseHandler.success(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentData = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;
        const doctorId = req.user.doctor_id;

        const cacheKey = `appointment_data_${userId}_${userRole}_${doctorId || ''}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return ResponseHandler.success(res, cachedData, 'Appointment data retrieved successfully (cached)');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let whereClause = {
            appointment_date: {
                gte: today,
                lt: tomorrow
            }
        };

        if (userRole === 'doctor' && doctorId) {
            // Restrict appointment distribution to the logged-in doctor
            whereClause.doctor_id = doctorId;
        }

        const appointmentData = await prisma.appointments.findMany({
            where: whereClause,
            select: { appointment_time: true }
        });

        // Ensure we have data for all time slots (9 AM to 4 PM)
        const timeSlots = ['9 AM', '10 AM', '11 AM', '12 PM', '2 PM', '3 PM', '4 PM'];
        const filledData = timeSlots.map(slot => {
            const count = appointmentData.filter(a => {
                if (!a.appointment_time) return false;
                const timeStr = a.appointment_time.toISOString().split('T')[1].substring(0, 5); // HH:MM
                const hour = parseInt(timeStr.split(':')[0]);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                const displayTime = `${displayHour} ${ampm}`;
                return displayTime === slot;
            }).length;

            return { time: slot, count };
        });

        // Cache the distribution data for 5 minutes
        cache.set(cacheKey, filledData, 300);

        ResponseHandler.success(res, filledData, 'Appointment data retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getRevenueData = async (req, res, next) => {
    try {
        const userRole = req.user.role;
        const doctorId = req.user.doctor_id;

        const cacheKey = `revenue_data_${userRole}_${doctorId || ''}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return ResponseHandler.success(res, cachedData, 'Revenue data retrieved successfully (cached)');
        }

        const last6Days = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
        let revenueRows;

        if (userRole === 'doctor' && doctorId) {
            // Doctor-specific weekly earnings using doctor_earnings table
            revenueRows = await prisma.doctor_earnings.findMany({
                where: {
                    doctor_id: doctorId,
                    created_at: {
                        gte: last6Days
                    }
                },
                select: {
                    amount: true,
                    created_at: true
                }
            });
        } else {
            // Global revenue for other roles using invoices table
            revenueRows = await prisma.invoices.findMany({
                where: {
                    invoice_date: {
                        gte: last6Days
                    }
                },
                select: {
                    total_amount: true,
                    invoice_date: true
                }
            }).then(rows =>
                rows.map(row => ({
                    amount: row.total_amount,
                    created_at: row.invoice_date
                }))
            );
        }

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const filledData = days.map(day => {
            const dayRevenue = revenueRows
                .filter(row => {
                    const date = new Date(row.created_at);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    return dayName === day;
                })
                .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

            return { day, revenue: dayRevenue };
        });

        // Cache the revenue data for 5 minutes
        cache.set(cacheKey, filledData, 300);

        ResponseHandler.success(res, filledData, 'Revenue data retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getRecentAppointments = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role;
        const doctorId = req.user.doctor_id;

        const cacheKey = `recent_appointments_${userRole}_${doctorId || ''}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return ResponseHandler.success(res, cachedData, 'Recent appointments retrieved successfully (cached)');
        }

        let whereClause = {};

        if (userRole === 'doctor' && doctorId) {
            // Only fetch recent appointments for the logged-in doctor
            whereClause.doctor_id = doctorId;
        }

        const appointments = await prisma.appointments.findMany({
            where: whereClause,
            select: {
                appointment_id: true,
                status: true,
                appointment_time: true,
                patient_id: true,
                doctor_id: true
            },
            orderBy: {
                appointment_time: 'desc'
            },
            take: 5
        });

        // Get patient and doctor names separately since Prisma doesn't support joins in select like Supabase
        const patientIds = appointments.map(a => a.patient_id).filter(id => id);
        const doctorIds = appointments.map(a => a.doctor_id).filter(id => id);

        const patients = await prisma.patients.findMany({
            where: {
                patient_id: {
                    in: patientIds
                }
            },
            select: {
                patient_id: true,
                full_name: true
            }
        });

        const doctors = await prisma.doctors.findMany({
            where: {
                id: {
                    in: doctorIds.map(id => parseInt(id))
                }
            },
            select: {
                id: true,
                full_name: true
            }
        });

        const patientMap = patients.reduce((map, p) => {
            map[p.patient_id] = p.full_name;
            return map;
        }, {});

        const doctorMap = doctors.reduce((map, d) => {
            map[d.id.toString()] = d.full_name;
            return map;
        }, {});

        const formattedAppts = appointments.map(a => ({
            appointment_id: a.appointment_id,
            patient: patientMap[a.patient_id] || 'Unknown',
            doctor: doctorMap[a.doctor_id] || 'Unknown',
            time: a.appointment_time,
            status: a.status
        }));

        // Cache the recent appointments for 5 minutes
        cache.set(cacheKey, formattedAppts, 300);

        ResponseHandler.success(res, formattedAppts, 'Recent appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
};

// Invalidation helper for dashboard caches
exports.invalidateDashboardCache = () => {
    cache.delByPrefix('dashboard_stats_');
    cache.delByPrefix('appointment_data_');
    cache.delByPrefix('revenue_data_');
    cache.delByPrefix('recent_appointments_');
};
