import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_student")?.value || cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    const registrations = await prisma.registration.findMany({
      where: { studentId: decoded.userId },
      include: {
        subject: {
          include: {
            teacherRegistrations: { include: { teacher: { select: { id: true, name: true, email: true, avatarUrl: true } } } }
          }
        }
      }
    });

    const activeThreads = await prisma.directThread.findMany({
      where: { studentId: decoded.userId }
    });

    const courses: any[] = [];
    
    registrations.forEach(reg => {
      const sub = reg.subject;
      if (sub.teacherRegistrations.length > 0) {
        sub.teacherRegistrations.forEach(tr => {
          // Attach thread state if the student has requested a meet with this specific teacher
          const threadState = activeThreads.find(t => t.teacherId === tr.teacher.id);
          
          courses.push({
            id: sub.id,
            name: sub.name,
            teacherId: tr.teacher.id,
            teacherName: tr.teacher.name,
            teacherEmail: tr.teacher.email,
            threadData: threadState || null // Exposes locked/approved status directly to the frontend
          });
        });
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
