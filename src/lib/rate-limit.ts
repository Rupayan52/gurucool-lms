import { prisma } from "@/lib/prisma";

export async function rateLimit(ip: string, limit: number, windowMs: number) {
  const windowStart = new Date(Date.now() - windowMs);

  try {
    // 1. Clean up old records for this IP to keep the table small and fast
    await prisma.rateLimit.deleteMany({
      where: { ip, createdAt: { lt: windowStart } }
    });

    // 2. Count active hits in the current window across ALL Vercel instances
    const hits = await prisma.rateLimit.count({
      where: { ip, createdAt: { gte: windowStart } }
    });

    // 3. Block if the distributed limit is reached
    if (hits >= limit) return false;

    // 4. Register the new hit globally
    await prisma.rateLimit.create({ data: { ip } });
    return true;
  } catch (error) {
    console.error("Rate limit DB error:", error);
    return true; // Fail open: don't block legitimate users if DB has a brief hiccup
  }
}
