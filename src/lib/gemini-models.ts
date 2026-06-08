import type { ProblemVisualFlags } from "@/lib/twin-problem-type";

export const GEMINI_FLASH_MODEL = "gemini-2.5-flash";
export const GEMINI_PRO_MODEL = "gemini-2.5-pro";

export type ExtractDifficulty = "low_mid" | "high";

export function shouldUseProModel(
  difficulty: ExtractDifficulty | undefined,
  flags?: ProblemVisualFlags,
): boolean {
  if (flags?.has_geometry || flags?.has_graph) return true;
  if (difficulty === "low_mid") return false;
  return true;
}

export function getGeminiModelForTwin(
  difficulty: ExtractDifficulty | undefined,
  flags?: ProblemVisualFlags,
): string {
  return shouldUseProModel(difficulty, flags)
    ? GEMINI_PRO_MODEL
    : GEMINI_FLASH_MODEL;
}

/** @deprecated Use getGeminiModelForTwin with visual flags */
export function getGeminiModelByDifficulty(
  difficulty: ExtractDifficulty | undefined,
): string {
  return getGeminiModelForTwin(difficulty);
}
