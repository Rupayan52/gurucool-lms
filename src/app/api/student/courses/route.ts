import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    // Fetch the subjects strictly registered to this active student
    const registrations = await prisma.registration.findMany({
      where: { studentId: decoded.userId },
      include: {
        subject: {
          include: {
            teacherRegistrations: {
              include: {
                teacher: { select: { id: true, name: true, email: true, avatarUrl: true } }
              }
            }
          }
        }
      }
    });

    // Format the payload to build the dual-pane Course Hubs UI
    const courses = registrations.map(reg => {
      const sub = reg.subject;
      // Extract the primary mentor for the channel header
      const primaryTeacher = sub.teacherRegistrations.length > 0 ? sub.teacherRegistrations[0].teacher : null;
      
      return {
        id: sub.id,
        name: sub.name,
        teacherId: primaryTeacher ? primaryTeacher.id : null,
        teacherName: primaryTeacher ? primaryTeacher.name : "Pending",
        teacherEmail: primaryTeacher ? primaryTeacher.email : null
      };
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Courses Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
