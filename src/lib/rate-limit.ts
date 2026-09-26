// A lightweight in-memory rate limiter to prevent brute-force attacks.
// Note: In a multi-region production environment, this would be backed by Redis (e.g., Upstash).
const rateLimitMap = new Map();

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const requestHistory = rateLimitMap.get(ip) || [];
  const requestsInWindow = requestHistory.filter((timestamp: number) => timestamp > windowStart);
  
  if (requestsInWindow.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  requestsInWindow.push(now);
  rateLimitMap.set(ip, requestsInWindow);
  
  return true; // Allowed
}
