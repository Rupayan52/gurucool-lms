import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  classifyPeerVector,
  CohortPeerVector,
  computeBayesianKnowledgeTrace,
  estimateIRTAbilityTheta,
  runPersonalMLPipeline,
  StudentRawTelemetry
} from "@/lib/ml-engine";
import { enforceRateLimit, getClientIp, verifySecureSession } from "@/lib/security";

export async function GET() {
  try {
    const auth = await verifySecureSession();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = await getClientIp();
    const rate = enforceRateLimit(`${auth.userId}:${ip}`, "ml-insights", 45, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before refreshing." },
        { status: 429 }
      );
    }

    const studentId = auth.userId;

    const [
      currentUser,
      studentProfile,
      allStudents,
      allRegistrations,
      allModules,
      allQuizzes,
      allQuizAttempts,
      allAssignments,
      allSubmissions,
      allDoubts,
      allLiveSessions,
      allLiveAttendances,
      activeThreads
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true, email: true }
      }),
      prisma.studentProfile.findUnique({
        where: { userId: studentId }
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
      prisma.liveClassSession.findMany(),
      prisma.liveClassAttendance.findMany(),
      prisma.directThread.findMany({
        where: { studentId, isLocked: false, isClosed: false },
        include: { teacher: { select: { id: true, name: true, avatarUrl: true } } }
      })
    ]);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const studentPool = allStudents.some(s => s.id === currentUser.id)
      ? allStudents
      : [...allStudents, { id: currentUser.id, name: currentUser.name, createdAt: new Date() }];

    // Build Cohort-Wide Feature Vectors with BKT & IRT for Every Student
    const cohortVectors: CohortPeerVector[] = studentPool.map(st => {
      const stRegs = allRegistrations.filter(r => r.studentId === st.id);
      const stSubjectIds = stRegs.map(r => r.subjectId);

      const relevantQuizzes = allQuizzes.filter(q => stSubjectIds.includes(q.subjectId));
      const relevantAssignments = allAssignments.filter(a => stSubjectIds.includes(a.subjectId));
      const relevantLiveClasses = allLiveSessions.filter(l => stSubjectIds.includes(l.subjectId));

      const stAttempts = allQuizAttempts.filter(a => a.studentId === st.id);
      const stSubs = allSubmissions.filter(s => s.studentId === st.id);
      const stDoubts = allDoubts.filter(d => d.studentId === st.id);
      const stAttendances = allLiveAttendances.filter(l => l.studentId === st.id);

      let earned = 0;
      let max = 0;
      const bktObs: number[] = [];
      const irtObs: Array<{ correct: number; weight: number }> = [];

      stAttempts.forEach(att => {
        earned += att.score;
        max += att.maxScore;
        const parentQuiz = allQuizzes.find(q => q.id === att.quizId);
        if (parentQuiz) {
          let parsed: number[] = [];
          try {
            parsed = JSON.parse(att.answers || "[]");
          } catch {
            parsed = [];
          }
          parentQuiz.questions.forEach((ques, idx) => {
            const c = Number(parsed[idx]) === ques.correctIndex ? 1 : 0;
            bktObs.push(c);
            irtObs.push({ correct: c, weight: Math.max(1, ques.points) });
          });
        }
      });

      stSubs.forEach(sub => {
        if (sub.status === "GRADED" && sub.awardedMarks !== null) {
          const parentAssign = allAssignments.find(a => a.id === sub.assignmentId);
          if (parentAssign) {
            earned += sub.awardedMarks;
            max += parentAssign.maxMarks;
            const c = sub.awardedMarks / Math.max(1, parentAssign.maxMarks) >= 0.7 ? 1 : 0;
            bktObs.push(c);
            irtObs.push({ correct: c, weight: 2 });
          }
        }
      });

      const totalActivities = stAttempts.length + stSubs.length + stAttendances.length;
      const accuracy = max > 0 ? Math.round((earned / max) * 100) : 0;

      const totalAssigned =
        relevantQuizzes.length + relevantAssignments.length + relevantLiveClasses.length;
      const completionRate =
        totalAssigned > 0
          ? Math.min(100, Math.round((totalActivities / totalAssigned) * 100))
          : totalActivities > 0
          ? 100
          : 0;

      const speedScores: number[] = [];
      stAttempts.forEach(att => {
        const q = allQuizzes.find(x => x.id === att.quizId);
        if (q) {
          const hoursElapsed = Math.max(
            0.1,
            (new Date(att.submittedAt).getTime() - new Date(q.createdAt).getTime()) / (1000 * 3600)
          );
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
          : stAttendances.length > 0
          ? 75
          : 0;

      const openDoubtsCount = stDoubts.filter(d => d.status === "OPEN").length;
      const autonomyScore = Math.max(40, 100 - openDoubtsCount * 15);

      const bktTrace = computeBayesianKnowledgeTrace(bktObs);
      const irtTheta = estimateIRTAbilityTheta(irtObs);

      const classification = classifyPeerVector(
        accuracy,
        completionRate,
        velocityScore,
        autonomyScore,
        stAttempts.length + stSubs.length,
        bktTrace.posteriorMastery
      );

      return {
        studentId: st.id,
        studentName: st.name,
        accuracy,
        completionRate,
        velocityScore,
        autonomyScore,
        bktMasteryPct: bktTrace.posteriorMastery,
        irtTheta,
        compositeIndex: classification.compositeIndex,
        totalActivities: stAttempts.length + stSubs.length,
        clusterId: classification.clusterId,
        clusterLabel: classification.clusterLabel
      };
    });

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

    // Live Class Telemetry for this student
    const myCourseLiveSessions = allLiveSessions.filter(s =>
      mySubjectIds.includes(s.subjectId)
    );
    const myAttendances = allLiveAttendances.filter(a => a.studentId === studentId);
    const attendedSet = new Set(myAttendances.map(a => a.sessionId));
    const mandatorySessions = myCourseLiveSessions.filter(s => s.isMandatory);

    const telemetry: StudentRawTelemetry = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      studyProfile: {
        dailyStudyGoalHrs: studentProfile?.dailyStudyGoalHrs || 4,
        learningStyle: studentProfile?.learningStyle || "Visual & Derivation-First",
        targetExam: studentProfile?.targetExam || null,
        institution: studentProfile?.institution || null
      },
      liveClassTelemetry: {
        totalAssignedClasses: myCourseLiveSessions.length,
        attendedClasses: myCourseLiveSessions.filter(s => attendedSet.has(s.id)).length,
        mandatoryAssigned: mandatorySessions.length,
        mandatoryAttended: mandatorySessions.filter(s => attendedSet.has(s.id)).length
      },
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
      liveClassTelemetry: telemetry.liveClassTelemetry,
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
    return NextResponse.json({ error: "Failed to compute ML insights" }, { status: 500 });
  }
}
