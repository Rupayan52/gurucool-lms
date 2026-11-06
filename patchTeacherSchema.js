const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('model User {') && !schema.includes('avatarUrl')) {
  schema = schema.replace(/model User \{([^}]*)\}/, 'model User {$1  avatarUrl      String?\n  bio            String?\n}');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Schema safely patched with avatarUrl and bio.");
} else {
  console.log("⚠️ Schema already contains avatarUrl or could not be patched.");
}
