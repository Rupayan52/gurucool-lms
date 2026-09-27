import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  // Next.js 15+ native strict deletion
  cookieStore.delete("auth_token");
  cookieStore.delete("user_role");
  return NextResponse.json({ success: true });
}
