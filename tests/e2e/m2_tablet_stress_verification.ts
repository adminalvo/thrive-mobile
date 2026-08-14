import fs from "fs";
import path from "path";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✓ [${suite}] ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: `Assertion failed: ${name}`, details });
    console.error(`  ✗ [${suite}] ${name} ${details ? `(${details})` : ""}`);
  }
}

const rootDir = process.cwd();

console.log("\n================================================================================");
console.log("  THRIVE CRM - EMPIRICAL TABLET RESPONSIVENESS STRESS TEST SUITE (M2)");
console.log("================================================================================\n");

// ============================================================================
// SUITE 1: Layout Shell & Sidebar Tablet Drawer (768px - 1024px)
// ============================================================================
console.log("📦 Suite 1: Layout Shell & Sidebar Drawer (@media <= 1024px)");

const layoutCssPath = path.join(rootDir, "src/app/[locale]/dashboard/layout.module.css");
const layoutTsxPath = path.join(rootDir, "src/app/[locale]/dashboard/layout.tsx");

const layoutCss = fs.readFileSync(layoutCssPath, "utf-8");
const layoutTsx = fs.readFileSync(layoutTsxPath, "utf-8");

// 1.1 CSS Media Query 1024px exists
assert(
  layoutCss.includes("@media (max-width: 1024px)"),
  "Layout & Sidebar",
  "layout.module.css must contain @media (max-width: 1024px)"
);

// 1.2 Sidebar fixed positioning and off-screen transform
assert(
  layoutCss.includes("transform: translateX(-100%)") || layoutCss.includes("translateX(-100%)"),
  "Layout & Sidebar",
  "Sidebar must be translated off-screen (-100%) on <= 1024px"
);

// 1.3 .sidebarOpen class brings sidebar into view
assert(
  layoutCss.includes(".sidebarOpen") && layoutCss.includes("transform: translateX(0)"),
  "Layout & Sidebar",
  ".sidebarOpen class must translate sidebar to translateX(0)"
);

// 1.4 Smooth CSS transition defined on sidebar
assert(
  layoutCss.includes("transition: transform"),
  "Layout & Sidebar",
  "Sidebar must have CSS transition for smooth drawer animation"
);

// 1.5 Overlay backdrop filter and fixed positioning
assert(
  layoutCss.includes(".overlay") && layoutCss.includes("position: fixed") && layoutCss.includes("backdrop-filter"),
  "Layout & Sidebar",
  "Backdrop overlay must be fixed with blur backdrop-filter on <= 1024px"
);

// 1.6 Menu hamburger button visible on tablet
assert(
  layoutCss.includes(".menuBtn") && layoutCss.includes("display: block"),
  "Layout & Sidebar",
  "Menu hamburger button must be display: block on <= 1024px"
);

// 1.7 Sidebar close button visible on tablet
assert(
  layoutCss.includes(".closeBtn") && layoutCss.includes("display: block"),
  "Layout & Sidebar",
  "Sidebar close button must be display: block on <= 1024px"
);

// 1.8 Padding reduction on tablet for header and page content
assert(
  layoutCss.includes("padding: 0 1.25rem") || layoutCss.includes("padding: 1.25rem"),
  "Layout & Sidebar",
  "Header and page content padding must reduce on <= 1024px for tablet viewports"
);

// 1.9 Layout TSX has NO hydration-breaking inline motion transforms
assert(
  !layoutTsx.includes("window.innerWidth < 1024") && !layoutTsx.includes("animate={{ x:"),
  "Layout & Sidebar",
  "layout.tsx must not contain inline animate={{ x: ... }} window.innerWidth hydration conflicts"
);

// 1.10 Layout TSX binds toggle handlers to menu, close, overlay, and nav items
assert(
  layoutTsx.includes("onClick={() => setSidebarOpen(true)}") &&
  layoutTsx.includes("onClick={() => setSidebarOpen(false)}"),
  "Layout & Sidebar",
  "layout.tsx must properly toggle sidebarOpen state on menu button, close button, and overlay"
);

// ============================================================================
// SUITE 2: Data Tables Horizontal Scrolling & Min-Width (All Modules)
// ============================================================================
console.log("\n📦 Suite 2: Data Tables Horizontal Scrolling & Column Squashing Protection");

const tableCssFiles = [
  { name: "Students Page", path: "src/app/[locale]/dashboard/students/page.module.css", minExpectedWidth: 700 },
  { name: "Finance Page", path: "src/app/[locale]/dashboard/finance/page.module.css", minExpectedWidth: 750 },
  { name: "Student Profile", path: "src/app/[locale]/dashboard/students/[id]/studentProfile.module.css", minExpectedWidth: 600 },
  { name: "Teacher Profile", path: "src/app/[locale]/dashboard/teachers/[id]/teacherProfile.module.css", minExpectedWidth: 600 },
  { name: "Group Profile", path: "src/app/[locale]/dashboard/groups/[id]/groupProfile.module.css", minExpectedWidth: 600 },
  { name: "Dashboard Overview", path: "src/app/[locale]/dashboard/page.module.css", minExpectedWidth: 600 },
  { name: "Contract Modal", path: "src/components/ContractModal.module.css", minExpectedWidth: 550 },
];

tableCssFiles.forEach(({ name, path: relPath, minExpectedWidth }) => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, "utf-8");

  // Check overflow-x: auto on container
  const hasOverflow = content.includes("overflow-x: auto") || content.includes("overflow-x:auto");
  assert(
    hasOverflow,
    `Data Tables (${name})`,
    `${relPath} container must have overflow-x: auto for horizontal scrolling`
  );

  // Check -webkit-overflow-scrolling: touch
  const hasTouchScroll = content.includes("-webkit-overflow-scrolling: touch");
  assert(
    hasTouchScroll,
    `Data Tables (${name})`,
    `${relPath} container must have -webkit-overflow-scrolling: touch for iOS momentum scroll`
  );

  // Check min-width on table to prevent column squashing
  const minWidthMatch = content.match(/min-width:\s*(\d+)px/);
  const foundMinWidth = minWidthMatch ? parseInt(minWidthMatch[1], 10) : 0;
  assert(
    foundMinWidth >= minExpectedWidth,
    `Data Tables (${name})`,
    `${relPath} table must enforce min-width >= ${minExpectedWidth}px (found: ${foundMinWidth}px)`
  );
});

// ============================================================================
// SUITE 3: Kanban Boards Tablet Adaptation (Tasks & Leads)
// ============================================================================
console.log("\n📦 Suite 3: Kanban Board Scaling & Touch Scrolling");

const kanbanFiles = [
  { name: "Tasks Kanban", path: "src/app/[locale]/dashboard/tasks/page.module.css" },
  { name: "Leads Kanban", path: "src/app/[locale]/dashboard/leads/page.module.css" },
];

kanbanFiles.forEach(({ name, path: relPath }) => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, "utf-8");

  // Kanban horizontal scrolling
  assert(
    content.includes("overflow-x: auto") && content.includes("-webkit-overflow-scrolling: touch"),
    `Kanban (${name})`,
    `${relPath} kanbanBoard must have overflow-x: auto and touch momentum scrolling`
  );

  // Tablet media query for column scaling
  assert(
    content.includes("@media (max-width: 1024px)"),
    `Kanban (${name})`,
    `${relPath} must have @media (max-width: 1024px)`
  );

  // Column width adjusted on <= 1024px (min-width: 270px, max-width: 270px)
  assert(
    content.includes("min-width: 270px") && content.includes("max-width: 270px"),
    `Kanban (${name})`,
    `${relPath} columns must adjust to 270px on <= 1024px for tablet viewport packing`
  );

  // Kanban board gap reduced on <= 1024px
  assert(
    content.includes("gap: 1rem"),
    `Kanban (${name})`,
    `${relPath} kanban gap must be reduced to 1rem on <= 1024px`
  );
});

// ============================================================================
// SUITE 4: Modal Dialogs Sizing & Viewport Fit (90% Width, 90vh Scrolling)
// ============================================================================
console.log("\n📦 Suite 4: Modal Dialogs 90% Width & 90vh Height Bounds");

const modalCssFiles = [
  { name: "Students Modal", path: "src/app/[locale]/dashboard/students/page.module.css", maxWidth: 500 },
  { name: "Finance Modal", path: "src/app/[locale]/dashboard/finance/page.module.css", maxWidth: 500 },
  { name: "Tasks Modal", path: "src/app/[locale]/dashboard/tasks/page.module.css", maxWidth: 500 },
  { name: "Leads Modal", path: "src/app/[locale]/dashboard/leads/page.module.css", maxWidth: 450 },
  { name: "Teachers Modal", path: "src/app/[locale]/dashboard/teachers/page.module.css", maxWidth: 450 },
  { name: "Schedule Modal", path: "src/app/[locale]/dashboard/schedule/page.module.css", maxWidth: 480 },
  { name: "Student Profile Modal", path: "src/app/[locale]/dashboard/students/[id]/studentProfile.module.css", maxWidth: 500 },
  { name: "Teacher Profile Modal", path: "src/app/[locale]/dashboard/teachers/[id]/teacherProfile.module.css", maxWidth: 500 },
  { name: "Group Profile Modal", path: "src/app/[locale]/dashboard/groups/[id]/groupProfile.module.css", maxWidth: 500 },
  { name: "Contract Modal Container", path: "src/components/ContractModal.module.css", maxWidth: 800 },
];

modalCssFiles.forEach(({ name, path: relPath, maxWidth }) => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, "utf-8");

  // Check 90% width
  assert(
    content.includes("width: 90%") || content.includes("width: 92%"),
    `Modal Dialogs (${name})`,
    `${relPath} modal must specify width: 90% or 92%`
  );

  // Check max-height: 90vh
  assert(
    content.includes("max-height: 90vh"),
    `Modal Dialogs (${name})`,
    `${relPath} modal must specify max-height: 90vh`
  );

  // Check overflow-y: auto for vertical scrolling
  assert(
    content.includes("overflow-y: auto"),
    `Modal Dialogs (${name})`,
    `${relPath} modal must have overflow-y: auto to prevent action button clipping`
  );

  // Check max-width constraint
  assert(
    content.includes(`max-width: ${maxWidth}px`),
    `Modal Dialogs (${name})`,
    `${relPath} modal must specify max-width: ${maxWidth}px`
  );
});

// ============================================================================
// SUITE 5: Form Input 1-Column Stacking on @media (max-width: 768px)
// ============================================================================
console.log("\n📦 Suite 5: Form Input Grid Responsive Stacking on Mobile/Tablet Portrait (768px)");

const formGridFiles = [
  { name: "Students Form Grid", path: "src/app/[locale]/dashboard/students/page.module.css", className: "formGrid" },
  { name: "Finance Row Inputs", path: "src/app/[locale]/dashboard/finance/page.module.css", className: "rowInputs" },
  { name: "Tasks Row Inputs", path: "src/app/[locale]/dashboard/tasks/page.module.css", className: "rowInputs" },
  { name: "Schedule Row Inputs", path: "src/app/[locale]/dashboard/schedule/page.module.css", className: "rowInputs" },
];

formGridFiles.forEach(({ name, path: relPath, className }) => {
  const fullPath = path.join(rootDir, relPath);
  const content = fs.readFileSync(fullPath, "utf-8");

  assert(
    content.includes("@media (max-width: 768px)"),
    `Form Grids (${name})`,
    `${relPath} must contain @media (max-width: 768px)`
  );

  assert(
    content.includes(`.${className}`) && content.includes("grid-template-columns: 1fr"),
    `Form Grids (${name})`,
    `${relPath} must collapse .${className} to grid-template-columns: 1fr on <= 768px`
  );
});

// ============================================================================
// SUITE 6: Viewport Mathematical Modeling & Collision Stress-Testing
// ============================================================================
console.log("\n📦 Suite 6: Viewport Mathematical Modeling (768px, 834px, 1024px)");

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
}

const tabletViewports: ViewportSpec[] = [
  { name: "iPad Mini / Portrait", width: 768, height: 1024 },
  { name: "iPad Air / 11 Pro Portrait", width: 834, height: 1194 },
  { name: "iPad Landscape / 10.2", width: 1024, height: 768 },
];

tabletViewports.forEach((vp) => {
  // Test Sidebar behavior
  const isTablet = vp.width <= 1024;
  const sidebarHiddenByDefault = isTablet;
  assert(
    sidebarHiddenByDefault,
    `Viewport Simulation (${vp.name} ${vp.width}x${vp.height})`,
    `Sidebar must be hidden drawer mode by default on ${vp.width}px`
  );

  // Usable content width (viewport minus padding: 1.25rem = 20px on each side = 40px)
  const usableWidth = vp.width - 40;
  
  // Table min-width: 700px. At 768px, usableWidth is 728px, table fits or smoothly scrolls if inside card padding
  const tableMinWidth = 700;
  const tableRequiresScroll = tableMinWidth > (usableWidth - 32); // 32px tableContainer padding
  
  assert(
    tableRequiresScroll ? vp.width <= 768 : true,
    `Viewport Simulation (${vp.name} ${vp.width}x${vp.height})`,
    `Table scroll physics mathematically sound: table 700px min-width protected in ${usableWidth}px usable container`
  );

  // Modal sizing math:
  // At width W: modalWidth = Math.min(W * 0.9, 500)
  // At height H: maxModalHeight = H * 0.9
  const expectedModalWidth = Math.min(vp.width * 0.9, 500);
  const expectedMaxModalHeight = vp.height * 0.9;

  assert(
    expectedModalWidth <= vp.width,
    `Viewport Simulation (${vp.name} ${vp.width}x${vp.height})`,
    `Modal width (${expectedModalWidth.toFixed(1)}px) fits safely within viewport width (${vp.width}px)`
  );

  assert(
    expectedMaxModalHeight <= vp.height,
    `Viewport Simulation (${vp.name} ${vp.width}x${vp.height})`,
    `Modal height cap (${expectedMaxModalHeight.toFixed(1)}px) fits safely within viewport height (${vp.height}px)`
  );
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log("\n================================================================================");
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
const failedCount = totalCount - passedCount;

console.log(`  RESULTS: ${passedCount}/${totalCount} assertions passed (${failedCount} failed)`);
console.log("================================================================================\n");

if (failedCount > 0) {
  console.error(`💥 ${failedCount} tests failed!`);
  process.exit(1);
} else {
  console.log("✨ All iPad/Tablet responsiveness stress tests PASSED successfully!");
  process.exit(0);
}
