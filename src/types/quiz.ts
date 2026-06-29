export type Height = "4'10\"" | "4'11\"" | "5'0\"" | "5'1\"" | "5'2\"" | "5'3\"" | "5'4\"" | "5'5\"" | "5'6\"" | "5'7\"" | "5'8\"" | "5'9\"" | "5'10\"" | "5'11\"" | "6'0\"" | "6'1\"" | "6'2\"";
export type WaistInch = 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52;
export type HipInch = 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60;
export type WaistFit = "snug" | "slightly_relaxed" | "relaxed";
export type Rise = "high" | "mid" | "low";
export type ThighFit = "fitted" | "relaxed" | "loose";
export type FitFrustration =
  | "waist_gap"
  | "hip_tightness"
  | "wrong_length"
  | "thigh_fit"
  | "rise"
  | "other";

export const DENIM_BRANDS = [
  "Levi's", "Wrangler", "Lee", "H&M", "Zara",
  "Mango", "Gap", "Banana Republic", "AG Jeans",
  "Citizens of Humanity", "7 For All Mankind",
  "Good American", "Everlane", "Uniqlo", "Pepe Jeans",
  "Flying Machine", "Spykar", "Killer", "Numero Uno", "Newport"
] as const;
export type DenimBrand = typeof DENIM_BRANDS[number];

export const BRAND_SIZES = ["XS", "S", "M", "L", "XL", "XXL",
  "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34",
  "36", "38", "40", "42", "44"] as const;

export interface FitProfile {
  id?: string;
  height: Height;
  weight?: number | null;
  waist: WaistInch;
  hip: HipInch;
  waistFit: WaistFit;
  rise: Rise;
  thighFit: ThighFit;
  brands: DenimBrand[];
  brandSizes: Record<DenimBrand, string>;
  fitFrustration: FitFrustration;
  completedAt: string;
  flow: "manual" | "voice";
}
