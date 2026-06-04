"use client";

import MathProblemPreview from "@/components/MathProblemPreview";
import { splitTwinSections } from "@/lib/split-twin-sections";

type TwinResultSectionProps = {
  problems: string;
  answers: string;
  isProcessing: boolean;
  isTwinError: boolean;
  onRetry: () => void;
};

const SECTION_LABELS = [
  { problem: "문제 1", answer: "답 1" },
  { problem: "문제 2", answer: "답 2" },
  { problem: "문제 3", answer: "답 3" },
] as const;

export default function TwinResultSection({
  problems,
  answers,
  isProcessing,
  isTwinError,
  onRetry,
}: TwinResultSectionProps) {
  const problemParts = splitTwinSections(problems);
  const answerParts = splitTwinSections(answers);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      {isTwinError ? (
        <div
          role="alert"
          className="flex w-full flex-col items-center gap-4 rounded-2xl border border-orange-500/45 bg-orange-950/40 px-5 py-5 shadow-lg shadow-orange-900/20"
        >
          <p className="text-center text-sm font-semibold leading-relaxed text-orange-300">
            AI가 바빠요 <span aria-hidden>👾</span> 잠시 후 다시 시작해 주세요.
          </p>
          <button
            type="button"
            onClick={onRetry}
            disabled={isProcessing}
            className="flex h-11 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/50 bg-[#1f2937] px-5 text-sm font-bold text-[#a3e635] shadow-md shadow-[#84cc16]/15 transition-all hover:border-[#84cc16] hover:bg-[#84cc16]/10 hover:text-[#bef264] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            다시 시도하기 🔄
          </button>
        </div>
      ) : null}

      <h2 className="text-center text-lg font-bold tracking-tight text-[#84cc16]">
        연습문제
      </h2>

      {SECTION_LABELS.map((labels, index) => {
        const problemContent = problemParts[index] ?? "";
        const answerContent = answerParts[index] ?? "";
        const problemPending =
          isProcessing && !problemContent.trim() && index === 0;
        const answerPending =
          isProcessing &&
          !answerContent.trim() &&
          problemContent.trim().length > 0;

        return (
          <div key={labels.problem} className="flex flex-col gap-5">
            <section className="w-full rounded-2xl border border-[#84cc16]/40 bg-[#1f2937]/80 p-4 shadow-lg shadow-[#84cc16]/10">
              <h3 className="mb-3 text-sm font-bold tracking-tight text-[#84cc16]">
                {labels.problem}
              </h3>
              <MathProblemPreview
                content={problemContent}
                isProcessing={problemPending}
                compact
                placeholder={`${labels.problem}이 여기에 표시됩니다.`}
                processingPlaceholder="연습문제를 생성하는 중..."
              />
            </section>

            <section className="w-full rounded-2xl border border-[#84cc16]/25 bg-[#1f2937]/60 p-4">
              <h3 className="mb-3 text-sm font-bold tracking-tight text-[#a3e635]">
                {labels.answer}
              </h3>
              <MathProblemPreview
                content={answerContent}
                isProcessing={answerPending}
                compact
                placeholder={`${labels.answer}이 여기에 표시됩니다.`}
                processingPlaceholder="정답을 생성하는 중..."
              />
            </section>
          </div>
        );
      })}
    </div>
  );
}
