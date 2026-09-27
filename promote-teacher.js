const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.updateMany({
    where: { name: 'Abc' }, // Targeting the account shown in your screenshot
    data: { role: 'TEACHER' }
  });
  console.log(`Successfully promoted ${updated.count} account(s) to TEACHER.`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
