import { NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: { limit: number; windowMs: number }) {
  return function check(req: NextRequest): { success: boolean; remaining: number } {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || record.resetTime < now) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + options.windowMs });
      return { success: true, remaining: options.limit - 1 };
    }

    if (record.count >= options.limit) {
      return { success: false, remaining: 0 };
    }

    record.count++;
    return { success: true, remaining: options.limit - record.count };
  };
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);
