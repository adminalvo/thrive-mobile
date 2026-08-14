# Handoff Report: NextAuth & Middleware Interaction (Milestone 3 / R6)

## 1. Observation

Direct observations from codebase inspection across `src/lib/authOptions.ts`, `src/middleware.ts`, `src/i18n/routing.ts`, `src/app/[locale]/login/page.tsx`, and `src/app/[locale]/dashboard/layout.tsx`:

### Observation 1.1: NextAuth Configuration in `src/lib/authOptions.ts`
- **File path**: `src/lib/authOptions.ts`
- **Lines 77–79**:
  ```ts
  pages: {
    signIn: "/az/login", // Redirect to login page in generic locale
  },
  ```
- **Line 81**: `session: { strategy: "jwt" }`
- **Lines 14–59**: CredentialsProvider queries `auth.users` join `public.user_profiles` on `emailLower`, validates passwords via `bcrypt.compare` against `encrypted_password` with dev bypass fallbacks, returning `{ id, email, name, role }`.
- **Lines 61–75**: `jwt` callback attaches `role` and `id`; `session` callback populates `session.user.role` and `session.user.id`.

### Observation 1.2: Middleware Route Protection in `src/middleware.ts`
- **File path**: `src/middleware.ts`
- **Lines 1–38**:
  ```ts
  import createMiddleware from 'next-intl/middleware';
  import { withAuth } from 'next-auth/middleware';
  import { NextRequest } from 'next/server';
  import { routing } from './i18n/routing';

  const intlMiddleware = createMiddleware(routing);

  const authMiddleware = withAuth(
    function onSuccess(req) {
      return intlMiddleware(req);
    },
    {
      callbacks: {
        authorized: ({ token }) => token != null
      },
      pages: {
        signIn: '/login'
      }
    }
  );

  export default function middleware(req: NextRequest) {
    const isProtectedRoute = req.nextUrl.pathname.includes('/dashboard');

    if (isProtectedRoute) {
      return (authMiddleware as any)(req);
    }

    return intlMiddleware(req);
  }

  export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
  };
  ```
- **Line 17**: `pages.signIn` in `middleware.ts` is set to `'/login'`.
- **Line 23**: Protection predicate is `req.nextUrl.pathname.includes('/dashboard')`.

### Observation 1.3: Routing Configuration in `src/i18n/routing.ts`
- **File path**: `src/i18n/routing.ts`
- **Lines 1–11**:
  ```ts
  import {defineRouting} from 'next-intl/routing';
  import {createNavigation} from 'next-intl/navigation';

  export const routing = defineRouting({
    locales: ['en', 'az', 'ru'],
    defaultLocale: 'en'
  });

  export const {Link, redirect, usePathname, useRouter, getPathname} =
    createNavigation(routing);
  ```
- **Missing Property**: `localePrefix` is omitted, causing `defineRouting` to default to `localePrefix: 'always'`.

### Observation 1.4: Client-side Navigation in `src/app/[locale]/login/page.tsx`
- **File path**: `src/app/[locale]/login/page.tsx`
- **Lines 9–10 & 37**:
  ```tsx
  import { useParams, useRouter } from "next/navigation";
  ...
  router.push(`/${locale}/dashboard`);
  ```
- `useRouter` is imported from `next/navigation` rather than `@/i18n/routing`, manually concatenating `/${locale}/dashboard`.

---

## 2. Logic Chain

### Step 2.1: Root Cause of Login 404 and Routing Mismatches
1. Under Next.js App Router, all pages reside within `src/app/[locale]/...` (`[locale]/login/page.tsx`, `[locale]/dashboard/...`, etc.). There is no root `src/app/login/page.tsx`.
2. When `src/i18n/routing.ts` does not specify `localePrefix`, `next-intl` defaults to `localePrefix: 'always'`.
3. In `always` mode, `next-intl` expects all URLs to have an explicit locale prefix (e.g. `/en/login`, `/az/login`, `/ru/login`). When a client requests `http://localhost:3000/login`, `next-intl` cannot directly serve the default locale without a prefix, leading to 404 or unexpected redirects.
4. Setting `localePrefix: 'as-needed'` in `defineRouting` instructs `next-intl` to treat the default locale (`'en'`) without a prefix. Consequently, `/login` is internally rewritten to `/[locale]/login` with `locale = 'en'`, returning `200 OK` HTML. Explicit locale prefixes like `/az/login` and `/ru/login` continue to be rewritten to their respective locales, also returning `200 OK` HTML.

### Step 2.2: Interaction Between NextAuth, `withAuth`, and `next-intl`
1. When an unauthenticated user attempts to access any dashboard path (e.g., `/dashboard`, `/dashboard/leads`, `/az/dashboard`, `/ru/dashboard`):
   - `req.nextUrl.pathname.includes('/dashboard')` evaluates to `true`.
   - `authMiddleware` executes.
   - `callbacks.authorized` checks `token != null` (which evaluates to `false`).
   - `withAuth` intercepts the request and issues a `307 Temporary Redirect` to `/login?callbackUrl=<encoded_target_path>`.
   - The user's browser follows the redirect to `/login`.
   - On the redirected request to `/login`, `isProtectedRoute` evaluates to `false`.
   - `middleware` invokes `intlMiddleware(req)`.
   - With `localePrefix: 'as-needed'`, `intlMiddleware` renders the English login page with status `200 OK`.
2. When an authenticated user accesses a dashboard path:
   - `isProtectedRoute` evaluates to `true`.
   - `authMiddleware` executes and `callbacks.authorized` evaluates to `true`.
   - `withAuth` invokes `onSuccess(req)` which calls `intlMiddleware(req)`.
   - `intlMiddleware` resolves the active locale and passes the request to the Next.js page handler, returning `200 OK`.

### Step 2.3: Inconsistency in `authOptions.ts` `pages.signIn`
1. `src/lib/authOptions.ts` has `pages: { signIn: "/az/login" }` (line 78), whereas `src/middleware.ts` has `pages: { signIn: '/login' }` (line 17).
2. While `middleware.ts` handles edge route redirects, server-side NextAuth flows (e.g. NextAuth API route redirects, `signIn()` redirects) use `authOptions.pages.signIn`.
3. Having `/az/login` hardcoded in `authOptions.ts` forces an Azerbaijani locale redirect for NextAuth internal redirects even if the user started from an English route.
4. Aligning `authOptions.ts` `pages.signIn` to `"/login"` unifies both server-side NextAuth and middleware route protection.

---

## 3. Caveats

1. **Locale Canonical Redirects**: With `localePrefix: 'as-needed'`, visiting `/en/login` or `/en/dashboard` will produce a `307/308 Redirect` to `/login` or `/dashboard` respectively. This is standard and expected behavior for `as-needed` prefixing in `next-intl`.
2. **Client-side Router in Login Page**: In `src/app/[locale]/login/page.tsx`, switching from `next/navigation`'s `useRouter` to `@/i18n/routing`'s `useRouter` and calling `router.push('/dashboard')` automatically maps to the correct localized path (`/dashboard` for `en`, `/az/dashboard` for `az`, `/ru/dashboard` for `ru`).
3. **No Direct Code Changes Applied**: As an explorer, no modifications have been made to source code. The exact changes are provided below for the implementer agent.

---

## 4. Conclusion & Concrete Fix Recommendations

### Request & Response Matrix Verification

| Route | Auth Status | Expected Behavior | Status Code |
|---|---|---|---|
| `GET /login` | Unauthenticated / Authenticated | Serves English Login Page | `200 OK` |
| `GET /az/login` | Unauthenticated / Authenticated | Serves Azerbaijani Login Page | `200 OK` |
| `GET /ru/login` | Unauthenticated / Authenticated | Serves Russian Login Page | `200 OK` |
| `GET /en/login` | Any | Redirects to canonical `/login` | `307/308 Redirect` |
| `GET /dashboard` | Unauthenticated | Redirects to `/login?callbackUrl=%2Fdashboard` | `307 Redirect` |
| `GET /dashboard` | Authenticated | Serves English Dashboard | `200 OK` |
| `GET /az/dashboard` | Unauthenticated | Redirects to `/login?callbackUrl=%2Faz%2Fdashboard` | `307 Redirect` |
| `GET /az/dashboard` | Authenticated | Serves Azerbaijani Dashboard | `200 OK` |
| `GET /ru/dashboard` | Unauthenticated | Redirects to `/login?callbackUrl=%2Fru%2Fdashboard` | `307 Redirect` |
| `GET /ru/dashboard` | Authenticated | Serves Russian Dashboard | `200 OK` |

### Recommended Changes for Implementer

#### Change 1: `src/i18n/routing.ts`
Add `localePrefix: 'as-needed'` to `defineRouting`:
```typescript
// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'az', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

#### Change 2: `src/lib/authOptions.ts`
Update `pages.signIn` to `"/login"` (line 78):
```typescript
// src/lib/authOptions.ts (lines 77-79)
  pages: {
    signIn: "/login",
  },
```

#### Change 3 (Recommended cleanup): `src/app/[locale]/login/page.tsx`
Use `useRouter` from `@/i18n/routing`:
```typescript
// src/app/[locale]/login/page.tsx
import { Link, useRouter } from "@/i18n/routing";
...
// Inside handleLogin:
router.push("/dashboard");
```

---

## 5. Verification Method

To verify these changes independently:

1. **Typecheck and Build**:
   - Run `npx tsc --noEmit` -> Must complete with 0 errors.
   - Run `npm run build` -> Must succeed and compile all static/dynamic routes (`/[locale]`, `/[locale]/login`, `/[locale]/dashboard`, etc.).

2. **HTTP Route Verification**:
   - `curl -I http://localhost:3000/login` -> Returns `HTTP/1.1 200 OK` (English login page).
   - `curl -I http://localhost:3000/az/login` -> Returns `HTTP/1.1 200 OK` (Azerbaijani login page).
   - `curl -I http://localhost:3000/ru/login` -> Returns `HTTP/1.1 200 OK` (Russian login page).
   - `curl -I http://localhost:3000/dashboard` (no session cookie) -> Returns `HTTP/1.1 307 Temporary Redirect` with `Location: /login?callbackUrl=%2Fdashboard`.
   - `curl -I http://localhost:3000/az/dashboard` (no session cookie) -> Returns `HTTP/1.1 307 Temporary Redirect` with `Location: /login?callbackUrl=%2Faz%2Fdashboard`.

3. **E2E Test Suite**:
   - Run `npx tsx tests/e2e/run_all.ts` -> All suites must pass with 0 failures.
