import { NextRequest, NextResponse } from "next/server"
import { processVoiceInput } from "@/lib/claude"

export const runtime = 'edge'

// Very basic in-memory rate limit for edge (since we don't have Redis set up)
// In production on Vercel, @vercel/kv is typically used. 
// For this demo, a simple Map works well enough per-isolate.
const rateLimitMap = new Map<string, { count: number, timestamp: number }>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1"
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  const maxRequests = 20

  const record = rateLimitMap.get(ip)
  if (record && now - record.timestamp < windowMs) {
    if (record.count >= maxRequests) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }
    record.count += 1
  } else {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
  }

  try {
    const { currentQuestionPrompt, validOptions, userSpeech } = await req.json()
    
    if (!currentQuestionPrompt || !userSpeech) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await processVoiceInput(
      currentQuestionPrompt,
      JSON.stringify(validOptions || []),
      userSpeech
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Voice AI Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
