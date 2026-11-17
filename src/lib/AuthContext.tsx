import { createContext, type ReactNode, useContext, useEffect } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { CurrentUserResponse, Role } from "../types";

import { clearAccessToken, ensureAccessToken } from "./access-token";

import { api, apiErrorMessage } from "./api";

import { authClient } from "./auth-client";

interface AuthValue {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;

  current: CurrentUserResponse | null;

  loading: boolean;

  authError: string | null;

  refresh: () => Promise<void>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  const queryClient = useQueryClient();

  const sessionUserId = session.data?.user?.id ?? null;

  useEffect(() => {
    if (session.isPending) return;

    if (!sessionUserId) {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ["current-user"] });
      return;
    }

    // Prepare an optional short-lived JWT. Protected endpoints also accept
    // Better Auth's authenticated session cookie, so a failed JWT request
    // must not make the whole login unusable.
    void ensureAccessToken(false, sessionUserId).catch(() => {
      clearAccessToken();
    });
  }, [sessionUserId, session.isPending, queryClient]);

  const me = useQuery({
    queryKey: ["current-user", sessionUserId],

    queryFn: async () =>
      (
        await api.get<{
          data: CurrentUserResponse;
        }>("/users/me")
      ).data.data,

    enabled: Boolean(sessionUserId),

    /*
     * Authentication/profile errors
     * should not automatically hammer
     * the API with retries.
     */
    retry: false,

    staleTime: 15_000
  });

  const sessionError = session.error?.message ?? null;

  const currentUserError = me.isError ? apiErrorMessage(me.error) : null;

  const authError = sessionError ?? currentUserError;

  const hasSessionUser = Boolean(session.data?.user);

  const loading = session.isPending || (hasSessionUser && !authError && me.isPending);

  const refresh = async () => {
    const latestSession = await authClient.getSession();

    if (latestSession.error) {
      throw new Error(latestSession.error.message || "Unable to refresh session");
    }

    await session.refetch();
    const latestUser = latestSession.data?.user;

    if (!latestUser) {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ["current-user"] });
      return;
    }

    // Never reuse a JWT with stale profile claims after role onboarding.
    clearAccessToken();
    try {
      await ensureAccessToken(true, latestUser.id);
    } catch {
      // Continue using the authenticated cookie session instead.
      clearAccessToken();
    }

    // Fetch the profile afresh even if the query has not mounted yet.
    await queryClient.fetchQuery({
      queryKey: ["current-user", latestUser.id],
      queryFn: async () => (await api.get<{ data: CurrentUserResponse }>("/users/me")).data.data,
      staleTime: 0
    });
  };

  const signOut = async () => {
    /*
     * Better Auth client methods expose
     * an error result. Do not pretend the
     * logout succeeded when the auth server
     * rejected the request.
     */
    const result = await authClient.signOut();

    if (result.error) {
      throw new Error(result.error.message || "Sign out failed");
    }

    clearAccessToken();

    queryClient.clear();
  };

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

        loading,

        authError,

        refresh,

        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function dashboardPath(role?: Role | null) {
  if (role === "creator") {
    return "/dashboard/creator";
  }

  if (role === "admin") {
    return "/dashboard/admin";
  }

  return "/dashboard/supporter";
}
