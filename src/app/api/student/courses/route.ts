import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { studentEmail } = await req.json();

    const student = await prisma.user.findUnique({ 
      where: { email: studentEmail },
      include: {
        registrations: {
          include: {
            subject: {
              include: {
                teacher: { select: { id: true, name: true, email: true } }
              }
            }
          }
        }
      }
    });

    if (!student) return NextResponse.json([], { status: 404 });

    // Extract exactly what the frontend composer needs
    const activeCourses = student.registrations.map(reg => ({
      id: reg.subject.id,
      name: reg.subject.name,
      teacherId: reg.subject.teacher?.id,
      teacherName: reg.subject.teacher?.name || reg.subject.teacher?.email || "Unassigned",
      teacherEmail: reg.subject.teacher?.email
    }));

    return NextResponse.json(activeCourses);
  } catch (error) {
    console.error("Failed to fetch registered courses:", error);
    return NextResponse.json([], { status: 500 });
  }
}
