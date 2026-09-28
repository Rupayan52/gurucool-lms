const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Strip out the broken "Enrollment" relationships we accidentally added
schema = schema.split('\n').filter(line => {
  if (line.includes('studentEnrollments')) return false;
  if (line.includes('teacherEnrollments')) return false;
  if (line.includes('enrollments Enrollment[]')) return false;
  return true;
}).join('\n');

// 2. Inject SubjectCohort relations safely
if (!schema.includes('studentCohorts')) {
  schema = schema.replace(/(model User\s*{[^}]*)(})/g, '$1  studentCohorts SubjectCohort[] @relation("StudentCohort")\n  teacherCohorts SubjectCohort[] @relation("TeacherCohort")\n$2');
}
if (!schema.includes('cohorts SubjectCohort[]')) {
  schema = schema.replace(/(model Subject\s*{[^}]*)(})/g, '$1  cohorts SubjectCohort[] @relation("SubjectCohort")\n$2');
}

// 3. Create the new independent SubjectCohort model
if (!schema.includes('model SubjectCohort')) {
  schema += `\nmodel SubjectCohort {
  id        String   @id @default(uuid())
  studentId String
  teacherId String
  subjectId String
  createdAt DateTime @default(now())

  student   User     @relation("StudentCohort", fields: [studentId], references: [id])
  teacher   User     @relation("TeacherCohort", fields: [teacherId], references: [id])
  subject   Subject  @relation("SubjectCohort", fields: [subjectId], references: [id])

  @@unique([studentId, subjectId])
}\n`;
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Cleaned legacy collisions and injected pure SubjectCohort schema');
