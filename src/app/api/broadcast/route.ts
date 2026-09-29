import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const roomName = url.searchParams.get("room") || `lesson-${Math.floor(Math.random() * 10000)}`;

    const apiKey = process.env.DAILY_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Daily API Key missing" }, { status: 500 });

    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: "public",
        properties: {
          exp: Math.round(Date.now() / 1000) + 86400,
          // Removed the enable_recording property entirely to bypass the Daily Free Tier block
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: true,
          start_video_off: true,
        },
      }),
    });

    const room = await response.json();
    if (room.error) throw new Error(room.info || room.error);

    return NextResponse.json({ url: room.url, roomName: room.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
