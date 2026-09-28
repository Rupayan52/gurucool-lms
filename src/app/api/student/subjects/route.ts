import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  const session = await verifyServerAuth();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(subjects);
}
