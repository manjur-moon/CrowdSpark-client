import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Coins, Flag, MapPin, Share2, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import type { Campaign } from "../types";

export default function CampaignDetailsPage() {
  const { campaignId = "" } = useParams();
  const { current, sessionUser } = useAuth();
  const navigate = useNavigate();
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
          data: Array<{ id: string; title: string; content: string; createdAt: string }>;
        }>(`/campaigns/${campaignId}/updates`)
      ).data.data
  });
  const contribute = useMutation({
    mutationFn: async () =>
      (
        await api.post(
          "/contributions",
          { campaignId, credits: Number(credits), message: message.trim() || undefined },
          { headers: { "Idempotency-Key": crypto.randomUUID() } }
        )
      ).data,
    onSuccess: async () => {
      toast.success("Contribution submitted for Creator review");
      setCredits("");
      setMessage("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["current-user"] }),
        queryClient.invalidateQueries({ queryKey: ["supporter-contributions"] })
      ]);
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });
  const report = useMutation({
    mutationFn: async () => {
      const reason = window.prompt("Why are you reporting this campaign?");
      if (!reason) throw new Error("Report cancelled");
      return (await api.post("/reports", { campaignId, reason, description: reason })).data;
    },
    onSuccess: () => toast.success("Report submitted for Admin review"),
    onError: (error) => {
      if (apiErrorMessage(error) !== "Report cancelled") toast.error(apiErrorMessage(error));
    }
  });

  if (campaign.isLoading)
    return (
      <div className="container-app py-20">
        <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  if (!campaign.data)
    return (
      <div className="container-app py-20">
        <div className="card p-12 text-center">
          <h1 className="text-2xl font-bold">Campaign not found</h1>
          <Link to="/campaigns" className="btn-primary mt-6">
            Browse campaigns
          </Link>
        </div>
      </div>
    );
  const c = campaign.data;
  const goal = c.fundingGoalCredits ?? c.goalCredits;
  const progress = Math.min(100, Math.round((c.raisedCredits / Math.max(1, goal)) * 100));
  const days = Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86400000));

  return (
    <main className="container-app py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <section>
          <img
            src={c.coverImageUrl}
            alt={c.title}
            className="h-[420px] w-full rounded-3xl object-cover"
          />
          {c.gallery?.length ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {c.gallery.map((image) => (
                <img
                  key={image}
                  src={image}
                  alt="Campaign"
                  className="h-32 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          ) : null}
          <div className="mt-8">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
              {c.category}
            </span>
            <h1 className="mt-4 text-4xl font-black leading-tight">{c.title}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{c.description}</p>
          </div>
          <div className="mt-8 card p-7">
            <h2 className="text-2xl font-bold">Campaign story</h2>
            <p className="mt-4 whitespace-pre-wrap leading-8 text-slate-700">{c.story}</p>
            {c.rewardInfo ? (
              <>
                <h3 className="mt-7 font-bold">Supporter reward</h3>
                <p className="mt-2 text-slate-600">{c.rewardInfo}</p>
              </>
            ) : null}
          </div>
          <div className="mt-8 card p-7">
            <h2 className="text-2xl font-bold">Campaign updates</h2>
            <div className="mt-5 space-y-4">
              {updates.data?.length ? (
                updates.data.map((u) => (
                  <article key={u.id} className="rounded-xl border border-slate-200 p-5">
                    <h3 className="font-bold">{u.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {u.content}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(u.createdAt).toLocaleString()}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-slate-500">No updates published yet.</p>
              )}
            </div>
          </div>
        </section>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black">{c.raisedCredits.toLocaleString()}</span>
              <span className="text-sm text-slate-500">of {goal.toLocaleString()} credits</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <Coins className="mx-auto size-5 text-emerald-600" />
                <p className="mt-1 text-sm font-bold">{progress}%</p>
              </div>
              <div>
                <Users className="mx-auto size-5 text-emerald-600" />
                <p className="mt-1 text-sm font-bold">{c.supporterCount ?? 0}</p>
              </div>
              <div>
                <CalendarDays className="mx-auto size-5 text-emerald-600" />
                <p className="mt-1 text-sm font-bold">{days} days</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="size-4" />
              {c.location}
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Creator</p>
              <p className="mt-1 font-bold">{c.creator?.name ?? c.creatorName}</p>
            </div>
            {current?.profile?.role === "supporter" ? (
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  contribute.mutate();
                }}
              >
                <div>
                  <label className="label">Contribution credits</label>
                  <input
                    className="field"
                    type="number"
                    min={c.minimumContribution}
                    max={current.profile.credits}
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Message (optional)</label>
                  <textarea
                    className="field"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Available balance: {current.profile.credits} credits. Minimum:{" "}
                  {c.minimumContribution}.
                </p>
                <button className="btn-primary w-full" disabled={contribute.isPending}>
                  {contribute.isPending ? "Submitting..." : "Support this campaign"}
                </button>
              </form>
            ) : (
              <button
                className="btn-primary mt-6 w-full"
                onClick={() =>
                  sessionUser
                    ? navigate("/dashboard")
                    : navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
                }
              >
                {sessionUser ? "Open dashboard" : "Sign in to contribute"}
              </button>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="btn-secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(location.href);
                  toast.success("Campaign link copied");
                }}
              >
                <Share2 className="size-4" />
                Share
              </button>
              {sessionUser && current?.profile?.role !== "admin" ? (
                <button className="btn-secondary text-red-600" onClick={() => report.mutate()}>
                  <Flag className="size-4" />
                  Report
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
