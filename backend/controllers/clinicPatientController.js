const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

// Helper to get all doctor IDs associated with the clinic
const getClinicDoctorIds = async (clinicId) => {
    const mappings = await prisma.doctor_clinic_mapping.findMany({
        where: { clinic_id: clinicId },
        select: { doctor_id: true }
    });
    return mappings.map(m => m.doctor_id);
};

exports.getTodayPatients = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await prisma.appointments.findMany({
            where: {
                doctor_id: { in: doctorIds },
                appointment_date: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                patient: true,
                doctor: true
            },
            orderBy: {
                appointment_time: 'asc'
            }
        });

        ResponseHandler.success(res, appointments, 'Retrieved today\'s patient roster');
    } catch (error) {
        next(error);
    }
};

exports.getUpcomingPatients = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const appointments = await prisma.appointments.findMany({
            where: {
                doctor_id: { in: doctorIds },
                appointment_date: {
                    gte: tomorrow
                },
                status: 'scheduled'
            },
            include: {
                patient: true,
                doctor: true
            },
            orderBy: {
                appointment_date: 'asc'
            }
        });

        ResponseHandler.success(res, appointments, 'Retrieved upcoming scheduled patients');
    } catch (error) {
        next(error);
    }
};

exports.getCompletedPatients = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const appointments = await prisma.appointments.findMany({
            where: {
                doctor_id: { in: doctorIds },
                status: 'completed'
            },
            include: {
                patient: true,
                doctor: true
            },
            orderBy: {
                appointment_date: 'desc'
            }
        });

        ResponseHandler.success(res, appointments, 'Retrieved completed patient records');
    } catch (error) {
        next(error);
    }
};

exports.getAllPatients = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const patients = await prisma.patients.findMany({
            where: {
                appointments: {
                    some: {
                        doctor_id: { in: doctorIds }
                    }
                }
            }
        });

        ResponseHandler.success(res, patients, 'Total patient database synchronized');
    } catch (error) {
        next(error);
    }
};

// Search patient by mobile or email
exports.searchPatient = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query || query.trim().length < 3) {
            return ResponseHandler.badRequest(res, 'Search query must be at least 3 characters');
        }

        const searchTerm = query.trim();

        // Search by email in emails table
        const emailMatches = await prisma.emails.findMany({
            where: {
                email: { contains: searchTerm, mode: 'insensitive' }
            },
            include: { users: true }
        });

        // Search by phone in contact_numbers table
        const phoneMatches = await prisma.contact_numbers.findMany({
            where: {
                phone_number: { contains: searchTerm }
            },
            include: { users: true }
        });

        // Collect unique user IDs from both searches
        const userIds = new Set();
        emailMatches.forEach(e => { if (e.user_id) userIds.add(e.user_id); });
        phoneMatches.forEach(p => { if (p.user_id) userIds.add(p.user_id); });

        // Find patients linked to these users
        let patients = [];
        if (userIds.size > 0) {
            patients = await prisma.patients.findMany({
                where: {
                    user_id: { in: Array.from(userIds) }
                },
                include: {
                    users: {
                        include: {
                            emails: true,
                            contact_numbers: true
                        }
                    },
                    address_record: true
                }
            });
        }

        // Also search by patient name for convenience
        const nameMatches = await prisma.patients.findMany({
            where: {
                full_name: { contains: searchTerm, mode: 'insensitive' }
            },
            include: {
                users: {
                    include: {
                        emails: true,
                        contact_numbers: true
                    }
                },
                address_record: true
            }
        });

        // Merge and deduplicate
        const allPatients = [...patients];
        const existingIds = new Set(patients.map(p => p.patient_id));
        nameMatches.forEach(p => {
            if (!existingIds.has(p.patient_id)) {
                allPatients.push(p);
            }
        });

        // Map for easy frontend display
        const result = allPatients.map(p => ({
            patient_id: p.patient_id,
            full_name: p.full_name,
            gender: p.gender,
            date_of_birth: p.date_of_birth,
            blood_group: p.blood_group,
            abha_id: p.abha_id,
            email: p.users?.emails?.[0]?.email || null,
            phone: p.users?.contact_numbers?.[0]?.phone_number || null,
            address: p.address?.address || null,
            city: p.address?.city || null,
            user_id: p.user_id,
            profile_photo_url: p.profile_photo_url
        }));

        ResponseHandler.success(res, result, `Found ${result.length} patient(s)`);
    } catch (error) {
        next(error);
    }
};

// Add patient (create new) and optionally book appointment
exports.addPatient = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { full_name, email, phone, gender, date_of_birth, blood_group, abha_id, address } = req.body;

        if (!full_name) {
            return ResponseHandler.badRequest(res, 'Full name is required');
        }
        if (!email && !phone) {
            return ResponseHandler.badRequest(res, 'Either email or phone is required');
        }

        // Check if patient already exists by email or phone
        let existingPatient = null;

        if (email) {
            const emailRecord = await prisma.emails.findFirst({
                where: { email: email.trim() }
            });
            if (emailRecord && emailRecord.user_id) {
                existingPatient = await prisma.patients.findFirst({
                    where: { user_id: emailRecord.user_id }
                });
            }
        }

        if (!existingPatient && phone) {
            const phoneRecord = await prisma.contact_numbers.findFirst({
                where: { phone_number: phone.trim() }
            });
            if (phoneRecord && phoneRecord.user_id) {
                existingPatient = await prisma.patients.findFirst({
                    where: { user_id: phoneRecord.user_id }
                });
            }
        }

        if (existingPatient) {
            return ResponseHandler.success(res, {
                patient: existingPatient,
                is_existing: true
            }, 'Patient already exists in the system');
        }

        // Create new user first
        const newUser = await prisma.users.create({
            data: {
                full_name,
                password_hash: 'google_oauth_pending',
                role: 'patient',
                is_active: true
            }
        });

        // Create email record
        if (email) {
            await prisma.emails.create({
                data: {
                    user_id: newUser.user_id,
                    email: email.trim(),
                    is_primary: true
                }
            });
        }

        // Create phone record
        if (phone) {
            await prisma.contact_numbers.create({
                data: {
                    user_id: newUser.user_id,
                    phone_number: phone.trim(),
                    is_primary: true
                }
            });
        }

        // Create address if provided
        let addressId = null;
        if (address) {
            const newAddress = await prisma.addresses.create({
                data: { address }
            });
            addressId = newAddress.address_id;
        }

        // Create patient record
        const patientId = `PAT-${Date.now()}`;
        const newPatient = await prisma.patients.create({
            data: {
                patient_id: patientId,
                full_name,
                gender: gender || null,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                blood_group: blood_group || null,
                abha_id: abha_id || null,
                user_id: newUser.user_id,
                address_id: addressId
            }
        });

        ResponseHandler.created(res, {
            patient: newPatient,
            is_existing: false
        }, 'New patient created successfully');
    } catch (error) {
        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return ResponseHandler.badRequest(res, 'A user with this email or phone already exists');
        }
        next(error);
    }
};

// Book appointment - map patient with clinic doctor
exports.bookAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const { patient_id, doctor_id, appointment_date, appointment_time, type, reason } = req.body;

        if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
            return ResponseHandler.badRequest(res, 'patient_id, doctor_id, appointment_date and appointment_time are required');
        }

        // Verify doctor belongs to this clinic
        const docId = parseInt(doctor_id);
        if (!doctorIds.includes(docId)) {
            return ResponseHandler.forbidden(res, 'Selected doctor is not associated with this clinic');
        }

        // Verify patient exists
        const patient = await prisma.patients.findUnique({
            where: { patient_id }
        });
        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient not found');
        }

        const appointmentId = `APT-${Date.now()}`;
        const newAppointment = await prisma.appointments.create({
            data: {
                appointment_id: appointmentId,
                patient_id,
                doctor_id: docId,
                appointment_date: new Date(appointment_date),
                appointment_time: new Date(`1970-01-01T${appointment_time}`),
                appointment_type: type || 'consultation',
                reason_for_visit: reason || '',
                status: 'scheduled',
                clinic_id: clinicId
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        ResponseHandler.created(res, newAppointment, 'Appointment booked successfully');
    } catch (error) {
        next(error);
    }
};

// Get doctors for the clinic (for appointment booking dropdown)
exports.getClinicDoctors = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;

        const mappings = await prisma.doctor_clinic_mapping.findMany({
            where: { clinic_id: clinicId },
            include: {
                doctors: {
                    include: {
                        doctor_specializations: {
                            include: { specializations_master: true }
                        }
                    }
                }
            }
        });

        const doctors = mappings.map(m => ({
            id: m.doctors.id,
            full_name: m.doctors.full_name,
            specializations: m.doctors.doctor_specializations.map(
                ds => ds.specializations_master?.specialization_name || 'General'
            ).join(', '),
            profile_photo_url: m.doctors.profile_photo_url
        }));

        ResponseHandler.success(res, doctors, 'Clinic doctors retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getAppointments = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const appointments = await prisma.appointments.findMany({
            where: {
                doctor_id: { in: doctorIds }
            },
            include: {
                patient: true,
                doctor: true
            }
        });

        ResponseHandler.success(res, appointments, 'All clinic appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const { patient_id, doctor_id, appointment_date, appointment_time, type, reason } = req.body;

        // Verify doctor belongs to this clinic
        if (!doctorIds.includes(parseInt(doctor_id))) {
            return ResponseHandler.forbidden(res, 'Target doctor is not assigned to this facility');
        }

        const appointmentId = `APT-${Date.now()}`;
        const newAppointment = await prisma.appointments.create({
            data: {
                appointment_id: appointmentId,
                patient_id,
                doctor_id: parseInt(doctor_id),
                appointment_date: new Date(appointment_date),
                appointment_time: new Date(`1970-01-01T${appointment_time}`),
                appointment_type: type || 'consultation',
                reason_for_visit: reason || '',
                status: 'scheduled'
            }
        });

        ResponseHandler.created(res, newAppointment, 'Appointment synchronized with schedule');
    } catch (error) {
        next(error);
    }
};

exports.updateAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);
        const { id } = req.params;

        const appointment = await prisma.appointments.findUnique({
            where: { appointment_id: id }
        });

        if (!appointment || !doctorIds.includes(appointment.doctor_id)) {
            return ResponseHandler.notFound(res, 'Appointment not found in clinic records');
        }

        const updated = await prisma.appointments.update({
            where: { appointment_id: id },
            data: req.body
        });

        ResponseHandler.success(res, updated, 'Appointment recalibrated');
    } catch (error) {
        next(error);
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);
        const { id } = req.params;

        const appointment = await prisma.appointments.findUnique({
            where: { appointment_id: id }
        });

        if (!appointment || !doctorIds.includes(appointment.doctor_id)) {
            return ResponseHandler.notFound(res, 'Appointment not found in clinic records');
        }

        await prisma.appointments.delete({
            where: { appointment_id: id }
        });

        ResponseHandler.success(res, null, 'Appointment purged from registry');
    } catch (error) {
        next(error);
    }
};

exports.getQueue = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const queue = await prisma.appointments.findMany({
            where: {
                doctor_id: { in: doctorIds },
                appointment_date: {
                    gte: today,
                    lt: tomorrow
                },
                status: { in: ['scheduled', 'in-progress'] }
            },
            include: {
                patient: true,
                doctor: true
            },
            orderBy: {
                appointment_time: 'asc'
            }
        });

        ResponseHandler.success(res, queue, 'Dynamic queue pulse synchronized');
    } catch (error) {
        next(error);
    }
};

exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const doctorIds = await getClinicDoctorIds(clinicId);
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await prisma.appointments.findUnique({
            where: { appointment_id: id }
        });

        if (!appointment || !doctorIds.includes(appointment.doctor_id)) {
            return ResponseHandler.notFound(res, 'Appointment not found in clinic records');
        }

        const updated = await prisma.appointments.update({
            where: { appointment_id: id },
            data: { status }
        });

        ResponseHandler.success(res, updated, `Appointment status recalibrated to ${status}`);
    } catch (error) {
        next(error);
    }
};
