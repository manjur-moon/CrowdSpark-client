import { Navigate, Outlet, useLocation } from "react-router-dom";
import { dashboardPath, useAuth } from "../lib/AuthContext";
import type { Role } from "../types";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { loading, sessionUser, current } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  if (!sessionUser)
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  if (!current?.profile) return <Navigate to="/onboarding" replace />;
  if (roles && !roles.includes(current.profile.role))
    return <Navigate to={dashboardPath(current.profile.role)} replace />;
  return <Outlet />;
}
