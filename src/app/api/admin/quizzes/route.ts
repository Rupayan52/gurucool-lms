import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 15, 60000))) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

    const { title, chapterId, questions } = await req.json();
    await prisma.quiz.create({
      data: { title, chapterId, questions }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
