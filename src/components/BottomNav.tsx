"use client";

export type AppTab = "home" | "storage";

type BottomNavProps = {
  activeTab: AppTab;
  onHome: () => void;
  onStorage: () => void;
};

export default function BottomNav({
  activeTab,
  onHome,
  onStorage,
}: BottomNavProps) {
  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed bottom-[var(--business-footer-height)] left-1/2 z-40 flex h-[4.25rem] w-full max-w-md -translate-x-1/2 items-stretch border-t border-[#84cc16]/25 bg-[#111827]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:max-w-7xl lg:max-w-full"
    >
      <button
        type="button"
        onClick={onHome}
        aria-current={activeTab === "home" ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition-colors ${
          activeTab === "home"
            ? "text-[#a3e635]"
            : "text-gray-400 hover:text-[#84cc16]"
        }`}
      >
        <span className="text-lg" aria-hidden>
          🏠
        </span>
        <span>홈</span>
      </button>
      <button
        type="button"
        onClick={onStorage}
        aria-current={activeTab === "storage" ? "page" : undefined}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition-colors ${
          activeTab === "storage"
            ? "text-[#a3e635]"
            : "text-gray-400 hover:text-[#84cc16]"
        }`}
      >
        <span className="text-lg" aria-hidden>
          📂
        </span>
        <span>문제 저장소</span>
      </button>
    </nav>
  );
}
