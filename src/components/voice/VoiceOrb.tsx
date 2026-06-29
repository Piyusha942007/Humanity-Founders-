"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

export type VoiceState = "idle" | "listening" | "processing" | "speaking"

interface VoiceOrbProps {
  state: VoiceState
  volume: number // 0 to 1
  onClick?: () => void
}

export function Waveform({ state, volume }: { state: VoiceState, volume: number }) {
  const bars = 40
  const isWhite = state === "processing"
  
  return (
    <div className="flex items-center justify-center gap-[2px] h-32 w-full max-w-sm mx-auto my-8">
      {Array.from({ length: bars }).map((_, i) => {
        // Create a bell curve shape for the waveform
        const centerDist = Math.abs(i - bars / 2)
        const maxH = Math.max(10, 100 - centerDist * 5)
        
        let height = 10
        const wave = (Math.sin(i * 1.7) + 1) / 2
        if (state === "listening" || state === "speaking") {
          height = maxH * (0.25 + volume * (0.35 + wave * 0.4))
        } else if (state === "processing") {
          height = maxH * (0.25 + wave * 0.2)
        } else {
          height = 2 // idle line
        }

        return (
          <motion.div
            key={i}
            animate={{ height: `${height}%` }}
            transition={{ type: "tween", duration: 0.1 }}
            className={`w-1 rounded-full ${isWhite ? "bg-[#888] shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "bg-[#E05C2B] shadow-[0_0_15px_rgba(224,92,43,0.5)]"}`}
          />
        )
      })}
    </div>
  )
}

export function VoiceOrb({ state, volume, onClick }: VoiceOrbProps) {
  // We use Waveform instead of Orb for the new design
  return (
    <div className="w-full flex flex-col items-center" onClick={onClick}>
      {state === "speaking" && (
        <div className="w-full h-32 flex items-center justify-center my-8">
          <div className="w-16 h-16 rounded-full border border-[#E05C2B] flex items-center justify-center">
            <Check className="w-8 h-8 text-[#E05C2B]" />
          </div>
        </div>
      )}
      {state !== "speaking" && <Waveform state={state} volume={volume} />}
    </div>
  )
}
