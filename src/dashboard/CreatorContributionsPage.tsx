import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  Check,
  Clock3,
  Coins,
  LoaderCircle,
  Megaphone,
  MessageSquareText,
  Newspaper,
  RefreshCw,
  Send,
  UserRound,
  X
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

import type { Campaign, Contribution } from "../types";

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

export default function CreatorContributionsPage() {
  const qc = useQueryClient();

  const [campaignId, setCampaignId] = useState("");

  const [tab, setTab] = useState<"contributions" | "updates">("contributions");

  const [update, setUpdate] = useState({
    title: "",
    content: ""
  });

  const campaigns = useQuery({
    queryKey: ["creator-campaign-options"],

    queryFn: async () =>
      (
        await api.get<{
          data: Campaign[];
        }>("/creator/campaigns")
      ).data.data
  });

  const selected = campaignId || campaigns.data?.[0]?.id || campaigns.data?.[0]?._id || "";

  const selectedCampaign = campaigns.data?.find(
    (campaign) => (campaign.id || campaign._id) === selected
  );

  const contributions = useQuery({
    queryKey: ["creator-contributions", selected],

    queryFn: async () =>
      (
        await api.get<{
          data: Contribution[];
        }>("/creator/contributions", {
          params: {
            campaignId: selected,
            limit: 50
          }
        })
      ).data.data,

    enabled: Boolean(selected)
  });

  const updates = useQuery({
    queryKey: ["creator-updates", selected],

    queryFn: async () =>
      (
        await api.get<{
          data: Array<{
            id: string;
            title: string;
            content: string;
            createdAt: string;
          }>;
        }>(`/creator/campaigns/${selected}/updates`)
      ).data.data,

    enabled: Boolean(selected) && tab === "updates"
  });

  const review = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => {
      const reviewNote =
        action === "reject" ? prompt("Rejection reason (minimum 10 characters)") || "" : undefined;

      return api.post(
        `/creator/contributions/${id}/${action}`,
        reviewNote
          ? {
              reviewNote
            }
          : {},
        {
          headers: {
            "Idempotency-Key": crypto.randomUUID()
          }
        }
      );
    },

    onSuccess: async () => {
      toast.success("Contribution reviewed");

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["creator-contributions"]
        }),

        qc.invalidateQueries({
          queryKey: ["current-user"]
        })
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const publish = useMutation({
    mutationFn: () => api.post(`/creator/campaigns/${selected}/updates`, update),

    onSuccess: async () => {
      toast.success("Update published");

      setUpdate({
        title: "",
        content: ""
      });

      await qc.invalidateQueries({
        queryKey: ["creator-updates"]
      });
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const pendingCount = contributions.data?.filter((item) => item.status === "pending").length ?? 0;

  const approvedCredits =
    contributions.data
      ?.filter((item) => item.status === "approved")
      .reduce((total, item) => total + item.credits, 0) ?? 0;

  const supporterCount =
    new Set(
      contributions.data?.map(
        (item) =>
          item.supporter?.email || item.supporterEmail || item.supporter?.name || item.supporterName
      )
    ).size || 0;

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
              Creator workspace
            </p>

            <h1
              className="
                display-heading

                mt-2

                text-[clamp(2.8rem,5vw,4.6rem)]
                leading-[0.9]
              "
            >
              Contributions & updates.
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
              Review supporter contributions and keep your community informed with campaign progress
              updates.
            </p>
          </div>

          {selectedCampaign ? (
            <div
              className="
                max-w-sm

                rounded-2xl

                border
                border-white/10

                bg-white/[0.06]

                px-4
                py-3

                backdrop-blur-xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]

                  text-[#91aa9d]
                "
              >
                Selected campaign
              </p>

              <p
                className="
                  mt-1

                  truncate

                  text-sm
                  font-semibold

                  text-white
                "
              >
                {selectedCampaign.title}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* CAMPAIGN SELECTOR */}
      <section
        className="
          campaign-surface

          p-5
        "
      >
        <div
          className="
            grid
            gap-4

            lg:grid-cols-[1fr_auto]
            lg:items-end
          "
        >
          <div>
            <label className={labelClass} htmlFor="creator-campaign-select">
              Campaign
            </label>

            <select
              id="creator-campaign-select"
              className={`
                ${fieldClass}
                max-w-2xl
              `}
              value={selected}
              disabled={campaigns.isLoading || !campaigns.data?.length}
              onChange={(event) => setCampaignId(event.target.value)}
            >
              {campaigns.data?.map((campaign) => {
                const id = campaign.id || campaign._id || "";

                return (
                  <option key={id} value={id}>
                    {campaign.title}
                  </option>
                );
              })}
            </select>
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
            <Megaphone className="size-4" />
            {campaigns.data?.length ?? 0} campaigns available
          </div>
        </div>
      </section>

      {!campaigns.isLoading && !campaigns.data?.length ? (
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
            <Megaphone className="size-5" />
          </div>

          <h2
            className="
              display-heading

              mt-5

              text-4xl
            "
          >
            No campaigns available.
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
            Create a campaign before reviewing contributions or publishing progress updates.
          </p>
        </section>
      ) : (
        <>
          {/* SUMMARY */}
          {selected ? (
            <section
              className="
                grid
                gap-4

                sm:grid-cols-3
              "
            >
              <SummaryCard label="Pending reviews" value={pendingCount} icon={Clock3} />

              <SummaryCard label="Approved credits" value={approvedCredits} icon={Coins} />

              <SummaryCard label="Supporters" value={supporterCount} icon={UserRound} />
            </section>
          ) : null}

          {/* TABS */}
          <div
            className="
              grid
              grid-cols-2

              rounded-2xl

              border
              border-[var(--editorial-border)]

              bg-white/30

              p-1.5

              dark:bg-white/[0.025]
            "
          >
            <button
              type="button"
              onClick={() => setTab("contributions")}
              className={`
                flex
                items-center
                justify-center
                gap-2

                rounded-xl

                px-4
                py-3

                text-sm
                font-semibold

                transition-all
                duration-200

                ${
                  tab === "contributions"
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
              <UserRound className="size-4" />
              Contributions
            </button>

            <button
              type="button"
              onClick={() => setTab("updates")}
              className={`
                flex
                items-center
                justify-center
                gap-2

                rounded-xl

                px-4
                py-3

                text-sm
                font-semibold

                transition-all
                duration-200

                ${
                  tab === "updates"
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
              <Newspaper className="size-4" />
              Campaign updates
            </button>
          </div>

          {/* CONTRIBUTIONS */}
          {tab === "contributions" ? (
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
                  <p className="editorial-label">Support activity</p>

                  <h2
                    className="
                      display-heading

                      mt-1

                      text-3xl
                      leading-none
                    "
                  >
                    Contribution reviews
                  </h2>
                </div>

                {contributions.isFetching ? (
                  <LoaderCircle
                    className="
                      size-4
                      animate-spin

                      text-[var(--editorial-muted)]
                    "
                  />
                ) : null}
              </div>

              {contributions.isLoading ? (
                <ContributionSkeleton />
              ) : contributions.isError ? (
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
                    Contributions could not be loaded.
                  </p>

                  <button
                    type="button"
                    onClick={() => void contributions.refetch()}
                    className="
                      editorial-button

                      mt-5
                    "
                  >
                    <RefreshCw className="size-4" />
                    Try again
                  </button>
                </div>
              ) : contributions.data?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-[850px] w-full">
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
                        <th className="px-5 py-4">Supporter</th>

                        <th className="px-5 py-4">Credits</th>

                        <th className="px-5 py-4">Message</th>

                        <th className="px-5 py-4">Status</th>

                        <th className="px-5 py-4">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {contributions.data.map((contribution) => (
                        <tr
                          key={contribution.id}
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

                              <div className="min-w-0">
                                <p
                                  className="
                                      max-w-[220px]
                                      truncate

                                      text-sm
                                      font-semibold

                                      text-[var(--editorial-text)]
                                    "
                                >
                                  {contribution.supporter?.name ||
                                    contribution.supporterName ||
                                    "Supporter"}
                                </p>

                                <p
                                  className="
                                      mt-0.5
                                      max-w-[220px]
                                      truncate

                                      text-xs

                                      text-[var(--editorial-muted)]
                                    "
                                >
                                  {contribution.supporter?.email ||
                                    contribution.supporterEmail ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
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
                          </td>

                          <td
                            className="
                                max-w-xs

                                px-5
                                py-4

                                text-sm
                                leading-6

                                text-[var(--editorial-text-soft)]
                              "
                          >
                            {contribution.message || "—"}
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

                                  ${statusClass(contribution.status)}
                                `}
                            >
                              {contribution.status}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {contribution.status === "pending" ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  aria-label="Approve contribution"
                                  disabled={review.isPending}
                                  onClick={() =>
                                    review.mutate({
                                      id: contribution.id,
                                      action: "approve"
                                    })
                                  }
                                  className="
                                      flex
                                      size-9
                                      items-center
                                      justify-center

                                      rounded-full

                                      bg-[#20352d]

                                      text-white

                                      transition-all

                                      hover:-translate-y-0.5
                                      hover:bg-[#2f4d41]

                                      disabled:cursor-not-allowed
                                      disabled:opacity-50

                                      dark:bg-[#d6e3dd]
                                      dark:text-[#10261f]
                                    "
                                >
                                  <Check className="size-4" />
                                </button>

                                <button
                                  type="button"
                                  aria-label="Reject contribution"
                                  disabled={review.isPending}
                                  onClick={() =>
                                    review.mutate({
                                      id: contribution.id,
                                      action: "reject"
                                    })
                                  }
                                  className="
                                      flex
                                      size-9
                                      items-center
                                      justify-center

                                      rounded-full

                                      border
                                      border-red-500/20

                                      bg-red-50

                                      text-red-600

                                      transition-all

                                      hover:-translate-y-0.5
                                      hover:bg-red-600
                                      hover:text-white

                                      disabled:cursor-not-allowed
                                      disabled:opacity-50

                                      dark:bg-red-400/[0.07]
                                      dark:text-red-300
                                    "
                                >
                                  <X className="size-4" />
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
                    <MessageSquareText className="size-5" />
                  </div>

                  <h3
                    className="
                      display-heading

                      mt-4

                      text-4xl
                    "
                  >
                    No contributions yet.
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
                    Supporter contributions for this campaign will appear here.
                  </p>
                </div>
              )}
            </section>
          ) : (
            /* UPDATES */
            <div
              className="
                grid
                gap-5

                xl:grid-cols-[390px_1fr]
              "
            >
              {/* PUBLISH FORM */}
              <motion.form
                initial={{
                  opacity: 0,
                  y: 14
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                onSubmit={(event) => {
                  event.preventDefault();

                  publish.mutate();
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
                    size-10
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]
                  "
                >
                  <Newspaper className="size-[17px]" />
                </div>

                <p className="editorial-label mt-5">Campaign communication</p>

                <h2
                  className="
                    display-heading

                    mt-1.5

                    text-3xl
                    leading-none
                  "
                >
                  Publish an update
                </h2>

                <p
                  className="
                    mt-2

                    text-xs
                    leading-5

                    text-[var(--editorial-muted)]
                  "
                >
                  Share progress, milestones or important information with supporters.
                </p>

                <div className="mt-5">
                  <label className={labelClass} htmlFor="update-title">
                    Title
                  </label>

                  <input
                    id="update-title"
                    className={fieldClass}
                    placeholder="Update title"
                    value={update.title}
                    onChange={(event) =>
                      setUpdate({
                        ...update,
                        title: event.target.value
                      })
                    }
                    required
                    minLength={3}
                  />
                </div>

                <div className="mt-4">
                  <label className={labelClass} htmlFor="update-content">
                    Content
                  </label>

                  <textarea
                    id="update-content"
                    className={`
                      ${fieldClass}
                      min-h-[170px]
                      resize-y
                    `}
                    placeholder="Describe the latest campaign progress..."
                    rows={7}
                    value={update.content}
                    onChange={(event) =>
                      setUpdate({
                        ...update,
                        content: event.target.value
                      })
                    }
                    required
                    minLength={10}
                  />
                </div>

                <button
                  type="submit"
                  disabled={publish.isPending || !selected}
                  className="
                    editorial-button

                    mt-5
                    w-full

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {publish.isPending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Publish update
                    </>
                  )}
                </button>
              </motion.form>

              {/* PUBLISHED UPDATES */}
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
                    <p className="editorial-label">Timeline</p>

                    <h2
                      className="
                        display-heading

                        mt-1

                        text-3xl
                        leading-none
                      "
                    >
                      Published updates
                    </h2>
                  </div>

                  <span
                    className="
                      text-xs

                      text-[var(--editorial-muted)]
                    "
                  >
                    {updates.data?.length ?? 0} updates
                  </span>
                </div>

                {updates.isLoading ? (
                  <div className="space-y-4 p-5">
                    {Array.from({
                      length: 3
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="
                          h-32
                          animate-pulse

                          rounded-2xl

                          bg-[#c2ccc8]/55

                          dark:bg-[#17231e]
                        "
                      />
                    ))}
                  </div>
                ) : updates.data?.length ? (
                  <div
                    className="
                      divide-y
                      divide-[var(--editorial-border)]
                    "
                  >
                    {updates.data.map((item, index) => (
                      <motion.article
                        key={item.id}
                        initial={{
                          opacity: 0,
                          y: 12
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          duration: 0.35,
                          delay: index * 0.04
                        }}
                        className="
                            group

                            relative

                            p-5

                            transition-colors

                            hover:bg-white/20

                            dark:hover:bg-white/[0.02]
                          "
                      >
                        <div
                          className="
                              flex
                              items-start
                              gap-4
                            "
                        >
                          <div
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
                            <Newspaper className="size-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                  flex
                                  flex-col
                                  gap-2

                                  sm:flex-row
                                  sm:items-start
                                  sm:justify-between
                                "
                            >
                              <h3
                                className="
                                    display-heading

                                    text-[1.7rem]
                                    leading-none

                                    text-[var(--editorial-text)]
                                  "
                              >
                                {item.title}
                              </h3>

                              <time
                                className="
                                    shrink-0

                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]

                                    text-[var(--editorial-muted)]
                                  "
                              >
                                {new Date(item.createdAt).toLocaleDateString()}
                              </time>
                            </div>

                            <p
                              className="
                                  mt-3

                                  whitespace-pre-wrap

                                  text-sm
                                  leading-6

                                  text-[var(--editorial-text-soft)]
                                "
                            >
                              {item.content}
                            </p>
                          </div>
                        </div>
                      </motion.article>
                    ))}
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
                      <Newspaper className="size-5" />
                    </div>

                    <h3
                      className="
                        display-heading

                        mt-4

                        text-4xl
                      "
                    >
                      No updates published.
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
                      Publish the first progress update for this campaign.
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </>
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

function ContributionSkeleton() {
  return (
    <div className="space-y-2 p-5">
      {Array.from({
        length: 5
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
