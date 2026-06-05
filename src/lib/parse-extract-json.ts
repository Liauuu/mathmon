export type ExtractDifficulty = "low_mid" | "high";

export type ExtractJsonResult = {
  text: string;
  difficulty: ExtractDifficulty;
};

function stripCodeFence(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

export function parseExtractJson(raw: string): ExtractJsonResult | null {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) return null;

  try {
    const data = JSON.parse(cleaned) as Partial<ExtractJsonResult>;
    if (typeof data.text !== "string") return null;
    if (data.difficulty !== "low_mid" && data.difficulty !== "high") return null;
    return {
      text: data.text,
      difficulty: data.difficulty,
    };
  } catch {
    return null;
  }
}

