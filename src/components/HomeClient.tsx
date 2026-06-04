"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import MathProblemUploadButton from "@/components/MathProblemUploadButton";

export default function HomeClient() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {user ? <MathProblemUploadButton /> : <GoogleLoginButton />}
    </div>
  );
}
