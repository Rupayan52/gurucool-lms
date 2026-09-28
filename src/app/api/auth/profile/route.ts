import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function GET() {
  const session = await verifyServerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const user = await prisma.user.findUnique({ 
    where: { id: session.userId },
    select: { name: true, email: true, role: true, createdAt: true }
  });
  
  return NextResponse.json(user);
}
