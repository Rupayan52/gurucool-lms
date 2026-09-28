import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' }, include: { chapters: true } });
    return NextResponse.json(subjects);
  } catch (error) { return NextResponse.json({ error: "Server Error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, name, title, subjectId } = await req.json();

    if (type === "SUBJECT") {
      await prisma.subject.create({ data: { name, classId: "default" } }); // Using a dummy classId if your schema requires it, or omit if optional
    } else if (type === "CHAPTER") {
      if (!subjectId) return NextResponse.json({ error: "Subject required" }, { status: 400 });
      await prisma.chapter.create({ data: { title, subjectId } });
    }
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: "Failed to create" }, { status: 500 }); }
}
