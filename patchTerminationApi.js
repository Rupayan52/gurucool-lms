const fs = require('fs');
const file = 'src/app/api/threads/route.ts';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  const targetLogic = `isClosed: true, 
          terminationReason: reason,
          terminatedById: auth.userId`;
          
  const replacementLogic = `isClosed: true, 
          terminationReason: reason,
          terminatedById: auth.userId,
          recordingUrl: "https://meet.ffmuc.net/recordings/GuruCool_" + threadId + ".mp4"`;
  
  if (code.includes(targetLogic)) {
    code = code.replace(targetLogic, replacementLogic);
    fs.writeFileSync(file, code);
    console.log("✅ Patched API: Termination now provisions a session recording URL.");
  }
}
