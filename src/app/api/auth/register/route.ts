import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit)(ip, 5, 60000)) return NextResponse.json({ error: "Too many registrations." }, { status: 429 });

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const { name, email, password } = parsed.data;
    if (await prisma.user.findFirst({ where: { OR: [{ email }, { name }] } })) {
      return NextResponse.json({ error: "User exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hashedPassword, role: 'STUDENT' } });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
