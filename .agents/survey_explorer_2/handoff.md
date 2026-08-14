# Handoff Report: Requirement 2 (iPad/Tablet Responsiveness 768px - 1024px)

## 1. Observation
1. **Dashboard Layout & Sidebar**:
   - `src/app/[locale]/dashboard/layout.tsx:71-75`:
     ```tsx
     <motion.aside 
       className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
       initial={false}
       animate={{ x: sidebarOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0) }}
     >
     ```
     During SSR (`typeof window === 'undefined'`), `x: 0` is set inline, causing hydration flash. Inline `transform` overrides CSS media queries (`@media (max-width: 1024px)`).
   - `src/app/[locale]/dashboard/layout.module.css:290-334`: Defines `@media (max-width: 1024px)` with fixed sidebar, mobile hamburger `.menuBtn` and close button `.closeBtn`, but `.pageContent` retains 2rem (32px) padding and header retains 2rem padding.

2. **Data Tables & Overflow Handling**:
   - All 15 data tables and sub-tables across `students`, `groups`, `parents`, `finance`, `dashboard overview`, `studentProfile`, `teacherProfile`, `groupProfile`, and `ContractModal` have table wrappers (`.tableContainer` / `.tableResponsive` / `.scrollArea`) with `overflow-x: auto`.
   - However, the inner `.table` CSS classes across all CSS modules lack `min-width` rules (e.g. `width: 100%` only), causing cells and action buttons to squash on 768px screens rather than activating horizontal scroll.

3. **Kanban Boards (Tasks & Leads)**:
   - `src/app/[locale]/dashboard/tasks/page.module.css:48-76` & `src/app/[locale]/dashboard/leads/page.module.css:84-113`:
     `.kanbanBoard` has `overflow-x: auto;` and `.column` has `min-width: 300px; max-width: 300px;`.
     4 columns (Tasks = 1272px) and 5 columns (Leads = 1596px) exceed tablet screen widths. Horizontal scroll operates, but column widths and board gaps need tablet scaling (`min-width: 270px`, `gap: 1rem`).

4. **Modal Dialogs**:
   - All modals across `students/page.module.css:284-293`, `finance/page.module.css:276-286`, `leads/page.module.css:245-254`, `tasks/page.module.css:285-295`, `teachers/page.module.css:157-164`, `schedule/page.module.css:191-200`, `studentProfile.module.css:401-410`, `teacherProfile.module.css:332-341`, `groupProfile.module.css:377-386`, and `ContractModal.module.css:13-25` lack responsive width rules (`width: 90%`) and lack `max-height: 90vh; overflow-y: auto;`.
   - Form grids (`.formGrid`, `.rowInputs`) use `grid-template-columns: 1fr 1fr;` with no media queries to collapse to 1 column on tablet screens.

---

## 2. Logic Chain
- **Step 1**: From observation 1, the inline `animate` prop on `layout.tsx` causes hydration and resize desynchronization on iPad/tablet viewports (< 1024px). Removing inline motion transforms and relying on CSS classes with transition ensures clean SSR and responsive drawer collapsing at `< 1024px`.
- **Step 2**: From observation 2, table wrappers having `overflow-x: auto` is necessary but not sufficient. Without `min-width: 650px` – `750px` on `.table`, browsers shrink table columns and wrap cell text excessively before scrolling. Adding explicit `min-width` to `.table` forces the wrapper's `overflow-x: auto` to activate reliably.
- **Step 3**: From observation 3, Kanban boards support horizontal scrolling, but adjusting column widths (`270px`) and board gaps (`1rem`) on `@media (max-width: 1024px)` optimizes card readability on iPad 768px/834px/1024px.
- **Step 4**: From observation 4, standardizing all modals to `width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;` satisfies the requirement *"Modals should expand up to 90% width on smaller screens"*, prevents clipping of form action buttons, and wrapping `.formGrid`/`.rowInputs` to `1fr` on tablet portrait prevents squeezed input fields.

---

## 3. Caveats
- Global layout breakpoints are set at `1024px` for sidebar collapsing and `768px` for form stacking. These align with standard iPad Portrait (768px / 834px) and iPad Landscape (1024px).
- In `GlobalSearch.module.css`, `@media (max-width: 1024px)` is already implemented (`max-width: 260px;`). No changes needed for GlobalSearch.
- No modifications were made to source code during this survey (read-only investigation).

---

## 4. Conclusion
Requirement 2 can be fully achieved by targeted updates to 8 CSS modules and 1 TSX layout file:
1. `src/app/[locale]/dashboard/layout.tsx`: Remove inline `animate={{ x: ... }}` from `<motion.aside>` or convert to `<aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>`.
2. `src/app/[locale]/dashboard/layout.module.css`: Refine `@media (max-width: 1024px)` padding and transitions.
3. `src/app/[locale]/dashboard/students/page.module.css`: Add `min-width: 650px` to `.table`, `width: 90%` + `max-height: 90vh` to `.modal`, and single-column collapse on `.formGrid`.
4. `src/app/[locale]/dashboard/finance/page.module.css`: Add `min-width: 750px` to `.table`, responsive grid to `.statsRow`, `width: 90%` to `.modal`.
5. `src/app/[locale]/dashboard/leads/page.module.css`: Add tablet media query for `.kanbanBoard` (`gap: 1rem;`) and `.column` (`min-width: 270px;`), `width: 90%` to `.modal`.
6. `src/app/[locale]/dashboard/tasks/page.module.css`: Add tablet media query for `.kanbanBoard` / `.column`, `width: 90%` to `.modal`, and `.rowInputs` stacking.
7. `src/app/[locale]/dashboard/teachers/page.module.css` & `schedule/page.module.css`: Add `width: 90%` to modals, single column input grids.
8. Detail profile modules (`studentProfile.module.css`, `teacherProfile.module.css`, `groupProfile.module.css`, `ContractModal.module.css`): Add `min-width: 550px` to `.table`, `width: 90%` to `.modal`.

---

## 5. Verification Method
1. **TypeScript & Build Check**:
   - `npx tsc --noEmit`
   - `npm run build`
2. **Browser / Tablet Viewport Verification**:
   - Viewport 1024x768 (iPad Landscape):
     - Sidebar collapsed by default with hamburger menu visible in header.
     - Clicking hamburger menu slides in sidebar with backdrop blur overlay.
     - Clicking backdrop or close button dismisses sidebar.
   - Viewport 768x1024 (iPad Portrait):
     - Data tables (`/dashboard/students`, `/dashboard/finance`, `/dashboard/groups`) scroll horizontally with smooth momentum without squashing text.
     - Kanban boards (`/dashboard/tasks`, `/dashboard/leads`) scroll horizontally smoothly.
     - Modals (e.g. New Student, New Task, Pay Invoice) open centered at 90% screen width, with stacked form inputs and fully visible submit buttons.
