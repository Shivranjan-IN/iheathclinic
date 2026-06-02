const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const Patient = require('../models/patientModel');
const { createNotification } = require('../utils/notificationHelper');

async function getPatientId(req) {
    const userId = req.user.user_id;
    let patient = await Patient.findByUserId(userId);
    if (!patient && req.user.email) {
        patient = await Patient.findByEmail(req.user.email);
    }
    return patient ? patient.patient_id : null;
}

exports.getReminders = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const reminders = await prisma.medicine_reminders.findMany({
            where: { patient_id },
            orderBy: { reminder_time: 'asc' }
        });

        ResponseHandler.success(res, reminders, 'Reminders retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.createReminder = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const { medicine_name, dosage, reminder_time } = req.body;

        // Prisma expects a full ISO string for Time if it's mapped to DateTime, 
        // but here it's @db.Time(6). Prisma usually maps this to a Date object with dummy day part.
        // We'll trust the frontend sends a valid format or handle it here.

        const reminder = await prisma.medicine_reminders.create({
            data: {
                patient_id,
                medicine_name,
                dosage,
                reminder_time: new Date(`1970-01-01T${reminder_time}`)
            }
        });

        // Notify patient
        try {
            await createNotification({
                userId: req.user.user_id,
                type: 'MEDICINE',
                title: 'Medicine Reminder Set',
                message: `New reminder for ${medicine_name} (${dosage}) at ${reminder_time}`
            });
        } catch (err) {
            console.error('Error sending reminder notification:', err);
        }

        ResponseHandler.created(res, reminder, 'Reminder set successfully');
    } catch (error) {
        next(error);
    }
};

exports.deleteReminder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const patient_id = await getPatientId(req);

        const reminder = await prisma.medicine_reminders.findUnique({ where: { id: parseInt(id) } });
        if (!reminder || reminder.patient_id !== patient_id) {
            return ResponseHandler.notFound(res, 'Reminder not found');
        }

        await prisma.medicine_reminders.delete({ where: { id: parseInt(id) } });

        ResponseHandler.success(res, null, 'Reminder deleted');
    } catch (error) {
        next(error);
    }
};
