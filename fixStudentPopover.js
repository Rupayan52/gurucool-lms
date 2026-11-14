const fs = require('fs');
const file = 'src/app/dashboard/layout.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Completely strip out the giant rogue purple bar at the top of the screen
  const rogueBarRegex = /<a[^>]*href="\/dashboard\/profile"[^>]*>.*?View (?:& Edit )?Full Profile.*?<\/a>/gs;
  code = code.replace(rogueBarRegex, '');

  // 2. Locate the precise account popover by targeting the user's email binding
  const emailRegex = /(<[^>]+>\s*\{[a-zA-Z0-9_?.]*email\}\s*<\/[^>]+>)/;
  
  if (code.match(emailRegex)) {
     const profileButton = `
                  <div className="pt-4 mt-3 border-t border-slate-700/50 w-full">
                    <a href="/dashboard/profile" className="block w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all">
                      View & Edit Full Profile
                    </a>
                  </div>`;
     // Inject the button right below the email address
     code = code.replace(emailRegex, (match) => `${match}${profileButton}`);
     fs.writeFileSync(file, code);
     console.log("✅ Fixed: Removed rogue top bar and securely embedded the profile button inside the account popover.");
  } else {
     // Fallback: If email binding isn't found, anchor it to the Sign Out button
     const signOutRegex = /(<button[^>]*>[\s\S]*?Sign out[\s\S]*?<\/button>)/i;
     if (code.match(signOutRegex)) {
         const profileButton = `\n<a href="/dashboard/profile" className="block w-full text-center py-2 px-4 mt-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all">\n  View & Edit Full Profile\n</a>\n`;
         code = code.replace(signOutRegex, (match) => `${match}${profileButton}`);
         fs.writeFileSync(file, code);
         console.log("✅ Fixed: Anchored profile button near the Sign Out button.");
     } else {
         console.log("⚠️ Could not find the exact popover anchors. Please check layout.tsx structure.");
     }
  }
}
