"use client"

import * as React from "react"
import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Ruler, Scale, CircleDashed, Maximize, ScanLine, ArrowUpToLine, ArrowDownToLine, Truck, AlertCircle } from "lucide-react"
import { FitProfile } from "@/types/quiz"

function CompletionScreenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = searchParams?.get("fitProfileId") || "unknown"
  
  const [profile, setProfile] = React.useState<Partial<FitProfile> | null>(null)

  React.useEffect(() => {
    const saved = localStorage.getItem("jj_last_profile") || localStorage.getItem("jj_quiz_draft")
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<FitProfile>
        queueMicrotask(() => setProfile(parsed))
      } catch {}
    }
  }, [])

  const handleContinue = () => {
    window.location.href = `https://jackie-jeans.vercel.app/?fitProfileId=${profileId}`
  }

  // Fallback data if localstorage is empty to match mockup exactly
  const data = profile || {
    height: "5' 6\"",
    weight: 138,
    waist: '30"',
    hip: '38"',
    waistFit: "slightly_relaxed",
    rise: "mid",
    thighFit: "relaxed",
    brands: ["Levi's", "H&M", "Lee"],
    fitFrustration: "hip_tightness"
  }

  const formatBrands = (brands: string[]) => {
    if (!brands || brands.length === 0) return "None"
    return brands.join(", ")
  }

  return (
    <main className="min-h-[100dvh] bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Top Nav */}
      <div className="w-full flex-shrink-0 px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="w-20" /> {/* Spacer to center title */}
          <span className="font-bold text-[11px] tracking-[0.15em] text-white">
            JACKIE JEANS
          </span>
          <button 
            onClick={() => router.push("/")}
            className="text-[#E05C2B] text-[11px] font-medium border border-[#E05C2B] px-3 py-1.5 rounded-md hover:bg-[#E05C2B]/10 transition-colors"
          >
            End chat
          </button>
        </div>
      </div>
      
      <div className="flex-1 px-6 pt-8 pb-32 flex flex-col max-w-lg mx-auto w-full">
        <h1 className="text-[24px] font-medium text-white mb-5">
          Here&apos;s your fit profile
        </h1>
        
        <div className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-[16px] p-4 flex flex-col shadow-2xl">
          <SummaryRow icon={<Ruler className="w-4 h-4" />} label="Height" value={data.height || "-"} />
          <SummaryRow icon={<Scale className="w-4 h-4" />} label="Weight" value={data.weight ? `${data.weight} lbs` : "-"} />
          <SummaryRow icon={<CircleDashed className="w-4 h-4" />} label="Waist" value={formatInches(data.waist)} />
          <SummaryRow icon={<ScanLine className="w-4 h-4" />} label="Hip" value={formatInches(data.hip)} />
          <SummaryRow icon={<Maximize className="w-4 h-4" />} label="Waist fit" value={formatLabel(data.waistFit)} />
          <SummaryRow icon={<ArrowUpToLine className="w-4 h-4" />} label="Rise" value={formatRise(data.rise)} />
          <SummaryRow icon={<ArrowDownToLine className="w-4 h-4" />} label="Thigh fit" value={formatLabel(data.thighFit)} />
          <SummaryRow icon={<Truck className="w-4 h-4" />} label="Brands" value={formatBrands(data.brands || [])} />
          <SummaryRow icon={<AlertCircle className="w-4 h-4" />} label="Main frustration" value={formatLabel(data.fitFrustration)} isLast />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 px-6 py-6 bg-gradient-to-t from-black via-black to-transparent z-30 flex flex-col items-center">
        <div className="w-full max-w-lg">
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-[#E05C2B] hover:bg-[#c24a1f] text-white py-[14px] rounded-[10px] font-medium transition-all duration-300 text-[15px] mb-3"
          >
            Looks good, continue <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[#666] text-[12px] text-center">
            You can edit anything later.
          </p>
        </div>
      </div>
    </main>
  )
}

function SummaryRow({ icon, label, value, isLast }: { icon: React.ReactNode, label: string, value: string, isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-[#1A1A1A]' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-[#666]">
          {icon}
        </div>
        <span className="text-[#888] text-[13px] tracking-wide">{label}</span>
      </div>
      <span className="text-[#E8E8E8] font-medium text-[13px] text-right truncate max-w-[60%]">
        {value}
      </span>
    </div>
  )
}

function formatLabel(value?: string) {
  if (!value) return "-"
  const text = value.replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatRise(value?: string) {
  if (!value) return "-"
  return `${formatLabel(value)} rise`
}

function formatInches(value?: string | number) {
  if (!value) return "-"
  const text = String(value)
  return text.includes('"') ? text : `${text}"`
}

export function CompletionScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CompletionScreenContent />
    </Suspense>
  )
}
