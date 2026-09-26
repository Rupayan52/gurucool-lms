import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await prisma.deletionRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deletion requests" }, { status: 500 });
  }
}
