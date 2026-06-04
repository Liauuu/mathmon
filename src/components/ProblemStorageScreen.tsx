"use client";

import { useCallback, useEffect, useState } from "react";
import CreateVaultModal from "@/components/CreateVaultModal";
import VaultDetailScreen from "@/components/VaultDetailScreen";
import VaultPracticeSolveScreen from "@/components/VaultPracticeSolveScreen";
import {
  createVault,
  deleteVault,
  getVaultItemCount,
  loadVaults,
  updateVaultName,
  type ProblemVault,
} from "@/lib/problem-vaults";

type StorageView = "list" | "detail" | "solve";

const DELETE_VAULT_CONFIRM =
  "이 저장소와 포함된 문항들이 모두 삭제됩니다. 정말 삭제하시겠습니까?";

type ProblemStorageScreenProps = {
  userId: string;
};

export default function ProblemStorageScreen({
  userId,
}: ProblemStorageScreenProps) {
  const [vaults, setVaults] = useState<ProblemVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<StorageView>("list");
  const [selectedVault, setSelectedVault] = useState<ProblemVault | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [renameVault, setRenameVault] = useState<ProblemVault | null>(null);
  const [busyVaultId, setBusyVaultId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setActionError(null);
    try {
      await createVault(userId, name);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "저장소를 만들지 못했습니다.",
      );
    }
  }

  async function handleRename(name: string) {
    if (!renameVault) return;
    setBusyVaultId(renameVault.id);
    setActionError(null);
    try {
      await updateVaultName(userId, renameVault.id, name);
      setRenameVault(null);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "이름을 수정하지 못했습니다.",
      );
    } finally {
      setBusyVaultId(null);
    }
  }

  async function handleDelete(vault: ProblemVault) {
    if (busyVaultId) return;
    if (!window.confirm(DELETE_VAULT_CONFIRM)) return;

    setBusyVaultId(vault.id);
    setActionError(null);
    try {
      await deleteVault(userId, vault.id);
      await refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "저장소를 삭제하지 못했습니다.",
      );
    } finally {
      setBusyVaultId(null);
    }
  }

  function openVault(vault: ProblemVault) {
    setSelectedVault(vault);
    setView("detail");
  }

  function syncVaultInList(updated: ProblemVault) {
    setSelectedVault(updated);
    setVaults((prev) =>
      prev.map((v) => (v.id === updated.id ? updated : v)),
    );
  }

  if (view === "solve" && selectedVault) {
    return (
      <VaultPracticeSolveScreen userId={userId} vault={selectedVault} />
    );
  }

  if (view === "detail" && selectedVault) {
    return (
      <VaultDetailScreen
        userId={userId}
        vault={selectedVault}
        onBack={() => {
          setView("list");
          setSelectedVault(null);
        }}
        onStartSolve={() => setView("solve")}
        onVaultUpdated={syncVaultInList}
      />
    );
  }

  return (
    <div className="relative flex w-full max-w-lg flex-1 flex-col pb-8">
      <h2 className="mb-4 text-center text-lg font-bold text-[#84cc16]">
        문제 저장소
      </h2>

      {actionError ? (
        <p className="mb-3 text-center text-sm text-red-400">{actionError}</p>
      ) : null}

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
            const isBusy = busyVaultId === vault.id;
            return (
              <li key={vault.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openVault(vault)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openVault(vault);
                    }
                  }}
                  className="relative cursor-pointer rounded-2xl border border-[#84cc16]/30 bg-[#1f2937]/90 px-4 py-4 shadow-md shadow-[#84cc16]/5 transition-colors hover:border-[#84cc16]/55 hover:bg-[#1f2937]"
                >
                  <div className="absolute right-3 top-3 flex gap-1.5">
                    <button
                      type="button"
                      aria-label={`${vault.name} 이름 수정`}
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameVault(vault);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#84cc16]/25 bg-[#111827]/80 text-sm transition-colors hover:border-[#84cc16]/50 hover:bg-[#84cc16]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      aria-label={`${vault.name} 삭제`}
                      disabled={isBusy}
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDelete(vault);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/25 bg-[#111827]/80 text-sm transition-colors hover:border-red-400/50 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 pr-20 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-gray-100">
                      {vault.name}
                    </span>
                    <span className="text-sm font-medium text-[#a3e635]">
                      ({count}문항)
                    </span>
                  </div>
                </div>
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

      <CreateVaultModal
        open={renameVault !== null}
        variant="rename"
        initialName={renameVault?.name ?? ""}
        onClose={() => setRenameVault(null)}
        onCreate={(name) => {
          void handleRename(name);
        }}
      />
    </div>
  );
}
