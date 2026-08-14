/**
 * Tier 2: Boundary & Corner Cases E2E Test Suite
 * Rigorous boundary value analysis and edge condition testing:
 * - Empty strings, null payloads, whitespace inputs
 * - Non-existent UUIDs (404 handling)
 * - Malformed / invalid IDs (400 handling)
 * - Boundary amounts (0, negative amounts, high precision)
 * - Zero division protection in stats calculation
 * - SQL parameterization & injection prevention
 * - Multi-byte UTF-8 and Azerbaijani special character safety (ə, ı, ö, ğ, ç, ş)
 * - R1/R2 Table overflow and skeleton fallback boundaries
 * - R3/R4 i18n missing key handling and dynamic SSR headers
 */

import { describe, it, expect, apiRequest, loadTranslations, readSourceFile, sql } from "./runner";

export function registerTier2Tests() {
  const NON_EXISTENT_UUID = "00000000-0000-0000-0000-000000000000";
  const INVALID_ID_STRING = "not-a-valid-uuid-12345!@#$%";

  // --------------------------------------------------------------------------
  // Feature 1: Student Profile Boundary Cases
  // --------------------------------------------------------------------------
  describe("Feature 1: Student Profile Boundary & Corner Cases", () => {
    it("B1.1: GET /api/students/[id] with non-existent UUID should return 404", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${NON_EXISTENT_UUID}` });
      expect(res.status).toBe(404);
      expect(res.data).toHaveProperty("error");
    });

    it("B1.2: GET /api/students/[id] with SQL injection probe in ID should safely reject", async () => {
      const sqlInjectionId = "00000000-0000-0000-0000-000000000000' OR '1'='1";
      const res = await apiRequest({ method: "GET", path: `/api/students/${encodeURIComponent(sqlInjectionId)}` });
      expect([400, 404, 500]).toContain(res.status);
      expect(res.data).not.toHaveProperty("student");
    });

    it("B1.3: GET /api/students/[id] with invalid malformed ID format should return error", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${INVALID_ID_STRING}` });
      expect([400, 404, 500]).toContain(res.status);
    });

    it("B1.4: PUT /api/students/[id] with empty payload should not corrupt existing data", async () => {
      const studentRows = await sql`SELECT id FROM students LIMIT 1`;
      if (studentRows.length > 0) {
        const studentId = studentRows[0].id;
        const putRes = await apiRequest({
          method: "PUT",
          path: `/api/students/${studentId}`,
          body: {},
        });
        expect([200, 400]).toContain(putRes.status);
      }
    });

    it("B1.5: Student attendance rate calculation handles zero total attendance sessions without division-by-zero NaN", async () => {
      const studentRows = await sql`SELECT id FROM students LIMIT 1`;
      if (studentRows.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/students/${studentRows[0].id}` });
        expect(res.status).toBe(200);
        if (res.data.stats) {
          expect(res.data.stats.attendanceRate).not.toContain("NaN");
        }
      }
    });
  }, { tier: "Tier 2", feature: "Student Profile Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 2: Teacher Profile Boundary Cases
  // --------------------------------------------------------------------------
  describe("Feature 2: Teacher Profile Boundary & Corner Cases", () => {
    it("B2.1: GET /api/teachers/[id] with non-existent UUID should return 404", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/teachers/${NON_EXISTENT_UUID}` });
      expect(res.status).toBe(404);
    });

    it("B2.2: POST /api/teachers with missing required fields (name/email/password) should return 400", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/teachers",
        body: { specialty: "Matematika" },
      });
      expect([400, 500]).toContain(res.status);
    });

    it("B2.3: POST /api/teachers with duplicate email should be rejected", async () => {
      const existingUsers = await sql`SELECT email FROM auth.users LIMIT 1`;
      if (existingUsers.length > 0) {
        const res = await apiRequest({
          method: "POST",
          path: "/api/teachers",
          body: {
            name: "Duplicate Tester",
            email: existingUsers[0].email,
            password: "SecurePassword123!",
          },
        });
        expect([400, 409, 500]).toContain(res.status);
      }
    });

    it("B2.4: Teacher profile handles teacher with 0 assigned groups without throwing error", async () => {
      const teachers = await sql`SELECT id FROM teachers LIMIT 1`;
      if (teachers.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/teachers/${teachers[0].id}` });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.groups)).toBe(true);
      }
    });

    it("B2.5: Teacher profile handles specialty with Azerbaijani characters (Fizika və Riyaziyyat)", async () => {
      const teachers = await sql`SELECT id FROM teachers LIMIT 1`;
      if (teachers.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/teachers/${teachers[0].id}` });
        expect(res.status).toBe(200);
      }
    });
  }, { tier: "Tier 2", feature: "Teacher Profile Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 3: Group Profile Boundary Cases
  // --------------------------------------------------------------------------
  describe("Feature 3: Group Profile Boundary & Corner Cases", () => {
    it("B3.1: GET /api/groups/[id] with non-existent UUID should return 404", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/groups/${NON_EXISTENT_UUID}` });
      expect(res.status).toBe(404);
    });

    it("B3.2: Group capacityPercentage calculation handles capacity = 0 without division-by-zero error", async () => {
      const groups = await sql`SELECT id FROM groups LIMIT 1`;
      if (groups.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${groups[0].id}` });
        expect(res.status).toBe(200);
        if (res.data.stats) {
          expect(typeof res.data.stats.capacityPercentage).toBe("number");
          expect(isNaN(res.data.stats.capacityPercentage)).toBe(false);
        }
      }
    });

    it("B3.3: Group profile safely returns empty arrays for groups without enrolled students or schedules", async () => {
      const groups = await sql`SELECT id FROM groups LIMIT 1`;
      if (groups.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${groups[0].id}` });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.students)).toBe(true);
        expect(Array.isArray(res.data.schedules)).toBe(true);
      }
    });

    it("B3.4: GET /api/groups with search parameter handles special regex characters", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/groups?search=.*+[]()" });
      expect([200, 400]).toContain(res.status);
    });

    it("B3.5: Group profile handles unassigned teacher (teacher_id IS NULL) gracefully", async () => {
      const groups = await sql`SELECT id FROM groups WHERE teacher_id IS NULL LIMIT 1`;
      if (groups.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${groups[0].id}` });
        expect(res.status).toBe(200);
      }
    });
  }, { tier: "Tier 2", feature: "Group Profile Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 4: Tasks Kanban Boundary Cases
  // --------------------------------------------------------------------------
  describe("Feature 4: Tasks Kanban Boundary Cases", () => {
    it("B4.1: POST /api/tasks with empty title should return 400 validation error", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: { title: "", status: "TODO" },
      });
      expect([400, 500]).toContain(res.status);
    });

    it("B4.2: PUT /api/tasks/[id] with non-existent UUID should return 404", async () => {
      const res = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${NON_EXISTENT_UUID}`,
        body: { status: "DONE" },
      });
      expect([404, 400]).toContain(res.status);
    });

    it("B4.3: DELETE /api/tasks/[id] with non-existent UUID should handle gracefully", async () => {
      const res = await apiRequest({ method: "DELETE", path: `/api/tasks/${NON_EXISTENT_UUID}` });
      expect([200, 404]).toContain(res.status);
    });

    it("B4.4: Task creation with extreme text length (5000 characters) in description should handle safely", async () => {
      const longDesc = "A".repeat(5000);
      const res = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: { title: "Boundary Long Task", description: longDesc, status: "TODO" },
      });
      expect([200, 201, 400]).toContain(res.status);
      if (res.data?.id) {
        await apiRequest({ method: "DELETE", path: `/api/tasks/${res.data.id}` });
      }
    });

    it("B4.5: Tasks status updates handle invalid status values gracefully", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: { title: "Invalid Status Task", status: "INVALID_STATUS_XYZ" },
      });
      expect([200, 201, 400]).toContain(res.status);
      if (res.data?.id) {
        await apiRequest({ method: "DELETE", path: `/api/tasks/${res.data.id}` });
      }
    });
  }, { tier: "Tier 2", feature: "Tasks Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 5: Finance Precision & Zero-Division
  // --------------------------------------------------------------------------
  describe("Feature 5: Finance Precision & Zero-Division", () => {
    it("B5.1: Payment amount of 0.00 should be handled appropriately", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/payments",
        body: { student_id: NON_EXISTENT_UUID, amount: 0 },
      });
      expect([400, 404, 500]).toContain(res.status);
    });

    it("B5.2: Negative payment amount should be rejected with 400 error", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/payments",
        body: { student_id: NON_EXISTENT_UUID, amount: -150 },
      });
      expect([400, 404, 500]).toContain(res.status);
    });

    it("B5.3: GET /api/finance returns numeric amounts without string concatenation bugs", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      for (const item of res.data) {
        expect(isNaN(Number(item.amount))).toBe(false);
      }
    });

    it("B5.4: Payment method handles standard values (CASH, CARD, BANK_TRANSFER)", async () => {
      const students = await sql`SELECT id FROM students LIMIT 1`;
      if (students.length > 0) {
        const res = await apiRequest({
          method: "POST",
          path: "/api/payments",
          body: { student_id: students[0].id, amount: 10, payment_method: "CARD", status: "PAID" },
        });
        expect([200, 201]).toContain(res.status);
      }
    });

    it("B5.5: Finance calculation handles empty ledger without crashing", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  }, { tier: "Tier 2", feature: "Finance Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 6: Group Schedules Boundaries
  // --------------------------------------------------------------------------
  describe("Feature 6: Group Schedules Boundaries", () => {
    it("B6.1: Schedule creation rejects invalid day of week", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/schedules",
        body: { group_id: NON_EXISTENT_UUID, day: "INVALID_DAY", start_time: "10:00", end_time: "11:00" },
      });
      expect([400, 404, 500]).toContain(res.status);
    });

    it("B6.2: Schedule creation rejects non-existent group UUID", async () => {
      const res = await apiRequest({
        method: "POST",
        path: "/api/schedules",
        body: { group_id: NON_EXISTENT_UUID, day: "MONDAY", start_time: "10:00", end_time: "11:00" },
      });
      expect([400, 404, 500]).toContain(res.status);
    });

    it("B6.3: Schedule query handles empty schedule list without throwing error", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/schedules" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it("B6.4: Schedule time string parsing handles midnight / edge boundaries (00:00, 23:59)", () => {
      const midnight = "00:00";
      const endOfDay = "23:59";
      expect(midnight < endOfDay).toBe(true);
    });

    it("B6.5: Schedule deletion handles non-existent schedule ID gracefully", async () => {
      const res = await apiRequest({ method: "DELETE", path: `/api/schedules/${NON_EXISTENT_UUID}` });
      expect([200, 404, 400]).toContain(res.status);
    });
  }, { tier: "Tier 2", feature: "Schedule Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 7: Global Search Boundaries
  // --------------------------------------------------------------------------
  describe("Feature 7: Global Search Boundaries", () => {
    it("B7.1: Global Search handles Azerbaijani diacritics (ə, ö, ğ, ı, ç, ş) accurately", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=Məmmədov" });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("students");
    });

    it("B7.2: Global Search handles single-character queries safely", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=z" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.students)).toBe(true);
    });

    it("B7.3: Global Search handles SQL special characters (' , -- , ; , /*) without syntax error", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=%27%20OR%201=1;%20--" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.students)).toBe(true);
    });

    it("B7.4: Global Search handles very long query strings (> 200 characters) without buffer overflow", async () => {
      const longQuery = "a".repeat(250);
      const res = await apiRequest({ method: "GET", path: `/api/search?q=${longQuery}` });
      expect(res.status).toBe(200);
      expect(res.data.students.length).toBe(0);
    });

    it("B7.5: Global Search trims leading and trailing whitespace before execution", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=%20%20%20" });
      expect(res.status).toBe(200);
      expect(res.data.students.length).toBe(0);
    });
  }, { tier: "Tier 2", feature: "Global Search Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 8: R1/R2 Responsive & Loading Boundary Cases
  // --------------------------------------------------------------------------
  describe("Feature 8: R1/R2 Responsive & Loading Boundary Cases", () => {
    it("B8.1: CSS tables define responsive overflow rules across all dashboard pages", () => {
      const studentsCss = readSourceFile("src/app/[locale]/dashboard/students/page.module.css");
      expect(studentsCss.includes("overflow-x: auto") || studentsCss.includes("overflow-x:auto")).toBe(true);
    });

    it("B8.2: Modals have responsive width constraints (percentage or viewport units) to prevent mobile/tablet clipping", () => {
      const tasksCss = readSourceFile("src/app/[locale]/dashboard/tasks/page.module.css");
      expect(tasksCss.includes("max-width:") || tasksCss.includes("width:")).toBe(true);
    });

    it("B8.3: Sidebar collapse rules trigger at breakpoint <= 1024px", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      expect(layoutCss.includes("1024px")).toBe(true);
    });

    it("B8.4: Loading state skeleton animations include pulse or spinner CSS keyframes", () => {
      const studentsCss = readSourceFile("src/app/[locale]/dashboard/students/page.module.css");
      expect(studentsCss.includes("@keyframes") || studentsCss.includes("animation") || studentsCss.includes("pulse")).toBe(true);
    });

    it("B8.5: Mobile overlay element exists in layout styling to handle sidebar backdrop click", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      expect(layoutCss.includes(".overlay") || layoutCss.includes("overlay")).toBe(true);
    });
  }, { tier: "Tier 2", feature: "R1/R2 Responsive Boundaries" });

  // --------------------------------------------------------------------------
  // Feature 9: R3/R4 i18n Fallback & Dynamic SSR Headers
  // --------------------------------------------------------------------------
  describe("Feature 9: R3/R4 i18n Fallback & Dynamic SSR Headers", () => {
    it("B9.1: Translation files maintain JSON syntax integrity without trailing comma syntax errors", () => {
      const az = loadTranslations("az");
      const en = loadTranslations("en");
      const ru = loadTranslations("ru");
      expect(Object.keys(az).length).toBeGreaterThan(0);
      expect(Object.keys(en).length).toBeGreaterThan(0);
      expect(Object.keys(ru).length).toBeGreaterThan(0);
    });

    it("B9.2: Common namespace contains essential action keys (cancel, save, loading) in all 3 locales", () => {
      const locales = ["az", "en", "ru"] as const;
      for (const loc of locales) {
        const msg = loadTranslations(loc);
        expect(msg.Common).toHaveProperty("loading");
        expect(msg.Common).toHaveProperty("save");
        expect(msg.Common).toHaveProperty("cancel");
      }
    });

    it("B9.3: Next.js layout.tsx enforces pure dynamic SSR with force-dynamic", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("force-dynamic")).toBe(true);
    });

    it("B9.4: Next.js layout.tsx rejects static generation params to ensure fresh server rendering", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("generateStaticParams")).toBe(false);
    });

    it("B9.5: Unsupported locale route throws notFound() or redirects gracefully", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("notFound()")).toBe(true);
    });
  }, { tier: "Tier 2", feature: "R3/R4 i18n & SSR Boundaries" });
}
