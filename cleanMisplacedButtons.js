const fs = require('fs');

const teacherResFile = 'src/app/teacher/resolution-center/page.tsx';
if (fs.existsSync(teacherResFile)) {
  let code = fs.readFileSync(teacherResFile, 'utf8');
  code = code.replace(
    /<div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center<\/h1><a href="\/teacher\/curriculum"[^>]*>Curriculum & Grading Studio →<\/a><\/div>/g,
    '<h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>'
  );
  fs.writeFileSync(teacherResFile, code);
}

const studentForumFile = 'src/app/dashboard/forum/page.tsx';
if (fs.existsSync(studentForumFile)) {
  let code = fs.readFileSync(studentForumFile, 'utf8');
  code = code.replace(
    /<div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs<\/h1><a href="\/dashboard\/curriculum"[^>]*>Curriculum, Quizzes & Assignments →<\/a><\/div>/g,
    '<h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs</h1>'
  );
  fs.writeFileSync(studentForumFile, code);
}
console.log("✅ Removed curriculum buttons from Resolution Center and Course Hubs.");
