import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

// ABSOLUTE CACHE BUSTING
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const room = url.searchParams.get("room");
    
    if (!room) return NextResponse.json({ error: "Room ID is required" }, { status: 400 });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Keys missing in .env" }, { status: 500 });
    }

    // BRUTE-FORCE OVERRIDE: No session checking. If this API is hit, you get Publisher rights.
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `FACULTY_OVERRIDE_${Math.floor(Math.random() * 100000)}`,
      name: "Faculty Broadcaster",
    });

    at.addGrant({ 
      roomJoin: true, 
      room, 
      canPublish: true, // FORCED TRUE
      canSubscribe: true, 
      canPublishData: true
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
  }
}
