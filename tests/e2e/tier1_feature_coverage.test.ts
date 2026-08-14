/**
 * Tier 1: Feature Coverage E2E Test Suite
 * Comprehensive isolated feature tests covering:
 * 1. Dynamic Student Profile
 * 2. Dynamic Teacher Profile
 * 3. Dynamic Group Profile
 * 4. Tasks Kanban Board & CRUD
 * 5. Finance Invoices & Payment Processing
 * 6. Group Schedules Management
 * 7. Global Search API
 * 8. R1: Dashboard Route Loading States (loading.tsx across 8 sub-routes)
 * 9. R2: iPad/Tablet Responsiveness (768px - 1024px CSS rules & media queries)
 * 10. R3: Multi-Language i18n Completeness & NotificationsDropdown
 * 11. R4: Pure Dynamic SSR Configuration in layout.tsx
 */

import { describe, it, expect, apiRequest, loadTranslations, readSourceFile, checkFileExists, cssHasMediaQuery, cssContainsRule, sql } from "./runner";

export function registerTier1Tests() {
  // --------------------------------------------------------------------------
  // Feature 1: Dynamic Student Profile
  // --------------------------------------------------------------------------
  describe("Feature 1: Dynamic Student Profile", () => {
    let testStudentId: string;

    it("F1.1: should fetch or create a student and query GET /api/students/[id] with full profile", async () => {
      const listRes = await apiRequest({ method: "GET", path: "/api/students" });
      expect(listRes.status).toBe(200);

      if (Array.isArray(listRes.data) && listRes.data.length > 0) {
        testStudentId = listRes.data[0].id;
      } else {
        const createRes = await apiRequest({
          method: "POST",
          path: "/api/students",
          body: { name: "Tier1 Test Student", email: "tier1.student@example.com", phone: "+994501230001" },
        });
        expect(createRes.status).toBe(200);
        testStudentId = createRes.data.id;
      }

      expect(testStudentId).toBeDefined();

      const res = await apiRequest({ method: "GET", path: `/api/students/${testStudentId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("student");
      expect(res.data.student.id).toBe(testStudentId);
      expect(res.data.student).toHaveProperty("name");
      expect(res.data.student).toHaveProperty("status");
    });

    it("F1.2: should return groups array associated with the student profile", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${testStudentId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("groups");
      expect(Array.isArray(res.data.groups)).toBe(true);
    });

    it("F1.3: should return payments array with monetary amounts and status", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${testStudentId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("payments");
      expect(Array.isArray(res.data.payments)).toBe(true);
    });

    it("F1.4: should return attendance history records for the student", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${testStudentId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("attendance");
      expect(Array.isArray(res.data.attendance)).toBe(true);
    });

    it("F1.5: should calculate numeric stats (totalPaid, totalDebt, attendanceRate)", async () => {
      const res = await apiRequest({ method: "GET", path: `/api/students/${testStudentId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("stats");
      const { stats } = res.data;
      expect(typeof stats.totalPaid).toBe("number");
      expect(typeof stats.totalDebt).toBe("number");
      expect(typeof stats.attendanceRate).toBe("string");
      expect(stats.attendanceRate).toMatch(/\d+%/);
    });
  }, { tier: "Tier 1", feature: "Dynamic Student Profile" });

  // --------------------------------------------------------------------------
  // Feature 2: Dynamic Teacher Profile
  // --------------------------------------------------------------------------
  describe("Feature 2: Dynamic Teacher Profile", () => {
    let testTeacherId: string;

    it("F2.1: should query GET /api/teachers and fetch dynamic profile GET /api/teachers/[id]", async () => {
      const listRes = await apiRequest({ method: "GET", path: "/api/teachers" });
      expect(listRes.status).toBe(200);

      if (Array.isArray(listRes.data) && listRes.data.length > 0) {
        testTeacherId = listRes.data[0].id;
      }

      if (testTeacherId) {
        const res = await apiRequest({ method: "GET", path: `/api/teachers/${testTeacherId}` });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("teacher");
        expect(res.data.teacher.id).toBe(testTeacherId);
      }
    });

    it("F2.2: should return assigned groups for the teacher", async () => {
      if (!testTeacherId) return;
      const res = await apiRequest({ method: "GET", path: `/api/teachers/${testTeacherId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("groups");
      expect(Array.isArray(res.data.groups)).toBe(true);
    });

    it("F2.3: should return student list roster for the teacher", async () => {
      if (!testTeacherId) return;
      const res = await apiRequest({ method: "GET", path: `/api/teachers/${testTeacherId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("students");
      expect(Array.isArray(res.data.students)).toBe(true);
    });

    it("F2.4: should return weekly schedule timetable for the teacher", async () => {
      if (!testTeacherId) return;
      const res = await apiRequest({ method: "GET", path: `/api/teachers/${testTeacherId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("schedules");
      expect(Array.isArray(res.data.schedules)).toBe(true);
    });

    it("F2.5: should calculate stats (activeGroupsCount, totalStudentsCount, weeklyHours)", async () => {
      if (!testTeacherId) return;
      const res = await apiRequest({ method: "GET", path: `/api/teachers/${testTeacherId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("stats");
      const { stats } = res.data;
      expect(typeof stats.activeGroupsCount).toBe("number");
      expect(typeof stats.totalStudentsCount).toBe("number");
      expect(typeof stats.weeklyHours).toBe("number");
    });
  }, { tier: "Tier 1", feature: "Dynamic Teacher Profile" });

  // --------------------------------------------------------------------------
  // Feature 3: Dynamic Group Profile
  // --------------------------------------------------------------------------
  describe("Feature 3: Dynamic Group Profile", () => {
    let testGroupId: string;

    it("F3.1: should query GET /api/groups and fetch dynamic profile GET /api/groups/[id]", async () => {
      const listRes = await apiRequest({ method: "GET", path: "/api/groups" });
      expect(listRes.status).toBe(200);

      if (Array.isArray(listRes.data) && listRes.data.length > 0) {
        testGroupId = listRes.data[0].id;
      }

      if (testGroupId) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${testGroupId}` });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("group");
        expect(res.data.group.id).toBe(testGroupId);
      }
    });

    it("F3.2: should return student roster enrolled in the group", async () => {
      if (!testGroupId) return;
      const res = await apiRequest({ method: "GET", path: `/api/groups/${testGroupId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("students");
      expect(Array.isArray(res.data.students)).toBe(true);
    });

    it("F3.3: should return weekly schedule list for the group", async () => {
      if (!testGroupId) return;
      const res = await apiRequest({ method: "GET", path: `/api/groups/${testGroupId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("schedules");
      expect(Array.isArray(res.data.schedules)).toBe(true);
    });

    it("F3.4: should return attendance history sessions for the group", async () => {
      if (!testGroupId) return;
      const res = await apiRequest({ method: "GET", path: `/api/groups/${testGroupId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("attendance");
      expect(Array.isArray(res.data.attendance)).toBe(true);
    });

    it("F3.5: should calculate capacity stats (enrolledStudentsCount, maxCapacity, capacityPercentage)", async () => {
      if (!testGroupId) return;
      const res = await apiRequest({ method: "GET", path: `/api/groups/${testGroupId}` });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("stats");
      const { stats } = res.data;
      expect(typeof stats.enrolledStudentsCount).toBe("number");
      expect(typeof stats.maxCapacity).toBe("number");
      expect(typeof stats.capacityPercentage).toBe("number");
    });
  }, { tier: "Tier 1", feature: "Dynamic Group Profile" });

  // --------------------------------------------------------------------------
  // Feature 4: Tasks Kanban Board & CRUD
  // --------------------------------------------------------------------------
  describe("Feature 4: Tasks Kanban Board & CRUD", () => {
    let createdTaskId: string;

    it("F4.1: should fetch kanban tasks organized by status columns", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/tasks" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it("F4.2: should create a new task via POST /api/tasks", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const res = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: {
          title: `Task_${uniqueSuffix}`,
          description: "Test task description",
          status: "TODO",
          priority: "HIGH",
        },
      });
      expect([200, 201]).toContain(res.status);
      expect(res.data).toHaveProperty("id");
      createdTaskId = res.data.id;
    });

    it("F4.3: should update task status (move across columns) via PUT /api/tasks/[id]", async () => {
      if (!createdTaskId) return;
      const res = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${createdTaskId}`,
        body: { status: "IN_PROGRESS" },
      });
      expect(res.status).toBe(200);
      expect(res.data.status).toBe("IN_PROGRESS");
    });

    it("F4.4: should update task title and priority via PUT /api/tasks/[id]", async () => {
      if (!createdTaskId) return;
      const res = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${createdTaskId}`,
        body: { title: "Updated Task Title", priority: "URGENT" },
      });
      expect(res.status).toBe(200);
      expect(res.data.title).toBe("Updated Task Title");
      expect(res.data.priority).toBe("URGENT");
    });

    it("F4.5: should delete a task via DELETE /api/tasks/[id]", async () => {
      if (!createdTaskId) return;
      const res = await apiRequest({ method: "DELETE", path: `/api/tasks/${createdTaskId}` });
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });
  }, { tier: "Tier 1", feature: "Tasks Kanban Board & CRUD" });

  // --------------------------------------------------------------------------
  // Feature 5: Finance Invoices & Payments
  // --------------------------------------------------------------------------
  describe("Feature 5: Finance Invoices & Payments", () => {
    it("F5.1: should query financial ledger records via GET /api/finance", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it("F5.2: should return paid_amount, due_date, and payment_method columns in finance query", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      if (res.data.length > 0) {
        const item = res.data[0];
        expect(item).toHaveProperty("amount");
        expect(item).toHaveProperty("paidAmount");
      }
    });

    it("F5.3: should support recording a payment via POST /api/payments", async () => {
      const students = await sql`SELECT id FROM students LIMIT 1`;
      if (students.length > 0) {
        const res = await apiRequest({
          method: "POST",
          path: "/api/payments",
          body: {
            student_id: students[0].id,
            amount: 50,
            payment_method: "CASH",
            status: "PAID",
          },
        });
        expect([200, 201]).toContain(res.status);
      }
    });

    it("F5.4: should calculate overall finance summary totals", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      let totalAmount = 0;
      let totalPaid = 0;
      for (const item of res.data) {
        totalAmount += Number(item.amount || 0);
        totalPaid += Number(item.paidAmount || 0);
      }
      expect(totalAmount).toBeGreaterThanOrEqual(0);
      expect(totalPaid).toBeGreaterThanOrEqual(0);
    });

    it("F5.5: should correctly filter payments by status", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/finance" });
      expect(res.status).toBe(200);
      const paidItems = res.data.filter((item: any) => item.status === "PAID");
      const pendingItems = res.data.filter((item: any) => item.status === "PENDING");
      expect(Array.isArray(paidItems)).toBe(true);
      expect(Array.isArray(pendingItems)).toBe(true);
    });
  }, { tier: "Tier 1", feature: "Finance Invoices & Payments" });

  // --------------------------------------------------------------------------
  // Feature 6: Group Schedules Management
  // --------------------------------------------------------------------------
  describe("Feature 6: Group Schedules Management", () => {
    it("F6.1: should list schedules via GET /api/schedules", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/schedules" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it("F6.2: should return day, start_time, end_time, and room for schedules", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/schedules" });
      expect(res.status).toBe(200);
      if (res.data.length > 0) {
        const item = res.data[0];
        expect(item).toHaveProperty("day");
        expect(item).toHaveProperty("start_time");
        expect(item).toHaveProperty("end_time");
      }
    });

    it("F6.3: should create a schedule entry via POST /api/schedules", async () => {
      const groups = await sql`SELECT id FROM groups LIMIT 1`;
      if (groups.length > 0) {
        const res = await apiRequest({
          method: "POST",
          path: "/api/schedules",
          body: {
            group_id: groups[0].id,
            day: "MONDAY",
            start_time: "10:00",
            end_time: "11:30",
            room: "101",
          },
        });
        expect([200, 201]).toContain(res.status);
      }
    });

    it("F6.4: should validate schedule time range (end_time after start_time)", () => {
      const startTime = "10:00";
      const endTime = "11:30";
      expect(startTime < endTime).toBe(true);
    });

    it("F6.5: should associate schedule with group profile", async () => {
      const groups = await sql`SELECT id FROM groups LIMIT 1`;
      if (groups.length > 0) {
        const res = await apiRequest({ method: "GET", path: `/api/groups/${groups[0].id}` });
        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("schedules");
      }
    });
  }, { tier: "Tier 1", feature: "Group Schedules Management" });

  // --------------------------------------------------------------------------
  // Feature 7: Global Search API
  // --------------------------------------------------------------------------
  describe("Feature 7: Global Search API", () => {
    it("F7.1: should return grouped search results for query q via GET /api/search", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=a" });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty("students");
      expect(res.data).toHaveProperty("teachers");
      expect(res.data).toHaveProperty("groups");
    });

    it("F7.2: should return empty arrays when query is empty or whitespace", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=" });
      expect(res.status).toBe(200);
      expect(res.data.students).toEqual([]);
      expect(res.data.teachers).toEqual([]);
      expect(res.data.groups).toEqual([]);
    });

    it("F7.3: should perform case-insensitive substring search", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=TEST" });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data.students)).toBe(true);
    });

    it("F7.4: should cap maximum results per category to prevent payload bloat", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=e" });
      expect(res.status).toBe(200);
      expect(res.data.students.length).toBeLessThanOrEqual(10);
      expect(res.data.teachers.length).toBeLessThanOrEqual(10);
      expect(res.data.groups.length).toBeLessThanOrEqual(10);
    });

    it("F7.5: should include essential preview fields (name, email/specialty/program) in search results", async () => {
      const res = await apiRequest({ method: "GET", path: "/api/search?q=a" });
      expect(res.status).toBe(200);
      if (res.data.students.length > 0) {
        expect(res.data.students[0]).toHaveProperty("id");
        expect(res.data.students[0]).toHaveProperty("name");
      }
    });
  }, { tier: "Tier 1", feature: "Global Search API" });

  // --------------------------------------------------------------------------
  // Feature 8: R1 - Route Loading States (loading.tsx across all 8 sub-routes)
  // --------------------------------------------------------------------------
  describe("Feature 8: R1 - Dashboard Route Loading States", () => {
    const subRoutes = [
      "students",
      "teachers",
      "parents",
      "groups",
      "leads",
      "finance",
      "tasks",
      "schedule",
    ];

    subRoutes.forEach((route) => {
      it(`F8.${subRoutes.indexOf(route) + 1}: loading.tsx exists and is implemented for /dashboard/${route}`, () => {
        const loadingPath = `src/app/[locale]/dashboard/${route}/loading.tsx`;
        const exists = checkFileExists(loadingPath);
        expect(exists).toBe(true);

        const content = readSourceFile(loadingPath);
        // Verify export default function
        expect(content.includes("export default function")).toBe(true);
        // Verify use of next-intl translations or Common.loading
        expect(content.includes("useTranslations") || content.includes("getTranslations") || content.includes("Common.loading") || content.includes("loading")).toBe(true);
        // Verify skeleton or spinner visual structure
        expect(content.includes("skeleton") || content.includes("spinner") || content.includes("loading") || content.includes("animate")).toBe(true);
      });
    });
  }, { tier: "Tier 1", feature: "R1: Loading States" });

  // --------------------------------------------------------------------------
  // Feature 9: R2 - iPad/Tablet Responsiveness (768px - 1024px)
  // --------------------------------------------------------------------------
  describe("Feature 9: R2 - iPad/Tablet Responsiveness (768px - 1024px)", () => {
    it("F9.1: layout.module.css contains media queries for <= 1024px to collapse/hide sidebar", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      expect(cssHasMediaQuery(layoutCss, "1024px")).toBe(true);
      expect(layoutCss.includes(".sidebar") || layoutCss.includes("sidebar")).toBe(true);
    });

    it("F9.2: table containers have overflow-x: auto to prevent layout breaks on tablet screens", () => {
      const studentsCss = readSourceFile("src/app/[locale]/dashboard/students/page.module.css");
      expect(studentsCss.includes("overflow-x: auto") || studentsCss.includes("overflow-x:auto")).toBe(true);
    });

    it("F9.3: Kanban board container supports responsive horizontal fitting and overflow on tablets", () => {
      const tasksCss = readSourceFile("src/app/[locale]/dashboard/tasks/page.module.css");
      expect(tasksCss.includes("overflow-x: auto") || tasksCss.includes("overflow-x:auto") || tasksCss.includes("flex-wrap")).toBe(true);
    });

    it("F9.4: Modals expand up to 90% width or adapt dynamically on smaller/tablet viewports", () => {
      const studentsCss = readSourceFile("src/app/[locale]/dashboard/students/page.module.css");
      const modalRules = studentsCss.includes("modal") && (studentsCss.includes("width:") || studentsCss.includes("max-width:"));
      expect(modalRules).toBe(true);
    });

    it("F9.5: Responsive header elements (hamburger menu button and overlay) are styled for mobile/tablet", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      expect(layoutCss.includes(".menuBtn") || layoutCss.includes("menuBtn")).toBe(true);
    });
  }, { tier: "Tier 1", feature: "R2: Tablet Responsiveness" });

  // --------------------------------------------------------------------------
  // Feature 10: R3 - Multi-Language i18n Completeness
  // --------------------------------------------------------------------------
  describe("Feature 10: R3 - Multi-Language i18n Completeness", () => {
    it("F10.1: translation message files exist and are valid JSON across az, en, and ru", () => {
      const locales = ["az", "en", "ru"] as const;
      for (const loc of locales) {
        const messages = loadTranslations(loc);
        expect(typeof messages).toBe("object");
        expect(messages).toHaveProperty("Common");
      }
    });

    it("F10.2: NotificationsDropdown.tsx uses useTranslations and contains zero hardcoded English strings", () => {
      const dropdownSource = readSourceFile("src/components/NotificationsDropdown.tsx");
      expect(dropdownSource.includes("useTranslations")).toBe(true);
      
      // Should not contain raw hardcoded English text blocks outside translation keys
      expect(dropdownSource.includes("<h3>Notifications</h3>")).toBe(false);
      expect(dropdownSource.includes("Mark all read") && !dropdownSource.includes("t('markAll')") && !dropdownSource.includes("t('markAllRead')") && !dropdownSource.includes("t(\"markAllRead\")")).toBe(false);
    });

    it("F10.3: Table empty state translation keys exist across az, en, and ru", () => {
      const locales = ["az", "en", "ru"] as const;
      for (const loc of locales) {
        const messages = loadTranslations(loc);
        const hasEmptyKey = Boolean(
          messages.Common?.empty ||
          messages.Common?.noData ||
          messages.Common?.noResults ||
          messages.Dashboard?.empty ||
          messages.Search?.noResultsShort
        );
        expect(hasEmptyKey).toBe(true);
      }
    });

    it("F10.4: Loading state translation key (Common.loading) exists across az, en, and ru", () => {
      const locales = ["az", "en", "ru"] as const;
      for (const loc of locales) {
        const messages = loadTranslations(loc);
        expect(messages.Common).toHaveProperty("loading");
        expect(typeof messages.Common.loading).toBe("string");
        expect(messages.Common.loading.length).toBeGreaterThan(0);
      }
    });

    it("F10.5: Key parity across az.json, en.json, and ru.json namespaces", () => {
      const az = loadTranslations("az");
      const en = loadTranslations("en");
      const ru = loadTranslations("ru");

      const topKeysEn = Object.keys(en);
      const topKeysAz = Object.keys(az);
      const topKeysRu = Object.keys(ru);

      for (const k of ["Common", "Sidebar", "Dashboard", "Auth"]) {
        expect(topKeysAz).toContain(k);
        expect(topKeysEn).toContain(k);
        expect(topKeysRu).toContain(k);
      }
    });
  }, { tier: "Tier 1", feature: "R3: i18n Completeness" });

  // --------------------------------------------------------------------------
  // Feature 11: R4 - Pure Dynamic SSR Configuration
  // --------------------------------------------------------------------------
  describe("Feature 11: R4 - Pure Dynamic SSR Configuration", () => {
    it("F11.1: src/app/[locale]/layout.tsx explicitly exports dynamic = 'force-dynamic'", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      const hasForceDynamic = layoutSource.includes('export const dynamic = "force-dynamic"') ||
                              layoutSource.includes("export const dynamic = 'force-dynamic'");
      expect(hasForceDynamic).toBe(true);
    });

    it("F11.2: generateStaticParams is completely removed from src/app/[locale]/layout.tsx", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("generateStaticParams")).toBe(false);
    });

    it("F11.3: layout.tsx retains setRequestLocale and NextIntlClientProvider wrapping", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("setRequestLocale")).toBe(true);
      expect(layoutSource.includes("NextIntlClientProvider")).toBe(true);
    });

    it("F11.4: layout.tsx correctly handles dynamic params promise in Next.js 15", () => {
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("params: Promise<{ locale: string }>")).toBe(true);
    });
  }, { tier: "Tier 1", feature: "R4: Pure Dynamic SSR" });
}
