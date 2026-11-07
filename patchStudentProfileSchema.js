const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const studentProfileModel = `
model StudentProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  headline          String?
  institution       String?
  academicLevel     String?
  targetExam        String?
  graduationYear    String?
  phone             String?
  location          String?
  dateOfBirth       String?
  guardianName      String?
  guardianPhone     String?
  learningStyle     String?
  dailyStudyGoalHrs Float    @default(4)
  availability      String   @default("Available")
  careerGoals       String?
  skillsTags        String?  // JSON stringified array of tags
  linkedinUrl       String?
  githubUrl         String?
  portfolioUrl      String?
  bannerTheme       String   @default("INDIGO_CYBER")
  updatedAt         DateTime @updatedAt
}
`;

if (!schema.includes('model StudentProfile')) {
  schema += `\n${studentProfileModel}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ StudentProfile model added to Prisma schema.");
} else {
  console.log("✅ StudentProfile model already exists.");
}
