import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  
  if (username === "admin" && password === "guru2026") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "active", { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      maxAge: 60 * 60 * 24 // 24 hours
    });
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
