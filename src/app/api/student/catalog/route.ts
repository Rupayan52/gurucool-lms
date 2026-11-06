import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacherRegistrations: { include: { teacher: true } },
        teacher: true // Fallback for old legacy assignments
      }
    });

    const catalog = subjects.map(sub => {
      // Map multiple registered faculties into a single string for the student UI
      const facultyNames = sub.teacherRegistrations.length > 0
        ? sub.teacherRegistrations.map(tr => "Prof. " + tr.teacher.name).join(" & ")
        : (sub.teacher?.name ? "Prof. " + sub.teacher.name : "Pending Faculty");

      return {
        id: sub.id,
        name: sub.name,
        teacherName: facultyNames
      };
    });

    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
