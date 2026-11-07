import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_student")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Extract both userId AND role from the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
    
    // STRICT RBAC: Block Teachers/Admins from registering as students
    if (decoded.role === "TEACHER" || decoded.role === "FACULTY" || decoded.role === "ADMIN") {
      return NextResponse.json({ error: "Faculty accounts cannot enroll as students." }, { status: 403 });
    }

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
    if (error.code === 'P2002') return NextResponse.json({ success: true });
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
