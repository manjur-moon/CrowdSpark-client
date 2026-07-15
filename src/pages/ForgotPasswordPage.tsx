import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import { authClient } from "../lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: `${location.origin}/reset-password`
    });
    if (result.error) {
      toast.error(result.error.message || "Request failed");
      return;
    }
    setSent(true);
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
      <section className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Reset your password</h1>
        {sent ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-emerald-800">
            <p className="font-bold">Check the server terminal</p>
            <p className="mt-2 text-sm">
              In local demo mode the reset link is printed in the server console. Production should
              replace this with SMTP delivery.
            </p>
            <Link to="/login" className="btn-primary mt-5">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                className="field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary w-full">Send reset link</button>
            <Link to="/login" className="block text-center text-sm font-bold text-emerald-700">
              Return to sign in
            </Link>
          </form>
        )}
      </section>
    </main>
  );
}
