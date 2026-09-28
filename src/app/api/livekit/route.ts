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

    const isTeacher = session.role === "TEACHER" || session.role === "ADMIN";

    // Generate cryptographic token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.userId,
      name: session.name,
    });

    // Teachers can broadcast (publish), Students can only watch (subscribe)
    at.addGrant({ 
      roomJoin: true, 
      room, 
      canPublish: isTeacher, 
      canSubscribe: true 
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate transmission token" }, { status: 500 });
  }
}
