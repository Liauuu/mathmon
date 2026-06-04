"use client";

import MathProblemPreview from "@/components/MathProblemPreview";

type TwinResultSectionProps = {
  problems: string;
  answers: string;
  isProcessing: boolean;
  error: string | null;
};

export default function TwinResultSection({
  problems,
  answers,
  isProcessing,
  error,
}: TwinResultSectionProps) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      {error ? (
        <p className="w-full text-center text-sm text-red-400">{error}</p>
      ) : null}

      <section className="w-full rounded-2xl border border-[#84cc16]/40 bg-[#1f2937]/80 p-4 shadow-lg shadow-[#84cc16]/10">
        <h2 className="mb-3 text-base font-bold tracking-tight text-[#84cc16]">
          쌍둥이 문제 3개
        </h2>
        <MathProblemPreview
          content={problems}
          isProcessing={isProcessing && !problems.trim()}
          compact
          placeholder="쌍둥이 문제가 여기에 표시됩니다."
          processingPlaceholder="쌍둥이 문제를 생성하는 중..."
        />
      </section>

      <section className="w-full rounded-2xl border border-[#84cc16]/25 bg-[#1f2937]/60 p-4">
        <h2 className="mb-3 text-base font-bold tracking-tight text-[#a3e635]">
          정답 확인
        </h2>
        <MathProblemPreview
          content={answers}
          isProcessing={isProcessing && !answers.trim()}
          compact
          placeholder="정답이 여기에 표시됩니다."
          processingPlaceholder="정답을 생성하는 중..."
        />
      </section>
    </div>
  );
}
