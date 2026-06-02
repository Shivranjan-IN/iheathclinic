const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');
const Patient = require('../models/patientModel');

async function getPatientId(req) {
    const userId = req.user.user_id;
    let patient = await Patient.findByUserId(userId);
    if (!patient && req.user.email) {
        patient = await Patient.findByEmail(req.user.email);
    }
    return patient ? patient.patient_id : null;
}

exports.getBookmarks = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const bookmarks = await prisma.bookmarks.findMany({
            where: { patient_id },
            include: {
                medicine: true
            }
        });

        ResponseHandler.success(res, bookmarks, 'Bookmarks retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.toggleBookmark = async (req, res, next) => {
    try {
        const patient_id = await getPatientId(req);
        if (!patient_id) return ResponseHandler.notFound(res, 'Patient not found');

        const { medicine_id } = req.body;

        const existing = await prisma.bookmarks.findFirst({
            where: { patient_id, medicine_id }
        });

        if (existing) {
            await prisma.bookmarks.delete({ where: { id: existing.id } });
            return ResponseHandler.success(res, null, 'Bookmark removed');
        } else {
            const bookmark = await prisma.bookmarks.create({
                data: { patient_id, medicine_id }
            });
            return ResponseHandler.created(res, bookmark, 'Medicine bookmarked');
        }
    } catch (error) {
        next(error);
    }
};
