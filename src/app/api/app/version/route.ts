import { NextResponse } from "next/server";

const BOOT_SIGNATURE =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  "gurucool-mobile-v2";

export async function GET() {
  return NextResponse.json(
    {
      version: BOOT_SIGNATURE,
      timestamp: Date.now()
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
}
