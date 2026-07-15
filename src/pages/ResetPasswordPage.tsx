import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { authClient } from "../lib/auth-client";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing");
      return;
    }
    if (password.length < 8 || password !== confirm) {
      toast.error("Use matching passwords with at least 8 characters");
      return;
    }
    const result = await authClient.resetPassword({ newPassword: password, token });
    if (result.error) {
      toast.error(result.error.message || "Password reset failed");
      return;
    }
    setDone(true);
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Choose a new password</h1>
        {done ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-5">
            <p className="font-bold text-emerald-800">Password updated successfully.</p>
            <Link to="/login" className="btn-primary mt-5">
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="label">New password</label>
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                className="field"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <button className="btn-primary w-full">Reset password</button>
          </form>
        )}
      </section>
    </main>
  );
}
