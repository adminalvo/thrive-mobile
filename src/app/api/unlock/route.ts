export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // 1. IP / Client Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = checkRateLimit(`unlock:${ip}`, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { 
          success: false, 
          error: `Çoxsaylı uğursuz cəhd. Zəhmət olmasa ${waitMinutes} dəqiqə sonra yenidən cəhd edin.` 
        }, 
        { status: 429 }
      );
    }

    const { passcode } = await req.json();
    const validPasscode = process.env.SITE_PASSCODE || "9FA874";

    if (passcode === validPasscode) {
      // Reset rate limiter on successful authentication
      resetRateLimit(`unlock:${ip}`);

      const cookieStore = await cookies();
      cookieStore.set("site_unlocked", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Yanlış keçid kodu. Qalan cəhdlər: ${rateLimit.remaining}` 
      }, 
      { status: 401 }
    );
  } catch (error) {
    console.error("Unlock route error:", error);
    return NextResponse.json({ success: false, error: "Daxili server xətası" }, { status: 500 });
  }
}
