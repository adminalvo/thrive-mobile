const fs = require('fs');
const path = require('path');

const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'));

function getNested(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const p of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = current[p];
  }
  return current;
}

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(full, exts));
    } else if (exts.includes(path.extname(full))) {
      results.push(full);
    }
  });
  return results;
}

const files = getAllFiles('./src');
console.log('Found ' + files.length + ' files');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hookRegex = /const\s+(\w+)\s*=\s*useTranslations\(\s*['"]?([^'"]*)['"]?\s*\)/g;
  let match;
  const scopes = {};
  while ((match = hookRegex.exec(content)) !== null) {
    scopes[match[1]] = match[2] || '';
  }

  const tCallRegex = /(\b[a-zA-Z0-9_]+)\(\s*['"]([^'"]+)['"]/g;
  let tMatch;
  while ((tMatch = tCallRegex.exec(content)) !== null) {
    const varName = tMatch[1];
    const key = tMatch[2];
    if (scopes[varName] !== undefined) {
      const fullPath = scopes[varName] ? scopes[varName] + '.' + key : key;
      const val = getNested(en, fullPath);
      if (val === undefined) {
        console.log(`[MISSING KEY] ${file} -> ${varName}('${key}') [Scope: '${scopes[varName]}', Full: '${fullPath}']`);
      }
    }
  }
});
