/**
 * Bootstrap environment and require hooks before any module imports
 */

import fs from "fs";
import path from "path";

// 1. Suppress CSS/SCSS/LESS module requires in Node.js / tsx runtime
if (typeof require !== "undefined" && require.extensions) {
  const noop = (module: any) => {
    module.exports = {};
  };
  require.extensions[".css"] = noop;
  require.extensions[".scss"] = noop;
  require.extensions[".sass"] = noop;
  require.extensions[".less"] = noop;
}

// 2. Synchronous .env loading
try {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

if (typeof process !== "undefined" && typeof (process as any).loadEnvFile === "function") {
  try {
    (process as any).loadEnvFile(".env");
  } catch {}
}
