import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check if a quiz exists. If not, auto-seed a dummy course structure and quiz.
    let quiz = await prisma.quiz.findFirst();
    
    if (!quiz) {
      const courseClass = await prisma.courseClass.create({ data: { name: 'Class 12 - Science' } });
      const subject = await prisma.subject.create({ data: { name: 'Biology', courseClassId: courseClass.id } });
      const chapter = await prisma.chapter.create({ data: { name: 'Cellular Respiration', subjectId: subject.id } });
      
      quiz = await prisma.quiz.create({
        data: {
          title: 'Cellular Energy & ATP',
          chapterId: chapter.id,
          questions: [
            { q: "What is often referred to as the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"], answer: 1 },
            { q: "Which process produces the greatest amount of ATP?", options: ["Glycolysis", "Krebs Cycle", "Electron Transport Chain", "Fermentation"], answer: 2 },
            { q: "What is the primary byproduct of cellular respiration?", options: ["Oxygen", "Carbon Dioxide", "Glucose", "Lactic Acid"], answer: 1 }
          ]
        }
      });
    }
    
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load assessment" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    const { quizId, score } = await req.json();
    
    const quizScore = await prisma.quizScore.create({
      data: { userId: decoded.userId, quizId, score }
    });
    
    return NextResponse.json(quizScore, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
