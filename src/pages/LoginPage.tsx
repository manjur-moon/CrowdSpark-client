import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "../components/Logo";
import { api, apiErrorMessage } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { refreshAccessToken } from "../lib/access-token";
import { dashboardPath, useAuth } from "../lib/AuthContext";
import type { CurrentUserResponse } from "../types";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type Values = z.infer<typeof schema>;

export function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export default function LoginPage() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const submit = async (
  values: Values
) => {
  try {
    const result =
      await authClient.signIn.email({
        email: values.email
          .trim()
          .toLowerCase(),

        password:
          values.password,

        rememberMe:
          true
      });

    if (result.error) {
      toast.error(
        result.error.message ||
          "Email or password is incorrect"
      );

      return;
    }

    const token =
      await refreshAccessToken();

    if (!token) {
      throw new Error(
        "Access token could not be created"
      );
    }

    const response =
      await api.get<{
        data: CurrentUserResponse;
      }>("/users/me");

    const me =
      response.data.data;

    await refresh();

    const redirect =
      safeRedirect(
        params.get("redirect")
      );

    navigate(
      me.profile
        ? redirect ??
            dashboardPath(
              me.profile.role
            )
        : "/onboarding",

      {
        replace: true
      }
    );

    toast.success(
      "Signed in successfully"
    );
  } catch (error) {
    console.error(
      "CrowdSpark login failed:",
      error
    );

    toast.error(
      apiErrorMessage(
        error,
        error instanceof Error
          ? error.message
          : "Sign in failed"
      )
    );
  }
};

  const demo = (role: "supporter" | "creator" | "admin") => {
    const values = {
      supporter: ["supporter@crowdspark.demo", "Supporter12345"],
      creator: ["creator@crowdspark.demo", "Creator12345"],
      admin: ["admin@crowdspark.demo", "Admin12345"]
    }[role];
    setValue("email", values[0]);
    setValue("password", values[1]);
  };

  const google = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${location.origin}/onboarding`
      });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Google login is not configured"));
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <Logo light />
        <div className="my-auto max-w-xl">
          <p className="font-bold text-emerald-400">WELCOME BACK</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">
            Continue building and supporting meaningful ideas.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Use the seeded demo accounts or sign in with an account you created.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-3xl font-black">Sign in to CrowdSpark</h1>
          <p className="mt-2 text-slate-600">Access your role-based dashboard.</p>
          <form onSubmit={handleSubmit(submit)} className="card mt-7 space-y-5 p-7">
            <div>
              <label className="label">Email address</label>
              <input className="field" type="email" {...register("email")} />
              {errors.email ? (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <div className="flex justify-between">
                <label className="label">Password</label>
                <Link to="/forgot-password" className="text-sm font-bold text-emerald-700">
                  Forgot password?
                </Link>
              </div>
              <input className="field" type="password" {...register("password")} />
              {errors.password ? (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              ) : null}
            </div>
            <button className="btn-primary w-full" disabled={isSubmitting}>
              <LogIn className="size-5" />
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <button type="button" className="btn-secondary w-full" onClick={google}>
              Continue with Google
            </button>
          </form>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["supporter", "creator", "admin"] as const).map((role) => (
              <button
                key={role}
                className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold capitalize"
                onClick={() => demo(role)}
              >
                {role} demo
              </button>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-600">
            New to CrowdSpark?{" "}
            <Link className="font-bold text-emerald-700" to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
