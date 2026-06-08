import type { TwinProblemItem } from "@/lib/parse-twin-json";

const REQUIRED_ITEM_COUNT = 3;

export function isTwinSaveReady(
  items: TwinProblemItem[],
  isProcessing: boolean,
  isTwinError: boolean,
): boolean {
  if (isProcessing || isTwinError) return false;
  if (items.length !== REQUIRED_ITEM_COUNT) return false;

  return items.every(
    (item) => item.question.trim().length > 0 && item.solution.trim().length > 0,
  );
}
