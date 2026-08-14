const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.tsx']) {
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

console.log('Analyzing ' + files.length + ' TSX files for hardcoded strings...\n');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  console.log(`=== ${file} ===`);
  lines.forEach((line, idx) => {
    // check for JSX text or hardcoded toast / labels / placeholders / headings
    // Ignore imports, styles, comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('import ') || trimmed.startsWith('export type') || trimmed.startsWith('type ')) return;

    // Check for Azerbaijani characters or typical patterns
    const hasAze = /[əƏıIöÖüÜğĞçÇşŞ]/.test(line);
    const hasToast = /toast\.(error|success)\s*\(\s*["']/.test(line);
    const hasConfirm = /confirm\s*\(\s*["']/.test(line);
    const hasPlaceholder = /placeholder\s*=\s*["']/.test(line) && !line.includes('t(');
    const hasLabel = /<label>\s*[^<{]+<\/label>/.test(line) && !line.includes('t(') && !line.includes('c(');
    const hasOption = /<option[^>]*>\s*[^<{]+<\/option>/.test(line) && !line.includes('t(') && !line.includes('c(') && !line.includes('map(');
    const hasHeading = /<h[1-6][^>]*>\s*[^<{]+<\/h[1-6]>/.test(line) && !line.includes('t(') && !line.includes('c(');
    const hasButtonText = /<button[^>]*>\s*[^<{]+<\/button>/.test(line) && !line.includes('t(') && !line.includes('c(');
    const hasEmpty = /empty/i.test(line) && (line.includes('>') || line.includes('"') || line.includes("'"));

    if (hasAze || hasToast || hasConfirm || (hasPlaceholder && !line.includes('••••')) || hasLabel || hasOption || hasHeading || hasButtonText) {
      console.log(`  Line ${idx + 1}: ${trimmed}`);
    }
  });
  console.log('\n');
});
