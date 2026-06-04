"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type MathProblemPreviewProps = {
  content: string;
  isProcessing?: boolean;
};

export default function MathProblemPreview({
  content,
  isProcessing = false,
}: MathProblemPreviewProps) {
  const showPlaceholder = !content.trim() && !isProcessing;

  return (
    <div
      className="math-problem-preview w-full min-h-[12rem] rounded-2xl border border-[#84cc16]/30 bg-[#1f2937] px-4 py-4 text-sm leading-relaxed text-gray-100"
      aria-live="polite"
      aria-busy={isProcessing}
    >
      {showPlaceholder ? (
        <p className="text-center text-gray-500">
          사진을 업로드하면 추출된 문제가 수식으로 표시됩니다.
        </p>
      ) : (
        <article className="math-problem-preview__body prose-math">
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
            {content}
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
