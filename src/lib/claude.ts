const SYSTEM_PROMPT_TEMPLATE = `You are a friendly, efficient fit stylist for Jackie Jeans. Your job is to extract the user's answer to a specific question from their spoken input.

Current question: {currentQuestion}
Valid options: {validOptions}
Raw user speech: {userSpeech}

Rules:
- Map natural speech to valid options (e.g. "five four" -> "5'4\\"", "about thirty inches" -> 30, "kind of fitted" -> "fitted")
- For multi-select (brands), extract ALL mentioned brands from a single utterance
- If the user says "skip" or "rather not say" on the weight question, set value to null
- If confidence < 0.7, set needs_clarification: true and write a natural re-ask
- Keep confirmation_text to one short friendly sentence (max 12 words)
- Speak labels naturally in confirmation_text. Never include underscores; say "waist gap", not "waist_gap".
- Never break character. Stay warm and brief.

Respond ONLY in JSON, no markdown, no preamble:
{
  "extracted_value": <string | number | string[] | null>,
  "confidence": <0.0-1.0>,
  "confirmation_text": <string>,
  "needs_clarification": <boolean>,
  "clarification_question": <string | null>
}`

type ExtractedVoiceValue = string | number | string[] | null
type VoiceOption = string | number | { label?: string; value?: string | number }

const WORD_NUMBERS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
}

function wordsToNumbers(text: string) {
  const normalized = text
    .toLowerCase()
    .replace(/[-,]/g, " ")
    .replace(/\b(a|an|about|around|inches|inch|pounds|pound|lbs|lb|feet|foot|and)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const words = normalized.split(" ").filter(Boolean)
  const numbers: number[] = []
  for (let i = 0; i < words.length; i++) {
    const current = WORD_NUMBERS[words[i]]
    if (current === undefined) continue

    const next = WORD_NUMBERS[words[i + 1]]
    if ((current === 20 || current === 30 || current === 40 || current === 50 || current === 60) && next !== undefined && next < 10) {
      numbers.push(current + next)
      i += 1
    } else {
      numbers.push(current)
    }
  }

  return numbers
}

function parseSpokenHeight(lowerSpeech: string, options: VoiceOption[]) {
  const optionStrings = options.filter((option): option is string => typeof option === "string")
  const directFeetInches = lowerSpeech.match(/(\d)\s*(?:'|ft|feet|foot)\s*(\d{1,2})?/)
  if (directFeetInches) {
    const feet = directFeetInches[1]
    const inches = directFeetInches[2] || "0"
    const candidate = `${feet}'${Number(inches)}"`
    if (optionStrings.includes(candidate)) return candidate
  }

  const nums = wordsToNumbers(lowerSpeech)
  if (nums.length >= 2 && nums[0] >= 4 && nums[0] <= 6) {
    const candidate = `${nums[0]}'${nums[1]}"`
    if (optionStrings.includes(candidate)) return candidate
  }

  if (nums.length === 1 && nums[0] >= 48 && nums[0] <= 74) {
    const feet = Math.floor(nums[0] / 12)
    const inches = nums[0] % 12
    const candidate = `${feet}'${inches}"`
    if (optionStrings.includes(candidate)) return candidate
  }

  return null
}

function parseSpokenNumber(lowerSpeech: string) {
  const digitMatch = lowerSpeech.match(/\d+/)
  if (digitMatch) return Number(digitMatch[0])
  const nums = wordsToNumbers(lowerSpeech)
  return nums.length > 0 ? nums[0] : null
}

function parseSpokenWeight(lowerSpeech: string) {
  const spokenNumber = parseSpokenNumber(lowerSpeech)
  if (spokenNumber === null) return null
  const isKg = /\b(kg|kgs|kilogram|kilograms|kilo|kilos)\b/.test(lowerSpeech)
  return isKg ? Math.round(spokenNumber * 2.20462) : spokenNumber
}

function getOptionValue(option: VoiceOption | undefined, fallback: string): ExtractedVoiceValue {
  if (option === undefined) return fallback
  if (typeof option === "string" || typeof option === "number") return option
  return option.value ?? fallback
}

function normalizeBrandText(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "")
}

function formatConfirmationValue(value: ExtractedVoiceValue) {
  if (Array.isArray(value)) return value.join(", ")
  if (value === null) return "skipped"
  return String(value).replace(/_/g, " ")
}

function formatConfirmationForQuestion(value: ExtractedVoiceValue, currentQuestionPrompt: string) {
  const formatted = formatConfirmationValue(value)
  if (typeof value === "number" && currentQuestionPrompt.toLowerCase().includes("weight")) {
    return `${formatted} lbs`
  }
  return formatted
}

export async function processVoiceInput(
  currentQuestionPrompt: string,
  validOptions: string,
  userSpeech: string
) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const isMock = !apiKey

  if (isMock) {
    // Mock mode implementation
    console.log("[MOCK CLAUDE] Processing:", userSpeech)
    await new Promise(resolve => setTimeout(resolve, 800)) // simulate latency
    
    // Naive mock extraction based on presence
    const lowerSpeech = userSpeech.toLowerCase()
    
    let extracted_value: ExtractedVoiceValue = userSpeech
    
    // Local extraction for development when no hosted AI key is configured.
    if (lowerSpeech.includes("skip")) {
      extracted_value = null
    } else if (validOptions.includes("[")) {
      try {
        const opts = JSON.parse(validOptions) as VoiceOption[]
        if (Array.isArray(opts)) {
           const height = parseSpokenHeight(lowerSpeech, opts)
           if (height) {
             extracted_value = height
           } else if (opts.length === 0) {
             extracted_value = currentQuestionPrompt.toLowerCase().includes("weight")
               ? parseSpokenWeight(lowerSpeech) ?? userSpeech
               : parseSpokenNumber(lowerSpeech) ?? userSpeech
           } else if (opts.every((option): option is number => typeof option === "number")) {
             const spokenNumber = parseSpokenNumber(lowerSpeech)
             extracted_value = spokenNumber !== null && opts.includes(spokenNumber) ? spokenNumber : opts[0]
           } else if (opts.some((option) => option === "Levi's")) {
             const normalizedSpeech = normalizeBrandText(lowerSpeech)
             const brands = opts
               .filter((option): option is string => typeof option === "string")
               .filter((brand) => normalizedSpeech.includes(normalizeBrandText(brand).replace(/s$/, "")))
             extracted_value = brands
           } else {
             const match = opts.find(o => typeof o === "string" && lowerSpeech.includes(o.toLowerCase())) ||
                           opts.find(o => typeof o === "object" && o.label && lowerSpeech.includes(o.label.toLowerCase()))
             
             if (match) {
               extracted_value = getOptionValue(match, userSpeech)
             } else {
               const spokenNumber = parseSpokenNumber(lowerSpeech)
               const numberMatch = opts.find((option) => String(option) === String(spokenNumber))
               if (numberMatch !== undefined) {
                 extracted_value = getOptionValue(numberMatch, userSpeech)
                 return {
                   extracted_value,
                   confidence: 0.9,
                   confirmation_text: `Got it, ${formatConfirmationForQuestion(extracted_value, currentQuestionPrompt)}.`,
                   needs_clarification: false,
                   clarification_question: null
                 }
               }
               const first = opts[0]
               extracted_value = getOptionValue(first, userSpeech)
             }
           }
        }
      } catch {
        // Fallback
      }
    } else {
      // Extract number if range
      const match = lowerSpeech.match(/\d+/)
      if (match) extracted_value = parseInt(match[0])
    }

    return {
      extracted_value,
      confidence: 0.9,
      confirmation_text: `Got it, ${formatConfirmationForQuestion(extracted_value, currentQuestionPrompt)}.`,
      needs_clarification: false,
      clarification_question: null
    }
  }

  // Real API implementation
  const prompt = SYSTEM_PROMPT_TEMPLATE
    .replace("{currentQuestion}", currentQuestionPrompt)
    .replace("{validOptions}", validOptions)
    .replace("{userSpeech}", userSpeech)

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229", // Fallback mapping for generic claude-sonnet-4-6
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }]
      })
    })
    
    if (!res.ok) {
      throw new Error(`Anthropic error: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    const textResp = data.content[0].text
    return JSON.parse(textResp)
  } catch (error) {
    console.error("Claude API Error:", error)
    throw error
  }
}
