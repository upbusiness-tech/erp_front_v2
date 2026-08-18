import { auth } from "@/config/firebase.config";
import { useAuthStore } from "@/stores/auth.store";
import { onIdTokenChanged } from "firebase/auth";
import { useEffect, useState, type ReactNode } from "react";
import { AuthSessionContext } from "./auth-session.context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = (await user.getIdToken()) ?? user.refreshToken;
        useAuthStore.getState().setCompanyToken(token);
      } else {
        useAuthStore.getState().clearCompanySession();
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthSessionContext.Provider value={{ authLoading }}>{children}</AuthSessionContext.Provider>
  );
}
