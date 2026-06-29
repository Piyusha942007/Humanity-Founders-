declare global {
  interface Window {
    __activeUtterance?: SpeechSynthesisUtterance
  }
}

export async function speakText(text: string) {
  // If we had ElevenLabs key exposed to client, we could use it here.
  // The PRD mentions Web SpeechSynthesis as fallback. Let's use it directly for simplicity & speed.
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve()
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text || "")
    
    // Try to find a good female English voice if available to match "stylist" vibe
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google UK English Female"))
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.rate = 1.05
    utterance.pitch = 1.1

    // Keep global reference to prevent garbage collection bug in Chrome
    window.__activeUtterance = utterance

    // Safety timeout: 10 seconds minimum, plus 100ms per character for long strings
    const timeoutMs = Math.max(10000, text.length * 100)
    const timeout = setTimeout(() => {
      resolve()
    }, timeoutMs)

    utterance.onend = () => {
      clearTimeout(timeout)
      resolve()
    }
    
    utterance.onerror = (e) => {
      clearTimeout(timeout)
      console.warn("TTS Error:", e)
      resolve() // Resolve anyway so the app doesn't crash if TTS fails
    }

    window.speechSynthesis.speak(utterance)
  })
}
