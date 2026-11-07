const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const curriculumModels = `
model CurriculumModule {
  id          String         @id @default(uuid())
  subjectId   String
  teacherId   String
  title       String
  description String?
   createdAt  DateTime       @default(now())
  topics      TopicContent[] @relation("ModuleTopics")
}

model TopicContent {
  id          String           @id @default(uuid())
  moduleId    String
  title       String
  contentType String           @default("NOTE") // VIDEO, PDF, PPT, NOTE
  bodyText    String?
  fileUrl     String?
  fileName    String?
  fileType    String?
  createdAt   DateTime         @default(now())
  module      CurriculumModule @relation("ModuleTopics", fields: [moduleId], references: [id], onDelete: Cascade)
}

model AcademicQuiz {
  id          String                 @id @default(uuid())
  subjectId   String
  teacherId   String
  moduleId    String?
  title       String
  description String?
  createdAt   DateTime               @default(now())
  questions   AcademicQuizQuestion[] @relation("QuizQuestions")
  attempts    AcademicQuizAttempt[]  @relation("QuizAttempts")
}

model AcademicQuizQuestion {
  id           String       @id @default(uuid())
  quizId       String
  questionText String
  options      String       // JSON stringified array of options
  correctIndex Int
  points       Int          @default(1)
  quiz         AcademicQuiz @relation("QuizQuestions", fields: [quizId], references: [id], onDelete: Cascade)
}

model AcademicQuizAttempt {
  id          String       @id @default(uuid())
  quizId      String
  studentId   String
  answers     String       // JSON stringified array of selected option indices
  score       Int
  maxScore    Int
  submittedAt DateTime     @default(now())
  quiz        AcademicQuiz @relation("QuizAttempts", fields: [quizId], references: [id], onDelete: Cascade)

  @@unique([quizId, studentId])
}

model AcademicAssignment {
  id           String               @id @default(uuid())
  subjectId    String
  teacherId    String
  moduleId     String?
  title        String
  instructions String
  maxMarks     Int                  @default(100)
  dueDate      DateTime?
  fileUrl      String?
  fileName     String?
  fileType     String?
  createdAt    DateTime             @default(now())
  submissions  AcademicSubmission[] @relation("AssignmentSubmissions")
}

model AcademicSubmission {
  id              String             @id @default(uuid())
  assignmentId    String
  studentId       String
  responseText    String?
  fileUrl         String?
  fileName        String?
  fileType        String?
  awardedMarks    Int?
  teacherFeedback String?
  status          String             @default("SUBMITTED") // SUBMITTED, GRADED
  submittedAt     DateTime           @default(now())
  gradedAt        DateTime?
  assignment      AcademicAssignment @relation("AssignmentSubmissions", fields: [assignmentId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, studentId])
}
`;

if (!schema.includes('model CurriculumModule')) {
  schema += `\n${curriculumModels}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Curriculum, Quiz, and Assignment models added to Prisma schema.");
} else {
  console.log("✅ Curriculum models already present in schema.");
}
