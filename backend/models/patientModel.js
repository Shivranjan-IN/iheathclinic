const prisma = require('../config/database');

class Patient {
    static async create(patientData) {
        try {
            const data = await prisma.patients.create({
                data: patientData
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(limit = 10, offset = 0, doctorId = null, search = '') {
        try {
            const where = {};
            
            if (doctorId) {
                where.appointments = { some: { doctor_id: parseInt(doctorId) } };
            }

            if (search) {
                const searchLower = search.toLowerCase();
                const searchConditions = [
                    { full_name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { patient_id: { contains: search, mode: 'insensitive' } }
                ];
                
                if (where.OR) {
                    // Combine with previous OR if it exists
                    where.AND = [
                        { OR: where.OR },
                        { OR: searchConditions }
                    ];
                    delete where.OR;
                } else {
                    where.OR = searchConditions;
                }
            }

            const data = await prisma.patients.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: { created_at: 'desc' }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async count(doctorId = null, search = '') {
        try {
            const where = {};
            
            if (doctorId) {
                where.appointments = { some: { doctor_id: parseInt(doctorId) } };
            }

            if (search) {
                const searchConditions = [
                    { full_name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                    { patient_id: { contains: search, mode: 'insensitive' } }
                ];
                
                if (where.OR) {
                    where.AND = [
                        { OR: where.OR },
                        { OR: searchConditions }
                    ];
                    delete where.OR;
                } else {
                    where.OR = searchConditions;
                }
            }

            const count = await prisma.patients.count({ where });
            return count;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const data = await prisma.patients.findUnique({
                where: { patient_id: id },
                include: {
                    address_record: true,
                    users: {
                        include: {
                            contact_numbers: true
                        }
                    },
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true,
                    patient_emergency_contacts: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const data = await prisma.patients.findFirst({
                where: {
                    users: {
                        emails: {
                            some: {
                                email: email
                            }
                        }
                    }
                },
                include: {
                    address_record: true,
                    users: {
                        include: {
                            contact_numbers: true
                        }
                    },
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true,
                    patient_emergency_contacts: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId) {
        try {
            const data = await prisma.patients.findFirst({
                where: { user_id: userId },
                include: {
                    address_record: true,
                    users: {
                        include: {
                            contact_numbers: true
                        }
                    },
                    appointments: true,
                    prescriptions: true,
                    patient_documents: true,
                    invoices: true,
                    patient_emergency_contacts: true
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async findByPhone(phone) {
        try {
            const data = await prisma.patients.findFirst({
                where: {
                    users: {
                        contact_numbers: {
                            some: {
                                phone_number: phone
                            }
                        }
                    }
                }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    static async update(id, updates) {
        try {
            console.log('Patient.update received:', id, updates);
            const { address, phone, emergency_contact, ...patientUpdates } = updates;
            console.log('Patient.update extracted patientUpdates:', patientUpdates);
            
            // Handle updates in a transaction
            return await prisma.$transaction(async (tx) => {
                const patient = await tx.patients.findUnique({
                    where: { patient_id: id },
                    select: { address_id: true, user_id: true }
                });

                // Update users table name if full_name is updated
                if (patientUpdates.full_name !== undefined && patient.user_id) {
                    await tx.users.update({
                        where: { user_id: patient.user_id },
                        data: { full_name: patientUpdates.full_name }
                    });
                }

                // Update address if provided
                if (address !== undefined) {
                    if (patient.address_id) {
                        await tx.addresses.update({
                            where: { address_id: patient.address_id },
                            data: { address: address }
                        });
                    } else {
                        const newAddress = await tx.addresses.create({
                            data: { address: address }
                        });
                        patientUpdates.address_id = newAddress.address_id;
                    }
                }

                // Update phone if provided
                if (phone !== undefined && patient.user_id) {
                    const existingPhone = await tx.contact_numbers.findFirst({
                        where: { user_id: patient.user_id, is_primary: true }
                    });

                    if (existingPhone) {
                        await tx.contact_numbers.update({
                            where: { contact_id: existingPhone.contact_id },
                            data: { phone_number: phone }
                        });
                    } else {
                        await tx.contact_numbers.create({
                            data: {
                                user_id: patient.user_id,
                                phone_number: phone,
                                is_primary: true
                            }
                        });
                    }
                }

                // Update emergency contact if provided
                if (emergency_contact !== undefined) {
                    const name = 'Emergency Contact';
                    const phoneNum = emergency_contact || '';
                    
                    const existingContact = await tx.patient_emergency_contacts.findFirst({
                        where: { patient_id: id }
                    });
                    
                    if (existingContact) {
                        await tx.patient_emergency_contacts.update({
                            where: { id: existingContact.id },
                            data: {
                                full_name: name,
                                phone: phoneNum
                            }
                        });
                    } else {
                        await tx.patient_emergency_contacts.create({
                            data: {
                                patient_id: id,
                                full_name: name,
                                phone: phoneNum,
                                relation: 'Emergency'
                            }
                        });
                    }
                }

                // Filter out any unknown keys from patientUpdates
                const validKeys = [
                    'full_name', 'gender', 'blood_group', 'abha_id', 
                    'medical_history', 'insurance_id', 'date_of_birth', 
                    'age', 'address', 'abhaid', 'insuranceid', 'bloodgroup',
                    'dob', 'contact', 'email', 'allergies', 'medications', 'chronic_diseases',
                    'address_id'
                ];
                
                const cleanPatientUpdates = {};
                for (const key of validKeys) {
                    if (patientUpdates[key] !== undefined) {
                        cleanPatientUpdates[key] = patientUpdates[key];
                    }
                }
                
                // Update core patient data
                console.log('Executing tx.patients.update with:', cleanPatientUpdates);
                const updated = await tx.patients.update({
                    where: { patient_id: id },
                    data: cleanPatientUpdates,
                    include: {
                        address_record: true,
                        users: {
                            include: {
                                contact_numbers: true
                            }
                        },
                        patient_emergency_contacts: true
                    }
                });
                
                return updated;
            });
        } catch (error) {
            console.error('Patient model update error:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            const data = await prisma.patients.delete({
                where: { patient_id: id }
            });
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Allergies methods
    static async getAllergies(patientId) {
        try {
            const allergies = await prisma.patient_allergies.findMany({
                where: { patient_id: patientId }
            });
            return allergies;
        } catch (error) {
            throw error;
        }
    }

    static async addAllergy(patientId, allergyData) {
        try {
            const allergy = await prisma.patient_allergies.create({
                data: {
                    patient_id: patientId,
                    allergy_name: allergyData.allergy_name,
                    severity: allergyData.severity || 'Unknown'
                }
            });
            return allergy;
        } catch (error) {
            throw error;
        }
    }

    static async updateAllergy(allergyId, allergyData) {
        try {
            const allergy = await prisma.patient_allergies.update({
                where: { id: allergyId },
                data: {
                    allergy_name: allergyData.allergy_name,
                    severity: allergyData.severity
                }
            });
            return allergy;
        } catch (error) {
            throw error;
        }
    }

    static async deleteAllergy(allergyId) {
        try {
            await prisma.patient_allergies.delete({
                where: { id: allergyId }
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async replaceAllergies(patientId, allergies) {
        try {
            // Delete existing allergies
            await prisma.patient_allergies.deleteMany({
                where: { patient_id: patientId }
            });
            
            // Create new allergies
            if (allergies && allergies.length > 0) {
                const allergyData = allergies.map(a => ({
                    patient_id: patientId,
                    allergy_name: a,
                    severity: 'Unknown'
                }));
                await prisma.patient_allergies.createMany({
                    data: allergyData
                });
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Conditions methods (for chronic diseases)
    static async getConditions(patientId) {
        try {
            const conditions = await prisma.patient_conditions.findMany({
                where: { patient_id: patientId }
            });
            return conditions;
        } catch (error) {
            throw error;
        }
    }

    static async addCondition(patientId, conditionData) {
        try {
            const condition = await prisma.patient_conditions.create({
                data: {
                    patient_id: patientId,
                    condition_name: conditionData.condition_name,
                    diagnosed_date: conditionData.diagnosed_date || null,
                    is_chronic: conditionData.is_chronic || true
                }
            });
            return condition;
        } catch (error) {
            throw error;
        }
    }

    static async updateCondition(conditionId, conditionData) {
        try {
            const condition = await prisma.patient_conditions.update({
                where: { id: conditionId },
                data: {
                    condition_name: conditionData.condition_name,
                    diagnosed_date: conditionData.diagnosed_date,
                    is_chronic: conditionData.is_chronic
                }
            });
            return condition;
        } catch (error) {
            throw error;
        }
    }

    static async deleteCondition(conditionId) {
        try {
            await prisma.patient_conditions.delete({
                where: { id: conditionId }
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    static async replaceConditions(patientId, conditions, isChronic = true) {
        try {
            // Delete existing conditions
            await prisma.patient_conditions.deleteMany({
                where: { patient_id: patientId }
            });
            
            // Create new conditions
            if (conditions && conditions.length > 0) {
                const conditionData = conditions.map(c => ({
                    patient_id: patientId,
                    condition_name: c,
                    is_chronic: isChronic
                }));
                await prisma.patient_conditions.createMany({
                    data: conditionData
                });
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Medications - using medical_history field or could be added as separate table
    static async updateMedicalHistory(patientId, medicalHistory) {
        try {
            const updated = await prisma.patients.update({
                where: { patient_id: patientId },
                data: { medical_history: medicalHistory }
            });
            return updated;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Patient;
