import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await verifyServerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const subjectId = url.searchParams.get("subjectId");

  if (subjectId) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    const chapters = await prisma.chapter.findMany({ where: { subjectId }, orderBy: { createdAt: 'asc' } });
    const lessons = await prisma.lesson.findMany({ where: { chapterId: { in: chapters.map((c: any) => c.id) } }, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({ subject, chapters, lessons });
  }

  // Fetch only enrolled subjects
  const cohorts = await prisma.subjectCohort.findMany({ where: { studentId: session.userId } });
  const subjects = await prisma.subject.findMany({ where: { id: { in: cohorts.map((c: any) => c.subjectId) } } });
  return NextResponse.json(subjects);
}
