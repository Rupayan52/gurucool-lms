const fs = require('fs');
const file = 'src/app/teacher/live-classes/page.tsx';

if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  
  const badLogic = `        if (subList.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(subList[0].id);
        }`;
        
  // We use a functional state update so it checks the LATEST state during the async poll,
  // preventing stale closures from resetting the dropdown.
  const goodLogic = `        if (subList.length > 0) {
          setSelectedSubjectId(prev => prev ? prev : subList[0].id);
        }`;
        
  if (code.includes(badLogic)) {
    code = code.replace(badLogic, goodLogic);
    fs.writeFileSync(file, code);
    console.log("✅ Fixed: Prevented background polling from resetting the Subject dropdown.");
  } else {
    console.log("⚠️ Could not find exact logic. It may have been updated.");
  }
}
