const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRoles() {
  const roles = [
    'patient',
    'doctor',
    'clinic',
    'receptionist',
    'nurse',
    'lab',
    'pharmacy',
    'admin'
  ];

  console.log('🌱 Seeding roles...');

  try {
    for (const roleName of roles) {
      const existing = await prisma.roles.findFirst({
        where: { role_name: roleName }
      });

      if (!existing) {
        await prisma.roles.create({
          data: { role_name: roleName }
        });
        console.log(`✅ Role added: ${roleName}`);
      } else {
        console.log(`⚠️ Role already exists: ${roleName}`);
      }
    }
    console.log('✅ Role seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRoles();
