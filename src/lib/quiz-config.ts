import { DENIM_BRANDS } from "../types/quiz";

export const HEIGHT_OPTIONS = [
  "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"",
  "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\""
];

export const WAIST_OPTIONS = Array.from({ length: 29 }, (_, i) => i + 24);
export const HIP_OPTIONS = Array.from({ length: 29 }, (_, i) => i + 32);

export const QUIZ_QUESTIONS = [
  {
    id: "height",
    prompt: "What's your height?",
    type: "dropdown",
    options: HEIGHT_OPTIONS,
    intro: true,
  },
  {
    id: "weight",
    prompt: "What is your weight?",
    type: "number_optional",
    skipPhrases: ["skip", "rather not", "pass", "no thanks"],
  },
  {
    id: "waist",
    prompt: "What's your waist measurement?",
    type: "dropdown",
    options: WAIST_OPTIONS,
    range: [24, 52],
  },
  {
    id: "hip",
    prompt: "What's your hip measurement?",
    type: "dropdown",
    options: HIP_OPTIONS,
    range: [32, 60],
  },
  {
    id: "waistFit",
    prompt: "How do you like jeans to fit at the waist?",
    type: "single_select",
    options: [
      { label: "Snug", value: "snug", description: "No extra room", icon: "snug" },
      { label: "Slightly relaxed", value: "slightly_relaxed", description: "A little breathing room, still neat", icon: "slightly_relaxed" },
      { label: "Relaxed", value: "relaxed", description: "Comfortable and easy", icon: "relaxed" }
    ],
  },
  {
    id: "rise",
    prompt: "Where do you prefer the waistband to sit?",
    type: "single_select",
    options: [
      { label: "High rise", value: "high", description: "Sits above your natural waist", icon: "high_rise" },
      { label: "Mid rise", value: "mid", description: "Sits at your natural waist", icon: "mid_rise" },
      { label: "Low rise", value: "low", description: "Sits below your natural waist", icon: "low_rise" }
    ],
  },
  {
    id: "thighFit",
    prompt: "How should your jeans fit through the thighs?",
    type: "single_select",
    options: [
      { label: "Fitted", value: "fitted", description: "Hugs your shape closely", icon: "fitted" },
      { label: "Relaxed", value: "relaxed", description: "Roomy without being baggy", icon: "slightly_relaxed" },
      { label: "Loose", value: "loose", description: "Maximum room for movement", icon: "relaxed" }
    ],
  },
  {
    id: "brands",
    prompt: "Which denim brands have you bought before?",
    type: "multi_select",
    options: DENIM_BRANDS,
    followUp: "Any others?",
  },
  {
    id: "brandSizes",
    prompt: "What size did you buy in {brand}?",
    type: "per_brand_size",
    dynamic: true,
  },
  {
    id: "fitFrustration",
    prompt: "What's your biggest fit frustration when buying jeans?",
    type: "single_select",
    options: [
      { label: "Waist gap", value: "waist_gap", icon: "waist" },
      { label: "Hip tightness", value: "hip_tightness", icon: "snug" },
      { label: "Wrong length", value: "wrong_length", icon: "length" },
      { label: "Thigh fit", value: "thigh_fit", icon: "fitted" },
      { label: "Rise", value: "rise", icon: "mid_rise" },
      { label: "Other", value: "other", icon: "other" }
    ],
  },
];
