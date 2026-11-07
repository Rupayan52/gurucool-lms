const fs = require('fs');

// A. Patch Teacher Sidebar Layout (src/app/teacher/layout.tsx)
const teacherLayout = 'src/app/teacher/layout.tsx';
if (fs.existsSync(teacherLayout)) {
  let code = fs.readFileSync(teacherLayout, 'utf8');
  if (!code.includes('/teacher/curriculum')) {
    code = code.replace(
      /href="\/teacher\/profile"/,
      `href="/teacher/curriculum" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all"><span>📚</span> Curriculum & Tests</a><a href="/teacher/doubts" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all"><span>💡</span> Doubt Clearing Hub</a><a href="/teacher/profile"`
    );
    fs.writeFileSync(teacherLayout, code);
    console.log("✅ Added Curriculum & Tests and Doubt Clearing Hub to Teacher Sidebar.");
  }
}

// B. Patch Student Sidebar Layout (src/app/dashboard/layout.tsx)
const studentLayout = 'src/app/dashboard/layout.tsx';
if (fs.existsSync(studentLayout)) {
  let code = fs.readFileSync(studentLayout, 'utf8');
  if (!code.includes('/dashboard/curriculum')) {
    code = code.replace(
      /Course Catalog<\/a>|Course Catalog<\/Link>/,
      (match) => `${match}\n<a href="/dashboard/curriculum" className="block px-3 py-2 rounded-lg text-xs font-bold text-indigo-400 hover:bg-white/5 transition-all">Curriculum & Tests</a>`
    );
    fs.writeFileSync(studentLayout, code);
    console.log("✅ Added Curriculum & Tests to Student Sidebar.");
  }
}
