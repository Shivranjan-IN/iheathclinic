const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const Doctor = require('../models/doctorModel');

/**
 * Patient Management
 */

exports.getDoctorPatients = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { filter, startDate, endDate } = req.query;

        let whereClause = {};

        if (filter === 'WithAppointments') {
            // Requirement: dropdown show only patients with booked appointments with THIS doctor
            whereClause.appointments = {
                some: {
                    doctor_id: doctorId
                }
            };
        } else {
            // Default: patients assigned to this doctor
            whereClause.appointments = {
                some: {
                    doctor_id: doctorId
                }
            };

            if (filter === 'Today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                whereClause.created_at = { gte: today, lt: tomorrow };
            } else if (filter === 'Custom' && startDate && endDate) {
                whereClause.created_at = { gte: new Date(startDate), lte: new Date(endDate) };
            } else if (filter === 'Upcoming') {
                // Patients with upcoming appointments
                whereClause.appointments = {
                    some: {
                        doctor_id: doctorId,
                        appointment_date: { gte: new Date() },
                        status: 'scheduled'
                    }
                };
            }
        }

        const patients = await prisma.patients.findMany({
            where: whereClause,
            orderBy: { full_name: 'asc' }
        });

        ResponseHandler.success(res, patients, 'Doctor\'s patient roster retrieved');
    } catch (error) {
        next(error);
    }
};

exports.deleteDoctorPatient = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { id } = req.params;

        const patient = await prisma.patients.findFirst({
            where: {
                patient_id: id,
                appointments: {
                    some: {
                        doctor_id: doctorId
                    }
                }
            }
        });

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient not found or not authorized to delete');
        }

        await prisma.patients.delete({
            where: { patient_id: id }
        });

        ResponseHandler.success(res, null, 'Patient record purged successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Appointment Management
 */

exports.getDoctorAppointments = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { status, mode } = req.query;

        let whereClause = { doctor_id: doctorId };
        if (status) {
            whereClause.status = status;
        }
        // Filter by mode: 'online' maps to appointments with mode='online' or 'video'
        if (mode === 'online') {
            whereClause.mode = { in: ['online', 'video', 'Online', 'Video'] };
        }

        const appointments = await prisma.appointments.findMany({
            where: whereClause,
            include: {
                patient: true
            },
            orderBy: [
                { appointment_date: 'asc' },
                { appointment_time: 'asc' }
            ]
        });

        ResponseHandler.success(res, appointments, 'Doctor\'s appointments retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createDoctorAppointment = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const {
            patient_id, // optional if creating new patient
            full_name, age, gender, phone, email, // patient details if new
            appointment_date, appointment_time, type, reason
        } = req.body;

        let targetPatientId = patient_id;

        // If no patient_id, create new patient linked to this doctor
        if (!targetPatientId) {
            targetPatientId = `PAT-${Date.now()}`;
            // Contact info (phone/email) are in users/emails/contact_numbers tables
            // For ad-hoc patient creation in this controller, we'll just skip them if they aren't on the patients table
            await prisma.patients.create({
                data: {
                    patient_id: targetPatientId,
                    full_name,
                    age: age ? parseInt(age) : null,
                    gender,
                    doctor_id: doctorId
                }
            });
        }

        const appointmentId = `APT-${Date.now()}`;
        
        // Find clinic_id from mapping if not provided
        let clinicId = req.body.clinic_id;
        if (!clinicId) {
            const mapping = await prisma.doctor_clinic_mapping.findFirst({
                where: { doctor_id: doctorId }
            });
            clinicId = mapping?.clinic_id;
        }

        const newAppointment = await prisma.appointments.create({
            data: {
                appointment_id: appointmentId,
                patient_id: targetPatientId,
                doctor_id: doctorId,
                clinic_id: clinicId,
                appointment_date: new Date(appointment_date),
                appointment_time: appointment_time, // Expecting HH:mm or full ISO
                type: type || 'Consultation',
                reason_for_visit: reason || '',
                status: 'scheduled'
            }
        });

        ResponseHandler.created(res, newAppointment, 'Appointment scheduled successfully');
    } catch (error) {
        next(error);
    }
};

exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { id } = req.params;
        const { status } = req.body;

        if (!['in_progress', 'cancelled', 'completed', 'scheduled'].includes(status)) {
            return ResponseHandler.badRequest(res, 'Invalid status transition');
        }

        const appointment = await prisma.appointments.findFirst({
            where: { appointment_id: id, doctor_id: doctorId }
        });

        if (!appointment) {
            return ResponseHandler.notFound(res, 'Appointment not found');
        }

        const updated = await prisma.appointments.update({
            where: { appointment_id: id },
            data: { status }
        });

        ResponseHandler.success(res, updated, `Appointment status updated to ${status}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Prescription Management
 */

exports.getDoctorPrescriptions = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { filter, date } = req.query;

        let whereClause = { doctor_id: doctorId };

        if (filter === 'Today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            whereClause.created_at = {
                gte: startOfDay,
                lte: endOfDay
            };
        } else if (filter === 'Yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999);
            whereClause.created_at = {
                gte: yesterday,
                lte: endOfYesterday
            };
        } else if (filter === 'Custom' && date) {
            const customDate = new Date(date);
            customDate.setHours(0, 0, 0, 0);
            const endOfCustom = new Date(customDate);
            endOfCustom.setHours(23, 59, 59, 999);
            whereClause.created_at = {
                gte: customDate,
                lte: endOfCustom
            };
        } else if (filter === 'All' || !filter) {
            // No date constraint
        }

        const prescriptions = await prisma.prescriptions.findMany({
            where: whereClause,
            include: {
                patient: {
                    include: {
                        patient_documents: true
                    }
                },
                medicines: true,
                lab_tests: true,
                appointments: true
            },
            orderBy: { created_at: 'desc' }
        });

        ResponseHandler.success(res, prescriptions, 'Doctor\'s prescription records retrieved');
    } catch (error) {
        next(error);
    }
};

exports.createDoctorPrescription = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { appointment_id, patient_id, diagnosis, notes, medicines, lab_tests, follow_up_date } = req.body;

        // Verify appointment ownership
        const appointment = await prisma.appointments.findFirst({
            where: { appointment_id: appointment_id, doctor_id: doctorId }
        });

        if (!appointment) {
            return ResponseHandler.forbidden(res, 'Unauthorized to create prescription for this appointment');
        }

        const prescriptionId = `RX-${Date.now()}`;
        const medicinesList = Array.isArray(medicines) ? medicines : [];
        const labTestsList = Array.isArray(lab_tests) ? lab_tests : [];

        // Determine clinic_id from appointment or doctor mapping
        let clinicId = appointment.clinic_id;
        if (!clinicId) {
            const mapping = await prisma.doctor_clinic_mapping.findFirst({
                where: { doctor_id: doctorId }
            });
            clinicId = mapping?.clinic_id;
        }

        // Process medicines to link with inventory if possible
        const processedMedicines = await Promise.all(medicinesList.map(async (m) => {
            const mName = m.name || m.medicine_name;
            let medicineId = m.medicine_id || null;

            // If no ID but we have a name and clinicId, try to find it in inventory
            if (!medicineId && mName && clinicId) {
                const invItem = await prisma.medicines.findFirst({
                    where: {
                        clinic_id: clinicId,
                        medicine_name: { contains: mName, mode: 'insensitive' }
                    }
                });
                if (invItem) {
                    medicineId = invItem.medicine_id;
                }
            }

            return {
                medicine_name: mName,
                medicine_id: medicineId,
                dosage: m.dosage,
                frequency: m.frequency,
                duration: m.duration
            };
        }));

        const newPrescription = await prisma.prescriptions.create({
            data: {
                prescription_id: prescriptionId,
                patient_id,
                doctor_id: doctorId,
                appointment_id,
                clinic_id: clinicId,
                diagnosis,
                notes,
                follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
                medicines: {
                    create: processedMedicines
                },
                lab_tests: {
                    create: labTestsList.map(t => ({
                        test_name: t.name || t.test_name
                    }))
                }
            }
        });

        // Auto-complete the appointment when prescription is created
        await prisma.appointments.update({
            where: { appointment_id: appointment_id },
            data: { status: 'completed' }
        });

        ResponseHandler.created(res, newPrescription, 'Prescription generated and appointment completed');
    } catch (error) {
        next(error);
    }
};

/**
 * Dashboard Stats
 */

exports.getDoctorStats = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;

        const [totalPatients, pendingAppointments, completedAppointments] = await Promise.all([
            prisma.patients.count({ where: { doctor_id: doctorId } }),
            prisma.appointments.count({ where: { doctor_id: doctorId, status: 'scheduled' } }),
            prisma.appointments.count({ where: { doctor_id: doctorId, status: 'completed' } })
        ]);

        ResponseHandler.success(res, {
            totalPatients,
            pendingAppointments,
            completedAppointments
        }, 'Doctor dashboard stats synchronized');
    } catch (error) {
        next(error);
    }
};

/**
 * Profile Management
 */

exports.getDoctorProfile = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return ResponseHandler.notFound(res, 'Doctor profile not found');
        }

        ResponseHandler.success(res, doctor, 'Doctor profile retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.updateDoctorProfile = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.id;
        delete updates.user_id;
        delete updates.email;

        // Handle single specialization mapping
        if (updates.specialization !== undefined) {
            const spec = updates.specialization;
            delete updates.specialization;
            await prisma.doctor_specializations.deleteMany({ where: { doctor_id: doctorId } });
            if (spec) {
                await Doctor.insertSpecializations(doctorId, [spec]);
            }
        }

        // Handle multi-value fields separately
        const { specializations, languages, consultationModes } = updates;
        delete updates.specializations;
        delete updates.languages;
        delete updates.consultationModes;
        delete updates.consultation_modes;

        // Update related tables if provided
        if (specializations) {
            await prisma.doctor_specializations.deleteMany({ where: { doctor_id: doctorId } });
            await Doctor.insertSpecializations(doctorId, specializations);
        }
        if (languages) {
            await prisma.doctor_languages.deleteMany({ where: { doctor_id: doctorId } });
            await Doctor.insertLanguages(doctorId, languages);
        }
        if (consultationModes) {
            await prisma.doctor_consultation_modes.deleteMany({ where: { doctor_id: doctorId } });
            await Doctor.insertConsultationModes(doctorId, consultationModes);
        }

        // Retrieve user_id from doctors table to update user relations
        const doctor = await prisma.doctors.findUnique({
            where: { id: doctorId }
        });
        const userId = doctor.user_id;

        // Handle mobile mapping (contact_numbers table)
        if (updates.mobile !== undefined) {
            const mobileValue = updates.mobile;
            delete updates.mobile;
            const existing = await prisma.contact_numbers.findFirst({
                where: { user_id: userId, is_primary: true }
            });
            if (existing) {
                await prisma.contact_numbers.update({
                    where: { contact_id: existing.contact_id },
                    data: { phone_number: mobileValue }
                });
            } else {
                await prisma.contact_numbers.create({
                    data: {
                        user_id: userId,
                        phone_number: mobileValue,
                        is_primary: true
                    }
                });
            }
        }

        // Handle bank account mapping (bank_accounts table)
        if (updates.bank_account_name !== undefined || updates.bank_account_number !== undefined || updates.ifsc_code !== undefined) {
            const bankAccountName = updates.bank_account_name;
            const bankAccountNumber = updates.bank_account_number;
            const ifscCode = updates.ifsc_code;
            delete updates.bank_account_name;
            delete updates.bank_account_number;
            delete updates.ifsc_code;

            const existing = await prisma.bank_accounts.findFirst({
                where: { user_id: userId }
            });
            if (existing) {
                await prisma.bank_accounts.update({
                    where: { bank_id: existing.bank_id },
                    data: {
                        account_holder_name: bankAccountName,
                        account_number: bankAccountNumber,
                        ifsc_code: ifscCode
                    }
                });
            } else {
                await prisma.bank_accounts.create({
                    data: {
                        user_id: userId,
                        account_holder_name: bankAccountName || '',
                        account_number: bankAccountNumber || '',
                        ifsc_code: ifscCode || '',
                        bank_name: ''
                    }
                });
            }
        }

        // Handle tax details mapping (tax_details table)
        if (updates.pan_number !== undefined || updates.gstin !== undefined) {
            const panNumber = updates.pan_number;
            const gstin = updates.gstin;
            delete updates.pan_number;
            delete updates.gstin;

            const existing = await prisma.tax_details.findFirst({
                where: { user_id: userId }
            });
            if (existing) {
                await prisma.tax_details.update({
                    where: { tax_id: existing.tax_id },
                    data: {
                        pan_number: panNumber,
                        gstin: gstin
                    }
                });
            } else {
                await prisma.tax_details.create({
                    data: {
                        user_id: userId,
                        pan_number: panNumber || '',
                        gstin: gstin || ''
                    }
                });
            }
        }

        const updatedDoctor = await prisma.doctors.update({
            where: { id: doctorId },
            data: {
                ...updates,
                updated_at: new Date()
            },
            include: {
                doctor_specializations: {
                    include: {
                        specializations_master: true
                    }
                },
                doctor_languages: true,
                doctor_consultation_modes: true,
                users: {
                    include: {
                        emails: { where: { is_primary: true } },
                        contact_numbers: { where: { is_primary: true } },
                        bank_accounts: true,
                        tax_details: true
                    }
                }
            }
        });

        // Map back for response
        const responseData = {
            ...updatedDoctor,
            specialization: updatedDoctor.doctor_specializations.length > 0 ? updatedDoctor.doctor_specializations[0].specializations_master?.specialization_name : '',
            specializations: updatedDoctor.doctor_specializations.map(s => s.specializations_master?.specialization_name),
            languages: updatedDoctor.doctor_languages.map(l => l.language),
            consultation_modes: updatedDoctor.doctor_consultation_modes.map(m => m.consultation_mode),
            email: updatedDoctor.users?.emails?.[0]?.email || '',
            mobile: updatedDoctor.users?.contact_numbers?.[0]?.phone_number || '',
            bank_account_name: updatedDoctor.users?.bank_accounts?.[0]?.account_holder_name || '',
            bank_account_number: updatedDoctor.users?.bank_accounts?.[0]?.account_number || '',
            ifsc_code: updatedDoctor.users?.bank_accounts?.[0]?.ifsc_code || '',
            pan_number: updatedDoctor.users?.tax_details?.[0]?.pan_number || '',
            gstin: updatedDoctor.users?.tax_details?.[0]?.gstin || ''
        };

        ResponseHandler.success(res, responseData, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
};

exports.getAllDoctors = async (req, res, next) => {
    try {
        const { clinic_id } = req.query;
        
        let whereClause = {
            verification_status: { in: ['VERIFIED', 'COMPLETE', 'verified', 'complete', 'PENDING', 'pending'] }
        };

        if (clinic_id) {
            whereClause.doctor_clinic_mapping = {
                some: {
                    clinic_id: parseInt(clinic_id)
                }
            };
        }

        const doctors = await prisma.doctors.findMany({
            where: whereClause,
            include: {
                doctor_specializations: {
                    include: {
                        specializations_master: true
                    }
                },
                doctor_languages: true,
                doctor_clinic_mapping: {
                    include: {
                        clinics: {
                            include: {
                                address: true
                            }
                        }
                    }
                },
                doctor_practice_locations: {
                    include: {
                        addresses: true
                    }
                },
                doctor_time_slots: true,
                users: {
                    include: {
                        emails: { where: { is_primary: true } },
                        contact_numbers: { where: { is_primary: true } }
                    }
                }
            }
        });

        // Map doctor data with all required fields for the frontend
        const mappedDoctors = doctors.map(doctor => {
            // Get specialization from master
            const specialization = doctor.doctor_specializations.length > 0 
                ? doctor.doctor_specializations[0].specializations_master?.specialization_name 
                : 'General Physician';
            
            // Get languages
            const languages = doctor.doctor_languages.map(l => l.language);
            
            // Get clinic information
            const clinicMapping = doctor.doctor_clinic_mapping.length > 0 ? doctor.doctor_clinic_mapping[0].clinics : null;
            const clinicName = clinicMapping?.clinic_name || 'Primary Clinic';
            const clinicAddress = clinicMapping?.address 
                ? `${clinicMapping.address.address}, ${clinicMapping.address.city}, ${clinicMapping.address.state}`
                : '';

            // Get practice address
            const practiceLocation = doctor.doctor_practice_locations.length > 0 ? doctor.doctor_practice_locations[0].addresses : null;
            const address = practiceLocation 
                ? `${practiceLocation.address}, ${practiceLocation.city}, ${practiceLocation.state}`
                : clinicAddress;

            const schedule = doctor.doctor_time_slots.map(ts => {
                const start = ts.start_time ? new Date(ts.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                const end = ts.end_time ? new Date(ts.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                return `${ts.day_of_week}: ${start} - ${end}`;
            });

            return {
                id: doctor.id,
                full_name: doctor.full_name,
                email: doctor.users?.emails?.[0]?.email || '',
                mobile: doctor.users?.contact_numbers?.[0]?.phone_number || '',
                specialization: specialization,
                languages: languages,
                qualifications: doctor.qualifications,
                experience_years: doctor.experience_years,
                bio: doctor.bio,
                profile_photo_url: doctor.profile_photo_url,
                verification_status: doctor.verification_status,
                clinic_name: clinicName,
                clinic_address: clinicAddress,
                address: address,
                schedule: schedule,
                fees: doctor.consultation_fee ? parseFloat(doctor.consultation_fee.toString()) : 500
            };
        });

        ResponseHandler.success(res, mappedDoctors, 'Doctors retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.registerDoctor = async (req, res, next) => {
    try {
        const { full_name, email, phone, specialization, password, qualification, experience_years, medical_council_reg_no, bio, gender, date_of_birth, languages } = req.body;
        const clinicId = req.user.clinic_id;

        if (!clinicId) {
            return ResponseHandler.forbidden(res, 'Only clinic admins can register doctors via this endpoint');
        }

        if (!full_name || !email || !password) {
            return ResponseHandler.badRequest(res, 'Name, email and password are required');
        }

        // Check if user exists
        const existingUser = await prisma.users.findFirst({
            where: { emails: { some: { email } } }
        });
        if (existingUser) {
            return ResponseHandler.badRequest(res, 'A user with this email already exists');
        }

        const hashedPassword = await require('bcryptjs').hash(password, 10);

        // Transaction to create user, doctor and mapping
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    full_name,
                    password_hash: hashedPassword,
                    role: 'doctor',
                    emails: {
                        create: { email, is_primary: true }
                    },
                    contact_numbers: {
                        create: { phone_number: phone || '', is_primary: true }
                    }
                }
            });

            const doctor = await tx.doctors.create({
                data: {
                    full_name,
                    user_id: user.user_id,
                    medical_council_reg_no: medical_council_reg_no || 'PENDING',
                    qualifications: qualification || 'MBBS',
                    experience_years: experience_years ? parseInt(experience_years) : 0,
                    bio: bio || '',
                    gender: gender || 'Other',
                    date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                    verification_status: 'PENDING'
                }
            });

            if (specialization) {
                // Find or create specialization in master
                let specMaster = await tx.specializations_master.findUnique({
                    where: { specialization_name: specialization }
                });
                if (!specMaster) {
                    specMaster = await tx.specializations_master.create({
                        data: { specialization_name: specialization }
                    });
                }

                await tx.doctor_specializations.create({
                    data: {
                        doctor_id: doctor.id,
                        specialization_id: specMaster.id
                    }
                });
            }

            if (languages) {
                const langs = languages.split(',').map(l => l.trim()).filter(l => l !== '');
                for (const lang of langs) {
                    await tx.doctor_languages.create({
                        data: {
                            doctor_id: doctor.id,
                            language: lang
                        }
                    });
                }
            }

            await tx.doctor_clinic_mapping.create({
                data: {
                    doctor_id: doctor.id,
                    clinic_id: clinicId
                }
            });

            return doctor;
        });

        ResponseHandler.created(res, result, 'Doctor registered and linked to clinic successfully');
    } catch (error) {
        next(error);
    }
};

exports.getDoctorDocuments = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        if (!doctorId) {
            return ResponseHandler.badRequest(res, 'Doctor not identified');
        }

        const documents = await prisma.doctor_documents.findMany({
            where: { doctor_id: doctorId },
            orderBy: { uploaded_at: 'desc' }
        });

        ResponseHandler.success(res, documents, 'Doctor documents retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.uploadDoctorDocument = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        if (!doctorId) {
            return ResponseHandler.badRequest(res, 'Doctor not identified');
        }

        if (!req.file) {
            return ResponseHandler.badRequest(res, 'No file uploaded');
        }

        const { document_type } = req.body;
        const { uploadToSupabase } = require('../utils/supabaseStorage');

        const uploadResult = await uploadToSupabase(
            req.file.buffer,
            req.file.originalname,
            `doctor/${doctorId}/documents`
        );

        if (!uploadResult.success) {
            console.error('Supabase upload failed:', uploadResult.error);
            return ResponseHandler.serverError(res, 'Failed to upload file to storage');
        }

        const document = await prisma.doctor_documents.create({
            data: {
                doctor_id: doctorId,
                document_type: document_type || 'Other',
                file_url: uploadResult.url,
                mime_type: req.file.mimetype,
                file_size: req.file.size
            }
        });

        ResponseHandler.created(res, document, 'Doctor document uploaded successfully');
    } catch (error) {
        next(error);
    }
};

exports.deleteDoctorDocument = async (req, res, next) => {
    try {
        const doctorId = req.user.doctor_id;
        const { id } = req.params;

        const doc = await prisma.doctor_documents.findUnique({
            where: { id: parseInt(id) }
        });

        if (!doc || doc.doctor_id !== doctorId) {
            return ResponseHandler.notFound(res, 'Document not found or unauthorized');
        }

        const { deleteFromSupabase } = require('../utils/supabaseStorage');
        if (doc.file_url) {
            await deleteFromSupabase(doc.file_url);
        }

        await prisma.doctor_documents.delete({
            where: { id: parseInt(id) }
        });

        ResponseHandler.success(res, null, 'Doctor document deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = exports;

