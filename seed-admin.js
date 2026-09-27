const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('guru2026', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@gurucool.com' },
    update: { 
      passwordHash: hashedPassword, 
      role: 'ADMIN' 
    },
    create: {
      name: 'System Admin',
      email: 'admin@gurucool.com',
      passwordHash: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('✅ Master Admin account successfully injected into Neon database.');
}

main()
  .catch(e => {
    console.error('❌ Error injecting admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
