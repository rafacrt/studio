
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginAnimation } from "./LoginAnimation";

export function LoginAnimationWrapper() {
  const { isAnimatingLogin } = useAuth();

  if (isAnimatingLogin) {
    return <LoginAnimation />;
  }

  return null;
}
