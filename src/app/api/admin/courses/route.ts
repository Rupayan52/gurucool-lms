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
      // Create a Subject using strictly the 'name' column
      await prisma.subject.create({ data: { name } }); 
    } else if (type === "CHAPTER") {
      if (!subjectId) return NextResponse.json({ error: "Subject required" }, { status: 400 });
      // Create a Chapter using 'name' instead of 'title' based on standard Prisma conventions
      // If the UI passes 'title', we map it to the 'name' column in the database
      await prisma.chapter.create({ data: { name: title || name, subjectId } });
    }
    return NextResponse.json({ success: true });
  } catch (error) { 
    return NextResponse.json({ error: "Failed to create", details: String(error) }, { status: 500 }); 
  }
}
