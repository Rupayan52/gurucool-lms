const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const doubtModel = `
model AcademicDoubt {
  id              String    @id @default(uuid())
  studentId       String
  subjectId       String
  teacherId       String
  title           String
  description     String
  studentFileUrl  String?
  studentFileName String?
  studentFileType String?
  status          String    @default("OPEN") // OPEN, RESOLVED
  teacherAnswer   String?
  teacherFileUrl  String?
  teacherFileName String?
  teacherFileType String?
  meetingLink     String?
  createdAt       DateTime  @default(now())
  resolvedAt      DateTime?
}
`;

if (!schema.includes('model AcademicDoubt')) {
  schema += `\n${doubtModel}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ AcademicDoubt model added to Prisma schema.");
} else {
  console.log("✅ AcademicDoubt model already exists.");
}
