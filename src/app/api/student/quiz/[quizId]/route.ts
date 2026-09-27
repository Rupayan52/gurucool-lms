import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request, props: { params: Promise<{ quizId: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 30, 60000))) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    // Next.js 16 requirement: await the params
    const params = await props.params;
    const quiz = await prisma.quiz.findUnique({ where: { id: params.quizId } });
    
    if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const questions = quiz.questions as Array<{ question: string; options: string[]; correctOption: number }>;
    const sanitizedQuestions = questions.map(q => ({ question: q.question, options: q.options }));

    return NextResponse.json({ title: quiz.title, questions: sanitizedQuestions });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
