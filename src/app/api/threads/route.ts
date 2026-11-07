import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value || cookieStore.get("token_student")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
  } catch { return null; }
}

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    if (body.action === 'REQUEST_MEET') {
      const { teacherId, reason } = body;
      if (!teacherId || !reason) return NextResponse.json({ error: "Missing payload" }, { status: 400 });

      // Upsert naturally resets a closed thread back into a pending request
      const thread = await prisma.directThread.upsert({
        where: { studentId_teacherId: { studentId: auth.userId, teacherId } },
        update: { reason, isLocked: true, approvedDate: null, isClosed: false, terminationReason: null }, 
        create: { studentId: auth.userId, teacherId, reason, isLocked: true }
      });
      return NextResponse.json({ success: true, thread });
    }

    if (body.action === 'APPROVE_MEET') {
      const { threadId, date } = body;
      const updated = await prisma.directThread.update({
        where: { id: threadId, teacherId: auth.userId },
        data: { isLocked: false, approvedDate: new Date(date) }
      });
      return NextResponse.json({ success: true, updated });
    }

    if (body.action === 'REJECT_MEET') {
      await prisma.directThread.delete({ where: { id: body.threadId, teacherId: auth.userId } });
      return NextResponse.json({ success: true });
    }

    // NEW: Terminate Meet Logic (Locks out both parties until requested again)
    if (body.action === 'TERMINATE_MEET') {
      const { threadId, reason } = body;
      const whereClause = auth.role === 'TEACHER' || auth.role === 'FACULTY' 
        ? { id: threadId, teacherId: auth.userId } 
        : { id: threadId, studentId: auth.userId };

      const updated = await prisma.directThread.update({
        where: whereClause,
        data: { 
          isClosed: true, 
          terminationReason: reason,
          terminatedById: auth.userId,
          recordingUrl: `https://meet.ffmuc.net/recordings/GuruCool_${threadId}.mp4`
        }
      });
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
