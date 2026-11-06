const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Inject into User model
if (schema.includes('model User {') && !schema.includes('TeacherRegistration[] @relation("TeacherRegistrations")')) {
  schema = schema.replace(/model User \{([^}]*)\}/, 'model User {$1  teacherRegistrations TeacherRegistration[] @relation("TeacherRegistrations")\n}');
}

// Inject into Subject model
if (schema.includes('model Subject {') && !schema.includes('TeacherRegistration[] @relation("SubjectTeachers")')) {
  schema = schema.replace(/model Subject \{([^}]*)\}/, 'model Subject {$1  teacherRegistrations TeacherRegistration[] @relation("SubjectTeachers")\n}');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log("✅ Schema safely patched with required back-relations.");
