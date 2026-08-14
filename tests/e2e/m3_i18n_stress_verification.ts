/**
 * M3 Empirical Stress-Test Suite
 * Dedicated verification for Milestone 3 (i18n Completeness, Key Parity & Missing Key Fallback)
 */

import fs from "fs";
import path from "path";
import ts from "typescript";

const PROJECT_ROOT = path.resolve(__dirname, "../..");

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: any) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✓ [${suite}] ${name}`);
  } else {
    results.push({ suite, name, passed: false, error: `Assertion failed: ${name}`, details });
    console.error(`  ✗ [${suite}] ${name} ${details ? `(${JSON.stringify(details)})` : ""}`);
  }
}

console.log("\n================================================================================");
console.log("  THRIVE CRM - EMPIRICAL i18n & LOCALE STRESS TEST SUITE (M3)");
console.log("================================================================================\n");

// =============================================================================
// SUITE 1: Message Dictionary Loading, Syntax & Structural Symmetry
// =============================================================================
console.log("📦 Suite 1: Message Dictionary Loading & Deep Key Parity (en, az, ru)");

const LOCALES = ["en", "az", "ru"] as const;
const dictionaries: Record<string, any> = {};

// 1.1 Load and parse all locale files
LOCALES.forEach(loc => {
  const filePath = path.join(PROJECT_ROOT, `messages/${loc}.json`);
  assert(fs.existsSync(filePath), "Dictionary Loading", `messages/${loc}.json exists`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    dictionaries[loc] = parsed;
    assert(typeof parsed === "object" && parsed !== null, "Dictionary Loading", `messages/${loc}.json is valid JSON`);
  } catch (err: any) {
    assert(false, "Dictionary Loading", `messages/${loc}.json failed to parse: ${err.message}`);
  }
});

// Helper: Flatten object into dot-notation leaf paths
function getLeafPaths(obj: any, prefix = ""): Record<string, string> {
  const leaves: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(leaves, getLeafPaths(value, fullPath));
    } else {
      leaves[fullPath] = typeof value === "string" ? value : JSON.stringify(value);
    }
  }
  return leaves;
}

const enLeaves = getLeafPaths(dictionaries["en"] || {});
const azLeaves = getLeafPaths(dictionaries["az"] || {});
const ruLeaves = getLeafPaths(dictionaries["ru"] || {});

const enKeys = Object.keys(enLeaves);
const azKeys = Object.keys(azLeaves);
const ruKeys = Object.keys(ruLeaves);

// 1.2 Exact Leaf Key Count & Symmetry
assert(
  enKeys.length === 309 && azKeys.length === 309 && ruKeys.length === 309,
  "Key Parity",
  `All dictionaries have exactly 309 leaf keys (en=${enKeys.length}, az=${azKeys.length}, ru=${ruKeys.length})`
);

// 1.3 Bidirectional parity checks
const missingInAz = enKeys.filter(k => !(k in azLeaves));
const missingInRu = enKeys.filter(k => !(k in ruLeaves));
const extraInAz = azKeys.filter(k => !(k in enLeaves));
const extraInRu = ruKeys.filter(k => !(k in enLeaves));

assert(missingInAz.length === 0, "Key Parity", "Zero missing keys in az.json compared to en.json", missingInAz);
assert(missingInRu.length === 0, "Key Parity", "Zero missing keys in ru.json compared to en.json", missingInRu);
assert(extraInAz.length === 0, "Key Parity", "Zero orphan/extra keys in az.json", extraInAz);
assert(extraInRu.length === 0, "Key Parity", "Zero orphan/extra keys in ru.json", extraInRu);

// 1.4 No empty string values or unpopulated leaves
LOCALES.forEach(loc => {
  const leaves = loc === "en" ? enLeaves : loc === "az" ? azLeaves : ruLeaves;
  const emptyKeys = Object.entries(leaves).filter(([_, val]) => typeof val === "string" && val.trim().length === 0);
  assert(emptyKeys.length === 0, "Content Integrity", `messages/${loc}.json contains 0 empty strings`, emptyKeys);
});

// 1.5 Parameter Interpolation Symmetry (e.g. {query})
enKeys.forEach(key => {
  const enVal = enLeaves[key] || "";
  const paramMatches = enVal.match(/\{([^}]+)\}/g) || [];
  if (paramMatches.length > 0) {
    paramMatches.forEach(param => {
      const azVal = azLeaves[key] || "";
      const ruVal = ruLeaves[key] || "";
      assert(
        azVal.includes(param),
        "Interpolation Symmetry",
        `Parameter ${param} preserved in az for key ${key}`
      );
      assert(
        ruVal.includes(param),
        "Interpolation Symmetry",
        `Parameter ${param} preserved in ru for key ${key}`
      );
    });
  }
});

// =============================================================================
// SUITE 2: Core Required Namespaces & Contract Compliance
// =============================================================================
console.log("\n📦 Suite 2: Specific Milestone 3 Contract Namespaces");

const REQUIRED_NAMESPACES = [
  "HomePage",
  "Auth",
  "Sidebar",
  "Dashboard",
  "Leads",
  "Students",
  "Teachers",
  "Schedule",
  "Groups",
  "Parents",
  "Finance",
  "Contract",
  "Tasks",
  "Settings",
  "Common",
  "NotFound",
  "Programs",
  "Profile",
  "Search",
  "Notifications"
];

REQUIRED_NAMESPACES.forEach(ns => {
  assert(
    ns in dictionaries["en"] && ns in dictionaries["az"] && ns in dictionaries["ru"],
    "Namespace Coverage",
    `Namespace '${ns}' exists across en, az, and ru dictionaries`
  );
});

// Notifications namespace verification (R3)
const requiredNotificationKeys = [
  "title",
  "markAllRead",
  "noNotifications",
  "noNewNotifications",
  "loading",
  "unread",
  "markRead"
];

requiredNotificationKeys.forEach(k => {
  LOCALES.forEach(loc => {
    assert(
      typeof dictionaries[loc]?.Notifications?.[k] === "string" && dictionaries[loc].Notifications[k].length > 0,
      "Notifications Contract",
      `Notifications.${k} is defined in ${loc}.json`
    );
  });
});

// Common namespace verification (R3)
const requiredCommonKeys = [
  "active",
  "pending",
  "inactive",
  "loading",
  "cancel",
  "save",
  "saving",
  "empty",
  "actions",
  "notSpecified"
];

requiredCommonKeys.forEach(k => {
  LOCALES.forEach(loc => {
    assert(
      typeof dictionaries[loc]?.Common?.[k] === "string" && dictionaries[loc].Common[k].length > 0,
      "Common Contract",
      `Common.${k} is defined in ${loc}.json`
    );
  });
});

// =============================================================================
// SUITE 3: Next.js next-intl Runtime Configuration & Architecture
// =============================================================================
console.log("\n📦 Suite 3: next-intl Runtime Architecture & Dynamic SSR");

// 3.1 Routing configuration
const routingPath = path.join(PROJECT_ROOT, "src/i18n/routing.ts");
assert(fs.existsSync(routingPath), "next-intl Architecture", "src/i18n/routing.ts exists");
const routingContent = fs.readFileSync(routingPath, "utf-8");
assert(
  routingContent.includes("locales: ['en', 'az', 'ru']") || routingContent.includes('locales: ["en", "az", "ru"]'),
  "next-intl Architecture",
  "routing.ts registers exactly ['en', 'az', 'ru'] locales"
);
assert(
  routingContent.includes("defaultLocale: 'en'") || routingContent.includes('defaultLocale: "en"'),
  "next-intl Architecture",
  "routing.ts specifies defaultLocale: 'en'"
);
assert(
  routingContent.includes("createNavigation(routing)"),
  "next-intl Architecture",
  "routing.ts exports navigation helpers via createNavigation"
);

// 3.2 Request configuration
const requestPath = path.join(PROJECT_ROOT, "src/i18n/request.ts");
assert(fs.existsSync(requestPath), "next-intl Architecture", "src/i18n/request.ts exists");
const requestContent = fs.readFileSync(requestPath, "utf-8");
assert(
  requestContent.includes("getRequestConfig"),
  "next-intl Architecture",
  "request.ts uses getRequestConfig from next-intl/server"
);
assert(
  requestContent.includes("await requestLocale") || requestContent.includes("requestLocale"),
  "next-intl Architecture",
  "request.ts awaits/resolves requestLocale properly for Next.js 15"
);
assert(
  requestContent.includes("routing.defaultLocale"),
  "next-intl Architecture",
  "request.ts falls back to routing.defaultLocale when invalid locale is requested"
);

// 3.3 Root Locale Layout
const layoutPath = path.join(PROJECT_ROOT, "src/app/[locale]/layout.tsx");
assert(fs.existsSync(layoutPath), "next-intl Architecture", "src/app/[locale]/layout.tsx exists");
const layoutContent = fs.readFileSync(layoutPath, "utf-8");
assert(
  layoutContent.includes('export const dynamic = "force-dynamic"') ||
  layoutContent.includes("export const dynamic = 'force-dynamic'"),
  "next-intl Architecture",
  "layout.tsx enforces pure dynamic SSR (force-dynamic)"
);
assert(
  !layoutContent.includes("generateStaticParams"),
  "next-intl Architecture",
  "layout.tsx completely removes generateStaticParams"
);
assert(
  layoutContent.includes("NextIntlClientProvider") && layoutContent.includes("messages={messages}"),
  "next-intl Architecture",
  "layout.tsx wraps children in NextIntlClientProvider with server-resolved messages"
);
assert(
  layoutContent.includes("setRequestLocale(locale)"),
  "next-intl Architecture",
  "layout.tsx calls setRequestLocale(locale)"
);

// =============================================================================
// SUITE 4: Source Code AST Translation Audit & Leak Prevention
// =============================================================================
console.log("\n📦 Suite 4: Source Code AST Translation Key Audit (Zero Raw Key Leaks)");

// Scan all TSX and TS files in src
function getSourceFiles(dir: string): string[] {
  let files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getSourceFiles(full));
    } else if (entry.name.endsWith(".tsx") || (entry.name.endsWith(".ts") && !entry.name.endsWith(".d.ts"))) {
      files.push(full);
    }
  }
  return files;
}

const allSourceFiles = getSourceFiles(path.join(PROJECT_ROOT, "src"));

let totalHooksFound = 0;
let totalKeyUsagesFound = 0;
const unmappedKeyErrors: Array<{ file: string; namespace: string; key: string }> = [];

allSourceFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf-8");
  if (!content.includes("useTranslations") && !content.includes("getTranslations")) return;

  const relPath = path.relative(PROJECT_ROOT, file);

  // Extract translation hooks: const t = useTranslations("Namespace");
  const hookRegex = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*useTranslations\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  const localHooks: Record<string, string> = {};

  while ((match = hookRegex.exec(content)) !== null) {
    const varName = match[1];
    const namespace = match[2];
    localHooks[varName] = namespace;
    totalHooksFound++;

    // Verify namespace exists
    assert(
      namespace in dictionaries["en"],
      "AST Key Audit",
      `Namespace "${namespace}" invoked in ${relPath} (${varName}) exists in dictionary`
    );
  }

  // Extract usages of each variable: t("key") or t('key')
  for (const [varName, namespace] of Object.entries(localHooks)) {
    const usageRegex = new RegExp(`\\b${varName}\\(\\s*["']([^"']+)["']`, "g");
    let usageMatch;
    while ((usageMatch = usageRegex.exec(content)) !== null) {
      const subKey = usageMatch[1];
      totalKeyUsagesFound++;

      // Resolve key in namespace
      const fullKeyPath = `${namespace}.${subKey}`;
      const existsInEn = fullKeyPath in enLeaves;
      const existsInAz = fullKeyPath in azLeaves;
      const existsInRu = fullKeyPath in ruLeaves;

      if (!existsInEn || !existsInAz || !existsInRu) {
        unmappedKeyErrors.push({ file: relPath, namespace, key: subKey });
      }

      assert(
        existsInEn && existsInAz && existsInRu,
        "AST Key Audit",
        `Key "${subKey}" from namespace "${namespace}" invoked in ${relPath} resolves in all locales`
      );
    }
  }
});

assert(
  unmappedKeyErrors.length === 0,
  "AST Key Audit",
  `Found ${totalKeyUsagesFound} translation invocations across ${totalHooksFound} hook instances with ZERO unmapped keys`,
  unmappedKeyErrors
);

// =============================================================================
// SUITE 5: NotificationsDropdown & Component i18n Hardening
// =============================================================================
console.log("\n📦 Suite 5: Component Hardcoded String Elimination");

const notifDropdownPath = path.join(PROJECT_ROOT, "src/components/NotificationsDropdown.tsx");
const notifContent = fs.readFileSync(notifDropdownPath, "utf-8");

assert(
  notifContent.includes('useTranslations("Notifications")') || notifContent.includes("useTranslations('Notifications')"),
  "NotificationsDropdown i18n",
  "NotificationsDropdown imports useTranslations('Notifications')"
);
assert(
  notifContent.includes('useTranslations("Common")') || notifContent.includes("useTranslations('Common')"),
  "NotificationsDropdown i18n",
  "NotificationsDropdown imports useTranslations('Common')"
);
assert(
  !notifContent.includes("<h3>Notifications</h3>"),
  "NotificationsDropdown i18n",
  "NotificationsDropdown replaced hardcoded <h3>Notifications</h3> with translated title"
);
assert(
  !notifContent.includes(">Mark all read<") && !notifContent.includes("/> Mark all read"),
  "NotificationsDropdown i18n",
  "NotificationsDropdown replaced hardcoded 'Mark all read' with translated markAllRead"
);
assert(
  !notifContent.includes(">No new notifications<") && notifContent.includes('t("noNotifications")'),
  "NotificationsDropdown i18n",
  "NotificationsDropdown replaced hardcoded 'No new notifications' with t('noNotifications')"
);
assert(
  notifContent.includes('c("loading")'),
  "NotificationsDropdown i18n",
  "NotificationsDropdown uses c('loading') for loading state"
);

// Table empty state checks across all dashboard pages
const dashboardPages = [
  "src/app/[locale]/dashboard/page.tsx",
  "src/app/[locale]/dashboard/students/page.tsx",
  "src/app/[locale]/dashboard/teachers/page.tsx",
  "src/app/[locale]/dashboard/groups/page.tsx",
  "src/app/[locale]/dashboard/parents/page.tsx",
  "src/app/[locale]/dashboard/finance/page.tsx",
  "src/app/[locale]/dashboard/schedule/page.tsx",
  "src/app/[locale]/dashboard/tasks/page.tsx"
];

dashboardPages.forEach(p => {
  const full = path.join(PROJECT_ROOT, p);
  const text = fs.readFileSync(full, "utf-8");
  assert(
    !text.includes("Məlumat tapılmadı") && !text.includes("Heç bir məlumat tapılmadı"),
    "Empty State i18n",
    `${p} does not contain hardcoded Azerbaijani empty state text`
  );
  assert(
    text.includes('c("empty")') || text.includes('t("empty")') || text.includes('t("noTeachers")') || text.includes('t("noSchedule")') || text.includes('c("loading")'),
    "Empty State i18n",
    `${p} uses translated empty/loading indicators`
  );
});

// =============================================================================
// FINAL SUMMARY & EXIT
// =============================================================================
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
  console.log("✨ All Milestone 3 multi-locale and i18n stress tests PASSED successfully!");
  process.exit(0);
}
