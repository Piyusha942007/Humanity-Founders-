"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-blue disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-[0_0_15px_rgba(74,107,156,0.3)] hover:shadow-[0_0_20px_rgba(74,107,156,0.5)]": variant === "primary",
            "bg-bg-elevated text-text-primary hover:bg-bg-elevated/80": variant === "secondary",
            "border border-border bg-transparent hover:border-text-secondary text-text-primary": variant === "outline",
            "bg-transparent hover:bg-bg-surface text-text-primary": variant === "ghost",
            "h-12 px-8 text-[15px]": size === "default",
            "h-9 px-5 text-sm": size === "sm",
            "h-14 px-10 text-lg": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
