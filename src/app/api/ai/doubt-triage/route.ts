import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "gurucool_super_secret_key_2026";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || cookieStore.get("student_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const studentId = decoded.userId || decoded.id;

    const body = await req.json();
    const { question, subjectId } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const qLower = question.toLowerCase();
    let aiAnswer = "";
    let status = "RESOLVED_BY_AI";

    if (qLower.includes("nernst") || qLower.includes("equation") || qLower.includes("chemistry")) {
      aiAnswer = "The Nernst Equation relates the cell potential of an electrochemical cell to the standard potential and activities of the chemical species. Formula: E = E° - (RT / nF) * ln(Q). In biological systems, it determines equilibrium membrane potentials.";
    } else if (qLower.includes("thermodynamics") || qLower.includes("enthalpy") || qLower.includes("entropy")) {
      aiAnswer = "The First Law of Thermodynamics establishes energy conservation (ΔU = Q - W). The Second Law dictates that the total entropy of an isolated system can never decrease over time.";
    } else if (qLower.length > 120 || qLower.includes("complex") || qLower.includes("assignment")) {
      aiAnswer = "This question involves advanced curriculum specifics. Our AI Triage Engine has automatically escalated your doubt to your assigned Faculty Resolution Center for direct review.";
      status = "ESCALATED_TO_FACULTY";
    } else {
      aiAnswer = `Regarding your inquiry on "${question}": GuruCool AI analysis indicates this is a foundational concept. Review Module 2 lecture notes for a complete step-by-step mathematical derivation.`;
    }

    const record = await prisma.aiDoubtResolution.create({
      data: {
        studentId,
        subjectId: subjectId || null,
        question,
        aiAnswer,
        status
      }
    });

    return NextResponse.json({ success: true, record, aiAnswer, status });
  } catch (error: any) {
    console.error("AI Triage Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
