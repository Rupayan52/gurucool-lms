const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding core subjects...");

  const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  if (teachers.length === 0) {
    console.log("No teachers found in database to assign subjects to.");
    return;
  }

  const coreSubjects = ["Physics", "Chemistry", "Mathematics", "Biology"];

  for (let i = 0; i < coreSubjects.length; i++) {
    const subjectName = coreSubjects[i];
    const assignedTeacher = teachers[i % teachers.length]; // Distribute evenly

    // Safely check if subject exists without using upsert
    const existingSubject = await prisma.subject.findFirst({ where: { name: subjectName } });
    
    if (existingSubject) {
      await prisma.subject.update({
        where: { id: existingSubject.id },
        data: { teacherId: assignedTeacher.id, description: "Complete curriculum coverage." }
      });
      console.log(`- Updated ${subjectName} -> assigned to ${assignedTeacher.name || assignedTeacher.email}`);
    } else {
      await prisma.subject.create({
        data: {
          name: subjectName,
          description: "Complete curriculum coverage.",
          teacherId: assignedTeacher.id
        }
      });
      console.log(`- Created ${subjectName} -> assigned to ${assignedTeacher.name || assignedTeacher.email}`);
    }
  }
  console.log("✅ Seed complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
