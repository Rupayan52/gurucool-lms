const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('model DirectThread {') && !schema.includes('terminationReason')) {
  schema = schema.replace(
    /model DirectThread \{([^}]*)\}/, 
    `model DirectThread {$1  terminationReason String?\n  terminatedById    String?\n  recordingUrl      String?\n  isClosed          Boolean  @default(false)\n}`
  );
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Schema upgraded: DirectThread now supports termination tracking and recordings.");
}
