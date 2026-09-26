import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Upsert subscription to PREMIUM
    await prisma.subscription.upsert({
      where: { userId: decoded.userId },
      update: { planType: "PREMIUM", isActive: true, endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      create: { userId: decoded.userId, planType: "PREMIUM", endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Upgrade failed" }, { status: 500 });
  }
}
