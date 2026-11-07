const fs = require('fs');

// A. Add "Curriculum & Grading Studio" button to Teacher Resolution Center header
const teacherResFile = 'src/app/teacher/resolution-center/page.tsx';
if (fs.existsSync(teacherResFile)) {
  let code = fs.readFileSync(teacherResFile, 'utf8');
  if (!code.includes('/teacher/curriculum')) {
    code = code.replace(
      '<h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1>',
      `<div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolution Center</h1><a href="/teacher/curriculum" className="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs rounded-full shadow-md hover:opacity-95 transition-all">Curriculum & Grading Studio →</a></div>`
    );
    fs.writeFileSync(teacherResFile, code);
  }
}

// B. Add "Curriculum & Grading Studio" button & Real Student Metrics to Teacher Profile
const teacherProfFile = 'src/app/teacher/profile/page.tsx';
if (fs.existsSync(teacherProfFile)) {
  let code = fs.readFileSync(teacherProfFile, 'utf8');
  if (!code.includes('/teacher/curriculum')) {
    code = code.replace(
      '<h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1>',
      `<div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Dashboard</h1><a href="/teacher/curriculum" className="px-6 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-bold text-xs rounded-full shadow-md hover:opacity-95 transition-all">Open Curriculum & Grading Studio →</a></div>`
    );
  }

  // Replace static 96%, 4/5, 2 demo numbers in the Student Academic Overview modal with live database metrics
  const demoMetricsBlock = `<div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance</p>
                  <p className="text-2xl font-black text-emerald-500">96%</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assessments</p>
                  <p className="text-2xl font-black text-blue-500">4/5</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Doubt Tickets</p>
                  <p className="text-2xl font-black text-orange-500">2</p>
                </div>
              </div>`;

  const realMetricsBlock = `<div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Average</p>
                  <p className="text-2xl font-black text-emerald-500">{activeStudent.metrics?.quizAvg !== null && activeStudent.metrics?.quizAvg !== undefined ? activeStudent.metrics.quizAvg + "%" : "N/A"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.quizzesTaken || 0}/{activeStudent.metrics?.totalQuizzes || 0} Taken</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignments</p>
                  <p className="text-2xl font-black text-blue-500">{activeStudent.metrics?.submittedCount || 0}/{activeStudent.metrics?.totalAssignments || 0}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{activeStudent.metrics?.gradedCount || 0} Graded</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignment Score</p>
                  <p className="text-2xl font-black text-orange-500">{activeStudent.metrics?.assignmentAvg !== null && activeStudent.metrics?.assignmentAvg !== undefined ? activeStudent.metrics.assignmentAvg + "%" : "N/A"}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Verified Grade</p>
                </div>
              </div>`;

  if (code.includes(demoMetricsBlock)) {
    code = code.replace(demoMetricsBlock, realMetricsBlock);
  }
  fs.writeFileSync(teacherProfFile, code);
}

// C. Add "Curriculum, Quizzes & Assignments" button to Student Course Hubs header
const studentForumFile = 'src/app/dashboard/forum/page.tsx';
if (fs.existsSync(studentForumFile)) {
  let code = fs.readFileSync(studentForumFile, 'utf8');
  if (!code.includes('/dashboard/curriculum')) {
    code = code.replace(
      '<h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs</h1>',
      `<div className="flex items-center justify-between w-full"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Course Hubs</h1><a href="/dashboard/curriculum" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all">Curriculum, Quizzes & Assignments →</a></div>`
    );
    fs.writeFileSync(studentForumFile, code);
  }
}

console.log("✅ Navigation links and real-time student roster metrics wired.");
