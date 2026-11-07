import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
  return decoded.userId;
}

export async function GET() {
  try {
    const teacherId = await authenticate();

    // 1. Fetch assigned Group Hubs
    const hubs = await prisma.subject.findMany({
      where: { teacherRegistrations: { some: { teacherId } } },
      select: { id: true, name: true }
    });

    // 2. Fetch pending & active 1-on-1 Student Threads
    const threads = await prisma.directThread.findMany({
      where: { teacherId },
      include: {
        student: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    return NextResponse.json({ hubs, threads });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
