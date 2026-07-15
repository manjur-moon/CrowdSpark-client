import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, Coins, HandCoins, Receipt } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";

interface Summary {
  grossPaymentCents: number;
  succeededPaymentCount: number;
  purchasedCredits: number;
  contributedCredits: number;
  refundedCredits: number;
  pendingWithdrawalCredits: number;
  approvedWithdrawalCredits: number;
  platformFeeCents: number;
}
interface Payment {
  id: string;
  user: { name: string; email: string };
  amountCents: number;
  credits: number;
  status: string;
  provider: string;
  createdAt: string;
}
interface Withdrawal {
  id: string;
  creator: { name: string; email: string };
  credits: number;
  amountCents: number;
  method: string;
  accountReference: string;
  status: string;
  requestedAt: string;
}
interface Ledger {
  id: string;
  type: string;
  credits: number;
  amountCents: number;
  direction: string;
  description: string;
  createdAt: string;
}
export default function AdminFinancePage({
  forcedSection
}: {
  forcedSection?: "overview" | "payments" | "withdrawals" | "ledger";
}) {
  const [params, setParams] = useSearchParams();
  const section = forcedSection ?? params.get("section") ?? "overview";
  const qc = useQueryClient();
  const summary = useQuery({
    queryKey: ["admin-finance-summary"],
    queryFn: async () => (await api.get<{ data: Summary }>("/admin/finance/summary")).data.data
  });
  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () =>
      (await api.get<{ data: Payment[] }>("/admin/payments", { params: { limit: 50 } })).data.data,
    enabled: section === "payments"
  });
  const withdrawals = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () =>
      (await api.get<{ data: Withdrawal[] }>("/admin/withdrawals", { params: { limit: 50 } })).data
        .data,
    enabled: section === "withdrawals"
  });
  const ledger = useQuery({
    queryKey: ["admin-ledger"],
    queryFn: async () =>
      (await api.get<{ data: Ledger[] }>("/admin/ledger", { params: { limit: 50 } })).data.data,
    enabled: section === "ledger"
  });
  const review = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approve" | "reject" }) =>
      api.post(
        `/admin/withdrawals/${id}/${action}`,
        action === "approve"
          ? {
              settlementReference: prompt("Settlement reference") || `DEMO-${Date.now()}`,
              reviewNote: "Settlement verified"
            }
          : {
              reviewNote: prompt("Rejection reason") || "The payout account could not be verified."
            },
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      ),
    onSuccess: async () => {
      toast.success("Withdrawal reviewed");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["admin-withdrawals"] }),
        qc.invalidateQueries({ queryKey: ["admin-finance-summary"] }),
        qc.invalidateQueries({ queryKey: ["admin-ledger"] })
      ]);
    },
    onError: (e) => toast.error(apiErrorMessage(e))
  });
  const tabs = ["overview", "payments", "withdrawals", "ledger"];
  return (
    <main className="space-y-6">
      <header>
        <Banknote className="size-10 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-black">
          {forcedSection === "withdrawals" ? "Withdrawal requests" : "Financial records"}
        </h1>
      </header>
      {!forcedSection ? (
        <div className="flex rounded-xl bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setParams(t === "overview" ? {} : { section: t })}
              className={`flex-1 rounded-lg p-3 font-bold capitalize ${section === t ? "bg-emerald-600 text-white" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
      {section === "overview" && summary.data ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Gross payments", `$${(summary.data.grossPaymentCents / 100).toFixed(2)}`, Banknote],
            ["Credits purchased", summary.data.purchasedCredits, Coins],
            ["Credits contributed", summary.data.contributedCredits, Receipt],
            ["Pending withdrawals", summary.data.pendingWithdrawalCredits, HandCoins]
          ].map(([label, value, Icon]) => {
            const I = Icon as typeof Coins;
            return (
              <article key={String(label)} className="card p-6">
                <I className="size-8 text-emerald-600" />
                <p className="mt-5 text-3xl font-black">{String(value)}</p>
                <p className="text-sm text-slate-500">{String(label)}</p>
              </article>
            );
          })}
        </section>
      ) : section === "payments" ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.data?.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4">
                    <b>{p.user.name}</b>
                    <p className="text-xs text-slate-500">{p.user.email}</p>
                  </td>
                  <td className="p-4">${(p.amountCents / 100).toFixed(2)}</td>
                  <td className="p-4">{p.credits}</td>
                  <td className="p-4 capitalize">{p.status}</td>
                  <td className="p-4 text-sm">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : section === "withdrawals" ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.data?.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="p-4">
                    <b>{w.creator.name}</b>
                    <p className="text-xs text-slate-500">
                      {w.method}: {w.accountReference}
                    </p>
                  </td>
                  <td className="p-4">{w.credits}</td>
                  <td className="p-4">${(w.amountCents / 100).toFixed(2)}</td>
                  <td className="p-4 capitalize">{w.status}</td>
                  <td className="p-4">
                    {w.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="btn-primary py-2 text-xs"
                          onClick={() => review.mutate({ id: w.id, action: "approve" })}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-secondary py-2 text-xs text-red-600"
                          onClick={() => review.mutate({ id: w.id, action: "reject" })}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "Reviewed"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Direction</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {ledger.data?.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-4 capitalize">{l.type.replaceAll("_", " ")}</td>
                  <td className="p-4">{l.credits}</td>
                  <td className="p-4">${(l.amountCents / 100).toFixed(2)}</td>
                  <td className="p-4 capitalize">{l.direction}</td>
                  <td className="p-4 text-sm">{l.description}</td>
                  <td className="p-4 text-sm">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
