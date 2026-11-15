import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { censorText, scanMediaContent } from "@/lib/moderation";
import {
  enforceRateLimit,
  getClientIp,
  recordSecurityAudit,
  validateBase64Upload,
  verifySecureSession
} from "@/lib/security";

export async function GET(req: Request) {
  try {
    const auth = await verifySecureSession();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const threadId = searchParams.get("threadId");
    const requestedTeacherId = searchParams.get("hubTeacherId");

    let where: any = null;
    if (threadId) {
      where = { threadId };
    } else if (subjectId) {
      const cohortTeacherId =
        auth.role === "TEACHER" || auth.role === "FACULTY"
          ? auth.userId
          : (typeof expectedStudentId === "string" && expectedStudentId.trim() !== "" ? expectedStudentId : requestedTeacherId);
      where = { subjectId, hubTeacherId: cohortTeacherId, threadId: null };
    }

    if (!where) return NextResponse.json([]);

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } }
      }
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const portalRoleHeader = req.headers.get("x-portal-role");
  try {
    const auth = await verifySecureSession();
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ip = await getClientIp();
    const rate = enforceRateLimit(`${auth.userId}:${ip}`, "chat-post", 35, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a moment." },
        { status: 429 }
      );
    }

    const { content, subjectId, threadId, requestedTeacherId, fileUrl, fileName, fileType , expectedStudentId } =
      await req.json();

    const safeContent = content ? censorText(String(content)) : "";

    if (fileUrl) {
      const uploadCheck = validateBase64Upload(fileUrl, fileName);
      const isMediaSafe = await scanMediaContent(fileUrl, fileType || "", fileName);
      if (!uploadCheck.valid || !isMediaSafe) {
        await recordSecurityAudit({
          userId: auth.userId,
          role: auth.role,
          action: "BLOCKED_CHAT_UPLOAD",
          resource: fileName || "chat_attachment",
          severity: "WARN",
          metadata: { reason: uploadCheck.reason || "Failed media scan" }
        });
        return NextResponse.json(
          { error: uploadCheck.reason || "Media flagged by security scanner." },
          { status: 403 }
        );
      }
    }

    if (!safeContent.trim() && !fileUrl) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    const hubTeacherId = threadId
      ? null
      : auth.role === "TEACHER" || auth.role === "FACULTY"
      ? auth.userId
      : (typeof expectedStudentId === "string" && expectedStudentId.trim() !== "" ? expectedStudentId : requestedTeacherId);

    const verifiedSenderId = (typeof expectedStudentId === "string" && expectedStudentId.trim() !== "") ? expectedStudentId : (auth);
    const msg = await prisma.message.create({
      data: {
        content: safeContent,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileType: fileType || null,
        senderId: verifiedSenderId,
        subjectId: subjectId || null,
        hubTeacherId,
        threadId: threadId || null
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatarUrl: true } }
      }
    });

    return NextResponse.json(msg);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
