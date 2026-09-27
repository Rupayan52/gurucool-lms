import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 5, 60000))) return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });

    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET || "fallback", { expiresIn: "7d" });
    
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });
    cookieStore.set("user_role", user.role, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
