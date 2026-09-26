import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Force Next.js to always fetch live scores instead of caching
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    const scores = await prisma.quizScore.findMany({
      where: { userId: decoded.userId },
      include: {
        quiz: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedScores = scores.map(score => {
      // Prisma stores the questions as JSON, so we cast it to an array to get the length
      const questionsArray = score.quiz.questions as any[];
      return {
        id: score.id,
        quizTitle: score.quiz.title,
        subjectName: score.quiz.chapter.subject.name,
        rawScore: score.score,
        totalQuestions: questionsArray.length,
        date: new Date(score.createdAt).toLocaleDateString()
      };
    });

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error("Score fetch error:", error);
    return NextResponse.json({ error: "Failed to load scores" }, { status: 500 });
  }
}
