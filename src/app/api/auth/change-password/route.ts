import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { newPassword } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, tokenVersion: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Increment tokenVersion to invalidate all other active tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword, tokenVersion: { increment: 1 } }
    });

    await prisma.securityLog.create({ data: { userId: user.id, event: "Password Changed & Sessions Revoked", ipAddress: ip } });

    // Clear the current cookie to force a fresh login
    cookieStore.delete("auth_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
