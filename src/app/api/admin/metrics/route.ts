import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// THIS LINE FIXES THE ISSUE - It forces Next.js to fetch live data every single time
export const dynamic = "force-dynamic"; 

export async function GET() {
  try {
    const [totalStudents, activePaid, offlineBatches, pendingDoubts, recentUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.subscription.count({ where: { planType: 'PAID_DIGITAL', isActive: true } }),
      prisma.subscription.count({ where: { planType: 'OFFLINE_BATCH', isActive: true } }),
      // @ts-ignore
      prisma.doubtTicket.count({ where: { status: 'PENDING' } }),
      prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { subscription: true }
      })
    ]);

    const recentSignups = recentUsers.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.subscription?.planType || 'FREE',
      date: new Date(user.createdAt).toLocaleDateString()
    }));

    return NextResponse.json({
      metrics: { totalStudents, activePaid, offlineBatches, pendingDoubts },
      recentSignups
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
