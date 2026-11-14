const fs = require('fs');
const file = 'src/app/dashboard/layout.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Remove the broken full-width top bar
  const brokenBarRegex = /<a href="\/dashboard\/profile" className="mt-3 block w-full text-center py-2\.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all">View & Edit Full Profile →<\/a>/g;
  code = code.replace(brokenBarRegex, '');

  // 2. Locate the exact spot inside the Dropdown menu (after the select element) and inject the button properly
  const selectElementClosing = `</select>
                </div>`;
                
  const properButtonInjection = `</select>
                </div>
                <div className="px-4 pb-4">
                  <a href="/dashboard/profile" className="block w-full text-center py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all">
                    View Full Profile
                  </a>
                </div>`;

  if (code.includes(selectElementClosing) && !code.includes('View Full Profile')) {
    code = code.replace(selectElementClosing, properButtonInjection);
    fs.writeFileSync(file, code);
    console.log("✅ Fixed: Moved Profile button inside the top-right account popover.");
  } else {
    console.log("⚠️ Could not find exact injection point or button already exists.");
  }
}
