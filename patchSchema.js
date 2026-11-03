const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// A. Add the Registration model to the bottom
if (!schema.includes('model Registration')) {
  schema += `\nmodel Registration {
  id         String   @id @default(uuid())
  studentId  String
  subjectId  String
  createdAt  DateTime @default(now())
  student    User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subject    Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  @@unique([studentId, subjectId])
}\n`;
}

// B. Safely inject relation fields into the User model
if (schema.includes('model User {') && !schema.includes('registrations Registration[]')) {
  schema = schema.replace(/model User \{([^}]*)\}/, 'model User {$1  registrations    Registration[]\n  mentoredSubjects Subject[] @relation("TeacherSubjects")\n}');
}

// C. Safely inject relation fields into the Subject model
if (schema.includes('model Subject {') && !schema.includes('registrations Registration[]')) {
  schema = schema.replace(/model Subject \{([^}]*)\}/, 'model Subject {$1  registrations Registration[]\n  teacherId     String?\n  teacher       User?      @relation("TeacherSubjects", fields: [teacherId], references: [id])\n}');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("✅ Schema safely patched with Registration and Teacher relations.");
