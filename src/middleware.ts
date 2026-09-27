import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value || '';
  const role = request.cookies.get('user_role')?.value || '';

  const isAuthPage = path === '/login' || path === '/register';

  // 1. Authenticated users trying to access login/register are routed to their specific portals
  if (isAuthPage && token) {
    if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/content', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Strict Portal Isolation
  if (token) {
    if (path.startsWith('/dashboard') && role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (path.startsWith('/teacher') && role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Non-admins cannot access admin routes
    if (path.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(role === 'TEACHER' ? '/teacher' : '/dashboard', request.url));
    }
  }

  // 3. Unauthenticated users trying to access secure routes get sent to login
  if (!token && (path.startsWith('/dashboard') || path.startsWith('/teacher') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
