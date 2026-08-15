import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const isProtectedRoute = req.nextUrl.pathname.includes('/dashboard');

  if (isProtectedRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const url = req.nextUrl.clone();
      // Ensure we redirect to the localized login page, e.g., /az/login
      // Wait, intlMiddleware will handle `/login` -> `/az/login` if we just redirect to `/login`?
      // Yes, if we redirect to `/login`, the next request will be caught by middleware and rewritten to `/az/login`.
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
