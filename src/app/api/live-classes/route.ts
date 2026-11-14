import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuth(preferredRole?: "TEACHER" | "STUDENT") {
  const cookieStore = await cookies();
  const teacherToken = cookieStore.get("token_teacher")?.value;
  const studentToken = cookieStore.get("token_student")?.value;
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
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") === "teacher" ? "TEACHER" : "STUDENT";
    const filterSubjectId = searchParams.get("subjectId");

    const auth = await getAuth(roleParam);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (roleParam === "TEACHER") {
      // 1. Fetch teacher's registered subjects and their enrolled student counts
      const teacherRegs = await prisma.teacherRegistration.findMany({
        where: { teacherId: auth.userId },
        include: {
          subject: {
            include: {
              registrations: { select: { studentId: true } }
            }
          }
        }
      });

      const subjects = teacherRegs.map(tr => ({
        id: tr.subject.id,
        name: tr.subject.name,
        enrolledCount: tr.subject.registrations.length
      }));

      const subjectIds = subjects.map(s => s.id);
      const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s.name]));

      // 2. Fetch curriculum modules so teacher can link a live class to a specific module
      const modules = await prisma.curriculumModule.findMany({
        where: { teacherId: auth.userId, subjectId: { in: subjectIds } },
        orderBy: { createdAt: "asc" }
      });
      const moduleMap = Object.fromEntries(modules.map(m => [m.id, m.title]));

      // 3. Fetch live class sessions created by this teacher
      const sessionsWhere: any = { teacherId: auth.userId };
      if (filterSubjectId && filterSubjectId !== "ALL") {
        sessionsWhere.subjectId = filterSubjectId;
      }

      const rawSessions = await prisma.liveClassSession.findMany({
        where: sessionsWhere,
        include: {
          attendances: { orderBy: { joinedAt: "desc" } }
        },
        orderBy: { scheduledAt: "desc" }
      });

      // Hydrate student names for attendance logs
      const attendeeIds = Array.from(
        new Set(rawSessions.flatMap(s => s.attendances.map(a => a.studentId)))
      );
      const students = await prisma.user.findMany({
        where: { id: { in: attendeeIds } },
        select: { id: true, name: true, email: true, avatarUrl: true }
      });
      const studentMap = Object.fromEntries(students.map(st => [st.id, st]));

      const sessions = rawSessions.map(s => ({
        ...s,
        subjectName: subjectMap[s.subjectId] || "Subject",
        moduleTitle: s.moduleId ? moduleMap[s.moduleId] || null : null,
        attendances: s.attendances.map(a => ({
          ...a,
          student: studentMap[a.studentId] || { id: a.studentId, name: "Student", email: "" }
        }))
      }));

      return NextResponse.json({
        subjects,
        modules,
        sessions
      });
    } else {
      // STUDENT MODE: Fetch student's enrolled subjects and assigned faculty
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
        reg.subject.teacherRegistrations.forEach(tr => {
          enrolledCohorts.push({
            subjectId: reg.subject.id,
            subjectName: reg.subject.name,
            teacherId: tr.teacher.id,
            teacherName: tr.teacher.name
          });
        });
      });

      const enrolledSubjectIds = Array.from(new Set(enrolledCohorts.map(c => c.subjectId)));
      const subjectNameMap = Object.fromEntries(
        registrations.map(r => [r.subject.id, r.subject.name])
      );

      // Fetch all LiveClassSessions for the student's enrolled subjects
      const sessionWhere: any = {
        subjectId: {
          in:
            filterSubjectId && filterSubjectId !== "ALL"
              ? [filterSubjectId]
              : enrolledSubjectIds
        }
      };

      const [rawSessions, modules] = await Promise.all([
        prisma.liveClassSession.findMany({
          where: sessionWhere,
          include: {
            attendances: true
          },
          orderBy: { scheduledAt: "desc" }
        }),
        prisma.curriculumModule.findMany({
          where: {
            subjectId: {
              in:
                filterSubjectId && filterSubjectId !== "ALL"
                  ? [filterSubjectId]
                  : enrolledSubjectIds
            }
          },
          include: {
            topics: { orderBy: { createdAt: "asc" } }
          },
          orderBy: { createdAt: "asc" }
        })
      ]);

      const teacherIds = Array.from(
        new Set([
          ...rawSessions.map(s => s.teacherId),
          ...modules.map(m => m.teacherId)
        ])
      );
      const teachers = await prisma.user.findMany({
        where: { id: { in: teacherIds } },
        select: { id: true, name: true, avatarUrl: true }
      });
      const teacherMap = Object.fromEntries(teachers.map(t => [t.id, t]));
      const moduleMap = Object.fromEntries(modules.map(m => [m.id, m.title]));

      const sessions = rawSessions.map(s => ({
        ...s,
        subjectName: subjectNameMap[s.subjectId] || "Subject",
        teacherName: teacherMap[s.teacherId]?.name || "Faculty",
        teacherAvatar: teacherMap[s.teacherId]?.avatarUrl || null,
        moduleTitle: s.moduleId ? moduleMap[s.moduleId] || null : null,
        attendeeCount: s.attendances.length,
        hasJoined: s.attendances.some(a => a.studentId === auth.userId)
      }));

      const learningQueueModules = modules.map(m => ({
        ...m,
        subjectName: subjectNameMap[m.subjectId] || "Subject",
        teacherName: teacherMap[m.teacherId]?.name || "Faculty"
      }));

      return NextResponse.json({
        enrolledCohorts,
        sessions,
        learningQueueModules
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "CREATE_SESSION") {
      const auth = await getAuth("TEACHER");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const {
        subjectId,
        moduleId,
        title,
        agenda,
        scheduledAt,
        durationMinutes,
        startImmediately
      } = body;

      if (!subjectId || !title?.trim()) {
        return NextResponse.json(
          { error: "Subject and Lecture Title are required." },
          { status: 400 }
        );
      }

      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      const cleanSub = (subject?.name || "Course").replace(/[^a-zA-Z0-9]/g, "");
      const uniqueCode = `${cleanSub}_${Date.now().toString(36)}`;
      const streamUrl = `https://meet.ffmuc.net/GuruCool_Live_${uniqueCode}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`;

      const session = await prisma.liveClassSession.create({
        data: {
          subjectId,
          teacherId: auth.userId,
          moduleId: moduleId || null,
          title: title.trim(),
          agenda: agenda?.trim() || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
          durationMinutes: Number(durationMinutes) || 60,
          status: startImmediately ? "LIVE" : "SCHEDULED",
          startedAt: startImmediately ? new Date() : null,
          roomCode: uniqueCode,
          streamUrl
        }
      });

      return NextResponse.json({ success: true, session });
    }

    if (action === "START_LIVE") {
      const auth = await getAuth("TEACHER");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { sessionId } = body;
      const updated = await prisma.liveClassSession.update({
        where: { id: sessionId, teacherId: auth.userId },
        data: {
          status: "LIVE",
          startedAt: new Date()
        }
      });

      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "END_SESSION") {
      const auth = await getAuth("TEACHER");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { sessionId, recordingNotes } = body;
      const updated = await prisma.liveClassSession.update({
        where: { id: sessionId, teacherId: auth.userId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          ...(recordingNotes !== undefined && { recordingNotes })
        }
      });

      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "DELETE_SESSION") {
      const auth = await getAuth("TEACHER");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      await prisma.liveClassSession.deleteMany({
        where: { id: body.sessionId, teacherId: auth.userId }
      });

      return NextResponse.json({ success: true });
    }

    if (action === "JOIN_SESSION") {
      const auth = await getAuth("STUDENT");
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { sessionId } = body;
      const session = await prisma.liveClassSession.findUnique({
        where: { id: sessionId }
      });
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      await prisma.liveClassAttendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: auth.userId
          }
        },
        update: { joinedAt: new Date() },
        create: {
          sessionId,
          studentId: auth.userId
        }
      });

      return NextResponse.json({ success: true, streamUrl: session.streamUrl });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
