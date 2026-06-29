interface QuizProgressProps {
  currentQuestionIndex: number
  totalQuestions: number
}

export function QuizProgress({ currentQuestionIndex, totalQuestions }: QuizProgressProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <div className="w-full h-[2px] bg-[#333] relative">
      <div 
        className="absolute top-0 left-0 h-full bg-[#E05C2B] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
