# Dispatch: Forensic Auditor — Integrity Verification

Original Request: c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\ORIGINAL_REQUEST.md
Project Plan: c:\Users\mexty\OneDrive\Desktop\thrive-crm\PROJECT.md

## Scope & Instructions
Perform forensic integrity verification on all code written across the codebase:
1. Static analysis of SQL queries in `src/app/api/`: verify genuine queries using `sql` from `@/lib/db`, parameterized inputs, no cheating, no hardcoded mock returns, no dummy facades.
2. Verify UI implementations in `src/app/[locale]/dashboard/`: ensure real interactive forms, genuine state management, modals, and API calls, not fake static placeholders.
3. Verify test suite in `tests/e2e/`: ensure real assertions and genuine verification tests, not `expect(true).toBe(true)` or bypassed checks.
4. Formulate your binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
5. Write report to `c:\Users\mexty\OneDrive\Desktop\thrive-crm\.agents\auditor_1\handoff.md`.
