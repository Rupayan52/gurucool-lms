const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Remove old DoubtTicket if it exists
schema = schema.replace(/model DoubtTicket\s*{[^}]*}/g, '');

// Append the Enterprise Doubt Engine Schema
schema += `\nmodel DoubtTicket {
  id        String   @id @default(uuid())
  userId    String
  subject   String
  question  String
  answer    String?  @db.Text
  status    String   @default("OPEN")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}\n`;

// Ensure User model has the relation
if (!schema.includes('doubtTickets')) {
  schema = schema.replace(/(model User\s*{[^}]*)(})/g, '$1  doubtTickets DoubtTicket[]\n$2');
}

fs.writeFileSync('prisma/schema.prisma', schema);
