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

    if (!subjectId) return NextResponse.json({ error: "Missing subjectId" }, { status: 400 });

    // Link the student to the subject in the database
    await prisma.registration.create({
      data: {
        studentId: decoded.userId,
        subjectId: subjectId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // If they click twice and trigger a unique constraint error, fail silently/successfully
    if (error.code === 'P2002') return NextResponse.json({ success: true });
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
