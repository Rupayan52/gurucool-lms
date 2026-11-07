import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { censorText, scanMediaContent } from "@/lib/moderation";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value || cookieStore.get("token_student")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
  } catch { return null; }
}

export async function GET(req: Request) {
  try {
    const auth = await authenticate();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const threadId = searchParams.get("threadId");
    const requestedTeacherId = searchParams.get("hubTeacherId");

    let where: any = null;
    if (threadId) {
      where = { threadId };
    } else if (subjectId) {
      // If a student is fetching, they must specify which teacher's cohort they want.
      // If a teacher is fetching, they naturally fetch their own cohort.
      const cohortTeacherId = auth.role === 'TEACHER' || auth.role === 'FACULTY' ? auth.userId : requestedTeacherId;
      where = { subjectId, hubTeacherId: cohortTeacherId, threadId: null };
    }

    if (!where) return NextResponse.json([]);

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await authenticate();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, subjectId, threadId, requestedTeacherId, fileUrl, fileName, fileType } = await req.json();
    
    const safeContent = content ? censorText(content) : "";

    if (fileUrl && fileType) {
      const isMediaSafe = await scanMediaContent(fileUrl, fileType);
      if (!isMediaSafe) return NextResponse.json({ error: "Media flagged." }, { status: 403 });
    }

    if (!safeContent.trim() && !fileUrl) return NextResponse.json({ error: "Empty payload" }, { status: 400 });

    // Determine the exact cohort partition mathematically on the backend
    const hubTeacherId = threadId ? null : (auth.role === 'TEACHER' || auth.role === 'FACULTY' ? auth.userId : requestedTeacherId);

    const msg = await prisma.message.create({
      data: {
        content: safeContent,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        senderId: auth.userId,
        subjectId: subjectId || null,
        hubTeacherId: hubTeacherId,
        threadId: threadId || null
      },
      include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }
    });

    return NextResponse.json(msg);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
