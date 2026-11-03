import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { studentEmail, subjectId } = await req.json();

    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const registration = await prisma.registration.upsert({
      where: {
        studentId_subjectId: { studentId: student.id, subjectId }
      },
      update: {}, // If already registered, do nothing
      create: {
        studentId: student.id,
        subjectId
      }
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
