import { splitTwinSections } from "@/lib/split-twin-sections";

export function isTwinSaveReady(
  problems: string,
  answers: string,
  isProcessing: boolean,
  isTwinError: boolean,
): boolean {
  if (isProcessing || isTwinError) return false;

  const problemParts = splitTwinSections(problems);
  const answerParts = splitTwinSections(answers);

  return problemParts.every((p) => p.trim().length > 0) &&
    answerParts.every((a) => a.trim().length > 0);
}
