import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "./auth-client";
import { clearAccessToken, ensureAccessToken } from "./access-token";
import { api } from "./api";
import type { CurrentUserResponse, Role } from "../types";

interface AuthValue {
  sessionUser: { id: string; name: string; email: string; image?: string | null } | null;
  current: CurrentUserResponse | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const queryClient = useQueryClient();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (session.isPending) return;
    if (!session.data?.user) {
      clearAccessToken();
      setTokenReady(true);
      queryClient.removeQueries({ queryKey: ["current-user"] });
      return;
    }

    setTokenReady(false);
    void ensureAccessToken().finally(() => {
      if (!cancelled) setTokenReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [session.data?.user, session.isPending, queryClient]);

  const me = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => (await api.get<{ data: CurrentUserResponse }>("/users/me")).data.data,
    enabled: Boolean(session.data?.user) && tokenReady,
    retry: false,
    staleTime: 15000
  });

  return (
    <AuthContext.Provider
      value={{
        sessionUser: session.data?.user
          ? {
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
              image: session.data.user.image
            }
          : null,
        current: me.data ?? null,
        loading:
          session.isPending || (Boolean(session.data?.user) && (!tokenReady || me.isPending)),
        refresh: async () => {
          await session.refetch();
          if (session.data?.user) await ensureAccessToken(true);
          await queryClient.invalidateQueries({ queryKey: ["current-user"] });
        },
        signOut: async () => {
          clearAccessToken();
          await authClient.signOut();
          queryClient.clear();
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function dashboardPath(role?: Role | null) {
  if (role === "creator") return "/dashboard/creator";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/supporter";
}
