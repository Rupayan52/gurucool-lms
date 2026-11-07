const fs = require('fs');
const file = 'src/app/teacher/curriculum/page.tsx';
if (fs.existsSync(file)) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /<div className="flex items-center gap-3">\s*<Link href="\/teacher\/resolution-center"[\s\S]*?<\/Link>\s*<\/div>/,
    ''
  );
  fs.writeFileSync(file, code);
}
