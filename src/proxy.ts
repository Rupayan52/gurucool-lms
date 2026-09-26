import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Only protect the internal admin routes, leave /admin-login open
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin-login')) {
    const token = req.cookies.get('admin_session');
    
    // If they don't have the secure cookie, redirect to the custom login screen
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }
  }
  
  return NextResponse.next();
}

// Tell Next.js to only run this middleware on /admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
