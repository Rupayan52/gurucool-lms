const fs = require('fs');
const proxyPath = 'src/proxy.ts';
const middlewarePath = 'src/middleware.ts';

function patchFile(filePath, isRename) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace all instances of the 'middleware' function export with 'proxy'
  content = content.replace(/function middleware/g, 'function proxy');
  content = content.replace(/as middleware/g, 'as proxy');
  
  if (isRename) {
    fs.writeFileSync(proxyPath, content);
    fs.unlinkSync(filePath);
    console.log('✅ Renamed middleware.ts to proxy.ts and patched exports.');
  } else {
    fs.writeFileSync(filePath, content);
    console.log('✅ Patched proxy.ts exports.');
  }
}

if (fs.existsSync(proxyPath)) {
  patchFile(proxyPath, false);
} else if (fs.existsSync(middlewarePath)) {
  patchFile(middlewarePath, true);
} else {
  console.log('⚠️ Could not locate proxy.ts or middleware.ts in /src. If it is in the root, moving it...');
  if (fs.existsSync('middleware.ts')) patchFile('middleware.ts', true);
  if (fs.existsSync('proxy.ts')) patchFile('proxy.ts', false);
}
