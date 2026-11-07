import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  // Cleanly destroy all potential sessions
  cookieStore.set("token_student", "", { expires: new Date(0), path: "/" });
  cookieStore.set("token_teacher", "", { expires: new Date(0), path: "/" });
  cookieStore.set("auth_token", "", { expires: new Date(0), path: "/" }); // Cleanup legacy
  
  return NextResponse.json({ success: true });
}
