import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyServerAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session || (session.role !== "ADMIN" && session.role !== "TEACHER")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, chapterId, videoUrl, pdfUrl, orderIndex } = await req.json();
    await prisma.lesson.create({
      data: { title, chapterId, videoUrl: videoUrl || "", pdfUrl: pdfUrl || "", orderIndex: orderIndex || 1 } as any
    });
    return NextResponse.json({ success: true });
  } catch (error) { 
    return NextResponse.json({ error: "Failed to deploy lesson", details: String(error) }, { status: 500 }); 
  }
}
