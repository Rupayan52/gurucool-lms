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
    
    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.deletionRequest.upsert({
      where: { userId: decoded.userId },
      update: { pin },
      create: { userId: decoded.userId, pin }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to request deletion" }, { status: 500 });
  }
}
