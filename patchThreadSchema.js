const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('model DirectThread {') && !schema.includes('reason')) {
  schema = schema.replace(
    /model DirectThread \{([^}]*)\}/, 
    `model DirectThread {$1  reason       String? // Student justification\n  approvedDate DateTime? // Scheduled meet time\n}`
  );
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Schema upgraded: DirectThread now supports reasons and scheduling.");
} else {
  console.log("⚠️ Schema already contains scheduling payload architecture.");
}
