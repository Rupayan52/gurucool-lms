import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("guru2026", 10);
      await prisma.user.create({
        data: {
          name: "admin",
          email: "admin@gurucool.com",
          passwordHash: hashedPassword,
          role: "ADMIN"
        }
      });
    }

    const classCount = await prisma.courseClass.count();
    if (classCount === 0) {
      await prisma.courseClass.create({
        data: {
          name: "Class 12 - Science",
          subjects: {
            create: [
              {
                name: "Physics",
                chapters: {
                  create: [
                    {
                      name: "Light & Optics",
                      lessons: {
                        create: [
                          { 
                            title: "Introduction to Reflection", 
                            orderIndex: 1,
                            videoUrl: "https://example.com/video1.mp4",
                            pdfUrl: "https://example.com/notes1.pdf"
                          },
                          { 
                            title: "Refraction and Snell's Law", 
                            orderIndex: 2 
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      });
    }

    return NextResponse.json({ success: true, message: "Database seeded and fully synchronized!" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
