import { CalendarDays, Coins, Flag, MapPin, Share2, Users } from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";

import { Link, useNavigate, useParams, useLocation } from "react-router-dom";

import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

import { useAuth } from "../lib/AuthContext";

import type { Campaign } from "../types";

export default function CampaignDetailsPage() {
  const { campaignId = "" } = useParams();

  const { current, sessionUser } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const [credits, setCredits] = useState("");

  const [message, setMessage] = useState("");

  const campaign = useQuery({
    queryKey: ["campaign", campaignId],

    queryFn: async () => (await api.get<{ data: Campaign }>(`/campaigns/${campaignId}`)).data.data
  });

  const updates = useQuery({
    queryKey: ["campaign-updates", campaignId],

    queryFn: async () =>
      (
        await api.get<{
          data: Array<{
            id: string;
            title: string;
            content: string;
            createdAt: string;
          }>;
        }>(`/campaigns/${campaignId}/updates`)
      ).data.data
  });

  const contribute = useMutation({
    mutationFn: async () =>
      (
        await api.post(
          "/contributions",
          {
            campaignId,
            credits: Number(credits),
            message: message.trim() || undefined
          },
          {
            headers: {
              "Idempotency-Key": crypto.randomUUID()
            }
          }
        )
      ).data,

    onSuccess: async () => {
      toast.success("Contribution submitted for Creator review");

      setCredits("");

      setMessage("");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["current-user"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["supporter-contributions"]
        })
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const report = useMutation({
    mutationFn: async () => {
      const reason = window.prompt("Why are you reporting this campaign?");

      if (!reason) throw new Error("Report cancelled");

      return (
        await api.post("/reports", {
          campaignId,
          reason,
          description: reason
        })
      ).data;
    },

    onSuccess: () => {
      toast.success("Report submitted for Admin review");
    },

    onError: (error) => {
      if (apiErrorMessage(error) !== "Report cancelled") {
        toast.error(apiErrorMessage(error));
      }
    }
  });

  if (campaign.isLoading)
    return (
      <main className="campaign-page min-h-screen py-20">
        <div className="container-app">
          <div
            className="
          h-[600px]
          rounded-[28px]
          bg-[#e7ecef]
          animate-pulse
          "
          />
        </div>
      </main>
    );

  if (!campaign.data)
    return (
      <main className="campaign-page min-h-screen py-20">
        <div className="container-app">
          <div
            className="
          campaign-surface
          p-12
          text-center
          "
          >
            <h1
              className="
            editorial-title
            text-5xl
            "
            >
              Campaign not found
            </h1>

            <Link
              to="/campaigns"
              className="
            editorial-button
            mt-8
            "
            >
              Browse campaigns
            </Link>
          </div>
        </div>
      </main>
    );

  const c = campaign.data;

  const goal = c.fundingGoalCredits ?? c.goalCredits;

  const progress = Math.min(100, Math.round((c.raisedCredits / Math.max(1, goal)) * 100));

  const days = Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000));

  return (
    <main
      className="
      campaign-page
      min-h-screen
      py-12
      "
    >
      <div
        className="
        container-app
        "
      >
        <div
          className="
          grid
          gap-10
          lg:grid-cols-[1fr_400px]
          "
        >
          <section>
            <img
              src={c.coverImageUrl}

              alt={c.title}

              className="
              h-[460px]
              w-full
              rounded-[30px]
              object-cover
              shadow-xl
              "
            />

            {c.gallery?.length ? (
              <div
                className="
                mt-5
                grid
                grid-cols-3
                gap-4
                "
              >
                {c.gallery.map((image) => (
                  <img
                    key={image}

                    src={image}

                    alt="Campaign"

                    className="
                  h-36
                  w-full
                  rounded-2xl
                  object-cover
                  "
                  />
                ))}
              </div>
            ) : null}

            <div
              className="
              mt-10
              "
            >
              <span
                className="
                editorial-label
                "
              >
                {c.category}
              </span>

              <h1
                className="
                editorial-title
                mt-5
                text-6xl
                leading-none
                "
              >
                {c.title}
              </h1>

              <p
                className="
                mt-6
                max-w-3xl
                text-lg
                leading-8
                text-secondary-app
                "
              >
                {c.description}
              </p>
            </div>
            <div
              className="
              campaign-surface
              mt-10
              p-8
              "
            >
              <h2
                className="
                editorial-title
                text-4xl
                "
              >
                Campaign story
              </h2>

              <p
                className="
                mt-5
                whitespace-pre-wrap
                leading-8
                text-secondary-app
                "
              >
                {c.story}
              </p>

              {c.rewardInfo ? (
                <>
                  <h3
                    className="
                    mt-8
                    text-xl
                    font-bold
                    "
                  >
                    Supporter reward
                  </h3>

                  <p
                    className="
                    mt-3
                    text-secondary-app
                    "
                  >
                    {c.rewardInfo}
                  </p>
                </>
              ) : null}
            </div>

            <div
              className="
              campaign-surface
              mt-8
              p-8
              "
            >
              <h2
                className="
                editorial-title
                text-4xl
                "
              >
                Campaign updates
              </h2>

              <div
                className="
                mt-6
                space-y-5
                "
              >
                {updates.data?.length ? (
                  updates.data.map((u) => (
                    <article
                      key={u.id}

                      className="
                      rounded-2xl
                      border
                      border-[var(--editorial-border)]
                      p-6
                      "
                    >
                      <h3
                        className="
                        text-xl
                        font-bold
                        "
                      >
                        {u.title}
                      </h3>

                      <p
                        className="
                        mt-3
                        leading-7
                        text-secondary-app
                        "
                      >
                        {u.content}
                      </p>

                      <p
                        className="
                        mt-4
                        text-xs
                        text-muted-app
                        "
                      >
                        {new Date(u.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-muted-app">No updates published yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}

          <aside
            className="
            lg:sticky
            lg:top-24
            lg:self-start
            "
          >
            <div
              className="
              campaign-surface
              p-7
              "
            >
              <div
                className="
                flex
                items-center
                justify-between
                "
              >
                <span
                  className="
                  text-4xl
                  font-light
                  tracking-tight
                  "
                >
                  {c.raisedCredits.toLocaleString()}
                </span>

                <span
                  className="
                  text-sm
                  text-muted-app
                  "
                >
                  of {goal.toLocaleString()}
                </span>
              </div>

              {/* Progress */}

              <div
                className="
                mt-6
                h-3
                overflow-hidden
                rounded-full
                bg-[#cbd4d7]
                dark:bg-[#26332e]
                "
              >
                <div
                  className="
                  h-full
                  rounded-full
                  bg-[#20352d]
                  dark:bg-[#d6e3dd]
                  "
                  style={{
                    width: `${progress}%`
                  }}
                />
              </div>

              <div
                className="
                mt-7
                grid
                grid-cols-3
                gap-4
                text-center
                "
              >
                <div>
                  <Coins
                    className="
                    mx-auto
                    size-5
                    text-[#20352d]
                    dark:text-[#d6e3dd]
                    "
                  />

                  <p className="mt-2 font-bold">{progress}%</p>
                </div>

                <div>
                  <Users
                    className="
                    mx-auto
                    size-5
                    text-[#20352d]
                    dark:text-[#d6e3dd]
                    "
                  />

                  <p className="mt-2 font-bold">{c.supporterCount ?? 0}</p>
                </div>

                <div>
                  <CalendarDays
                    className="
                    mx-auto
                    size-5
                    text-[#20352d]
                    dark:text-[#d6e3dd]
                    "
                  />

                  <p className="mt-2 font-bold">{days} days</p>
                </div>
              </div>

              <div
                className="
                mt-6
                flex
                items-center
                gap-2
                text-sm
                text-secondary-app
                "
              >
                <MapPin className="size-4" />

                {c.location}
              </div>

              <div
                className="
                mt-6
                rounded-2xl
                bg-[#d1d8dc]
                p-5
                dark:bg-[#202b27]
                "
              >
                <p
                  className="
                  editorial-label
                  "
                >
                  Creator
                </p>

                <p
                  className="
                  mt-2
                  font-bold
                  "
                >
                  {c.creator?.name ?? c.creatorName}
                </p>
              </div>
              {current?.profile?.role === "supporter" ? (
                <form
                  className="
                  mt-7
                  space-y-5
                  "

                  onSubmit={(e) => {
                    e.preventDefault();

                    contribute.mutate();
                  }}
                >
                  <div>
                    <label className="label">Contribution credits</label>

                    <input
                      className="campaign-field"

                      type="number"

                      min={c.minimumContribution}

                      max={current.profile.credits}

                      value={credits}

                      onChange={(e) => setCredits(e.target.value)}

                      required
                    />
                  </div>

                  <div>
                    <label className="label">Message</label>

                    <textarea
                      className="campaign-field"

                      rows={4}

                      value={message}

                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <p
                    className="
                    text-xs
                    text-muted-app
                    "
                  >
                    Available balance: {current.profile.credits} credits
                  </p>

                  <button
                    className="
                    editorial-button
                    w-full
                    "

                    disabled={contribute.isPending}
                  >
                    {contribute.isPending ? "Submitting..." : "Support this campaign"}
                  </button>
                </form>
              ) : (
                <button
                  className="
    editorial-button
    mt-7
    w-full
  "
                  onClick={() => {
                    if (sessionUser) {
                      navigate("/dashboard");
                    } else {
                      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                    }
                  }}
                >
                  {sessionUser ? "Open dashboard" : "Sign in to contribute"}
                </button>
              )}
              <div
                className="
                mt-5
                grid
                grid-cols-2
                gap-3
                "
              >
                <button
                  className="
                  btn-secondary
                  "

                  onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href);

                    toast.success("Campaign link copied");
                  }}
                >
                  <Share2 className="size-4" />
                  Share
                </button>

                {sessionUser && current?.profile?.role !== "admin" ? (
                  <button
                    className="
                    btn-secondary
                    text-red-600
                    "

                    onClick={() => report.mutate()}
                  >
                    <Flag className="size-4" />
                    Report
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
