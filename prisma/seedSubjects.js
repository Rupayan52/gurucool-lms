const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding core subjects...");

  // 1. Fetch your existing teachers (like 'Abc' and 'cde')
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' }
  });

  if (teachers.length === 0) {
    console.log("No teachers found in database to assign subjects to.");
    return;
  }

  // 2. Define the core subjects
  const coreSubjects = ["Physics", "Chemistry", "Mathematics", "Biology"];

  // 3. Upsert subjects and assign them to available teachers (round-robin style)
  for (let i = 0; i < coreSubjects.length; i++) {
    const subjectName = coreSubjects[i];
    const assignedTeacher = teachers[i % teachers.length]; // Distribute evenly

    await prisma.subject.upsert({
      where: { name: subjectName },
      update: { teacherId: assignedTeacher.id },
      create: {
        name: subjectName,
        description: "Complete curriculum coverage.",
        teacherId: assignedTeacher.id
      }
    });
    console.log(`- Upserted ${subjectName} assigned to ${assignedTeacher.name || assignedTeacher.email}`);
  }

  console.log("Seed complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
