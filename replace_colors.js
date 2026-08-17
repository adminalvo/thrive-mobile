const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

function processFile(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace rgba(255, 255, 255, 0.x) and rgba(255,255,255,0.x)
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*/g, 'rgba(var(--glass-color), ');
    // Replace #fff for borders and backgrounds with a semantic variable if needed, but for now let's just do glass-color
    
    // Some inline #fff for color
    // We'll just define --white as #ffffff in dark and #000000 in light, so if they used color: "#fff", it won't adapt unless changed to var(--white).
    // Let's replace color: "#fff" with color: "var(--white)" in inline styles
    content = content.replace(/color:\s*["']#fff["']/g, 'color: "var(--white)"');
    content = content.replace(/color:\s*["']#ffffff["']/g, 'color: "var(--white)"');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

walkDir(path.join(__dirname, 'src'), processFile);
console.log("Done replacing styles.");
