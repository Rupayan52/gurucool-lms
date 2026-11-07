import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { censorText, scanMediaContent } from "@/lib/moderation";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_teacher")?.value || cookieStore.get("token_student")?.value || cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const hubTeacherId = searchParams.get("hubTeacherId"); // Cohort partition
    const threadId = searchParams.get("threadId");

    let where: any = null;
    if (threadId) {
      where = { threadId };
    } else if (subjectId && hubTeacherId) {
      where = { subjectId, hubTeacherId, threadId: null };
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
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, subjectId, hubTeacherId, threadId, fileUrl, fileName, fileType } = await req.json();
    
    // 1. Run Text Moderation
    const safeContent = content ? censorText(content) : "";

    // 2. Run Media Moderation
    if (fileUrl && fileType) {
      const isMediaSafe = await scanMediaContent(fileUrl, fileType);
      if (!isMediaSafe) {
        return NextResponse.json({ error: "Media flagged for explicit content." }, { status: 403 });
      }
    }

    if (!safeContent.trim() && !fileUrl) {
      return NextResponse.json({ error: "Empty message payload" }, { status: 400 });
    }

    const msg = await prisma.message.create({
      data: {
        content: safeContent,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        senderId: userId,
        subjectId: subjectId || null,
        hubTeacherId: hubTeacherId || null,
        threadId: threadId || null
      },
      include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }
    });

    return NextResponse.json(msg);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
