import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  // The crucial fix: Force the browser to delete the cookie across the entire domain
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  return NextResponse.json({ success: true });
}
