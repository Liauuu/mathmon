"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      console.error(error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="relative mb-2 shrink-0 text-center">
      {!authLoading && user ? (
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="absolute right-0 top-0 rounded-xl border border-gray-600/60 bg-gray-800/80 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-gray-700/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      ) : null}

      <h1 className="text-4xl font-extrabold tracking-tight text-[#84cc16] sm:text-5xl">
        매스몬 👾
      </h1>
      <p className="mt-2 text-sm font-medium tracking-widest text-[#84cc16]/70 uppercase">
        MathMon
      </p>
    </header>
  );
}
