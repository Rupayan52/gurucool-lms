const fs = require('fs');
const filePath = 'src/app/dashboard/forum/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// A. Remove the mocked student email state
code = code.replace(/const \[studentEmail\] = useState\("xyz@gmail\.com"\);\n?/g, '');

// B. Remove studentEmail from the useEffect dependency array
code = code.replace(/}, \[studentEmail\]\);/g, '}, []);');

// C. Replace the POST fetch logic with a clean GET request
const oldFetch = `const res = await fetch("/api/student/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentEmail })
        });`;
const newFetch = `const res = await fetch("/api/student/courses");`;

if (code.includes(oldFetch)) {
  code = code.replace(oldFetch, newFetch);
  fs.writeFileSync(filePath, code);
  console.log("✅ Successfully patched Course Hubs frontend to use secure JWT GET requests.");
} else {
  console.log("⚠️ Could not find the exact fetch block. Verify forum/page.tsx manually if issues persist.");
}
