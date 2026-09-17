import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Banknote,
  Clock3,
  History,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards
} from "lucide-react";

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

const fieldClass = `
  w-full

  rounded-xl

  border
  border-[var(--editorial-border)]

  bg-white/35

  px-4
  py-3

  text-sm
  text-[var(--editorial-text)]

  outline-none

  transition-all
  duration-200

  placeholder:text-[var(--editorial-muted)]

  hover:border-[#7b9187]

  focus:border-[#527064]
  focus:bg-white/55
  focus:ring-4
  focus:ring-[#527064]/10

  dark:bg-white/[0.03]
  dark:hover:border-[#5d7469]
  dark:focus:border-[#78988a]
  dark:focus:bg-white/[0.05]
`;

const labelClass = `
  mb-2
  block

  text-[10px]
  font-bold
  uppercase
  tracking-[0.19em]

  text-[var(--editorial-muted)]
`;

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
    case "completed":
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
      return `
        border-amber-500/20
        bg-amber-50
        text-amber-800

        dark:border-amber-400/20
        dark:bg-amber-400/10
        dark:text-amber-200
      `;

    case "rejected":
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

export default function CreatorWithdrawalsPage({
  mode = "both"
}: {
  mode?: CreatorWithdrawalsMode;
}) {
  const { current, refresh } = useAuth();

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    credits: 200,
    method: "bkash",
    accountReference: ""
  });

  const showRequest = mode !== "history";
  const showHistory = mode !== "request";

  const query = useQuery({
    queryKey: ["creator-withdrawals"],

    queryFn: async () =>
      (
        await api.get<{
          data: Withdrawal[];
        }>("/creator/withdrawals", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: showHistory
  });

  const submit = useMutation({
    mutationFn: () =>
      api.post("/creator/withdrawals", form, {
        headers: {
          "Idempotency-Key": crypto.randomUUID()
        }
      }),

    onSuccess: async () => {
      toast.success("Withdrawal request submitted for Admin review");

      setForm((currentForm) => ({
        ...currentForm,
        accountReference: ""
      }));

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["creator-withdrawals"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["current-user"]
        }),

        refresh()
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const available = current!.profile!.creatorBalance;

  const settlementAmount = form.credits / 20;

  const pageTitle = mode === "history" ? "Withdrawal history" : "Withdrawals";

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
              Creator finance
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
              Request settlements from your available creator balance and track Admin review
              results.
            </p>
          </div>

          <div
            className="
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
                {available.toLocaleString()}
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

            <p
              className="
                mt-1
                text-xs

                text-[#9fb6ab]
              "
            >
              ${(available / 20).toFixed(2)} settlement value
            </p>
          </div>
        </div>
      </section>

      {/* REQUEST */}
      {showRequest ? (
        <section
          className="
            grid
            gap-5

            xl:grid-cols-[400px_1fr]
          "
        >
          <motion.form
            initial={{
              opacity: 0,
              y: 16
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.4
            }}
            onSubmit={(event) => {
              event.preventDefault();

              submit.mutate();
            }}
            className="
              campaign-surface

              self-start

              p-5

              xl:sticky
              xl:top-[96px]
            "
          >
            <div
              className="
                flex
                size-11
                items-center
                justify-center

                rounded-full

                bg-[#d6e3dd]

                text-[#10261f]
              "
            >
              <WalletCards className="size-[18px]" />
            </div>

            <p className="editorial-label mt-5">Settlement request</p>

            <h2
              className="
                display-heading

                mt-1.5

                text-3xl
                leading-none
              "
            >
              Request withdrawal
            </h2>

            <p
              className="
                mt-2

                text-xs
                leading-5

                text-[var(--editorial-muted)]
              "
            >
              Minimum withdrawal is 200 credits. Every 20 credits equals $1.
            </p>

            {/* Credits */}
            <div className="mt-5">
              <label htmlFor="withdrawal-credits" className={labelClass}>
                Credits to withdraw
              </label>

              <input
                id="withdrawal-credits"
                className={fieldClass}
                type="number"
                min={200}
                max={available}
                step={1}
                value={form.credits}
                onChange={(event) =>
                  setForm({
                    ...form,
                    credits: Number(event.target.value)
                  })
                }
              />

              <div
                className="
                  mt-2

                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-xs

                    text-[var(--editorial-muted)]
                  "
                >
                  Settlement value
                </span>

                <span
                  className="
                    text-sm
                    font-bold

                    text-[#426454]

                    dark:text-[#b1c8bc]
                  "
                >
                  ${settlementAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Method */}
            <div className="mt-4">
              <label htmlFor="withdrawal-method" className={labelClass}>
                Payment system
              </label>

              <select
                id="withdrawal-method"
                className={fieldClass}
                value={form.method}
                onChange={(event) =>
                  setForm({
                    ...form,
                    method: event.target.value
                  })
                }
              >
                <option value="stripe">Stripe</option>

                <option value="bkash">Bkash</option>

                <option value="rocket">Rocket</option>

                <option value="nagad">Nagad</option>

                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {/* Account */}
            <div className="mt-4">
              <label htmlFor="withdrawal-account" className={labelClass}>
                Account number or reference
              </label>

              <input
                id="withdrawal-account"
                className={fieldClass}
                value={form.accountReference}
                placeholder="Enter payment account"
                onChange={(event) =>
                  setForm({
                    ...form,

                    accountReference: event.target.value
                  })
                }
                required
                minLength={4}
                maxLength={120}
              />

              <div
                className="
                  mt-2

                  flex
                  items-start
                  gap-2

                  text-[11px]
                  leading-5

                  text-[var(--editorial-muted)]
                "
              >
                <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />

                <span>Stored encrypted. Only the last four characters are displayed later.</span>
              </div>
            </div>

            {available < 200 ? (
              <div
                className="
                  mt-4

                  flex
                  items-start
                  gap-2

                  rounded-xl

                  border
                  border-amber-500/20

                  bg-amber-50

                  p-3

                  text-xs
                  leading-5

                  text-amber-800

                  dark:border-amber-400/15
                  dark:bg-amber-400/[0.08]
                  dark:text-amber-200
                "
              >
                <Clock3 className="mt-0.5 size-4 shrink-0" />

                <span>You need at least 200 available credits before requesting a withdrawal.</span>
              </div>
            ) : null}

            <motion.button
              type="submit"
              disabled={available < 200 || form.credits > available || submit.isPending}
              whileHover={
                submit.isPending
                  ? undefined
                  : {
                      y: -1
                    }
              }
              whileTap={
                submit.isPending
                  ? undefined
                  : {
                      scale: 0.985
                    }
              }
              className="
                editorial-button

                mt-5
                w-full

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submit.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <WalletCards className="size-4" />
                  Request withdrawal
                </>
              )}
            </motion.button>
          </motion.form>

          {/* RULES */}
          <div
            className="
              campaign-surface

              overflow-hidden
            "
          >
            <div
              className="
                border-b
                border-[var(--editorial-border)]

                p-5
              "
            >
              <p className="editorial-label">Settlement process</p>

              <h2
                className="
                  display-heading

                  mt-1.5

                  text-3xl
                  leading-none
                "
              >
                Withdrawal rules
              </h2>

              <p
                className="
                  mt-2
                  max-w-xl

                  text-xs
                  leading-5

                  text-[var(--editorial-muted)]
                "
              >
                Each request follows a controlled review process before settlement.
              </p>
            </div>

            <div
              className="
                grid

                sm:grid-cols-2
              "
            >
              {[
                {
                  icon: WalletCards,
                  title: "Balance reservation",
                  text: "Credits are reserved when the request is submitted."
                },
                {
                  icon: ShieldCheck,
                  title: "Admin review",
                  text: "Admin approval is required before settlement."
                },
                {
                  icon: RefreshCw,
                  title: "Rejected requests",
                  text: "Rejected requests restore the reserved balance."
                },
                {
                  icon: LockKeyhole,
                  title: "Encrypted information",
                  text: "Sensitive account information is encrypted at rest."
                }
              ].map(({ icon: Icon, title, text }) => (
                <motion.article
                  key={title}
                  whileHover={{
                    y: -2
                  }}
                  className="
                      border-b
                      border-[var(--editorial-border)]

                      p-5

                      sm:[&:nth-child(odd)]:border-r
                    "
                >
                  <div
                    className="
                        flex
                        size-9
                        items-center
                        justify-center

                        rounded-full

                        bg-[#d6e3dd]

                        text-[#10261f]
                      "
                  >
                    <Icon className="size-4" />
                  </div>

                  <h3
                    className="
                        mt-4
                        text-sm
                        font-semibold

                        text-[var(--editorial-text)]
                      "
                  >
                    {title}
                  </h3>

                  <p
                    className="
                        mt-1.5

                        text-xs
                        leading-5

                        text-[var(--editorial-muted)]
                      "
                  >
                    {text}
                  </p>
                </motion.article>
              ))}
            </div>

            {mode === "request" ? (
              <div
                className="
                  border-t
                  border-[var(--editorial-border)]

                  p-5
                "
              >
                <Link
                  to="/dashboard/creator/payment-history"
                  className="
                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-[var(--editorial-border)]

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-[var(--editorial-text-soft)]

                    transition-all

                    hover:bg-[#20352d]
                    hover:text-white

                    dark:hover:bg-[#d6e3dd]
                    dark:hover:text-[#10261f]
                  "
                >
                  <History className="size-4" />
                  View payment history
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* HISTORY */}
      {showHistory ? (
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
              <p className="editorial-label">Financial history</p>

              <h2
                className="
                  display-heading

                  mt-1

                  text-3xl
                  leading-none
                "
              >
                Withdrawal payments
              </h2>

              <p
                className="
                  mt-2

                  text-xs

                  text-[var(--editorial-muted)]
                "
              >
                All withdrawal requests and Admin review results.
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

          {query.isLoading ? (
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
          ) : query.isError ? (
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
                Withdrawal history could not be loaded.
              </p>

              <button
                type="button"
                onClick={() => void query.refetch()}
                className="
                  editorial-button

                  mt-5
                "
              >
                <RefreshCw className="size-4" />
                Try again
              </button>
            </div>
          ) : query.data?.length ? (
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
                    <th className="px-5 py-4">Credits</th>

                    <th className="px-5 py-4">Amount</th>

                    <th className="px-5 py-4">Method</th>

                    <th className="px-5 py-4">Account</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Requested</th>
                  </tr>
                </thead>

                <tbody>
                  {query.data.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
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
                                items-center
                                justify-center

                                rounded-full

                                bg-[#d6e3dd]

                                text-[#10261f]
                              "
                          >
                            <WalletCards className="size-4" />
                          </span>

                          <div>
                            <p
                              className="
                                  text-lg
                                  font-semibold

                                  tracking-[-0.03em]
                                "
                            >
                              {withdrawal.credits.toLocaleString()}
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

                      <td className="px-5 py-4">
                        <div
                          className="
                              flex
                              items-center
                              gap-2
                            "
                        >
                          <Banknote
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
                            ${(withdrawal.amountCents / 100).toFixed(2)}
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
                        {withdrawal.method}
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            font-mono
                            text-xs

                            text-[var(--editorial-text-soft)]
                          "
                      >
                        {withdrawal.accountReference}
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
                              tracking-[0.12em]

                              ${statusClass(withdrawal.status)}
                            `}
                        >
                          {withdrawal.status}
                        </span>

                        {withdrawal.reviewNote ? (
                          <p
                            className="
                                mt-2
                                max-w-[240px]

                                text-xs
                                leading-5

                                text-[var(--editorial-muted)]
                              "
                          >
                            {withdrawal.reviewNote}
                          </p>
                        ) : null}

                        {withdrawal.settlementReference ? (
                          <p
                            className="
                                mt-1
                                max-w-[240px]

                                text-[10px]
                                leading-4

                                text-[var(--editorial-muted)]
                              "
                          >
                            Ref: {withdrawal.settlementReference}
                          </p>
                        ) : null}
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
                    </tr>
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
                No withdrawal history.
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
                Your withdrawal requests and settlement results will appear here.
              </p>
            </div>
          )}
        </section>
      ) : null}
    </motion.main>
  );
}
