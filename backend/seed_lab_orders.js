const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('🌱 Seeding lab orders and items for testing analytics, mapping, and bookings...');
        
        // 1. Fetch lookup datasets
        const patients = await prisma.patients.findMany({ select: { patient_id: true } });
        const clinics = await prisma.clinics.findMany({ select: { id: true } });
        const doctors = await prisma.doctors.findMany({ select: { id: true } });
        const labs = await prisma.labs.findMany({ select: { lab_id: true } });
        const testTypes = await prisma.lab_test_types.findMany({ select: { test_type_id: true, price: true } });

        if (patients.length === 0 || clinics.length === 0 || doctors.length === 0 || labs.length === 0 || testTypes.length === 0) {
            console.error('❌ Missing prerequisite data. Seed main db first.');
            return;
        }

        // Clean existing orders
        await prisma.lab_order_items.deleteMany({});
        await prisma.lab_orders.deleteMany({});
        console.log('🗑️ Cleaned existing lab orders & items');

        // Let's create technicians for other labs if they don't exist
        const staffNames = ['Amit Patel', 'Vikram Singh', 'Neha Sharma', 'Rohan Mehta', 'Siddharth Roy', 'Sneha Patil', 'Aarav Gupta'];
        
        for (const lab of labs) {
            const existingStaff = await prisma.lab_staff.findMany({ where: { lab_id: lab.lab_id } });
            if (existingStaff.length === 0) {
                console.log(`Creating staff for Lab ${lab.lab_id}...`);
                for (let i = 0; i < staffNames.length; i++) {
                    await prisma.lab_staff.create({
                        data: {
                            lab_id: lab.lab_id,
                            full_name: `${staffNames[i]} (Lab ${lab.lab_id})`,
                            email: `staff.${lab.lab_id}.${i}@clinic.com`,
                            phone: `+91 900000000${i}`,
                            role: i < 5 ? 'technician' : 'admin',
                            is_active: true,
                            security_level: i < 5 ? 1 : 2
                        }
                    });
                }
            }
        }

        const allStaff = await prisma.lab_staff.findMany({ where: { role: 'technician' } });

        // Let's create 10 bookings per lab to make analytics charts look great but keep it fast
        const statuses = ['Pending', 'Accepted', 'Processing', 'Sample Collected', 'Completed', 'Cancelled'];
        
        let orderCount = 1;
        const now = new Date();

        for (const lab of labs) {
            const labTechs = allStaff.filter(s => s.lab_id === lab.lab_id);
            console.log(`Seeding 12 bookings for Lab ID: ${lab.lab_id}...`);

            for (let i = 0; i < 12; i++) {
                // Generate a date within the last 7 days
                const orderDate = new Date();
                orderDate.setDate(now.getDate() - (i % 7));
                orderDate.setHours(9 + (i % 8), (i * 13) % 60, 0, 0);

                const patient = patients[i % patients.length];
                const clinic = clinics[i % clinics.length];
                const doctor = doctors[i % doctors.length];
                const status = statuses[i % statuses.length];
                const collectionType = i % 2 === 0 ? 'Home' : 'Walking';
                
                // Tech assignment
                let technicianId = null;
                if ((status === 'Processing' || status === 'Sample Collected' || status === 'Completed') && labTechs.length > 0) {
                    technicianId = labTechs[i % labTechs.length].id;
                }

                // Coordinates for collection map (simulating around Mumbai)
                // Mumbai base: lat 19.0760, lng 72.8777
                let latitude = null;
                let longitude = null;
                if (collectionType === 'Home') {
                    // Small offset
                    latitude = 19.05 + (i * 0.007) % 0.05;
                    longitude = 72.85 + (i * 0.009) % 0.07;
                }

                const labOrderId = `LAB-${lab.lab_id}-${1000 + orderCount}`;
                orderCount++;

                // Determine 1-2 random tests for this order
                const test1 = testTypes[i % testTypes.length];
                const test2 = testTypes[(i + 3) % testTypes.length];
                const selectedTests = [test1];
                if (i % 3 === 0) selectedTests.push(test2);

                // Create the order
                await prisma.lab_orders.create({
                    data: {
                        lab_order_id: labOrderId,
                        patient_id: patient.patient_id,
                        doctor_id: doctor.id,
                        clinic_id: clinic.id,
                        lab_id: lab.lab_id,
                        priority: i % 5 === 0 ? 'High' : (i % 7 === 0 ? 'Urgent' : 'Normal'),
                        order_date: orderDate,
                        status: status,
                        collection_type: collectionType,
                        technician_id: technicianId,
                        latitude: latitude,
                        longitude: longitude,
                        notes: `Simulated patient instructions note for order ${labOrderId}.`
                    }
                });

                // Create order items individually to avoid nested relation transactions
                for (const t of selectedTests) {
                    await prisma.lab_order_items.create({
                        data: {
                            lab_order_id: labOrderId,
                            test_type_id: t.test_type_id,
                            price: t.price
                        }
                    });
                }
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
