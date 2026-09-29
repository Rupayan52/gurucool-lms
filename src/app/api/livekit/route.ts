import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { verifyServerAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await verifyServerAuth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const room = url.searchParams.get("room");
    if (!room) return NextResponse.json({ error: "Room ID is required" }, { status: 400 });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "Enterprise WebRTC keys missing in .env" }, { status: 500 });
    }

    // BUG FIX: Added "FACULTY" to the authorization matrix. 
    // This explicitly grants the 'canPublish' WebRTC right, unlocking the Camera/Mic controls.
    const role = (session.role || "").toUpperCase();
    const canPublish = role === "TEACHER" || role === "ADMIN" || role === "FACULTY";

    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.userId,
      name: (session as any).name || "Faculty Member",
    });

    // Generate JWT with corrected publish rights
    at.addGrant({ 
      roomJoin: true, 
      room, 
      canPublish: canPublish, 
      canSubscribe: true 
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate transmission token" }, { status: 500 });
  }
}
