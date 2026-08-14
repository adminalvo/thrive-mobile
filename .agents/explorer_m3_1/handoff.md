# Milestone 3 Investigation Report: R6 Login 404 Error Fix & Routing/Middleware

## 1. Observation

### 1.1 Directory Structure & File Hierarchy
- In `src/app/`, all page routes are strictly nested under the dynamic route segment `[locale]` (`src/app/[locale]/`):
  - `src/app/[locale]/page.tsx`
  - `src/app/[locale]/login/page.tsx`
  - `src/app/[locale]/layout.tsx`
  - `src/app/[locale]/not-found.tsx`
  - `src/app/[locale]/dashboard/...`
- There is **no** root-level `src/app/login/page.tsx` or `src/app/page.tsx`.

### 1.2 `src/i18n/routing.ts` (Lines 1–11)
```typescript
import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'az', 'ru'],
  defaultLocale: 'en'
});

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```
- In `next-intl` (version `^3.26.3` in `package.json`), `defineRouting` sets `localePrefix` to `'always'` by default when omitted.
- Under `localePrefix: 'always'`, every request path must include a locale prefix (`/en`, `/az`, `/ru`).

### 1.3 `src/middleware.ts` (Lines 1–38)
```typescript
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
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```
- `middleware.ts` delegates non-dashboard requests directly to `intlMiddleware(req)`.
- For dashboard requests (`isProtectedRoute`), `withAuth` verifies `token != null` and on unauthenticated requests redirects to `pages.signIn: '/login'`.

### 1.4 `src/lib/authOptions.ts` (Line 78)
```typescript
77:   pages: {
78:     signIn: "/az/login", // Redirect to login page in generic locale
79:   },
```
- In `src/lib/authOptions.ts:78`, `pages.signIn` is set to `"/az/login"`, whereas in `src/middleware.ts:17`, `pages.signIn` is set to `"/login"`.

### 1.5 `src/app/[locale]/login/page.tsx` (Lines 6–15, 37)
```typescript
6: import { Link } from "@/i18n/routing";
...
9: import { useParams, useRouter } from "next/navigation";
...
14: const locale = useParams().locale as string;
15: const router = useRouter();
...
37: router.push(`/${locale}/dashboard`);
```
- `useRouter` is imported from `"next/navigation"` instead of `"@/i18n/routing"`.
- All other pages (e.g. `src/app/[locale]/page.tsx:7`, `src/app/[locale]/dashboard/layout.tsx:23`) import `useRouter` from `"@/i18n/routing"`.
- `router.push(`/${locale}/dashboard`)` constructs `/en/dashboard` when `locale === 'en'`, which causes an extra redirect when `localePrefix: 'as-needed'` is enabled.

---

## 2. Logic Chain

1. **Why `/login` results in 404 or redirect mismatch**:
   - Because all pages are located under `src/app/[locale]/`, Next.js depends on `intlMiddleware` to map incoming URLs to `[locale]`.
   - With `src/i18n/routing.ts` using the default `localePrefix: 'always'`, any request to `/login` (without a locale prefix) is treated by `intlMiddleware` as an unprefixed request.
   - `intlMiddleware` issues an HTTP `307 Temporary Redirect` to `/en/login`.
   - When a client or automated test queries `http://localhost:3000/login` expecting a direct `200 OK` HTML document, receiving a redirect or attempting direct file lookup fails with a 404.
   - Furthermore, `authOptions.ts:78` hardcodes `signIn: "/az/login"`, conflicting with `middleware.ts:17` (`signIn: '/login'`).

2. **Resolution Mechanism with `localePrefix: 'as-needed'`**:
   - When `localePrefix: 'as-needed'` is added to `defineRouting`:
     - The default locale (`en`) is served without a URL prefix (`/`, `/login`, `/dashboard`).
     - Requests to `http://localhost:3000/login` are internally rewritten by `intlMiddleware` to `src/app/[locale]/login/page.tsx` with `{ locale: 'en' }`, returning HTTP `200 OK` HTML directly without redirection.
     - Requests to `http://localhost:3000/az/login` match the `az` prefix and return HTTP `200 OK` HTML with Azerbaijani translations.
     - Requests to `http://localhost:3000/ru/login` match the `ru` prefix and return HTTP `200 OK` HTML with Russian translations.
     - Requests to `http://localhost:3000/en/login` are cleanly redirected (307) to canonical `/login`.

3. **Routing Alignment across Auth & Client Components**:
   - Updating `src/lib/authOptions.ts` `pages.signIn` to `"/login"` harmonizes with `src/middleware.ts:17`.
   - Updating `src/app/[locale]/login/page.tsx` to import `useRouter` from `"@/i18n/routing"` and use `router.push("/dashboard")` ensures automatic locale prefix handling for all 3 locales without manual string interpolation.

---

## 3. Caveats

- `next-intl`'s `localePrefix: 'as-needed'` canonicalizes default locale URLs: visiting `/en/login` will issue a 307 redirect to `/login`, while `/login`, `/az/login`, and `/ru/login` directly return `200 OK`. This is standard, expected behavior.
- `src/middleware.ts` matcher `['/((?!api|_next|_vercel|.*\\..*).*)']` properly excludes `/api/*` routes, preventing `intlMiddleware` from interfering with API endpoints.

---

## 4. Conclusion & Actionable Recommendations

### Recommendation 1: Update `src/i18n/routing.ts`
Add `localePrefix: 'as-needed'` to `defineRouting`.

**Proposed Change:**
```typescript
// File: src/i18n/routing.ts
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

### Recommendation 2: Verify `src/middleware.ts`
`src/middleware.ts` is already correctly configured to delegate to `intlMiddleware(routing)` and protect `/dashboard` routes:
```typescript
// File: src/middleware.ts
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

### Recommendation 3: Align `src/lib/authOptions.ts`
Update `pages.signIn` to `"/login"` to match `src/middleware.ts`.

**Proposed Change:**
```typescript
// File: src/lib/authOptions.ts (Line 77-79)
  pages: {
    signIn: "/login",
  },
```

### Recommendation 4: Align Navigation in `src/app/[locale]/login/page.tsx`
Import `useRouter` from `"@/i18n/routing"` and use `router.push('/dashboard')`.

**Proposed Change:**
```typescript
// File: src/app/[locale]/login/page.tsx
// Replace import on line 6 and line 9:
import { Link, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
...
// On line 37:
router.push("/dashboard");
```

---

## 5. Verification Method

### 5.1 Route Status Checks
When the dev server or production build is running:
1. `GET http://localhost:3000/login` -> **HTTP 200 OK** (serves English login page).
2. `GET http://localhost:3000/az/login` -> **HTTP 200 OK** (serves Azerbaijani login page).
3. `GET http://localhost:3000/ru/login` -> **HTTP 200 OK** (serves Russian login page).
4. `GET http://localhost:3000/dashboard` (unauthenticated) -> **HTTP 307 Redirect** to `/login?callbackUrl=%2Fdashboard`.
5. `GET http://localhost:3000/az/dashboard` (unauthenticated) -> **HTTP 307 Redirect** to `/login?callbackUrl=...`.

### 5.2 Build & Typecheck Verification
- Run `npx tsc --noEmit` to verify 0 type errors.
- Run `npm run build` to verify clean build artifact generation.
