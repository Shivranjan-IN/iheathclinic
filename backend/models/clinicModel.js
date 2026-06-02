const prisma = require('../config/database');

class Clinic {
    static async create(clinicData) {
        try {
            const data = await prisma.clinics.create({
                data: clinicData
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0) {
        try {
            const data = await prisma.clinics.findMany({
                take: limit,
                skip: offset
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const data = await prisma.clinics.findUnique({
                where: { id: id }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const data = await prisma.clinics.update({
                where: { id: parseInt(id) },
                data: { ...updates, updated_at: new Date() }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const data = await prisma.clinics.delete({
                where: { id: parseInt(id) }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const count = await prisma.clinics.count();
            return count;
        } catch (error) {
            throw error;
        }
    }

    static async insertServices(clinicId, services) {
        try {
            let data = services;
            if (typeof services === 'string') {
                data = services.split(',').map(s => s.trim()).filter(s => s !== '');
            }
            if (!Array.isArray(data) || data.length === 0) return;

            await prisma.clinic_services.createMany({
                data: data.map(s => ({
                    clinic_id: clinicId,
                    service: s
                }))
            });
        } catch (error) {
            console.error('Error inserting services:', error);
            throw error;
        }
    }

    static async insertFacilities(clinicId, facilities) {
        try {
            let data = facilities;
            if (typeof facilities === 'string') {
                data = facilities.split(',').map(f => f.trim()).filter(f => f !== '');
            }
            if (!Array.isArray(data) || data.length === 0) return;

            await prisma.clinic_facilities.createMany({
                data: data.map(f => ({
                    clinic_id: clinicId,
                    facility: f
                }))
            });
        } catch (error) {
            console.error('Error inserting facilities:', error);
            throw error;
        }
    }

    static async insertPaymentModes(clinicId, modes) {
        try {
            let data = modes;
            if (typeof modes === 'string') {
                data = modes.split(',').map(m => m.trim()).filter(m => m !== '');
            }
            if (!Array.isArray(data) || data.length === 0) return;

            await prisma.clinic_payment_modes.createMany({
                data: data.map(m => ({
                    clinic_id: clinicId,
                    payment_mode: m
                }))
            });
        } catch (error) {
            console.error('Error inserting payment modes:', error);
            throw error;
        }
    }

    static async insertBookingModes(clinicId, modes) {
        try {
            let data = modes;
            if (typeof modes === 'string') {
                data = modes.split(',').map(m => m.trim()).filter(m => m !== '');
            }
            if (!Array.isArray(data) || data.length === 0) return;

            await prisma.clinic_booking_modes.createMany({
                data: data.map(m => ({
                    clinic_id: clinicId,
                    booking_mode: m
                }))
            });
        } catch (error) {
            console.error('Error inserting booking modes:', error);
            throw error;
        }
    }
}

module.exports = Clinic;
