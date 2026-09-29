import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const room = url.searchParams.get("room");
    if (!room) return NextResponse.json({ error: "Room ID is required" }, { status: 400 });

    // HARDCODED KEYS to bypass Vercel environment variable corruption
    const apiKey = "APIHcC8hozAjQXK";
    const apiSecret = "2uHKoRBH3zLlVAM6lxnrunwor58R7fwtYqIFTzReC2f";

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `FACULTY_${Math.floor(Math.random() * 100000)}`,
      name: "Faculty Broadcaster",
    });

    at.addGrant({ 
      roomJoin: true, 
      room, 
      canPublish: true, 
      canSubscribe: true 
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
