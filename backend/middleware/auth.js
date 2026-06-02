const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return ResponseHandler.unauthorized(res, 'Not authorized: No nav beacon found');
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is missing');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use prisma to find user with role relation
        const dbUser = await prisma.users.findUnique({
            where: {
                user_id: decoded.id
            },
            include: {
                emails: {
                    where: { is_primary: true },
                    take: 1
                },
                roles: true  // include roles relation to get role_name
            }
        });

        if (!dbUser) {
            return ResponseHandler.unauthorized(res, 'User signature not found in registry');
        }

        // role comes from the JWT token (set at login) OR from the roles relation
        // JWT may have role embedded; fallback to roles relation
        const roleName = decoded.role || dbUser.roles?.role_name || null;

        const user = {
            user_id: dbUser.user_id,
            full_name: dbUser.full_name,
            role: roleName,
            email: dbUser.emails?.[0]?.email
        };

        // Inject ID for data isolation based on role
        if (user.role === 'patient') {
            const patient = await prisma.patients.findFirst({
                where: { user_id: user.user_id }
            });
            if (patient) {
                user.patient_id = patient.patient_id;
            }
        } else if (user.role === 'clinic') {
            const clinic = await prisma.clinics.findFirst({
                where: { user_id: user.user_id }
            });
            if (clinic) {
                user.clinic_id = clinic.id;
            }
        } else if (user.role === 'doctor') {
            const doctor = await prisma.doctors.findFirst({
                where: { user_id: user.user_id }
            });
            if (doctor) {
                user.doctor_id = doctor.id;
                const mapping = await prisma.doctor_clinic_mapping.findFirst({
                    where: { doctor_id: doctor.id }
                });
                if (mapping) {
                    user.clinic_id = mapping.clinic_id;
                }
            }
        } else if (user.role === 'receptionist' || user.role === 'nurse') {
            const staff = await prisma.clinic_staff.findFirst({
                where: { user_id: user.user_id }
            });
            if (staff) {
                user.clinic_id = staff.clinic_id;
            }
        }

        req.user = user;
        next();
    } catch (error) {
        return ResponseHandler.unauthorized(res, 'Not authorized: Signal lost');
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return ResponseHandler.forbidden(res, `Role ${req.user.role} is not authorized for this sector`);
        }
        next();
    };
};

module.exports = { protect, authorize };
