import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySecureSession } from "@/lib/security";

export async function GET() {
  try {
    const auth = await verifySecureSession();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const isTeacher = auth.role === "TEACHER" || auth.role === "FACULTY";

    if (isTeacher) {
      const [teacherRegs, openDoubts, pendingThreads, activeLiveClasses, assignments] =
        await Promise.all([
          prisma.teacherRegistration.findMany({
            where: { teacherId: auth.userId },
            select: { subjectId: true }
          }),
          prisma.academicDoubt.count({
            where: { teacherId: auth.userId, status: "OPEN" }
          }),
          prisma.directThread.count({
            where: { teacherId: auth.userId, isLocked: true, isClosed: false }
          }),
          prisma.liveClassSession.count({
            where: { teacherId: auth.userId, status: "LIVE" }
          }),
          prisma.academicAssignment.findMany({
            where: { teacherId: auth.userId },
            include: {
              submissions: { where: { status: "SUBMITTED" }, select: { id: true } }
            }
          })
        ]);

      const ungradedSubmissions = assignments.reduce(
        (acc, a) => acc + a.submissions.length,
        0
      );

      return NextResponse.json({
        role: "TEACHER",
        badges: {
          activeSubjects: teacherRegs.length,
          openDoubts,
          pendingMeetRequests: pendingThreads,
          liveClassesOnAir: activeLiveClasses,
          ungradedSubmissions
        },
        serverTimestamp: new Date().toISOString()
      });
    } else {
      const studentRegs = await prisma.registration.findMany({
        where: { studentId: auth.userId },
        select: { subjectId: true }
      });
      const subIds = studentRegs.map(r => r.subjectId);

      const [
        openDoubts,
        resolvedDoubts,
        unlockedThreads,
        liveClassesOnAir,
        totalQuizzes,
        attemptedQuizzes,
        totalAssignments,
        submittedAssignments
      ] = await Promise.all([
        prisma.academicDoubt.count({
          where: { studentId: auth.userId, status: "OPEN" }
        }),
        prisma.academicDoubt.count({
          where: { studentId: auth.userId, status: "RESOLVED" }
        }),
        prisma.directThread.count({
          where: { studentId: auth.userId, isLocked: false, isClosed: false }
        }),
        prisma.liveClassSession.count({
          where: { subjectId: { in: subIds }, status: "LIVE" }
        }),
        prisma.academicQuiz.count({
          where: { subjectId: { in: subIds } }
        }),
        prisma.academicQuizAttempt.count({
          where: { studentId: auth.userId }
        }),
        prisma.academicAssignment.count({
          where: { subjectId: { in: subIds } }
        }),
        prisma.academicSubmission.count({
          where: { studentId: auth.userId }
        })
      ]);

      return NextResponse.json({
        role: "STUDENT",
        badges: {
          enrolledSubjects: subIds.length,
          openDoubts,
          resolvedDoubts,
          active1on1Threads: unlockedThreads,
          liveClassesOnAir,
          pendingQuizzes: Math.max(0, totalQuizzes - attemptedQuizzes),
          pendingAssignments: Math.max(0, totalAssignments - submittedAssignments)
        },
        serverTimestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
