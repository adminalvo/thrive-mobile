/**
 * Milestone 2 Forensic Integrity Verification Harness
 * Independently tests all R2 tablet responsiveness contracts, CSS rules, AST structures, and layout behavior.
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

const PROJECT_ROOT = path.resolve(__dirname, "..");

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

function runTest(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log("\n============================================================");
console.log("  FORENSIC INTEGRITY HARNESS: MILESTONE 2 RESPONSIVE AUDIT");
console.log("============================================================\n");

// Group 1: Sidebar Drawer & Layout Responsiveness
console.log("Group 1: Sidebar Tablet Drawer (< 1024px)");

runTest("R2.1.1: DashboardLayout in layout.tsx has state and handlers for drawer", () => {
  const layoutPath = path.join(PROJECT_ROOT, "src/app/[locale]/dashboard/layout.tsx");
  assert(fs.existsSync(layoutPath), "layout.tsx not found");
  const content = fs.readFileSync(layoutPath, "utf-8");
  assert(content.includes("const [sidebarOpen, setSidebarOpen] = useState(false);"), "Missing sidebarOpen state");
  assert(content.includes("setSidebarOpen(true)"), "Missing menuBtn open handler");
  assert(content.includes("setSidebarOpen(false)"), "Missing closeBtn handler");
  assert(content.includes("styles.sidebarOpen"), "Missing sidebarOpen class toggle");
  assert(!content.includes("window.innerWidth < 1024"), "Found forbidden inline window.innerWidth SSR hack");
});

runTest("R2.1.2: layout.module.css defines clean @media (max-width: 1024px) drawer transition", () => {
  const cssPath = path.join(PROJECT_ROOT, "src/app/[locale]/dashboard/layout.module.css");
  assert(fs.existsSync(cssPath), "layout.module.css not found");
  const css = fs.readFileSync(cssPath, "utf-8");
  assert(css.includes("@media (max-width: 1024px)"), "Missing 1024px media query");
  assert(css.includes("transform: translateX(-100%)"), "Missing sidebar offscreen transform");
  assert(css.includes(".sidebarOpen"), "Missing .sidebarOpen class");
  assert(css.includes("transform: translateX(0)"), "Missing .sidebarOpen open transform");
  assert(css.includes(".overlay"), "Missing .overlay backdrop");
  assert(css.includes(".menuBtn"), "Missing .menuBtn display trigger");
});

// Group 2: Data Tables Horizontal Scroll
console.log("\nGroup 2: Data Tables min-width and overflow-x: auto");

const TABLE_CSS_MODULES = [
  { file: "src/app/[locale]/dashboard/students/page.module.css", container: ".tableContainer", minWidth: 700 },
  { file: "src/app/[locale]/dashboard/finance/page.module.css", container: ".tableContainer", minWidth: 750 },
  { file: "src/app/[locale]/dashboard/students/[id]/studentProfile.module.css", container: ".tableResponsive", minWidth: 600 },
  { file: "src/app/[locale]/dashboard/teachers/[id]/teacherProfile.module.css", container: ".tableResponsive", minWidth: 600 },
  { file: "src/app/[locale]/dashboard/groups/[id]/groupProfile.module.css", container: ".tableResponsive", minWidth: 600 },
  { file: "src/app/[locale]/dashboard/page.module.css", container: ".tableResponsive", minWidth: 600 },
  { file: "src/components/ContractModal.module.css", container: ".scrollArea", minWidth: 550 },
];

for (const t of TABLE_CSS_MODULES) {
  runTest(`R2.2: ${path.basename(t.file)} enforces table min-width and horizontal scroll`, () => {
    const fullPath = path.join(PROJECT_ROOT, t.file);
    assert(fs.existsSync(fullPath), `File not found: ${t.file}`);
    const css = fs.readFileSync(fullPath, "utf-8");
    assert(css.includes("overflow-x: auto") || css.includes("overflow-x:auto"), `Missing overflow-x: auto in ${t.file}`);
    assert(css.includes("-webkit-overflow-scrolling: touch") || css.includes("-webkit-overflow-scrolling:touch"), `Missing touch scrolling in ${t.file}`);
    assert(css.includes(`min-width: ${t.minWidth}px`) || css.includes(`min-width:${t.minWidth}px`), `Missing min-width: ${t.minWidth}px in ${t.file}`);
  });
}

// Group 3: Kanban Board Tablet Scaling
console.log("\nGroup 3: Kanban Board Tablet Scaling (Tasks & Leads)");

const KANBAN_MODULES = [
  "src/app/[locale]/dashboard/tasks/page.module.css",
  "src/app/[locale]/dashboard/leads/page.module.css",
];

for (const k of KANBAN_MODULES) {
  runTest(`R2.3: ${path.basename(k)} scales Kanban columns and gaps under 1024px`, () => {
    const fullPath = path.join(PROJECT_ROOT, k);
    assert(fs.existsSync(fullPath), `File not found: ${k}`);
    const css = fs.readFileSync(fullPath, "utf-8");
    assert(css.includes("@media (max-width: 1024px)"), `Missing 1024px media query in ${k}`);
    assert(css.includes("270px"), `Missing 270px column scale in ${k}`);
    assert(css.includes("gap: 1rem") || css.includes("gap:1rem"), `Missing 1rem gap scale in ${k}`);
  });
}

// Group 4: Modal Responsiveness
console.log("\nGroup 4: Modal 90% Width and Form Stacking");

const MODAL_MODULES = [
  "src/app/[locale]/dashboard/students/page.module.css",
  "src/app/[locale]/dashboard/finance/page.module.css",
  "src/app/[locale]/dashboard/tasks/page.module.css",
  "src/app/[locale]/dashboard/leads/page.module.css",
  "src/app/[locale]/dashboard/teachers/page.module.css",
  "src/app/[locale]/dashboard/schedule/page.module.css",
  "src/app/[locale]/dashboard/students/[id]/studentProfile.module.css",
  "src/app/[locale]/dashboard/teachers/[id]/teacherProfile.module.css",
  "src/app/[locale]/dashboard/groups/[id]/groupProfile.module.css",
  "src/components/ContractModal.module.css",
];

for (const m of MODAL_MODULES) {
  runTest(`R2.4: ${path.basename(m)} enforces modal 90% width and max-height constraints`, () => {
    const fullPath = path.join(PROJECT_ROOT, m);
    assert(fs.existsSync(fullPath), `File not found: ${m}`);
    const css = fs.readFileSync(fullPath, "utf-8");
    assert(css.includes("width: 90%") || css.includes("width:90%"), `Missing width: 90% in ${m}`);
    assert(css.includes("max-height: 90vh") || css.includes("max-height:90vh"), `Missing max-height: 90vh in ${m}`);
  });
}

// Summary
console.log("\n============================================================");
const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.filter((r) => !r.passed).length;
console.log(`Total tests: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
console.log("============================================================\n");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
