const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (schema.includes('model Subject') && !schema.includes('forumPosts ForumPost[]')) {
  schema = schema.replace(/(model Subject\s*{[^}]*)(})/g, '$1  forumPosts ForumPost[]\n$2');
  fs.writeFileSync('prisma/schema.prisma', schema);
  console.log('✅ Injected missing opposite relation into Subject model');
}
