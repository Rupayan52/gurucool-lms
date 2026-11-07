const fs = require('fs');

// A. Enhance Student Layout (src/app/dashboard/layout.tsx) so the top-right popover and sidebar open /dashboard/profile
const studentLayoutFile = 'src/app/dashboard/layout.tsx';
if (fs.existsSync(studentLayoutFile)) {
  let code = fs.readFileSync(studentLayoutFile, 'utf8');

  // 1. Add "My Profile & Dossier" link under Quick views / Sidebar if not present
  if (!code.includes('/dashboard/profile')) {
    if (code.includes('Course Catalog')) {
      code = code.replace(
        /Course Catalog<\/a>|Course Catalog<\/Link>/,
        (match) => `${match}\n<a href="/dashboard/profile" className="block px-3 py-2 rounded-lg text-xs font-bold text-emerald-400 hover:bg-white/5 transition-all">My Profile & Dossier</a>`
      );
    }

    // 2. Inject a "Manage Full Student Profile →" button directly inside the top-right GuruCool popover (below Available)
    if (code.includes('Available')) {
      code = code.replace(
        /Available[\s\S]*?<\/div>/,
        (match) => `${match}\n<a href="/dashboard/profile" className="mt-3 block w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all">View & Edit Full Profile →</a>`
      );
    }

    fs.writeFileSync(studentLayoutFile, code);
    console.log("✅ Wired top-right student popover and sidebar to /dashboard/profile.");
  }
}

// B. Enrich Teacher Profile API (src/app/api/teacher/profile/route.ts) so teachers see student extended profile details in Manage Roster
const teacherProfileApi = 'src/app/api/teacher/profile/route.ts';
if (fs.existsSync(teacherProfileApi)) {
  let apiCode = fs.readFileSync(teacherProfileApi, 'utf8');
  if (!apiCode.includes('studentProfile.findMany')) {
    apiCode = apiCode.replace(
      'const assignments = await prisma.academicAssignment.findMany({',
      `const studentProfiles = await prisma.studentProfile.findMany();\n    const profileMap = Object.fromEntries(studentProfiles.map((sp: any) => [sp.userId, sp]));\n    const assignments = await prisma.academicAssignment.findMany({`
    );
    apiCode = apiCode.replace(
      'metrics: {',
      `extendedProfile: profileMap[stId] || null,\n              metrics: {`
    );
    fs.writeFileSync(teacherProfileApi, apiCode);
    console.log("✅ Synced StudentProfile data into Teacher Roster API.");
  }
}

// C. Display Student Extended Dossier inside Teacher's Manage Roster Modal (src/app/teacher/profile/page.tsx)
const teacherProfilePage = 'src/app/teacher/profile/page.tsx';
if (fs.existsSync(teacherProfilePage)) {
  let pageCode = fs.readFileSync(teacherProfilePage, 'utf8');
  if (!pageCode.includes('activeStudent.extendedProfile')) {
    const targetGrid = `<div className="grid grid-cols-3 gap-4">`;
    const dossierAddition = `<div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Institution</p>
                  <p className="text-xs font-bold text-slate-800">{activeStudent.extendedProfile?.institution || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Target Track</p>
                  <p className="text-xs font-bold text-slate-800">{activeStudent.extendedProfile?.targetExam || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Learning Style</p>
                  <p className="text-xs font-bold text-slate-800">{activeStudent.extendedProfile?.learningStyle || "Standard"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Student Phone</p>
                  <p className="text-xs font-bold text-slate-800">{activeStudent.extendedProfile?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Guardian Contact</p>
                  <p className="text-xs font-bold text-slate-800">{activeStudent.extendedProfile?.guardianName ? activeStudent.extendedProfile.guardianName + " (" + (activeStudent.extendedProfile.guardianPhone || "") + ")" : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400">Study Goal</p>
                  <p className="text-xs font-bold text-pink-600">{activeStudent.extendedProfile?.dailyStudyGoalHrs || 4} hrs/day</p>
                </div>
              </div>\n              ` + targetGrid;
    pageCode = pageCode.replace(targetGrid, dossierAddition);
    fs.writeFileSync(teacherProfilePage, pageCode);
    console.log("✅ Added Student Dossier overview to Teacher Manage Roster modal.");
  }
}
