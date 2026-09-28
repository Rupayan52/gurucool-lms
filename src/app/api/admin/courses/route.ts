import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const classes = await prisma.course.findMany({
      include: { subjects: { include: { chapters: true } } }
    });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
