const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  if (teacher) {
    const updated = await prisma.user.updateMany({
      where: { role: 'STUDENT', teacherId: null },
      data: { teacherId: teacher.id }
    });
    console.log(`✅ Successfully assigned ${updated.count} scholars to Faculty: ${teacher.name}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
