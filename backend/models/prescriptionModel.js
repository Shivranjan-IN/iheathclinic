const prisma = require('../config/database');

class Prescription {
    static async create(prescriptionData, medicines = [], labTests = []) {
        try {
            // Using transaction to ensure both prescription and related items are created
            return await prisma.$transaction(async (tx) => {
                const prescription = await tx.prescriptions.create({
                    data: {
                        ...prescriptionData,
                        medicines: {
                            create: medicines
                        },
                        lab_tests: {
                            create: labTests
                        }
                    },
                    include: {
                        medicines: true,
                        lab_tests: true
                    }
                });
                return prescription;
            });
        } catch (error) {
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0) {
        try {
            return await prisma.prescriptions.findMany({
                include: {
                    patient: {
                        select: { full_name: true }
                    },
                    doctor: {
                        select: { full_name: true }
                    },
                    medicines: true,
                    lab_tests: true
                },
                take: limit,
                skip: offset,
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            return await prisma.prescriptions.findUnique({
                where: { prescription_id: id },
                include: {
                    patient: true,
                    doctor: true,
                    medicines: true,
                    lab_tests: true
                }
            });
        } catch (error) {
            throw error;
        }
    }

    static async findByPatient(patientId) {
        try {
            return await prisma.prescriptions.findMany({
                where: { patient_id: patientId },
                include: {
                    doctor: {
                        select: { full_name: true }
                    },
                    medicines: true,
                    lab_tests: true,
                    clinic: {
                        select: { clinic_name: true }
                    }
                },
                orderBy: { created_at: 'desc' }
            });
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.prescriptions.delete({
                where: { prescription_id: id }
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Prescription;
