import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
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

    // Safely construct the exact URL using strict string concatenation
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "gurucool-ktnwni1ys-gurukool1.vercel.app";
    const resetUrl = protocol + "://" + host + "/reset-password?token=" + token;

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
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mailer Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
