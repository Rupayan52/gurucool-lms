import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OWASP_HEADERS: Record<string, string> = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(self), geolocation=(), payment=()"
};

function applyHeaders(req: NextRequest, response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(OWASP_HEADERS)) {
    response.headers.set(key, value);
  }

  // Enable full CORS support for /api/* so the Native Mobile/Desktop App can call every endpoint
  if (req.nextUrl.pathname.startsWith("/api")) {
    const origin = req.headers.get("origin") || "*";
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Auth-Token, X-Client-Platform, X-Requested-With, Accept"
    );
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Handle Preflight OPTIONS requests for Mobile/Cross-Origin API callers
  if (pathname.startsWith("/api") && req.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    return applyHeaders(req, preflight);
  }

  // 2. Universal Bearer-to-Cookie Bridge for /api/* routes:
  // If the Mobile App sends `Authorization: Bearer <jwt>`, inject it into the request's Cookie
  // header so every existing route calling `await cookies()` works without modification.
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const customToken = req.headers.get("x-auth-token");
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : customToken?.trim();

  if (pathname.startsWith("/api") && bearerToken) {
    const requestHeaders = new Headers(req.headers);
    const existingCookie = requestHeaders.get("cookie") || "";
    const bridgedCookies = [
      existingCookie,
      `token_student=${bearerToken}`,
      `token_teacher=${bearerToken}`,
      `auth_token=${bearerToken}`
    ]
      .filter(Boolean)
      .join("; ");

    requestHeaders.set("cookie", bridgedCookies);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    return applyHeaders(req, response);
  }

  // 3. Protect Web Portal Pages
  const teacherToken = req.cookies.get("token_teacher")?.value;
  const studentToken = req.cookies.get("token_student")?.value;
  const legacyToken = req.cookies.get("auth_token")?.value;

  if (pathname.startsWith("/teacher")) {
    if (!teacherToken && !legacyToken) {
      return applyHeaders(req, NextResponse.redirect(new URL("/login", req.url)));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!studentToken && !legacyToken && !teacherToken) {
      return applyHeaders(req, NextResponse.redirect(new URL("/login", req.url)));
    }
  }

  return applyHeaders(req, NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
