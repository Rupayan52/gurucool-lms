import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 5, 60000))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { token, newPassword } = await req.json();

    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid request or password too short" }, { status: 400 });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
    
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash: hashedPassword, tokenVersion: { increment: 1 } }
    });

    await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
