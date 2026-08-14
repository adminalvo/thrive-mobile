# Specification Mining Report: R6 Login 404 Error Fix & Routing Behavior

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Routing & i18n | Default Locale Login (`/login`) | Direct access to login page without locale prefix renders default English locale | `GET /login` HTTP request | HTTP 200 OK HTML response, `x-next-intl-locale: en` header, English UI from `messages/en.json` | 404 Not Found if `localePrefix: 'as-needed'` is missing in `routing.ts` | `ORIGINAL_REQUEST.md` § R6, `PROJECT.md` § 5, `src/i18n/routing.ts` |
| 2 | Routing & i18n | Azerbaijani Locale Login (`/az/login`) | Localized login route serving Azerbaijani translations | `GET /az/login` HTTP request | HTTP 200 OK HTML response, `x-next-intl-locale: az` header, Azerbaijani UI from `messages/az.json` | 404 if locale routing not handled | `ORIGINAL_REQUEST.md` § R6, `PROJECT.md` § 5, `src/app/[locale]/login/page.tsx` |
| 3 | Routing & i18n | Russian Locale Login (`/ru/login`) | Localized login route serving Russian translations | `GET /ru/login` HTTP request | HTTP 200 OK HTML response, `x-next-intl-locale: ru` header, Russian UI from `messages/ru.json` | 404 if locale routing not handled | `PROJECT.md` § 5, `messages/ru.json` |
| 4 | Routing & i18n | Explicit Default Locale Canonical Redirect (`/en/login`) | Clean redirection from explicit default locale prefix `/en` to unprefixed canonical route `/login` under `as-needed` mode | `GET /en/login` HTTP request | HTTP 307/308 Redirect to `/login` | N/A | `node_modules/next-intl/dist/esm/middleware/middleware.js`, `next-intl` specification |
| 5 | Authentication & Routing | NextAuth Unauthenticated Redirection | Protected dashboard routes redirect unauthenticated users to `/login` | `GET /dashboard`, `GET /az/dashboard`, `GET /ru/dashboard` (no session cookie) | HTTP 307/302 Redirect to `/login?callbackUrl=...` | 404 if `/login` is not routeable | `src/middleware.ts` lines 8-27 |
| 6 | Authentication & Routing | NextAuth SignOut Redirection | User signout redirects to `/login` | Click Logout button in sidebar (`signOut({ callbackUrl: '/login' })`) | Navigation to `/login` returning HTTP 200 OK | 404 if `/login` route is broken | `src/app/[locale]/dashboard/layout.tsx` line 109 |
| 7 | Localization | Auth Translation Namespace Parity | `Auth` namespace translation keys in `en.json`, `az.json`, and `ru.json` | Translation lookup via `useTranslations("Auth")` | Form titles, labels, placeholders, buttons, and error messages | Missing key fallback or runtime warning | `messages/en.json`, `messages/az.json`, `messages/ru.json` |
| 8 | Middleware Exclusion | API and Static File Bypass | Static assets and API routes bypass internationalization and auth middleware | Requests to `/api/*`, `/_next/*`, `/_vercel/*`, `favicon.ico` | Direct execution / static file delivery | Unintended redirect/rewrite if regex matcher is misconfigured | `src/middleware.ts` lines 32-37 |

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Non-existent Locale | `GET /fr/login` or `GET /de/login` | Locale is not in `['en', 'az', 'ru']`. Next.js layout `LocaleLayout` checks `routing.locales.includes(locale)` and triggers `notFound()`, returning 404. |
| 2 | Callback URL Query Params | `GET /login?callbackUrl=%2Fdashboard` | Middleware rewrites to internal path preserving query parameters; user sees login form; on submit, client redirects to callbackUrl. |
| 3 | Trailing Slash Handling | `GET /login/` or `GET /az/login/` | Normalized by Next.js / next-intl middleware to standard route `/login` or `/az/login`. |
| 4 | Root Landing Page Routing | `GET /` vs `GET /en` vs `GET /az` | `GET /` serves English landing page (200 OK); `GET /en` redirects to `/`; `GET /az` serves Azerbaijani landing page (200 OK). |
| 5 | Auth State Persistence | `GET /login` while authenticated | Login page loads; client or middleware can optionally redirect authenticated user to `/dashboard`. |

---

## 1. Observation
1. **`ORIGINAL_REQUEST.md` (Lines 38-40, 51)**:
   - "### R6. Login 404 Error Fix: Investigate and resolve the 404 error on the `/login` page caused by `next-intl` and `middleware.ts` routing mismatches. Ensure `http://localhost:3000/login` properly routes to the login page without a 404."
   - Acceptance criteria: "Navigating to `/login` or `/az/login` successfully returns a 200 OK HTML response, not a 404."
2. **`PROJECT.md` (Lines 19, 54-59)**:
   - "R6: Login 404 Error Fix: Update `next-intl` routing configuration (`localePrefix: 'as-needed'`) & middleware to support `/login` and `/az/login` returning 200 OK"
   - Section 5 Routing Contract:
     - `defineRouting({ locales: ['en', 'az', 'ru'], defaultLocale: 'en', localePrefix: 'as-needed' })`
     - `GET /login` -> HTTP 200 OK (serves English login page)
     - `GET /az/login` -> HTTP 200 OK (serves Azerbaijani login page)
     - `GET /ru/login` -> HTTP 200 OK (serves Russian login page)
3. **`src/i18n/routing.ts` (Lines 4-7)**:
   ```typescript
   export const routing = defineRouting({
     locales: ['en', 'az', 'ru'],
     defaultLocale: 'en'
   });
   ```
   Notice that `localePrefix` is omitted. In `next-intl` v3.26.3, `localePrefix` defaults to `'always'`.
4. **`src/middleware.ts` (Lines 6-30, 36)**:
   - `intlMiddleware = createMiddleware(routing)`
   - `authMiddleware = withAuth(..., { pages: { signIn: '/login' } })`
   - `isProtectedRoute = req.nextUrl.pathname.includes('/dashboard')`
   - Routes not including `/dashboard` are passed directly to `intlMiddleware(req)`.
   - `matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']`
5. **`src/app/[locale]/layout.tsx` (Lines 26-36)**:
   - `LocaleLayout` checks: `if (!routing.locales.includes(locale as any)) { notFound(); }`
   - Valid locales are `['en', 'az', 'ru']`.
6. **`src/app/[locale]/login/page.tsx`**:
   - Contains the client-rendered Login form with translations bound to the `"Auth"` namespace.
7. **Translation Files (`messages/en.json`, `messages/az.json`, `messages/ru.json`)**:
   - All three files define full `"Auth"` namespace dictionaries (`title`, `emailLabel`, `emailPlaceholder`, `passwordLabel`, `passwordPlaceholder`, `loginBtn`, `loading`, `forgotPassword`, `contactAdmin`, `backHome`).

## 2. Logic Chain
1. By default, `next-intl`'s `defineRouting` sets `localePrefix: 'always'`. Under this mode, all routes require a leading locale prefix (e.g. `/en/login`, `/az/login`, `/ru/login`).
2. When a client requests `GET /login` (without a prefix), `intlMiddleware` running with `localePrefix: 'always'` does not rewrite `/login` to `/[locale]/login` as a default route; instead, it attempts to redirect to `/${locale}/login` or fails route resolution, causing a 404 in Next.js App Router where only `src/app/[locale]/...` dynamic segments exist.
3. NextAuth (`src/middleware.ts`) defines `signIn: '/login'`, and the application UI (`src/app/[locale]/dashboard/layout.tsx`) initiates logout to `callbackUrl: '/login'`.
4. By updating `src/i18n/routing.ts` to specify `localePrefix: 'as-needed'`, `intlMiddleware` is instructed to:
   - For `GET /login`: treat unprefixed paths as the default locale (`'en'`), perform an internal rewrite to `/[locale]/login` (`locale = 'en'`), set `x-next-intl-locale: en`, and return **HTTP 200 OK** HTML response without changing the browser URL.
   - For `GET /az/login`: recognize prefix `/az`, perform internal rewrite to `/[locale]/login` (`locale = 'az'`), set `x-next-intl-locale: az`, and return **HTTP 200 OK** HTML response with Azerbaijani translations.
   - For `GET /ru/login`: recognize prefix `/ru`, perform internal rewrite to `/[locale]/login` (`locale = 'ru'`), set `x-next-intl-locale: ru`, and return **HTTP 200 OK** HTML response with Russian translations.
   - For `GET /en/login`: recognize redundant default locale prefix `/en` under `as-needed` mode, and issue a clean HTTP redirect (307/308) to `/login`.
5. The middleware matcher correctly ignores `/api/*`, `/_next/*`, `/_vercel/*`, and dot-containing static files, preventing middleware interference with API requests or static assets.

## 3. Caveats
- No caveats regarding specification requirements. The required behavior is explicitly defined in `ORIGINAL_REQUEST.md` and `PROJECT.md`.
- Note on implementation: Modifying `src/i18n/routing.ts` to add `localePrefix: 'as-needed'` is self-contained and does not require changes to existing translation JSONs or UI layout structures.

## 4. Conclusion
The specification for R6 requires configuring `src/i18n/routing.ts` with `localePrefix: 'as-needed'`. This ensures:
- `GET /login` returns **HTTP 200 OK** serving English.
- `GET /en/login` redirects cleanly to `/login`.
- `GET /az/login` returns **HTTP 200 OK** serving Azerbaijani.
- `GET /ru/login` returns **HTTP 200 OK** serving Russian.
- NextAuth redirects to `/login` resolve to a valid 200 OK login page instead of a 404 error.

## 5. Verification Method
1. **Inspection of `src/i18n/routing.ts`**:
   Verify `routing` is exported with `localePrefix: 'as-needed'`:
   ```typescript
   export const routing = defineRouting({
     locales: ['en', 'az', 'ru'],
     defaultLocale: 'en',
     localePrefix: 'as-needed'
   });
   ```
2. **Typecheck & Build**:
   - `npx tsc --noEmit` exits with status 0.
   - `npm run build` exits with status 0.
3. **E2E Test Execution**:
   - `npx tsx tests/e2e/run_all.ts` passes 100%.
   - Invalidation condition: Any request to `http://localhost:3000/login` returning HTTP 404 or any build failure in `next-intl` routing.
