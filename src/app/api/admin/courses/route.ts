import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Return pure Subjects mapped directly from the database schema
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
      include: { chapters: true }
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
