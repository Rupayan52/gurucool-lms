import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  classifyPeerVector,
  CohortPeerVector,
  runPersonalMLPipeline,
  StudentRawTelemetry
} from "@/lib/ml-engine";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("token_student")?.value ||
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("token_teacher")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    ) as { userId: string; role: string };
    const studentId = decoded.userId;

    // 1. Fetch all students, subjects, quizzes, assignments, attempts, submissions, doubts, and threads
    const [
      currentUser,
      allStudents,
      allRegistrations,
      allModules,
      allQuizzes,
      allQuizAttempts,
      allAssignments,
      allSubmissions,
      allDoubts,
      activeThreads
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, email: true }
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { id: true, name: true, createdAt: true }
      }),
      prisma.registration.findMany({
        include: {
          subject: {
            include: {
              teacherRegistrations: {
                include: {
                  teacher: { select: { id: true, name: true, email: true } }
                }
              }
            }
          }
        }
      }),
      prisma.curriculumModule.findMany({
        include: { topics: { orderBy: { createdAt: "desc" } } }
      }),
      prisma.academicQuiz.findMany({
        include: { questions: true }
      }),
      prisma.academicQuizAttempt.findMany(),
      prisma.academicAssignment.findMany(),
      prisma.academicSubmission.findMany(),
      prisma.academicDoubt.findMany({
        orderBy: { createdAt: "desc" }
      }),
      prisma.directThread.findMany({
        where: { studentId, isLocked: false, isClosed: false },
        include: { teacher: { select: { id: true, name: true, avatarUrl: true } } }
      })
    ]);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure current user is included in peer pool if they are logged in as student
    const studentPool = allStudents.some(s => s.id === currentUser.id)
      ? allStudents
      : [...allStudents, { id: currentUser.id, name: currentUser.name, createdAt: new Date() }];

    // 2. Build Cohort-Wide Feature Vectors for All Students (Real ML Clustering)
    const cohortVectors: CohortPeerVector[] = studentPool.map(st => {
      const stRegs = allRegistrations.filter(r => r.studentId === st.id);
      const stSubjectIds = stRegs.map(r => r.subjectId);

      const relevantQuizzes = allQuizzes.filter(q => stSubjectIds.includes(q.subjectId));
      const relevantAssignments = allAssignments.filter(a => stSubjectIds.includes(a.subjectId));

      const stAttempts = allQuizAttempts.filter(a => a.studentId === st.id);
      const stSubs = allSubmissions.filter(s => s.studentId === st.id);
      const stDoubts = allDoubts.filter(d => d.studentId === st.id);

      let earned = 0;
      let max = 0;
      stAttempts.forEach(att => {
        earned += att.score;
        max += att.maxScore;
      });

      stSubs.forEach(sub => {
        if (sub.status === "GRADED" && sub.awardedMarks !== null) {
          const parentAssign = allAssignments.find(a => a.id === sub.assignmentId);
          if (parentAssign) {
            earned += sub.awardedMarks;
            max += parentAssign.maxMarks;
          }
        }
      });

      const totalActivities = stAttempts.length + stSubs.length;
      const accuracy = max > 0 ? Math.round((earned / max) * 100) : 0;

      const totalAssigned = relevantQuizzes.length + relevantAssignments.length;
      const completionRate =
        totalAssigned > 0
          ? Math.min(100, Math.round((totalActivities / totalAssigned) * 100))
          : totalActivities > 0
          ? 100
          : 0;

      // Velocity score computed from response latency between quiz/assignment creation and student submission
      const speedScores: number[] = [];
      stAttempts.forEach(att => {
        const q = allQuizzes.find(x => x.id === att.quizId);
        if (q) {
          const hoursElapsed = Math.max(
            0.1,
            (new Date(att.submittedAt).getTime() - new Date(q.createdAt).getTime()) / (1000 * 3600)
          );
          // Faster completion after publication yields higher velocity (100 for <6h, decaying smoothly)
          const v = Math.max(35, Math.min(100, Math.round(100 - Math.log10(hoursElapsed + 1) * 28)));
          speedScores.push(v);
        }
      });

      stSubs.forEach(sub => {
        const a = allAssignments.find(x => x.id === sub.assignmentId);
        if (a) {
          const hoursElapsed = Math.max(
            0.1,
            (new Date(sub.submittedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 3600)
          );
          const v = Math.max(35, Math.min(100, Math.round(100 - Math.log10(hoursElapsed + 1) * 25)));
          speedScores.push(v);
        }
      });

      const velocityScore =
        speedScores.length > 0
          ? Math.round(speedScores.reduce((a, b) => a + b, 0) / speedScores.length)
          : 0;

      const openDoubtsCount = stDoubts.filter(d => d.status === "OPEN").length;
      const autonomyScore = Math.max(40, 100 - openDoubtsCount * 15);

      const classification = classifyPeerVector(
        accuracy,
        completionRate,
        velocityScore,
        autonomyScore,
        totalActivities
      );

      return {
        studentId: st.id,
        studentName: st.name,
        accuracy,
        completionRate,
        velocityScore,
        autonomyScore,
        compositeIndex: classification.compositeIndex,
        totalActivities,
        clusterId: classification.clusterId,
        clusterLabel: classification.clusterLabel
      };
    });

    // 3. Build Target Student Raw Telemetry
    const myRegs = allRegistrations.filter(r => r.studentId === studentId);
    const enrolledSubjects = myRegs.map(r => ({
      subjectId: r.subject.id,
      subjectName: r.subject.name,
      enrolledAt: r.createdAt,
      teachers: r.subject.teacherRegistrations.map(tr => ({
        id: tr.teacher.id,
        name: tr.teacher.name,
        email: tr.teacher.email
      }))
    }));

    const mySubjectIds = enrolledSubjects.map(s => s.subjectId);
    const subjectNameMap = Object.fromEntries(
      enrolledSubjects.map(s => [s.subjectId, s.subjectName])
    );
    const subjectTeacherMap = Object.fromEntries(
      enrolledSubjects.map(s => [s.subjectId, s.teachers[0]?.name || "Assigned Faculty"])
    );

    const subjectMaterials = mySubjectIds.map(subId => {
      const mods = allModules.filter(m => m.subjectId === subId);
      const topics = mods.flatMap(m => m.topics);
      return {
        subjectId: subId,
        modulesCount: mods.length,
        topicsCount: topics.length,
        latestTopicTitle: topics[0]?.title || mods[0]?.title || null
      };
    });

    const myQuizzes = allQuizzes
      .filter(q => mySubjectIds.includes(q.subjectId))
      .map(q => {
        const attempt = allQuizAttempts.find(
          a => a.quizId === q.id && a.studentId === studentId
        );
        return {
          id: q.id,
          subjectId: q.subjectId,
          subjectName: subjectNameMap[q.subjectId] || "Subject",
          teacherName: subjectTeacherMap[q.subjectId] || "Faculty",
          title: q.title,
          createdAt: q.createdAt,
          questions: q.questions,
          attempt: attempt
            ? {
                score: attempt.score,
                maxScore: attempt.maxScore,
                answers: attempt.answers,
                submittedAt: attempt.submittedAt
              }
            : null
        };
      });

    const myAssignments = allAssignments
      .filter(a => mySubjectIds.includes(a.subjectId))
      .map(a => {
        const sub = allSubmissions.find(
          s => s.assignmentId === a.id && s.studentId === studentId
        );
        return {
          id: a.id,
          subjectId: a.subjectId,
          subjectName: subjectNameMap[a.subjectId] || "Subject",
          teacherName: subjectTeacherMap[a.subjectId] || "Faculty",
          title: a.title,
          maxMarks: a.maxMarks,
          dueDate: a.dueDate,
          createdAt: a.createdAt,
          submission: sub
            ? {
                status: sub.status,
                awardedMarks: sub.awardedMarks,
                teacherFeedback: sub.teacherFeedback,
                submittedAt: sub.submittedAt
              }
            : null
        };
      });

    const myDoubts = allDoubts
      .filter(d => d.studentId === studentId)
      .map(d => ({
        id: d.id,
        subjectId: d.subjectId,
        subjectName: subjectNameMap[d.subjectId] || "Subject",
        teacherName: subjectTeacherMap[d.subjectId] || "Faculty",
        title: d.title,
        status: d.status,
        createdAt: d.createdAt,
        resolvedAt: d.resolvedAt
      }));

    const telemetry: StudentRawTelemetry = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      enrolledSubjects,
      subjectMaterials,
      quizzes: myQuizzes,
      assignments: myAssignments,
      doubts: myDoubts
    };

    const mlReport = runPersonalMLPipeline(telemetry, cohortVectors);

    return NextResponse.json({
      studentName: currentUser.name,
      enrolledSubjectsCount: enrolledSubjects.length,
      totalModules: subjectMaterials.reduce((a, b) => a + b.modulesCount, 0),
      totalTopics: subjectMaterials.reduce((a, b) => a + b.topicsCount, 0),
      totalQuizzes: myQuizzes.length,
      quizzesCompleted: myQuizzes.filter(q => q.attempt !== null).length,
      totalAssignments: myAssignments.length,
      assignmentsSubmitted: myAssignments.filter(a => a.submission !== null).length,
      openDoubtsCount: myDoubts.filter(d => d.status === "OPEN").length,
      resolvedDoubtsCount: myDoubts.filter(d => d.status === "RESOLVED").length,
      liveSessions: activeThreads.map(t => ({
        id: t.id,
        teacherName: t.teacher.name,
        approvedDate: t.approvedDate,
        meetingUrl: `https://meet.ffmuc.net/GuruCool_1on1_${t.id}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`
      })),
      ml: mlReport
    });
  } catch (error: any) {
    console.error("ML Insights Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
