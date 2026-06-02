const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

const getFullClinicProfileData = async (clinicId) => {
    const clinic = await prisma.clinics.findUnique({
        where: { id: clinicId },
        include: {
            address: true,
            clinic_services: true,
            clinic_facilities: true,
            clinic_payment_modes: true,
            clinic_booking_modes: true,
            clinic_documents: true,
            doctor_clinic_mapping: {
                include: {
                    doctors: {
                        include: {
                            doctor_specializations: {
                                include: { specializations_master: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!clinic) return null;

    let email = null;
    let mobile = null;
    let pan_number = null;
    let gstin = null;
    let bank_account_name = null;
    let bank_account_number = null;
    let ifsc_code = null;
    let emergency_services = 'Available 24/7';

    if (clinic.user_id) {
        const userEmails = await prisma.emails.findMany({
            where: { user_id: clinic.user_id, is_primary: true }
        });
        if (userEmails.length > 0) email = userEmails[0].email;

        const userPhones = await prisma.contact_numbers.findMany({
            where: { user_id: clinic.user_id, is_primary: true }
        });
        if (userPhones.length > 0) mobile = userPhones[0].phone_number;

        const taxDetails = await prisma.tax_details.findMany({
            where: { user_id: clinic.user_id }
        });
        if (taxDetails.length > 0) {
            pan_number = taxDetails[0].pan_number;
            gstin = taxDetails[0].gstin;
        }

        const bankAccounts = await prisma.bank_accounts.findMany({
            where: { user_id: clinic.user_id }
        });
        if (bankAccounts.length > 0) {
            bank_account_name = bankAccounts[0].account_holder_name;
            bank_account_number = bankAccounts[0].account_number;
            ifsc_code = bankAccounts[0].ifsc_code;
        }

        // Fetch emergency services availability setting
        const emergencySetting = await prisma.system_settings.findFirst({
            where: { setting_key: `clinic_${clinic.id}_emergency_services` }
        });
        if (emergencySetting) {
            emergency_services = emergencySetting.setting_value;
        }
    }

    const doctorIds = clinic.doctor_clinic_mapping.map(d => d.doctor_id);

    const appointmentsCount = await prisma.appointments.count({
        where: { doctor_id: { in: doctorIds } }
    });

    const patientsResult = await prisma.appointments.groupBy({
        by: ['patient_id'],
        where: { doctor_id: { in: doctorIds } }
    });

    const staffCount = 0;

    return {
        ...clinic,
        email,
        mobile,
        pan_number,
        gstin,
        bank_account_name,
        bank_account_number,
        ifsc_code,
        emergency_services,
        stats: {
            total_doctors: clinic.doctor_clinic_mapping.length,
            total_staff: staffCount,
            total_appointments: appointmentsCount,
            total_patients: patientsResult.length
        }
    };
};

exports.getProfile = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        if (!clinicId) {
            return ResponseHandler.unauthorized(res, 'No clinic identity found for this user');
        }

        const profileData = await getFullClinicProfileData(clinicId);
        if (!profileData) {
            return ResponseHandler.notFound(res, 'Clinic record not found in registry');
        }

        ResponseHandler.success(res, profileData, 'Clinic profile data retrieved');
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        if (!clinicId) {
            return ResponseHandler.unauthorized(res, 'No clinic identity found');
        }

        const {
            clinic_name, tagline, description, website, establishment_year,
            landmark, medical_council_reg_no,
            // Address fields
            address, city, state, pin_code,
            // Contact fields
            mobile, email,
            // Financial fields
            pan_number, gstin, bank_account_name, bank_account_number, ifsc_code,
            // Related arrays
            services, facilities, payment_modes,
            // Emergency availability
            emergency_services
        } = req.body;

        const clinic = await prisma.clinics.findUnique({
            where: { id: clinicId },
            include: { address: true }
        });

        if (!clinic) {
            return ResponseHandler.notFound(res, 'Clinic record not found');
        }

        // Update Address
        if (address || city || state || pin_code) {
            if (clinic.address_id) {
                await prisma.addresses.update({
                    where: { address_id: clinic.address_id },
                    data: {
                        ...(address !== undefined && { address }),
                        ...(city !== undefined && { city }),
                        ...(state !== undefined && { state }),
                        ...(pin_code !== undefined && { pin_code })
                    }
                });
            } else {
                const newAddress = await prisma.addresses.create({
                    data: { address, city, state, pin_code }
                });
                await prisma.clinics.update({
                    where: { id: clinicId },
                    data: { address_id: newAddress.address_id }
                });
            }
        }

        // Update email/phone through users table
        if (clinic.user_id) {
            if (email) {
                const existingEmail = await prisma.emails.findFirst({
                    where: { user_id: clinic.user_id, is_primary: true }
                });
                if (existingEmail) {
                    await prisma.emails.update({
                        where: { email_id: existingEmail.email_id },
                        data: { email }
                    });
                } else {
                    await prisma.emails.create({
                        data: { user_id: clinic.user_id, email, is_primary: true }
                    });
                }
            }
            if (mobile) {
                const existingPhone = await prisma.contact_numbers.findFirst({
                    where: { user_id: clinic.user_id, is_primary: true }
                });
                if (existingPhone) {
                    await prisma.contact_numbers.update({
                        where: { contact_id: existingPhone.contact_id },
                        data: { phone_number: mobile }
                    });
                } else {
                    await prisma.contact_numbers.create({
                        data: { user_id: clinic.user_id, phone_number: mobile, is_primary: true }
                    });
                }
            }

            // Update tax details
            if (pan_number !== undefined || gstin !== undefined) {
                const existingTax = await prisma.tax_details.findFirst({
                    where: { user_id: clinic.user_id }
                });
                if (existingTax) {
                    await prisma.tax_details.update({
                        where: { tax_id: existingTax.tax_id },
                        data: {
                            ...(pan_number !== undefined && { pan_number }),
                            ...(gstin !== undefined && { gstin })
                        }
                    });
                } else {
                    await prisma.tax_details.create({
                        data: { user_id: clinic.user_id, pan_number, gstin }
                    });
                }
            }

            // Update bank account
            if (bank_account_name !== undefined || bank_account_number !== undefined || ifsc_code !== undefined) {
                const existingBank = await prisma.bank_accounts.findFirst({
                    where: { user_id: clinic.user_id }
                });
                if (existingBank) {
                    await prisma.bank_accounts.update({
                        where: { bank_id: existingBank.bank_id },
                        data: {
                            ...(bank_account_name !== undefined && { account_holder_name: bank_account_name }),
                            ...(bank_account_number !== undefined && { account_number: bank_account_number }),
                            ...(ifsc_code !== undefined && { ifsc_code })
                        }
                    });
                } else {
                    await prisma.bank_accounts.create({
                        data: {
                            user_id: clinic.user_id,
                            account_holder_name: bank_account_name,
                            account_number: bank_account_number,
                            ifsc_code
                        }
                    });
                }
            }
        }

        // Update emergency services setting
        if (emergency_services !== undefined) {
            const settingKey = `clinic_${clinicId}_emergency_services`;
            await prisma.system_settings.upsert({
                where: { setting_key: settingKey },
                update: { setting_value: String(emergency_services), updated_at: new Date() },
                create: { setting_key: settingKey, setting_value: String(emergency_services) }
            });
        }

        // Update services (replace all)
        if (services && Array.isArray(services)) {
            await prisma.clinic_services.deleteMany({ where: { clinic_id: clinicId } });
            if (services.length > 0) {
                await prisma.clinic_services.createMany({
                    data: services.map(s => ({ clinic_id: clinicId, service: s }))
                });
            }
        }

        // Update facilities (replace all)
        if (facilities && Array.isArray(facilities)) {
            await prisma.clinic_facilities.deleteMany({ where: { clinic_id: clinicId } });
            if (facilities.length > 0) {
                await prisma.clinic_facilities.createMany({
                    data: facilities.map(f => ({ clinic_id: clinicId, facility: f }))
                });
            }
        }

        // Update payment modes (replace all)
        if (payment_modes && Array.isArray(payment_modes)) {
            await prisma.clinic_payment_modes.deleteMany({ where: { clinic_id: clinicId } });
            if (payment_modes.length > 0) {
                await prisma.clinic_payment_modes.createMany({
                    data: payment_modes.map(pm => ({ clinic_id: clinicId, payment_mode: pm }))
                });
            }
        }

        // Update main clinic fields
        await prisma.clinics.update({
            where: { id: clinicId },
            data: {
                ...(clinic_name !== undefined && { clinic_name }),
                ...(tagline !== undefined && { tagline }),
                ...(description !== undefined && { description }),
                ...(website !== undefined && { website }),
                ...(landmark !== undefined && { landmark }),
                ...(medical_council_reg_no !== undefined && { medical_council_reg_no }),
                ...(establishment_year !== undefined && { establishment_year: parseInt(establishment_year) }),
                updated_at: new Date()
            }
        });

        // Load and return full updated profile data
        const profileData = await getFullClinicProfileData(clinicId);

        ResponseHandler.success(res, profileData, 'Clinic profile updated successfully');
    } catch (error) {
        next(error);
    }
};

exports.getReports = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;

        const doctorsCount = await prisma.doctor_clinic_mapping.count({
            where: { clinic_id: clinicId }
        });

        const clinicDoctors = await prisma.doctor_clinic_mapping.findMany({
            where: { clinic_id: clinicId },
            select: { doctor_id: true }
        });
        const doctorIds = clinicDoctors.map(d => d.doctor_id);

        const patientsResult = await prisma.appointments.groupBy({
            by: ['patient_id'],
            where: { 
                OR: [
                    { doctor_id: { in: doctorIds } },
                    { clinic_id: clinicId }
                ]
            }
        });
        const patientsCount = patientsResult.length;

        const realAppointmentsCount = await prisma.appointments.count({
            where: { 
                OR: [
                    { doctor_id: { in: doctorIds } },
                    { clinic_id: clinicId }
                ]
            }
        });

        const revenue = await prisma.appointments.aggregate({
            _sum: { earnings: true },
            where: { 
                OR: [
                    { doctor_id: { in: doctorIds } },
                    { clinic_id: clinicId }
                ]
            }
        });

        // Get detailed doctor performance
        const doctorPerformance = await Promise.all(doctorIds.map(async (id) => {
            const doc = await prisma.doctors.findUnique({ where: { id } });
            const consults = await prisma.appointments.count({ where: { doctor_id: id } });
            const earnings = await prisma.appointments.aggregate({
                _sum: { earnings: true },
                where: { doctor_id: id }
            });
            const ratings = await prisma.doctor_reviews.aggregate({
                _avg: { rating: true },
                where: { doctor_id: id }
            });

            return {
                name: doc.full_name,
                consultations: consults,
                revenue: parseFloat(earnings._sum.earnings || 0),
                rating: parseFloat(ratings._avg.rating || 0).toFixed(1)
            };
        }));

        ResponseHandler.success(res, {
            total_doctors: doctorsCount,
            total_appointments: realAppointmentsCount,
            total_patients: patientsCount,
            total_revenue: revenue._sum.earnings || 0,
            doctor_performance: doctorPerformance
        }, 'Clinic analytics retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getSettings = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const settings = await prisma.system_settings.findMany({
            where: {
                setting_key: { startsWith: `clinic_${clinicId}_` }
            }
        });

        const result = {};
        settings.forEach(s => {
            const key = s.setting_key.replace(`clinic_${clinicId}_`, '');
            result[key] = s.setting_value;
        });

        ResponseHandler.success(res, result, 'Clinic configuration parameters retrieved');
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const updates = req.body;

        const promises = Object.entries(updates).map(([key, value]) => {
            const settingKey = `clinic_${clinicId}_${key}`;
            return prisma.system_settings.upsert({
                where: { setting_key: settingKey },
                update: { setting_value: String(value), updated_at: new Date() },
                create: { setting_key: settingKey, setting_value: String(value) }
            });
        });

        await Promise.all(promises);

        ResponseHandler.success(res, updates, 'Clinic configuration parameters synchronized');
    } catch (error) {
        next(error);
    }
};

exports.submitTicket = async (req, res, next) => {
    try {
        const clinicId = req.user.clinic_id;
        const { type, subject, description } = req.body;

        // In a real system, we'd have a support_tickets table.
        // For now, we'll log it and return success to the user.
        console.log(`[Support Ticket] Clinic ${clinicId}: ${type} - ${subject}`);
        
        // We can also create a system notification
        await prisma.notifications_unified.create({
            data: {
                notification_type: 'SUPPORT_TICKET',
                title: `New Ticket: ${subject}`,
                message: `Clinic ${clinicId} raised a ${type} ticket: ${description}`,
                status: 'pending',
                channel: 'system'
            }
        });

        ResponseHandler.success(res, null, 'Support ticket submitted to command center. Analysis in progress.');
    } catch (error) {
        next(error);
    }
};
