"use client";

import MathProblemPreview from "@/components/MathProblemPreview";
import { splitTwinSections } from "@/lib/split-twin-sections";

type TwinResultSectionProps = {
  problems: string;
  answers: string;
  isProcessing: boolean;
  error: string | null;
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
  error,
}: TwinResultSectionProps) {
  const problemParts = splitTwinSections(problems);
  const answerParts = splitTwinSections(answers);

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      {error ? (
        <p className="w-full text-center text-sm text-red-400">{error}</p>
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
