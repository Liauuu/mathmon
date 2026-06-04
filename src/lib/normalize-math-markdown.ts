/**
 * JSON.parse가 LaTeX의 \f, \t, \b, \n, \r 등을 이스케이프로 해석해 깨뜨리는 경우 복구.
 */
export function repairJsonLatexEscapes(text: string): string {
  return text
    .replace(/\u000Cfrac/g, "\\frac")
    .replace(/\u000C(?=rac|loor)/g, "\\f")
    .replace(/\u0008(?=eta|inom|ar|ig|mod)/g, "\\b")
    .replace(/\u0009(?=ext|heta|imes|an|o|riangle|herefore)/g, "\\t")
    .replace(/\u000A(?=eq|u|abla|ot|otin|rightarrow|leftarrow)/g, "\\n")
    .replace(/\u000D(?=ight|ho|angle)/g, "\\r");
}

function fixMathInnerBackslashes(inner: string): string {
  return inner.replace(/\\\\/g, "\\");
}

function wrapInlineMath(inner: string): string {
  const body = fixMathInnerBackslashes(inner.trim());
  if (!body) return "";
  return ` $ ${body} $ `;
}

/**
 * remark-math / KaTeX가 놓치기 쉬운 $...$ 구간을 공백 패딩·백슬래시 정리.
 */
export function normalizeMathMarkdown(text: string): string {
  if (!text.trim()) return text;

  let result = repairJsonLatexEscapes(text);

  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner: string) => {
    const body = fixMathInnerBackslashes(inner.trim());
    return `\n\n$$\n${body}\n$$\n\n`;
  });

  result = result.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_, inner: string) =>
    wrapInlineMath(inner),
  );

  const trimmed = result.trim();
  if (/^\\\(|^\\\[/.test(trimmed)) {
    result = trimmed
      .replace(/^\\\(([\s\S]+?)\\\)$/m, (_, inner: string) => wrapInlineMath(inner))
      .replace(/^\\\[([\s\S]+?)\\\]$/m, (_, inner: string) => {
        const body = fixMathInnerBackslashes(inner.trim());
        return `\n\n$$\n${body}\n$$\n\n`;
      });
  }

  return result;
}
