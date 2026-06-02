const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function mapDoctors() {
  try {
    // Find all verified/pending clinics and doctors
    const clinics = await prisma.clinics.findMany();
    const doctors = await prisma.doctors.findMany();

    if (clinics.length === 0 || doctors.length === 0) {
      console.log('No clinics or doctors found to map.');
      return;
    }

    console.log(`Found ${clinics.length} clinics and ${doctors.length} doctors.`);

    for (const clinic of clinics) {
      for (const doctor of doctors) {
        // Check if mapping already exists
        const existing = await prisma.doctor_clinic_mapping.findFirst({
          where: {
            doctor_id: doctor.id,
            clinic_id: clinic.id
          }
        });

        if (!existing) {
          await prisma.doctor_clinic_mapping.create({
            data: {
              doctor_id: doctor.id,
              clinic_id: clinic.id
            }
          });
          console.log(`Mapped Doctor ${doctor.full_name} to Clinic ${clinic.clinic_name}`);
        } else {
          console.log(`Mapping already exists for Doctor ${doctor.full_name} and Clinic ${clinic.clinic_name}`);
        }
      }
    }

    console.log('Mapping completed.');
  } catch (error) {
    console.error('Error mapping doctors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

mapDoctors();
