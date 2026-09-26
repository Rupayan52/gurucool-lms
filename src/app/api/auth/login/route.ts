import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting: Max 5 login attempts per minute per IP
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many login attempts. Please try again in a minute." }, { status: 429 });
    }

    // 2. Input Validation: Reject malicious payloads before they hit the database
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    // 3. Authentication
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { name: identifier }] }
    });

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // 4. Secure Session Generation
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1d" });
    
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
