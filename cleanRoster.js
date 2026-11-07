const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log("Sweeping database for accidental teacher enrollments...");
  
  // Find all users who are teachers
  const teachers = await prisma.user.findMany({ 
    where: { role: { in: ['TEACHER', 'FACULTY'] } } 
  });
  
  const teacherIds = teachers.map(t => t.id);
  
  // Delete any student Registration where the studentId belongs to a teacher
  const deleted = await prisma.registration.deleteMany({
    where: { studentId: { in: teacherIds } }
  });
  
  console.log(`✅ Cleared ${deleted.count} invalid registrations.`);
}

clean()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
