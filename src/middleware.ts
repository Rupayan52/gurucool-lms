import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value || '';
  const role = request.cookies.get('user_role')?.value || '';

  const isAuthPage = path === '/login' || path === '/register';

  if (isAuthPage && token) {
    if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/content', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token) {
    if (path.startsWith('/dashboard') && role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (path.startsWith('/teacher') && role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Strict Portal Isolation with a specific exception for Teachers to manage content
    if (path.startsWith('/admin')) {
      if (role === 'ADMIN') {
        // Admins can access everything (Users, Content, etc.)
      } else if (role === 'TEACHER' && path.startsWith('/admin/content')) {
        // Teachers are exclusively allowed to access the Content Manager to upload lessons
      } else {
        // Bounce unauthorized access (e.g., Teachers trying to access /admin/users)
        return NextResponse.redirect(new URL(role === 'TEACHER' ? '/teacher' : '/dashboard', request.url));
      }
    }
  }

  if (!token && (path.startsWith('/dashboard') || path.startsWith('/teacher') || path.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
