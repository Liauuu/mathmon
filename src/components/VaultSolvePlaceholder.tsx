"use client";

type VaultSolvePlaceholderProps = {
  vaultName: string;
  onBack: () => void;
};

/** 풀기 화면 연동 전 임시 화면 */
export default function VaultSolvePlaceholder({
  vaultName,
  onBack,
}: VaultSolvePlaceholderProps) {
  return (
    <div className="flex w-full max-w-lg flex-1 flex-col items-center gap-4 px-4 pb-24 pt-8">
      <button
        type="button"
        onClick={onBack}
        className="self-start flex items-center gap-1 rounded-xl border border-[#84cc16]/30 bg-[#1f2937]/90 px-3 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-[#84cc16]/55"
      >
        <span aria-hidden>⬅️</span>
        저장소로
      </button>
      <h2 className="text-center text-lg font-bold text-[#84cc16]">
        문제 풀기
      </h2>
      <p className="text-center text-sm text-gray-400">
        <span className="font-medium text-gray-200">{vaultName}</span>
        <br />
        풀기 화면은 곧 연결됩니다.
      </p>
    </div>
  );
}
