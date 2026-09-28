import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  const session = await verifyServerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Safely fetch teachers and subjects in one unblocked public route
  const teachers = await prisma.user.findMany({ where: { role: "TEACHER" }, select: { id: true, name: true } });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  
  return NextResponse.json({ teachers, subjects });
}
