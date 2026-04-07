"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  AUTH_TOKEN_KEY,
  formatClientError,
  getAuthToken,
  getMe,
  login as apiLogin,
  register as apiRegister,
  setAuthToken,
  type UserPublic,
} from "@/lib/api";

/** Session bootstrap must not hang forever if the API is slow or unreachable. */
const SESSION_ME_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label = "timeout"): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

type AuthState = {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (input: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const t = getAuthToken();
    if (!t) {
      setUser(null);
      return;
    }
    try {
      const me = await getMe(t);
      setUser(me);
    } catch {
      setAuthToken(null);
      setUser(null);
      setTokenState(null);
    }
  }, []);

  useEffect(() => {
    const t = readStoredToken();
    setTokenState(t);
    if (!t) {
      setIsLoading(false);
      return;
    }
    void (async () => {
      try {
        const me = await withTimeout(getMe(t), SESSION_ME_TIMEOUT_MS, "Session check timed out");
        setUser(me);
      } catch {
        setAuthToken(null);
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleTokenSync = (event: Event) => {
      const nextToken = (event as CustomEvent<string | null>).detail ?? readStoredToken();
      setTokenState(nextToken);
      if (!nextToken) {
        setUser(null);
      }
    };
    window.addEventListener("lms-auth-token", handleTokenSync as EventListener);
    return () => window.removeEventListener("lms-auth-token", handleTokenSync as EventListener);
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirectTo = "/dashboard") => {
      try {
        const res = await apiLogin({ email, password });
        setAuthToken(res.access_token);
        setTokenState(res.access_token);
        const me = await getMe(res.access_token);
        setUser(me);
        const dest =
          me.role === "admin"
            ? redirectTo.startsWith("/dashboard/admin")
              ? redirectTo
              : "/dashboard/admin"
            : redirectTo;
        router.replace(dest);
      } catch (e) {
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
        throw e;
      }
    },
    [router],
  );

  const register = useCallback(
    async (input: { email: string; password: string; full_name: string }) => {
      await apiRegister(input);
      try {
        await login(input.email, input.password, "/dashboard");
      } catch (e) {
        throw new Error(
          `Account created, but automatic sign-in failed: ${formatClientError(e)}. Try logging in manually.`,
        );
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
