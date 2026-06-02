const Prescription = require('../models/prescriptionModel');
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');
const { createNotification } = require('../utils/notificationHelper');

exports.createPrescription = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, appointment_id, diagnosis, follow_up_date, notes, medicines, lab_tests } = req.body;

        if (!patient_id || !diagnosis) {
            return ResponseHandler.badRequest(res, 'Missing essential medical data (Patient, Diagnosis)');
        }

        const prescription_id = `RX-${Date.now()}`;

        const prescriptionData = {
            prescription_id,
            patient_id,
            doctor_id: doctor_id ? parseInt(doctor_id) : null,
            appointment_id,
            diagnosis,
            follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
            notes
        };

        const newPrescription = await Prescription.create(prescriptionData, medicines || [], lab_tests || []);

        // Notify patient
        try {
            const patientRecord = await prisma.patients.findUnique({
                where: { patient_id: patient_id },
                select: { user_id: true }
            });
            if (patientRecord?.user_id) {
                await createNotification({
                    userId: patientRecord.user_id,
                    type: 'PRESCRIPTION',
                    title: 'New Prescription Added',
                    message: `Dr. has added a new prescription for your diagnosis: ${diagnosis}.`
                });
            }
        } catch (err) {
            console.error('Error sending prescription notification:', err);
        }

        ResponseHandler.created(res, newPrescription, 'Prescription metrics recorded and validated');
    } catch (error) {
        next(error);
    }
};

exports.getAllPrescriptions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const prescriptions = await Prescription.findAll(limit, offset);
        ResponseHandler.success(res, prescriptions, 'Clinical prescription registry scan complete');
    } catch (error) {
        next(error);
    }
};

exports.getPrescriptionById = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return ResponseHandler.notFound(res, 'Prescription bio-signature not found');
        }
        ResponseHandler.success(res, prescription, 'Medical prescription details retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getPatientPrescriptions = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        const prescriptions = await Prescription.findByPatient(patientId);
        ResponseHandler.success(res, prescriptions, 'Patient medical history retrieved');
    } catch (error) {
        next(error);
    }
};

// Patient gets their own prescriptions (no need to pass patient_id in URL)
exports.getMyPrescriptions = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id;
        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found in session');
        }
        const prescriptions = await Prescription.findByPatient(patientId);
        ResponseHandler.success(res, prescriptions, 'Your prescriptions retrieved');
    } catch (error) {
        next(error);
    }
};

// Download prescription as plain text (simple implementation without PDF libraries)
exports.downloadPrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        // Check patient ownership if patient role
        if (req.user.role === 'patient' && prescription.patient_id !== req.user.patient_id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Build a text-based prescription document
        const doctorName = prescription.doctor?.full_name || 'Dr. Unknown';
        const patientName = prescription.patient?.full_name || 'Patient';
        const date = prescription.created_at ? new Date(prescription.created_at).toLocaleDateString('en-IN') : 'N/A';
        const medicines = prescription.medicines || [];

        let content = `PRESCRIPTION\n`;
        content += `${'='.repeat(50)}\n`;
        content += `Doctor: ${doctorName}\n`;
        content += `Patient: ${patientName}\n`;
        content += `Date: ${date}\n`;
        content += `Prescription ID: ${prescription.prescription_id}\n`;
        content += `Diagnosis: ${prescription.diagnosis || 'N/A'}\n`;
        content += `Notes: ${prescription.notes || 'N/A'}\n`;
        content += `Follow-up: ${prescription.follow_up_date ? new Date(prescription.follow_up_date).toLocaleDateString('en-IN') : 'N/A'}\n`;
        content += `\nMEDICINES:\n${'-'.repeat(30)}\n`;

        medicines.forEach((med, idx) => {
            content += `${idx + 1}. ${med.medicine_name || 'N/A'}\n`;
            content += `   Dosage: ${med.dosage || 'N/A'}\n`;
            content += `   Frequency: ${med.frequency || 'N/A'}\n`;
            content += `   Duration: ${med.duration || 'N/A'}\n`;
        });

        content += `\n${'='.repeat(50)}\n`;
        content += `This is a computer-generated prescription.\n`;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="prescription-${prescription.prescription_id}.txt"`);
        res.send(content);
    } catch (error) {
        next(error);
    }
};

