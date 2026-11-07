const fs = require('fs');

const files = [
  { path: 'src/app/api/student/register/route.ts', token: 'token_student' },
  { path: 'src/app/api/student/courses/route.ts', token: 'token_student' },
  { path: 'src/app/api/student/catalog/route.ts', token: 'token_student' },
  { path: 'src/app/api/teacher/profile/route.ts', token: 'token_teacher' },
  { path: 'src/app/api/teacher/subjects/register/route.ts', token: 'token_teacher' }
];

files.forEach(({ path: file, token }) => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    // Swap the legacy auth_token for the precise namespaced token
    code = code.replace(/get\(['"]auth_token['"]\)/g, `get("${token}")`);
    fs.writeFileSync(file, code);
  }
});
console.log("✅ All APIs successfully patched for Enterprise Multi-Session Support.");
