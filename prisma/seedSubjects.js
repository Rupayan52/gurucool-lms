const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding core subjects...");

  const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  if (teachers.length === 0) {
    console.log("No teachers found in database to assign subjects to.");
    return;
  }

  // Ensure a default CourseClass exists to satisfy the schema requirement
  let defaultClass = await prisma.courseClass.findFirst({ where: { name: "Standard Phygital Batch" } });
  if (!defaultClass) {
    defaultClass = await prisma.courseClass.create({
      data: { name: "Standard Phygital Batch", description: "Default cohort for core subjects." }
    });
    console.log("- Created default CourseClass.");
  }

  const coreSubjects = ["Physics", "Chemistry", "Mathematics", "Biology"];

  for (let i = 0; i < coreSubjects.length; i++) {
    const subjectName = coreSubjects[i];
    const assignedTeacher = teachers[i % teachers.length]; // Distribute evenly

    const existingSubject = await prisma.subject.findFirst({ where: { name: subjectName } });
    
    if (existingSubject) {
      await prisma.subject.update({
        where: { id: existingSubject.id },
        data: { 
          teacherId: assignedTeacher.id, 
          description: "Complete curriculum coverage.",
          courseClassId: defaultClass.id 
        }
      });
      console.log(`- Updated ${subjectName} -> assigned to ${assignedTeacher.name || assignedTeacher.email}`);
    } else {
      await prisma.subject.create({
        data: {
          name: subjectName,
          description: "Complete curriculum coverage.",
          teacherId: assignedTeacher.id,
          // Satisfy the missing CourseClass relation error
          courseClassId: defaultClass.id 
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
