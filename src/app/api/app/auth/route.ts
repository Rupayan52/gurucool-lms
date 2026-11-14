import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  enforceRateLimit,
  getClientIp,
  recordSecurityAudit,
  sanitizeString,
  verifySecureSession
} from "@/lib/security";

function signAppToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET || "fallback_secret";
  return jwt.sign({ userId, role }, secret, { expiresIn: "30d" });
}

export async function GET() {
  try {
    const auth = await verifySecureSession();
    if (!auth) {
      return NextResponse.json({ authenticated: false, error: "Unauthorized" }, { status: 401 });
    }

    const [user, studentProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          bio: true,
          createdAt: true
        }
      }),
      prisma.studentProfile.findUnique({
        where: { userId: auth.userId }
      })
    ]);

    if (!user) {
      return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
      extendedProfile: studentProfile || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = await getClientIp();
    const rate = enforceRateLimit(ip, "app-auth", 25, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many authentication attempts. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const action = body.action || "LOGIN";

    if (action === "LOGIN") {
      const email = sanitizeString(body.email || "", 320).toLowerCase();
      const password = String(body.password || "");

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      let isValidPassword = false;
      if (
        user.passwordHash.startsWith("$2a$") ||
        user.passwordHash.startsWith("$2b$") ||
        user.passwordHash.startsWith("$2y$")
      ) {
        isValidPassword = await bcrypt.compare(password, user.passwordHash);
      } else {
        isValidPassword = password === user.passwordHash;
      }

      if (!isValidPassword) {
        await recordSecurityAudit({
          userId: user.id,
          role: user.role,
          action: "APP_LOGIN_FAILED",
          resource: email,
          severity: "WARN"
        });
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const token = signAppToken(user.id, user.role);
      const extendedProfile =
        user.role === "STUDENT"
          ? await prisma.studentProfile.findUnique({ where: { userId: user.id } })
          : null;

      await recordSecurityAudit({
        userId: user.id,
        role: user.role,
        action: "APP_LOGIN_SUCCESS",
        resource: "mobile_app_client",
        severity: "INFO"
      });

      const response = NextResponse.json({
        success: true,
        token,
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          createdAt: user.createdAt
        },
        extendedProfile
      });

      const cookieName =
        user.role === "TEACHER" || user.role === "FACULTY" ? "token_teacher" : "token_student";
      response.cookies.set(cookieName, token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });

      return response;
    }

    if (action === "REGISTER") {
      const name = sanitizeString(body.name || "", 120);
      const email = sanitizeString(body.email || "", 320).toLowerCase();
      const password = String(body.password || "");
      const role = body.role === "TEACHER" || body.role === "FACULTY" ? "TEACHER" : "STUDENT";

      if (!name || !email || password.length < 4) {
        return NextResponse.json(
          { error: "Name, valid email, and password are required." },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role
        }
      });

      if (role === "STUDENT") {
        await prisma.studentProfile.create({
          data: { userId: newUser.id }
        });
      }

      const token = signAppToken(newUser.id, newUser.role);
      return NextResponse.json({
        success: true,
        token,
        role: newUser.role,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          bio: newUser.bio,
          createdAt: newUser.createdAt
        }
      });
    }

    return NextResponse.json({ error: "Unsupported auth action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
