const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');

// Doctor Management
exports.getDoctors = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const mappings = await prisma.doctor_clinic_mapping.findMany({
            where: { clinic_id: clinicId },
            include: { doctors: true }
        });
        const doctors = mappings.map(m => m.doctors);
        ResponseHandler.success(res, doctors, 'Scanning clinic medical staff registry');
    } catch (error) {
        next(error);
    }
};

exports.addDoctor = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { doctor_id, name, email, mobile, specialization, qualification, experience, password, mciReg, gender, dob, bio } = req.body;

        let targetDoctorId = doctor_id;

        // If details are provided, register a new doctor
        if (!targetDoctorId && name && email && password) {
            // Check if user already exists
            const existingUser = await prisma.users.findFirst({
                where: { emails: { some: { email } } }
            });
            if (existingUser) {
                return ResponseHandler.badRequest(res, 'A user with this email already exists');
            }

            // Create User
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.users.create({
                data: {
                    full_name: name,
                    password_hash: hashedPassword,
                    role: 'doctor',
                    is_active: true,
                    emails: {
                        create: { email, is_primary: true }
                    },
                    contact_numbers: {
                        create: { phone_number: mobile || '', is_primary: true }
                    }
                }
            });

            // Create Doctor Profile
            const newDoctor = await prisma.doctors.create({
                data: {
                    full_name: name,
                    medical_council_reg_no: mciReg || 'TEMP-' + Date.now(),
                    qualifications: qualification || 'MBBS',
                    experience_years: parseInt(experience) || 0,
                    bio: bio || '',
                    gender: gender || 'Other',
                    date_of_birth: dob ? new Date(dob) : null,
                    user_id: newUser.user_id,
                    verification_status: 'PENDING'
                }
            });

            // Handle Specialization
            if (specialization) {
                await Doctor.insertSpecializations(newDoctor.id, specialization);
            }

            targetDoctorId = newDoctor.id;
        }

        if (!targetDoctorId) {
            return ResponseHandler.badRequest(res, 'Doctor ID or complete registration details required');
        }

        // Create Linkage
        const mapping = await prisma.doctor_clinic_mapping.upsert({
            where: {
                doctor_id_clinic_id: {
                    doctor_id: parseInt(targetDoctorId),
                    clinic_id: clinicId
                }
            },
            update: {},
            create: {
                doctor_id: parseInt(targetDoctorId),
                clinic_id: clinicId
            }
        });

        ResponseHandler.created(res, mapping, 'Doctor registered and linked to clinic successfully');
    } catch (error) {
        next(error);
    }
};

exports.removeDoctor = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { id } = req.params;

        await prisma.doctor_clinic_mapping.delete({
            where: {
                doctor_id_clinic_id: {
                    doctor_id: parseInt(id),
                    clinic_id: clinicId
                }
            }
        });

        ResponseHandler.success(res, null, 'Doctor de-linked from facility registry');
    } catch (error) {
        next(error);
    }
};

exports.updateDoctor = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { id } = req.params;
        const updates = req.body;

        // Verify mapping exists
        const mapping = await prisma.doctor_clinic_mapping.findUnique({
            where: {
                doctor_id_clinic_id: {
                    doctor_id: parseInt(id),
                    clinic_id: clinicId
                }
            }
        });

        if (!mapping) {
            return ResponseHandler.notFound(res, 'Doctor not found in your clinic roster');
        }

        const { specialization, qualification, experience, mciReg, fullName, bio, gender, dob } = updates;

        const updatedDoctor = await prisma.doctors.update({
            where: { id: parseInt(id) },
            data: {
                full_name: fullName,
                qualifications: qualification,
                experience_years: experience ? parseInt(experience) : undefined,
                medical_council_reg_no: mciReg,
                bio: bio,
                gender: gender,
                date_of_birth: dob ? new Date(dob) : undefined,
                updated_at: new Date()
            }
        });

        if (specialization) {
            await prisma.doctor_specializations.deleteMany({ where: { doctor_id: parseInt(id) } });
            await Doctor.insertSpecializations(parseInt(id), specialization);
        }

        ResponseHandler.success(res, updatedDoctor, 'Doctor profile updated successfully');
    } catch (error) {
        next(error);
    }
};

// Staff Management
exports.getStaff = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const staff = await prisma.clinic_staff.findMany({
            where: { clinic_id: clinicId },
            orderBy: { created_at: 'desc' }
        });
        ResponseHandler.success(res, staff, 'Operational staff roster retrieved');
    } catch (error) {
        next(error);
    }
};

exports.addStaff = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { full_name, role, email, phone, department } = req.body;

        const newStaff = await prisma.clinic_staff.create({
            data: {
                clinic_id: clinicId,
                full_name,
                role,
                email,
                phone,
                department,
                is_active: true
            }
        });

        ResponseHandler.created(res, newStaff, 'Support unit deployed to facility');
    } catch (error) {
        next(error);
    }
};

exports.updateStaff = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { id } = req.params;

        const staff = await prisma.clinic_staff.findFirst({
            where: { id: parseInt(id), clinic_id: clinicId }
        });

        if (!staff) {
            return ResponseHandler.notFound(res, 'Staff member not found in this sector');
        }

        const updated = await prisma.clinic_staff.update({
            where: { id: parseInt(id) },
            data: {
                full_name: req.body.full_name,
                role: req.body.role,
                email: req.body.email,
                phone: req.body.phone,
                department: req.body.department,
                is_active: req.body.is_active
            }
        });

        ResponseHandler.success(res, updated, 'Staff credentials recalibrated');
    } catch (error) {
        next(error);
    }
};

exports.deleteStaff = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { id } = req.params;

        const staff = await prisma.clinic_staff.findFirst({
            where: { id: parseInt(id), clinic_id: clinicId }
        });

        if (!staff) {
            return ResponseHandler.notFound(res, 'Staff member not found for decommissioning');
        }

        await prisma.clinic_staff.delete({
            where: { id: parseInt(id) }
        });

        ResponseHandler.success(res, null, 'Staff unit decommissioned');
    } catch (error) {
        next(error);
    }
};
