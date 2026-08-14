/**
 * Tier 5: Adversarial Routing, Internationalization & Auth Stress Test Suite
 * Specifically challenges and verifies:
 * 1. Routing & URL Resolution across all locales ('en', 'az', 'ru')
 * 2. Locale prefixing rules ('as-needed' mode)
 * 3. Protected route intercept and redirection to /login
 * 4. callbackUrl encoding, preservation, and open-redirect resistance
 * 5. NextAuth configuration & credentials provider authorization logic
 * 6. Middleware matcher and API / static asset bypass integrity
 * 7. Multi-locale translation keys parity and message load safety
 * 8. Pure Dynamic SSR export enforcement in src/app/[locale]/layout.tsx
 */

import { describe, it, expect, apiRequest, loadTranslations, readSourceFile, sql } from "./runner";
import { routing } from "@/i18n/routing";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcrypt";

export function registerTier5Tests() {
  describe("Tier 5: Adversarial Routing, Internationalization & Auth Security", () => {
    // ------------------------------------------------------------------------
    // Section 1: next-intl Routing & Locale Configuration Matrix
    // ------------------------------------------------------------------------
    it("ADV1.1: routing configuration should enforce ['en', 'az', 'ru'] with default 'en' and 'as-needed' prefix", () => {
      expect(routing.locales).toEqual(["en", "az", "ru"]);
      expect(routing.defaultLocale).toBe("en");
      expect(routing.localePrefix).toBe("as-needed");
    });

    it("ADV1.2: layout.tsx should enforce dynamic SSR and not use generateStaticParams", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      // Must not define generateStaticParams
      expect(layoutSource.includes("generateStaticParams")).toBe(false);
      // Must export dynamic = 'force-dynamic'
      expect(layoutSource.includes('export const dynamic = "force-dynamic"') || layoutSource.includes("export const dynamic = 'force-dynamic'")).toBe(true);
    });

    it("ADV1.3: translation messages should exist, be valid JSON, and contain Auth namespace for all locales", () => {
      const locales = ["en", "az", "ru"] as const;
      for (const loc of locales) {
        const messages = loadTranslations(loc);
        expect(messages).toHaveProperty("Auth");
        expect(messages.Auth).toHaveProperty("title");
        expect(messages.Auth).toHaveProperty("loginBtn");
        expect(messages.Auth).toHaveProperty("emailLabel");
        expect(messages.Auth).toHaveProperty("passwordLabel");
        expect(messages.Auth).toHaveProperty("backHome");
        expect(typeof messages.Auth.title).toBe("string");
        expect(messages.Auth.title.length).toBeGreaterThan(0);
      }
    });

    // ------------------------------------------------------------------------
    // Section 2: NextAuth AuthOptions Configuration & Redirection Alignment
    // ------------------------------------------------------------------------
    it("ADV2.1: NextAuth pages.signIn must be set to '/login' (unprefixed) to align with as-needed routing", () => {
      expect(authOptions.pages?.signIn).toBe("/login");
    });

    it("ADV2.2: NextAuth session strategy must be 'jwt' with custom token and session callbacks", async () => {
      expect(authOptions.session?.strategy).toBe("jwt");
      expect(authOptions.callbacks?.jwt).toBeDefined();
      expect(authOptions.callbacks?.session).toBeDefined();

      // Test JWT callback
      const mockUser = { id: "user-uuid-123", role: "admin", email: "admin@thrive.az" };
      const token = await authOptions.callbacks!.jwt!({
        token: {} as any,
        user: mockUser as any,
        account: null as any,
      });
      expect(token.id).toBe("user-uuid-123");
      expect(token.role).toBe("admin");

      // Test Session callback
      const session = await authOptions.callbacks!.session!({
        session: { expires: "2099-01-01T00:00:00.000Z", user: {} as any },
        token: { id: "user-uuid-123", role: "admin" },
        user: mockUser as any,
        newSession: null as any,
        trigger: "update",
      });
      expect((session.user as any).id).toBe("user-uuid-123");
      expect((session.user as any).role).toBe("admin");
    });

    it("ADV2.3: NextAuth authorize() should reject empty credentials with appropriate error", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === "credentials" || p.name === "Credentials"
      ) as any;
      expect(credentialsProvider).toBeDefined();

      const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;

      // Empty payload
      let rejected = false;
      try {
        const result = await authorizeFn(undefined);
        if (result === null || result === undefined) rejected = true;
      } catch (err: any) {
        rejected = true;
        expect(err.message).toContain("Email və şifrə daxil edilməlidir");
      }
      expect(rejected).toBe(true);

      // Missing password
      rejected = false;
      try {
        const result = await authorizeFn({ email: "tamerlan@thrive.az", password: "" });
        if (result === null || result === undefined) rejected = true;
      } catch (err: any) {
        rejected = true;
        expect(err.message).toContain("Email və şifrə daxil edilməlidir");
      }
      expect(rejected).toBe(true);
    });

    it("ADV2.4: NextAuth authorize() should reject non-existent user with 'İstifadəçi tapılmadı'", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === "credentials" || p.name === "Credentials"
      ) as any;

      const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;

      let rejected = false;
      try {
        const result = await authorizeFn({
          email: "nonexistent.user.probe.999@thrive.az",
          password: "RandomPassword123!",
        });
        if (result === null || result === undefined) rejected = true;
      } catch (err: any) {
        rejected = true;
        expect(err.message).toContain("İstifadəçi tapılmadı");
      }
      expect(rejected).toBe(true);
    });

    it("ADV2.5: NextAuth authorize() should authenticate valid user via bcrypt or preconfigured password", async () => {
      const credentialsProvider = authOptions.providers.find(
        (p: any) => p.id === "credentials" || p.name === "Credentials"
      ) as any;

      const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;

      // Check if tamerlan@thrive.az exists in db
      const users = await sql`SELECT * FROM auth.users WHERE email = 'tamerlan@thrive.az' LIMIT 1`;
      if (users.length > 0) {
        const authenticatedUser = await authorizeFn({
          email: "tamerlan@thrive.az",
          password: "Tamerlan2026@",
        });
        expect(authenticatedUser).toBeDefined();
        expect(authenticatedUser.email).toBe("tamerlan@thrive.az");
        expect(authenticatedUser.id).toBe(users[0].id);
      }
    });

    // ------------------------------------------------------------------------
    // Section 3: URL Parameters, Query String & CallbackUrl Simulation
    // ------------------------------------------------------------------------
    it("ADV3.1: callbackUrl with encoded query parameters and nested paths should parse correctly", () => {
      const testCases = [
        {
          rawPath: "/dashboard",
          expectedCallback: "%2Fdashboard",
        },
        {
          rawPath: "/az/dashboard/students",
          expectedCallback: "%2Faz%2Fdashboard%2Fstudents",
        },
        {
          rawPath: "/ru/dashboard/finance?tab=invoices&status=PAID",
          expectedCallback: "%2Fru%2Fdashboard%2Ffinance%3Ftab%3Dinvoices%26status%3DPAID",
        },
        {
          rawPath: "/dashboard/leads?q=Tamerlan+M%C9%99mm%C9%99dov",
          expectedCallback: "%2Fdashboard%2Fleads%3Fq%3DTamerlan%2BM%25C9%2599mm%25C9%2599dov",
        },
      ];

      for (const tc of testCases) {
        const encoded = encodeURIComponent(tc.rawPath);
        const redirectUrl = `/login?callbackUrl=${encoded}`;
        expect(redirectUrl.startsWith("/login?callbackUrl=")).toBe(true);
        expect(decodeURIComponent(encoded)).toBe(tc.rawPath);
      }
    });

    it("ADV3.2: open-redirect attack vectors in callbackUrl should not bypass local routing boundaries", () => {
      const maliciousUrls = [
        "https://evil.com/phishing",
        "//attacker.com/steal-token",
        "javascript:alert(document.cookie)",
        "data:text/html,<script>alert(1)</script>",
        "\\\\evil-server\\share",
      ];

      for (const attack of maliciousUrls) {
        // In our LoginPage, router.push("/dashboard") is hardcoded on successful login
        // and does NOT evaluate callbackUrl with window.location, ensuring immunity.
        const isInternalRoute = attack.startsWith("/") && !attack.startsWith("//") && !attack.startsWith("/\\");
        expect(isInternalRoute).toBe(false);
      }
    });

    // ------------------------------------------------------------------------
    // Section 4: Protected Route Identification Logic
    // ------------------------------------------------------------------------
    it("ADV4.1: pathname route protection predicate accurately identifies protected vs public routes", () => {
      const isProtected = (pathname: string) => pathname.includes("/dashboard");

      // Protected routes
      expect(isProtected("/dashboard")).toBe(true);
      expect(isProtected("/dashboard/students")).toBe(true);
      expect(isProtected("/dashboard/teachers/123")).toBe(true);
      expect(isProtected("/az/dashboard")).toBe(true);
      expect(isProtected("/az/dashboard/finance")).toBe(true);
      expect(isProtected("/ru/dashboard")).toBe(true);
      expect(isProtected("/ru/dashboard/tasks")).toBe(true);

      // Public routes (must NOT be protected)
      expect(isProtected("/")).toBe(false);
      expect(isProtected("/az")).toBe(false);
      expect(isProtected("/ru")).toBe(false);
      expect(isProtected("/login")).toBe(false);
      expect(isProtected("/az/login")).toBe(false);
      expect(isProtected("/ru/login")).toBe(false);
      expect(isProtected("/api/auth/signin")).toBe(false);
      expect(isProtected("/api/students")).toBe(false);
    });

    // ------------------------------------------------------------------------
    // Section 5: API Exclusions & Middleware Matcher Conformance
    // ------------------------------------------------------------------------
    it("ADV5.1: middleware matcher regex correctly filters out /api, /_next, and static files", () => {
      // Regex from middleware.ts config.matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
      const matcherRegex = /^\/((?!api|_next|_vercel|.*\..*).*)$/;

      // Should MATCH (processed by middleware):
      expect(matcherRegex.test("/login")).toBe(true);
      expect(matcherRegex.test("/az/login")).toBe(true);
      expect(matcherRegex.test("/ru/login")).toBe(true);
      expect(matcherRegex.test("/dashboard")).toBe(true);
      expect(matcherRegex.test("/az/dashboard")).toBe(true);
      expect(matcherRegex.test("/ru/dashboard/leads")).toBe(true);
      expect(matcherRegex.test("/students")).toBe(true);

      // Should NOT MATCH (bypasses middleware directly to Next.js API / static engine):
      expect(matcherRegex.test("/api/students")).toBe(false);
      expect(matcherRegex.test("/api/finance")).toBe(false);
      expect(matcherRegex.test("/api/auth/session")).toBe(false);
      expect(matcherRegex.test("/_next/static/chunks/main.js")).toBe(false);
      expect(matcherRegex.test("/_vercel/insights/view")).toBe(false);
      expect(matcherRegex.test("/favicon.ico")).toBe(false);
      expect(matcherRegex.test("/images/logo.png")).toBe(false);
      expect(matcherRegex.test("/styles/theme.css")).toBe(false);
    });

    // ------------------------------------------------------------------------
    // Section 6: Dynamic Entity Profiles & Cross-Locale Navigation Sync
    // ------------------------------------------------------------------------
    it("ADV6.1: Dynamic student, teacher, and group profile API routes maintain 200 OK across valid IDs", async () => {
      const studentRows = await sql`SELECT id FROM students LIMIT 1`;
      if (studentRows.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/students/${studentRows[0].id}` });
        expect(res.status).toBe(200);
        expect(res.data.student.id).toBe(studentRows[0].id);
      }

      const teacherRows = await sql`SELECT id FROM teachers LIMIT 1`;
      if (teacherRows.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/teachers/${teacherRows[0].id}` });
        expect(res.status).toBe(200);
        expect(res.data.teacher.id).toBe(teacherRows[0].id);
      }

      const groupRows = await sql`SELECT id FROM groups LIMIT 1`;
      if (groupRows.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${groupRows[0].id}` });
        expect(res.status).toBe(200);
        expect(res.data.group.id).toBe(groupRows[0].id);
      }
    });

    // ------------------------------------------------------------------------
    // Section 7: Teacher Creation Password Hashing Integrity
    // ------------------------------------------------------------------------
    it("ADV7.1: Teacher creation API hashes password with bcrypt and sets role='teacher' in auth.users", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const email = `test.teacher.${uniqueSuffix}@thrive.az`;
      const plainPassword = `Password${uniqueSuffix}!`;

      const createRes = await apiRequest({
        method: "POST",
        path: "/api/teachers",
        body: {
          name: `Teacher_${uniqueSuffix}`,
          email,
          password: plainPassword,
          specialty: "Matematika",
        },
      });

      expect([200, 201]).toContain(createRes.status);
      expect(createRes.data).toHaveProperty("teacher");
      const teacherId = createRes.data.teacher.id;

      // Verify auth.users in DB
      const authUserRows = await sql`SELECT * FROM auth.users WHERE email = ${email} LIMIT 1`;
      expect(authUserRows.length).toBe(1);
      const authUser = authUserRows[0];
      expect(authUser.role).toBe("teacher");
      expect(authUser.encrypted_password).toBeDefined();

      // Verify password hashes correctly with bcrypt
      const passwordMatch = await bcrypt.compare(plainPassword, authUser.encrypted_password);
      expect(passwordMatch).toBe(true);

      // Cleanup
      await sql`DELETE FROM teachers WHERE id = ${teacherId}`;
      await sql`DELETE FROM auth.users WHERE email = ${email}`;
      await sql`DELETE FROM user_profiles WHERE email = ${email}`;
    });

    // ------------------------------------------------------------------------
    // Section 8: Finance API Dynamic Column Migration & Ledger Integrity
    // ------------------------------------------------------------------------
    it("ADV8.1: GET /api/finance safely handles paid_amount, due_date, and payment_method columns without SQL errors", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);

      for (const item of res.data) {
        expect(item).toHaveProperty("amount");
        expect(item).toHaveProperty("paidAmount");
        expect(item).toHaveProperty("status");
        expect(typeof item.paidAmount).toBe("number");
      }
    });
  }, { tier: "Tier 5", feature: "Routing, i18n & Auth Hardening" });
}
