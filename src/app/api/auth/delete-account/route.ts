import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { userId: string };

    const request = await prisma.deletionRequest.findUnique({
      where: { userId: decoded.userId }
    });

    if (!request || request.pin !== pin) {
      return NextResponse.json({ error: "Invalid 6-digit PIN" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: decoded.userId }
    });

    cookieStore.delete("auth_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
