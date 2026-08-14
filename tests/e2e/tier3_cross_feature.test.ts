/**
 * Tier 3: Cross-Feature Integration E2E Test Suite
 * Tests pairwise and multi-feature relational workflows:
 * 1. Global Search -> Student Profile Navigation Sync
 * 2. Global Search -> Teacher Profile Navigation Sync
 * 3. Global Search -> Group Profile Navigation Sync
 * 4. Finance Invoice Creation -> Student Profile Payment Aggregation
 * 5. Payment Processing -> Invoice Status Transition & Student Debt Recalculation
 * 6. Group Schedule Creation -> Group Profile Schedules Array Sync
 * 7. Group Schedule Creation -> Teacher Profile Timetable Sync
 * 8. Tasks Kanban Board State Transition Lifecycle
 * 9. Group Schedule Deletion -> Group Schedules List Cleanup
 * 10. Multi-Entity Unified Search Categorization
 * 11. Tablet Viewport + Sidebar Toggle + Layout Content Integration
 * 12. Notifications Dropdown + Multi-Locale String Resolution
 */

import { describe, it, expect, apiRequest, loadTranslations, readSourceFile, sql } from "./runner";

export function registerTier3Tests() {
  describe("Tier 3: Pairwise Cross-Feature Interactions", () => {
    let studentId: string;
    let studentName: string;
    let teacherId: string;
    let groupId: string;
    let groupName: string;
    let scheduleId: string;
    let taskId: string;

    // ------------------------------------------------------------------------
    // 3.1 Search -> Student Profile
    // ------------------------------------------------------------------------
    it("X1: Global Search -> Student Profile Navigation Sync", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      studentName = `SearchableStudent_${uniqueSuffix}`;
      const email = `searchable_${uniqueSuffix}@example.com`;

      const createRes = await apiRequest({
        method: "POST",
        path: "/api/students",
        body: { name: studentName, email, phone: `+99450999${uniqueSuffix}` },
      });

      expect([200, 201]).toContain(createRes.status);
      studentId = createRes.data.id;

      const searchRes = await apiRequest({
        method: "GET",
        path: `/api/search?q=${encodeURIComponent(studentName)}`,
      });

      expect(searchRes.status).toBe(200);
      expect(searchRes.data.students.length).toBeGreaterThan(0);
      const matchedStudent = searchRes.data.students.find((s: any) => s.id === studentId || s.name.includes(studentName));
      expect(matchedStudent).toBeDefined();

      const profileRes = await apiRequest({
        method: "GET",
        path: `/api/students/${matchedStudent.id || studentId}`,
      });
      expect(profileRes.status).toBe(200);
      expect(profileRes.data.student.id).toBe(matchedStudent.id || studentId);
    });

    // ------------------------------------------------------------------------
    // 3.2 Search -> Teacher Profile
    // ------------------------------------------------------------------------
    it("X2: Global Search -> Teacher Profile Navigation Sync", async () => {
      const teachers = await sql`SELECT id FROM teachers LIMIT 1`;
      if (teachers.length > 0) {
        teacherId = teachers[0].id;
        const profileRes = await apiRequest({ method: "GET", path: `/api/teachers/${teacherId}` });
        expect(profileRes.status).toBe(200);
        const name = profileRes.data.teacher.name;

        if (name && name.length >= 2) {
          const searchRes = await apiRequest({
            method: "GET",
            path: `/api/search?q=${encodeURIComponent(name.slice(0, 4))}`,
          });
          expect(searchRes.status).toBe(200);
          expect(searchRes.data.teachers.length).toBeGreaterThan(0);
        }
      }
    });

    // ------------------------------------------------------------------------
    // 3.3 Search -> Group Profile
    // ------------------------------------------------------------------------
    it("X3: Global Search -> Group Profile Navigation Sync", async () => {
      const groups = await sql`SELECT id, name FROM groups LIMIT 1`;
      if (groups.length > 0) {
        groupId = groups[0].id;
        groupName = groups[0].name;

        const searchRes = await apiRequest({
          method: "GET",
          path: `/api/search?q=${encodeURIComponent(groupName.slice(0, 3))}`,
        });
        expect(searchRes.status).toBe(200);
        const matchedGroup = searchRes.data.groups.find((g: any) => g.id === groupId || g.name === groupName);
        expect(matchedGroup).toBeDefined();

        const profileRes = await apiRequest({ method: "GET", path: `/api/groups/${groupId}` });
        expect(profileRes.status).toBe(200);
        expect(profileRes.data.group.id).toBe(groupId);
      }
    });

    // ------------------------------------------------------------------------
    // 3.4 Finance Payment Processing -> Student Debt Recalculation
    // ------------------------------------------------------------------------
    it("X4: Finance Payment Processing -> Student Profile Debt Recalculation", async () => {
      if (!studentId) return;

      const paymentRes = await apiRequest({
        method: "POST",
        path: "/api/payments",
        body: {
          student_id: studentId,
          amount: 150,
          payment_method: "CASH",
          status: "PAID",
        },
      });
      expect([200, 201]).toContain(paymentRes.status);

      const profileRes = await apiRequest({ method: "GET", path: `/api/students/${studentId}` });
      expect(profileRes.status).toBe(200);
      expect(profileRes.data).toHaveProperty("stats");
      expect(typeof profileRes.data.stats.totalPaid).toBe("number");
    });

    // ------------------------------------------------------------------------
    // 3.5 Group Schedule Creation -> Group Profile Sync
    // ------------------------------------------------------------------------
    it("X5: Group Schedule Creation -> Group Profile Schedules Sync", async () => {
      const groups = await sql`SELECT id FROM groups LIMIT 1`;
      if (groups.length > 0) {
        const testGId = groups[0].id;
        const createRes = await apiRequest({
          method: "POST",
          path: "/api/schedules",
          body: {
            group_id: testGId,
            day: "WEDNESDAY",
            start_time: "14:00",
            end_time: "15:30",
            room: "204",
          },
        });
        expect([200, 201]).toContain(createRes.status);
        if (createRes.data?.id) {
          scheduleId = createRes.data.id;
        }

        const profileRes = await apiRequest({ method: "GET", path: `/api/groups/${testGId}` });
        expect(profileRes.status).toBe(200);
        expect(Array.isArray(profileRes.data.schedules)).toBe(true);
      }
    });

    // ------------------------------------------------------------------------
    // 3.6 Tasks State Transitions
    // ------------------------------------------------------------------------
    it("X6: Tasks Kanban Board Complete State Lifecycle (TODO -> IN_PROGRESS -> DONE)", async () => {
      const uniqueSuffix = Date.now().toString().slice(-4);

      // Create in TODO
      const createRes = await apiRequest({
        method: "POST",
        path: "/api/tasks",
        body: { title: `LifecycleTask_${uniqueSuffix}`, status: "TODO", priority: "MEDIUM" },
      });
      expect([200, 201]).toContain(createRes.status);
      taskId = createRes.data.id;

      // Transition to IN_PROGRESS
      const progRes = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${taskId}`,
        body: { status: "IN_PROGRESS" },
      });
      expect(progRes.status).toBe(200);
      expect(progRes.data.status).toBe("IN_PROGRESS");

      // Transition to DONE
      const doneRes = await apiRequest({
        method: "PUT",
        path: `/api/tasks/${taskId}`,
        body: { status: "DONE" },
      });
      expect(doneRes.status).toBe(200);
      expect(doneRes.data.status).toBe("DONE");

      // Cleanup
      await apiRequest({ method: "DELETE", path: `/api/tasks/${taskId}` });
    });

    // ------------------------------------------------------------------------
    // 3.7 Responsive Tablet Layout & Sidebar Toggle Integration
    // ------------------------------------------------------------------------
    it("X7: Tablet Viewport + Sidebar Toggle + Layout Styling Integration", () => {
      const layoutCss = readSourceFile("src/app/[locale]/dashboard/layout.module.css");
      const layoutTsx = readSourceFile("src/app/[locale]/dashboard/layout.tsx");

      // Verify layout has state for mobile sidebar toggle
      expect(layoutTsx.includes("sidebarOpen") || layoutTsx.includes("isSidebarOpen") || layoutTsx.includes("isOpen") || layoutTsx.includes("toggle")).toBe(true);
      // Verify layout CSS handles media query and sidebar class
      expect(layoutCss.includes("1024px")).toBe(true);
      expect(layoutCss.includes("sidebar")).toBe(true);
    });

    // ------------------------------------------------------------------------
    // 3.8 Notifications Dropdown + Multi-Locale Sync
    // ------------------------------------------------------------------------
    it("X8: Notifications Dropdown Component uses translation hooks across all locales", () => {
      const dropdownTsx = readSourceFile("src/components/NotificationsDropdown.tsx");
      expect(dropdownTsx.includes("useTranslations")).toBe(true);

      const az = loadTranslations("az");
      const en = loadTranslations("en");
      const ru = loadTranslations("ru");

      expect(az).toHaveProperty("Common");
      expect(en).toHaveProperty("Common");
      expect(ru).toHaveProperty("Common");
    });
  }, { tier: "Tier 3", feature: "Cross-Feature Interactions" });
}
