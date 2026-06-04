"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import VaultPracticeSolveScreen from "@/components/VaultPracticeSolveScreen";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import {
  clearSamRedirectPending,
  completeSamRedirectSignIn,
  signInWithGoogleRedirectForSam,
} from "@/lib/firebase";
import { loadVaultById, type ProblemVault } from "@/lib/problem-vaults";
import type { SamPracticeParams } from "@/lib/sam-integration";

type SamVaultPracticeScreenProps = {
  user: User | null;
  authLoading: boolean;
  sam: SamPracticeParams;
};

export default function SamVaultPracticeScreen({
  user,
  authLoading,
  sam,
}: SamVaultPracticeScreenProps) {
  const [vault, setVault] = useState<ProblemVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

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
    if (!user || user.uid !== sam.studentId) return;
    void loadVault();
  }, [user, sam.studentId, loadVault]);

  useEffect(() => {
    if (authLoading || user) return;

    let cancelled = false;

    async function tryAuth() {
      setAuthBusy(true);
      try {
        await completeSamRedirectSignIn();
        clearSamRedirectPending();
      } catch (err) {
        if (!cancelled) {
          console.error(err);
        }
      } finally {
        if (!cancelled) setAuthBusy(false);
      }
    }

    void tryAuth();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || user || authBusy) return;
    void signInWithGoogleRedirectForSam().catch((err) => {
      console.error(err);
      setError("구글 로그인을 시작하지 못했습니다. 아래 버튼으로 다시 시도해 주세요.");
    });
  }, [authLoading, user, authBusy]);

  if (authLoading || authBusy) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">로그인 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm text-gray-400">
          쌤 수업 문제 풀기를 위해 구글 로그인이 필요합니다.
          <br />
          쌤과 같은 계정으로 로그인해 주세요.
        </p>
        <GoogleLoginButton />
      </div>
    );
  }

  if (user.uid !== sam.studentId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-400">
          쌤에서 시작한 학생 계정({sam.studentId.slice(0, 8)}…)과
          현재 로그인({user.uid.slice(0, 8)}…)이 다릅니다.
        </p>
        <p className="text-xs text-gray-500">
          쌤에서 사용한 구글 계정으로 다시 로그인해 주세요.
        </p>
        <GoogleLoginButton />
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
