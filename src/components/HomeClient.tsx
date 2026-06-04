"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import MathProblemUploadButton from "@/components/MathProblemUploadButton";
import ProblemStorageScreen from "@/components/ProblemStorageScreen";
import { getFirebaseAuth } from "@/lib/firebase";

export default function HomeClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>("home");
  const [homeResetKey, setHomeResetKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  function goHome() {
    setTab("home");
    setHomeResetKey((k) => k + 1);
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
          <ProblemStorageScreen userId={user.uid} />
        )}
      </div>
      <BottomNav
        activeTab={tab}
        onHome={goHome}
        onStorage={() => setTab("storage")}
      />
    </>
  );
}
