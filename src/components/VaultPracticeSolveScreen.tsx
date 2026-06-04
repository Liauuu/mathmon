"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MathProblemPreview from "@/components/MathProblemPreview";
import ProblemDrawingCanvas from "@/components/ProblemDrawingCanvas";
import {
  loadVaultProblems,
  saveVaultProblemGrade,
  type ProblemGradeStatus,
  type ProblemVault,
  type VaultProblem,
} from "@/lib/problem-vaults";

type VaultPracticeSolveScreenProps = {
  userId: string;
  vault: ProblemVault;
  onBack: () => void;
};

const AUTO_ADVANCE_MS = 700;

function gradeLabel(status: ProblemGradeStatus): string {
  return status === "correct" ? "O" : "X";
}

function gradeBadgeClass(status: ProblemGradeStatus): string {
  return status === "correct"
    ? "bg-emerald-500 text-[#111827]"
    : "bg-red-500 text-white";
}

export default function VaultPracticeSolveScreen({
  userId,
  vault,
  onBack,
}: VaultPracticeSolveScreenProps) {
  const [problems, setProblems] = useState<VaultProblem[]>([]);
  const [grades, setGrades] = useState<Record<string, ProblemGradeStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [animating, setAnimating] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadVaultProblems(userId, vault.id, vault.problemIds);
      setProblems(list);
      const initial: Record<string, ProblemGradeStatus> = {};
      for (const p of list) {
        if (p.gradeStatus) initial[p.id] = p.gradeStatus;
      }
      setGrades(initial);
      setCurrentIndex((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)));
    } catch (err) {
      setProblems([]);
      setError(
        err instanceof Error ? err.message : "문항을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId, vault.id, vault.problemIds]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const count = problems.length;
  const current = problems[currentIndex];

  function goToIndex(next: number, direction: "left" | "right") {
    if (next < 0 || next >= count || next === currentIndex || animating) return;
    setAnswerOpen(false);
    setSlideDirection(direction);
    setAnimating(true);
    window.setTimeout(() => {
      setCurrentIndex(next);
      setSlideDirection(null);
      setAnimating(false);
    }, 220);
  }

  function jumpTo(index: number) {
    if (index === currentIndex) return;
    goToIndex(index, index > currentIndex ? "left" : "right");
  }

  async function handleGrade(status: ProblemGradeStatus) {
    if (!current || grades[current.id]) return;

    setGrades((prev) => ({ ...prev, [current.id]: status }));
    setAnswerOpen(false);

    try {
      await saveVaultProblemGrade(userId, vault.id, current.id, status);
    } catch (err) {
      setGrades((prev) => {
        const next = { ...prev };
        delete next[current.id];
        return next;
      });
      setError(
        err instanceof Error ? err.message : "채점을 저장하지 못했습니다.",
      );
      return;
    }

    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    const nextIndex = currentIndex + 1;
    if (nextIndex < count) {
      advanceTimerRef.current = setTimeout(() => {
        goToIndex(nextIndex, "left");
      }, AUTO_ADVANCE_MS);
    }
  }

  const slideClass =
    slideDirection === "left"
      ? "animate-[solve-slide-out-left_0.22s_ease-in_forwards]"
      : slideDirection === "right"
        ? "animate-[solve-slide-out-right_0.22s_ease-in_forwards]"
        : "animate-[solve-slide-in_0.28s_ease-out]";

  return (
    <div className="relative flex w-full max-w-lg flex-1 flex-col pb-32">
      <header className="mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-[#84cc16]/30 bg-[#1f2937]/90 px-3 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-[#84cc16]/55"
        >
          <span aria-hidden>⬅️</span>
          저장소
        </button>
        <h2 className="min-w-0 flex-1 truncate text-center text-base font-bold text-[#84cc16]">
          {vault.name}
        </h2>
        <div className="w-[4.5rem] shrink-0" aria-hidden />
      </header>

      {error ? (
        <p className="mb-2 text-center text-sm text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-gray-400">불러오는 중...</p>
      ) : count === 0 ? (
        <p className="text-center text-sm text-gray-400">풀 문항이 없어요.</p>
      ) : (
        <>
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {problems.map((p, i) => {
              const n = i + 1;
              const active = currentIndex === i;
              const mark = grades[p.id];
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => jumpTo(i)}
                  disabled={animating}
                  className={`relative flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl border px-2.5 text-sm font-bold transition-colors disabled:opacity-60 ${
                    active
                      ? "border-[#84cc16] bg-[#84cc16] text-[#111827]"
                      : "border-[#84cc16]/25 bg-[#1f2937]/90 text-[#a3e635] hover:border-[#84cc16]/50"
                  }`}
                  aria-label={`${n}번 문항`}
                  aria-current={active ? "true" : undefined}
                >
                  {mark ? (
                    <span
                      className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black shadow-md ${gradeBadgeClass(mark)}`}
                      aria-hidden
                    >
                      {gradeLabel(mark)}
                    </span>
                  ) : null}
                  {n}
                </button>
              );
            })}
          </div>

          <p className="mb-2 rounded-xl border border-[#84cc16]/35 bg-[#84cc16]/10 px-3 py-2 text-center text-sm font-semibold text-[#d9f99d]">
            ✍️ 터치펜·손가락으로 문제 위에 바로 풀 수 있어요
          </p>

          <p className="mb-2 px-1 text-xs font-medium text-gray-500">
            문제 풀이
          </p>

          <div
            key={current?.id ?? currentIndex}
            className={`relative min-h-[22rem] flex-1 overflow-hidden rounded-2xl border border-[#84cc16]/30 bg-[#1f2937] shadow-inner ${slideClass}`}
          >
            <div className="pointer-events-none absolute inset-0 z-0 overflow-y-auto px-3 py-3 pb-16">
              <MathProblemPreview
                content={current?.problem ?? ""}
                compact
                placeholder="문항 내용이 없습니다."
              />
            </div>
            <div className="absolute inset-0 z-10 min-h-[22rem]">
              <ProblemDrawingCanvas
                key={current?.id}
                problemId={current?.id ?? "unknown"}
              />
            </div>
          </div>
        </>
      )}

      {answerOpen && current ? (
        <div
          className="fixed inset-x-0 bottom-[5.5rem] z-40 mx-auto max-w-lg px-4 animate-[solve-answer-in_0.28s_ease-out]"
          role="dialog"
          aria-label="정답"
        >
          <div className="rounded-2xl border border-[#84cc16]/40 bg-[#111827]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md">
            <p className="mb-2 text-xs font-semibold text-[#a3e635]">정답</p>
            <div className="max-h-40 overflow-y-auto">
              <MathProblemPreview content={current.answer} compact />
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-none fixed bottom-[5.5rem] left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col items-end gap-2 px-5">
        {answerOpen && current && !grades[current.id] ? (
          <div className="pointer-events-auto flex gap-2">
            <button
              type="button"
              onClick={() => void handleGrade("correct")}
              className="flex h-12 min-w-12 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 px-4 text-lg font-black text-emerald-300 shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="맞음"
            >
              O
            </button>
            <button
              type="button"
              onClick={() => void handleGrade("incorrect")}
              className="flex h-12 min-w-12 items-center justify-center rounded-full border-2 border-red-400 bg-red-500/20 px-4 text-lg font-black text-red-300 shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label="틀림"
            >
              X
            </button>
          </div>
        ) : null}

        <button
          type="button"
          disabled={!current}
          onClick={() => setAnswerOpen((o) => !o)}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#84cc16]/40 bg-[#1f2937] px-4 py-3 text-sm font-bold text-[#a3e635] shadow-lg shadow-black/30 transition-colors hover:border-[#84cc16] hover:bg-[#84cc16]/10 disabled:opacity-50"
        >
          <span aria-hidden>👁️</span>
          {answerOpen ? "정답 숨기기" : "정답 보기"}
        </button>
      </div>
    </div>
  );
}
