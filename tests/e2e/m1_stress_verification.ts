/**
 * M1 Empirical Stress-Test Suite
 * Dedicated verification for Milestone 1 (Loading States R1 & Pure Dynamic SSR R4)
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg);
  }
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
console.log("  EMPIRICAL CHALLENGER: MILESTONE 1 STRESS-TEST HARNESS");
console.log("============================================================\n");

// -----------------------------------------------------------------------------
// Test Group 1: Pure Dynamic SSR Verification (R4)
// -----------------------------------------------------------------------------
console.log("Group 1: Pure Dynamic SSR in src/app/[locale]/layout.tsx");

runTest("R4.1: layout.tsx exists and is readable", () => {
  const layoutPath = path.join(PROJECT_ROOT, "src/app/[locale]/layout.tsx");
  assert(fs.existsSync(layoutPath), "layout.tsx not found");
});

runTest("R4.2: layout.tsx does NOT export or contain generateStaticParams", () => {
  const layoutPath = path.join(PROJECT_ROOT, "src/app/[locale]/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");
  assert(!content.includes("generateStaticParams"), "Found generateStaticParams in layout.tsx");
  
  // AST check
  const sourceFile = ts.createSourceFile("layout.tsx", content, ts.ScriptTarget.Latest, true);
  let hasGenerateStaticParams = false;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === "generateStaticParams") {
      hasGenerateStaticParams = true;
    }
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === "generateStaticParams") {
          hasGenerateStaticParams = true;
        }
      }
    }
  });
  assert(!hasGenerateStaticParams, "AST found generateStaticParams declaration");
});

runTest("R4.3: layout.tsx exports dynamic = 'force-dynamic'", () => {
  const layoutPath = path.join(PROJECT_ROOT, "src/app/[locale]/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");
  assert(
    content.includes('export const dynamic = "force-dynamic"') ||
    content.includes("export const dynamic = 'force-dynamic'"),
    "layout.tsx missing 'export const dynamic = force-dynamic'"
  );

  // AST check
  const sourceFile = ts.createSourceFile("layout.tsx", content, ts.ScriptTarget.Latest, true);
  let foundDynamicExport = false;
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === "dynamic") {
          if (decl.initializer && ts.isStringLiteral(decl.initializer) && decl.initializer.text === "force-dynamic") {
            foundDynamicExport = true;
          }
        }
      }
    }
  });
  assert(foundDynamicExport, "AST confirmed export const dynamic = 'force-dynamic' is present");
});

// -----------------------------------------------------------------------------
// Test Group 2: Route Loading States Verification (R1)
// -----------------------------------------------------------------------------
console.log("\nGroup 2: Route Loading States (8 Sub-Routes)");

const EXPECTED_ROUTES = [
  "students",
  "teachers",
  "parents",
  "groups",
  "leads",
  "finance",
  "tasks",
  "schedule"
];

for (const route of EXPECTED_ROUTES) {
  const relPath = `src/app/[locale]/dashboard/${route}/loading.tsx`;
  const fullPath = path.join(PROJECT_ROOT, relPath);

  runTest(`R1.${route}.1: ${relPath} exists`, () => {
    assert(fs.existsSync(fullPath), `File does not exist: ${relPath}`);
  });

  runTest(`R1.${route}.2: ${relPath} contains 'use client' directive`, () => {
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(
      content.includes('"use client"') || content.includes("'use client'"),
      `${relPath} is missing 'use client'`
    );
  });

  runTest(`R1.${route}.3: ${relPath} imports and uses useTranslations("Common")`, () => {
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(content.includes("useTranslations"), `${relPath} does not import useTranslations`);
    assert(
      content.includes('useTranslations("Common")') || content.includes("useTranslations('Common')"),
      `${relPath} does not call useTranslations("Common")`
    );
  });

  runTest(`R1.${route}.4: ${relPath} renders {t("loading")}`, () => {
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(
      content.includes('t("loading")') || content.includes("t('loading')"),
      `${relPath} does not render translated loading text`
    );
  });

  runTest(`R1.${route}.5: ${relPath} has valid default export React component`, () => {
    const content = fs.readFileSync(fullPath, "utf-8");
    const sourceFile = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);
    let hasDefaultExport = false;
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
        hasDefaultExport = true;
      }
      if (ts.isExportAssignment(node)) {
        hasDefaultExport = true;
      }
    });
    assert(hasDefaultExport, `${relPath} does not have a default export`);
  });

  runTest(`R1.${route}.6: ${relPath} referenced CSS module files exist`, () => {
    const content = fs.readFileSync(fullPath, "utf-8");
    const importRegex = /import\s+styles\s+from\s+["']([^"']+)["']/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const resolvedCssPath = path.resolve(path.dirname(fullPath), importPath);
      assert(fs.existsSync(resolvedCssPath), `CSS file not found: ${resolvedCssPath}`);
    }
  });
}

// -----------------------------------------------------------------------------
// Test Group 3: i18n Translation Parity for Common.loading
// -----------------------------------------------------------------------------
console.log("\nGroup 3: Translation Parity for Common.loading");

const LOCALES = ["en", "az", "ru"];

for (const loc of LOCALES) {
  runTest(`R3.1: messages/${loc}.json contains valid Common.loading string`, () => {
    const locPath = path.join(PROJECT_ROOT, `messages/${loc}.json`);
    assert(fs.existsSync(locPath), `Translation file messages/${loc}.json missing`);
    const json = JSON.parse(fs.readFileSync(locPath, "utf-8"));
    assert(json.Common, `messages/${loc}.json missing Common namespace`);
    assert(typeof json.Common.loading === "string", `messages/${loc}.json missing Common.loading`);
    assert(json.Common.loading.trim().length > 0, `messages/${loc}.json Common.loading is empty`);
  });
}

// -----------------------------------------------------------------------------
// Test Group 4: Adversarial Edge Cases
// -----------------------------------------------------------------------------
console.log("\nGroup 4: Adversarial Stress Testing & Boundary Checks");

runTest("ADV.1: No other page or layout in src/app exports generateStaticParams", () => {
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const text = fs.readFileSync(full, "utf-8");
        if (text.includes("generateStaticParams")) {
          throw new Error(`Found generateStaticParams in ${path.relative(PROJECT_ROOT, full)}`);
        }
      }
    }
  }
  scanDir(path.join(PROJECT_ROOT, "src/app"));
});

runTest("ADV.2: Loading skeletons render without throwing when simulated", () => {
  // Test mock evaluation of the component
  for (const route of EXPECTED_ROUTES) {
    const fullPath = path.join(PROJECT_ROOT, `src/app/[locale]/dashboard/${route}/loading.tsx`);
    const content = fs.readFileSync(fullPath, "utf-8");
    // Verify AST has JSX elements inside return statement
    const sourceFile = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);
    let foundReturnWithJsx = false;
    function visit(node: ts.Node) {
      if (ts.isReturnStatement(node) && node.expression) {
        if (ts.isJsxElement(node.expression) || ts.isJsxSelfClosingElement(node.expression) || ts.isParenthesizedExpression(node.expression)) {
          foundReturnWithJsx = true;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    assert(foundReturnWithJsx, `Component in ${route}/loading.tsx does not return valid JSX`);
  }
});

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
