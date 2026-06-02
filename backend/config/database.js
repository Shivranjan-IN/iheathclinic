const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('✅ Prisma database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Prisma database connection error:', err);
    process.exit(-1);
  });

module.exports = prisma;
