import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySecureSession } from "@/lib/security";

export async function GET() {
  try {
    const auth = await verifySecureSession();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [subjects, myStudentRegs, myTeacherRegs, modulesCountBySubject] = await Promise.all([
      prisma.subject.findMany({
        include: {
          teacherRegistrations: {
            include: {
              teacher: { select: { id: true, name: true, email: true, avatarUrl: true, bio: true } }
            }
          },
          registrations: {
            select: { studentId: true }
          }
        },
        orderBy: { name: "asc" }
      }),
      prisma.registration.findMany({
        where: { studentId: auth.userId },
        select: { subjectId: true }
      }),
      prisma.teacherRegistration.findMany({
        where: { teacherId: auth.userId },
        select: { subjectId: true }
      }),
      prisma.curriculumModule.groupBy({
        by: ["subjectId"],
        _count: { id: true }
      })
    ]);

    const enrolledSet = new Set(myStudentRegs.map(r => r.subjectId));
    const teachingSet = new Set(myTeacherRegs.map(r => r.subjectId));
    const moduleCountMap = Object.fromEntries(
      modulesCountBySubject.map(m => [m.subjectId, m._count.id])
    );

    const catalog = subjects.map(sub => ({
      id: sub.id,
      name: sub.name,
      description: `Comprehensive curriculum, live broadcasts, and assessments for ${sub.name}.`,
      teachers: sub.teacherRegistrations.map(tr => tr.teacher),
      enrolledStudentsCount: sub.registrations.length,
      modulesCount: moduleCountMap[sub.id] || 0,
      isEnrolled: enrolledSet.has(sub.id),
      isTeaching: teachingSet.has(sub.id)
    }));

    return NextResponse.json({ catalog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifySecureSession();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subjectId } = await req.json();
    if (!subjectId) {
      return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
    }

    if (auth.role === "TEACHER" || auth.role === "FACULTY") {
      await prisma.teacherRegistration.upsert({
        where: { teacherId_subjectId: { teacherId: auth.userId, subjectId } },
        update: {},
        create: { teacherId: auth.userId, subjectId }
      });
      return NextResponse.json({ success: true, mode: "TEACHER_REGISTERED" });
    } else {
      await prisma.registration.upsert({
        where: { studentId_subjectId: { studentId: auth.userId, subjectId } },
        update: {},
        create: { studentId: auth.userId, subjectId }
      });
      return NextResponse.json({ success: true, mode: "STUDENT_ENROLLED" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
