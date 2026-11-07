const fs = require('fs');
const file = 'src/app/teacher/resolution-center/page.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  const badCode = "if (res.ok) setMessages(prev => [...prev, await res.json()]);";
  const goodCode = "if (res.ok) { const newMsg = await res.json(); setMessages(prev => [...prev, newMsg]); }";
  
  if (code.includes(badCode)) {
    code = code.replace(badCode, goodCode);
    fs.writeFileSync(file, code);
    console.log("✅ Fixed: Removed synchronous await from state updater.");
  } else {
    console.log("⚠️ Target code string not found. It may have already been fixed.");
  }
}
