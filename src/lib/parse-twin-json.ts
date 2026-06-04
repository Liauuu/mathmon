import { repairJsonLatexEscapes } from "@/lib/normalize-math-markdown";

export type TwinResult = {
  problems: string;
  answers: string;
};

function normalizeTwinField(value: string): string {
  return repairJsonLatexEscapes(value);
}

function stripCodeFence(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function unescapeJsonStringPartial(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === "\\" && i + 1 < value.length) {
      const next = value[i + 1];
      if (next === "\\" || next === '"') {
        out += next === "\\" ? "\\" : '"';
        i += 2;
        continue;
      }
      if (next === "n") {
        out += "\n";
        i += 2;
        continue;
      }
      // LaTeX 명령(\frac, \beta 등)은 JSON 이스케이프로 해석하지 않음
      if ("bfnrt".includes(next)) {
        out += "\\" + next;
        i += 2;
        continue;
      }
      out += "\\" + next;
      i += 2;
      continue;
    }
    out += value[i];
  }
  return repairJsonLatexEscapes(out);
}

function extractJsonStringField(
  raw: string,
  field: "problems" | "answers",
): string | undefined {
  const marker = `"${field}"`;
  const start = raw.indexOf(marker);
  if (start === -1) return undefined;

  const colon = raw.indexOf(":", start + marker.length);
  if (colon === -1) return undefined;

  let i = colon + 1;
  while (i < raw.length && /\s/.test(raw[i])) i += 1;
  if (raw[i] !== '"') return undefined;
  i += 1;

  let result = "";
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "\\" && i + 1 < raw.length) {
      result += ch + raw[i + 1];
      i += 2;
      continue;
    }
    if (ch === '"') break;
    result += ch;
    i += 1;
  }

  return unescapeJsonStringPartial(result);
}

export function parseTwinJson(raw: string): TwinResult | null {
  const cleaned = stripCodeFence(raw);
  if (!cleaned) return null;

  try {
    const data = JSON.parse(cleaned) as Partial<TwinResult>;
    if (
      typeof data.problems === "string" &&
      typeof data.answers === "string"
    ) {
      return {
        problems: normalizeTwinField(data.problems),
        answers: normalizeTwinField(data.answers),
      };
    }
  } catch {
    /* streaming partial */
  }

  const problems = extractJsonStringField(cleaned, "problems");
  const answers = extractJsonStringField(cleaned, "answers");
  if (!problems && !answers) return null;

  return {
    problems: normalizeTwinField(problems ?? ""),
    answers: normalizeTwinField(answers ?? ""),
  };
}
