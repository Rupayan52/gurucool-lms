import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // The schema uses Subject as the top-level entity. We fetch subjects and chapters directly.
    const subjects = await prisma.subject.findMany({
      include: { chapters: true }
    });
    
    // Wrap the subjects in a single parent array to satisfy the frontend UI's hierarchy expectations
    return NextResponse.json([
      {
        id: "core-curriculum",
        name: "Core Curriculum",
        subjects: subjects
      }
    ]);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
