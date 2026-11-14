const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const updatedModel = `model LiveClassSession {
  id               String                @id @default(uuid())
  subjectId        String
  teacherId        String
  moduleId         String?
  topicId          String?
  title            String
  agenda           String?
  teacherDirective String?
  targetStudentIds String?               // JSON array of student IDs; null/empty means entire subject cohort
  isMandatory      Boolean               @default(true)
  isPinned         Boolean               @default(false)
  isRoomLocked     Boolean               @default(false)
  attachmentUrl    String?
  attachmentName   String?
  attachmentType   String?
  vodUrl           String?
  scheduledAt      DateTime
  durationMinutes  Int                   @default(60)
  status           String                @default("SCHEDULED") // SCHEDULED, LIVE, COMPLETED
  roomCode         String
  streamUrl        String
  recordingNotes   String?
  startedAt        DateTime?
  endedAt          DateTime?
  createdAt        DateTime              @default(now())
  attendances      LiveClassAttendance[] @relation("SessionAttendances")
}`;

if (schema.includes('model LiveClassSession {')) {
  schema = schema.replace(/model LiveClassSession \{[\s\S]*?\n\}/, updatedModel);
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Upgraded LiveClassSession model with teacher control fields.");
} else {
  schema += `\n${updatedModel}\n`;
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Added LiveClassSession model with teacher control fields.");
}
