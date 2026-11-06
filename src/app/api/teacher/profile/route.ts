import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
  if (decoded.role !== "TEACHER" && decoded.role !== "FACULTY") throw new Error("Forbidden");
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await authenticate();
    
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, avatarUrl: true, bio: true, createdAt: true, // Fixed missing createdAt
        teacherRegistrations: {
          select: {
            subject: {
              select: { 
                id: true, 
                name: true, 
                registrations: {
                  select: {
                    createdAt: true,
                    student: { select: { id: true, name: true, email: true, avatarUrl: true } }
                  }
                } 
              }
            }
          }
        }
      }
    });

    const allSubjects = await prisma.subject.findMany({
      select: { id: true, name: true }
    });

    return NextResponse.json({ teacher, allSubjects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await authenticate();
    const { name, bio, avatarUrl } = await req.json();
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatarUrl !== undefined && { avatarUrl }) }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
