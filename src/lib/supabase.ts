import { FitProfile } from "@/types/quiz"

export async function saveProfileToSupabase(profile: FitProfile) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Mock save
    console.log("[MOCK SUPABASE] Saving profile:", profile)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { id: `mock-${Date.now()}`, success: true }
  }

  // Real Supabase insert using direct fetch (no client library needed for a simple insert)
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/fit_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        height: profile.height,
        weight: profile.weight,
        waist: profile.waist,
        hip: profile.hip,
        waist_fit: profile.waistFit,
        rise: profile.rise,
        thigh_fit: profile.thighFit,
        brands: profile.brands,
        brand_sizes: profile.brandSizes,
        fit_frustration: profile.fitFrustration,
        flow: profile.flow
      })
    })

    if (!res.ok) {
      throw new Error(`Supabase error: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    return { id: data[0].id, success: true }
  } catch (error) {
    console.error("Failed to save to Supabase", error)
    throw error
  }
}
