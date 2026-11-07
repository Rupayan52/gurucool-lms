import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value || cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
  if (decoded.role !== "TEACHER" && decoded.role !== "FACULTY") throw new Error("Forbidden");
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await authenticate();
    
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, avatarUrl: true, bio: true, createdAt: true,
        teacherRegistrations: {
          select: {
            subject: {
              select: { 
                id: true, 
                name: true, 
                registrations: {
                  select: {
                    createdAt: true,
                    student: { select: { id: true, name: true, email: true, avatarUrl: true } }
                  }
                } 
              }
            }
          }
        }
      }
    });

    // Fetch real quizzes and assignments created by this teacher to calculate authentic student metrics
    const quizzes = await prisma.academicQuiz.findMany({
      where: { teacherId: userId },
      include: { attempts: true }
    });

    const studentProfiles = await prisma.studentProfile.findMany();
    const profileMap = Object.fromEntries(studentProfiles.map((sp: any) => [sp.userId, sp]));
    const assignments = await prisma.academicAssignment.findMany({
      where: { teacherId: userId },
      include: { submissions: true }
    });

    if (teacher) {
      teacher.teacherRegistrations = teacher.teacherRegistrations.map((tr: any) => {
        const subId = tr.subject.id;
        const subjectQuizzes = quizzes.filter(q => q.subjectId === subId);
        const subjectAssignments = assignments.filter(a => a.subjectId === subId);

        const enrichedRegs = tr.subject.registrations.map((reg: any) => {
          const stId = reg.student.id;
          
          // Quiz Metrics
          let earnedQuizPts = 0;
          let totalQuizPts = 0;
          let quizzesTaken = 0;
          subjectQuizzes.forEach(q => {
            const att = q.attempts.find(a => a.studentId === stId);
            if (att) {
              quizzesTaken++;
              earnedQuizPts += att.score;
              totalQuizPts += att.maxScore;
            }
          });
          const quizAvg = totalQuizPts > 0 ? Math.round((earnedQuizPts / totalQuizPts) * 100) : null;

          // Assignment Metrics
          let submittedCount = 0;
          let gradedCount = 0;
          let earnedMarks = 0;
          let totalMaxMarks = 0;
          subjectAssignments.forEach(a => {
            const sub = a.submissions.find(s => s.studentId === stId);
            if (sub) {
              submittedCount++;
              if (sub.status === "GRADED" && sub.awardedMarks !== null) {
                gradedCount++;
                earnedMarks += sub.awardedMarks;
                totalMaxMarks += a.maxMarks;
              }
            }
          });
          const assignmentAvg = totalMaxMarks > 0 ? Math.round((earnedMarks / totalMaxMarks) * 100) : null;

          return {
            ...reg,
            student: {
              ...reg.student,
              extendedProfile: profileMap[stId] || null,
              metrics: {
                quizzesTaken,
                totalQuizzes: subjectQuizzes.length,
                quizAvg,
                submittedCount,
                totalAssignments: subjectAssignments.length,
                gradedCount,
                assignmentAvg
              }
            }
          };
        });

        return {
          ...tr,
          subject: {
            ...tr.subject,
            registrations: enrichedRegs
          }
        };
      });
    }

    const allSubjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    });

    return NextResponse.json({ teacher, allSubjects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await authenticate();
    const { name, bio, avatarUrl } = await req.json();
    await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatarUrl !== undefined && { avatarUrl }) }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
