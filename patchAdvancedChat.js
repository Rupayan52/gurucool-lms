const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add file support and cohort partitioning to Message
if (schema.includes('model Message {') && !schema.includes('fileUrl')) {
  schema = schema.replace(
    /model Message \{([^}]*)\}/, 
    `model Message {$1  fileUrl      String?\n  fileName     String?\n  fileType     String?\n  isFlagged    Boolean @default(false)\n  hubTeacherId String? // Partitions Subject Hubs by Teacher\n}`
  );
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log("✅ Schema upgraded: File attachments, Content Flags, and Cohort Partitioning added.");
} else {
  console.log("⚠️ Schema already contains file payload architecture.");
}
