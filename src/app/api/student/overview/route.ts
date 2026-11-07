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
    const studentId = decoded.userId;

    const [registrations, quizAttempts, submissions, doubts, threads] = await Promise.all([
      prisma.registration.findMany({
        where: { studentId },
        include: {
          subject: {
            include: {
              teacherRegistrations: {
                include: { teacher: { select: { id: true, name: true } } }
              }
            }
          }
        }
      }),
      prisma.academicQuizAttempt.findMany({ where: { studentId } }),
      prisma.academicSubmission.findMany({
        where: { studentId },
        include: { assignment: { select: { title: true, maxMarks: true } } }
      }),
      prisma.academicDoubt.findMany({
        where: { studentId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.directThread.findMany({
        where: { studentId, isLocked: false, isClosed: false },
        include: { teacher: { select: { id: true, name: true, avatarUrl: true } } }
      })
    ]);

    const subjectIds = registrations.map(r => r.subjectId);
    const [totalModules, totalTopics, totalQuizzes, totalAssignments] = await Promise.all([
      prisma.curriculumModule.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.topicContent.count({ where: { module: { subjectId: { in: subjectIds } } } }),
      prisma.academicQuiz.count({ where: { subjectId: { in: subjectIds } } }),
      prisma.academicAssignment.count({ where: { subjectId: { in: subjectIds } } })
    ]);

    // Calculate real assessment accuracy across quizzes and graded assignments
    let earnedPoints = 0;
    let maxPoints = 0;
    quizAttempts.forEach(a => {
      earnedPoints += a.score;
      maxPoints += a.maxScore;
    });
    submissions.forEach(s => {
      if (s.status === "GRADED" && s.awardedMarks !== null) {
        earnedPoints += s.awardedMarks;
        maxPoints += s.assignment.maxMarks;
      }
    });

    const assessmentAccuracy = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : null;

    return NextResponse.json({
      enrolledSubjectsCount: registrations.length,
      totalModules,
      totalTopics,
      totalQuizzes,
      quizzesCompleted: quizAttempts.length,
      totalAssignments,
      assignmentsSubmitted: submissions.length,
      assessmentAccuracy,
      openDoubtsCount: doubts.filter(d => d.status === "OPEN").length,
      resolvedDoubtsCount: doubts.filter(d => d.status === "RESOLVED").length,
      liveSessions: threads.map(t => ({
        id: t.id,
        teacherName: t.teacher.name,
        approvedDate: t.approvedDate,
        meetingUrl: `https://meet.ffmuc.net/GuruCool_1on1_${t.id}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
