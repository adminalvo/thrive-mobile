import fs from "fs";
import path from "path";

function processDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === "route.ts") {
      let content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("export const dynamic =")) {
        content = `export const dynamic = "force-dynamic";\n` + content;
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(path.join(process.cwd(), "src/app/api"));
console.log("Added force-dynamic to all route.ts files");
