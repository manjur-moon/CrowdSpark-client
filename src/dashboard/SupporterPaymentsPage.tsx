import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, CreditCard, History } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

interface CreditPackage {
  credits: number;
  amountCents: number;
  label: string;
}

interface Payment {
  id: string;
  credits: number;
  amountCents: number;
  status: string;
  provider: string;
  stripeCheckoutSessionId?: string | null;
  createdAt: string;
}

type SupporterPaymentsMode = "purchase" | "history" | "both";

export default function SupporterPaymentsPage({ mode = "both" }: { mode?: SupporterPaymentsMode }) {
  const { current, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const showPurchase = mode !== "history";
  const showHistory = mode !== "purchase";

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    if (!paymentResult) return;
    if (paymentResult === "success")
      toast.success(
        "Payment completed. Your credits will appear after Stripe webhook verification."
      );
    if (paymentResult === "cancelled") toast.info("Stripe checkout was cancelled.");
    const next = new URLSearchParams(searchParams);
    next.delete("payment");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const packages = useQuery({
    queryKey: ["credit-packages"],
    queryFn: async () => (await api.get<{ data: CreditPackage[] }>("/payments/packages")).data.data,
    enabled: showPurchase,
    staleTime: 5 * 60 * 1000
  });

  const history = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () =>
      (await api.get<{ data: Payment[] }>("/payments/mine", { params: { limit: 50 } })).data.data,
    enabled: showHistory
  });

  const purchase = useMutation({
    mutationFn: async ({ credits, provider }: { credits: number; provider: "demo" | "stripe" }) => {
      const result = (
        await api.post(
          `/payments/${provider === "demo" ? "demo" : "checkout"}`,
          { credits },
          {
            headers: { "Idempotency-Key": crypto.randomUUID() }
          }
        )
      ).data.data;
      if (result.checkoutUrl) window.location.assign(result.checkoutUrl);
      return result;
    },
    onSuccess: async (result) => {
      if (!result.checkoutUrl) toast.success("Credits added successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["current-user"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
        refresh()
      ]);
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });

  return (
    <main className="space-y-7">
      <header>
        <p className="font-bold text-emerald-700">SUPPORTER WALLET</p>
        <h1 className="mt-2 text-3xl font-black">
          {mode === "history" ? "Payment history" : "Purchase credits"}
        </h1>
        <p className="mt-2 text-slate-600">
          Available balance: <strong>{current!.profile!.credits.toLocaleString()} credits</strong>
        </p>
      </header>

      {showPurchase ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {packages.isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
                ))
              : packages.data?.map((creditPackage) => (
                  <article key={creditPackage.credits} className="card flex h-full flex-col p-6">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100">
                      <Coins className="size-6 text-emerald-700" />
                    </span>
                    <p className="mt-5 text-sm font-bold uppercase tracking-wide text-emerald-700">
                      {creditPackage.label}
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {creditPackage.credits.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500">
                      credits · ${(creditPackage.amountCents / 100).toFixed(2)}
                    </p>
                    <div className="mt-auto pt-6">
                      <button
                        className="btn-primary w-full"
                        disabled={purchase.isPending}
                        onClick={() =>
                          purchase.mutate({ credits: creditPackage.credits, provider: "stripe" })
                        }
                      >
                        <CreditCard className="size-4" /> Pay with Stripe
                      </button>
                      <button
                        className="btn-secondary mt-2 w-full"
                        disabled={purchase.isPending}
                        onClick={() =>
                          purchase.mutate({ credits: creditPackage.credits, provider: "demo" })
                        }
                      >
                        Demo payment
                      </button>
                    </div>
                  </article>
                ))}
          </section>
          {mode === "purchase" ? (
            <p className="text-sm text-slate-500">
              Already purchased credits?{" "}
              <Link
                className="font-bold text-emerald-700"
                to="/dashboard/supporter/payment-history"
              >
                View payment history
              </Link>
              .
            </p>
          ) : null}
        </>
      ) : null}

      {showHistory ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-xl font-bold">Payment history</h2>
              <p className="mt-1 text-sm text-slate-500">
                Stripe and demo credit purchases made by your account.
              </p>
            </div>
            <History className="size-6 text-emerald-600" />
          </div>
          {history.isLoading ? (
            <div className="h-56 animate-pulse bg-slate-100" />
          ) : history.data?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="p-4 font-bold">{payment.credits.toLocaleString()}</td>
                      <td className="p-4">${(payment.amountCents / 100).toFixed(2)}</td>
                      <td className="p-4 capitalize">{payment.provider}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize">
                          {payment.status}
                        </span>
                      </td>
                      <td className="max-w-52 truncate p-4 font-mono text-xs text-slate-500">
                        {payment.stripeCheckoutSessionId ?? payment.id}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-t p-10 text-center text-slate-500">No payments found.</div>
          )}
        </section>
      ) : null}
    </main>
  );
}
