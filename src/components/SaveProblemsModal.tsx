"use client";

import { useCallback, useEffect, useState } from "react";
import CreateVaultModal from "@/components/CreateVaultModal";
import {
  createVault,
  getVaultItemCount,
  loadVaults,
  saveTwinProblemsToVault,
  type ProblemVault,
  type SaveTwinProblemsInput,
} from "@/lib/problem-vaults";

type SaveProblemsModalProps = {
  open: boolean;
  userId: string;
  saveInput: SaveTwinProblemsInput;
  onClose: () => void;
  onSaved: () => void;
};

export default function SaveProblemsModal({
  open,
  userId,
  saveInput,
  onClose,
  onSaved,
}: SaveProblemsModalProps) {
  const [vaults, setVaults] = useState<ProblemVault[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const refreshVaults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadVaults(userId);
      setVaults(list);
    } catch {
      setError("저장소 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void refreshVaults();
  }, [open, refreshVaults]);

  if (!open) return null;

  async function persistToVault(vaultId: string) {
    setSaving(true);
    setError(null);
    try {
      await saveTwinProblemsToVault(userId, vaultId, saveInput);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "문제 저장에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectVault(vaultId: string) {
    if (saving) return;
    await persistToVault(vaultId);
  }

  async function handleCreateVault(name: string) {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const vault = await createVault(userId, name);
      await saveTwinProblemsToVault(userId, vault.id, saveInput);
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "저장소 생성에 실패했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  const hasVaults = vaults.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
        role="presentation"
        onClick={saving ? undefined : onClose}
      >
        <div
          role="dialog"
          aria-labelledby="save-problems-title"
          aria-modal="true"
          className="flex max-h-[min(80vh,32rem)] w-full max-w-sm flex-col rounded-2xl border border-[#84cc16]/40 bg-[#1f2937] p-5 shadow-2xl shadow-[#84cc16]/10"
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            id="save-problems-title"
            className="text-center text-base font-bold text-[#84cc16]"
          >
            문제 저장
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {hasVaults
              ? "저장할 저장소를 선택하세요"
              : "저장소를 만들고 문제를 저장합니다"}
          </p>

          {loading ? (
            <p className="mt-6 text-center text-sm text-gray-400">
              저장소 불러오는 중...
            </p>
          ) : hasVaults ? (
            <ul className="mt-4 flex max-h-52 flex-col gap-2 overflow-y-auto">
              {vaults.map((vault) => {
                const count = getVaultItemCount(vault);
                return (
                  <li key={vault.id}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void handleSelectVault(vault.id)}
                      className="flex w-full flex-col gap-0.5 rounded-xl border border-[#84cc16]/30 bg-[#111827] px-4 py-3 text-left transition-colors hover:border-[#84cc16]/55 hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-semibold text-gray-100">
                        {vault.name}
                      </span>
                      <span className="text-sm text-[#a3e635]">
                        ({count}문항)
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => setCreateOpen(true)}
              className="mt-6 w-full rounded-xl bg-[#84cc16] py-3 text-sm font-bold text-[#111827] transition-colors hover:bg-[#a3e635] disabled:cursor-not-allowed disabled:opacity-50"
            >
              새 저장소 만들기
            </button>
          )}

          {hasVaults ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setCreateOpen(true)}
              className="mt-3 w-full rounded-xl border border-[#84cc16]/40 py-2.5 text-sm font-semibold text-[#a3e635] transition-colors hover:bg-[#84cc16]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              새 저장소 만들기
            </button>
          ) : null}

          {error ? (
            <p className="mt-3 text-center text-xs text-red-400">{error}</p>
          ) : null}

          {saving ? (
            <p className="mt-2 text-center text-xs text-gray-400">
              저장하는 중...
            </p>
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="mt-4 w-full rounded-xl border border-gray-600 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </div>

      <CreateVaultModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(name) => {
          setCreateOpen(false);
          void handleCreateVault(name);
        }}
      />
    </>
  );
}
