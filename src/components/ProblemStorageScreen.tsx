"use client";

import { useCallback, useEffect, useState } from "react";
import CreateVaultModal from "@/components/CreateVaultModal";
import {
  createVault,
  getVaultItemCount,
  loadVaults,
  type ProblemVault,
} from "@/lib/problem-vaults";

type ProblemStorageScreenProps = {
  userId: string;
};

export default function ProblemStorageScreen({
  userId,
}: ProblemStorageScreenProps) {
  const [vaults, setVaults] = useState<ProblemVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await loadVaults(userId);
      setVaults(list);
    } catch {
      setVaults([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(name: string) {
    await createVault(userId, name);
    await refresh();
  }

  return (
    <div className="relative flex w-full max-w-lg flex-1 flex-col pb-8">
      <h2 className="mb-4 text-center text-lg font-bold text-[#84cc16]">
        문제 저장소
      </h2>

      {loading ? (
        <p className="text-center text-sm text-gray-400">불러오는 중...</p>
      ) : vaults.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-sm text-gray-400">
            아직 저장소가 없어요.
            <br />
            오른쪽 아래 <span className="text-[#a3e635]">+</span> 버튼으로
            폴더를 만들어 보세요.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {vaults.map((vault) => {
            const count = getVaultItemCount(vault);
            return (
              <li key={vault.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 rounded-2xl border border-[#84cc16]/30 bg-[#1f2937]/90 px-4 py-4 text-left shadow-md shadow-[#84cc16]/5 transition-colors hover:border-[#84cc16]/55 hover:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-semibold text-gray-100">
                    {vault.name}
                  </span>
                  <span className="text-sm font-medium text-[#a3e635]">
                    ({count}문항)
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pointer-events-none fixed bottom-[5.5rem] left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 justify-end px-5">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="새 저장소 만들기"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#84cc16] text-2xl font-bold text-[#111827] shadow-lg shadow-[#84cc16]/30 transition-transform hover:scale-105 hover:bg-[#a3e635] active:scale-95"
        >
          +
        </button>
      </div>

      <CreateVaultModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(name) => {
          void handleCreate(name);
        }}
      />
    </div>
  );
}
