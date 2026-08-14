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
