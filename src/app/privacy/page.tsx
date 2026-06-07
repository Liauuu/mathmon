import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 매스몬",
  description: "매스몬(MathMon) 및 쌤(SAM) 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#111827]">
      <LegalPageShell title="개인정보처리방침" updatedAt="2026년 6월 7일">
        <PrivacyContent />
      </LegalPageShell>
    </main>
  );
}
