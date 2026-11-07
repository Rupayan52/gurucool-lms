import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticateStudent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_student")?.value || cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
  return decoded.userId;
}

export async function GET(req: Request) {
  try {
    const studentId = await authenticateStudent();
    const { searchParams } = new URL(req.url);
    const reqSubjectId = searchParams.get("subjectId");
    const reqTeacherId = searchParams.get("teacherId");

    const registrations = await prisma.registration.findMany({
      where: { studentId },
      include: {
        subject: {
          include: {
            teacherRegistrations: {
              include: { teacher: { select: { id: true, name: true, avatarUrl: true } } }
            }
          }
        }
      }
    });

    const cohorts: Array<{ subjectId: string; subjectName: string; teacherId: string; teacherName: string }> = [];
    registrations.forEach(reg => {
      reg.subject.teacherRegistrations.forEach(tr => {
        cohorts.push({
          subjectId: reg.subject.id,
          subjectName: reg.subject.name,
          teacherId: tr.teacher.id,
          teacherName: tr.teacher.name
        });
      });
    });

    if (cohorts.length === 0) {
      return NextResponse.json({ cohorts: [], activeCohort: null, modules: [], quizzes: [], assignments: [] });
    }

    const activeCohort = cohorts.find(c => c.subjectId === reqSubjectId && c.teacherId === reqTeacherId) || cohorts[0];

    const modules = await prisma.curriculumModule.findMany({
      where: { subjectId: activeCohort.subjectId, teacherId: activeCohort.teacherId },
      include: { topics: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" }
    });

    const quizzes = await prisma.academicQuiz.findMany({
      where: { subjectId: activeCohort.subjectId, teacherId: activeCohort.teacherId },
      include: {
        questions: true,
        attempts: { where: { studentId } }
      },
      orderBy: { createdAt: "desc" }
    });

    const assignments = await prisma.academicAssignment.findMany({
      where: { subjectId: activeCohort.subjectId, teacherId: activeCohort.teacherId },
      include: {
        submissions: { where: { studentId } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      cohorts,
      activeCohort,
      modules,
      quizzes,
      assignments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const studentId = await authenticateStudent();
    const body = await req.json();
    const { action } = body;

    if (action === "SUBMIT_QUIZ") {
      const { quizId, answers } = body;
      const quiz = await prisma.academicQuiz.findUnique({
        where: { id: quizId },
        include: { questions: true }
      });
      if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

      let score = 0;
      let maxScore = 0;
      quiz.questions.forEach((q, idx) => {
        maxScore += q.points;
        if (Number(answers[idx]) === q.correctIndex) {
          score += q.points;
        }
      });

      const attempt = await prisma.academicQuizAttempt.upsert({
        where: { quizId_studentId: { quizId, studentId } },
        update: { answers: JSON.stringify(answers), score, maxScore, submittedAt: new Date() },
        create: { quizId, studentId, answers: JSON.stringify(answers), score, maxScore }
      });

      return NextResponse.json({ success: true, attempt });
    }

    if (action === "SUBMIT_ASSIGNMENT") {
      const { assignmentId, responseText, fileUrl, fileName, fileType } = body;
      if (!assignmentId || (!responseText?.trim() && !fileUrl)) {
        return NextResponse.json({ error: "Provide written answer or attachment" }, { status: 400 });
      }

      const submission = await prisma.academicSubmission.upsert({
        where: { assignmentId_studentId: { assignmentId, studentId } },
        update: {
          responseText: responseText?.trim() || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileType: fileType || null,
          status: "SUBMITTED",
          submittedAt: new Date()
        },
        create: {
          assignmentId,
          studentId,
          responseText: responseText?.trim() || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileType: fileType || null,
          status: "SUBMITTED"
        }
      });

      return NextResponse.json({ success: true, submission });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
