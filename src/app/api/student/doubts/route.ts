import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 5, 60000)) return NextResponse.json({ error: "Spam detected." }, { status: 429 });

    const { subject, question } = await req.json();
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    await prisma.doubtTicket.create({ data: { userId: decoded.userId, subject, question } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 30, 60000)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };
    const tickets = await prisma.doubtTicket.findMany({ where: { userId: decoded.userId }, orderBy: { createdAt: 'desc' } });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
