"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { DenimBrand } from "@/types/quiz"

const PantsIcon = ({ type }: { type: string }) => {
  const isHigh = type.includes("high")
  const isLow = type.includes("low")
  const isRise = type.includes("rise")

  return (
    <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
        <path d="M5 4h14l1.5 16h-5L12 11l-3.5 9h-5L5 4z" />
        <path d="M12 4v7" />
        <path d="M6 4v2 M18 4v2 M9.5 4v2 M14.5 4v2" />
        <path d="M5.5 6.5c2 0 3.5 1.5 3.5 3" />
        <path d="M18.5 6.5c-2 0-3.5 1.5-3.5 3" />
      </svg>
      {isRise && (
        <svg width="28" height="28" viewBox="0 0 24 24" className="absolute inset-0 z-20">
          <line x1="3" x2="21" y1={isHigh ? 7 : isLow ? 14 : 10.5} y2={isHigh ? 7 : isLow ? 14 : 10.5} stroke="#E05C2B" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )}
    </div>
  )
}

// --- Single Select ---
interface SingleSelectProps {
  options: { label: string; value: string; description?: string; icon?: string }[]
  value?: string
  onChange: (value: string) => void
  variant?: "simple" | "transparent" | "card"
}

export function SingleSelect({ options, value, onChange, variant = "card" }: SingleSelectProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {options.map((opt) => {
        const isSelected = value === opt.value
        
        if (variant === "simple") {
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="w-full flex items-center justify-between rounded-md border border-white/10 bg-[#111]/70 px-3 py-3 text-left transition-colors"
            >
              <span className={cn("text-[12px] font-semibold", isSelected ? "text-[#F06A2A]" : "text-white")}>{opt.label}</span>
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                isSelected ? "border-[#F06A2A] bg-[#F06A2A]" : "border-[#444] bg-transparent"
              )}>
                {isSelected && <Check className="w-3 h-3 text-[#111]" strokeWidth={3} />}
              </div>
            </button>
          )
        }

        const isTransparent = variant === "transparent"

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "w-full flex items-center p-3 rounded-md border text-left transition-all duration-200",
              isSelected
                ? `border-[#F06A2A] ${isTransparent ? 'bg-transparent' : 'bg-[#111]'}`
                : `border-white/10 ${isTransparent ? 'bg-transparent' : 'bg-[#111]/80'}`
            )}
          >
            {opt.icon && (
              <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center mr-3 text-white">
                <PantsIcon type={opt.icon} />
              </div>
            )}
            
            <div className="flex-1 pr-4">
              <div className="font-semibold text-white text-[12px] mb-0.5">{opt.label}</div>
              {opt.description && (
                <div className="text-[10px] text-[#9A9A9A] leading-tight">{opt.description}</div>
              )}
            </div>
            
            <div className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all",
              isSelected 
                ? "border-[#F06A2A] bg-[#F06A2A] text-[#111]" 
                : "border-[#444] bg-transparent"
            )}>
              {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// --- Multi Select (Brands Checklist) ---
interface MultiSelectProps {
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
}

export function MultiSelect({ options, value, onChange }: MultiSelectProps) {
  const [search, setSearch] = React.useState("")
  
  const toggle = (val: string) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val))
    else onChange([...value, val])
  }

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col gap-3 w-full h-[300px]">
      <div className="relative flex-shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <input 
          type="text" 
          placeholder="Search brands" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#111]/80 border border-white/10 rounded-md py-3 pl-11 pr-4 text-white text-[12px] focus:outline-none focus:border-[#F06A2A] transition-colors"
        />
      </div>
      
      <div className="flex flex-col overflow-y-auto rounded-md border border-white/10 bg-[#101010]/70">
        {filtered.map((opt) => {
          const isSelected = value.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="w-full flex items-center border-b border-white/5 px-3 py-2.5 text-left group last:border-b-0"
            >
              <div className={cn(
                "w-4 h-4 rounded-[3px] border flex items-center justify-center mr-3 transition-colors",
                isSelected ? "bg-[#F06A2A] border-[#F06A2A] text-[#111]" : "border-[#444] bg-transparent group-hover:border-[#666]"
              )}>
                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
              </div>
              <span className="text-white text-[12px] font-medium">{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// --- Number Input (Weight) ---
interface NumberInputProps {
  value?: number | null
  onChange: (val: number | null) => void
  placeholder?: string
}

export function NumberInput({ value, onChange, placeholder }: NumberInputProps) {
  return (
    <div className="w-full flex items-center bg-[#111]/90 border border-white/10 rounded-md overflow-hidden focus-within:border-[#F06A2A] transition-colors">
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value
          onChange(val ? parseFloat(val) : null)
        }}
        placeholder={placeholder || "0"}
        className="flex-1 bg-transparent py-4 pl-5 text-[22px] font-semibold text-white focus:outline-none placeholder:text-[#777]"
      />
      <span className="pr-5 text-[#A0A0A0] font-medium text-[11px]">lbs</span>
    </div>
  )
}

// --- Dropdown Select ---
interface DropdownSelectProps {
  options: (string | number)[]
  value?: string | number
  onChange: (val: string | number) => void
  placeholder?: string
}

export function DropdownSelect({ options, value, onChange, placeholder = "Select..." }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative w-full z-20">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-4 rounded-md bg-[#111]/90 border border-white/10 text-left transition-colors hover:bg-[#1A1A1A]"
      >
        <span className={cn("font-semibold text-[14px]", value ? "text-white" : "text-white")}>
          {value ? formatDropdownValue(value) : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[60vh] overflow-y-auto bg-[#111] border-t border-[#333] rounded-t-2xl md:absolute md:inset-auto md:top-full md:mt-2 md:w-full md:max-h-64 md:rounded-md md:border"
            >
              <div className="flex flex-col p-2 pt-4">
                {options.map((opt) => (
                  <button
                    key={String(opt)}
                    onClick={() => {
                      onChange(opt)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-5 py-4 rounded-xl transition-colors flex items-center justify-between",
                      value === opt ? "text-[#F06A2A] bg-[#1A1A1A] font-medium" : "text-white hover:bg-[#1A1A1A]"
                    )}
                  >
                    <span className="text-[13px]">{formatDropdownValue(opt)}</span>
                    {value === opt && <Check className="w-5 h-5 text-[#F06A2A]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Brand Size Entry ---
interface BrandSizeEntryProps {
  selectedBrands: DenimBrand[]
  value: Record<string, string>
  onChange: (val: Record<string, string>) => void
  brandSizes: readonly string[]
}

export function BrandSizeEntry({ selectedBrands, value, onChange, brandSizes }: BrandSizeEntryProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {selectedBrands.map((brand) => (
        <div key={brand} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#111]/80 p-3">
          <span className="text-white text-[12px] font-semibold">{brand}</span>
          <div className="w-28">
            <DropdownSelect
              options={brandSizes as unknown as string[]}
              value={value[brand]}
              onChange={(size) => onChange({ ...value, [brand]: String(size) })}
              placeholder="Size"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDropdownValue(value: string | number) {
  if (typeof value === "number") return `${value}"`
  return value
}
