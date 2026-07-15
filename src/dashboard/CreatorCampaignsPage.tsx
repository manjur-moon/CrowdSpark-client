import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ImageUploadField } from "../components/upload/ImageUploadField";
import { api, apiErrorMessage } from "../lib/api";
import type { Campaign } from "../types";

type CreatorCampaignsMode = "all" | "add" | "manage";

interface CampaignFormState {
  title: string;
  description: string;
  story: string;
  category: string;
  goalCredits: number;
  minimumContribution: number;
  deadline: string;
  rewardInfo: string;
  coverImageUrl: string;
  gallery: string[];
  location: string;
}

const createEmptyForm = (): CampaignFormState => ({
  title: "",
  description: "",
  story: "",
  category: "Technology",
  goalCredits: 1000,
  minimumContribution: 10,
  deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  rewardInfo: "",
  coverImageUrl: "",
  gallery: [],
  location: "Global"
});

export default function CreatorCampaignsPage({ mode = "all" }: { mode?: CreatorCampaignsMode }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CampaignFormState>(createEmptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const showForm = mode !== "manage" || Boolean(editing);
  const showList = mode !== "add";

  const query = useQuery({
    queryKey: ["creator-campaigns"],
    queryFn: async () =>
      (await api.get<{ data: Campaign[] }>("/campaigns/mine", { params: { limit: 50 } })).data.data,
    enabled: showList
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.coverImageUrl) throw new Error("Upload a campaign cover image");
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        story: form.story.trim(),
        rewardInfo: form.rewardInfo.trim(),
        location: form.location.trim(),
        goalCredits: Number(form.goalCredits),
        minimumContribution: Number(form.minimumContribution),
        deadline: new Date(form.deadline).toISOString()
      };
      return editing
        ? api.patch(`/campaigns/${editing}`, payload)
        : api.post("/campaigns", payload);
    },
    onSuccess: async () => {
      toast.success(
        editing ? "Campaign updated and resubmitted" : "Campaign submitted for Admin review"
      );
      setForm(createEmptyForm());
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["creator-campaigns"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: async () => {
      toast.success("Campaign removed or archived and eligible refunds were processed");
      await queryClient.invalidateQueries({ queryKey: ["creator-campaigns"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const edit = (campaign: Campaign) => {
    setEditing(campaign.id || campaign._id || "");
    setForm({
      title: campaign.title,
      description: campaign.description,
      story: campaign.story,
      category: campaign.category,
      goalCredits: campaign.goalCredits,
      minimumContribution: campaign.minimumContribution,
      deadline: new Date(campaign.deadline).toISOString().slice(0, 10),
      rewardInfo: campaign.rewardInfo || "",
      coverImageUrl: campaign.coverImageUrl,
      gallery: campaign.gallery ?? [],
      location: campaign.location || "Global"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="space-y-7">
      <header>
        <p className="font-bold text-emerald-700">CREATOR</p>
        <h1 className="mt-2 text-3xl font-black">
          {mode === "add"
            ? "Add a new campaign"
            : mode === "manage"
              ? "My campaigns"
              : "Campaign management"}
        </h1>
        <p className="mt-2 text-slate-600">
          Create polished campaign submissions and manage only the campaigns owned by your account.
        </p>
      </header>

      {showForm ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
          className="card grid gap-5 p-6 lg:grid-cols-2"
        >
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold">
              {editing ? "Edit and resubmit campaign" : "Campaign information"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              New campaigns remain pending until an Admin approves them.
            </p>
          </div>

          <div>
            <label className="label">Campaign title</label>
            <input
              className="field"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
              minLength={5}
              maxLength={160}
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="field"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              {["Technology", "Education", "Health", "Community", "Art", "Environment"].map(
                (item) => (
                  <option key={item}>{item}</option>
                )
              )}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="label">Short description</label>
            <textarea
              className="field"
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
              minLength={10}
              maxLength={500}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Full campaign story</label>
            <textarea
              className="field"
              rows={7}
              value={form.story}
              onChange={(event) => setForm({ ...form, story: event.target.value })}
              required
              minLength={30}
              maxLength={10000}
            />
          </div>
          <div>
            <label className="label">Funding goal (credits)</label>
            <input
              className="field"
              type="number"
              min={100}
              step={1}
              value={form.goalCredits}
              onChange={(event) => setForm({ ...form, goalCredits: Number(event.target.value) })}
            />
          </div>
          <div>
            <label className="label">Minimum contribution</label>
            <input
              className="field"
              type="number"
              min={1}
              step={1}
              value={form.minimumContribution}
              onChange={(event) =>
                setForm({ ...form, minimumContribution: Number(event.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input
              className="field"
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              value={form.deadline}
              onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              className="field"
              value={form.location}
              onChange={(event) => setForm({ ...form, location: event.target.value })}
              maxLength={120}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Reward information</label>
            <textarea
              className="field"
              rows={4}
              value={form.rewardInfo}
              onChange={(event) => setForm({ ...form, rewardInfo: event.target.value })}
              maxLength={1000}
            />
          </div>

          <div className="lg:col-span-2 grid gap-6 xl:grid-cols-2">
            <ImageUploadField
              label="Campaign cover image"
              value={form.coverImageUrl ? [form.coverImageUrl] : []}
              onChange={(urls) => setForm({ ...form, coverImageUrl: urls[0] ?? "" })}
              maxFiles={1}
              disabled={save.isPending}
            />
            <ImageUploadField
              label="Gallery images (optional)"
              value={form.gallery}
              onChange={(urls) => setForm({ ...form, gallery: urls })}
              maxFiles={6}
              helperText="Upload up to 6 JPEG, PNG or WebP images. Maximum 3 MB each."
              disabled={save.isPending}
            />
          </div>

          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <button className="btn-primary" disabled={save.isPending}>
              <Plus className="size-4" />
              {save.isPending ? "Saving..." : editing ? "Save and resubmit" : "Submit campaign"}
            </button>
            {editing ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditing(null);
                  setForm(createEmptyForm());
                }}
              >
                Cancel editing
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {showList ? (
        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Campaigns</h2>
            <Link className="btn-primary" to="/dashboard/creator/campaigns/add">
              <Plus className="size-4" /> Add campaign
            </Link>
          </div>
          {query.isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : query.data?.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {query.data.map((campaign) => (
                <article
                  key={campaign.id || campaign._id}
                  className="card flex h-full flex-col overflow-hidden"
                >
                  <img
                    src={campaign.coverImageUrl}
                    alt={campaign.title}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-bold">{campaign.title}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold capitalize">
                        {campaign.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {campaign.raisedCredits.toLocaleString()} /{" "}
                      {campaign.goalCredits.toLocaleString()} credits
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                    {campaign.rejectionReason ? (
                      <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                        {campaign.rejectionReason}
                      </p>
                    ) : null}
                    {campaign.moderationReason ? (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                        {campaign.moderationReason}
                      </p>
                    ) : null}
                    <div className="mt-auto flex gap-2 pt-5">
                      <Link
                        className="btn-secondary px-3"
                        to={`/campaigns/${campaign.id || campaign._id}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                      <button
                        className="btn-secondary flex-1"
                        disabled={!["draft", "pending", "rejected"].includes(campaign.status)}
                        onClick={() => edit(campaign)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </button>
                      <button
                        className="btn-secondary px-3 text-red-600"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Delete or archive this campaign and refund eligible contributions?"
                            )
                          )
                            remove.mutate(campaign.id || campaign._id || "");
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center">
              <h3 className="font-bold">No campaigns yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create your first campaign to begin the Admin review process.
              </p>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
