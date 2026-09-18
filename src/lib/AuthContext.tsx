import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

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

function unknownErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();

  const queryClient = useQueryClient();

  /*
   * Stores the user ID for which an API access
   * token has successfully been prepared.
   *
   * This is safer than a plain boolean because
   * it prevents an old user's "ready" state from
   * being reused when the session changes.
   */
  const [tokenUserId, setTokenUserId] = useState<string | null>(null);

  const [tokenLoading, setTokenLoading] = useState(false);

  const [tokenError, setTokenError] = useState<string | null>(null);

  const sessionUserId = session.data?.user?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    if (session.isPending) {
      return;
    }

    /*
     * No Better Auth session:
     * remove any API authentication state.
     */
    if (!sessionUserId) {
      clearAccessToken();

      setTokenUserId(null);
      setTokenLoading(false);
      setTokenError(null);

      queryClient.removeQueries({
        queryKey: ["current-user"]
      });

      return;
    }

    /*
     * A session exists, but we must first
     * establish the API access token before
     * requesting /users/me.
     */
    setTokenUserId(null);
    setTokenLoading(true);
    setTokenError(null);

    void ensureAccessToken()
      .then(() => {
        if (cancelled) {
          return;
        }

        setTokenUserId(sessionUserId);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        clearAccessToken();

        setTokenError(unknownErrorMessage(error, "Unable to establish a secure API session."));
      })
      .finally(() => {
        if (!cancelled) {
          setTokenLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionUserId, session.isPending, queryClient]);

  const tokenReady = Boolean(sessionUserId) && tokenUserId === sessionUserId && !tokenError;

  const me = useQuery({
    queryKey: ["current-user"],

    queryFn: async () =>
      (
        await api.get<{
          data: CurrentUserResponse;
        }>("/users/me")
      ).data.data,

    enabled: tokenReady,

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

  const authError = sessionError ?? tokenError ?? currentUserError;

  const hasSessionUser = Boolean(session.data?.user);

  const loading =
    session.isPending ||
    (hasSessionUser && !authError && (tokenLoading || !tokenReady || me.isPending));

  const refresh = async () => {
    /*
     * getSession() gives us an explicit,
     * current Better Auth response instead
     * of relying on the old closure value
     * from session.data.
     */
    const latestSession = await authClient.getSession();

    if (latestSession.error) {
      throw new Error(latestSession.error.message || "Unable to refresh session");
    }

    /*
     * Also update useSession's reactive
     * state for the rest of the app.
     */
    await session.refetch();

    const latestUser = latestSession.data?.user;

    if (!latestUser) {
      clearAccessToken();

      setTokenUserId(null);
      setTokenLoading(false);
      setTokenError(null);

      queryClient.removeQueries({
        queryKey: ["current-user"]
      });

      return;
    }

    setTokenUserId(null);
    setTokenLoading(true);
    setTokenError(null);

    try {
      await ensureAccessToken(true);

      setTokenUserId(latestUser.id);

      await queryClient.invalidateQueries({
        queryKey: ["current-user"]
      });
    } catch (error) {
      clearAccessToken();

      setTokenError(unknownErrorMessage(error, "Unable to refresh the secure API session."));

      throw error;
    } finally {
      setTokenLoading(false);
    }
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

    setTokenUserId(null);
    setTokenLoading(false);
    setTokenError(null);

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
