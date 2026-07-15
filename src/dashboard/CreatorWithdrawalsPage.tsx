import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, WalletCards } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

interface Withdrawal {
  id: string;
  credits: number;
  amountCents: number;
  method: string;
  accountReference: string;
  status: string;
  reviewNote: string | null;
  settlementReference?: string | null;
  requestedAt: string;
}

type CreatorWithdrawalsMode = "request" | "history" | "both";

export default function CreatorWithdrawalsPage({
  mode = "both"
}: {
  mode?: CreatorWithdrawalsMode;
}) {
  const { current, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ credits: 200, method: "bkash", accountReference: "" });
  const showRequest = mode !== "history";
  const showHistory = mode !== "request";

  const query = useQuery({
    queryKey: ["creator-withdrawals"],
    queryFn: async () =>
      (await api.get<{ data: Withdrawal[] }>("/creator/withdrawals", { params: { limit: 50 } }))
        .data.data,
    enabled: showHistory
  });

  const submit = useMutation({
    mutationFn: () =>
      api.post("/creator/withdrawals", form, {
        headers: { "Idempotency-Key": crypto.randomUUID() }
      }),
    onSuccess: async () => {
      toast.success("Withdrawal request submitted for Admin review");
      setForm((currentForm) => ({ ...currentForm, accountReference: "" }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["creator-withdrawals"] }),
        queryClient.invalidateQueries({ queryKey: ["current-user"] }),
        refresh()
      ]);
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const available = current!.profile!.creatorBalance;
  const settlementAmount = form.credits / 20;

  return (
    <main className="space-y-7">
      <header>
        <p className="font-bold text-emerald-700">CREATOR FINANCE</p>
        <h1 className="mt-2 text-3xl font-black">
          {mode === "history" ? "Withdrawal payment history" : "Withdrawals"}
        </h1>
        <p className="mt-2 text-slate-600">
          Available: <strong>{available.toLocaleString()} credits</strong> · $
          {(available / 20).toFixed(2)}
        </p>
      </header>

      {showRequest ? (
        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit.mutate();
            }}
            className="card space-y-5 p-6"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100">
              <WalletCards className="size-6 text-emerald-700" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Request withdrawal</h2>
              <p className="mt-1 text-sm text-slate-500">
                Minimum withdrawal is 200 credits. 20 credits = $1.
              </p>
            </div>
            <div>
              <label className="label">Credits to withdraw</label>
              <input
                className="field"
                type="number"
                min={200}
                max={available}
                step={1}
                value={form.credits}
                onChange={(event) => setForm({ ...form, credits: Number(event.target.value) })}
              />
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Withdrawal amount: ${settlementAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="label">Payment system</label>
              <select
                className="field"
                value={form.method}
                onChange={(event) => setForm({ ...form, method: event.target.value })}
              >
                <option value="stripe">Stripe</option>
                <option value="bkash">Bkash</option>
                <option value="rocket">Rocket</option>
                <option value="nagad">Nagad</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="label">Account number or reference</label>
              <input
                className="field"
                value={form.accountReference}
                onChange={(event) => setForm({ ...form, accountReference: event.target.value })}
                required
                minLength={4}
                maxLength={120}
              />
              <p className="mt-2 text-xs text-slate-500">
                Stored encrypted. Only the last four characters are displayed later.
              </p>
            </div>
            {available < 200 ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                Insufficient credit. You need at least 200 available credits.
              </p>
            ) : null}
            <button
              className="btn-primary w-full"
              disabled={available < 200 || form.credits > available || submit.isPending}
            >
              {submit.isPending ? "Submitting..." : "Withdraw"}
            </button>
          </form>

          <div className="card p-6">
            <h2 className="text-xl font-bold">Withdrawal rules</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                "Credits are reserved when the request is submitted.",
                "Admin approval is required before settlement.",
                "Rejected requests restore the reserved balance.",
                "Sensitive account information is encrypted at rest."
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
            {mode === "request" ? (
              <Link className="btn-secondary mt-6" to="/dashboard/creator/payment-history">
                <History className="size-4" /> View payment history
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {showHistory ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-xl font-bold">Withdrawal payment history</h2>
              <p className="mt-1 text-sm text-slate-500">
                All withdrawal requests and Admin review results.
              </p>
            </div>
            <History className="size-6 text-emerald-600" />
          </div>
          {query.isLoading ? (
            <div className="h-56 animate-pulse bg-slate-100" />
          ) : query.data?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[840px] w-full">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Account</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-t">
                      <td className="p-4 font-bold">{withdrawal.credits.toLocaleString()}</td>
                      <td className="p-4">${(withdrawal.amountCents / 100).toFixed(2)}</td>
                      <td className="p-4 capitalize">{withdrawal.method}</td>
                      <td className="p-4 font-mono text-sm">{withdrawal.accountReference}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                          {withdrawal.status}
                        </span>
                        {withdrawal.reviewNote ? (
                          <p className="mt-2 max-w-64 text-xs text-slate-500">
                            {withdrawal.reviewNote}
                          </p>
                        ) : null}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(withdrawal.requestedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-t p-10 text-center text-slate-500">
              No withdrawal records found.
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
