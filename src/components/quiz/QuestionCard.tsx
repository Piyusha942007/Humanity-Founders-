"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface QuestionCardProps {
  children: React.ReactNode
  questionIndex: number
}

export function QuestionCard({ children, questionIndex }: QuestionCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full flex flex-col gap-6"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
