import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Failed to fetch catalog:", error);
    return NextResponse.json([], { status: 500 });
  }
}
