"use client";

import { useEffect, useRef, useState } from "react";

type CreateVaultModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function CreateVaultModal({
  open,
  onClose,
  onCreate,
}: CreateVaultModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setError(null);
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("저장소 이름을 입력해 주세요.");
      return;
    }
    onCreate(trimmed);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="create-vault-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl border border-[#84cc16]/40 bg-[#1f2937] p-5 shadow-2xl shadow-[#84cc16]/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="create-vault-title"
          className="text-center text-base font-bold text-[#84cc16]"
        >
          새로운 저장소
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          새로운 저장소 이름을 입력하세요
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="예: 수열 기초 연습"
            maxLength={40}
            className="w-full rounded-xl border border-[#84cc16]/30 bg-[#111827] px-4 py-3 text-sm text-gray-100 outline-none ring-[#84cc16]/50 placeholder:text-gray-500 focus:border-[#84cc16] focus:ring-2"
          />
          {error ? (
            <p className="text-center text-xs text-red-400">{error}</p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-600 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#84cc16] py-2.5 text-sm font-bold text-[#111827] transition-colors hover:bg-[#a3e635]"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
