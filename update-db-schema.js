const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('model ForumPost')) {
  schema += `\nmodel ForumPost {
  id             String   @id @default(uuid())
  content        String   @db.Text
  userId         String
  subjectId      String
  channelOwnerId String
  isPinned       Boolean  @default(false)
  createdAt      DateTime @default(now())
  user           User     @relation("PostAuthor", fields: [userId], references: [id])
  subject        Subject  @relation(fields: [subjectId], references: [id])
  channelOwner   User     @relation("ChannelOwner", fields: [channelOwnerId], references: [id])
}\n`;
}

if (!schema.includes('teacherId String?')) {
  schema = schema.replace(/(model User\s*{[^}]*)(})/g, '$1  teacherId String?\n  teacher User? @relation("StudentFaculty", fields: [teacherId], references: [id])\n  students User[] @relation("StudentFaculty")\n  forumPosts ForumPost[] @relation("PostAuthor")\n  ownedChannels ForumPost[] @relation("ChannelOwner")\n$2');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('✅ Injected Cohort/Batch isolation schema');
