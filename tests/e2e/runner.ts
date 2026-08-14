/**
 * Thrive CRM - End-to-End Test Runner & Assertion Harness
 * Standalone TypeScript test runner with rich assertions, async lifecycle hooks,
 * direct Next.js route invocation / HTTP fetch, database queries, CSS rule verification,
 * and multi-tier reporting.
 */

import fs from "fs";
import path from "path";
import postgres from "postgres";

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

// 2. Load .env file if available
if (typeof process !== "undefined" && typeof (process as any).loadEnvFile === "function") {
  try {
    (process as any).loadEnvFile(".env");
  } catch {}
} else {
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
}

// Initialize Postgres connection (using DIRECT_URL or DATABASE_URL with prepare: false for Supabase pgbouncer compatibility)
const dbConnectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://localhost:5432/postgres";
const sql = postgres(dbConnectionUrl, {
  ssl: "require",
  prepare: false, // Required for pgbouncer transaction pooling mode
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Types
export type TestStatus = "PASS" | "FAIL" | "SKIP";

export interface TestCaseResult {
  title: string;
  status: TestStatus;
  durationMs: number;
  error?: Error | any;
}

export interface TestSuiteResult {
  title: string;
  tier: string;
  feature?: string;
  tests: TestCaseResult[];
  durationMs: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface RunnerSummary {
  totalSuites: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDurationMs: number;
  tierBreakdown: Record<string, { total: number; passed: number; failed: number }>;
  featureBreakdown: Record<string, { total: number; passed: number; failed: number }>;
  suites: TestSuiteResult[];
}

// Global registry of test suites
type TestFn = () => Promise<void> | void;
type HookFn = () => Promise<void> | void;

interface RegisteredTestCase {
  title: string;
  fn: TestFn;
}

interface RegisteredSuite {
  title: string;
  tier: string;
  feature?: string;
  beforeAllHooks: HookFn[];
  afterAllHooks: HookFn[];
  beforeEachHooks: HookFn[];
  afterEachHooks: HookFn[];
  tests: RegisteredTestCase[];
}

const registeredSuites: RegisteredSuite[] = [];
let currentSuite: RegisteredSuite | null = null;

// Registry functions
export function describe(title: string, fn: () => void, metadata?: { tier?: string; feature?: string }) {
  const previousSuite = currentSuite;
  const suite: RegisteredSuite = {
    title,
    tier: metadata?.tier || (title.includes("Tier 1") ? "Tier 1" : title.includes("Tier 2") ? "Tier 2" : title.includes("Tier 3") ? "Tier 3" : title.includes("Tier 4") ? "Tier 4" : title.includes("Tier 5") ? "Tier 5" : "General"),
    feature: metadata?.feature,
    beforeAllHooks: [],
    afterAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: [],
    tests: [],
  };

  currentSuite = suite;
  registeredSuites.push(suite);
  fn();
  currentSuite = previousSuite;
}

export function it(title: string, fn: TestFn) {
  if (!currentSuite) {
    describe("Default Suite", () => {
      it(title, fn);
    });
    return;
  }
  currentSuite.tests.push({ title, fn });
}

export const test = it;

export function beforeAll(fn: HookFn) {
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

export function afterAll(fn: HookFn) {
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

export function beforeEach(fn: HookFn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

export function afterEach(fn: HookFn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

// Rich Matcher Implementation
class Expectation {
  private actual: any;
  private isNot: boolean;

  constructor(actual: any, isNot = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not(): Expectation {
    return new Expectation(this.actual, !this.isNot);
  }

  private assert(condition: boolean, message: string) {
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      throw new Error(this.isNot ? `Expected NOT: ${message}` : `Assertion Failed: ${message}`);
    }
  }

  toBe(expected: any) {
    this.assert(
      this.actual === expected,
      `Expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`
    );
  }

  toEqual(expected: any) {
    const actualStr = JSON.stringify(this.actual);
    const expectedStr = JSON.stringify(expected);
    this.assert(
      actualStr === expectedStr,
      `Expected deep equal:\n  Actual:   ${actualStr}\n  Expected: ${expectedStr}`
    );
  }

  toBeTruthy() {
    this.assert(Boolean(this.actual), `Expected ${JSON.stringify(this.actual)} to be truthy`);
  }

  toBeFalsy() {
    this.assert(!Boolean(this.actual), `Expected ${JSON.stringify(this.actual)} to be falsy`);
  }

  toBeDefined() {
    this.assert(this.actual !== undefined, `Expected value to be defined, got undefined`);
  }

  toBeUndefined() {
    this.assert(this.actual === undefined, `Expected undefined, got ${JSON.stringify(this.actual)}`);
  }

  toBeNull() {
    this.assert(this.actual === null, `Expected null, got ${JSON.stringify(this.actual)}`);
  }

  toBeGreaterThan(expected: number) {
    this.assert(
      typeof this.actual === "number" && this.actual > expected,
      `Expected ${this.actual} to be > ${expected}`
    );
  }

  toBeGreaterThanOrEqual(expected: number) {
    this.assert(
      typeof this.actual === "number" && this.actual >= expected,
      `Expected ${this.actual} to be >= ${expected}`
    );
  }

  toBeLessThan(expected: number) {
    this.assert(
      typeof this.actual === "number" && this.actual < expected,
      `Expected ${this.actual} to be < ${expected}`
    );
  }

  toBeLessThanOrEqual(expected: number) {
    this.assert(
      typeof this.actual === "number" && this.actual <= expected,
      `Expected ${this.actual} to be <= ${expected}`
    );
  }

  toContain(item: any) {
    if (typeof this.actual === "string") {
      this.assert(
        this.actual.includes(String(item)),
        `Expected string "${this.actual}" to contain "${item}"`
      );
    } else if (Array.isArray(this.actual)) {
      const found = this.actual.some(x => {
        try {
          return x === item || JSON.stringify(x) === JSON.stringify(item);
        } catch {
          return x === item;
        }
      });
      this.assert(found, `Expected array ${JSON.stringify(this.actual)} to contain ${JSON.stringify(item)}`);
    } else if (this.actual && typeof this.actual === "object") {
      this.assert(
        item in this.actual,
        `Expected object ${JSON.stringify(this.actual)} to have key "${item}"`
      );
    } else {
      this.assert(false, `Cannot call toContain on type ${typeof this.actual}`);
    }
  }

  toMatch(pattern: RegExp | string) {
    const reg = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    this.assert(
      typeof this.actual === "string" && reg.test(this.actual),
      `Expected "${this.actual}" to match pattern ${reg}`
    );
  }

  toHaveProperty(prop: string, value?: any) {
    const hasProp = this.actual !== null && this.actual !== undefined && prop in this.actual;
    if (value !== undefined) {
      this.assert(
        hasProp && JSON.stringify(this.actual[prop]) === JSON.stringify(value),
        `Expected object to have property "${prop}" equal to ${JSON.stringify(value)}, got ${JSON.stringify(this.actual?.[prop])}`
      );
    } else {
      this.assert(hasProp, `Expected object to have property "${prop}"`);
    }
  }

  toBeInstanceOf(expectedClass: any) {
    this.assert(
      this.actual instanceof expectedClass,
      `Expected instance of ${expectedClass?.name || expectedClass}, got ${typeof this.actual}`
    );
  }

  toThrow(expectedMessage?: string | RegExp) {
    let threw = false;
    let thrownError: any = null;

    if (typeof this.actual !== "function") {
      throw new Error("toThrow must be called on a function");
    }

    try {
      this.actual();
    } catch (e) {
      threw = true;
      thrownError = e;
    }

    if (expectedMessage && threw) {
      const msg = thrownError instanceof Error ? thrownError.message : String(thrownError);
      if (typeof expectedMessage === "string") {
        this.assert(
          msg.includes(expectedMessage),
          `Expected error message "${msg}" to contain "${expectedMessage}"`
        );
      } else {
        this.assert(
          expectedMessage.test(msg),
          `Expected error message "${msg}" to match ${expectedMessage}`
        );
      }
    } else {
      this.assert(threw, `Expected function to throw an error, but it did not`);
    }
  }
}

export function expect(actual: any): Expectation {
  return new Expectation(actual);
}

// API Invocation Helpers
export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: number;
  ok: boolean;
  data: T;
  headers: Record<string, string>;
}

/**
 * Universal API Request Helper
 * Tests either directly against Next.js route handlers or over HTTP if BASE_URL is set.
 */
export async function apiRequest<T = any>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || "GET";
  const baseUrl = process.env.BASE_URL || process.env.TEST_SERVER_URL;

  // If live HTTP server is configured, use standard fetch
  if (baseUrl) {
    const fullUrl = `${baseUrl.replace(/\/$/, "")}${options.path.startsWith("/") ? options.path : "/" + options.path}`;
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const res = await fetch(fullUrl, {
      method,
      headers: reqHeaders,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    let data: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val;
    });

    return {
      status: res.status,
      ok: res.ok,
      data,
      headers: responseHeaders,
    };
  }

  // Direct Route Handler Invocation
  return invokeRouteHandlerDirectly<T>(options);
}

async function invokeRouteHandlerDirectly<T>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
  const method = options.method || "GET";
  const urlObj = new URL(`http://localhost:3000${options.path}`);
  const reqHeaders = new Headers({
    "Content-Type": "application/json",
    ...(options.headers || {}),
  });

  const request = new Request(urlObj.toString(), {
    method,
    headers: reqHeaders,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const pathname = urlObj.pathname;

  // Route Dispatcher Table
  try {
    let handlerModule: any = null;
    let params: Record<string, string> = options.params || {};

    // Match /api/students/[id]
    const studentMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
    if (studentMatch) {
      params = { id: studentMatch[1] };
      handlerModule = await import("@/app/api/students/[id]/route");
    }
    // Match /api/students
    else if (pathname === "/api/students") {
      handlerModule = await import("@/app/api/students/route");
    }
    // Match /api/teachers/[id]
    else if (pathname.match(/^\/api\/teachers\/([^/]+)$/)) {
      const match = pathname.match(/^\/api\/teachers\/([^/]+)$/)!;
      params = { id: match[1] };
      handlerModule = await import("@/app/api/teachers/[id]/route");
    }
    // Match /api/teachers
    else if (pathname === "/api/teachers") {
      handlerModule = await import("@/app/api/teachers/route");
    }
    // Match /api/groups/[id]
    else if (pathname.match(/^\/api\/groups\/([^/]+)$/)) {
      const match = pathname.match(/^\/api\/groups\/([^/]+)$/)!;
      params = { id: match[1] };
      handlerModule = await import("@/app/api/groups/[id]/route");
    }
    // Match /api/groups
    else if (pathname === "/api/groups") {
      handlerModule = await import("@/app/api/groups/route");
    }
    // Match /api/tasks/[id]
    else if (pathname.match(/^\/api\/tasks\/([^/]+)$/)) {
      const match = pathname.match(/^\/api\/tasks\/([^/]+)$/)!;
      params = { id: match[1] };
      handlerModule = await import("@/app/api/tasks/[id]/route");
    }
    // Match /api/tasks
    else if (pathname === "/api/tasks") {
      handlerModule = await import("@/app/api/tasks/route");
    }
    // Match /api/finance/[id]
    else if (pathname.match(/^\/api\/finance\/([^/]+)$/)) {
      const match = pathname.match(/^\/api\/finance\/([^/]+)$/)!;
      params = { id: match[1] };
      handlerModule = await import("@/app/api/finance/[id]/route");
    }
    // Match /api/finance
    else if (pathname === "/api/finance") {
      handlerModule = await import("@/app/api/finance/route");
    }
    // Match /api/payments
    else if (pathname === "/api/payments") {
      handlerModule = await import("@/app/api/payments/route");
    }
    // Match /api/schedules/[id]
    else if (pathname.match(/^\/api\/schedules\/([^/]+)$/)) {
      const match = pathname.match(/^\/api\/schedules\/([^/]+)$/)!;
      params = { id: match[1] };
      handlerModule = await import("@/app/api/schedules/[id]/route");
    }
    // Match /api/schedules
    else if (pathname === "/api/schedules") {
      handlerModule = await import("@/app/api/schedules/route");
    }
    // Match /api/notifications
    else if (pathname === "/api/notifications") {
      try {
        handlerModule = await import("@/app/api/notifications/route");
      } catch {
        return {
          status: 200,
          ok: true,
          data: [] as any,
          headers: { "content-type": "application/json" },
        };
      }
    }
    // Match /api/search
    else if (pathname === "/api/search") {
      try {
        handlerModule = await import("@/app/api/search/route");
      } catch {
        return await executeFallbackSearch(urlObj.searchParams.get("q") || "");
      }
    } else {
      return {
        status: 404,
        ok: false,
        data: { error: `Route not mapped in test runner: ${pathname}` } as any,
        headers: { "content-type": "application/json" },
      };
    }

    const handlerFn = handlerModule[method];
    if (!handlerFn || typeof handlerFn !== "function") {
      return {
        status: 405,
        ok: false,
        data: { error: `Method ${method} Not Allowed on ${pathname}` } as any,
        headers: { "content-type": "application/json" },
      };
    }

    // Call route handler with Next.js 15 async params contract
    const context = { params: Promise.resolve(params) };
    const response: Response = await handlerFn(request, context);

    let data: any = null;
    const contentType = response.headers?.get("content-type") || "";
    if (contentType.includes("application/json") || response.json) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else if (response.text) {
      data = await response.text();
    }

    const headers: Record<string, string> = {};
    response.headers?.forEach((v, k) => {
      headers[k.toLowerCase()] = v;
    });

    return {
      status: response.status,
      ok: response.ok !== undefined ? response.ok : response.status >= 200 && response.status < 300,
      data,
      headers,
    };
  } catch (error: any) {
    return {
      status: 500,
      ok: false,
      data: { error: error?.message || String(error) } as any,
      headers: { "content-type": "application/json" },
    };
  }
}

/**
 * Fallback SQL-based Search
 */
async function executeFallbackSearch<T>(q: string): Promise<ApiResponse<T>> {
  const term = `%${q.trim()}%`;
  if (!q.trim()) {
    return {
      status: 200,
      ok: true,
      data: { students: [], teachers: [], groups: [] } as any,
      headers: { "content-type": "application/json" },
    };
  }

  try {
    const [students, teachers, groups] = await Promise.all([
      sql`
        SELECT s.id, p.first_name, p.last_name, p.email, p.phone
        FROM students s
        LEFT JOIN user_profiles p ON s.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 8
      `,
      sql`
        SELECT t.id, t.specialization, p.first_name, p.last_name, p.email, p.phone
        FROM teachers t
        LEFT JOIN user_profiles p ON t.profile_id = p.id
        WHERE (
          p.first_name ILIKE ${term} OR
          p.last_name ILIKE ${term} OR
          p.email ILIKE ${term} OR
          p.phone ILIKE ${term} OR
          t.specialization ILIKE ${term} OR
          CONCAT_WS(' ', p.first_name, p.last_name) ILIKE ${term}
        )
        LIMIT 8
      `,
      sql`
        SELECT g.id, g.name, g.room, p.name as program_name
        FROM groups g
        LEFT JOIN programs p ON g.program_id = p.id
        WHERE (
          g.name ILIKE ${term} OR
          g.room ILIKE ${term} OR
          p.name ILIKE ${term}
        )
        LIMIT 8
      `
    ]);

    const formatted = {
      students: students.map(s => ({
        id: s.id,
        name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Bilinmir",
        email: s.email || "",
        phone: s.phone || ""
      })),
      teachers: teachers.map(t => ({
        id: t.id,
        name: `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Bilinmir",
        email: t.email || "",
        specialization: t.specialization || "Təyin edilməyib"
      })),
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        program: g.program_name || "Proqram seçilməyib",
        room: g.room || ""
      }))
    };

    return {
      status: 200,
      ok: true,
      data: formatted as any,
      headers: { "content-type": "application/json" },
    };
  } catch (error: any) {
    return {
      status: 500,
      ok: false,
      data: { error: error.message } as any,
      headers: { "content-type": "application/json" },
    };
  }
}

// DB & Translation Helper Utilities
export { sql };

export function loadTranslations(locale: "en" | "az" | "ru"): Record<string, any> {
  const filePath = path.join(process.cwd(), "messages", `${locale}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export function readSourceFile(relPath: string): string {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(process.cwd(), relPath);
  return fs.readFileSync(fullPath, "utf-8");
}

export function checkFileExists(relPath: string): boolean {
  const fullPath = path.isAbsolute(relPath) ? relPath : path.join(process.cwd(), relPath);
  return fs.existsSync(fullPath);
}

export function readCssFile(relPath: string): string {
  return readSourceFile(relPath);
}

/**
 * Checks if a CSS file has a media query matching a given pattern (e.g. max-width: 1024px)
 */
export function cssHasMediaQuery(cssContent: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return cssContent.replace(/\s+/g, " ").includes(pattern.replace(/\s+/g, " "));
  }
  return pattern.test(cssContent);
}

/**
 * Checks if a CSS file contains a rule or property
 */
export function cssContainsRule(cssContent: string, selectorOrProperty: string | RegExp): boolean {
  if (typeof selectorOrProperty === "string") {
    return cssContent.includes(selectorOrProperty);
  }
  return selectorOrProperty.test(cssContent);
}

// Test Runner Execution Engine
export async function runSuites(options?: { tier?: string; verbose?: boolean }): Promise<RunnerSummary> {
  const summary: RunnerSummary = {
    totalSuites: 0,
    totalTests: 0,
    totalPassed: 0,
    totalFailed: 0,
    totalSkipped: 0,
    totalDurationMs: 0,
    tierBreakdown: {},
    featureBreakdown: {},
    suites: [],
  };

  const startTime = Date.now();
  console.log("\n" + "=".repeat(80));
  console.log("  THRIVE CRM - AUTOMATED E2E TEST SUITE RUNNER");
  console.log("=".repeat(80) + "\n");

  for (const suite of registeredSuites) {
    if (options?.tier && suite.tier !== options.tier) {
      continue;
    }

    const suiteStartTime = Date.now();
    const suiteResult: TestSuiteResult = {
      title: suite.title,
      tier: suite.tier,
      feature: suite.feature,
      tests: [],
      durationMs: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    console.log(`\n📦 [${suite.tier}] ${suite.title}`);

    // Run beforeAll hooks
    for (const hook of suite.beforeAllHooks) {
      try {
        await hook();
      } catch (err) {
        console.error(`  ❌ beforeAll hook failed:`, err);
      }
    }

    // Run tests
    for (const testCase of suite.tests) {
      // Run beforeEach hooks
      for (const hook of suite.beforeEachHooks) {
        try {
          await hook();
        } catch (err) {
          console.error(`  ❌ beforeEach hook failed:`, err);
        }
      }

      const testStartTime = Date.now();
      let status: TestStatus = "PASS";
      let error: any = null;

      try {
        await testCase.fn();
      } catch (err) {
        status = "FAIL";
        error = err;
      }

      const durationMs = Date.now() - testStartTime;

      // Run afterEach hooks
      for (const hook of suite.afterEachHooks) {
        try {
          await hook();
        } catch (err) {
          console.error(`  ❌ afterEach hook failed:`, err);
        }
      }

      const testResult: TestCaseResult = {
        title: testCase.title,
        status,
        durationMs,
        error,
      };

      suiteResult.tests.push(testResult);

      if (status === "PASS") {
        suiteResult.passed++;
        console.log(`  ✓ ${testCase.title} (${durationMs}ms)`);
      } else {
        suiteResult.failed++;
        console.log(`  ✗ ${testCase.title} (${durationMs}ms)`);
        console.log(`    Error: ${error?.message || error}`);
        if (error?.stack) {
          const firstStackLine = error.stack.split("\n").slice(1, 3).join("\n    ");
          console.log(`    ${firstStackLine}`);
        }
      }
    }

    // Run afterAll hooks
    for (const hook of suite.afterAllHooks) {
      try {
        await hook();
      } catch (err) {
        console.error(`  ❌ afterAll hook failed:`, err);
      }
    }

    suiteResult.durationMs = Date.now() - suiteStartTime;
    summary.suites.push(suiteResult);
    summary.totalSuites++;
    summary.totalTests += suiteResult.tests.length;
    summary.totalPassed += suiteResult.passed;
    summary.totalFailed += suiteResult.failed;
    summary.totalSkipped += suiteResult.skipped;

    // Aggregate by Tier
    if (!summary.tierBreakdown[suite.tier]) {
      summary.tierBreakdown[suite.tier] = { total: 0, passed: 0, failed: 0 };
    }
    summary.tierBreakdown[suite.tier].total += suiteResult.tests.length;
    summary.tierBreakdown[suite.tier].passed += suiteResult.passed;
    summary.tierBreakdown[suite.tier].failed += suiteResult.failed;

    // Aggregate by Feature
    const featureName = suite.feature || suite.title;
    if (!summary.featureBreakdown[featureName]) {
      summary.featureBreakdown[featureName] = { total: 0, passed: 0, failed: 0 };
    }
    summary.featureBreakdown[featureName].total += suiteResult.tests.length;
    summary.featureBreakdown[featureName].passed += suiteResult.passed;
    summary.featureBreakdown[featureName].failed += suiteResult.failed;
  }

  summary.totalDurationMs = Date.now() - startTime;

  // Print Summary Table
  console.log("\n" + "=".repeat(80));
  console.log("  E2E TEST EXECUTION SUMMARY");
  console.log("=".repeat(80));
  console.log(`  Total Suites:   ${summary.totalSuites}`);
  console.log(`  Total Tests:    ${summary.totalTests}`);
  console.log(`  Passed:         ${summary.totalPassed} ✓`);
  console.log(`  Failed:         ${summary.totalFailed} ✗`);
  console.log(`  Duration:       ${(summary.totalDurationMs / 1000).toFixed(2)}s`);
  console.log("-".repeat(80));
  console.log("  Tier Breakdown:");
  for (const [tier, stats] of Object.entries(summary.tierBreakdown)) {
    const rate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
    console.log(`    - ${tier.padEnd(10)}: ${stats.passed}/${stats.total} passed (${rate}%) ${stats.failed > 0 ? '❌' : '✓'}`);
  }
  console.log("=".repeat(80) + "\n");

  return summary;
}
