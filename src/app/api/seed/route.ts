import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Check if data already exists to prevent duplicates
    const existing = await prisma.courseClass.findFirst();
    if (existing) {
      return NextResponse.json({ message: "Database already seeded!" });
    }

    // Create Class -> Subject -> Chapter -> Lesson hierarchy
    await prisma.courseClass.create({
      data: {
        name: "Class 10",
        subjects: {
          create: [
            {
              name: "Physics",
              chapters: {
                create: [
                  {
                    name: "Light - Reflection and Refraction",
                    lessons: {
                      create: [
                        { title: "Introduction to Optics", orderIndex: 1, videoUrl: "https://example.com/vid1" },
                        { title: "Spherical Mirrors", orderIndex: 2, pdfUrl: "https://example.com/notes1.pdf" }
                      ]
                    }
                  }
                ]
              }
            },
            {
              name: "Biology",
              chapters: {
                create: [
                  {
                    name: "Life Processes",
                    lessons: {
                      create: [
                        { title: "Nutrition in Plants", orderIndex: 1 },
                        { title: "Human Digestive System", orderIndex: 2 }
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

    return NextResponse.json({ message: "Dummy curriculum injected successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
