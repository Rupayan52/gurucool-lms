import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, chapterId, videoUrl, pdfUrl, orderIndex } = await req.json();
    if (!title || !chapterId) return NextResponse.json({ error: "Title and Chapter are required" }, { status: 400 });

    // Allow empty strings if the user skips the optional fields
    await prisma.lesson.create({
      data: {
        title,
        chapterId,
        videoUrl: videoUrl || "",
        pdfUrl: pdfUrl || "",
        orderIndex: orderIndex || 1
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) { 
    return NextResponse.json({ error: "Failed to deploy lesson" }, { status: 500 }); 
  }
}
