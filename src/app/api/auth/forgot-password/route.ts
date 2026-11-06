import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { identifier } = await jsonOrNull(req);
    if (!identifier) return NextResponse.json({ error: "Missing identifier" }, { status: 400 });

    const cleanIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanIdentifier, mode: 'insensitive' } },
          { name: { equals: cleanIdentifier, mode: 'insensitive' } }
        ]
      }
    });

    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000);

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt }
    });

    // Foolproof Absolute URL Construction
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "gurucool-ktnwni1ys-gurukool1.vercel.app";
    const origin = req.headers.get("origin") || (protocol + "://" + host);
    const resetUrl = origin + "/reset-password?token=" + token;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"GuruCool Support" <' + process.env.SMTP_EMAIL + '>',
      to: user.email,
      subject: "Reset your GuruCool Password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #3B82F6;">GuruCool Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to set a new password securely.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Reset Secure Password</a>
          <p style="margin-top: 20px; color: #64748b; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
          <p style="margin-top: 20px; font-size: 10px; color: #94a3b8;">If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="font-size: 10px; color: #3B82F6; word-break: break-all;">${resetUrl}</p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mailer Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

async function jsonOrNull(req: Request) {
  try { return await req.json(); } catch { return {}; }
}
