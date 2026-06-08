"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DrawingToolbar from "@/components/DrawingToolbar";
import MathProblemPreview from "@/components/MathProblemPreview";
import ProblemDrawingCanvas, {
  DEFAULT_PEN_COLOR,
  DEFAULT_PEN_WIDTH,
  type DrawingTool,
  type ProblemDrawingCanvasHandle,
} from "@/components/ProblemDrawingCanvas";
import {
  clearSolveScreenActive,
  flushPendingPwaReload,
  markSolveScreenActive,
} from "@/lib/pwa-update";
import {
  loadVaultProblems,
  saveVaultProblemGrade,
  type ProblemGradeStatus,
  type ProblemVault,
  type VaultProblem,
} from "@/lib/problem-vaults";
import {
  buildSamLectureResumeUrl,
  type SamPracticeParams,
} from "@/lib/sam-integration";
import { syncSamLectureProgressFromVault } from "@/lib/sam-lecture-progress";
import { syncSamWrongAnswerFromVault } from "@/lib/sam-wrong-answers";
import {
  loadStudentVaultGrades,
  saveStudentVaultProblemGrade,
} from "@/lib/student-vault-practice";

type VaultPracticeSolveScreenProps = {
  vaultOwnerId: string;
  vault: ProblemVault;
  sam?: SamPracticeParams;
  hideBottomNav?: boolean;
  onFinish?: () => void;
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
  vaultOwnerId,
  vault,
  sam,
  onFinish,
}: VaultPracticeSolveScreenProps) {
  const isSamMode = Boolean(sam);
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
  const [drawingTool, setDrawingTool] = useState<DrawingTool>("pen");
  const [strokeColor, setStrokeColor] = useState<string>(DEFAULT_PEN_COLOR);
  const [penWidth, setPenWidth] = useState(DEFAULT_PEN_WIDTH);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toolbarColumn, setToolbarColumn] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<ProblemDrawingCanvasHandle>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadVaultProblems(
        vaultOwnerId,
        vault.id,
        vault.problemIds,
      );
      setProblems(list);
      const initial: Record<string, ProblemGradeStatus> = {};
      if (isSamMode && sam) {
        const studentGrades = await loadStudentVaultGrades(
          sam.studentId,
          list.map((p) => p.id),
        );
        Object.assign(initial, studentGrades);
      } else {
        for (const p of list) {
          if (p.gradeStatus) initial[p.id] = p.gradeStatus;
        }
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
  }, [vaultOwnerId, vault.id, vault.problemIds, isSamMode, sam]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    markSolveScreenActive();
    return () => {
      clearSolveScreenActive();
      flushPendingPwaReload();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setToolbarColumn(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = workspaceRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
        await el.requestFullscreen();
      }
    } catch {
      /* Safari / unsupported */
    }
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

  function handleFinishPractice() {
    if (isSamMode && sam) {
      const returnUrl = buildSamLectureResumeUrl(sam);
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = returnUrl;
        } catch {
          window.location.assign(returnUrl);
        }
        window.close();
        return;
      }
      window.location.assign(returnUrl);
      return;
    }

    onFinish?.();
  }

  async function handleGrade(status: ProblemGradeStatus) {
    if (!current || grades[current.id]) return;

    setGrades((prev) => ({ ...prev, [current.id]: status }));
    setAnswerOpen(false);

    try {
      if (isSamMode && sam) {
        await saveStudentVaultProblemGrade(
          sam.studentId,
          sam.teacherUid,
          sam.vaultId,
          current.id,
          status,
        );
        await syncSamLectureProgressFromVault({
          sam,
          vaultProblemId: current.id,
          status,
        });
        if (status === "incorrect") {
          await syncSamWrongAnswerFromVault({
            sam,
            vaultProblemId: current.id,
            problemText: current.problem,
            answerText: current.answer,
          });
        }
      } else {
        await saveVaultProblemGrade(
          vaultOwnerId,
          vault.id,
          current.id,
          status,
        );
      }
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
    <div className="relative flex min-h-0 w-full max-w-full flex-1 flex-col pb-32 md:max-w-7xl md:pb-28 lg:max-w-none lg:pb-24">
      <div className="mb-2 flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleFinishPractice}
          className="shrink-0 rounded-xl border border-[#84cc16]/35 bg-[#1f2937] px-3 py-2 text-sm font-semibold text-[#a3e635] transition-colors hover:border-[#84cc16] hover:bg-[#84cc16]/10"
        >
          {isSamMode ? "← 쌤으로 돌아가기" : "← 저장소로"}
        </button>
        <h2 className="min-w-0 flex-1 truncate text-center text-base font-bold text-[#84cc16] md:text-lg">
          {vault.name}
          {isSamMode ? " · 쌤 수업" : ""}
        </h2>
      </div>

      {error ? (
        <p className="mb-2 shrink-0 text-center text-sm text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-gray-400">불러오는 중...</p>
      ) : count === 0 ? (
        <p className="text-center text-sm text-gray-400">풀 문항이 없어요.</p>
      ) : (
        <div
          ref={workspaceRef}
          className={`flex min-h-0 flex-1 flex-col gap-2 md:gap-3 ${
            isFullscreen
              ? "bg-[#111827] p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              : ""
          }`}
        >
          <div className="shrink-0 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

          <p className="hidden shrink-0 rounded-xl border border-[#84cc16]/35 bg-[#84cc16]/10 px-3 py-2 text-center text-sm font-semibold text-[#d9f99d] md:block">
            ✍️ 터치펜·손가락으로 문제 위에 바로 풀 수 있어요
          </p>

          <div className="flex min-h-0 flex-1 flex-col gap-2 md:flex-row md:gap-3">
            <div className="shrink-0 md:w-52 lg:w-56">
              <DrawingToolbar
                layout={toolbarColumn ? "column" : "row"}
                tool={drawingTool}
                onToolChange={setDrawingTool}
                strokeColor={strokeColor}
                onStrokeColorChange={setStrokeColor}
                penWidth={penWidth}
                onPenWidthChange={setPenWidth}
                onClear={() => canvasRef.current?.clear()}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => void toggleFullscreen()}
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
              <p className="shrink-0 px-1 text-xs font-medium text-gray-500">
                문제 풀이
              </p>

              <div
                key={current?.id ?? currentIndex}
                className={`problem-solve-board relative min-h-[min(72dvh,42rem)] flex-1 overflow-hidden rounded-2xl border border-[#84cc16]/30 bg-[#1f2937] shadow-inner select-none touch-none overscroll-none md:min-h-[min(68dvh,48rem)] lg:min-h-[min(75dvh,52rem)] ${slideClass}`}
              >
                <div className="pointer-events-none absolute inset-0 z-0 overflow-y-auto px-3 py-3 select-none">
                  <MathProblemPreview
                    content={current?.problem ?? ""}
                    compact
                    placeholder="문항 내용이 없습니다."
                  />
                </div>
                <div className="absolute inset-0 z-10 touch-none select-none">
                  <ProblemDrawingCanvas
                    ref={canvasRef}
                    key={current?.id}
                    problemId={current?.id ?? "unknown"}
                    tool={drawingTool}
                    strokeColor={strokeColor}
                    penWidth={penWidth}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {answerOpen && current ? (
        <div
          className="fixed inset-x-0 bottom-[calc(var(--business-footer-height)+5.5rem)] z-40 mx-auto w-full max-w-full px-4 animate-[solve-answer-in_0.28s_ease-out] md:max-w-7xl md:px-6 lg:max-w-none"
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

      <div className="pointer-events-none fixed bottom-[calc(var(--business-footer-height)+5.5rem)] left-1/2 z-50 flex w-full max-w-full -translate-x-1/2 flex-col items-end gap-2 px-4 md:max-w-7xl md:px-6 lg:max-w-none lg:px-8">
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
