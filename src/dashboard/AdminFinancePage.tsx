import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import {
  Banknote,
  Check,
  CheckCircle2,
  Coins,
  CreditCard,
  HandCoins,
  History,
  LoaderCircle,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
  X
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

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

  user: {
    name: string;
    email: string;
  };

  amountCents: number;
  credits: number;
  status: string;
  provider: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;

  creator: {
    name: string;
    email: string;
  };

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

type FinanceSection = "overview" | "payments" | "withdrawals" | "ledger";

const tabs: Array<{
  value: FinanceSection;
  label: string;
  icon: LucideIcon;
}> = [
  {
    value: "overview",
    label: "Overview",
    icon: Banknote
  },
  {
    value: "payments",
    label: "Payments",
    icon: CreditCard
  },
  {
    value: "withdrawals",
    label: "Withdrawals",
    icon: HandCoins
  },
  {
    value: "ledger",
    label: "Ledger",
    icon: Receipt
  }
];

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(amountCents: number) {
  return `$${(amountCents / 100).toFixed(2)}`;
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "success":
    case "succeeded":
    case "approved":
    case "completed":
    case "paid":
    case "settled":
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
    case "rejected":
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

function directionClass(direction: string) {
  const normalized = direction.toLowerCase();

  if (normalized === "credit" || normalized === "in" || normalized === "incoming") {
    return `
      border-[#76988a]/30
      bg-[#d9e7e0]
      text-[#23483a]

      dark:border-[#719585]/25
      dark:bg-[#1d3a2e]
      dark:text-[#c9ddd3]
    `;
  }

  if (normalized === "debit" || normalized === "out" || normalized === "outgoing") {
    return `
      border-amber-500/20
      bg-amber-50
      text-amber-800

      dark:border-amber-400/20
      dark:bg-amber-400/10
      dark:text-amber-200
    `;
  }

  return `
    border-[var(--editorial-border)]
    bg-white/35
    text-[var(--editorial-text-soft)]

    dark:bg-white/[0.04]
  `;
}

export default function AdminFinancePage({ forcedSection }: { forcedSection?: FinanceSection }) {
  const [params, setParams] = useSearchParams();

  const section = (forcedSection ?? params.get("section") ?? "overview") as FinanceSection;

  const qc = useQueryClient();

  const summary = useQuery({
    queryKey: ["admin-finance-summary"],

    queryFn: async () =>
      (
        await api.get<{
          data: Summary;
        }>("/admin/finance/summary")
      ).data.data
  });

  const payments = useQuery({
    queryKey: ["admin-payments"],

    queryFn: async () =>
      (
        await api.get<{
          data: Payment[];
        }>("/admin/payments", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: section === "payments"
  });

  const withdrawals = useQuery({
    queryKey: ["admin-withdrawals"],

    queryFn: async () =>
      (
        await api.get<{
          data: Withdrawal[];
        }>("/admin/withdrawals", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: section === "withdrawals"
  });

  const ledger = useQuery({
    queryKey: ["admin-ledger"],

    queryFn: async () =>
      (
        await api.get<{
          data: Ledger[];
        }>("/admin/ledger", {
          params: {
            limit: 50
          }
        })
      ).data.data,

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

        {
          headers: {
            "Idempotency-Key": crypto.randomUUID()
          }
        }
      ),

    onSuccess: async () => {
      toast.success("Withdrawal reviewed");

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["admin-withdrawals"]
        }),

        qc.invalidateQueries({
          queryKey: ["admin-finance-summary"]
        }),

        qc.invalidateQueries({
          queryKey: ["admin-ledger"]
        })
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const setSection = (nextSection: FinanceSection) => {
    if (nextSection === "overview") {
      setParams({});
      return;
    }

    setParams({
      section: nextSection
    });
  };

  const pageTitle =
    forcedSection === "withdrawals"
      ? "Withdrawal requests"
      : section === "payments"
        ? "Payment records"
        : section === "withdrawals"
          ? "Withdrawal requests"
          : section === "ledger"
            ? "Financial ledger"
            : "Financial overview";

  const pageDescription =
    section === "payments"
      ? "Review supporter credit purchases and payment-provider activity."
      : section === "withdrawals"
        ? "Review creator settlement requests and approve or reject payouts."
        : section === "ledger"
          ? "Inspect auditable platform credit and monetary movements."
          : "Monitor CrowdSpark payment volume, credits and settlement activity.";

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
            -bottom-32
            absolute
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
              Admin finance
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
              {pageDescription}
            </p>
          </div>

          {summary.data ? (
            <div
              className="
                grid
                min-w-[260px]
                grid-cols-2
                gap-4

                rounded-2xl

                border
                border-white/10

                bg-white/[0.06]

                px-5
                py-3.5

                backdrop-blur-xl
              "
            >
              <div>
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]

                    text-[#91aa9d]
                  "
                >
                  Gross volume
                </p>

                <p
                  className="
                    mt-1

                    text-xl
                    font-semibold

                    tracking-[-0.04em]

                    text-white
                  "
                >
                  {formatCurrency(summary.data.grossPaymentCents)}
                </p>
              </div>

              <div>
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.16em]

                    text-[#91aa9d]
                  "
                >
                  Platform fees
                </p>

                <p
                  className="
                    mt-1

                    text-xl
                    font-semibold

                    tracking-[-0.04em]

                    text-white
                  "
                >
                  {formatCurrency(summary.data.platformFeeCents)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* FINANCE NOTICE */}
      <section
        className="
          campaign-surface

          flex
          items-start
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
          <ShieldCheck className="size-[17px]" />
        </div>

        <div>
          <p
            className="
              text-sm
              font-semibold

              text-[var(--editorial-text)]
            "
          >
            Auditable financial operations
          </p>

          <p
            className="
              mt-1

              text-xs
              leading-5

              text-[var(--editorial-muted)]
            "
          >
            Payment and withdrawal actions are recorded through the platform ledger and sensitive
            requests use idempotency protection.
          </p>
        </div>
      </section>

      {/* TABS */}
      {!forcedSection ? (
        <div
          className="
            grid
            grid-cols-2
            gap-1.5

            rounded-2xl

            border
            border-[var(--editorial-border)]

            bg-white/30

            p-1.5

            lg:grid-cols-4

            dark:bg-white/[0.025]
          "
        >
          {tabs.map(({ value, label, icon: Icon }) => {
            const active = section === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setSection(value)}
                className={`
                    flex
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    px-3
                    py-3

                    text-sm
                    font-semibold

                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                            bg-[#20352d]
                            text-white

                            shadow-[0_8px_24px_rgba(32,53,45,0.12)]

                            dark:bg-[#d6e3dd]
                            dark:text-[#10261f]
                          `
                        : `
                            text-[var(--editorial-muted)]

                            hover:bg-white/40
                            hover:text-[var(--editorial-text)]

                            dark:hover:bg-white/[0.04]
                          `
                    }
                  `}
              >
                <Icon className="size-4" />

                {label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* OVERVIEW */}
      {section === "overview" ? (
        summary.isLoading ? (
          <SummaryLoading />
        ) : summary.isError || !summary.data ? (
          <QueryError
            message="Financial summary could not be loaded."
            onRetry={() => void summary.refetch()}
          />
        ) : (
          <section
            className="
              grid
              gap-4

              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            <SummaryCard
              label="Gross payments"
              value={formatCurrency(summary.data.grossPaymentCents)}
              icon={Banknote}
              index={0}
            />

            <SummaryCard
              label="Successful payments"
              value={summary.data.succeededPaymentCount.toLocaleString()}
              icon={CheckCircle2}
              index={1}
            />

            <SummaryCard
              label="Credits purchased"
              value={summary.data.purchasedCredits.toLocaleString()}
              icon={Coins}
              index={2}
            />

            <SummaryCard
              label="Credits contributed"
              value={summary.data.contributedCredits.toLocaleString()}
              icon={Receipt}
              index={3}
            />

            <SummaryCard
              label="Refunded credits"
              value={summary.data.refundedCredits.toLocaleString()}
              icon={RefreshCw}
              index={4}
            />

            <SummaryCard
              label="Pending withdrawals"
              value={summary.data.pendingWithdrawalCredits.toLocaleString()}
              icon={HandCoins}
              index={5}
            />

            <SummaryCard
              label="Approved withdrawals"
              value={summary.data.approvedWithdrawalCredits.toLocaleString()}
              icon={WalletCards}
              index={6}
            />

            <SummaryCard
              label="Platform fees"
              value={formatCurrency(summary.data.platformFeeCents)}
              icon={CreditCard}
              index={7}
            />
          </section>
        )
      ) : null}

      {/* PAYMENTS */}
      {section === "payments" ? (
        <FinancePanel
          label="Payment activity"
          title="Supporter payments"
          description="Stripe and demo purchases recorded across the platform."
          icon={CreditCard}
        >
          {payments.isLoading ? (
            <TableLoading />
          ) : payments.isError ? (
            <QueryError
              message="Payment records could not be loaded."
              onRetry={() => void payments.refetch()}
            />
          ) : payments.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
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
                    <th className="px-5 py-4">User</th>

                    <th className="px-5 py-4">Amount</th>

                    <th className="px-5 py-4">Credits</th>

                    <th className="px-5 py-4">Provider</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.data.map((payment, index) => (
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
                        delay: index * 0.02
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
                            <UserRound className="size-4" />
                          </span>

                          <div>
                            <p
                              className="
                                  text-sm
                                  font-semibold

                                  text-[var(--editorial-text)]
                                "
                            >
                              {payment.user.name}
                            </p>

                            <p
                              className="
                                  mt-0.5

                                  text-xs

                                  text-[var(--editorial-muted)]
                                "
                            >
                              {payment.user.email}
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
                        {formatCurrency(payment.amountCents)}
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                              flex
                              items-center
                              gap-2
                            "
                        >
                          <Coins
                            className="
                                size-4

                                text-[#527064]

                                dark:text-[#91aa9d]
                              "
                          />

                          <span
                            className="
                                text-sm
                                font-semibold
                              "
                          >
                            {payment.credits.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-sm
                            font-medium
                            capitalize

                            text-[var(--editorial-text-soft)]
                          "
                      >
                        {payment.provider}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
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
            <EmptyState
              icon={CreditCard}
              title="No payment records."
              description="Completed or attempted supporter payments will appear here."
            />
          )}
        </FinancePanel>
      ) : null}

      {/* WITHDRAWALS */}
      {section === "withdrawals" ? (
        <FinancePanel
          label="Settlement review"
          title="Creator withdrawals"
          description="Review payout requests before creator funds are settled."
          icon={HandCoins}
        >
          {withdrawals.isLoading ? (
            <TableLoading />
          ) : withdrawals.isError ? (
            <QueryError
              message="Withdrawal requests could not be loaded."
              onRetry={() => void withdrawals.refetch()}
            />
          ) : withdrawals.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
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
                    <th className="px-5 py-4">Creator</th>

                    <th className="px-5 py-4">Credits</th>

                    <th className="px-5 py-4">Amount</th>

                    <th className="px-5 py-4">Method</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Requested</th>

                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {withdrawals.data.map((withdrawal, index) => (
                    <motion.tr
                      key={withdrawal.id}
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
                        delay: index * 0.02
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
                        <div>
                          <p
                            className="
                                text-sm
                                font-semibold

                                text-[var(--editorial-text)]
                              "
                          >
                            {withdrawal.creator.name}
                          </p>

                          <p
                            className="
                                mt-0.5

                                text-xs

                                text-[var(--editorial-muted)]
                              "
                          >
                            {withdrawal.creator.email}
                          </p>
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
                        {withdrawal.credits.toLocaleString()}
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-sm
                            font-semibold
                          "
                      >
                        {formatCurrency(withdrawal.amountCents)}
                      </td>

                      <td className="px-5 py-4">
                        <p
                          className="
                              text-sm
                              font-medium
                              capitalize

                              text-[var(--editorial-text-soft)]
                            "
                        >
                          {withdrawal.method}
                        </p>

                        <p
                          className="
                              mt-1

                              font-mono
                              text-xs

                              text-[var(--editorial-muted)]
                            "
                        >
                          {withdrawal.accountReference}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={withdrawal.status} />
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
                        {new Date(withdrawal.requestedAt).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        {withdrawal.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: withdrawal.id,
                                  action: "approve"
                                })
                              }
                              className="
                                  inline-flex
                                  items-center
                                  gap-2

                                  rounded-full

                                  bg-[#20352d]

                                  px-3.5
                                  py-2

                                  text-xs
                                  font-semibold

                                  text-white

                                  transition-all

                                  hover:bg-[#2f4b40]

                                  disabled:cursor-not-allowed
                                  disabled:opacity-45

                                  dark:bg-[#d6e3dd]
                                  dark:text-[#10261f]
                                "
                            >
                              <Check className="size-3.5" />
                              Approve
                            </button>

                            <button
                              type="button"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: withdrawal.id,
                                  action: "reject"
                                })
                              }
                              className="
                                  inline-flex
                                  items-center
                                  gap-2

                                  rounded-full

                                  border
                                  border-red-500/20

                                  px-3.5
                                  py-2

                                  text-xs
                                  font-semibold

                                  text-red-600

                                  transition-all

                                  hover:bg-red-600
                                  hover:text-white

                                  disabled:cursor-not-allowed
                                  disabled:opacity-45

                                  dark:text-red-400
                                "
                            >
                              <X className="size-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className="
                                text-xs
                                font-medium

                                text-[var(--editorial-muted)]
                              "
                          >
                            Reviewed
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={HandCoins}
              title="No withdrawal requests."
              description="Creator settlement requests will appear here for review."
            />
          )}
        </FinancePanel>
      ) : null}

      {/* LEDGER */}
      {section === "ledger" ? (
        <FinancePanel
          label="Audit trail"
          title="Platform ledger"
          description="A chronological record of credit and monetary movements."
          icon={Receipt}
        >
          {ledger.isLoading ? (
            <TableLoading />
          ) : ledger.isError ? (
            <QueryError
              message="Ledger records could not be loaded."
              onRetry={() => void ledger.refetch()}
            />
          ) : ledger.data?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
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
                    <th className="px-5 py-4">Type</th>

                    <th className="px-5 py-4">Credits</th>

                    <th className="px-5 py-4">Amount</th>

                    <th className="px-5 py-4">Direction</th>

                    <th className="px-5 py-4">Description</th>

                    <th className="px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {ledger.data.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
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
                        delay: index * 0.02
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
                      <td
                        className="
                            px-5
                            py-4

                            text-sm
                            font-semibold

                            text-[var(--editorial-text)]
                          "
                      >
                        {formatStatus(entry.type)}
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-sm
                            font-semibold
                          "
                      >
                        {entry.credits.toLocaleString()}
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-sm
                            font-semibold
                          "
                      >
                        {formatCurrency(entry.amountCents)}
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

                              ${directionClass(entry.direction)}
                            `}
                        >
                          {formatStatus(entry.direction)}
                        </span>
                      </td>

                      <td
                        className="
                            max-w-[340px]

                            px-5
                            py-4

                            text-sm
                            leading-6

                            text-[var(--editorial-text-soft)]
                          "
                      >
                        {entry.description}
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
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={History}
              title="No ledger entries."
              description="Recorded financial activity will appear in the platform ledger."
            />
          )}
        </FinancePanel>
      ) : null}

      {/* REVIEW PENDING */}
      {review.isPending ? (
        <div
          className="
            fixed
            bottom-5
            right-5
            z-50

            flex
            items-center
            gap-2

            rounded-full

            border
            border-white/10

            bg-[#173329]/95

            px-4
            py-3

            text-xs
            font-semibold
            text-white

            shadow-xl
            backdrop-blur-xl

            dark:bg-[#0b1712]/95
          "
        >
          <LoaderCircle className="size-4 animate-spin" />
          Processing withdrawal...
        </div>
      ) : null}
    </motion.main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  index
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  index: number;
}) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 16
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.04
      }}
      whileHover={{
        y: -3
      }}
      className="
        campaign-surface
        group

        relative

        overflow-hidden

        p-5
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-14
          -top-14

          size-36

          rounded-full

          bg-[#78988a]/8

          blur-3xl

          transition

          group-hover:bg-[#78988a]/13

          dark:bg-[#78988a]/4
        "
      />

      <div className="relative">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
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
            <Icon className="size-[17px]" />
          </span>

          <span
            className="
              text-[10px]
              font-bold
              tracking-[0.16em]

              text-[var(--editorial-muted)]
            "
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <p
          className="
            mt-5

            text-[clamp(1.8rem,2.6vw,2.4rem)]
            font-semibold
            leading-none

            tracking-[-0.04em]

            text-[var(--editorial-text)]
          "
        >
          {value}
        </p>

        <p
          className="
            mt-2

            text-xs

            text-[var(--editorial-muted)]
          "
        >
          {label}
        </p>
      </div>

      <div
        className="
          absolute
          bottom-0
          left-0

          h-[3px]
          w-full

          origin-left
          scale-x-0

          bg-[#527064]

          transition-transform
          duration-500

          group-hover:scale-x-100

          dark:bg-[#91aa9d]
        "
      />
    </motion.article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
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

        ${statusClass(status)}
      `}
    >
      {formatStatus(status)}
    </span>
  );
}

function FinancePanel({
  label,
  title,
  description,
  icon: Icon,
  children
}: {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
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
          <p className="editorial-label">{label}</p>

          <h2
            className="
              display-heading

              mt-1

              text-3xl
              leading-none
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2

              text-xs
              leading-5

              text-[var(--editorial-muted)]
            "
          >
            {description}
          </p>
        </div>

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
      </div>

      {children}
    </section>
  );
}

function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
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
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="
          editorial-button

          mt-5
        "
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
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
        <Icon className="size-5" />
      </div>

      <h3
        className="
          display-heading

          mt-4

          text-4xl
        "
      >
        {title}
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
        {description}
      </p>
    </div>
  );
}

function TableLoading() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({
        length: 6
      }).map((_, index) => (
        <div
          key={index}
          className="
            h-[72px]
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

function SummaryLoading() {
  return (
    <div
      className="
        grid
        gap-4

        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {Array.from({
        length: 8
      }).map((_, index) => (
        <div
          key={index}
          className="
            h-36
            animate-pulse

            rounded-[22px]

            bg-[#c2ccc8]/55

            dark:bg-[#17231e]
          "
        />
      ))}
    </div>
  );
}
