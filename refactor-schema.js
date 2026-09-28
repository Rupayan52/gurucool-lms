const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// 1. Clean out the amateur "Global Mentor" hack
schema = schema.replace(/  teacherId String\?\n/g, '');
schema = schema.replace(/  teacher User\? @relation\("StudentFaculty", fields: \[teacherId\], references: \[id\]\)\n/g, '');
schema = schema.replace(/  students User\[\] @relation\("StudentFaculty"\)\n/g, '');

// 2. Inject Subject-Specific Enrollment Relations to User
if (!schema.includes('studentEnrollments')) {
  schema = schema.replace(/(model User\s*{[^}]*)(})/g, '$1  studentEnrollments Enrollment[] @relation("StudentEnrollments")\n  teacherEnrollments Enrollment[] @relation("TeacherEnrollments")\n$2');
}

// 3. Inject Relations to Subject
if (!schema.includes('enrollments Enrollment[]')) {
  schema = schema.replace(/(model Subject\s*{[^}]*)(})/g, '$1  enrollments Enrollment[]\n$2');
}

// 4. Create the Enterprise Enrollment Join-Table
if (!schema.includes('model Enrollment')) {
  schema += `\nmodel Enrollment {
  id        String   @id @default(uuid())
  studentId String
  teacherId String
  subjectId String
  createdAt DateTime @default(now())

  student   User     @relation("StudentEnrollments", fields: [studentId], references: [id])
  teacher   User     @relation("TeacherEnrollments", fields: [teacherId], references: [id])
  subject   Subject  @relation(fields: [subjectId], references: [id])

  @@unique([studentId, subjectId]) // Strict Rule: 1 Teacher per Subject per Student
}\n`;
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Refactored to Enterprise Subject-Specific Enrollment Schema');
