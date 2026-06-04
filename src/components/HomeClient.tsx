"use client";

import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useSearchParams } from "next/navigation";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import MathProblemUploadButton from "@/components/MathProblemUploadButton";
import ProblemStorageScreen from "@/components/ProblemStorageScreen";
import SamVaultPracticeScreen from "@/components/SamVaultPracticeScreen";
import { clearSamRedirectPending, getFirebaseAuth } from "@/lib/firebase";
import { parseSamPracticeParams } from "@/lib/sam-integration";

function HomeClientContent() {
  const searchParams = useSearchParams();
  const sam = parseSamPracticeParams(searchParams.toString());

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>("home");
  const [homeResetKey, setHomeResetKey] = useState(0);
  const [storageMountKey, setStorageMountKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) clearSamRedirectPending();
    });
    return unsubscribe;
  }, []);

  function goHome() {
    setTab("home");
    setHomeResetKey((k) => k + 1);
  }

  function goStorage() {
    setTab("storage");
    setStorageMountKey((k) => k + 1);
  }

  if (sam) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col px-2 pt-4 md:px-4">
        <SamVaultPracticeScreen user={user} authLoading={authLoading} sam={sam} />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <GoogleLoginButton />
      </div>
    );
  }

  return (
    <>
      <div
        className={`flex w-full flex-1 flex-col pb-24 pt-4 ${
          tab === "storage"
            ? "min-h-0 items-stretch justify-start px-2 md:px-4"
            : "items-center justify-center"
        }`}
      >
        {tab === "home" ? (
          <MathProblemUploadButton key={homeResetKey} userId={user.uid} />
        ) : (
          <ProblemStorageScreen key={storageMountKey} userId={user.uid} />
        )}
      </div>
      <BottomNav activeTab={tab} onHome={goHome} onStorage={goStorage} />
    </>
  );
}

export default function HomeClient() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">불러오는 중...</p>
        </div>
      }
    >
      <HomeClientContent />
    </Suspense>
  );
}
