import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lessonId = url.searchParams.get("room") || `room-${Date.now()}`;
    const roomName = `lms-${lessonId.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}`; // Sanitize for Daily

    const apiKey = process.env.DAILY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "CRITICAL: DAILY_API_KEY is missing in Vercel." }, { status: 500 });

    // STEP 1: Provision the Serverless Room
    const roomRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "public",
        properties: {
          exp: Math.round(Date.now() / 1000) + (86400 * 2), // 48 hour expiry
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: false,
          start_video_off: false,
        },
      }),
    });

    const room = await roomRes.json();
    if (room.error && room.error !== "invalid-request-error") {
      throw new Error(room.info || room.error);
    }

    const finalRoomUrl = room.url;

    // STEP 2: Generate the cryptographic Owner Token (The Silver Bullet)
    const tokenRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true, // Forces the iframe to bypass all locks
          user_name: "Faculty Admin",
        },
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error("Token Generation Failed: " + tokenData.info);

    return NextResponse.json({ 
      url: finalRoomUrl, 
      token: tokenData.token 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
