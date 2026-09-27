import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define exactly which pages should bounce a logged-in user away
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password';
  
  // Define exactly which pages require a login
  const isProtectedPage = path.startsWith('/dashboard') || path.startsWith('/admin');
  
  const token = request.cookies.get('auth_token')?.value || '';

  // Prevent logged-in users from seeing the login/register forms
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Prevent guests from seeing the dashboard or admin panels
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow ALL other routes (like the root / or /onboarding) to render normally for everyone
  return NextResponse.next();
}

// Ensure the middleware runs on all pages except API routes and static files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
