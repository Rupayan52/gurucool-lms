import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticateTeacher() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value || cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
  if (decoded.role !== "TEACHER" && decoded.role !== "FACULTY") throw new Error("Forbidden");
  return decoded.userId;
}

export async function GET(req: Request) {
  try {
    const teacherId = await authenticateTeacher();
    const { searchParams } = new URL(req.url);
    const requestedSubjectId = searchParams.get("subjectId");

    const teacherRegs = await prisma.teacherRegistration.findMany({
      where: { teacherId },
      include: { subject: { select: { id: true, name: true } } }
    });

    const subjects = teacherRegs.map(tr => tr.subject);
    const activeSubjectId = requestedSubjectId || (subjects[0]?.id ?? null);

    if (!activeSubjectId) {
      return NextResponse.json({ subjects: [], activeSubjectId: null, modules: [], quizzes: [], assignments: [] });
    }

    const modules = await prisma.curriculumModule.findMany({
      where: { subjectId: activeSubjectId, teacherId },
      include: { topics: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" }
    });

    const quizzes = await prisma.academicQuiz.findMany({
      where: { subjectId: activeSubjectId, teacherId },
      include: {
        questions: true,
        attempts: { orderBy: { submittedAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    });

    const assignments = await prisma.academicAssignment.findMany({
      where: { subjectId: activeSubjectId, teacherId },
      include: {
        submissions: { orderBy: { submittedAt: "desc" } }
      },
      orderBy: { createdAt: "desc" }
    });

    // Hydrate student profiles for quiz attempts and assignment submissions
    const studentIdSet = new Set<string>();
    quizzes.forEach(q => q.attempts.forEach(a => studentIdSet.add(a.studentId)));
    assignments.forEach(a => a.submissions.forEach(s => studentIdSet.add(s.studentId)));

    const students = await prisma.user.findMany({
      where: { id: { in: Array.from(studentIdSet) } },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });
    const studentMap = Object.fromEntries(students.map(s => [s.id, s]));

    const enrichedQuizzes = quizzes.map(q => ({
      ...q,
      attempts: q.attempts.map(att => ({
        ...att,
        student: studentMap[att.studentId] || { id: att.studentId, name: "Student", email: "" }
      }))
    }));

    const enrichedAssignments = assignments.map(a => ({
      ...a,
      submissions: a.submissions.map(sub => ({
        ...sub,
        student: studentMap[sub.studentId] || { id: sub.studentId, name: "Student", email: "" }
      }))
    }));

    return NextResponse.json({
      subjects,
      activeSubjectId,
      modules,
      quizzes: enrichedQuizzes,
      assignments: enrichedAssignments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const teacherId = await authenticateTeacher();
    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_MODULE") {
      const { subjectId, title, description } = body;
      if (!subjectId || !title?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const mod = await prisma.curriculumModule.create({
        data: { subjectId, teacherId, title: title.trim(), description: description?.trim() || null }
      });
      return NextResponse.json({ success: true, module: mod });
    }

    if (action === "DELETE_MODULE") {
      await prisma.curriculumModule.deleteMany({ where: { id: body.moduleId, teacherId } });
      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_TOPIC") {
      const { moduleId, title, contentType, bodyText, fileUrl, fileName, fileType } = body;
      if (!moduleId || !title?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      const topic = await prisma.topicContent.create({
        data: {
          moduleId,
          title: title.trim(),
          contentType: contentType || "NOTE",
          bodyText: bodyText || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileType: fileType || null
        }
      });
      return NextResponse.json({ success: true, topic });
    }

    if (action === "DELETE_TOPIC") {
      await prisma.topicContent.delete({ where: { id: body.topicId } });
      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_QUIZ") {
      const { subjectId, moduleId, title, description, questions } = body;
      if (!subjectId || !title?.trim() || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: "Quiz requires title and at least one question" }, { status: 400 });
      }
      const quiz = await prisma.academicQuiz.create({
        data: {
          subjectId,
          teacherId,
          moduleId: moduleId || null,
          title: title.trim(),
          description: description?.trim() || null,
          questions: {
            create: questions.map((q: any) => ({
              questionText: q.questionText.trim(),
              options: JSON.stringify(q.options),
              correctIndex: Number(q.correctIndex),
              points: Number(q.points) || 1
            }))
          }
        }
      });
      return NextResponse.json({ success: true, quiz });
    }

    if (action === "DELETE_QUIZ") {
      await prisma.academicQuiz.deleteMany({ where: { id: body.quizId, teacherId } });
      return NextResponse.json({ success: true });
    }

    if (action === "CREATE_ASSIGNMENT") {
      const { subjectId, moduleId, title, instructions, maxMarks, dueDate, fileUrl, fileName, fileType } = body;
      if (!subjectId || !title?.trim() || !instructions?.trim()) {
        return NextResponse.json({ error: "Missing required assignment fields" }, { status: 400 });
      }
      const assignment = await prisma.academicAssignment.create({
        data: {
          subjectId,
          teacherId,
          moduleId: moduleId || null,
          title: title.trim(),
          instructions: instructions.trim(),
          maxMarks: Number(maxMarks) || 100,
          dueDate: dueDate ? new Date(dueDate) : null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileType: fileType || null
        }
      });
      return NextResponse.json({ success: true, assignment });
    }

    if (action === "DELETE_ASSIGNMENT") {
      await prisma.academicAssignment.deleteMany({ where: { id: body.assignmentId, teacherId } });
      return NextResponse.json({ success: true });
    }

    if (action === "GRADE_SUBMISSION") {
      const { submissionId, awardedMarks, teacherFeedback } = body;
      if (!submissionId || awardedMarks === undefined || awardedMarks === "") {
        return NextResponse.json({ error: "Marks required" }, { status: 400 });
      }
      const updated = await prisma.academicSubmission.update({
        where: { id: submissionId },
        data: {
          awardedMarks: Number(awardedMarks),
          teacherFeedback: teacherFeedback?.trim() || null,
          status: "GRADED",
          gradedAt: new Date()
        }
      });
      return NextResponse.json({ success: true, submission: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
