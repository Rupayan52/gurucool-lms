import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // If anyone tries to access ANY page starting with /admin...
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      
      // THE USERNAME IS 'admin' AND THE PASSWORD IS 'guru2026'
      if (user === 'admin' && pwd === 'guru2026') {
        return NextResponse.next();
      }
    }
    
    // If they fail or haven't logged in, block them and ask for the password
    return new NextResponse('Unauthorized access to GuruCool Control Center', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Control Center"' },
    });
  }
  
  return NextResponse.next();
}
