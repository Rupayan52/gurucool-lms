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

    const { title, chapterId, questions } = await req.json();
    await prisma.quiz.create({ data: { title, chapterId, questions } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
