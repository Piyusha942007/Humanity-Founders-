"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { QUIZ_QUESTIONS } from "@/lib/quiz-config"
import { VoiceState } from "@/components/voice/VoiceOrb"
import { Waveform } from "@/components/voice/VoiceOrb"
import { speakText } from "@/lib/tts"
import { FitProfile } from "@/types/quiz"
import { MicOff, Mic, Keyboard, VolumeX, Check } from "lucide-react"

const LAST_PROFILE_KEY = "jj_last_profile"
type SpeechRecognitionResultLike = {
  isFinal: boolean
  0: { transcript: string }
}
type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start: () => void
  abort: () => void
}
type SpeechWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}
type VoiceAiResponse = {
  extracted_value: string | number | string[] | null
  confirmation_text: string
  needs_clarification: boolean
  clarification_question?: string | null
}

function friendlySpeechText(text: string) {
  return text.replace(/_/g, " ")
}

export default function VoicePage() {
  const router = useRouter()
  
  const [state, setState] = React.useState<VoiceState>("idle")
  const stateRef = React.useRef<VoiceState>("idle")
  
  React.useEffect(() => {
    stateRef.current = state
  }, [state])
  
  const [errorState, setErrorState] = React.useState<"none" | "denied" | "unsupported">("none")
  const [transcript, setTranscript] = React.useState("")
  const transcriptRef = React.useRef("")
  const [volume, setVolume] = React.useState(0)
  const [confirmationText, setConfirmationText] = React.useState("")
  const [hasStarted, setHasStarted] = React.useState(false)
  
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [currentBrandIndex, setCurrentBrandIndex] = React.useState(0)
  
  const processResponseRef = React.useRef<((text: string) => Promise<void>) | null>(null)
  const startListeningRef = React.useRef<(() => void) | null>(null)
  
  const [answers, setAnswers] = React.useState<Partial<FitProfile>>({
    brands: [],
    brandSizes: {} as Record<string, string>,
    flow: "voice",
  })
  
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const dataArrayRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null)
  const animationFrameRef = React.useRef<number | null>(null)

  const currentQ = QUIZ_QUESTIONS[currentIndex]
  
  const isIterativeSizeQuestion = currentQ?.id === "brandSizes"
  const selectedBrands = (answers.brands || []) as string[]
  const currentBrand = isIterativeSizeQuestion ? selectedBrands[currentBrandIndex] : null
  
  const currentPrompt = React.useMemo(() => {
    if (!currentQ) return ""
    if (isIterativeSizeQuestion && currentBrand) {
      return currentQ.prompt.replace("{brand}", currentBrand)
    }
    return currentQ.prompt
  }, [currentQ, isIterativeSizeQuestion, currentBrand])

  const setupAudioAnalysis = async (stream: MediaStream) => {
    const speechWindow = window as SpeechWindow
    const AudioContextCtor = speechWindow.AudioContext || speechWindow.webkitAudioContext
    if (!AudioContextCtor) throw new Error("AudioContext is not supported")
    const audioCtx = new AudioContextCtor()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    
    audioContextRef.current = audioCtx
    analyserRef.current = analyser
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
    
    const updateVolume = () => {
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current)
        let sum = 0
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i]
        }
        const avg = sum / dataArrayRef.current.length
        setVolume(Math.min(1, avg / 100))
      }
      animationFrameRef.current = requestAnimationFrame(updateVolume)
    }
    updateVolume()
  }

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close()
    }
    audioContextRef.current = null
  }

  const saveAndRedirect = async (finalProfile: Partial<FitProfile>) => {
    try {
      const payload = { ...finalProfile, completedAt: new Date().toISOString() }
      localStorage.setItem(LAST_PROFILE_KEY, JSON.stringify(payload))
      const res = await fetch("/api/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      
      if (data.id) {
        router.push(`/voice/complete?fitProfileId=${data.id}`)
      } else {
        router.push(`/voice/complete?fitProfileId=local-${Date.now()}`)
      }
    } catch {
      localStorage.setItem(LAST_PROFILE_KEY, JSON.stringify({ ...finalProfile, completedAt: new Date().toISOString() }))
      router.push(`/voice/complete?fitProfileId=local-${Date.now()}`)
    }
  }

  function startListening() {
    setTranscript("")
    transcriptRef.current = ""
    setState("listening")
    try {
      recognitionRef.current?.start()
    } catch {}
  }

  const processResponse = async (userText: string) => {
    if (!userText.trim()) return
    setState("processing")
    
    try {
      const validOpts = isIterativeSizeQuestion ? ["XS", "S", "M", "L", "XL", "XXL", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "36", "38", "40", "42", "44"] : ("options" in currentQ ? currentQ.options : [])

      const res = await fetch("/api/voice-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentQuestionPrompt: currentPrompt,
          validOptions: validOpts,
          userSpeech: userText
        })
      })
      
      const data = await res.json() as VoiceAiResponse
      if (!res.ok) {
        throw new Error("Voice AI request failed")
      }
      
      if (data.needs_clarification) {
        setConfirmationText("")
        setState("speaking")
        await speakText(friendlySpeechText(data.clarification_question || "I didn't quite catch that. Could you repeat?"))
        startListening()
        return
      }

      const confirmationText = friendlySpeechText(data.confirmation_text)
      setConfirmationText(confirmationText)
      setState("speaking")
      
      const val = data.extracted_value
      let newAnswers = { ...answers }
      
      if (isIterativeSizeQuestion && currentBrand) {
        newAnswers.brandSizes = { ...newAnswers.brandSizes, [currentBrand]: String(val) } as Record<string, string>
      } else if (currentQ.id) {
        newAnswers = { ...newAnswers, [currentQ.id]: val }
      }
      setAnswers(newAnswers)
      
      await speakText(confirmationText)
      setTimeout(() => setConfirmationText(""), 1000)

      if (isIterativeSizeQuestion) {
        if (currentBrandIndex < selectedBrands.length - 1) {
          setCurrentBrandIndex(p => p + 1)
        } else {
          if (currentIndex < QUIZ_QUESTIONS.length - 1) {
            setCurrentIndex(p => p + 1)
          } else {
            saveAndRedirect(newAnswers)
          }
        }
      } else if (currentQ.id === "brands" && Array.isArray(val) && val.length === 0) {
          setCurrentIndex(currentIndex + 2)
      } else {
        if (currentIndex < QUIZ_QUESTIONS.length - 1) {
          setCurrentIndex(p => p + 1)
        } else {
          saveAndRedirect(newAnswers)
        }
      }

    } catch (error) {
      console.error(error)
      setState("speaking")
      await speakText("Sorry, I had trouble understanding that. Let's try again.")
      startListening()
    }
  }

  React.useEffect(() => {
    if (!hasStarted) return
    const ask = async () => {
      setState("speaking")
      await speakText(currentPrompt)
      startListening()
    }
    if (stateRef.current !== "processing") {
      ask()
    }
  }, [currentPrompt, hasStarted])

  React.useEffect(() => {
    processResponseRef.current = processResponse
    startListeningRef.current = startListening
  })

  const initVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      await setupAudioAnalysis(stream)
      
      const speechWindow = window as SpeechWindow
      const SpeechRec = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
      if (!SpeechRec) throw new Error("Speech Recognition API not supported")
      
      const recognition = new SpeechRec()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let final = ""
        let interim = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        const spokenText = (final || interim).trim()
        transcriptRef.current = spokenText
        setTranscript(spokenText)
      }

      recognition.onend = () => {
        if (stateRef.current === "listening") {
           const currentText = transcriptRef.current.trim()
           if (currentText) {
             processResponseRef.current?.(currentText)
           } else {
             startListeningRef.current?.()
           }
        }
      }

      recognition.onerror = (event) => {
        if (event.error === "not-allowed") {
          setErrorState("denied")
        }
      }

      recognitionRef.current = recognition
      
      setState("speaking")
      await speakText("Hey! I'm your AI stylist. I'll ask you a few quick questions to find your perfect fit.")
      setHasStarted(true)

    } catch (err: unknown) {
      if (err instanceof Error && err.message === "Speech Recognition API not supported") {
        setErrorState("unsupported")
      } else {
        setErrorState("denied")
      }
    }
  }

  React.useEffect(() => {
    return () => {
      cleanupAudio()
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  if (errorState !== "none") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
        <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#333] w-full max-w-md flex flex-col gap-6 text-center items-center">
          <MicOff className="w-8 h-8 text-[#888]" />
          <h2 className="text-2xl font-bold text-white">Mic Access Denied</h2>
          <p className="text-[#888]">Mic access is needed for voice mode.</p>
          <button onClick={() => router.push("/quiz")} className="w-full mt-4 bg-[#E05C2B] text-white py-3 rounded-xl font-medium">
            Switch to Manual
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-black relative pb-10">
      
      {/* Top Nav (Matching screenshot exactly) */}
      <div className="w-full flex items-center justify-between px-6 py-4 absolute top-0 z-20">
        <span className="font-bold text-xs tracking-[0.1em] text-white absolute left-1/2 -translate-x-1/2">
          JACKIE JEANS
        </span>
        <div className="flex-1" />
        <button onClick={() => router.push("/")} className="px-4 py-1.5 rounded-full border border-[#333] text-[10px] uppercase tracking-wider text-white hover:bg-[#1A1A1A] transition-colors">
          End chat
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 z-10 w-full mt-16">
        {!hasStarted ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <Waveform state="idle" volume={0} />
              
              <div className="text-center space-y-4 mt-8">
                <h1 className="text-3xl font-medium text-white">Hi, I&apos;m your<br/>AI stylist</h1>
                <p className="text-[#888] text-sm max-w-[250px] mx-auto">
                  I&apos;ll ask you a few quick questions to find your perfect fit.
                </p>
                <p className="text-[#666] text-xs">
                  You can speak naturally or type if you prefer.
                </p>
              </div>
            </div>
            
            {/* Bottom Controls */}
            <div className="w-full flex items-center justify-between px-4 mt-8">
              <button className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-white">
                <VolumeX className="w-5 h-5" />
              </button>
              
              <button 
                onClick={initVoice}
                className="w-16 h-16 rounded-full border border-[#E05C2B] flex items-center justify-center flex-col gap-1 hover:bg-[#E05C2B]/10 transition-colors"
              >
                <Mic className="w-6 h-6 text-[#E05C2B]" />
              </button>
              
              <button className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-white">
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 w-full flex flex-col justify-center">
              
              {/* Question Bubble */}
              <AnimatePresence>
                {state === "speaking" && !confirmationText && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex justify-start mb-8"
                  >
                    <div className="bg-[#1A1A1A] rounded-2xl rounded-bl-sm px-6 py-4 text-white">
                      {currentPrompt}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Transcript */}
              <AnimatePresence>
                {transcript && state !== "speaking" && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-center mb-8"
                  >
                    <p className="text-[#888] text-sm mb-2">You said</p>
                    <p id="transcript-text" className="text-3xl font-medium text-[#E05C2B]">
                      {transcript}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waveform / Checkmark */}
              {state === "speaking" && confirmationText ? (
                <div className="w-full flex flex-col items-center justify-center my-8 gap-6">
                  <p className="text-white text-xl font-medium text-center">{confirmationText}</p>
                  <div className="w-16 h-16 rounded-full border border-[#E05C2B] flex items-center justify-center">
                    <Check className="w-8 h-8 text-[#E05C2B]" />
                  </div>
                </div>
              ) : (
                <Waveform state={state} volume={volume} />
              )}
              
              {/* Status Text */}
              <div className="text-center h-6 mt-4">
                <span className="text-[#888] text-sm">
                  {state === "listening" && !transcript && "Listening..."}
                  {state === "processing" && "Processing..."}
                </span>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="w-full flex flex-col items-center mt-8 gap-4">
              <div className="w-16 h-16 rounded-full border border-[#E05C2B] flex items-center justify-center relative shadow-[0_0_20px_rgba(224,92,43,0.2)]">
                <Mic className="w-6 h-6 text-[#E05C2B]" />
                {state === "listening" && (
                  <motion.div 
                    className="absolute inset-0 rounded-full border border-[#E05C2B]"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </div>
              <span className="text-[#666] text-xs">
                {state === "speaking" ? "AI is speaking" : "Tap to speak"}
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
