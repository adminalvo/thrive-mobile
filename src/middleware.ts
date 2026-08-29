import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const isUnlockRoute = req.nextUrl.pathname.includes('/unlock');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  
  // Global Passcode Protection
  if (!isUnlockRoute && !req.nextUrl.pathname.startsWith('/api/unlock')) {
    const unlocked = req.cookies.get('site_unlocked')?.value;
    if (unlocked !== 'true') {
      if (isApiRoute) {
        return NextResponse.json({ error: "Site Locked" }, { status: 403 });
      }
      const url = req.nextUrl.clone();
      url.pathname = '/unlock';
      return NextResponse.redirect(url);
    }
  }

  const secret = process.env.NEXTAUTH_SECRET || "ThriveCRM_Secret_Key_2026!@#";

  // API Route Protection
  if (isApiRoute) {
    if (!req.nextUrl.pathname.startsWith('/api/auth') && !req.nextUrl.pathname.startsWith('/api/unlock')) {
      const token = await getToken({ req, secret });
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  const isProtectedRoute = req.nextUrl.pathname.includes('/dashboard');

  if (isProtectedRoute) {
    const token = await getToken({ req, secret });
    
    // Extract locale if present
    const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    const hasLocale = ['az', 'en', 'ru'].includes(firstSegment);
    const localePrefix = hasLocale ? `/${firstSegment}` : '';

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}/login`;
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const role = token.role as string;
    
    // Only non-super_admin staff cannot access finance or settings
    if (role === 'staff' && (req.nextUrl.pathname.includes('/finance') || req.nextUrl.pathname.includes('/settings'))) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}/dashboard`; 
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};

