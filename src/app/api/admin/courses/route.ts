import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, type, parentId } = await req.json();

    if (type === "CLASS") {
      await prisma.courseClass.create({ data: { name } });
    } else if (type === "SUBJECT" && parentId) {
      await prisma.subject.create({ data: { name, courseClassId: parentId } });
    } else if (type === "CHAPTER" && parentId) {
      await prisma.chapter.create({ data: { name, subjectId: parentId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course content" }, { status: 500 });
  }
}

export async function GET() {
  const classes = await prisma.courseClass.findMany({
    include: { subjects: { include: { chapters: true } } }
  });
  return NextResponse.json(classes);
}
