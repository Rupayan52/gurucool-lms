import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function authenticateStudent() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("token_student")?.value ||
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("token_teacher")?.value;
  if (!token) throw new Error("Unauthorized");
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "fallback_secret"
  ) as { userId: string; role: string };
  return decoded.userId;
}

export async function GET() {
  try {
    const userId = await authenticateStudent();

    const [user, existingExtended, registrations, quizAttempts, submissions, doubts] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            bio: true,
            createdAt: true
          }
        }),
        prisma.studentProfile.findUnique({
          where: { userId }
        }),
        prisma.registration.findMany({
          where: { studentId: userId },
          include: {
            subject: {
              include: {
                teacherRegistrations: {
                  include: {
                    teacher: { select: { id: true, name: true, email: true, avatarUrl: true } }
                  }
                }
              }
            }
          }
        }),
        prisma.academicQuizAttempt.findMany({
          where: { studentId: userId },
          include: { quiz: { select: { title: true, subjectId: true } } },
          orderBy: { submittedAt: "desc" }
        }),
        prisma.academicSubmission.findMany({
          where: { studentId: userId },
          include: { assignment: { select: { title: true, maxMarks: true, subjectId: true } } },
          orderBy: { submittedAt: "desc" }
        }),
        prisma.academicDoubt.findMany({
          where: { studentId: userId },
          orderBy: { createdAt: "desc" }
        })
      ]);

    if (!user) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const extended =
      existingExtended ||
      (await prisma.studentProfile.create({
        data: { userId }
      }));

    // Calculate verified transcript metrics
    let quizEarned = 0;
    let quizMax = 0;
    quizAttempts.forEach(a => {
      quizEarned += a.score;
      quizMax += a.maxScore;
    });
    const quizAverage = quizMax > 0 ? Math.round((quizEarned / quizMax) * 100) : null;

    let assignEarned = 0;
    let assignMax = 0;
    const gradedSubs = submissions.filter(s => s.status === "GRADED" && s.awardedMarks !== null);
    gradedSubs.forEach(s => {
      assignEarned += s.awardedMarks || 0;
      assignMax += s.assignment.maxMarks;
    });
    const assignmentAverage = assignMax > 0 ? Math.round((assignEarned / assignMax) * 100) : null;

    const enrolledCourses = registrations.map(reg => ({
      subjectId: reg.subject.id,
      subjectName: reg.subject.name,
      enrolledAt: reg.createdAt,
      mentors: reg.subject.teacherRegistrations.map(tr => tr.teacher.name)
    }));

    return NextResponse.json({
      user,
      extended,
      transcript: {
        enrolledCourses,
        quizzesCompleted: quizAttempts.length,
        quizAverage,
        assignmentsSubmitted: submissions.length,
        assignmentsGraded: gradedSubs.length,
        assignmentAverage,
        totalDoubtsAsked: doubts.length,
        doubtsResolved: doubts.filter(d => d.status === "RESOLVED").length,
        recentQuizAttempts: quizAttempts.slice(0, 5),
        recentSubmissions: submissions.slice(0, 5)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await authenticateStudent();
    const body = await req.json();

    const {
      name,
      bio,
      avatarUrl,
      headline,
      institution,
      academicLevel,
      targetExam,
      graduationYear,
      phone,
      location,
      dateOfBirth,
      guardianName,
      guardianPhone,
      learningStyle,
      dailyStudyGoalHrs,
      availability,
      careerGoals,
      skillsTags,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      bannerTheme
    } = body;

    // 1. Update core User table fields
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && name.trim() !== "" && { name: name.trim() }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl })
      }
    });

    // 2. Upsert extended StudentProfile fields
    const updatedExtended = await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...(headline !== undefined && { headline }),
        ...(institution !== undefined && { institution }),
        ...(academicLevel !== undefined && { academicLevel }),
        ...(targetExam !== undefined && { targetExam }),
        ...(graduationYear !== undefined && { graduationYear }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(guardianName !== undefined && { guardianName }),
        ...(guardianPhone !== undefined && { guardianPhone }),
        ...(learningStyle !== undefined && { learningStyle }),
        ...(dailyStudyGoalHrs !== undefined && { dailyStudyGoalHrs: Number(dailyStudyGoalHrs) || 4 }),
        ...(availability !== undefined && { availability }),
        ...(careerGoals !== undefined && { careerGoals }),
        ...(skillsTags !== undefined && {
          skillsTags: Array.isArray(skillsTags) ? JSON.stringify(skillsTags) : skillsTags
        }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(portfolioUrl !== undefined && { portfolioUrl }),
        ...(bannerTheme !== undefined && { bannerTheme })
      },
      create: {
        userId,
        headline: headline || null,
        institution: institution || null,
        academicLevel: academicLevel || null,
        targetExam: targetExam || null,
        graduationYear: graduationYear || null,
        phone: phone || null,
        location: location || null,
        dateOfBirth: dateOfBirth || null,
        guardianName: guardianName || null,
        guardianPhone: guardianPhone || null,
        learningStyle: learningStyle || null,
        dailyStudyGoalHrs: Number(dailyStudyGoalHrs) || 4,
        availability: availability || "Available",
        careerGoals: careerGoals || null,
        skillsTags: Array.isArray(skillsTags) ? JSON.stringify(skillsTags) : skillsTags || "[]",
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        bannerTheme: bannerTheme || "INDIGO_CYBER"
      }
    });

    return NextResponse.json({ success: true, extended: updatedExtended });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
