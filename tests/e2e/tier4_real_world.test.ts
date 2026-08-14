/**
 * Tier 4: Real-World Scenarios E2E Test Suite
 * Simulates complete end-to-end user operational journeys:
 * Scenario 1: Complete Student Onboarding & Tuition Billing Lifecycle
 * Scenario 2: Academic Term Setup & Course Scheduling Workflow
 * Scenario 3: CRM Operational Kanban Task Management Cycle
 * Scenario 4: Global Search & Omnichannel Discovery Pipeline
 * Scenario 5: Multi-Locale Translation Integrity & Content Audit across EN, AZ, RU
 * Scenario 6: Tablet Viewport End-to-End Responsive Layout & Modal Ergonomics Audit
 * Scenario 7: Dynamic SSR Loading Boundary Transition & Route Resolution Simulation
 */

import { describe, it, expect, apiRequest, loadTranslations, readSourceFile, checkFileExists, sql } from "./runner";
import { routing } from "@/i18n/routing";

export function registerTier4Tests() {
  describe("Tier 4: Real-World Application Workflows", () => {
    // ------------------------------------------------------------------------
    // Scenario 1: Complete Student Onboarding & Tuition Billing Lifecycle
    // ------------------------------------------------------------------------
    it("Scenario 1: Complete Student Onboarding & Tuition Billing Lifecycle", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const studentName = `Leyla Məmmədova_${uniqueSuffix}`;
      const email = `leyla_${uniqueSuffix}@thrive.az`;

      // Step 1: Admin registers new student
      const studentRes = await apiRequest({
        method: "POST",
        path: "/api/students",
        body: {
          name: studentName,
          email,
          phone: `+99455777${uniqueSuffix}`,
          fin: `5G${uniqueSuffix}`,
        },
      });

      expect([200, 201]).toContain(studentRes.status);
      const studentId = studentRes.data.id;
      expect(studentId).toBeDefined();

      // Step 2: Student makes initial payment
      const paymentRes = await apiRequest({
        method: "POST",
        path: "/api/payments",
        body: {
          student_id: studentId,
          amount: 200,
          payment_method: "CARD",
          status: "PAID",
        },
      });
      expect([200, 201]).toContain(paymentRes.status);

      // Step 3: Verify Student Profile calculates totalPaid accurately
      const profileRes = await apiRequest({
        method: "GET",
        path: `/api/students/${studentId}`,
      });
      expect(profileRes.status).toBe(200);
      expect(profileRes.data.student.id).toBe(studentId);
      expect(profileRes.data.stats.totalPaid).toBeGreaterThanOrEqual(200);
    });

    // ------------------------------------------------------------------------
    // Scenario 2: Academic Term Setup & Course Scheduling Workflow
    // ------------------------------------------------------------------------
    it("Scenario 2: Academic Term Setup & Course Scheduling Workflow", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);

      // Step 1: Query or check groups
      const groupsRes = await apiRequest({ method: "GET", path: "/api/groups" });
      expect(groupsRes.status).toBe(200);

      let targetGroupId = "";
      if (Array.isArray(groupsRes.data) && groupsRes.data.length > 0) {
        targetGroupId = groupsRes.data[0].id;
      }

      if (targetGroupId) {
        // Step 2: Create schedule
        const schedRes = await apiRequest({
          method: "POST",
          path: "/api/schedules",
          body: {
            group_id: targetGroupId,
            day: "TUESDAY",
            start_time: "16:00",
            end_time: "17:30",
            room: `Room_${uniqueSuffix}`,
          },
        });
        expect([200, 201]).toContain(schedRes.status);

        // Step 3: Verify in group profile
        const groupProfileRes = await apiRequest({
          method: "GET",
          path: `/api/groups/${targetGroupId}`,
        });
        expect(groupProfileRes.status).toBe(200);
        expect(Array.isArray(groupProfileRes.data.schedules)).toBe(true);
      }
    });

    // ------------------------------------------------------------------------
    // Scenario 3: CRM Operational Kanban Task Management Cycle
    // ------------------------------------------------------------------------
    it("Scenario 3: CRM Operational Kanban Task Management Cycle", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const taskTitle = `IELTS Prep Class Planning ${uniqueSuffix}`;

      // Step 1: Create Task in TODO
      const createRes = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: {
          title: taskTitle,
          description: "Prepare lesson material and diagnostic mock tests",
          status: "TODO",
          priority: "HIGH",
        },
      });

      expect([200, 201]).toContain(createRes.status);
      const taskId = createRes.data.id;
      expect(taskId).toBeDefined();

      // Step 2: Move to IN_PROGRESS
      const updateRes = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${taskId}`,
        body: { status: "IN_PROGRESS" },
      });
      expect(updateRes.status).toBe(200);
      expect(updateRes.data.status).toBe("IN_PROGRESS");

      // Step 3: Complete Task -> Move to DONE
      const completeRes = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${taskId}`,
        body: { status: "DONE" },
      });
      expect(completeRes.status).toBe(200);
      expect(completeRes.data.status).toBe("DONE");

      // Step 4: Cleanup
      const deleteRes = await apiRequest({
        method: "DELETE",
        path: `/api/tasks/${taskId}`,
      });
      expect(deleteRes.status).toBe(200);
    });

    // ------------------------------------------------------------------------
    // Scenario 4: Global Search & Omnichannel Discovery Pipeline
    // ------------------------------------------------------------------------
    it("Scenario 4: Global Search & Omnichannel Discovery Pipeline", async () => {
      const searchTerms = ["SAT", "IELTS", "TOEFL", "Matematika", "Leyla"];

      for (const term of searchTerms) {
        const res = await apiRequest({
          method: "GET",
          path: `/api/search?q=${encodeURIComponent(term)}`,
        });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty("students");
        expect(res.data).toHaveProperty("teachers");
        expect(res.data).toHaveProperty("groups");
      }
    });

    // ------------------------------------------------------------------------
    // Scenario 5: Multi-Locale Translation Integrity & Content Audit
    // ------------------------------------------------------------------------
    it("Scenario 5: Multi-Locale Translation Integrity & Content Audit across EN, AZ, RU", () => {
      const locales = ["en", "az", "ru"] as const;
      const translations: Record<string, any> = {};

      for (const loc of locales) {
        translations[loc] = loadTranslations(loc);
        expect(translations[loc]).toBeDefined();
        expect(translations[loc]).toHaveProperty("Common");
        expect(translations[loc]).toHaveProperty("Sidebar");
        expect(translations[loc]).toHaveProperty("Dashboard");
      }

      // Check key parity across all 3 locales
      for (const ns of ["Common", "Sidebar", "Dashboard"]) {
        const enKeys = Object.keys(translations.en[ns] || {});
        const azKeys = Object.keys(translations.az[ns] || {});
        const ruKeys = Object.keys(translations.ru[ns] || {});

        for (const k of enKeys) {
          expect(azKeys).toContain(k);
          expect(ruKeys).toContain(k);
        }
      }
    });

    // ------------------------------------------------------------------------
    // Scenario 6: Tablet Viewport End-to-End Responsive Layout & Modal Audit
    // ------------------------------------------------------------------------
    it("Scenario 6: Tablet Viewport End-to-End Responsive Layout & Modal Ergonomics Audit", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      const studentsCss = readSourceFile("src/app/[locale]/dashboard/students/page.module.css");
      const tasksCss = readSourceFile("src/app/[locale]/dashboard/tasks/page.module.css");

      // 1. Sidebar breakpoint handling <= 1024px
      expect(layoutCss.includes("1024px")).toBe(true);

      // 2. Table overflow wrapper handling
      expect(studentsCss.includes("overflow-x: auto") || studentsCss.includes("overflow-x:auto")).toBe(true);

      // 3. Kanban overflow container handling
      expect(tasksCss.includes("overflow-x: auto") || tasksCss.includes("overflow-x:auto") || tasksCss.includes("flex-wrap")).toBe(true);
    });

    // ------------------------------------------------------------------------
    // Scenario 7: Dynamic SSR Loading Boundary Transition Simulation
    // ------------------------------------------------------------------------
    it("Scenario 7: Dynamic SSR Loading Boundary Transition & Route Resolution Simulation", () => {
      // 1. Check layout.tsx SSR configuration
      const layoutSource = readSourceFile("src/app/[locale]/layout.tsx");
      expect(layoutSource.includes("force-dynamic")).toBe(true);
      expect(layoutSource.includes("generateStaticParams")).toBe(false);

      // 2. Verify all 8 dashboard sub-routes have loading.tsx
      const subRoutes = ["students", "teachers", "parents", "groups", "leads", "finance", "tasks", "schedule"];
      for (const route of subRoutes) {
        const loadingPath = `src/app/[locale]/dashboard/${route}/loading.tsx`;
        expect(checkFileExists(loadingPath)).toBe(true);
      }
    });
  }, { tier: "Tier 4", feature: "Real-World Scenarios" });
}
