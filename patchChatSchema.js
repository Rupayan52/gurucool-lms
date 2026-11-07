const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const modelsToAdd = `
model Message {
  id        String   @id @default(uuid())
  content   String
  senderId  String
  subjectId String?  // Null if direct message
  threadId  String?  // Null if group message
  createdAt DateTime @default(now())

  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  subject   Subject? @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  thread    DirectThread? @relation(fields: [threadId], references: [id], onDelete: Cascade)
}

model DirectThread {
  id        String   @id @default(uuid())
  studentId String
  teacherId String
  isLocked  Boolean  @default(true) // Teacher must approve to unlock
  createdAt DateTime @default(now())

  student   User     @relation("StudentThreads", fields: [studentId], references: [id], onDelete: Cascade)
  teacher   User     @relation("TeacherThreads", fields: [teacherId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@unique([studentId, teacherId])
}

model ModerationAction {
  id        String   @id @default(uuid())
  studentId String
  teacherId String
  subjectId String
  isMuted   Boolean  @default(false)
  createdAt DateTime @default(now())

  student   User     @relation("StudentModeration", fields: [studentId], references: [id], onDelete: Cascade)
  teacher   User     @relation("TeacherModeration", fields: [teacherId], references: [id], onDelete: Cascade)
  subject   Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([studentId, subjectId])
}
`;

if (!schema.includes('model Message {')) {
  schema += `\n${modelsToAdd}`;
  // Wire relations to User
  schema = schema.replace(/model User \{([^}]*)\}/, 'model User {$1  messages Message[]\n  studentThreads DirectThread[] @relation("StudentThreads")\n  teacherThreads DirectThread[] @relation("TeacherThreads")\n  studentModeration ModerationAction[] @relation("StudentModeration")\n  teacherModeration ModerationAction[] @relation("TeacherModeration")\n}');
  // Wire relations to Subject
  schema = schema.replace(/model Subject \{([^}]*)\}/, 'model Subject {$1  messages Message[]\n  moderation ModerationAction[]\n}');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Schema updated with Chat and Moderation models.");
} else {
  console.log("⚠️ Chat models already exist.");
}
