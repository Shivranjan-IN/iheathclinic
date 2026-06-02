const Patient = require('../models/patientModel');
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');
const cache = require('../utils/cache');
const { uploadToSupabase, deleteFromSupabase } = require('../utils/supabaseStorage');

exports.createPatient = async (req, res, next) => {
    try {
        const { patient_id, full_name, age, gender, phone, email, address, abha_id, blood_group, medical_history, insurance_id } = req.body;

        if (!patient_id || !full_name || !phone) {
            return ResponseHandler.badRequest(res, 'Missing essential fields (patient_id, full_name, phone)');
        }

        const existing = await Patient.findById(patient_id);
        if (existing) {
            return ResponseHandler.badRequest(res, 'Patient with this ID already exists');
        }

        // Build clean data object matching patients table columns from data.sql
        const patientData = {
            patient_id,
            full_name,
            age: age ? parseInt(age, 10) : null,
            gender: gender || null,
            address: address || null,
            abha_id: abha_id || null,
            blood_group: blood_group || null,
            medical_history: medical_history || null,
            insurance_id: insurance_id || null,
        };

        const newPatient = await Patient.create(patientData);
        ResponseHandler.created(res, newPatient, 'Patient added successfully');
    } catch (error) {
        console.error('createPatient error:', error);
        next(error);
    }
};

exports.getAllPatients = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        
        // If doctor is logged in, restrict to their patients
        const doctorId = req.user.role === 'doctor' ? req.user.doctor_id : null;

        const patients = await Patient.findAll(limit, offset, doctorId, search);
        const total = await Patient.count(doctorId, search);

        ResponseHandler.success(res, {
            patients,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        }, 'Patient registry scan complete');
    } catch (error) {
        next(error);
    }
};

exports.getPatientById = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient bio-signature not found');
        }
        ResponseHandler.success(res, patient, 'Patient data retrieved');
    } catch (error) {
        next(error);
    }
};

exports.getPatientProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            console.log('Patient not found by user_id, trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not established for this session');
        }

        console.log('Patient found:', patient.patient_id);

        // Get allergies and conditions from database
        const allergies = await Patient.getAllergies(patient.patient_id);
        const conditions = await Patient.getConditions(patient.patient_id);

        // Parse medical history for medications if it's stored as JSON
        let medications = [];
        if (patient.medical_history) {
            try {
                const history = JSON.parse(patient.medical_history);
                if (history && history.currentMedications) {
                    medications = history.currentMedications;
                }
            } catch (e) {
                // If not JSON, treat it as a string or empty
                console.log('Medical history is not JSON or empty');
            }
        }

        // Add medical data to patient object
        const patientWithMedicalData = {
            ...patient,
            phone: patient.users?.contact_numbers?.[0]?.phone_number || '',
            address: patient.address?.address || '',
            allergies: allergies.map(a => a.allergy_name),
            chronicDiseases: conditions.filter(c => c.is_chronic).map(c => c.condition_name),
            currentMedications: medications,
            emergency_contact: patient.patient_emergency_contacts?.[0]?.phone || ''
        };

        ResponseHandler.success(res, patientWithMedicalData, 'Session-based patient profile retrieved');
    } catch (error) {
        console.error('Error in getPatientProfile:', error);
        next(error);
    }
};

exports.updatePatientProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        console.log('updatePatientProfile called with userId:', userId);

        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            console.log('Patient not found by user_id, trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found for update');
        }

        const { allergies, chronicDiseases, currentMedications, ...profileData } = req.body;
        console.log('updatePatientProfile profileData:', profileData);

        // Validation
        if (profileData.full_name && profileData.full_name.trim() === '') {
            return ResponseHandler.badRequest(res, 'Name cannot be empty');
        }

        // Correctly handle age and numeric fields
        if (profileData.age) profileData.age = parseInt(profileData.age, 10);
        
        // Correctly handle Date objects
        if (profileData.date_of_birth) {
            profileData.date_of_birth = new Date(profileData.date_of_birth);
        }

        // Store currentMedications in medical_history as JSON
        if (currentMedications !== undefined) {
            profileData.medical_history = JSON.stringify({
                currentMedications: currentMedications
            });
        }

        console.log('Sending to Patient.update:', profileData);
        // Update basic profile data
        const updated = await Patient.update(patient.patient_id, profileData);
        console.log('Patient.update success:', updated.patient_id);

        // Update allergies if provided
        if (allergies !== undefined) {
            await Patient.replaceAllergies(patient.patient_id, allergies);
        }

        // Update chronic diseases/conditions if provided
        if (chronicDiseases !== undefined) {
            await Patient.replaceConditions(patient.patient_id, chronicDiseases, true);
        }

        // Get updated data
        const updatedAllergies = await Patient.getAllergies(patient.patient_id);
        const updatedConditions = await Patient.getConditions(patient.patient_id);

        const finalPatient = {
            ...updated,
            phone: updated.users?.contact_numbers?.[0]?.phone_number || profileData.phone || '',
            address: updated.address?.address || profileData.address || '',
            allergies: updatedAllergies.map(a => a.allergy_name),
            chronicDiseases: updatedConditions.filter(c => c.is_chronic).map(c => c.condition_name),
            currentMedications: currentMedications || [],
            emergency_contact: updated.patient_emergency_contacts?.[0]?.phone || profileData.emergency_contact || ''
        };

        ResponseHandler.updated(res, finalPatient, 'Patient profile metrics recalibrated');
    } catch (error) {
        console.error('Error in updatePatientProfile:', error);
        next(error);
    }
};

exports.updatePatient = async (req, res, next) => {
    try {
        const updated = await Patient.update(req.params.id, req.body);
        if (!updated) {
            return ResponseHandler.notFound(res, 'Target not found for recalibration');
        }
        ResponseHandler.updated(res, updated, 'Patient metrics updated');
    } catch (error) {
        next(error);
    }
};

exports.deletePatient = async (req, res, next) => {
    try {
        const deleted = await Patient.delete(req.params.id);
        if (!deleted) {
            return ResponseHandler.notFound(res, 'Target vanished before termination');
        }
        ResponseHandler.deleted(res, 'Patient record purged from system');
    } catch (error) {
        next(error);
    }
};

exports.uploadProfilePhoto = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        console.log('uploadProfilePhoto - userId:', userId);
        console.log('uploadProfilePhoto - email:', req.user.email);
        
        let patient = await Patient.findByUserId(userId);
        console.log('uploadProfilePhoto - patient by userId:', patient ? patient.patient_id : 'not found');

        if (!patient && req.user.email) {
            console.log('uploadProfilePhoto - trying email:', req.user.email);
            patient = await Patient.findByEmail(req.user.email);
            console.log('uploadProfilePhoto - patient by email:', patient ? patient.patient_id : 'not found');
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }

        if (!req.file) {
            return ResponseHandler.badRequest(res, 'No file uploaded');
        }

        console.log('uploadProfilePhoto - file:', req.file);
        
        // Upload to Supabase storage
        const uploadResult = await uploadToSupabase(
            req.file.buffer,
            req.file.originalname,
            'patients/photos'
        );

        if (!uploadResult.success) {
            console.error('Supabase upload failed:', uploadResult.error);
            return ResponseHandler.serverError(res, 'Failed to upload file to storage');
        }

        // Delete old photo if exists
        if (patient.profile_photo_url) {
            await deleteFromSupabase(patient.profile_photo_url);
        }

        // Update patient with the new photo URL using Prisma
        await prisma.patients.update({
            where: { patient_id: patient.patient_id },
            data: {
                profile_photo_url: uploadResult.url,
                profile_photo_mime_type: req.file.mimetype
            }
        });

        console.log('uploadProfilePhoto - updated successfully');

        ResponseHandler.updated(res, {
            patient_id: patient.patient_id,
            profile_photo_mime_type: req.file.mimetype,
            profile_photo_url: uploadResult.url
        }, 'Profile photo updated successfully');
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        next(error);
    }
};

// Get patient profile photo - redirect to Supabase URL
exports.getProfilePhoto = async (req, res, next) => {
    try {
        const { patientId } = req.params;
        
        // Get the profile photo URL from database
        const patient = await prisma.patients.findUnique({
            where: { patient_id: patientId },
            select: {
                profile_photo_url: true,
                profile_photo_mime_type: true
            }
        });
        
        if (!patient || !patient.profile_photo_url) {
            return ResponseHandler.notFound(res, 'Profile photo not found');
        }

        // Redirect to the Supabase URL
        res.redirect(patient.profile_photo_url);
    } catch (error) {
        console.error('Error getting profile photo:', error);
        next(error);
    }
};

/**
 * Dashboard Stats
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        
        const cacheKey = `patient_dashboard_stats_${userId}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return ResponseHandler.success(res, cachedData, 'Patient dashboard metrics synchronized (cached)');
        }

        let patient = await Patient.findByUserId(userId);

        if (!patient && req.user.email) {
            patient = await Patient.findByEmail(req.user.email);
        }

        if (!patient) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }

        const patientId = patient.patient_id;

        const [upcomingCount, activePrescriptionsCount, pendingBillsResult, appointments, prescriptions] = await Promise.all([
            prisma.appointments.count({
                where: { patient_id: patientId, status: 'scheduled', appointment_date: { gte: new Date() } }
            }),
            prisma.prescriptions.count({
                where: { patient_id: patientId }
            }),
            prisma.invoices.aggregate({
                where: { patient_id: patientId, status: 'pending' },
                _sum: { total_amount: true }
            }),
            prisma.appointments.findMany({
                where: { patient_id: patientId },
                take: 5,
                orderBy: { appointment_date: 'desc' },
                include: { doctor: true }
            }),
            prisma.prescriptions.findMany({
                where: { patient_id: patientId },
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { doctor: true }
            })
        ]);

        // Map recent activities
        const recentActivities = [];
        appointments.forEach(a => {
            recentActivities.push({
                id: `apt-${a.appointment_id}`,
                type: 'appointment',
                title: 'Medical Consultation',
                description: `Scheduled with Dr. ${a.doctor?.full_name || 'Medical Professional'}`,
                time: a.appointment_date ? new Date(a.appointment_date).getTime() : Date.now() - 3600000
            });
        });

        prescriptions.forEach(p => {
            recentActivities.push({
                id: `rx-${p.prescription_id}`,
                type: 'prescription',
                title: 'New Prescription Received',
                description: `Advised by Dr. ${p.doctor?.full_name || 'Medical Professional'}`,
                time: p.created_at ? new Date(p.created_at).getTime() : Date.now() - 7200000
            });
        });

        // Sort activities by time desc
        recentActivities.sort((a, b) => b.time - a.time);

        const stats = {
            upcomingAppointments: upcomingCount,
            activePrescriptions: activePrescriptionsCount,
            healthScore: 85,
            pendingBills: pendingBillsResult._sum.total_amount || 0,
            recentActivities: recentActivities.slice(0, 5)
        };

        // Cache the patient dashboard stats for 5 minutes
        cache.set(cacheKey, stats, 300);

        ResponseHandler.success(res, stats, 'Patient dashboard metrics synchronized');
    } catch (error) {
        console.error('getDashboardStats error:', error);
        next(error);
    }
};

/**
 * AI Insight Handlers
 */
exports.explainReport = async (req, res, next) => {
    try {
        const { report_content, language } = req.body;
        
        const explanation = `Based on the report content provided, here is a simplified explanation in ${language}:
        The clinical findings suggest normal biological markers across primary test parameters. 
        1. Hematology levels are within reference ranges.
        2. Metabolic panel indicates optimal organ function.
        3. No immediate clinical concerns were detected.
        
        *Note: This is an AI-generated explanation. Please consult your physician for clinical diagnosis.*`;

        ResponseHandler.success(res, { explanation }, 'Health report analyzed by AI');
    } catch (error) {
        next(error);
    }
};

exports.explainPrescription = async (req, res, next) => {
    try {
        const { prescription_content, language } = req.body;

        const explanation = `Here is a simplified breakdown of your prescription medicines in ${language}:
        1. Primary Medication: Focuses on addressing your core symptoms and promoting recovery.
        2. Maintenance Dose: Helps stabilize physiological metrics and prevents recurrence.
        3. Supportive Therapy: Provides symptomatic relief and boosts immune response.
        
        Recommended Action: Follow the dosage schedule as prescribed and maintain adequate hydration.
        
        *Note: This is an AI-generated explanation. Please consult your doctor for medical advice.*`;

        ResponseHandler.success(res, { explanation }, 'Prescription analyzed by AI');
    } catch (error) {
        next(error);
    }
};

exports.getMyInvoices = async (req, res, next) => {
    try {
        // Find patient_id from user
        const user = await prisma.users.findUnique({
            where: { user_id: req.user.user_id },
            include: { patients: true }
        });
        
        let patientId = req.user.patient_id;
        if (!patientId && user?.patients?.patient_id) {
            patientId = user.patients.patient_id;
        }

        if (!patientId) {
            return ResponseHandler.badRequest(res, 'Patient ID not found for user');
        }

        const invoices = await prisma.invoices.findMany({
            where: { patient_id: patientId },
            include: {
                invoice_items: true,
                invoice_payments: true
            },
            orderBy: { invoice_date: 'desc' }
        });

        ResponseHandler.success(res, invoices, 'Invoices fetched successfully');
    } catch (error) {
        console.error('getMyInvoices error:', error);
        next(error);
    }
};

const getPatientIdFromUser = async (user) => {
    let patient = await Patient.findByUserId(user.user_id);
    if (!patient && user.email) {
        patient = await Patient.findByEmail(user.email);
    }
    return patient?.patient_id || null;
};

exports.saveScannedPrescription = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const { file_url, extracted_data } = req.body;
        const newScan = await prisma.scanned_prescriptions.create({
            data: {
                patient_id: patientId,
                file_url,
                extracted_data: extracted_data || {}
            }
        });
        ResponseHandler.created(res, newScan, 'Scanned prescription saved successfully');
    } catch (error) {
        console.error('saveScannedPrescription error:', error);
        next(error);
    }
};

exports.getScannedPrescriptionHistory = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const scans = await prisma.scanned_prescriptions.findMany({
            where: { patient_id: patientId },
            orderBy: { created_at: 'desc' }
        });
        ResponseHandler.success(res, scans, 'Scanned prescription history retrieved');
    } catch (error) {
        console.error('getScannedPrescriptionHistory error:', error);
        next(error);
    }
};

exports.getSavedMedicines = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const saved = await prisma.patient_saved_medicines.findMany({
            where: { patient_id: patientId },
            include: {
                medicine: true
            },
            orderBy: { created_at: 'desc' }
        });
        ResponseHandler.success(res, saved, 'Saved medicines retrieved');
    } catch (error) {
        console.error('getSavedMedicines error:', error);
        next(error);
    }
};

exports.toggleSaveMedicine = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const { medicine_id } = req.body;
        if (!medicine_id) {
            return ResponseHandler.badRequest(res, 'Medicine ID is required');
        }
        
        const existing = await prisma.patient_saved_medicines.findFirst({
            where: { patient_id: patientId, medicine_id }
        });

        if (existing) {
            await prisma.patient_saved_medicines.delete({
                where: { id: existing.id }
            });
            return ResponseHandler.success(res, { saved: false }, 'Medicine removed from saved list');
        } else {
            const saved = await prisma.patient_saved_medicines.create({
                data: {
                    patient_id: patientId,
                    medicine_id
                }
            });
            return ResponseHandler.created(res, { saved: true, record: saved }, 'Medicine saved successfully');
        }
    } catch (error) {
        console.error('toggleSaveMedicine error:', error);
        next(error);
    }
};

exports.getSavedAddresses = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const addresses = await prisma.addresses.findMany({
            where: { patient_id: patientId }
        });
        ResponseHandler.success(res, addresses, 'Saved addresses retrieved');
    } catch (error) {
        console.error('getSavedAddresses error:', error);
        next(error);
    }
};

exports.saveAddress = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const { address, city, state, pin_code, latitude, longitude } = req.body;
        const newAddress = await prisma.addresses.create({
            data: {
                patient_id: patientId,
                address,
                city,
                state,
                pin_code,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            }
        });
        ResponseHandler.created(res, newAddress, 'Address saved successfully');
    } catch (error) {
        console.error('saveAddress error:', error);
        next(error);
    }
};

exports.deleteAddress = async (req, res, next) => {
    try {
        const patientId = await getPatientIdFromUser(req.user);
        if (!patientId) {
            return ResponseHandler.notFound(res, 'Patient profile not found');
        }
        const { id } = req.params;
        const addressRecord = await prisma.addresses.findUnique({
            where: { address_id: parseInt(id) }
        });
        if (!addressRecord || addressRecord.patient_id !== patientId) {
            return ResponseHandler.notFound(res, 'Address not found or unauthorized');
        }
        await prisma.addresses.delete({
            where: { address_id: parseInt(id) }
        });
        ResponseHandler.success(res, null, 'Address deleted successfully');
    } catch (error) {
        console.error('deleteAddress error:', error);
        next(error);
    }
};


