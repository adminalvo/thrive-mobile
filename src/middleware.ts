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

  // API Route Protection
  if (isApiRoute) {
    if (!req.nextUrl.pathname.startsWith('/api/auth') && !req.nextUrl.pathname.startsWith('/api/unlock')) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  const isProtectedRoute = req.nextUrl.pathname.includes('/dashboard');

  if (isProtectedRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const role = token.role as string;
    
    // 1. Students and parents access restricted areas? No, they have their own dashboards
    // We handle their restrictions inside the dashboard/page.tsx or specific route segments.
    // They are allowed to access /dashboard base route.
    
    // 2. Staff cannot access finance or settings
    if (role === 'staff' && (req.nextUrl.pathname.includes('/finance') || req.nextUrl.pathname.includes('/settings'))) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard'; 
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
