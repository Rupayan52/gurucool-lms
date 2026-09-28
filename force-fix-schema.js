const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('model Subject {') && !schema.includes('forumPosts ForumPost[]')) {
  // Inject exactly after the opening bracket to avoid regex failures
  schema = schema.replace('model Subject {', 'model Subject {\n  forumPosts ForumPost[]');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('✅ Force-injected forumPosts relation into Subject model');
}
