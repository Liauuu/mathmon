"use client";

import { useMemo, useState } from "react";
import MathProblemPreview from "@/components/MathProblemPreview";
import ProblemGraphicRenderer from "@/components/ProblemGraphicRenderer";
import SaveProblemsModal from "@/components/SaveProblemsModal";
import { isTwinSaveReady } from "@/lib/twin-save-ready";
import type { TwinProblemItem } from "@/lib/parse-twin-json";
import type { SaveTwinProblemsInput } from "@/lib/problem-vaults";

type TwinResultSectionProps = {
  userId: string;
  originalExtractedText: string;
  items: TwinProblemItem[];
  isProcessing: boolean;
  isTwinError: boolean;
  onRetry: () => void;
  onGenerateMore: () => void;
  onResetToHome: () => void;
};

const SECTION_LABELS = [
  { problem: "문제 1", answer: "답 1" },
  { problem: "문제 2", answer: "답 2" },
  { problem: "문제 3", answer: "답 3" },
] as const;

const PLACEHOLDER_ITEMS: TwinProblemItem[] = [
  { question: "", solution: "" },
  { question: "", solution: "" },
  { question: "", solution: "" },
];

export default function TwinResultSection({
  userId,
  originalExtractedText,
  items,
  isProcessing,
  isTwinError,
  onRetry,
  onGenerateMore,
  onResetToHome,
}: TwinResultSectionProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const displayItems = useMemo(() => {
    const merged = [...PLACEHOLDER_ITEMS];
    for (let i = 0; i < Math.min(items.length, 3); i += 1) {
      merged[i] = items[i];
    }
    return merged;
  }, [items]);

  const canSave = isTwinSaveReady(items, isProcessing, isTwinError);

  const canGenerateMore =
    !isProcessing && !isTwinError && items.length >= 3;

  const saveInput: SaveTwinProblemsInput = useMemo(
    () => ({
      originalExtractedText,
      items: displayItems,
    }),
    [originalExtractedText, displayItems],
  );

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

      <div className="flex flex-col items-center gap-3">
        {canSave ? (
          <>
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className="flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/50 bg-[#1f2937] px-5 text-sm font-bold text-[#a3e635] shadow-md shadow-[#84cc16]/15 transition-all hover:border-[#84cc16] hover:bg-[#84cc16]/10 hover:text-[#bef264] active:scale-[0.98]"
            >
              문제 저장
            </button>
            {savedNotice ? (
              <p className="text-center text-xs text-[#a3e635]">
                저장이 완료되었습니다.
              </p>
            ) : null}
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setSavedNotice(false);
            onGenerateMore();
          }}
          disabled={!canGenerateMore}
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/50 bg-[#84cc16]/90 px-5 text-sm font-bold text-[#111827] shadow-md shadow-[#84cc16]/25 transition-all hover:bg-[#a3e635] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          같은 유형 문제 더 만들기 🔄
        </button>
        <button
          type="button"
          onClick={onResetToHome}
          disabled={isProcessing}
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-[#84cc16]/40 bg-[#1f2937] px-5 text-sm font-bold text-[#a3e635] shadow-md shadow-[#84cc16]/15 transition-all hover:border-[#84cc16] hover:bg-[#84cc16]/10 hover:text-[#bef264] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          처음 화면으로 돌아가기 🏠
        </button>
      </div>

      <h2 className="text-center text-lg font-bold tracking-tight text-[#84cc16]">
        연습문제
      </h2>

      {SECTION_LABELS.map((labels, index) => {
        const item = displayItems[index];
        const questionContent = item.question;
        const solutionContent = item.solution;
        const problemPending =
          isProcessing && !questionContent.trim() && index === 0;
        const answerPending =
          isProcessing &&
          !solutionContent.trim() &&
          questionContent.trim().length > 0;

        return (
          <div key={labels.problem} className="flex flex-col gap-5">
            <section className="w-full rounded-2xl border border-[#84cc16]/40 bg-[#1f2937]/80 p-4 shadow-lg shadow-[#84cc16]/10">
              <h3 className="mb-3 text-sm font-bold tracking-tight text-[#84cc16]">
                {labels.problem}
              </h3>
              <ProblemGraphicRenderer
                svgCode={item.svg_code}
                graphData={item.graph_data}
              />
              <MathProblemPreview
                content={questionContent}
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
                content={solutionContent}
                isProcessing={answerPending}
                compact
                placeholder={`${labels.answer}이 여기에 표시됩니다.`}
                processingPlaceholder="정답을 생성하는 중..."
              />
            </section>
          </div>
        );
      })}

      <SaveProblemsModal
        open={saveModalOpen}
        userId={userId}
        saveInput={saveInput}
        onClose={() => setSaveModalOpen(false)}
        onSaved={() => setSavedNotice(true)}
      />
    </div>
  );
}
