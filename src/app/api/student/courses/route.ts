import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma directly for the serverless route
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Queries the live database specifically for accounts with the "TEACHER" role.
    // This perfectly matches the "Abc" and "cde" records visible in your database dashboard.
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, email: true }
    });

    // Maps the fetched teachers into standard course options.
    // (If you eventually create a dedicated "Course" table in Prisma, you can simply change the above query to prisma.course.findMany({ include: { teacher: true } }) here).
    const enrolledCourses = teachers.map((teacher) => ({
      id: `course-${teacher.id}`,
      name: `Assigned Subject Pipeline`,
      teacherId: teacher.id,
      teacherName: teacher.name || teacher.email || "Unassigned Faculty",
      teacherEmail: teacher.email
    }));

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error("Prisma database query failed:", error);
    return NextResponse.json([], { status: 500 });
  }
}
