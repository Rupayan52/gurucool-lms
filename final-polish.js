const fs = require('fs');

// 1. FIX THE TEACHER FORUM CRASH
const teacherForumPath = 'src/app/teacher/forum/page.tsx';
let teacherForum = fs.readFileSync(teacherForumPath, 'utf8');

// Remove the outdated flatMap hack and map the pure subjects directly
teacherForum = teacherForum.replace(
  /const allSubjects = data\.flatMap\(\(c: any\) => c\.subjects\);\s*setSubjects\(allSubjects\);\s*if \(allSubjects\.length > 0\) setActiveSubject\(allSubjects\[0\]\.id\);/,
  'setSubjects(data);\n      if (data.length > 0) setActiveSubject(data[0].id);'
);
fs.writeFileSync(teacherForumPath, teacherForum);
console.log('✅ Resolved Teacher Forum Array mapping crash');


// 2. INJECT COURSE HUBS INTO STUDENT SIDEBAR
const studentLayoutPath = 'src/app/dashboard/layout.tsx';
let studentLayout = fs.readFileSync(studentLayoutPath, 'utf8');

if (!studentLayout.includes('/dashboard/forum')) {
  const courseHubLink = `
          <Link href="/dashboard/forum" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <span>Course Hubs</span>
          </Link>
          `;
  
  // Safely inject it right above the Profile link
  studentLayout = studentLayout.replace(/(<Link[^>]*href="\/dashboard\/profile"[^>]*>)/, courseHubLink + '$1');
  fs.writeFileSync(studentLayoutPath, studentLayout);
  console.log('✅ Safely injected Course Hubs into Student Menu');
}
