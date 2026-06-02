const Appointment = require('../models/appointmentModel');
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');
const cache = require('../utils/cache');
const { createNotification } = require('../utils/notificationHelper');
const { invalidateDashboardCache } = require('./dashboardController');

const clearAllDashboardCaches = () => {
    try {
        invalidateDashboardCache();
        cache.delByPrefix('patient_dashboard_stats_');
    } catch (err) {
        console.error('Failed to invalidate caches:', err);
    }
};

exports.getPatientAppointments = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found in session');
        }
        const appointments = await Appointment.findByPatient(patientId);
        ResponseHandler.success(res, appointments, 'Patient appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingPatientAppointments = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found in session');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointments = await Appointment.findUpcomingByPatient(patientId, today);
        ResponseHandler.success(res, appointments, 'Upcoming patient appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_date } = req.body;
        console.log('Incoming createAppointment request:', {
            payload: req.body,
            timestamp: new Date().toISOString()
        });

        if (!patient_id || !doctor_id || !appointment_date) {
            return ResponseHandler.badRequest(res, 'Missing required parameters for appointment');
        }

        // Generate unique appointment ID
        const generateAppointmentID = () => {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const random = String(Math.floor(Math.random() * 9000) + 1000);
            return `APT-${year}${month}${day}-${hours}${minutes}-${random}`;
        };

        const appointment_id = generateAppointmentID();

        // Parse the appointment_date string to Date object for Prisma (treat as UTC date at midnight)
        const [year, month, day] = appointment_date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed

        let appointmentTime = req.body.appointment_time;
        let timeForValidation = appointmentTime;
        if (appointmentTime) {
            // Standardize to 1970-01-01T[HH:MM:SS].000Z
            if (appointmentTime.includes(':')) {
                // If it is in AM/PM format, convert it first
                if (appointmentTime.includes('AM') || appointmentTime.includes('PM')) {
                    const [time, modifier] = appointmentTime.trim().split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (modifier === 'PM' && hours !== 12) hours += 12;
                    if (modifier === 'AM' && hours === 12) hours = 0;
                    timeForValidation = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                }
                
                const parts = timeForValidation.split(':');
                const hours = parts[0]?.padStart(2, '0') || '00';
                const minutes = parts[1]?.padStart(2, '0') || '00';
                const seconds = parts[2]?.padStart(2, '0') || '00';

                appointmentTime = `1970-01-01T${hours}:${minutes}:${seconds}.000Z`;
                timeForValidation = `${hours}:${minutes}:${seconds}`;
            }
        }

        const timeToMatch = new Date(appointmentTime);

        // 1. Time Slot Validation: Minimum 1 hour after current time
        const selectedDateTime = new Date(utcDate);
        if (timeForValidation) {
            const [h, m, s] = timeForValidation.split(':').map(Number);
            selectedDateTime.setUTCHours(h, m, s || 0, 0);
        }

        const allowedBookingTime = new Date(Date.now() + 60 * 60 * 1000); // Now UTC + 1 hour
        if (selectedDateTime < allowedBookingTime) {
            console.log('Validation failed: Booking is within next 1 hour restriction or in past', {
                selectedDateTime: selectedDateTime.toISOString(),
                allowedBookingTime: allowedBookingTime.toISOString()
            });
            return ResponseHandler.badRequest(res, 'Appointment must be booked at least 1 hour in advance');
        }

        // Run interactive transaction for conflict checks and locking
        const newAppointment = await prisma.$transaction(async (tx) => {
            // Check doctor slot conflict (Step 1)
            const doctorConflict = await tx.appointments.findFirst({
                where: {
                    doctor_id: Number(doctor_id),
                    appointment_date: utcDate,
                    appointment_time: timeToMatch,
                    status: { not: 'cancelled' }
                }
            });

            if (doctorConflict) {
                console.log('Transaction failed: Doctor conflict detected', {
                    doctorId: doctor_id,
                    date: appointment_date,
                    time: appointmentTime
                });
                throw new Error('Selected slot is no longer available.');
            }

            // Check patient conflict (Step 2)
            const patientConflict = await tx.appointments.findFirst({
                where: {
                    patient_id: patient_id,
                    appointment_date: utcDate,
                    appointment_time: timeToMatch,
                    status: { not: 'cancelled' }
                }
            });

            if (patientConflict) {
                console.log('Transaction failed: Patient conflict detected', {
                    patientId: patient_id,
                    date: appointment_date,
                    time: appointmentTime
                });
                throw new Error('You already have another appointment scheduled at this time.');
            }

            // Create appointment (Step 3)
            const created = await tx.appointments.create({
                data: {
                    appointment_id,
                    patient_id: req.body.patient_id,
                    doctor_id: parseInt(req.body.doctor_id),
                    appointment_date: utcDate,
                    appointment_time: appointmentTime,
                    appointment_type: req.body.type,
                    mode: req.body.mode,
                    status: req.body.status || 'scheduled',
                    consult_duration: req.body.consult_duration || 30,
                    earnings: req.body.earnings || 500,
                    reason_for_visit: req.body.reason_for_visit || null
                }
            });

            return created;
        });

        console.log('Transaction succeeded: Appointment created', {
            appointment_id: newAppointment.appointment_id
        });

        // Notify patient
        try {
            const patientRecord = await prisma.patients.findUnique({
                where: { patient_id: patient_id },
                select: { user_id: true }
            });
            if (patientRecord?.user_id) {
                await createNotification({
                    userId: patientRecord.user_id,
                    type: 'APPOINTMENT',
                    title: 'Appointment Confirmed',
                    message: `Upcoming consultation on ${new Date(appointment_date).toLocaleDateString()} at ${req.body.appointment_time || 'scheduled time'}`
                });
            }
        } catch (err) {
            console.error('Error sending appointment notification:', err);
        }

        const todayCount = await prisma.appointments.count({
            where: {
                doctor_id: parseInt(req.body.doctor_id),
                appointment_date: utcDate,
                status: { not: 'cancelled' }
            }
        });

        clearAllDashboardCaches();

        ResponseHandler.created(res, {
            ...newAppointment,
            token_number: todayCount
        }, 'Appointment booked successfully.');
    } catch (error) {
        console.error('Exception in createAppointment:', {
            message: error.message,
            stack: error.stack,
            payload: req.body
        });
        
        return ResponseHandler.badRequest(res, error.message || 'Failed to book appointment. Please try again.');
    }
};

exports.getAllAppointments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        const appointments = await Appointment.findAll(limit, offset);
        const total = await prisma.appointments.count({
            where: { status: { not: 'cancelled' } }
        });

        ResponseHandler.success(res, {
            appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, 'Scheduled encounters retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return ResponseHandler.notFound(res, 'Encounter coordinates not found');
        }
        ResponseHandler.success(res, appointment, 'Rendezvous details accessed');
    } catch (error) {
        next(error);
    }
};

exports.getAppointmentsByPatient = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID is required');
        }

        const appointments = await Appointment.findByPatient(patientId);

        ResponseHandler.success(res, appointments, 'Patient appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingAppointments = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID is required');
        }

        // Get today's date at start of day in local timezone
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.findUpcomingByPatient(patientId, today);

        const response = {
            count: appointments.length,
            appointments: appointments
        };

        ResponseHandler.success(res, response, 'Upcoming appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getDoctorAppointments = async (req, res, next) => {
    try {
        const doctor_id = req.user.doctor_id || req.query.doctor_id;
        if (!doctor_id) {
            return ResponseHandler.badRequest(res, 'Doctor ID is required');
        }

        // Data isolation: ensure doctor can only see their own appointments
        if (req.user.role === 'doctor' && req.user.doctor_id && req.user.doctor_id.toString() !== doctor_id.toString()) {
            return ResponseHandler.forbidden(res, 'Access denied to other doctor\'s appointments');
        }

        const filters = {
            doctor_id,
            type: req.query.type, // 'all', 'in-clinic', 'online'
            dateFilter: req.query.dateFilter, // 'today', 'yesterday', 'tomorrow', 'custom'
            from: req.query.from,
            to: req.query.to
        };

        const appointments = await Appointment.findDoctorAppointments(filters);
        ResponseHandler.success(res, appointments, 'Doctor appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.startAppointment = async (req, res, next) => {
    try {
        const { appointment_id } = req.body;
        if (!appointment_id) return ResponseHandler.badRequest(res, 'Appointment ID required');

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) return ResponseHandler.notFound(res, 'Appointment not found');

        // Check if doctor owns this appointment
        if (appointment.doctor_id.toString() !== req.user.doctor_id.toString()) {
            return ResponseHandler.forbidden(res, 'You are not authorized to start this appointment');
        }

        const updated = await Appointment.updateStatus(appointment_id, 'in_progress');
        clearAllDashboardCaches();
        ResponseHandler.success(res, updated, 'Appointment started');
    } catch (error) {
        next(error);
    }
};

exports.updateStatusFromPost = async (req, res, next) => {
    try {
        const { appointment_id, status } = req.body;
        if (!appointment_id || !status) return ResponseHandler.badRequest(res, 'Appointment ID and status required');

        const updated = await Appointment.updateStatus(appointment_id, status);
        clearAllDashboardCaches();
        ResponseHandler.updated(res, updated, 'Appointment status updated');
    } catch (error) {
        next(error);
    }
};

exports.rescheduleAppointment = async (req, res, next) => {
    try {
        const { appointment_id, appointment_date, appointment_time } = req.body;
        
        if (!appointment_id || !appointment_date || !appointment_time) {
            return ResponseHandler.badRequest(res, 'Missing reschedule parameters');
        }

        const appointment = await Appointment.findById(appointment_id);
        if (!appointment) {
            return ResponseHandler.notFound(res, 'Appointment not found');
        }

        // Standardize date and time for comparison and storage
        const [year, month, day] = appointment_date.split('-').map(Number);
        const utcDate = new Date(Date.UTC(year, month - 1, day));
        
        let formattedTime = appointment_time;
        if (appointment_time.includes('AM') || appointment_time.includes('PM')) {
            const [time, modifier] = appointment_time.trim().split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours !== 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }

        const timeForDB = `1970-01-01T${formattedTime}.000Z`;

        const updateData = {
            appointment_date: utcDate,
            appointment_time: timeForDB,
            status: 'scheduled'
        };

        // Use interactive transaction for reschedule conflict checks
        const updated = await prisma.$transaction(async (tx) => {
            const doctorConflict = await tx.appointments.findFirst({
                where: {
                    doctor_id: Number(appointment.doctor_id),
                    appointment_date: utcDate,
                    appointment_time: new Date(timeForDB),
                    appointment_id: { not: appointment_id },
                    status: { not: 'cancelled' }
                }
            });
            if (doctorConflict) {
                throw new Error('Selected slot is no longer available.');
            }

            const patientConflict = await tx.appointments.findFirst({
                where: {
                    patient_id: appointment.patient_id,
                    appointment_date: utcDate,
                    appointment_time: new Date(timeForDB),
                    appointment_id: { not: appointment_id },
                    status: { not: 'cancelled' }
                }
            });
            if (patientConflict) {
                throw new Error('You already have another appointment scheduled at this time.');
            }

            return await tx.appointments.update({
                where: { appointment_id: appointment_id },
                data: updateData
            });
        });
        
        // Notify patient of reschedule
        try {
            if (updated.patient_id) {
                const patientRecord = await prisma.patients.findUnique({
                    where: { patient_id: updated.patient_id },
                    select: { user_id: true }
                });
                if (patientRecord?.user_id) {
                    await createNotification({
                        userId: patientRecord.user_id,
                        type: 'APPOINTMENT',
                        title: 'Appointment Rescheduled',
                        message: `Your appointment has been moved to ${new Date(appointment_date).toLocaleDateString()} at ${appointment_time}`
                    });
                }
            }
        } catch (err) {
            console.error('Error sending reschedule notification:', err);
        }

        clearAllDashboardCaches();
        ResponseHandler.updated(res, updated, 'Appointment rescheduled');
    } catch (error) {
        console.error('Error in rescheduleAppointment:', error);
        return ResponseHandler.badRequest(res, error.message || 'Failed to reschedule appointment. Please try again.');
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        await Appointment.delete(id);
        clearAllDashboardCaches();
        ResponseHandler.success(res, null, 'Appointment deleted');
    } catch (error) {
        next(error);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) return ResponseHandler.badRequest(res, 'Status update required');

        const updated = await Appointment.updateStatus(req.params.id, status);
        if (!updated) {
            return ResponseHandler.notFound(res, 'Appointment not found');
        }
        clearAllDashboardCaches();
        ResponseHandler.updated(res, updated, 'Appointment status updated');

        // Notify patient of status update
        try {
            if (updated.patient_id) {
                const patientRecord = await prisma.patients.findUnique({
                    where: { patient_id: updated.patient_id },
                    select: { user_id: true }
                });
                
                if (patientRecord?.user_id) {
                    let title = 'Appointment Update';
                    let message = `Your appointment status has been updated to ${status.replace('_', ' ')}`;
                    
                    if (status.toLowerCase() === 'completed') {
                        title = 'Consultation Completed';
                        message = 'Your consultation is now complete. Feel free to view your prescription and visit summary.';
                    }

                    await createNotification({
                        userId: patientRecord.user_id,
                        type: 'APPOINTMENT',
                        title: title,
                        message: message
                    });
                }
            }
        } catch (err) {
            console.error('Error sending status update notification:', err);
        }
    } catch (error) {
        next(error);
    }
};

exports.getBookedSlots = async (req, res, next) => {
    try {
        const { doctorId, date } = req.params;
        const { patientId } = req.query;
        if (!doctorId || !date) return ResponseHandler.badRequest(res, 'Doctor ID and date are required');

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(Date.UTC(year, month - 1, day));
        const dayName = days[dateObj.getUTCDay()];

        // Query Prisma for doctor_time_slots configuration
        const slotsConfig = await prisma.doctor_time_slots.findMany({
            where: {
                doctor_id: Number(doctorId),
                day_of_week: dayName
            }
        });

        let startTimeStr = '09:00:00';
        let endTimeStr = '17:00:00';
        if (slotsConfig && slotsConfig.length > 0) {
            const ts = slotsConfig[0];
            const startHour = new Date(ts.start_time).getUTCHours();
            const startMin = new Date(ts.start_time).getUTCMinutes();
            const endHour = new Date(ts.end_time).getUTCHours();
            const endMin = new Date(ts.end_time).getUTCMinutes();
            
            startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`;
            endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`;
        }

        const generatedSlots = [];
        const [startH, startM] = startTimeStr.split(':').map(Number);
        const [endH, endM] = endTimeStr.split(':').map(Number);
        
        let currentHour = startH;
        let currentMin = startM;
        
        while (currentHour < endH || (currentHour === endH && currentMin < endM)) {
            const ampm = currentHour >= 12 ? 'PM' : 'AM';
            const displayHour = currentHour % 12 || 12;
            const timeString = `${displayHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')} ${ampm}`;
            const time24 = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}:00`;
            
            generatedSlots.push({
                time: timeString,
                time24: time24,
                hour: currentHour,
                minute: currentMin
            });
            
            currentMin += 30;
            if (currentMin >= 60) {
                currentHour += 1;
                currentMin -= 60;
            }
        }

        const nextDay = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);
        
        const whereClause = {
            appointment_date: {
                gte: dateObj,
                lt: nextDay
            },
            status: {
                notIn: ['cancelled']
            },
            doctor_id: Number(doctorId)
        };
        
        if (patientId) {
            whereClause.OR = [
                { doctor_id: Number(doctorId) },
                { patient_id: patientId }
            ];
            delete whereClause.doctor_id;
        }

        const bookings = await prisma.appointments.findMany({
            where: whereClause,
            select: {
                appointment_id: true,
                appointment_time: true,
                doctor_id: true,
                patient_id: true
            }
        });

        const bookedTimes = new Set();
        const patientConfTimes = new Set();
        for (const booking of bookings) {
            if (!booking.appointment_time) continue;
            const t = new Date(booking.appointment_time);
            const timeStr24 = `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')}:00`;
            if (booking.doctor_id === Number(doctorId)) {
                bookedTimes.add(timeStr24);
            }
            if (patientId && booking.patient_id === patientId) {
                patientConfTimes.add(timeStr24);
            }
        }

        // Zone-safe today check (India timezone offsets +5.5 hours)
        const nowLocal = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const nowYear = nowLocal.getUTCFullYear();
        const nowMonth = nowLocal.getUTCMonth() + 1;
        const nowDate = nowLocal.getUTCDate();
        const nowISTStr = `${nowYear}-${nowMonth.toString().padStart(2, '0')}-${nowDate.toString().padStart(2, '0')}`;
        const isToday = (date === nowISTStr);

        const limitTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000 + 60 * 60 * 1000); // Now IST + 1 hour
        const limitHour = limitTime.getUTCHours();
        const limitMin = limitTime.getUTCMinutes();

        const slotStatuses = generatedSlots.map(s => {
            let status = 'available';
            if (bookedTimes.has(s.time24) || patientConfTimes.has(s.time24)) {
                status = 'booked';
            } else if (isToday) {
                if (s.hour < limitHour || (s.hour === limitHour && s.minute < limitMin)) {
                    status = 'expired';
                }
            }
            return {
                time: s.time,
                status
            };
        });

        ResponseHandler.success(res, {
            slots: slotStatuses,
            bookedSlots: generatedSlots
                .filter(s => bookedTimes.has(s.time24) || patientConfTimes.has(s.time24))
                .map(s => s.time)
        }, 'Booked time slots retrieved successfully');
    } catch (error) {
        next(error);
    }
};
