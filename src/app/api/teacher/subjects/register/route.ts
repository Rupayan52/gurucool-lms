import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    const { subjectId } = await req.json();

    await prisma.teacherRegistration.create({
      data: { teacherId: decoded.userId, subjectId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Ignore unique constraint errors if they click twice
    if (error.code === 'P2002') return NextResponse.json({ success: true });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
