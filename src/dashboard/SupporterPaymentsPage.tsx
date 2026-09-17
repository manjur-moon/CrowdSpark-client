import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Coins,
  CreditCard,
  History,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";

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

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "success":
    case "succeeded":
    case "completed":
    case "paid":
      return `
        border-[#76988a]/30
        bg-[#d9e7e0]
        text-[#23483a]

        dark:border-[#719585]/25
        dark:bg-[#1d3a2e]
        dark:text-[#c9ddd3]
      `;

    case "pending":
    case "processing":
      return `
        border-amber-500/20
        bg-amber-50
        text-amber-800

        dark:border-amber-400/20
        dark:bg-amber-400/10
        dark:text-amber-200
      `;

    case "failed":
    case "cancelled":
    case "canceled":
      return `
        border-red-500/20
        bg-red-50
        text-red-700

        dark:border-red-400/20
        dark:bg-red-400/10
        dark:text-red-300
      `;

    default:
      return `
        border-[var(--editorial-border)]
        bg-white/35
        text-[var(--editorial-text-soft)]

        dark:bg-white/[0.04]
      `;
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SupporterPaymentsPage({ mode = "both" }: { mode?: SupporterPaymentsMode }) {
  const { current, refresh } = useAuth();

  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const showPurchase = mode !== "history";

  const showHistory = mode !== "purchase";

  useEffect(() => {
    const paymentResult = searchParams.get("payment");

    if (!paymentResult) {
      return;
    }

    if (paymentResult === "success") {
      toast.success(
        "Payment completed. Your credits will appear after Stripe webhook verification."
      );
    }

    if (paymentResult === "cancelled") {
      toast.info("Stripe checkout was cancelled.");
    }

    const next = new URLSearchParams(searchParams);

    next.delete("payment");

    setSearchParams(next, {
      replace: true
    });
  }, [searchParams, setSearchParams]);

  const packages = useQuery({
    queryKey: ["credit-packages"],

    queryFn: async () =>
      (
        await api.get<{
          data: CreditPackage[];
        }>("/payments/packages")
      ).data.data,

    enabled: showPurchase,

    staleTime: 5 * 60 * 1000
  });

  const history = useQuery({
    queryKey: ["payment-history"],

    queryFn: async () =>
      (
        await api.get<{
          data: Payment[];
        }>("/payments/mine", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: showHistory
  });

  const purchase = useMutation({
    mutationFn: async ({ credits, provider }: { credits: number; provider: "demo" | "stripe" }) => {
      const result = (
        await api.post(
          `/payments/${provider === "demo" ? "demo" : "checkout"}`,
          {
            credits
          },
          {
            headers: {
              "Idempotency-Key": crypto.randomUUID()
            }
          }
        )
      ).data.data;

      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
      }

      return result;
    },

    onSuccess: async (result) => {
      if (!result.checkoutUrl) {
        toast.success("Credits added successfully");
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["current-user"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["payment-history"]
        }),

        refresh()
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const balance = current!.profile!.credits;

  const totalHistoryCredits =
    history.data?.reduce((total, payment) => total + payment.credits, 0) ?? 0;

  const totalHistoryAmount =
    history.data?.reduce((total, payment) => total + payment.amountCents, 0) ?? 0;

  const pageTitle = mode === "history" ? "Payment history" : "Purchase credits";

  return (
    <motion.main
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 0.3
      }}
      className="space-y-6"
    >
      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden

          rounded-[26px]

          border
          border-white/10

          bg-[#173329]

          px-6
          py-6

          text-white

          shadow-[0_20px_55px_rgba(23,51,41,0.12)]

          sm:px-7

          dark:bg-[#0d1c16]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24

            size-72

            rounded-full

            bg-[#91aa9d]/14

            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -bottom-32
            left-[35%]

            size-72

            rounded-full

            bg-[#527064]/10

            blur-3xl
          "
        />

        <div
          className="
            relative

            flex
            flex-col
            gap-5

            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#9fb6ab]
              "
            >
              Supporter wallet
            </p>

            <h1
              className="
                display-heading

                mt-2

                text-[clamp(2.8rem,5vw,4.6rem)]
                leading-[0.9]
              "
            >
              {pageTitle}.
            </h1>

            <p
              className="
                mt-3
                max-w-2xl

                text-sm
                leading-6

                text-[#b9ccc3]
              "
            >
              Add credits securely and keep a clear record of purchases made through Stripe or the
              CrowdSpark demo environment.
            </p>
          </div>

          <div
            className="
              min-w-[220px]

              rounded-2xl

              border
              border-white/10

              bg-white/[0.06]

              px-5
              py-3.5

              backdrop-blur-xl
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]

                text-[#91aa9d]
              "
            >
              Available balance
            </p>

            <div
              className="
                mt-1

                flex
                items-end
                gap-2
              "
            >
              <p
                className="
                  text-2xl
                  font-semibold

                  tracking-[-0.04em]

                  text-white
                "
              >
                {balance.toLocaleString()}
              </p>

              <span
                className="
                  pb-0.5
                  text-xs

                  text-[#b7cbc1]
                "
              >
                credits
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PURCHASE */}
      {showPurchase ? (
        <section>
          <div
            className="
              mb-4

              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p className="editorial-label">Credit packages</p>

              <h2
                className="
                  display-heading

                  mt-1

                  text-3xl
                  leading-none
                "
              >
                Choose your balance
              </h2>
            </div>

            <div
              className="
                flex
                items-center
                gap-2

                text-xs

                text-[var(--editorial-muted)]
              "
            >
              <ShieldCheck className="size-4" />
              Secure checkout
            </div>
          </div>

          {packages.isLoading ? (
            <div
              className="
                grid
                gap-4

                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              {Array.from({
                length: 4
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    h-[300px]
                    animate-pulse

                    rounded-[24px]

                    bg-[#c2ccc8]/55

                    dark:bg-[#17231e]
                  "
                />
              ))}
            </div>
          ) : packages.isError ? (
            <section
              className="
                campaign-surface

                px-6
                py-10

                text-center
              "
            >
              <div
                className="
                  mx-auto

                  flex
                  size-11
                  items-center
                  justify-center

                  rounded-full

                  bg-red-100

                  text-red-700

                  dark:bg-red-400/10
                  dark:text-red-300
                "
              >
                <RefreshCw className="size-5" />
              </div>

              <h3
                className="
                  display-heading

                  mt-4

                  text-4xl
                "
              >
                Packages unavailable.
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md

                  text-sm
                  leading-6

                  text-[var(--editorial-muted)]
                "
              >
                CrowdSpark could not load the available credit packages.
              </p>

              <button
                type="button"
                onClick={() => void packages.refetch()}
                className="
                  editorial-button
                  mt-5
                "
              >
                <RefreshCw className="size-4" />
                Try again
              </button>
            </section>
          ) : packages.data?.length ? (
            <div
              className="
                grid
                gap-4

                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              {packages.data.map((creditPackage, index) => {
                const stripePending =
                  purchase.isPending &&
                  purchase.variables?.credits === creditPackage.credits &&
                  purchase.variables?.provider === "stripe";

                const demoPending =
                  purchase.isPending &&
                  purchase.variables?.credits === creditPackage.credits &&
                  purchase.variables?.provider === "demo";

                return (
                  <motion.article
                    key={creditPackage.credits}
                    initial={{
                      opacity: 0,
                      y: 18
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.045
                    }}
                    whileHover={{
                      y: -4
                    }}
                    className="
                        campaign-surface
                        group

                        relative

                        flex
                        min-h-[300px]
                        flex-col

                        overflow-hidden

                        p-5
                      "
                  >
                    <div
                      aria-hidden="true"
                      className="
                          pointer-events-none
                          absolute
                          -right-16
                          -top-16

                          size-40

                          rounded-full

                          bg-[#78988a]/8

                          blur-3xl

                          transition-opacity
                          duration-300

                          group-hover:bg-[#78988a]/13

                          dark:bg-[#78988a]/4
                        "
                    />

                    <div className="relative flex h-full flex-col">
                      <div
                        className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                      >
                        <span
                          className="
                              flex
                              size-10
                              items-center
                              justify-center

                              rounded-full

                              bg-[#d6e3dd]

                              text-[#10261f]
                            "
                        >
                          <Coins className="size-[17px]" />
                        </span>

                        <span
                          className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.14em]

                              text-[var(--editorial-muted)]
                            "
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p
                        className="
                            editorial-label

                            mt-5
                          "
                      >
                        {creditPackage.label}
                      </p>

                      <p
                        className="
                            mt-2

                            text-[2.5rem]
                            font-semibold
                            leading-none

                            tracking-[-0.05em]

                            text-[var(--editorial-text)]
                          "
                      >
                        {creditPackage.credits.toLocaleString()}
                      </p>

                      <p
                        className="
                            mt-1

                            text-xs

                            text-[var(--editorial-muted)]
                          "
                      >
                        credits
                      </p>

                      <div
                        className="
                            mt-4

                            border-t
                            border-[var(--editorial-border)]

                            pt-4
                          "
                      >
                        <p
                          className="
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.15em]

                              text-[var(--editorial-muted)]
                            "
                        >
                          Package price
                        </p>

                        <p
                          className="
                              mt-1

                              text-xl
                              font-semibold

                              tracking-[-0.03em]

                              text-[var(--editorial-text)]
                            "
                        >
                          ${(creditPackage.amountCents / 100).toFixed(2)}
                        </p>
                      </div>

                      <div
                        className="
                            mt-auto

                            space-y-2

                            pt-5
                          "
                      >
                        <button
                          type="button"
                          disabled={purchase.isPending}
                          onClick={() =>
                            purchase.mutate({
                              credits: creditPackage.credits,

                              provider: "stripe"
                            })
                          }
                          className="
                              editorial-button

                              w-full

                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                        >
                          {stripePending ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" />
                              Opening...
                            </>
                          ) : (
                            <>
                              <CreditCard className="size-4" />
                              Pay with Stripe
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={purchase.isPending}
                          onClick={() =>
                            purchase.mutate({
                              credits: creditPackage.credits,

                              provider: "demo"
                            })
                          }
                          className="
                              inline-flex
                              min-h-11
                              w-full
                              items-center
                              justify-center
                              gap-2

                              rounded-full

                              border
                              border-[var(--editorial-border)]

                              bg-transparent

                              px-4

                              text-sm
                              font-semibold

                              text-[var(--editorial-text-soft)]

                              transition-all

                              hover:bg-white/40
                              hover:text-[var(--editorial-text)]

                              disabled:cursor-not-allowed
                              disabled:opacity-50

                              dark:hover:bg-white/[0.05]
                            "
                        >
                          {demoPending ? (
                            <>
                              <LoaderCircle className="size-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="size-4" />
                              Demo payment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <section
              className="
                campaign-surface

                px-6
                py-10

                text-center
              "
            >
              <Coins
                className="
                  mx-auto
                  size-6

                  text-[var(--editorial-muted)]
                "
              />

              <p
                className="
                  mt-3
                  text-sm

                  text-[var(--editorial-muted)]
                "
              >
                No credit packages are available.
              </p>
            </section>
          )}

          {mode === "purchase" ? (
            <div
              className="
                mt-5

                flex
                flex-col
                gap-3

                rounded-2xl

                border
                border-[var(--editorial-border)]

                bg-white/20

                p-4

                sm:flex-row
                sm:items-center
                sm:justify-between

                dark:bg-white/[0.02]
              "
            >
              <p
                className="
                  text-xs

                  text-[var(--editorial-muted)]
                "
              >
                Already purchased credits? Review previous transactions from your wallet history.
              </p>

              <Link
                to="/dashboard/supporter/payment-history"
                className="
                  inline-flex
                  items-center
                  gap-2

                  text-xs
                  font-bold

                  text-[#426454]

                  transition

                  hover:text-[#20352d]

                  dark:text-[#adc4b8]
                  dark:hover:text-white
                "
              >
                <History className="size-4" />
                Payment history
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* HISTORY */}
      {showHistory ? (
        <section className="space-y-4">
          {history.data?.length ? (
            <div
              className="
                grid
                gap-4

                sm:grid-cols-2
              "
            >
              <SummaryCard
                label="Purchased credits"

                displayValue={totalHistoryCredits.toLocaleString()}
                icon={Coins}
              />

              <SummaryCard
                label="Transaction value"

                displayValue={`$${(totalHistoryAmount / 100).toFixed(2)}`}
                icon={ReceiptText}
              />
            </div>
          ) : null}

          <section
            className="
              campaign-surface

              overflow-hidden
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-4

                border-b
                border-[var(--editorial-border)]

                px-5
                py-4
              "
            >
              <div>
                <p className="editorial-label">Wallet activity</p>

                <h2
                  className="
                    display-heading

                    mt-1

                    text-3xl
                    leading-none
                  "
                >
                  Payment history
                </h2>

                <p
                  className="
                    mt-2

                    text-xs
                    leading-5

                    text-[var(--editorial-muted)]
                  "
                >
                  Stripe and demo credit purchases made by your account.
                </p>
              </div>

              <History
                className="
                  size-5

                  text-[#527064]

                  dark:text-[#91aa9d]
                "
              />
            </div>

            {history.isLoading ? (
              <PaymentLoading />
            ) : history.isError ? (
              <div
                className="
                  px-6
                  py-10

                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold

                    text-red-600

                    dark:text-red-400
                  "
                >
                  Payment history could not be loaded.
                </p>

                <button
                  type="button"
                  onClick={() => void history.refetch()}
                  className="
                    editorial-button

                    mt-5
                  "
                >
                  <RefreshCw className="size-4" />
                  Try again
                </button>
              </div>
            ) : history.data?.length ? (
              <div className="overflow-x-auto">
                <table
                  className="
                    w-full
                    min-w-[820px]
                  "
                >
                  <thead>
                    <tr
                      className="
                        border-b
                        border-[var(--editorial-border)]

                        text-left

                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]

                        text-[var(--editorial-muted)]
                      "
                    >
                      <th className="px-5 py-4">Credits</th>

                      <th className="px-5 py-4">Amount</th>

                      <th className="px-5 py-4">Provider</th>

                      <th className="px-5 py-4">Status</th>

                      <th className="px-5 py-4">Reference</th>

                      <th className="px-5 py-4">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {history.data.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        initial={{
                          opacity: 0,
                          y: 8
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.025
                        }}
                        className="
                            border-b
                            border-[var(--editorial-border)]

                            transition-colors

                            last:border-b-0

                            hover:bg-white/20

                            dark:hover:bg-white/[0.02]
                          "
                      >
                        <td className="px-5 py-4">
                          <div
                            className="
                                flex
                                items-center
                                gap-3
                              "
                          >
                            <span
                              className="
                                  flex
                                  size-9
                                  shrink-0
                                  items-center
                                  justify-center

                                  rounded-full

                                  bg-[#d6e3dd]

                                  text-[#10261f]
                                "
                            >
                              <Coins className="size-4" />
                            </span>

                            <div>
                              <p
                                className="
                                    text-lg
                                    font-semibold

                                    tracking-[-0.03em]

                                    text-[var(--editorial-text)]
                                  "
                              >
                                {payment.credits.toLocaleString()}
                              </p>

                              <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-[0.12em]

                                    text-[var(--editorial-muted)]
                                  "
                              >
                                credits
                              </p>
                            </div>
                          </div>
                        </td>

                        <td
                          className="
                              px-5
                              py-4

                              text-sm
                              font-semibold

                              text-[var(--editorial-text)]
                            "
                        >
                          ${(payment.amountCents / 100).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className="
                                inline-flex
                                items-center
                                gap-2

                                text-sm
                                font-medium
                                capitalize

                                text-[var(--editorial-text-soft)]
                              "
                          >
                            {payment.provider === "stripe" ? (
                              <CreditCard className="size-4" />
                            ) : (
                              <Sparkles className="size-4" />
                            )}

                            {payment.provider}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`
                                inline-flex

                                rounded-full

                                border

                                px-3
                                py-1.5

                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.1em]

                                ${statusClass(payment.status)}
                              `}
                          >
                            {formatStatus(payment.status)}
                          </span>
                        </td>

                        <td
                          className="
                              max-w-[220px]

                              truncate

                              px-5
                              py-4

                              font-mono
                              text-xs

                              text-[var(--editorial-muted)]
                            "
                          title={payment.stripeCheckoutSessionId ?? payment.id}
                        >
                          {payment.stripeCheckoutSessionId ?? payment.id}
                        </td>

                        <td
                          className="
                              px-5
                              py-4

                              text-xs
                              leading-5

                              text-[var(--editorial-muted)]
                            "
                        >
                          {new Date(payment.createdAt).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="
                  px-6
                  py-12

                  text-center
                "
              >
                <div
                  className="
                    mx-auto

                    flex
                    size-11
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]
                  "
                >
                  <History className="size-5" />
                </div>

                <h3
                  className="
                    display-heading

                    mt-4

                    text-4xl
                  "
                >
                  No payment history.
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md

                    text-sm
                    leading-6

                    text-[var(--editorial-muted)]
                  "
                >
                  Credit purchases made from this account will appear here.
                </p>

                {mode !== "history" ? null : (
                  <Link
                    to="/dashboard/supporter/purchase-credits"
                    className="
                      editorial-button

                      mt-5
                    "
                  >
                    <WalletCards className="size-4" />
                    Purchase credits
                  </Link>
                )}
              </div>
            )}
          </section>
        </section>
      ) : null}
    </motion.main>
  );
}

function SummaryCard({
  label,
  displayValue,
  icon: Icon
}: {
  label: string;

  displayValue: string;
  icon: typeof Coins;
}) {
  return (
    <motion.article
      whileHover={{
        y: -3
      }}
      className="
        campaign-surface

        flex
        items-center
        gap-4

        p-4
      "
    >
      <div
        className="
          flex
          size-10
          shrink-0
          items-center
          justify-center

          rounded-full

          bg-[#d6e3dd]

          text-[#10261f]
        "
      >
        <Icon className="size-[17px]" />
      </div>

      <div>
        <p
          className="
            text-2xl
            font-semibold

            tracking-[-0.04em]

            text-[var(--editorial-text)]
          "
        >
          {displayValue}
        </p>

        <p
          className="
            mt-0.5

            text-xs

            text-[var(--editorial-muted)]
          "
        >
          {label}
        </p>
      </div>
    </motion.article>
  );
}

function PaymentLoading() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({
        length: 5
      }).map((_, index) => (
        <div
          key={index}
          className="
            h-[70px]
            animate-pulse

            rounded-xl

            bg-[#c2ccc8]/55

            dark:bg-[#17231e]
          "
        />
      ))}
    </div>
  );
}
