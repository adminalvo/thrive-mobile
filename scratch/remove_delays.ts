import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app', function(filePath: string) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let replaced = false;
    
    // transition={{ delay: 0.5 }} -> transition={{ }} -> wait, empty transition={{}} is invalid if there are no other props.
    // Let's replace `transition={{ delay: ... }}` with nothing if it's the only prop.
    const regex1 = /transition=\{\{\s*delay:\s*[^}]+\}\}/g;
    if (regex1.test(content)) {
      content = content.replace(regex1, '');
      replaced = true;
    }
    
    // transition={{ duration: 1, delay: 0.2 }} -> transition={{ duration: 1 }}
    const regex2 = /,\s*delay:\s*[\d\.\w\*\s]+/g;
    if (regex2.test(content)) {
      content = content.replace(regex2, '');
      replaced = true;
    }
  
    const regex3 = /delay:\s*[\d\.\w\*\s]+,\s*/g;
    if (regex3.test(content)) {
      content = content.replace(regex3, '');
      replaced = true;
    }
    
    if (replaced) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Removed delay from ' + filePath);
    }
  }
});
