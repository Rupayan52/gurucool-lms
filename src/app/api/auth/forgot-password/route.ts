import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    if (!(await rateLimit(ip, 3, 60000))) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const { identifier } = await req.json();
    
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { name: identifier }] }
    });

    if (!user) return NextResponse.json({ success: true }); // Fail silently for security

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expiresAt }
    });

    const resetUrl = `${req.headers.get("origin")}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"GuruCool Support" <${process.env.SMTP_EMAIL}>`,
      to: user.email,
      subject: "Reset your GuruCool Password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">GuruCool Password Reset</h2>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; color: #64748b; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mailer Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
