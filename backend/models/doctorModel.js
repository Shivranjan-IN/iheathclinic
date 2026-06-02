const prisma = require('../config/database');

class Doctor {
    static async create(doctorData) {
        try {
            const data = await prisma.doctors.create({
                data: doctorData
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async insertSpecializations(doctorId, specializations) {
        try {
            let specs = specializations;
            if (typeof specializations === 'string') {
                specs = specializations.split(',').map(s => s.trim()).filter(s => s !== '');
            }
            if (!Array.isArray(specs) || specs.length === 0) return;

            for (const spec of specs) {
                let specMaster = await prisma.specializations_master.findFirst({
                    where: { specialization_name: spec }
                });

                if (!specMaster) {
                    specMaster = await prisma.specializations_master.create({
                        data: { specialization_name: spec }
                    });
                }

                await prisma.doctor_specializations.create({
                    data: {
                        doctor_id: doctorId,
                        specialization_id: specMaster.id
                    }
                });
            }
        } catch (error) {
            console.error('Error inserting specializations:', error);
            throw error;
        }
    }

    static async insertLanguages(doctorId, languages) {
        try {
            let langs = languages;
            if (typeof languages === 'string') {
                langs = languages.split(',').map(l => l.trim()).filter(l => l !== '');
            }
            if (!Array.isArray(langs) || langs.length === 0) return;

            await prisma.doctor_languages.createMany({
                data: langs.map(l => ({
                    doctor_id: doctorId,
                    language: l
                }))
            });
        } catch (error) {
            console.error('Error inserting languages:', error);
            throw error;
        }
    }

    static async insertConsultationModes(doctorId, modes) {
        try {
            let mds = modes;
            if (typeof modes === 'string') {
                mds = modes.split(',').map(m => m.trim()).filter(m => m !== '');
            }
            if (!Array.isArray(mds) || mds.length === 0) return;

            await prisma.doctor_consultation_modes.createMany({
                data: mds.map(m => ({
                    doctor_id: doctorId,
                    consultation_mode: m
                }))
            });
        } catch (error) {
            console.error('Error inserting consultation modes:', error);
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0) {
        try {
            const doctors = await prisma.doctors.findMany({
                take: limit,
                skip: offset,
                include: {
                    doctor_specializations: {
                        include: {
                            specializations_master: true
                        }
                    },
                    doctor_languages: true,
                    doctor_consultation_modes: true
                }
            });

            // Map back to the expected format for backward compatibility
            return doctors.map(doctor => ({
                ...doctor,
                specializations: doctor.doctor_specializations.map(s => s.specializations_master?.specialization_name),
                languages: doctor.doctor_languages.map(l => l.language),
                consultation_modes: doctor.doctor_consultation_modes.map(m => m.consultation_mode)
            }));
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const doctor = await prisma.doctors.findUnique({
                where: { id: id },
                include: {
                    doctor_specializations: {
                        include: {
                            specializations_master: true
                        }
                    },
                    doctor_languages: true,
                    doctor_consultation_modes: true,
                    doctor_practice_locations: true,
                    doctor_time_slots: true,
                    doctor_verification: true,
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

            if (!doctor) return null;

            // Map back to the expected format
            return {
                ...doctor,
                specialization: doctor.doctor_specializations.length > 0 ? doctor.doctor_specializations[0].specializations_master?.specialization_name : '',
                specializations: doctor.doctor_specializations.map(s => s.specializations_master?.specialization_name),
                languages: doctor.doctor_languages.map(l => l.language),
                consultation_modes: doctor.doctor_consultation_modes.map(m => m.consultation_mode),
                email: doctor.users?.emails?.[0]?.email || '',
                mobile: doctor.users?.contact_numbers?.[0]?.phone_number || '',
                bank_account_name: doctor.users?.bank_accounts?.[0]?.account_holder_name || '',
                bank_account_number: doctor.users?.bank_accounts?.[0]?.account_number || '',
                ifsc_code: doctor.users?.bank_accounts?.[0]?.ifsc_code || '',
                pan_number: doctor.users?.tax_details?.[0]?.pan_number || '',
                gstin: doctor.users?.tax_details?.[0]?.gstin || ''
            };
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            const data = await prisma.doctors.update({
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
            const data = await prisma.doctors.delete({
                where: { id: parseInt(id) }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async count() {
        try {
            const count = await prisma.doctors.count();
            return count;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Doctor;
