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

// POST: Students request a thread, Teachers approve/schedule a thread
export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // STUDENT ACTION: Request a Meet
    if (body.action === 'REQUEST_MEET') {
      const { teacherId, reason } = body;
      if (!teacherId || !reason) return NextResponse.json({ error: "Missing payload" }, { status: 400 });

      const thread = await prisma.directThread.upsert({
        where: { studentId_teacherId: { studentId: auth.userId, teacherId } },
        update: { reason, isLocked: true, approvedDate: null }, // Reset if they request again
        create: { studentId: auth.userId, teacherId, reason, isLocked: true }
      });
      return NextResponse.json({ success: true, thread });
    }

    // TEACHER ACTION: Approve and Schedule a Meet
    if (body.action === 'APPROVE_MEET') {
      if (auth.role !== 'TEACHER' && auth.role !== 'FACULTY') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      
      const { threadId, date } = body;
      if (!threadId || !date) return NextResponse.json({ error: "Missing payload" }, { status: 400 });

      const updated = await prisma.directThread.update({
        where: { id: threadId, teacherId: auth.userId },
        data: { isLocked: false, approvedDate: new Date(date) }
      });
      return NextResponse.json({ success: true, updated });
    }

    // TEACHER ACTION: Reject a Meet
    if (body.action === 'REJECT_MEET') {
      if (auth.role !== 'TEACHER' && auth.role !== 'FACULTY') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      
      const { threadId } = body;
      await prisma.directThread.delete({
        where: { id: threadId, teacherId: auth.userId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
