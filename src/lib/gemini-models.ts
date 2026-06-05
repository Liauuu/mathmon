export const GEMINI_FLASH_MODEL = "gemini-2.5-flash";
export const GEMINI_PRO_MODEL = "gemini-2.5-pro";

export type ExtractDifficulty = "low_mid" | "high";

export function getGeminiModelByDifficulty(
  difficulty: ExtractDifficulty | undefined,
): string {
  if (difficulty === "low_mid") return GEMINI_FLASH_MODEL;
  return GEMINI_PRO_MODEL;
}
