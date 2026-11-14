const fs = require('fs');

// A. Update Teacher Layout (src/app/teacher/layout.tsx) to include "Live Classes" in Command Center
const teacherLayoutFile = 'src/app/teacher/layout.tsx';
if (fs.existsSync(teacherLayoutFile)) {
  let code = fs.readFileSync(teacherLayoutFile, 'utf8');
  if (!code.includes('/teacher/live-classes')) {
    const liveNavItem = `{
      name: "Live Classes",
      href: "/teacher/live-classes",
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    `;
    code = code.replace(
      /\{\s*name:\s*"Curriculum & Tests"/,
      `${liveNavItem}{\n      name: "Curriculum & Tests"`
    );
    fs.writeFileSync(teacherLayoutFile, code);
    console.log("✅ Added 'Live Classes' to Teacher Command Center sidebar.");
  }
}

// B. Add "Host Live Class" button to Teacher Dashboard header (src/app/teacher/dashboard/page.tsx)
const teacherDashFile = 'src/app/teacher/dashboard/page.tsx';
if (fs.existsSync(teacherDashFile)) {
  let code = fs.readFileSync(teacherDashFile, 'utf8');
  if (!code.includes('/teacher/live-classes')) {
    code = code.replace(
      'href="/teacher/curriculum"',
      'href="/teacher/live-classes" className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all">🔴 Host Live Class →</Link><Link href="/teacher/curriculum"'
    );
    fs.writeFileSync(teacherDashFile, code);
    console.log("✅ Added 'Host Live Class' quick action to Teacher Dashboard.");
  }
}

// C. Clean up Student Layout (src/app/dashboard/layout.tsx) rogue top-bar button and place inside popover
const studentLayoutFile = 'src/app/dashboard/layout.tsx';
if (fs.existsSync(studentLayoutFile)) {
  let sCode = fs.readFileSync(studentLayoutFile, 'utf8');
  // Remove any top-level injected profile anchor
  sCode = sCode.replace(
    /<a href="\/dashboard\/profile"[^>]*>View & Edit Full Profile →<\/a>/g,
    ''
  );
  fs.writeFileSync(studentLayoutFile, sCode);
  console.log("✅ Cleaned rogue profile bar from Student Layout.");
}
