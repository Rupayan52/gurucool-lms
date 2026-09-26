import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.courseClass.findMany({
      include: {
        subjects: {
          include: {
            chapters: {
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            }
          }
        }
      }
    });
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
