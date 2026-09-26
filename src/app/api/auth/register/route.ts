import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash the password securely before storing
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "STUDENT"
      },
    });

    return NextResponse.json({ 
      message: "User created successfully", 
      user: { id: user.id, email: user.email, role: user.role } 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
