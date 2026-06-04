"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { normalizeMathMarkdown } from "@/lib/normalize-math-markdown";

type MathProblemPreviewProps = {
  content: string;
  isProcessing?: boolean;
  placeholder?: string;
  processingPlaceholder?: string;
  compact?: boolean;
};

export default function MathProblemPreview({
  content,
  isProcessing = false,
  placeholder = "사진을 업로드하면 추출된 문제가 수식으로 표시됩니다.",
  processingPlaceholder = "AI가 내용을 작성하는 중...",
  compact = false,
}: MathProblemPreviewProps) {
  const showPlaceholder = !content.trim() && !isProcessing;
  const showProcessingPlaceholder = !content.trim() && isProcessing;
  const markdown = useMemo(
    () => normalizeMathMarkdown(content),
    [content],
  );

  return (
    <div
      className={`math-problem-preview w-full rounded-2xl border border-[#84cc16]/30 bg-[#1f2937] px-4 py-4 text-sm leading-relaxed text-gray-100 ${compact ? "min-h-[8rem]" : "min-h-[12rem]"}`}
      aria-live="polite"
      aria-busy={isProcessing}
    >
      {showPlaceholder ? (
        <p className="text-center text-gray-500">{placeholder}</p>
      ) : showProcessingPlaceholder ? (
        <p className="text-center text-[#84cc16]/80">{processingPlaceholder}</p>
      ) : (
        <article className="math-problem-preview__body prose-math whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[
              [
                rehypeKatex,
                {
                  throwOnError: false,
                  strict: "ignore",
                  output: "html",
                },
              ],
            ]}
            components={{
              p: ({ children }) => (
                <p className="mb-3 last:mb-0">{children}</p>
              ),
            }}
          >
            {markdown}
          </ReactMarkdown>
          {isProcessing ? (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#84cc16]"
              aria-hidden
            />
          ) : null}
        </article>
      )}
    </div>
  );
}
