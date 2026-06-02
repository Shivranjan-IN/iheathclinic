const prisma = require('../config/database');

class Appointment {
    static async create(appointmentData) {
        try {
            const data = await prisma.appointments.create({
                data: appointmentData
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0) {
        try {
            const data = await prisma.appointments.findMany({
                orderBy: { appointment_date: 'desc' },
                take: limit,
                skip: offset
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const data = await prisma.appointments.findUnique({
                where: { appointment_id: id },
                include: {
                    patient: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByDoctor(doctorId) {
        try {
            const data = await prisma.appointments.findMany({
                where: { doctor_id: Number(doctorId) },
                orderBy: { appointment_date: 'asc' },
                include: {
                    patient: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByPatient(patientId) {
        try {
            return await prisma.appointments.findMany({
                where: { patient_id: patientId },
                include: {
                    doctor: {
                        select: {
                            full_name: true,
                            qualifications: true
                        }
                    },
                    clinic: {
                        select: {
                            clinic_name: true
                        }
                    }
                },
                orderBy: { appointment_date: 'desc' }
            });
        } catch (error) {
            throw error;
        }
    }

    static async findUpcomingByPatient(patientId, today) {
        try {
            const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

            return await prisma.appointments.findMany({
                where: {
                    patient_id: patientId,
                    appointment_date: {
                        gte: todayUTC
                    }
                },
                include: {
                    doctor: {
                        select: {
                            full_name: true,
                            qualifications: true
                        }
                    },
                    clinic: {
                        select: {
                            clinic_name: true
                        }
                    }
                },
                orderBy: { appointment_date: 'asc' }
            });
        } catch (error) {
            throw error;
        }
    }

    static async findDoctorAppointments(filters) {
        try {
            const { doctor_id, type, dateFilter, from, to } = filters;
            let where = { doctor_id: Number(doctor_id) };

            if (type && type !== 'all') {
                if (type === 'online') {
                    where.mode = 'video';
                } else if (type === 'in-clinic') {
                    where.mode = 'in-person';
                }
            }

            // Use UTC-based date ranges for reliable comparisons
            const todayUTC = new Date();
            todayUTC.setUTCHours(0, 0, 0, 0);

            if (dateFilter === 'today') {
                const tomorrowUTC = new Date(todayUTC);
                tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
                where.appointment_date = { gte: todayUTC, lt: tomorrowUTC };
            } else if (dateFilter === 'yesterday') {
                const yesterdayUTC = new Date(todayUTC);
                yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
                where.appointment_date = { gte: yesterdayUTC, lt: todayUTC };
            } else if (dateFilter === 'tomorrow') {
                const tomorrowUTC = new Date(todayUTC);
                tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);
                const dayAfterUTC = new Date(tomorrowUTC);
                dayAfterUTC.setUTCDate(dayAfterUTC.getUTCDate() + 1);
                where.appointment_date = { gte: tomorrowUTC, lt: dayAfterUTC };
            } else if (dateFilter === 'custom' && from && to) {
                const toEnd = new Date(to);
                toEnd.setUTCHours(23, 59, 59, 999);
                where.appointment_date = {
                    gte: new Date(from),
                    lte: toEnd
                };
            }
            // 'all' or no dateFilter = no date restriction

            const data = await prisma.appointments.findMany({
                where,
                include: {
                    patient: true
                },
                orderBy: { appointment_date: 'asc' }
            });

            return data;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            return await prisma.appointments.update({
                where: { appointment_id: id },
                data: { status }
            });
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            return await prisma.appointments.update({
                where: { appointment_id: id },
                data: updateData
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.appointments.delete({
                where: { appointment_id: id }
            });
        } catch (error) {
            throw error;
        }
    }

    static async getBookedSlots(doctorId, date, patientId = null) {
        try {
            const [year, month, day] = date.split('-').map(Number);
            const utcDate = new Date(Date.UTC(year, month - 1, day));
            const nextDay = new Date(utcDate.getTime() + 24 * 60 * 60 * 1000);

            const where = {
                appointment_date: {
                    gte: utcDate,
                    lt: nextDay
                },
                status: {
                    notIn: ['cancelled']
                },
                OR: [
                    { doctor_id: Number(doctorId) }
                ]
            };

            if (patientId) {
                where.OR.push({ patient_id: patientId });
            }

            const data = await prisma.appointments.findMany({
                where,
                select: {
                    appointment_id: true,
                    appointment_time: true
                }
            });

            const bookedSlots = data.map(appointment => {
                let timeVal = appointment.appointment_time;
                if (!timeVal) return null;

                // Handle Date object (common with Prisma for Time types)
                if (timeVal instanceof Date) {
                    const hour = timeVal.getUTCHours();
                    const minute = timeVal.getUTCMinutes();
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
                }

                // Handle strings
                const timeStr = String(timeVal);
                if (timeStr.includes('AM') || timeStr.includes('PM')) {
                    const [time, modifier] = timeStr.trim().split(' ');
                    const [hours, minutes] = time.split(':');
                    const hour = parseInt(hours, 10);
                    const displayHour = hour.toString().padStart(2, '0');
                    return `${displayHour}:${minutes} ${modifier}`;
                }

                // If ISO string
                if (timeStr.includes('T')) {
                    const date = new Date(timeStr);
                    const hour = date.getUTCHours();
                    const minute = date.getUTCMinutes();
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
                }

                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
            }).filter(Boolean);

            return bookedSlots;
        } catch (error) {
            console.error('Error in getBookedSlots:', error);
            throw error;
        }
    }

    static async findExisting(doctorId, date, time) {
        try {
            const [year, month, day] = date.split('-').map(Number);
            const utcDate = new Date(Date.UTC(year, month - 1, day));
            const nextDay = new Date(utcDate.getTime() + 24 * 60 * 60 * 1000);

            // Standardize time for DB comparison (1970-01-01T09:00:00.000Z)
            let timeToMatch;
            if (time.includes('AM') || time.includes('PM')) {
                const [t, mod] = time.trim().split(' ');
                let [h, m] = t.split(':').map(Number);
                if (mod === 'PM' && h !== 12) h += 12;
                if (mod === 'AM' && h === 12) h = 0;
                timeToMatch = new Date(`1970-01-01T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00.000Z`);
            } else if (time.includes(':') && !time.includes('T')) {
                const parts = time.split(':');
                const h = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                timeToMatch = new Date(`1970-01-01T${h}:${m}:00.000Z`);
            } else {
                timeToMatch = new Date(time);
            }

            const appointment = await prisma.appointments.findFirst({
                where: {
                    doctor_id: Number(doctorId),
                    appointment_date: { gte: utcDate, lt: nextDay },
                    appointment_time: timeToMatch,
                    status: { not: 'cancelled' }
                }
            });
            return appointment;
        } catch (error) {
            throw error;
        }
    }

    static async findConflictingAppointment(doctorId, patientId, date, time) {
        try {
            const [year, month, day] = date.split('-').map(Number);
            const utcDate = new Date(Date.UTC(year, month - 1, day));
            const nextDay = new Date(utcDate.getTime() + 24 * 60 * 60 * 1000);

            let timeToMatch;
            if (time.includes('AM') || time.includes('PM')) {
                const [t, mod] = time.trim().split(' ');
                let [h, m] = t.split(':').map(Number);
                if (mod === 'PM' && h !== 12) h += 12;
                if (mod === 'AM' && h === 12) h = 0;
                timeToMatch = new Date(`1970-01-01T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00.000Z`);
            } else if (time.includes(':') && !time.includes('T')) {
                const parts = time.split(':');
                const h = parts[0].padStart(2, '0');
                const m = parts[1].padStart(2, '0');
                timeToMatch = new Date(`1970-01-01T${h}:${m}:00.000Z`);
            } else {
                timeToMatch = new Date(time);
            }

            const appointment = await prisma.appointments.findFirst({
                where: {
                    appointment_date: { gte: utcDate, lt: nextDay },
                    appointment_time: timeToMatch,
                    status: { not: 'cancelled' },
                    OR: [
                        { doctor_id: Number(doctorId) },
                        { patient_id: patientId }
                    ]
                }
            });
            return appointment;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Appointment;
