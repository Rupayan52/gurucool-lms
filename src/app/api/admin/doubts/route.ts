import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tickets = await prisma.doubtTicket.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(tickets);
}

export async function PATCH(req: Request) {
  const { ticketId, status } = await req.json();
  await prisma.doubtTicket.update({
    where: { id: ticketId },
    data: { status }
  });
  return NextResponse.json({ success: true });
}
