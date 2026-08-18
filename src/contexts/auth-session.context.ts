import { createContext, useContext } from "react";

interface AuthSessionState {
  authLoading: boolean;
}

export const AuthSessionContext = createContext<AuthSessionState>({ authLoading: true });

export const useAuthSession = () => useContext(AuthSessionContext);
