import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  const session = await verifyServerAuth();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true, name: true, email: true } });
  const teachers = await prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true } });
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  const enrollments = await prisma.enrollment.findMany();

  return NextResponse.json({ students, teachers, subjects, enrollments });
}

export async function POST(req: Request) {
  const session = await verifyServerAuth();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, subjectId, teacherId } = await req.json();
  
  await prisma.enrollment.upsert({
    where: { studentId_subjectId: { studentId, subjectId } },
    update: { teacherId },
    create: { studentId, subjectId, teacherId }
  });

  return NextResponse.json({ success: true });
}
