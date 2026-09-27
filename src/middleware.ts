import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('auth_token')?.value || '';
  const role = request.cookies.get('user_role')?.value || '';

  // --- API ROUTE PROTECTION (THE FIX) ---
  if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
    if (!token) {
      return NextResponse.json({ error: "Access Denied: Missing Authentication Token" }, { status: 401 });
    }
    if (path.startsWith('/api/admin') && role !== 'ADMIN') {
      return NextResponse.json({ error: "Access Denied: Admin Clearance Required" }, { status: 403 });
    }
    if (path.startsWith('/api/teacher') && role !== 'TEACHER' && role !== 'ADMIN') {
      return NextResponse.json({ error: "Access Denied: Faculty Clearance Required" }, { status: 403 });
    }
  }

  // --- PAGE ROUTE PROTECTION ---
  const isAuthPage = path === '/login' || path === '/register';

  if (isAuthPage && token) {
    if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/content', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && !path.startsWith('/api')) {
    if (path.startsWith('/dashboard') && role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
    if (path.startsWith('/teacher') && role === 'STUDENT') return NextResponse.redirect(new URL('/dashboard', request.url));
    
    if (path.startsWith('/admin')) {
      if (role === 'ADMIN') {
        // Admins allowed everywhere
      } else if (role === 'TEACHER' && path.startsWith('/admin/content')) {
        // Teachers allowed to content
      } else {
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
  // We removed 'api' from the negative lookahead. The middleware now guards all backend APIs.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
