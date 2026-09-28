import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyServerAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 15, 60000))) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

    const session = await verifyServerAuth();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Cryptographic clearance denied." }, { status: 403 });
    }

    const { title, chapterId, videoUrl, pdfUrl, orderIndex } = await req.json();
    await prisma.lesson.create({ data: { title, chapterId, videoUrl, pdfUrl, orderIndex: parseInt(orderIndex) || 1 } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
