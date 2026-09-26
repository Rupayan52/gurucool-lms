import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  // CRITICAL SECURITY: Immediately reject requests if deployed to Vercel production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Database seeding is permanently disabled in production." }, { status: 403 });
  }

  try {
    // Only allow this to run locally on your machine
    await prisma.user.deleteMany();
    await prisma.courseClass.deleteMany();

    const hashedPassword = await bcrypt.hash("guru2026", 10);
    await prisma.user.create({
      data: { name: "admin", email: "admin@gurucool.com", passwordHash: hashedPassword, role: "ADMIN" }
    });

    return NextResponse.json({ success: true, message: "Local Database Seeded." });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
