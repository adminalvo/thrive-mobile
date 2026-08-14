# E2E Test Infrastructure & Test Suite Specification: Thrive CRM

## 1. Overview & Test Philosophy
The Thrive CRM E2E Test Harness provides comprehensive, opaque-box, requirement-driven automated testing based directly on `ORIGINAL_REQUEST.md`. It executes standalone via TypeScript with zero external browser dependencies, supporting direct Next.js 15 route execution, live PostgreSQL database assertions via Supabase pooler, CSS rule/media query AST analysis, multi-locale translation integrity audits, and pure dynamic SSR enforcement.

---

## 2. Requirement Mapping Matrix

| Requirement | Description | Test Tiers | Target Components / Files |
|-------------|-------------|:----------:|---------------------------|
| **R1: Loading States** | Add `loading.tsx` to all 8 dashboard sub-routes (`students`, `teachers`, `parents`, `groups`, `leads`, `finance`, `tasks`, `schedule`) with translated loading skeleton/spinner. | Tier 1 (F8.1-F8.8), Tier 2 (B8.4), Tier 4 (Scenario 7) | `src/app/[locale]/dashboard/*/loading.tsx` |
| **R2: iPad/Tablet Responsiveness** | Responsive CSS rules (768px - 1024px): sidebar collapse/hide `< 1024px`, table `overflow-x: auto`, Kanban tablet layout fitting, modal expansion up to 90% width. | Tier 1 (F9.1-F9.5), Tier 2 (B8.1-B8.5), Tier 3 (X7), Tier 4 (Scenario 6) | `layout.module.css`, `*page.module.css`, `*Modal.module.css` |
| **R3: i18n Completeness** | Translation completeness across `az`, `en`, `ru`; zero hardcoded English in `NotificationsDropdown.tsx`; table empty states (`Common.empty`); loading states (`Common.loading`). | Tier 1 (F10.1-F10.5), Tier 2 (B9.1-B9.2), Tier 3 (X8), Tier 4 (Scenario 5) | `messages/*.json`, `NotificationsDropdown.tsx`, dashboard table components |
| **R4: Pure Dynamic SSR** | Explicitly add `export const dynamic = "force-dynamic";` and completely remove `generateStaticParams` from `src/app/[locale]/layout.tsx`. | Tier 1 (F11.1-F11.4), Tier 2 (B9.3-B9.5), Tier 4 (Scenario 7), Tier 5 (ADV1.2) | `src/app/[locale]/layout.tsx` |
| **Core CRM Features** | Dynamic profiles (Student, Teacher, Group), Tasks Kanban CRUD, Finance Invoices & Payments, Group Schedules, Global Search, NextAuth credentials. | Tier 1 (F1-F7), Tier 2 (B1-B7), Tier 3 (X1-X6), Tier 4 (Scenario 1-4), Tier 5 (ADV2-ADV8) | `/api/*`, database schema, search engine |

---

## 3. Test Architecture & Directory Layout

```
tests/e2e/
├── bootstrap.ts                   # Environment setup, .env loader & Node require hooks for CSS
├── runner.ts                      # Standalone assertion library, route dispatcher, DB client, CSS parser
├── run_all.ts                     # Master test suite runner & CLI entry point
├── tier1_feature_coverage.test.ts # Tier 1: Isolated Happy-Path Feature Coverage (58 tests)
├── tier2_boundary_corner.test.ts  # Tier 2: Boundary Value Analysis & Edge Conditions (45 tests)
├── tier3_cross_feature.test.ts    # Tier 3: Pairwise & Relational Cross-Feature Workflows (12 tests)
├── tier4_real_world.test.ts       # Tier 4: Real-World End-to-End Operational Scenarios (7 tests)
└── tier5_adversarial.test.ts      # Tier 5: Adversarial Hardening, Routing & Security (14 tests)
```

---

## 4. Test Tier Breakdown & Counts

| Tier | Category | Description | Total Tests |
|:---:|---|---|:---:|
| **Tier 1** | **Feature Coverage** | Isolated happy-path coverage across all core modules and Requirements R1, R2, R3, R4 | **58** |
| **Tier 2** | **Boundary & Corner Cases** | Null/empty inputs, non-existent UUIDs, malformed IDs, precision boundaries, zero-division protection, extreme viewports | **45** |
| **Tier 3** | **Cross-Feature Interactions** | Search -> Profile sync, Payment -> Balance recalculation, Schedule sync, Task transitions, Responsive layout toggle | **12** |
| **Tier 4** | **Real-World Scenarios** | Complete operational workflows: Onboarding, Billing lifecycle, Scheduling, Omnichannel search, i18n audit, Tablet viewport audit, Dynamic SSR transition simulation | **7** |
| **Tier 5** | **Adversarial Hardening** | Negative error handling, open-redirect defense, SQL injection protection, static parameter purge verification | **14** |
| **Total** | | **Comprehensive Multi-Tier Suite** | **136** |

---

## 5. Execution Commands

### 1. Execute Full E2E Test Suite
```bash
npx tsx tests/e2e/run_all.ts
```
or via npm script:
```bash
npm test
```

### 2. TypeScript Compilation Check
```bash
npx tsc --noEmit
```

### 3. Production Build Verification
```bash
npm run build
```

---

## 6. Pass/Fail Criteria
- **Pass (Exit Code 0)**: All test cases across registered suites execute with passing assertions.
- **Fail (Exit Code 1)**: Any assertion failure or unexpected exception will print the suite name, test name, failure diff, and stack trace, terminating the runner with exit code 1.
