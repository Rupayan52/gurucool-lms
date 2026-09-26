import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { identifier, password } = parsed.data;
    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { name: identifier }] } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      if (user) await prisma.securityLog.create({ data: { userId: user.id, event: "Failed Login Attempt", ipAddress: ip } });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Embed tokenVersion into JWT payload
    const token = jwt.sign({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1d" });
    
    await prisma.securityLog.create({ data: { userId: user.id, event: "Successful Login", ipAddress: ip } });

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400, path: "/" });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
