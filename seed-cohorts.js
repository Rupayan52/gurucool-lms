const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teacher = await prisma.user.findFirst({ where: { role: 'TEACHER' } });
  const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
  const subjects = await prisma.subject.findMany();

  if (teacher && students.length > 0 && subjects.length > 0) {
    let count = 0;
    for (const student of students) {
      for (const subject of subjects) {
        await prisma.subjectCohort.upsert({
          where: { studentId_subjectId: { studentId: student.id, subjectId: subject.id } },
          update: { teacherId: teacher.id },
          create: { studentId: student.id, teacherId: teacher.id, subjectId: subject.id }
        });
        count++;
      }
    }
    console.log(`✅ Migrated ${count} specific subject cohorts for testing.`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
