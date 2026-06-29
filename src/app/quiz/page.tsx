"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { QUIZ_QUESTIONS } from "@/lib/quiz-config"
import { DropdownSelect, SingleSelect, MultiSelect, NumberInput, BrandSizeEntry } from "@/components/ui/inputs"
import { FitProfile, DenimBrand, BRAND_SIZES } from "@/types/quiz"
import { ChevronLeft, ArrowRight, Menu, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const DRAFT_KEY = "jj_quiz_draft"
const LAST_PROFILE_KEY = "jj_last_profile"
type AnswerValue = FitProfile[keyof FitProfile] | null | string[] | Record<string, string>

const visualByQuestion: Record<string, "model" | "scale" | "ruler" | "hip" | "waist" | "none"> = {
  height: "model",
  weight: "scale",
  waist: "ruler",
  hip: "hip",
  waistFit: "model",
  rise: "none",
  thighFit: "none",
  brands: "none",
  brandSizes: "none",
  fitFrustration: "none",
}

export default function QuizPage() {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [currentIndex, setCurrentIndex] = React.useState(0)
  
  const [answers, setAnswers] = React.useState<Partial<FitProfile>>({
    brands: [],
    brandSizes: {} as Record<string, string>,
    flow: "manual",
  })

  React.useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        if (Object.keys(parsed).length > 0) {
          let lastIndex = 0
          for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
            if (parsed[QUIZ_QUESTIONS[i].id as keyof FitProfile] !== undefined) {
              lastIndex = i
            }
          }
          queueMicrotask(() => {
            setAnswers({ ...parsed, flow: "manual" })
            setCurrentIndex(lastIndex)
          })
        }
      } catch {}
    }
    const lastProfile = localStorage.getItem(LAST_PROFILE_KEY)
    if (!draft && lastProfile) {
      localStorage.removeItem(LAST_PROFILE_KEY)
    }
    queueMicrotask(() => setIsLoaded(true))
  }, [])

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers))
    }
  }, [answers, isLoaded])

  const currentQ = QUIZ_QUESTIONS[currentIndex]
  const selectedBrands = (answers.brands || []) as DenimBrand[]
  const displayPrompt =
    currentQ.id === "brandSizes"
      ? selectedBrands.length > 1
        ? "What size did you buy in these brands?"
        : selectedBrands.length === 1
          ? `What size did you buy in ${selectedBrands[0]}?`
          : "Which denim brands have you bought before?"
      : currentQ.prompt

  React.useEffect(() => {
    if (isLoaded && currentQ.id === "brandSizes" && selectedBrands.length === 0) {
      const brandsIndex = QUIZ_QUESTIONS.findIndex((question) => question.id === "brands")
      queueMicrotask(() => setCurrentIndex(brandsIndex >= 0 ? brandsIndex : 0))
    }
  }, [currentQ.id, isLoaded, selectedBrands.length])
  
  const handleNext = async () => {
    if (currentIndex === QUIZ_QUESTIONS.length - 1) {
      const finalProfile = { ...answers, completedAt: new Date().toISOString() } as FitProfile
      localStorage.setItem(LAST_PROFILE_KEY, JSON.stringify(finalProfile))
      try {
        const res = await fetch("/api/save-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalProfile),
        })
        const data = await res.json()
        localStorage.removeItem(DRAFT_KEY)
        router.push(`/quiz/complete?fitProfileId=${data.id || `local-${Date.now()}`}`)
      } catch {
        router.push(`/quiz/complete?fitProfileId=local-${Date.now()}`)
      }
    } else {
      setCurrentIndex(p => p + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(p => p - 1)
    } else {
      router.push("/")
    }
  }

  const updateAnswer = (val: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val } as Partial<FitProfile>))
  }

  const canContinue = () => {
    if (currentQ.id === "weight") return true 
    if (currentQ.id === "brandSizes") {
      const selected = answers.brands || []
      const sizes = (answers.brandSizes || {}) as Record<string, string>
      return selected.length > 0 && selected.every(b => sizes[b])
    }
    const val = answers[currentQ.id as keyof FitProfile]
    if (Array.isArray(val)) return val.length > 0
    return val !== undefined && val !== null && val !== ""
  }

  if (!isLoaded) return <div className="min-h-screen bg-[#0B0B0B]" />

  if (currentQ.id === "brandSizes" && (!answers.brands || answers.brands.length === 0)) {}

  const getSubtext = (id: string) => {
    switch(id) {
      case "height": return "This helps us recommend the right length for you."
      case "weight": return "Optional - helps us fine tune your fit."
      case "waist": return "Measure around your narrowest point."
      case "hip": return "Measure around the fullest part."
      case "waistFit": return "Pick what feels right."
      case "rise": return "Choose your preferred rise."
      case "thighFit": return "Pick your preference."
      case "brands": return "Select all that apply."
      case "brandSizes": return "Select the size you usually buy."
      case "fitFrustration": return "This helps us personalise your experience."
      default: return ""
    }
  }

  const renderWhyWeAsk = () => {
    const text = (() => {
      switch (currentQ.id) {
        case "height": return "Height helps us nail the perfect inseam for zero hemming worries."
        case "weight": return "Weight helps us understand your body proportions better."
        case "waist": return "Waist is the most important measurement for the perfect fit."
        case "hip": return "Hips determine how your jeans move and feel all day."
        default: return null
      }
    })()
    if (!text) return null
    return (
      <div className="relative z-10 border border-white/10 bg-[#101010]/90 rounded-lg p-4 max-w-[260px] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-3.5 h-3.5 text-[#F06A2A]" />
          <span className="text-[11px] font-semibold text-[#F06A2A]">Why we ask</span>
        </div>
        <p className="text-[#B5B5B5] text-[12px] leading-relaxed">
          {text}
        </p>
      </div>
    )
  }

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_50%_-10%,#1b120e_0%,#080808_42%,#030303_100%)] text-white font-sans flex justify-center selection:bg-[#E05C2B]/30">
      <section className="relative min-h-[100dvh] w-full max-w-[430px] overflow-hidden border-x border-white/10 bg-[#070707] shadow-[0_0_80px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.035),transparent_32%,transparent_68%,rgba(240,106,42,0.04))]" />
      
      {/* Top Nav */}
      <div className="relative z-20 w-full flex-shrink-0 px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-5">
          <button onClick={handleBack} className="flex items-center text-[11px] font-medium text-[#BDBDBD] hover:text-[#F06A2A] transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-[11px] font-bold tracking-[0.06em]">
            JACKIE JEANS
          </span>
          <button className="text-[#BDBDBD] hover:text-[#F06A2A] transition-colors">
            <Menu className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Bar & Counter */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="grid flex-1 grid-cols-10 gap-1">
            {QUIZ_QUESTIONS.map((_, index) => (
              <div key={index} className="h-[3px] overflow-hidden rounded-full bg-white/12">
                <div
                  className={cn("h-full rounded-full bg-[#F06A2A] transition-all duration-300", index <= currentIndex ? "w-full" : "w-0")}
                />
              </div>
            ))}
          </div>
          <span className="text-[9px] text-[#9A9A9A] font-medium">
            Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="relative z-10 flex min-h-[calc(100dvh-86px)] flex-col px-5 pt-7 pb-28">
        
        <div className="mb-5">
          <h2 className="text-[24px] font-medium text-white mb-2 leading-[1.12] tracking-normal max-w-[290px]">
            {displayPrompt}
          </h2>
          <p className="text-[#9A9A9A] text-[12px] max-w-[245px] leading-relaxed">
            {getSubtext(currentQ.id)}
          </p>
        </div>
        
        <div className="relative w-full flex-1 flex flex-col">
          {currentQ.type === "dropdown" && (
            <div className="w-full">
              <DropdownSelect
                options={currentQ.options as (string|number)[]}
                value={answers[currentQ.id as keyof FitProfile] as string|number}
                onChange={updateAnswer}
                placeholder={`${currentQ.id === 'height' ? "5' 6\"" : currentQ.id === 'waist' ? '30"' : currentQ.id === 'hip' ? '38"' : "Select"}`}
              />
            </div>
          )}
          
          {currentQ.type === "single_select" && currentQ.id !== "fitFrustration" && (
            <div className="w-full">
              <SingleSelect
                options={currentQ.options as {label: string, value: string, description?: string, icon?: string}[]}
                value={answers[currentQ.id as keyof FitProfile] as string}
                onChange={updateAnswer}
                variant={currentQ.id === "waistFit" ? "transparent" : "card"}
              />
            </div>
          )}

          {currentQ.id === "fitFrustration" && (
            <div className="w-full">
              <SingleSelect
                options={currentQ.options as {label: string, value: string, description?: string, icon?: string}[]}
                value={answers[currentQ.id as keyof FitProfile] as string}
                onChange={updateAnswer}
                variant="simple"
              />
            </div>
          )}
          
          {currentQ.type === "multi_select" && (
            <div className="w-full">
              <MultiSelect
                options={currentQ.options as readonly string[]}
                value={(answers[currentQ.id as keyof FitProfile] as string[]) || []}
                onChange={updateAnswer}
              />
            </div>
          )}
          
          {currentQ.type === "number_optional" && (
            <div className="flex flex-col gap-4 w-full mt-1">
              <NumberInput
                value={answers[currentQ.id as keyof FitProfile] as number|null}
                onChange={updateAnswer}
                placeholder="138"
              />
              <div className="flex items-center gap-4 w-full">
                <div className="h-[1px] flex-1 bg-[#333]" />
                <span className="text-[#666] text-xs font-medium uppercase tracking-widest">or</span>
                <div className="h-[1px] flex-1 bg-[#333]" />
              </div>
              <button
                onClick={() => {
                  updateAnswer(null)
                  handleNext()
                }}
                className="w-full py-3.5 rounded-md border border-white/12 text-white text-[12px] font-semibold hover:bg-[#1A1A1A] transition-colors"
              >
                Skip this question
              </button>
            </div>
          )}
          
          {currentQ.type === "per_brand_size" && (
            <div className="w-full">
              <BrandSizeEntry
                selectedBrands={answers.brands as DenimBrand[]}
                value={answers.brandSizes || {}}
                onChange={updateAnswer}
                brandSizes={BRAND_SIZES}
              />
            </div>
          )}

          <QuestionVisual type={visualByQuestion[currentQ.id] || "none"} />

          <div className="mt-auto pt-6">
            {renderWhyWeAsk()}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button - Always Orange */}
      <div className="absolute bottom-0 inset-x-0 px-5 py-5 bg-gradient-to-t from-[#070707] via-[#070707] to-transparent z-30 pointer-events-none">
        <div className="w-full pointer-events-auto">
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={cn(
              "w-full flex items-center justify-center gap-2 bg-[#E05C2B] text-white py-4 rounded-[14px] font-semibold transition-all duration-300 text-[16px]",
              !canContinue() ? "opacity-40 cursor-not-allowed hover:bg-[#E05C2B]" : "hover:bg-[#c24a1f] shadow-[0_4px_20px_rgba(224,92,43,0.3)]"
            )}
          >
            {currentIndex === QUIZ_QUESTIONS.length - 1 ? "See your summary" : "Continue"} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      </section>
    </main>
  )
}

function QuestionVisual({ type }: { type: "model" | "scale" | "ruler" | "hip" | "waist" | "none" }) {
  if (type === "none") return null

  if (type === "ruler") {
    return (
      <div className="pointer-events-none absolute left-0 right-0 top-[120px] h-16 overflow-hidden border-y border-[#5b3219]/35 bg-[linear-gradient(90deg,rgba(125,77,40,0.16),rgba(224,128,66,0.38),rgba(125,77,40,0.12))] shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[#1c120c]/40" />
        <div className="flex h-full items-start justify-around px-4 pt-2 text-[#2B1A10]/80">
          {[28, 29, 30, 31, 32].map((mark) => (
            <div key={mark} className="relative h-full text-[18px] font-semibold">
              <span>{mark}</span>
              <span className="absolute left-1/2 top-7 h-6 w-px bg-[#2B1A10]" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === "hip") {
    return (
      <div className="pointer-events-none absolute -right-4 top-[100px] h-[150px] w-[250px] overflow-hidden rounded-l-[28px] border border-white/10 bg-[#101010]/85 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.12),transparent_34%),linear-gradient(145deg,rgba(49,64,78,0.7),rgba(13,13,13,0.9))]" />
        <div className="absolute left-14 right-2 top-10 h-28 rounded-l-[999px] border-y border-[#9fb0bd]/25 bg-[#52677b]/35" />
        <div className="absolute left-24 top-8 h-24 w-28 rounded-[999px] border border-[#8799a8]/20 bg-[#d9d0c4]/16 blur-[0.2px]" />
        <div className="absolute left-5 right-8 top-[82px] border-t border-dashed border-[#F06A2A]/75 shadow-[0_0_12px_rgba(240,106,42,0.35)]" />
        <div className="absolute left-5 top-[75px] h-4 w-4 rounded-full border border-[#F06A2A]/70" />
      </div>
    )
  }

  if (type === "scale") {
    return (
      <div className="pointer-events-none absolute right-0 top-[178px] h-32 w-40 rounded-l-2xl border border-white/10 bg-[#101010]/90 shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
        <div className="absolute inset-0 rounded-l-2xl bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.1),transparent_35%)]" />
        <div className="absolute right-5 top-5 h-[88px] w-[88px] rounded-full border border-white/20 bg-[#1f1f1f] shadow-inner">
          <div className="absolute inset-3 rounded-full border border-white/10" />
          <div className="absolute left-1/2 top-1/2 h-px w-8 origin-left -rotate-12 bg-[#F06A2A] shadow-[0_0_12px_rgba(240,106,42,0.65)]" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F06A2A]" />
        </div>
        <div className="absolute bottom-4 left-5 right-5 h-2 rounded-full bg-white/8" />
      </div>
    )
  }

  return (
    <div className="pointer-events-none absolute -right-3 bottom-16 h-[280px] w-[178px] overflow-hidden opacity-95">
      <div className="absolute inset-y-4 right-7 w-px bg-[#F06A2A]/70 shadow-[0_0_16px_rgba(240,106,42,0.45)]" />
      <div className="absolute right-3 top-4 flex h-[238px] w-7 flex-col justify-between text-[9px] font-semibold text-[#F06A2A]/75">
        {["62", "58", "54", "50", "46"].map((tick) => (
          <span key={tick} className="relative pl-3 before:absolute before:left-0 before:top-1/2 before:h-px before:w-2 before:bg-[#F06A2A]/60">
            {tick}
          </span>
        ))}
      </div>
      <div className="absolute bottom-0 left-4 h-[246px] w-[116px] rounded-t-[54px] border border-white/10 bg-[linear-gradient(160deg,rgba(44,63,82,0.92),rgba(20,28,37,0.92))] shadow-[0_30px_70px_rgba(0,0,0,0.45)]" />
      <div className="absolute bottom-0 left-10 h-[222px] w-[42px] rounded-t-[28px] border-l border-white/12 bg-[#3F5A73]" />
      <div className="absolute bottom-0 left-[82px] h-[222px] w-[42px] rounded-t-[28px] border-r border-white/10 bg-[#31485F]" />
      <div className="absolute bottom-0 left-[74px] h-[232px] w-px bg-[#7790A7]/45" />
      <div className="absolute left-8 right-12 top-[74px] h-px border-t border-dashed border-[#F06A2A]/65" />
      <div className="absolute left-2 bottom-0 h-28 w-40 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.8),transparent_68%)]" />
    </div>
  )
}
