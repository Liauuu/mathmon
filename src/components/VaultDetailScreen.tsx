"use client";

import { useCallback, useEffect, useState } from "react";
import MathProblemPreview from "@/components/MathProblemPreview";
import {
  loadVaultProblems,
  swapVaultProblemsInDisplayOrder,
  type ProblemVault,
  type VaultProblem,
} from "@/lib/problem-vaults";

type VaultDetailScreenProps = {
  userId: string;
  vault: ProblemVault;
  onBack: () => void;
  onStartSolve: () => void;
  onVaultUpdated: (vault: ProblemVault) => void;
};

export default function VaultDetailScreen({
  userId,
  vault,
  onBack,
  onStartSolve,
  onVaultUpdated,
}: VaultDetailScreenProps) {
  const [problems, setProblems] = useState<VaultProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadVaultProblems(userId, vault.id, vault.problemIds);
      setProblems(list);
      setSelectedIndex((prev) => {
        if (prev === null) return null;
        if (prev >= list.length) return list.length > 0 ? list.length - 1 : null;
        return prev;
      });
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

  const moveSelected = useCallback(
    async (direction: "up" | "down") => {
      if (selectedIndex === null || reordering) return;
      const swapWith =
        direction === "up" ? selectedIndex - 1 : selectedIndex + 1;
      if (swapWith < 0 || swapWith >= problems.length) return;

      setReordering(true);
      setError(null);
      try {
        const newProblemIds = await swapVaultProblemsInDisplayOrder(
          userId,
          vault.id,
          vault.problemIds,
          selectedIndex,
          direction,
        );
        onVaultUpdated({ ...vault, problemIds: newProblemIds });
        setSelectedIndex(swapWith);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "순서를 바꾸지 못했습니다.",
        );
      } finally {
        setReordering(false);
      }
    },
    [
      selectedIndex,
      reordering,
      problems.length,
      userId,
      vault,
      onVaultUpdated,
    ],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null || reordering) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        void moveSelected("up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        void moveSelected("down");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, reordering, moveSelected]);

  const count = problems.length;

  return (
    <div className="relative flex w-full max-w-lg flex-1 flex-col pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-[#84cc16]/30 bg-[#1f2937]/90 px-3 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-[#84cc16]/55 hover:bg-[#84cc16]/10"
        >
          <span aria-hidden>⬅️</span>
          뒤로가기
        </button>
        <h2 className="min-w-0 flex-1 truncate text-center text-lg font-bold text-[#84cc16]">
          {vault.name}
        </h2>
        <div className="w-[5.5rem] shrink-0" aria-hidden />
      </header>

      {error ? (
        <p className="mb-3 text-center text-sm text-red-400">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-gray-400">불러오는 중...</p>
      ) : count === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <p className="text-sm text-gray-400">이 저장소에 문항이 없어요.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {problems.map((_, i) => {
                const n = i + 1;
                const active = selectedIndex === i;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[#84cc16] bg-[#84cc16] text-[#111827]"
                        : "border-[#84cc16]/25 bg-[#1f2937]/90 text-[#a3e635] hover:border-[#84cc16]/50"
                    }`}
                    aria-label={`${n}번 문항 선택`}
                    aria-pressed={active}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                disabled={
                  selectedIndex === null || selectedIndex === 0 || reordering
                }
                onClick={() => void moveSelected("up")}
                aria-label="선택 문항 위로"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#84cc16]/30 bg-[#1f2937]/90 text-sm transition-colors hover:border-[#84cc16]/55 hover:bg-[#84cc16]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ▲
              </button>
              <button
                type="button"
                disabled={
                  selectedIndex === null ||
                  selectedIndex >= count - 1 ||
                  reordering
                }
                onClick={() => void moveSelected("down")}
                aria-label="선택 문항 아래로"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#84cc16]/30 bg-[#1f2937]/90 text-sm transition-colors hover:border-[#84cc16]/55 hover:bg-[#84cc16]/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ▼
              </button>
            </div>
          </div>

          {selectedIndex !== null ? (
            <p className="mb-3 text-center text-xs text-gray-500">
              {selectedIndex + 1}번 선택 · ▲▼ 또는 방향키로 순서 변경
              {reordering ? " (저장 중…)" : ""}
            </p>
          ) : (
            <p className="mb-3 text-center text-xs text-gray-500">
              번호 또는 카드를 눌러 선택한 뒤 순서를 바꿀 수 있어요
            </p>
          )}

          <div className="flex flex-col gap-4">
            {problems.map((item, i) => {
              const n = i + 1;
              const active = selectedIndex === i;
              return (
                <div key={item.id} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full rounded-2xl text-left transition-all ${
                      active
                        ? "ring-2 ring-[#84cc16] ring-offset-2 ring-offset-[#111827]"
                        : "ring-0"
                    }`}
                  >
                    <p className="mb-1.5 px-1 text-xs font-semibold text-[#a3e635]">
                      문제 {n}
                    </p>
                    <MathProblemPreview content={item.problem} compact />
                  </button>
                  <div
                    className={`rounded-2xl transition-all ${
                      active ? "opacity-100" : "opacity-95"
                    }`}
                  >
                    <p className="mb-1.5 px-1 text-xs font-semibold text-[#84cc16]/80">
                      정답 {n}
                    </p>
                    <MathProblemPreview content={item.answer} compact />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="pointer-events-none fixed bottom-[5.5rem] left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 justify-end px-5">
        <button
          type="button"
          onClick={onStartSolve}
          disabled={count === 0}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#84cc16] px-5 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#84cc16]/30 transition-transform hover:scale-[1.02] hover:bg-[#a3e635] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden>✍️</span>
          문제 풀기
        </button>
      </div>
    </div>
  );
}
