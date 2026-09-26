import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { quizId, answers } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Parse JSON questions to grade securely on the server
    const questions = quiz.questions as Array<{ id: string; correctOption: number }>;
    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.correctOption) score += 1;
    });

    const percentage = Math.round((score / questions.length) * 100);

    await prisma.quizScore.create({
      data: { userId: decoded.userId, quizId, score: percentage }
    });

    return NextResponse.json({ success: true, score: percentage });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
