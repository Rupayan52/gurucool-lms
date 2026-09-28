import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subjectId, teacherId } = await req.json();
    if (!subjectId || !teacherId) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    // Create the Free Trial Enrollment Cohort
    await prisma.subjectCohort.upsert({
      where: { studentId_subjectId: { studentId: session.userId, subjectId } },
      update: { teacherId },
      create: { studentId: session.userId, subjectId, teacherId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 });
  }
}
