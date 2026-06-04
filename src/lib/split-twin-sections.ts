/** API가 problems/answers 필드에 넣는 연습문제 3개 구분자 */
export const TWIN_SECTION_SEPARATOR = "\n\n---\n\n";

const SECTION_COUNT = 3;

export function splitTwinSections(text: string): string[] {
  const parts = text
    .split(TWIN_SECTION_SEPARATOR)
    .map((s) => s.trim())
    .filter((s, i, arr) => s.length > 0 || arr.length === 1);

  const result: string[] = [];
  for (let i = 0; i < SECTION_COUNT; i += 1) {
    result.push(parts[i] ?? "");
  }
  return result;
}
