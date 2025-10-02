import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect authenticated users away from auth pages
    if ((pathname.startsWith('/login') || pathname.startsWith('/signup')) && token) {
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }

      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Protected routes for authenticated users
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/parking')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login?callbackUrl=' + encodeURIComponent(pathname), req.url));
      }
    }

    // API routes protection
    if (pathname.startsWith('/api/admin')) {
      if (!token || token.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    if (
      pathname.startsWith('/api/vehicles') ||
      pathname.startsWith('/api/sessions') ||
      pathname.startsWith('/api/payments')
    ) {
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes
        if (
          pathname === '/' ||
          pathname.startsWith('/login') ||
          pathname.startsWith('/signup') ||
          pathname.startsWith('/api/auth/') ||
          pathname.startsWith('/api/zones') ||
          pathname.startsWith('/api/health') ||
          pathname.startsWith('/api/payments/webhook') ||
          pathname.startsWith('/terms') ||
          pathname.startsWith('/privacy') ||
          pathname.startsWith('/forgot-password')
        ) {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};