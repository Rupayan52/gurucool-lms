import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { name: identifier }] }
    });

    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "1d" });
    
    const cookieStore = await cookies();
    // HttpOnly prevents JavaScript access (stops XSS). SameSite strict prevents CSRF.
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
