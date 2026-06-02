const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const prisma = require('./config/database');

async function seed() {
    try {
        console.log('🌱 Seeding database...');

        // 0. Seed basic roles
        const roles = ['patient', 'doctor', 'clinic', 'receptionist', 'nurse', 'lab', 'pharmacy', 'admin'];
        for (const roleName of roles) {
            await prisma.roles.upsert({
                where: { role_id: roles.indexOf(roleName) + 1 },
                update: { role_name: roleName },
                create: { role_id: roles.indexOf(roleName) + 1, role_name: roleName }
            });
        }
        console.log('✅ Roles seeded');

        // 0.1 Seed appointment status master
        const statuses = [
            { status_code: 'scheduled', description: 'Appointment is scheduled' },
            { status_code: 'completed', description: 'Appointment is completed' },
            { status_code: 'cancelled', description: 'Appointment is cancelled' },
            { status_code: 'in_progress', description: 'Appointment is in progress' }
        ];
        for (const status of statuses) {
            await prisma.appointment_status_master.upsert({
                where: { status_code: status.status_code },
                update: { description: status.description },
                create: status
            });
        }
        console.log('✅ Appointment statuses seeded');

        // 1. Create Address for Clinic
        const clinicAddress = await prisma.addresses.create({
            data: {
                address: '123 Healthcare Avenue, Mumbai',
                pin_code: '400001',
                city: 'Mumbai',
                state: 'Maharashtra'
            }
        });

        // 2. Seed clinic
        const demoClinicData = {
            clinic_name: 'Elinic Healthcare Center',
            establishment_year: 2020,
            tagline: 'Your Health, Our Priority',
            description: 'Leading healthcare provider',
            landmark: 'Near Central Hospital',
            website: 'https://www.elinichealthcare.com',
            medical_council_reg_no: 'MCR123456789',
            terms_accepted: true,
            declaration_accepted: true,
            verification_status: 'VERIFIED',
            address_id: clinicAddress.address_id
        };

        const existingClinic = await prisma.clinics.findFirst({
            where: { clinic_name: demoClinicData.clinic_name }
        });
        
        let clinic = existingClinic;
        if (!existingClinic) {
            clinic = await prisma.clinics.create({
                data: demoClinicData
            });
            console.log('✅ Clinic created:', { id: clinic.id, clinic_name: clinic.clinic_name });
        } else {
            console.log('⚠️ Clinic already exists.');
        }

        // 3. Seed users
        const demoUsers = [
            { full_name: 'Dr. Sarah Johnson', email: 'admin@clinic.com', mobile_number: '+91 98765 43210', role: 'admin', password: 'admin' },
            { full_name: 'Dr. Michael Chen', email: 'doctor@clinic.com', mobile_number: '+91 98765 43211', role: 'doctor', password: 'doctor' },
            { full_name: 'Rahul Sharma', email: 'patient@clinic.com', mobile_number: '+91 98765 43216', role: 'patient', password: 'patient' },
        ];

        const createdUsers = {};

        for (const user of demoUsers) {
            // Check if user exists via emailRecord
            const emailRecord = await prisma.emails.findUnique({
                where: { email: user.email },
                include: { users: true }
            });
            
            let dbUser;
            if (!emailRecord) {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(user.password, salt);

                // Create user with nested emails and contact_numbers
                const roleRecord = await prisma.roles.findFirst({ where: { role_name: user.role } });
                dbUser = await prisma.users.create({
                    data: {
                        full_name: user.full_name,
                        role: user.role,
                        role_id: roleRecord ? roleRecord.role_id : null,
                        password_hash: passwordHash,
                        emails: {
                            create: {
                                email: user.email,
                                is_primary: true
                            }
                        },
                        contact_numbers: {
                            create: {
                                phone_number: user.mobile_number,
                                is_primary: true
                            }
                        }
                    }
                });
                console.log('✅ User created:', { user_id: dbUser.user_id, email: user.email, role: dbUser.role });
            } else {
                dbUser = emailRecord.users;
                console.log(`⚠️ User ${user.email} already exists.`);
            }
            createdUsers[user.full_name] = dbUser.user_id;
        }

        // 4. Seed doctors
        const demoDoctors = [
            {
                full_name: 'Dr. Sarah Johnson',
                date_of_birth: new Date('1980-05-15'),
                medical_council_reg_no: 'MC123456789',
                qualifications: 'MBBS, MD (Internal Medicine)',
                experience_years: 15,
                bio: 'Experienced internal medicine specialist with 15 years of practice.',
                verification_status: 'VERIFIED',
                user_id: createdUsers['Dr. Sarah Johnson'],
                email: 'sarah.johnson@clinic.com' // for lookup
            },
            {
                full_name: 'Dr. Michael Chen',
                date_of_birth: new Date('1975-08-20'),
                medical_council_reg_no: 'MC987654321',
                qualifications: 'MBBS, MS (Surgery)',
                experience_years: 20,
                bio: 'Renowned surgeon with expertise in minimally invasive procedures.',
                verification_status: 'VERIFIED',
                user_id: createdUsers['Dr. Michael Chen'],
                email: 'michael.chen@clinic.com' // for lookup
            }
        ];

        for (const dr of demoDoctors) {
            const existingDoctor = await prisma.doctors.findFirst({
                where: { full_name: dr.full_name }
            });
            
            if (existingDoctor) {
                if (!existingDoctor.user_id && dr.user_id) {
                    await prisma.doctors.update({
                        where: { id: existingDoctor.id },
                        data: { user_id: dr.user_id }
                    });
                    console.log(`🔗 Linked Doctor ${dr.full_name} to User ID ${dr.user_id}`);
                } else {
                    console.log(`⚠️ Doctor ${dr.full_name} already exists.`);
                }
                continue;
            }

            const { email, ...drData } = dr;
            const newDoctor = await prisma.doctors.create({
                data: drData
            });
            console.log('✅ Doctor created:', { id: newDoctor.id, full_name: newDoctor.full_name });
        }

        // 5. Seed patients
        const demoPatients = [
            {
                patient_id: 'PAT-1772343637931-413',
                full_name: 'Rakesh Mali',
                gender: 'Male',
                blood_group: 'B+',
                medical_history: 'No significant history',
                user_id: createdUsers['Rahul Sharma']
            },
            {
                patient_id: 'PAT-1772343606346-730',
                full_name: 'Priya Patel',
                gender: 'Female',
                blood_group: 'A+',
                medical_history: 'Asthma'
            }
        ];

        for (const patient of demoPatients) {
            const existingPatient = await prisma.patients.findUnique({
                where: { patient_id: patient.patient_id }
            });
            if (existingPatient) {
                if (!existingPatient.user_id && patient.user_id) {
                    await prisma.patients.update({
                        where: { patient_id: existingPatient.patient_id },
                        data: { user_id: patient.user_id }
                    });
                    console.log(`🔗 Linked Patient ${patient.full_name} to User ID ${patient.user_id}`);
                } else {
                    console.log(`⚠️ Patient ${patient.patient_id} already exists.`);
                }
                continue;
            }

            const newPatient = await prisma.patients.create({
                data: patient
            });
            console.log('✅ Patient created:', { patient_id: newPatient.patient_id, full_name: newPatient.full_name });
        }

        // 6. Seed appointments
        // Find back the doctors we created
        const doctorSarah = await prisma.doctors.findFirst({ where: { full_name: 'Dr. Sarah Johnson' } });
        const doctorMichael = await prisma.doctors.findFirst({ where: { full_name: 'Dr. Michael Chen' } });
        const patients = await prisma.patients.findMany();
        
        const mainDoctorId = doctorMichael ? doctorMichael.id : (doctorSarah ? doctorSarah.id : null);

        if (mainDoctorId && patients.length > 0) {
            const demoAppointments = [
                {
                    appointment_id: 'APT-20240101-1200-1234',
                    patient_id: 'PAT-1772343637931-413',
                    doctor_id: mainDoctorId,
                    appointment_date: new Date('2024-01-15'),
                    appointment_time: new Date('2024-01-15T10:00:00Z'),
                    appointment_type: 'Consultation',
                    mode: 'in-person',
                    status: 'scheduled'
                },
                {
                    appointment_id: 'APT-20240102-1400-5678',
                    patient_id: 'PAT-1772343637931-413',
                    doctor_id: mainDoctorId,
                    appointment_date: new Date('2024-01-20'),
                    appointment_time: new Date('2024-01-20T14:00:00Z'),
                    appointment_type: 'Follow-up',
                    mode: 'video',
                    status: 'completed'
                },
                {
                    appointment_id: 'APT-20240103-0900-9012',
                    patient_id: patients[1].patient_id,
                    doctor_id: mainDoctorId,
                    appointment_date: new Date('2024-01-25'),
                    appointment_time: new Date('2024-01-25T09:00:00Z'),
                    appointment_type: 'Consultation',
                    mode: 'in-person',
                    status: 'scheduled'
                }
            ];

            for (const appointment of demoAppointments) {
                await prisma.appointments.upsert({
                    where: { appointment_id: appointment.appointment_id },
                    update: appointment,
                    create: appointment
                });
                console.log('✅ Appointment upserted:', { appointment_id: appointment.appointment_id, status: appointment.status });
            }
        }

        // 7. Seed Lab Test Types
        const demoTestTypes = [
            { test_name: 'Complete Blood Count (CBC)', price: 450, tat_hours: 24 },
            { test_name: 'Lipid Panel', price: 800, tat_hours: 24 },
            { test_name: 'HbA1c', price: 600, tat_hours: 12 },
            { test_name: 'Thyroid Profile', price: 1200, tat_hours: 48 },
            { test_name: 'Liver Function Test', price: 900, tat_hours: 24 },
            { test_name: 'Urine Analysis', price: 300, tat_hours: 6 },
        ];

        for (const testType of demoTestTypes) {
            const existing = await prisma.lab_test_types.findFirst({
                where: { test_name: testType.test_name }
            });

            if (!existing) {
                await prisma.lab_test_types.create({ data: testType });
                console.log(`✅ Lab Test Type created: ${testType.test_name}`);
            }
        }

        // 8. Seed Prescriptions
        const completedAppointments = await prisma.appointments.findMany({
            where: { status: 'completed' }
        });

        if (completedAppointments.length > 0) {
            console.log(`📝 Seeding prescriptions for ${completedAppointments.length} completed appointments...`);
            for (const appt of completedAppointments) {
                const prescription_id = `RX-${appt.appointment_id.split('-').pop()}`;
                
                await prisma.prescriptions.upsert({
                    where: { prescription_id },
                    update: {
                        patient_id: appt.patient_id,
                        doctor_id: appt.doctor_id,
                        appointment_id: appt.appointment_id,
                        diagnosis: 'Common cold with mild symptoms. Chest is clear.',
                        notes: 'Drink plenty of warm fluids. Complete the antibiotic course.',
                        created_at: appt.appointment_date
                    },
                    create: {
                        prescription_id,
                        patient_id: appt.patient_id,
                        doctor_id: appt.doctor_id,
                        appointment_id: appt.appointment_id,
                        diagnosis: 'Common cold with mild symptoms. Chest is clear.',
                        notes: 'Drink plenty of warm fluids. Complete the antibiotic course.',
                        created_at: appt.appointment_date,
                        medicines: {
                            create: [
                                { medicine_name: 'Paracetamol', dosage: '500mg', frequency: '1-0-1', duration: '3 days' },
                                { medicine_name: 'Amoxicillin', dosage: '250mg', frequency: '1-1-1', duration: '5 days' }
                            ]
                        }
                    }
                });
                console.log(`✅ Prescription upserted for appointment: ${appt.appointment_id}`);
            }
        }

        // 9. Seed Lab Orders
        console.log('🧪 Seeding lab orders...');
        const allTestTypes = await prisma.lab_test_types.findMany();
        
        if (allTestTypes.length > 0 && patients.length > 0 && mainDoctorId) {
            const demoLabOrders = [
                {
                    patient_id: 'PAT-1772343637931-413',
                    doctor_id: mainDoctorId,
                    test_type_id: allTestTypes[0].test_type_id,
                    order_date: new Date(),
                    status: 'Completed',
                    priority: 'High',
                    notes: 'Follow up on previous blood work.',
                    price: allTestTypes[0].price
                },
                {
                    patient_id: 'PAT-1772343637931-413',
                    doctor_id: mainDoctorId,
                    test_type_id: allTestTypes[2].test_type_id,
                    order_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    status: 'Pending',
                    priority: 'Normal',
                    notes: 'Routine checkup.',
                    price: allTestTypes[2].price
                },
                {
                    patient_id: patients[1].patient_id,
                    doctor_id: mainDoctorId,
                    test_type_id: allTestTypes[1].test_type_id,
                    order_date: new Date(),
                    status: 'Processing',
                    priority: 'Urgent',
                    notes: 'Urgent request.',
                    price: allTestTypes[1].price
                }
            ];

            for (let i = 0; i < demoLabOrders.length; i++) {
                const order = demoLabOrders[i];
                await prisma.lab_orders.upsert({
                    where: { lab_order_id: `LAB-DEMO-${i+1}` },
                    update: order,
                    create: {
                        ...order,
                        lab_order_id: `LAB-DEMO-${i+1}`
                    }
                });
            }
            console.log('✅ Lab orders seeded/upserted successfully');
        }

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
