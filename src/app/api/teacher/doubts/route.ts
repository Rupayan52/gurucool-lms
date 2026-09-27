import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 20, 60000))) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const { ticketId, answer } = await req.json();
    
    await prisma.doubtTicket.update({
      where: { id: ticketId },
      data: { answer, status: "RESOLVED" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to resolve doubt" }, { status: 500 });
  }
}
