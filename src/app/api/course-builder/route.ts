import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    const chapters = await prisma.chapter.findMany();
    
    const mapped = subjects.map(s => ({
      ...s,
      chapters: chapters.filter(c => c.subjectId === s.id)
    }));

    return NextResponse.json(mapped);
  } catch (error) { return NextResponse.json({ error: "Server Error", details: String(error) }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, name, title, subjectId } = await req.json();

    if (type === "SUBJECT") {
      // Instead of passing a flat string, we use Prisma's nested 'create' syntax.
      // This tells the database: "Create this Subject, AND generate a linked CourseClass for it."
      await prisma.subject.create({ 
        data: { 
          name, 
          courseClass: {
            create: { name: "General Batch" }
          }
        } as any 
      }); 
    } else if (type === "CHAPTER") {
      if (!subjectId) return NextResponse.json({ error: "Subject required" }, { status: 400 });
      await prisma.chapter.create({ data: { title: title || name, name: title || name, subjectId } as any });
    }
    return NextResponse.json({ success: true });
  } catch (error) { 
    return NextResponse.json({ error: "Failed to create", details: String(error) }, { status: 500 }); 
  }
}
