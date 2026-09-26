import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 3, 60000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

    const { newPassword } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Invalid password" }, { status: 400 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, tokenVersion: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.tokenVersion !== decoded.tokenVersion) return NextResponse.json({ error: "Session expired." }, { status: 401 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashedPassword, tokenVersion: { increment: 1 } } });
    await prisma.securityLog.create({ data: { userId: user.id, event: "Password Changed", ipAddress: ip } });
    cookieStore.delete("auth_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
