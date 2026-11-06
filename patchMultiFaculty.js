const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add TeacherRegistration bridging table
if (!schema.includes('model TeacherRegistration')) {
  schema += `\nmodel TeacherRegistration {
  id         String   @id @default(uuid())
  teacherId  String
  subjectId  String
  createdAt  DateTime @default(now())

  teacher    User     @relation("TeacherRegistrations", fields: [teacherId], references: [id], onDelete: Cascade)
  subject    Subject  @relation("SubjectTeachers", fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([teacherId, subjectId])
}\n`;
}

// Wire relation into User model
if (schema.includes('model User {') && !schema.includes('TeacherRegistrations')) {
  schema = schema.replace(/model User \{([^}]*)\}/, 'model User {$1  teacherRegistrations TeacherRegistration[] @relation("TeacherRegistrations")\n}');
}

// Wire relation into Subject model
if (schema.includes('model Subject {') && !schema.includes('SubjectTeachers')) {
  schema = schema.replace(/model Subject \{([^}]*)\}/, 'model Subject {$1  teacherRegistrations TeacherRegistration[] @relation("SubjectTeachers")\n}');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("✅ Schema safely patched for Multi-Faculty Subject Support.");
