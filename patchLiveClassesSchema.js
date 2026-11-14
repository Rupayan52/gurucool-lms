const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const liveClassModels = `
model LiveClassSession {
  id              String                @id @default(uuid())
  subjectId       String
  teacherId       String
  moduleId        String?
  title           String
  agenda          String?
  scheduledAt     DateTime
  durationMinutes Int                   @default(60)
  status          String                @default("SCHEDULED") // SCHEDULED, LIVE, COMPLETED
  roomCode        String
  streamUrl       String
  recordingNotes  String?
  startedAt       DateTime?
  endedAt         DateTime?
  createdAt       DateTime              @default(now())
  attendances     LiveClassAttendance[] @relation("SessionAttendances")
}

model LiveClassAttendance {
  id        String           @id @default(uuid())
  sessionId String
  studentId String
  joinedAt  DateTime         @default(now())
  session   LiveClassSession @relation("SessionAttendances", fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, studentId])
}
`;

if (!schema.includes('model LiveClassSession')) {
  schema += `\n${liveClassModels}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ LiveClassSession and LiveClassAttendance models added to Prisma schema.");
} else {
  console.log("✅ LiveClassSession models already exist in schema.");
}
