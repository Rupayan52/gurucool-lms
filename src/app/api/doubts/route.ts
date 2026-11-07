import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuth(preferredRole?: "STUDENT" | "TEACHER") {
  const cookieStore = await cookies();
  const studentToken = cookieStore.get("token_student")?.value;
  const teacherToken = cookieStore.get("token_teacher")?.value;
  const legacyToken = cookieStore.get("auth_token")?.value;

  let token = legacyToken;
  if (preferredRole === "TEACHER") {
    token = teacherToken || legacyToken;
  } else if (preferredRole === "STUDENT") {
    token = studentToken || legacyToken;
  } else {
    token = teacherToken || studentToken || legacyToken;
  }

  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("role") === "teacher" ? "TEACHER" : "STUDENT";
    const auth = await getAuth(mode);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (mode === "STUDENT") {
      // 1. Fetch all active course registrations and their assigned faculty
      const registrations = await prisma.registration.findMany({
        where: { studentId: auth.userId },
        include: {
          subject: {
            include: {
              teacherRegistrations: {
                include: {
                  teacher: { select: { id: true, name: true, email: true, avatarUrl: true } }
                }
              }
            }
          }
        }
      });

      const enrolledCohorts: Array<{
        subjectId: string;
        subjectName: string;
        teacherId: string;
        teacherName: string;
      }> = [];

      registrations.forEach(reg => {
        const sub = reg.subject;
        if (sub.teacherRegistrations.length > 0) {
          sub.teacherRegistrations.forEach(tr => {
            enrolledCohorts.push({
              subjectId: sub.id,
              subjectName: sub.name,
              teacherId: tr.teacher.id,
              teacherName: tr.teacher.name
            });
          });
        }
      });

      // 2. Fetch all doubts submitted by this student
      const rawDoubts = await prisma.academicDoubt.findMany({
        where: { studentId: auth.userId },
        orderBy: { createdAt: "desc" }
      });

      const subjectIds = Array.from(new Set(rawDoubts.map(d => d.subjectId)));
      const teacherIds = Array.from(new Set(rawDoubts.map(d => d.teacherId)));

      const [subjects, teachers] = await Promise.all([
        prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } }),
        prisma.user.findMany({ where: { id: { in: teacherIds } }, select: { id: true, name: true, avatarUrl: true } })
      ]);

      const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));
      const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));

      const doubts = rawDoubts.map(d => ({
        ...d,
        subjectName: subjectMap[d.subjectId]?.name || "Subject",
        teacherName: teacherMap[d.teacherId]?.name || "Faculty",
        teacherAvatar: teacherMap[d.teacherId]?.avatarUrl || null
      }));

      return NextResponse.json({ enrolledCohorts, doubts });
    } else {
      // TEACHER MODE: Fetch all doubts directed to this teacher or within their registered subjects
      const teacherRegs = await prisma.teacherRegistration.findMany({
        where: { teacherId: auth.userId },
        select: { subjectId: true }
      });
      const mySubjectIds = teacherRegs.map(tr => tr.subjectId);

      const rawDoubts = await prisma.academicDoubt.findMany({
        where: {
          OR: [
            { teacherId: auth.userId },
            { subjectId: { in: mySubjectIds } }
          ]
        },
        orderBy: { createdAt: "desc" }
      });

      const studentIds = Array.from(new Set(rawDoubts.map(d => d.studentId)));
      const subjectIds = Array.from(new Set(rawDoubts.map(d => d.subjectId)));

      const [students, subjects] = await Promise.all([
        prisma.user.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true, email: true, avatarUrl: true } }),
        prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } })
      ]);

      const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
      const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));

      const doubts = rawDoubts.map(d => ({
        ...d,
        student: studentMap[d.studentId] || { id: d.studentId, name: "Student", email: "" },
        subjectName: subjectMap[d.subjectId]?.name || "Subject"
      }));

      return NextResponse.json({ doubts });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_DOUBT") {
      const auth = await getAuth("STUDENT");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { subjectId, teacherId, title, description, studentFileUrl, studentFileName, studentFileType } = body;
      if (!subjectId || !teacherId || !title?.trim() || !description?.trim()) {
        return NextResponse.json({ error: "Please select a course and fill in the doubt summary and description." }, { status: 400 });
      }

      const doubt = await prisma.academicDoubt.create({
        data: {
          studentId: auth.userId,
          subjectId,
          teacherId,
          title: title.trim(),
          description: description.trim(),
          studentFileUrl: studentFileUrl || null,
          studentFileName: studentFileName || null,
          studentFileType: studentFileType || null,
          status: "OPEN"
        }
      });

      return NextResponse.json({ success: true, doubt });
    }

    if (action === "ANSWER_DOUBT") {
      const auth = await getAuth("TEACHER");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { doubtId, teacherAnswer, teacherFileUrl, teacherFileName, teacherFileType, includeMeetLink } = body;
      if (!doubtId || !teacherAnswer?.trim()) {
        return NextResponse.json({ error: "Please provide a clear explanation to resolve the doubt." }, { status: 400 });
      }

      const meetingLink = includeMeetLink
        ? `https://meet.ffmuc.net/GuruCool_Doubt_${doubtId}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`
        : null;

      const updated = await prisma.academicDoubt.update({
        where: { id: doubtId },
        data: {
          teacherId: auth.userId,
          teacherAnswer: teacherAnswer.trim(),
          teacherFileUrl: teacherFileUrl || null,
          teacherFileName: teacherFileName || null,
          teacherFileType: teacherFileType || null,
          meetingLink,
          status: "RESOLVED",
          resolvedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, doubt: updated });
    }

    if (action === "REOPEN_DOUBT") {
      const auth = await getAuth("STUDENT");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { doubtId, followUpText } = body;
      const existing = await prisma.academicDoubt.findUnique({ where: { id: doubtId } });
      if (!existing || existing.studentId !== auth.userId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const updatedDesc = followUpText?.trim()
        ? `${existing.description}\n\n[Student Follow-Up]: ${followUpText.trim()}`
        : existing.description;

      const updated = await prisma.academicDoubt.update({
        where: { id: doubtId },
        data: {
          description: updatedDesc,
          status: "OPEN"
        }
      });

      return NextResponse.json({ success: true, doubt: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
