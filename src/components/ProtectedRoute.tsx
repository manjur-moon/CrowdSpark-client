import { Navigate, Outlet, useLocation } from "react-router-dom";

import { dashboardPath, useAuth } from "../lib/AuthContext";

import type { Role } from "../types";

type ProtectedRouteProps = {
  roles?: Role[];
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { loading, sessionUser, current } = useAuth();

  const location = useLocation();

  if (loading) {
    return <ProtectedRouteLoader />;
  }

  if (!sessionUser) {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to={`/login?redirect=${encodeURIComponent(requestedPath)}`} replace />;
  }

  if (!current?.profile) {
    return <Navigate to="/onboarding" replace />;
  }

  const role = current.profile.role;

  if (roles && !roles.includes(role)) {
    return <Navigate to={dashboardPath(role)} replace />;
  }

  return <Outlet />;
}

function ProtectedRouteLoader() {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center

        bg-[#d1d8dc]

        px-6

        dark:bg-[#09110e]
      "
      role="status"
      aria-live="polite"
      aria-label="Checking account access"
    >
      <div className="text-center">
        <div
          className="
            relative
            mx-auto

            flex
            size-14
            items-center
            justify-center
          "
        >
          <div
            className="
              absolute
              inset-0

              animate-spin

              rounded-full

              border-2
              border-[#b2c0ba]
              border-t-[#315b4a]

              dark:border-[#263a31]
              dark:border-t-[#a9c2b6]
            "
          />

          <div
            className="
              size-2
              rounded-full

              bg-[#527064]

              dark:bg-[#91aa9d]
            "
          />
        </div>

        <p
          className="
            mt-4

            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]

            text-[#65776f]

            dark:text-[#8da198]
          "
        >
          Verifying access
        </p>
      </div>
    </div>
  );
}
