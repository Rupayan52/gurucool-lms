import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { verifyServerAuth } from "@/lib/auth";

// FORCE VERCEL TO NEVER CACHE THIS ROUTE
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const room = url.searchParams.get("room");
    // Explicitly check if the request is coming from the Teacher Studio
    const isBroadcaster = url.searchParams.get("broadcaster") === "true";

    if (!room) return NextResponse.json({ error: "Room ID is required" }, { status: 400 });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Enterprise WebRTC keys missing in .env" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.userId || `user_${Math.random()}`,
      name: (session as any).name || (isBroadcaster ? "Faculty Member" : "Student"),
    });

    // Generate JWT with forced publish rights if requested
    at.addGrant({ 
      roomJoin: true, 
      room, 
      canPublish: isBroadcaster, 
      canSubscribe: true 
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate transmission token" }, { status: 500 });
  }
}
