const fs = require('fs');
const file = 'src/app/dashboard/forum/page.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  const badCode = "if (res.ok) setMessages(prev => [...prev, await res.json()]);";
  const goodCode = "if (res.ok) { const newMsg = await res.json(); setMessages(prev => [...prev, newMsg]); }";
  
  if (code.includes(badCode)) {
    code = code.replace(badCode, goodCode);
    fs.writeFileSync(file, code);
    console.log("✅ Fixed: Removed synchronous await from Student state updater.");
  } else {
    console.log("⚠️ Target code string not found in student forum page.");
  }
}
