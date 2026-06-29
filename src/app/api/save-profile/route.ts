import { NextRequest, NextResponse } from "next/server"
import { saveProfileToSupabase } from "@/lib/supabase"
import { FitProfile } from "@/types/quiz"

export async function POST(req: NextRequest) {
  try {
    const profile: FitProfile = await req.json()
    
    const result = await saveProfileToSupabase(profile)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Save Profile Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
