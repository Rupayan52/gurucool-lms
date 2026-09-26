import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 10, 60000)) return NextResponse.json({ error: "Too many submissions." }, { status: 429 });

    const { quizId, answers } = await req.json();
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const questions = quiz.questions as Array<{ id: string; correctOption: number }>;
    let score = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctOption) score += 1; });

    const percentage = Math.round((score / questions.length) * 100);
    await prisma.quizScore.create({ data: { userId: decoded.userId, quizId, score: percentage } });

    return NextResponse.json({ success: true, score: percentage });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
