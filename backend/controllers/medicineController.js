const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

exports.getAllMedicines = async (req, res, next) => {
    try {
        const { category, search, mine } = req.query;
        const clinicId = req.user && req.user.role === 'clinic' ? req.user.clinic_id : null;

        const where = {};
        if (category && category !== 'All') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { medicine_name: { contains: search, mode: 'insensitive' } },
                { manufacturer: { contains: search, mode: 'insensitive' } }
            ];
        }

        // If 'mine' flag is set or user is a clinic admin, prioritize clinic-specific medicines
        if (mine === 'true' && clinicId) {
            where.clinic_id = clinicId;
        } else if (clinicId) {
            // Clinics see their own medicines OR system medicines (null clinic_id)
            where.OR = [
                ...(where.OR || []),
                { clinic_id: clinicId },
                { clinic_id: null }
            ];
        }

        const medicines = await prisma.medicines.findMany({
            where,
            include: {
                clinic: {
                    select: {
                        clinic_name: true
                    }
                }
            },
            orderBy: { medicine_name: 'asc' }
        });

        ResponseHandler.success(res, medicines, 'Medicines retrieved successfully');
    } catch (error) {
        next(error);
    }
};

exports.getMedicineById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const medicine = await prisma.medicines.findUnique({
            where: { medicine_id: id },
            include: {
                clinic: {
                    select: {
                        clinic_name: true
                    }
                }
            }
        });

        if (!medicine) {
            return ResponseHandler.notFound(res, 'Medicine not found');
        }

        ResponseHandler.success(res, medicine, 'Medicine details retrieved');
    } catch (error) {
        next(error);
    }
};

exports.addMedicine = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const medicineData = {
            ...req.body,
            clinic_id: clinicId,
            medicine_id: req.body.medicine_id || `MED-${Date.now()}`
        };

        const medicine = await prisma.medicines.create({
            data: medicineData
        });

        ResponseHandler.success(res, medicine, 'Medicine digitized successfully', 201);
    } catch (error) {
        next(error);
    }
};

exports.updateMedicine = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinic_id;

        // Ensure the medicine belongs to this clinic
        const existing = await prisma.medicines.findFirst({
            where: { medicine_id: id, clinic_id: clinicId }
        });

        if (!existing) {
            return ResponseHandler.unauthorized(res, 'Access denied to this pharmaceutical record');
        }

        const medicine = await prisma.medicines.update({
            where: { medicine_id: id },
            data: req.body
        });

        ResponseHandler.success(res, medicine, 'Medicine record re-synchronized');
    } catch (error) {
        next(error);
    }
};

exports.deleteMedicine = async (req, res, next) => {
    try {
        const { id } = req.params;
        const clinicId = req.user.clinic_id;

        const existing = await prisma.medicines.findFirst({
            where: { medicine_id: id, clinic_id: clinicId }
        });

        if (!existing) {
            return ResponseHandler.unauthorized(res, 'Access denied to this pharmaceutical record');
        }

        await prisma.medicines.delete({
            where: { medicine_id: id }
        });

        ResponseHandler.success(res, null, 'Medicine record decommissioned');
    } catch (error) {
        next(error);
    }
};
