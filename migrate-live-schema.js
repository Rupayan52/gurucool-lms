const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('isLive')) {
  schema = schema.replace(/(model Lesson\s*{[^}]*)(})/g, '$1  isLive Boolean @default(false)\n  liveUrl String?\n$2');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('✅ Injected Live Streaming fields into Lesson schema');
}
