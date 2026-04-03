import { NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting (in a real app, use Redis)
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export async function checkRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  
  const record = rateLimitStore.get(ip);
  
  if (!record) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return null;
  }
  
  if (now - record.timestamp > WINDOW_MS) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return null;
  }
  
  if (record.count >= MAX_REQUESTS) {
    return new NextResponse("Too many requests, please try again later.", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((WINDOW_MS - (now - record.timestamp)) / 1000).toString(),
      },
    });
  }
  
  record.count += 1;
  rateLimitStore.set(ip, record);
  
  return null;
}
