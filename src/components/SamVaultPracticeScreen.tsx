"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import VaultPracticeSolveScreen from "@/components/VaultPracticeSolveScreen";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { clearSamAuthRedirectAttempted, runSamAuthFlow } from "@/lib/firebase";
import { loadVaultById, type ProblemVault } from "@/lib/problem-vaults";
import type { SamPracticeParams } from "@/lib/sam-integration";

type SamVaultPracticeScreenProps = {
  user: User | null;
  authLoading: boolean;
  sam: SamPracticeParams;
};

type AuthPhase = "checking" | "redirecting" | "manual" | "ready";

export default function SamVaultPracticeScreen({
  user,
  authLoading,
  sam,
}: SamVaultPracticeScreenProps) {
  const [vault, setVault] = useState<ProblemVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authPhase, setAuthPhase] = useState<AuthPhase>("checking");

  const accountMatches = Boolean(user && user.uid === sam.studentId);

  const loadVault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadVaultById(sam.teacherUid, sam.vaultId);
      if (!loaded) {
        setVault(null);
        setError("연동된 매스몬 저장소를 찾을 수 없습니다.");
        return;
      }
      setVault(loaded);
    } catch (err) {
      setVault(null);
      setError(
        err instanceof Error ? err.message : "저장소를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [sam.teacherUid, sam.vaultId]);

  useEffect(() => {
    if (!accountMatches) return;
    setAuthPhase("ready");
    void loadVault();
  }, [accountMatches, loadVault]);

  useEffect(() => {
    if (authLoading || accountMatches) return;
    if (authPhase === "manual" || authPhase === "redirecting") return;

    let cancelled = false;

    async function startSamAuth() {
      setAuthPhase("checking");
      setError(null);

      try {
        const result = await runSamAuthFlow(sam.loginEmail);
        if (cancelled) return;

        if (result === "redirecting") {
          setAuthPhase("redirecting");
          return;
        }

        setAuthPhase("manual");
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setAuthPhase("manual");
          setError(
            "자동 로그인에 실패했습니다. 아래 버튼으로 쌤과 같은 구글 계정을 선택해 주세요.",
          );
        }
      }
    }

    void startSamAuth();
    return () => {
      cancelled = true;
    };
  }, [authLoading, accountMatches, authPhase, sam.loginEmail]);

  useEffect(() => {
    if (accountMatches) {
      clearSamAuthRedirectAttempted();
    }
  }, [accountMatches]);

  if (authLoading || authPhase === "checking" || authPhase === "redirecting") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm text-gray-300">
          {authPhase === "redirecting"
            ? "쌤과 같은 구글 계정으로 연결 중..."
            : "로그인 확인 중..."}
        </p>
        {sam.loginEmail ? (
          <p className="text-xs text-gray-500">{sam.loginEmail}</p>
        ) : null}
      </div>
    );
  }

  if (!user || !accountMatches) {
    const emailHint = sam.loginEmail;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="text-center">
          <p className="text-sm text-gray-300">
            쌤 수업 문제 풀기를 위해
            <br />
            <span className="font-semibold text-[#a3e635]">쌤에서 쓰던 구글 계정</span>
            으로 로그인해 주세요.
          </p>
          {emailHint ? (
            <p className="mt-2 text-xs text-gray-500">계정: {emailHint}</p>
          ) : null}
          {user && user.uid !== sam.studentId ? (
            <p className="mt-3 text-xs text-red-400">
              다른 계정으로 로그인되어 있습니다. 아래에서 쌤과 같은 계정을 선택해 주세요.
            </p>
          ) : null}
        </div>

        <GoogleLoginButton loginEmail={sam.loginEmail} variant="sam" />

        {error ? <p className="max-w-xs text-center text-sm text-red-400">{error}</p> : null}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">문제 저장소 불러오는 중...</p>
      </div>
    );
  }

  if (error || !vault) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-400">{error ?? "저장소를 불러올 수 없습니다."}</p>
        <button
          type="button"
          onClick={() => void loadVault()}
          className="rounded-xl border border-[#84cc16]/40 px-4 py-2 text-sm font-semibold text-[#a3e635]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <VaultPracticeSolveScreen
      vaultOwnerId={sam.teacherUid}
      vault={vault}
      sam={sam}
    />
  );
}
