import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 5, 60000))) return NextResponse.json({ error: "Too many registrations." }, { status: 429 });

    const body = await req.json();
    const { name, email, password, role } = body;
    
    if (!name || !email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // SECURITY: Prevent Admin injection. Only allow STUDENT or TEACHER.
    const assignedRole = role === "TEACHER" ? "TEACHER" : "STUDENT";

    if (await prisma.user.findFirst({ where: { OR: [{ email }, { name }] } })) {
      return NextResponse.json({ error: "User exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hashedPassword, role: assignedRole } });

    const token = jwt.sign({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });
    cookieStore.set("user_role", user.role, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800, path: "/" });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
