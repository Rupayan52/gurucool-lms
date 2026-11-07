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

    const courses: any[] = [];
    
    // Create a distinct Hub for EVERY teacher teaching the enrolled subject
    registrations.forEach(reg => {
      const sub = reg.subject;
      if (sub.teacherRegistrations.length > 0) {
        sub.teacherRegistrations.forEach(tr => {
          courses.push({
            id: sub.id,
            name: sub.name,
            teacherId: tr.teacher.id,
            teacherName: tr.teacher.name,
            teacherEmail: tr.teacher.email
          });
        });
      } else {
        courses.push({
          id: sub.id, name: sub.name, teacherId: null, teacherName: "Pending", teacherEmail: null
        });
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
