import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { api, apiErrorMessage } from "../lib/api";
import { refreshAccessToken } from "../lib/access-token";
import { dashboardPath, useAuth } from "../lib/AuthContext";
import type { Profile, Role } from "../types";

export default function OnboardingPage() {
  const { sessionUser, current, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const stored = sessionStorage.getItem("crowdspark.pendingRole");
  const [role, setRole] = useState<Role>(stored === "creator" ? "creator" : "supporter");
  if (loading)
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!sessionUser) {
    navigate("/login", { replace: true });
    return null;
  }
  if (current?.profile) {
    navigate(dashboardPath(current.profile.role), { replace: true });
    return null;
  }
  const submit = async () => {
    try {
      const profile = (await api.post<{ data: Profile }>("/users/onboarding", { role })).data.data;
      sessionStorage.removeItem("crowdspark.pendingRole");
      await refreshAccessToken();
      await refresh();
      navigate(dashboardPath(profile.role), { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="card w-full max-w-xl p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Complete role onboarding</h1>
        <p className="mt-3 text-slate-600">
          Select one permanent self-service role. Admin access cannot be selected here.
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {(["supporter", "creator"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setRole(value)}
              className={`rounded-2xl border p-5 text-left ${role === value ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"}`}
            >
              <span className="font-bold capitalize">{value}</span>
              <p className="mt-2 text-sm text-slate-500">
                {value === "supporter"
                  ? "Fund campaigns and track contributions."
                  : "Create campaigns and request withdrawals."}
              </p>
            </button>
          ))}
        </div>
        <button className="btn-primary mt-7 w-full" onClick={submit}>
          Complete setup
        </button>
      </section>
    </main>
  );
}
