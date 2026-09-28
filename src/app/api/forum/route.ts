import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// DYNAMIC ROUTING: Find exact Teacher assigned to this Student for this specific Subject
async function getDynamicChannelOwner(session: any, subjectId: string) {
  if (session.role === "TEACHER") return session.userId;
  
  const cohort = await prisma.subjectCohort.findUnique({
    where: { studentId_subjectId: { studentId: session.userId, subjectId } }
  });
  return cohort?.teacherId;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");
  if (!subjectId) return NextResponse.json({ error: "Subject required" }, { status: 400 });

  const session = await verifyServerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelOwnerId = await getDynamicChannelOwner(session, subjectId);
  if (!channelOwnerId) return NextResponse.json([]);

  const posts = await prisma.forumPost.findMany({
    where: { subjectId, channelOwnerId },
    include: { user: { select: { name: true, role: true } } },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 10, 60000))) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const session = await verifyServerAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subjectId, content } = await req.json();
    if (content.length < 10 || content.length > 500) return NextResponse.json({ error: "Messages must be 10-500 chars." }, { status: 400 });

    const channelOwnerId = await getDynamicChannelOwner(session, subjectId);
    if (!channelOwnerId) return NextResponse.json({ error: "You are not enrolled in a faculty batch for this subject." }, { status: 403 });

    await prisma.forumPost.create({ data: { userId: session.userId, subjectId, channelOwnerId, content } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await verifyServerAuth();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const { postId, isPinned } = await req.json();
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (post?.channelOwnerId !== session.userId && session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.forumPost.update({ where: { id: postId }, data: { isPinned } });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await verifyServerAuth();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  
  const url = new URL(req.url);
  const postId = url.searchParams.get("postId");
  const post = await prisma.forumPost.findUnique({ where: { id: String(postId) } });
  if (post?.channelOwnerId !== session.userId && session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.forumPost.delete({ where: { id: String(postId) } });
  return NextResponse.json({ success: true });
}
