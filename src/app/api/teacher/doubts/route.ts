import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { verifyServerAuth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 20, 60000))) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const session = await verifyServerAuth();
    // Only Teachers and Admins can resolve doubts
    if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Cryptographic clearance denied." }, { status: 403 });
    }

    const { ticketId, answer } = await req.json();
    await prisma.doubtTicket.update({ where: { id: ticketId }, data: { answer, status: "RESOLVED" } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to resolve doubt" }, { status: 500 });
  }
}
