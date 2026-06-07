import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import TermsContent from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "이용약관 | 매스몬",
  description: "매스몬(MathMon) 및 쌤(SAM) 서비스 이용약관, 요금 및 환불 정책",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#111827]">
      <LegalPageShell title="이용약관" updatedAt="2026년 6월 7일">
        <TermsContent />
      </LegalPageShell>
    </main>
  );
}
