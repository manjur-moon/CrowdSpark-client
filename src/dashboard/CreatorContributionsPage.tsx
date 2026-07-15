import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Newspaper, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import type { Campaign, Contribution } from "../types";

export default function CreatorContributionsPage() {
  const qc = useQueryClient();
  const [campaignId, setCampaignId] = useState("");
  const [tab, setTab] = useState<"contributions" | "updates">("contributions");
  const [update, setUpdate] = useState({ title: "", content: "" });
  const campaigns = useQuery({
    queryKey: ["creator-campaign-options"],
    queryFn: async () => (await api.get<{ data: Campaign[] }>("/creator/campaigns")).data.data
  });
  const selected = campaignId || campaigns.data?.[0]?.id || campaigns.data?.[0]?._id || "";
  const contributions = useQuery({
    queryKey: ["creator-contributions", selected],
    queryFn: async () =>
      (
        await api.get<{ data: Contribution[] }>("/creator/contributions", {
          params: { campaignId: selected, limit: 50 }
        })
      ).data.data,
    enabled: Boolean(selected)
  });
  const updates = useQuery({
    queryKey: ["creator-updates", selected],
    queryFn: async () =>
      (
        await api.get<{
          data: Array<{ id: string; title: string; content: string; createdAt: string }>;
        }>(`/creator/campaigns/${selected}/updates`)
      ).data.data,
    enabled: Boolean(selected) && tab === "updates"
  });
  const review = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "approve" | "reject" }) => {
      const reviewNote =
        action === "reject" ? prompt("Rejection reason (minimum 10 characters)") || "" : undefined;
      return api.post(`/creator/contributions/${id}/${action}`, reviewNote ? { reviewNote } : {}, {
        headers: { "Idempotency-Key": crypto.randomUUID() }
      });
    },
    onSuccess: async () => {
      toast.success("Contribution reviewed");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["creator-contributions"] }),
        qc.invalidateQueries({ queryKey: ["current-user"] })
      ]);
    },
    onError: (e) => toast.error(apiErrorMessage(e))
  });
  const publish = useMutation({
    mutationFn: () => api.post(`/creator/campaigns/${selected}/updates`, update),
    onSuccess: async () => {
      toast.success("Update published");
      setUpdate({ title: "", content: "" });
      await qc.invalidateQueries({ queryKey: ["creator-updates"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e))
  });
  return (
    <main className="space-y-6">
      <header>
        <p className="font-bold text-emerald-700">CREATOR</p>
        <h1 className="mt-2 text-3xl font-black">Contributions and updates</h1>
      </header>
      <div className="card p-5">
        <label className="label">Campaign</label>
        <select
          className="field max-w-xl"
          value={selected}
          onChange={(e) => setCampaignId(e.target.value)}
        >
          {campaigns.data?.map((c) => (
            <option key={c.id || c._id} value={c.id || c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="flex rounded-xl bg-white p-1">
        <button
          className={`flex-1 rounded-lg p-3 font-bold ${tab === "contributions" ? "bg-emerald-600 text-white" : ""}`}
          onClick={() => setTab("contributions")}
        >
          Contributions
        </button>
        <button
          className={`flex-1 rounded-lg p-3 font-bold ${tab === "updates" ? "bg-emerald-600 text-white" : ""}`}
          onClick={() => setTab("updates")}
        >
          Campaign updates
        </button>
      </div>
      {tab === "contributions" ? (
        <div className="card overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Supporter</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.data?.map((c) => (
                <tr className="border-t" key={c.id}>
                  <td className="p-4">
                    <p className="font-bold">{c.supporter?.name || c.supporterName}</p>
                    <p className="text-xs text-slate-500">
                      {c.supporter?.email || c.supporterEmail}
                    </p>
                  </td>
                  <td className="p-4 font-bold">{c.credits}</td>
                  <td className="max-w-xs p-4 text-sm text-slate-600">{c.message || "—"}</td>
                  <td className="p-4 capitalize">{c.status}</td>
                  <td className="p-4">
                    {c.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg bg-emerald-600 p-2 text-white"
                          onClick={() => review.mutate({ id: c.id, action: "approve" })}
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          className="rounded-lg bg-red-600 p-2 text-white"
                          onClick={() => review.mutate({ id: c.id, action: "reject" })}
                        >
                          <X className="size-4" />
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
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              publish.mutate();
            }}
            className="card space-y-4 p-6"
          >
            <Newspaper className="size-8 text-emerald-600" />
            <h2 className="text-xl font-bold">Publish progress update</h2>
            <div>
              <label className="label">Title</label>
              <input
                className="field"
                value={update.title}
                onChange={(e) => setUpdate({ ...update, title: e.target.value })}
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="label">Content</label>
              <textarea
                className="field"
                rows={7}
                value={update.content}
                onChange={(e) => setUpdate({ ...update, content: e.target.value })}
                required
                minLength={10}
              />
            </div>
            <button className="btn-primary w-full">Publish update</button>
          </form>
          <section className="card p-6">
            <h2 className="text-xl font-bold">Published updates</h2>
            <div className="mt-5 space-y-4">
              {updates.data?.map((u) => (
                <article key={u.id} className="rounded-xl border p-5">
                  <h3 className="font-bold">{u.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {u.content}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
