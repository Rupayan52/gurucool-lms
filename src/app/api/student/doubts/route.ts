import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyServerAuth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await verifyServerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doubts = await prisma.doubtTicket.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(doubts);
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 10, 60000))) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const session = await verifyServerAuth();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Only active scholars can submit doubts." }, { status: 403 });
    }

    const { subject, question } = await req.json();
    
    // SECURITY: Force the doubt ticket to lock to the verified JWT userId, NOT client input
    await prisma.doubtTicket.create({
      data: { userId: session.userId, subject, question, status: "OPEN" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit doubt" }, { status: 500 });
  }
}
