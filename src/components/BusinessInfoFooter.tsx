import Link from "next/link";

export default function BusinessInfoFooter() {
  return (
    <footer
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-[#84cc16]/10 bg-[#111827]/98 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] text-[10px] leading-relaxed text-gray-500 backdrop-blur-sm md:max-w-7xl lg:max-w-full"
      aria-label="사이트 정보"
    >
      <nav
        aria-label="법적 고지 링크"
        className="mb-2 flex items-center justify-center gap-2 text-[11px] font-medium text-gray-400"
      >
        <Link href="/terms" className="transition-colors hover:text-[#a3e635]">
          이용약관
        </Link>
        <span className="text-gray-700" aria-hidden>
          |
        </span>
        <Link href="/privacy" className="transition-colors hover:text-[#a3e635]">
          개인정보처리방침
        </Link>
      </nav>

      <div className="space-y-0.5 text-center">
        <p>상호명: 핑코</p>
        <p>대표자: 유연서</p>
        <p>사업자등록번호: 265-17-02807</p>
        <p>주소: 제주특별자치도 제주시 애월읍 하귀로 134, 205호</p>
        <p>
          전화번호:{" "}
          <a href="tel:010-2300-3955" className="hover:text-gray-400">
            010-2300-3955
          </a>{" "}
          <span className="text-gray-700">|</span> 이메일:{" "}
          <a href="mailto:lialytics@gmail.com" className="hover:text-gray-400">
            lialytics@gmail.com
          </a>
        </p>
        <p>통신판매업신고: 신고 준비 중</p>
      </div>
    </footer>
  );
}
