import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/reset-password';
  
  const studentToken = request.cookies.get('token_student')?.value;
  const teacherToken = request.cookies.get('token_teacher')?.value;
  const legacyToken = request.cookies.get('auth_token')?.value;

  // Smart routing: If logged in, prevent access to login/register screens
  if (isAuthPage) {
    if (teacherToken) return NextResponse.redirect(new URL('/teacher/resolution-center', request.url));
    if (studentToken || legacyToken) return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect Teacher jurisdictional boundaries
  if (path.startsWith('/teacher') && !teacherToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect Student jurisdictional boundaries
  if (path.startsWith('/dashboard') && !studentToken && !legacyToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
