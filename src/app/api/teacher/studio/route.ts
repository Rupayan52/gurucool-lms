import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  const session = await verifyServerAuth();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const liveLessons = await prisma.lesson.findMany({ where: { isLive: true } });
  return NextResponse.json(liveLessons);
}

export async function PATCH(req: Request) {
  const session = await verifyServerAuth();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId, videoUrl } = await req.json();
  // Converts a LIVE broadcast into a recorded VOD instantly
  await prisma.lesson.update({ where: { id: lessonId }, data: { isLive: false, liveUrl: "", videoUrl } });
  return NextResponse.json({ success: true });
}
