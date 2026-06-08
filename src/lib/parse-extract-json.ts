import type { ExtractDifficulty } from "@/lib/gemini-models";

export type { ExtractDifficulty };

export type ExtractJsonResult = {
  text: string;
  difficulty: ExtractDifficulty;
  has_geometry: boolean;
  has_graph: boolean;
};

function stripCodeFence(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function parseBooleanFlag(value: unknown): boolean {
  return value === true;
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
      has_geometry: parseBooleanFlag(data.has_geometry),
      has_graph: parseBooleanFlag(data.has_graph),
    };
  } catch {
    return null;
  }
}
