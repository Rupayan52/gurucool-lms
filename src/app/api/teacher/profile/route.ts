import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string, role: string };
    
    if (decoded.role !== "TEACHER" && decoded.role !== "FACULTY") {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        mentoredSubjects: {
          select: { id: true, name: true, description: true }
        }
      }
    });

    if (!teacher) return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
