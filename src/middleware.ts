import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const isUnlockRoute = req.nextUrl.pathname.includes('/unlock');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  
  // Global Passcode Protection
  if (!isUnlockRoute && !isApiRoute) {
    const unlocked = req.cookies.get('site_unlocked')?.value;
    if (unlocked !== 'true') {
      const url = req.nextUrl.clone();
      url.pathname = '/unlock';
      return NextResponse.redirect(url);
    }
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
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
