const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('scheduledStartTime')) {
  schema = schema.replace(/(model Lesson\s*{[^}]*)(})/g, '$1  broadcastType String @default("URL") // URL, NATIVE_WEBRTC, or PRE_RECORDED_LIVE\n  scheduledStartTime DateTime?\n$2');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('✅ Upgraded Schema for Scheduled Pre-Recorded Live Streams');
}
