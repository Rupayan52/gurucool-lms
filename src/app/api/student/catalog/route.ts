import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    // Fetch subjects deeply nested with their registered teachers
    const subjects = await prisma.subject.findMany({
      include: {
        teacherRegistrations: {
          include: {
            teacher: { select: { id: true, name: true, avatarUrl: true, bio: true } }
          }
        },
        registrations: {
          where: { studentId: decoded.userId }
        }
      }
    });

    const catalog = subjects.map(sub => {
      const isEnrolled = sub.registrations.length > 0;
      const faculties = sub.teacherRegistrations.map(tr => tr.teacher);
      
      const teacherDisplay = faculties.length > 0
        ? faculties.map(f => "Prof. " + f.name).join(" & ")
        : "Prof. Pending";

      return {
        id: sub.id,
        name: sub.name,
        teacherName: teacherDisplay,
        faculties: faculties, // Pass full faculty details for the modal
        enrolled: isEnrolled
      };
    });

    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Catalog Fetch Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
