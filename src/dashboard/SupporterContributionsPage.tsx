import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  ExternalLink,
  Filter,
  HandHeart,
  LoaderCircle,
  RefreshCw
} from "lucide-react";

import { Link, useSearchParams } from "react-router-dom";

import { api } from "../lib/api";

import type { Contribution, PaginationMeta } from "../types";

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
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

    case "refund_requested":
      return `
        border-sky-500/20
        bg-sky-50
        text-sky-800

        dark:border-sky-400/20
        dark:bg-sky-400/10
        dark:text-sky-200
      `;

    case "refunded":
      return `
        border-[#9b8d69]/25
        bg-[#eee8d9]
        text-[#66572f]

        dark:border-[#b9a675]/20
        dark:bg-[#b9a675]/10
        dark:text-[#dacba3]
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

export default function SupporterContributionsPage() {
  const [params, setParams] = useSearchParams();

  const page = Math.max(1, Number(params.get("page") || 1));

  const status = params.get("status") || "";

  const query = useQuery({
    queryKey: ["supporter-contributions", page, status],

    queryFn: async () =>
      (
        await api.get<{
          data: Contribution[];
          meta: PaginationMeta;
        }>("/contributions/mine", {
          params: {
            page,
            limit: 10,
            status: status || undefined
          }
        })
      ).data
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    if (key !== "page") {
      next.delete("page");
    }

    setParams(next);
  };

  const pageCredits =
    query.data?.data.reduce((sum, contribution) => sum + contribution.credits, 0) ?? 0;

  const approvedOnPage =
    query.data?.data.filter((contribution) => contribution.status === "approved").length ?? 0;

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

            sm:flex-row
            sm:items-end
            sm:justify-between
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
              Supporter workspace
            </p>

            <h1
              className="
                display-heading

                mt-2

                text-[clamp(2.8rem,5vw,4.6rem)]
                leading-[0.9]
              "
            >
              My contributions.
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
              Review the campaigns you have supported and track each contribution through its
              current status.
            </p>
          </div>

          <Link
            to="/campaigns"
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              gap-2

              rounded-full

              bg-[#d6e3dd]

              px-5
              py-3

              text-sm
              font-bold

              text-[#10261f]

              transition-all

              hover:-translate-y-0.5
              hover:bg-white
            "
          >
            <HandHeart className="size-4" />
            Explore campaigns
          </Link>
        </div>
      </section>

      {/* SUMMARY */}
      <section
        className="
          grid
          gap-4

          sm:grid-cols-3
        "
      >
        <SummaryCard
          label="Records on this page"
          value={query.data?.data.length ?? 0}
          icon={HandHeart}
        />

        <SummaryCard label="Credits on this page" value={pageCredits} icon={Coins} />

        <SummaryCard label="Approved on this page" value={approvedOnPage} icon={RefreshCw} />
      </section>

      {/* FILTER */}
      <section
        className="
          campaign-surface

          p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div
            className="
              w-full
              max-w-sm
            "
          >
            <label
              htmlFor="contribution-status"
              className="
                mb-2

                flex
                items-center
                gap-2

                text-[10px]
                font-bold
                uppercase
                tracking-[0.19em]

                text-[var(--editorial-muted)]
              "
            >
              <Filter className="size-3.5" />
              Status filter
            </label>

            <select
              id="contribution-status"
              className="
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

                focus:border-[#527064]
                focus:ring-4
                focus:ring-[#527064]/10

                dark:bg-white/[0.03]
              "
              value={status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="">All statuses</option>

              <option value="pending">Pending</option>

              <option value="approved">Approved</option>

              <option value="rejected">Rejected</option>

              <option value="refund_requested">Refund requested</option>
            </select>
          </div>

          {status ? (
            <button
              type="button"
              onClick={() => update("status", "")}
              className="
                text-xs
                font-semibold

                text-[#527064]

                transition

                hover:text-[#20352d]

                dark:text-[#a9c0b5]
                dark:hover:text-white
              "
            >
              Clear filter
            </button>
          ) : null}
        </div>
      </section>

      {/* CONTENT */}
      {query.isLoading ? (
        <ContributionLoading />
      ) : query.isError ? (
        <section
          className="
            campaign-surface

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

              bg-red-100

              text-red-700

              dark:bg-red-400/10
              dark:text-red-300
            "
          >
            <RefreshCw className="size-5" />
          </div>

          <h2
            className="
              display-heading

              mt-4

              text-4xl
            "
          >
            Contributions unavailable.
          </h2>

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
            CrowdSpark could not load your contribution history.
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
        </section>
      ) : query.data?.data.length ? (
        <>
          {/* TABLE */}
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
                <p className="editorial-label">Contribution ledger</p>

                <h2
                  className="
                    display-heading

                    mt-1

                    text-3xl
                    leading-none
                  "
                >
                  Supported campaigns
                </h2>
              </div>

              {query.isFetching ? (
                <LoaderCircle
                  className="
                    size-4
                    animate-spin

                    text-[var(--editorial-muted)]
                  "
                />
              ) : null}
            </div>

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
                    <th className="px-5 py-4">Campaign</th>

                    <th className="px-5 py-4">Credits</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Date</th>

                    <th className="px-5 py-4 text-right">View</th>
                  </tr>
                </thead>

                <tbody>
                  {query.data.data.map((contribution, index) => (
                    <motion.tr
                      key={contribution.id}
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
                            <HandHeart className="size-4" />
                          </span>

                          <div>
                            <p
                              className="
                                  max-w-[300px]

                                  line-clamp-2

                                  text-sm
                                  font-semibold

                                  text-[var(--editorial-text)]
                                "
                            >
                              {contribution.campaignTitle}
                            </p>

                            <p
                              className="
                                  mt-1

                                  text-[10px]
                                  uppercase
                                  tracking-[0.12em]

                                  text-[var(--editorial-muted)]
                                "
                            >
                              Campaign contribution
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p
                            className="
                                text-lg
                                font-semibold

                                tracking-[-0.03em]

                                text-[var(--editorial-text)]
                              "
                          >
                            {contribution.credits.toLocaleString()}
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

                              ${statusClass(contribution.status)}
                            `}
                        >
                          {formatStatus(contribution.status)}
                        </span>
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-xs

                            text-[var(--editorial-muted)]
                          "
                      >
                        {new Date(contribution.createdAt).toLocaleDateString()}
                      </td>

                      <td
                        className="
                            px-5
                            py-4
                            text-right
                          "
                      >
                        <Link
                          to={`/campaigns/${contribution.campaignId}`}
                          aria-label={`View ${contribution.campaignTitle}`}
                          className="
                              inline-flex
                              size-9
                              items-center
                              justify-center

                              rounded-full

                              border
                              border-[var(--editorial-border)]

                              text-[var(--editorial-text-soft)]

                              transition-all

                              hover:bg-[#20352d]
                              hover:text-white

                              dark:hover:bg-[#d6e3dd]
                              dark:hover:text-[#10261f]
                            "
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* PAGINATION */}
          <div
            className="
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                text-xs

                text-[var(--editorial-muted)]
              "
            >
              Page{" "}
              <strong
                className="
                  font-semibold

                  text-[var(--editorial-text)]
                "
              >
                {query.data.meta.page}
              </strong>{" "}
              of{" "}
              <strong
                className="
                  font-semibold

                  text-[var(--editorial-text)]
                "
              >
                {query.data.meta.totalPages}
              </strong>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!query.data.meta.hasPreviousPage}
                onClick={() => update("page", String(page - 1))}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  border
                  border-[var(--editorial-border)]

                  bg-white/25

                  px-4
                  py-2.5

                  text-xs
                  font-semibold

                  text-[var(--editorial-text-soft)]

                  transition-all

                  hover:bg-white/50

                  disabled:cursor-not-allowed
                  disabled:opacity-35

                  dark:bg-white/[0.02]
                  dark:hover:bg-white/[0.05]
                "
              >
                <ArrowLeft className="size-3.5" />
                Previous
              </button>

              <button
                type="button"
                disabled={!query.data.meta.hasNextPage}
                onClick={() => update("page", String(page + 1))}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  bg-[#20352d]

                  px-4
                  py-2.5

                  text-xs
                  font-semibold
                  text-white

                  transition-all

                  hover:bg-[#2f4b40]

                  disabled:cursor-not-allowed
                  disabled:opacity-35

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                "
              >
                Next
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* EMPTY */
        <section
          className="
            campaign-surface

            px-6
            py-12

            text-center
          "
        >
          <div
            className="
              mx-auto

              flex
              size-12
              items-center
              justify-center

              rounded-full

              bg-[#d6e3dd]

              text-[#10261f]
            "
          >
            <HandHeart className="size-5" />
          </div>

          <h2
            className="
              display-heading

              mt-5

              text-4xl
            "
          >
            No contributions found.
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-md

              text-sm
              leading-6

              text-[var(--editorial-muted)]
            "
          >
            {status
              ? "There are no contributions matching the selected status."
              : "Support a campaign and your contribution history will appear here."}
          </p>

          <div
            className="
              mt-6

              flex
              flex-wrap
              justify-center
              gap-3
            "
          >
            {status ? (
              <button
                type="button"
                onClick={() => update("status", "")}
                className="
                  inline-flex
                  items-center
                  justify-center

                  rounded-full

                  border
                  border-[var(--editorial-border)]

                  px-5
                  py-3

                  text-sm
                  font-semibold

                  text-[var(--editorial-text-soft)]

                  transition

                  hover:bg-white/40

                  dark:hover:bg-white/[0.05]
                "
              >
                Clear filter
              </button>
            ) : null}

            <Link to="/campaigns" className="editorial-button">
              Explore campaigns
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}
    </motion.main>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
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
          {value.toLocaleString()}
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

function ContributionLoading() {
  return (
    <section
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
        <div
          className="
            h-7
            w-52

            animate-pulse

            rounded-lg

            bg-[#c0cbc7]/60

            dark:bg-[#1a2721]
          "
        />
      </div>

      <div className="space-y-2 p-5">
        {Array.from({
          length: 6
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
    </section>
  );
}
