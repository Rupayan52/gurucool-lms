import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OWASP_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://meet.ffmuc.net https://meet.jit.si",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://meet.ffmuc.net https://meet.jit.si",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ")
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(OWASP_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const teacherToken = req.cookies.get("token_teacher")?.value;
  const studentToken = req.cookies.get("token_student")?.value;
  const legacyToken = req.cookies.get("auth_token")?.value;

  // Protect Teacher Portal Routes
  if (pathname.startsWith("/teacher")) {
    if (!teacherToken && !legacyToken) {
      const loginUrl = new URL("/login", req.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // Protect Student Portal Routes
  if (pathname.startsWith("/dashboard")) {
    if (!studentToken && !legacyToken && !teacherToken) {
      const loginUrl = new URL("/login", req.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
