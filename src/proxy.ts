import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only these specific pages should bounce a logged-in user away
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password';
  const token = request.cookies.get('auth_token')?.value || '';

  // If logged in and trying to access the login form, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If NOT logged in and trying to access secure routes, redirect to login
  if (!token && (path.startsWith('/dashboard') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // All other pages (like / or /onboarding) render normally for everyone
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
