import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Eye,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Plus,
  Rocket,
  Target,
  Trash2,
  X
} from "lucide-react";

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

const categories = ["Technology", "Education", "Health", "Community", "Art", "Environment"];

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
    case "active":
    case "approved":
      return `
        border-[#7d9c8e]/40
        bg-[#d8e6df]
        text-[#24483a]

        dark:border-[#6d9281]/30
        dark:bg-[#1e3a2f]
        dark:text-[#c7ddd2]
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

    case "draft":
      return `
        border-[#9aa8a2]/40
        bg-white/45
        text-[#53635b]

        dark:border-white/10
        dark:bg-white/[0.05]
        dark:text-[#aebfb7]
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

export default function CreatorCampaignsPage({ mode = "all" }: { mode?: CreatorCampaignsMode }) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CampaignFormState>(createEmptyForm);

  const [editing, setEditing] = useState<string | null>(null);

  const showForm = mode !== "manage" || Boolean(editing);

  const showList = mode !== "add";

  const query = useQuery({
    queryKey: ["creator-campaigns"],

    queryFn: async () =>
      (
        await api.get<{
          data: Campaign[];
        }>("/campaigns/mine", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: showList
  });

  const save = useMutation({
    mutationFn: async () => {
      if (!form.coverImageUrl) {
        throw new Error("Upload a campaign cover image");
      }

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

      await queryClient.invalidateQueries({
        queryKey: ["creator-campaigns"]
      });
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),

    onSuccess: async () => {
      toast.success("Campaign removed or archived and eligible refunds were processed");

      await queryClient.invalidateQueries({
        queryKey: ["creator-campaigns"]
      });
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

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const cancelEditing = () => {
    setEditing(null);
    setForm(createEmptyForm());
  };

  const pageTitle =
    mode === "add"
      ? "Add a new campaign"
      : mode === "manage"
        ? "My campaigns"
        : "Campaign management";

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
      {/* PAGE HERO */}
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
              Create polished campaign submissions and manage only the campaigns owned by your
              account.
            </p>
          </div>

          {showList ? (
            <Link
              to="/dashboard/creator/campaigns/add"
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
              <Plus className="size-4" />
              New campaign
            </Link>
          ) : null}
        </div>
      </section>

      {/* FORM */}
      {showForm ? (
        <motion.form
          initial={{
            opacity: 0,
            y: 18
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1]
          }}
          onSubmit={(event) => {
            event.preventDefault();

            save.mutate();
          }}
          className="
            campaign-surface

            relative
            overflow-hidden

            p-5

            sm:p-6
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

              bg-[#78988a]/8

              blur-3xl

              dark:bg-[#78988a]/4
            "
          />

          <div className="relative">
            {/* FORM HEADER */}
            <div
              className="
                flex
                flex-col
                gap-4

                border-b
                border-[var(--editorial-border)]

                pb-5

                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div>
                <p className="editorial-label">
                  {editing ? "Edit campaign" : "Campaign submission"}
                </p>

                <h2
                  className="
                    display-heading

                    mt-1.5

                    text-3xl
                    leading-none

                    sm:text-4xl
                  "
                >
                  {editing ? "Edit and resubmit" : "Campaign information"}
                </h2>

                <p
                  className="
                    mt-2

                    text-xs
                    leading-5

                    text-[var(--editorial-muted)]
                  "
                >
                  New campaigns remain pending until an Admin approves them.
                </p>
              </div>

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
                <Rocket className="size-[17px]" />
              </div>
            </div>

            {/* BASIC INFORMATION */}
            <div
              className="
                mt-5

                grid
                gap-4

                lg:grid-cols-2
              "
            >
              <div>
                <label className={labelClass} htmlFor="campaign-title">
                  Campaign title
                </label>

                <input
                  id="campaign-title"
                  className={fieldClass}
                  placeholder="A clear campaign title"
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value
                    })
                  }
                  required
                  minLength={5}
                  maxLength={160}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="campaign-category">
                  Category
                </label>

                <select
                  id="campaign-category"
                  className={fieldClass}
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value
                    })
                  }
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className={labelClass} htmlFor="campaign-description">
                  Short description
                </label>

                <textarea
                  id="campaign-description"
                  className={`
                    ${fieldClass}
                    min-h-[90px]
                    resize-y
                  `}
                  placeholder="Summarize the campaign in a few sentences..."
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value
                    })
                  }
                  required
                  minLength={10}
                  maxLength={500}
                />
              </div>

              <div className="lg:col-span-2">
                <label className={labelClass} htmlFor="campaign-story">
                  Full campaign story
                </label>

                <textarea
                  id="campaign-story"
                  className={`
                    ${fieldClass}
                    min-h-[190px]
                    resize-y
                  `}
                  placeholder="Explain the idea, impact, plan and why people should support it..."
                  rows={7}
                  value={form.story}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      story: event.target.value
                    })
                  }
                  required
                  minLength={30}
                  maxLength={10000}
                />
              </div>
            </div>

            {/* FUNDING DETAILS */}
            <div
              className="
                mt-6

                border-t
                border-[var(--editorial-border)]

                pt-5
              "
            >
              <div
                className="
                  mb-4

                  flex
                  items-center
                  gap-2
                "
              >
                <Target
                  className="
                    size-4

                    text-[#527064]

                    dark:text-[#91aa9d]
                  "
                />

                <p className="editorial-label">Funding & logistics</p>
              </div>

              <div
                className="
                  grid
                  gap-4

                  sm:grid-cols-2
                  xl:grid-cols-4
                "
              >
                <div>
                  <label className={labelClass} htmlFor="campaign-goal">
                    Funding goal
                  </label>

                  <input
                    id="campaign-goal"
                    className={fieldClass}
                    type="number"
                    min={100}
                    step={1}
                    value={form.goalCredits}
                    onChange={(event) =>
                      setForm({
                        ...form,

                        goalCredits: Number(event.target.value)
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="minimum-contribution">
                    Minimum contribution
                  </label>

                  <input
                    id="minimum-contribution"
                    className={fieldClass}
                    type="number"
                    min={1}
                    step={1}
                    value={form.minimumContribution}
                    onChange={(event) =>
                      setForm({
                        ...form,

                        minimumContribution: Number(event.target.value)
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="campaign-deadline">
                    Deadline
                  </label>

                  <input
                    id="campaign-deadline"
                    className={fieldClass}
                    type="date"
                    min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                    value={form.deadline}
                    onChange={(event) =>
                      setForm({
                        ...form,

                        deadline: event.target.value
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="campaign-location">
                    Location
                  </label>

                  <input
                    id="campaign-location"
                    className={fieldClass}
                    value={form.location}
                    onChange={(event) =>
                      setForm({
                        ...form,

                        location: event.target.value
                      })
                    }
                    maxLength={120}
                  />
                </div>
              </div>
            </div>

            {/* REWARD */}
            <div className="mt-4">
              <label className={labelClass} htmlFor="reward-info">
                Reward information
              </label>

              <textarea
                id="reward-info"
                className={`
                  ${fieldClass}
                  min-h-[100px]
                  resize-y
                `}
                rows={4}
                placeholder="Optional rewards, acknowledgements or supporter benefits..."
                value={form.rewardInfo}
                onChange={(event) =>
                  setForm({
                    ...form,

                    rewardInfo: event.target.value
                  })
                }
                maxLength={1000}
              />
            </div>

            {/* MEDIA */}
            <div
              className="
                mt-6

                border-t
                border-[var(--editorial-border)]

                pt-5
              "
            >
              <div
                className="
                  mb-4

                  flex
                  items-center
                  gap-2
                "
              >
                <ImageIcon
                  className="
                    size-4

                    text-[#527064]

                    dark:text-[#91aa9d]
                  "
                />

                <p className="editorial-label">Campaign media</p>
              </div>

              <div
                className="
                  grid
                  gap-5

                  xl:grid-cols-2
                "
              >
                <ImageUploadField
                  label="Campaign cover image"
                  value={form.coverImageUrl ? [form.coverImageUrl] : []}
                  onChange={(urls) =>
                    setForm({
                      ...form,

                      coverImageUrl: urls[0] ?? ""
                    })
                  }
                  maxFiles={1}
                  disabled={save.isPending}
                />

                <ImageUploadField
                  label="Gallery images (optional)"
                  value={form.gallery}
                  onChange={(urls) =>
                    setForm({
                      ...form,
                      gallery: urls
                    })
                  }
                  maxFiles={6}
                  helperText="Upload up to 6 JPEG, PNG or WebP images. Maximum 3 MB each."
                  disabled={save.isPending}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div
              className="
                mt-6

                flex
                flex-wrap
                items-center
                gap-3

                border-t
                border-[var(--editorial-border)]

                pt-5
              "
            >
              <motion.button
                type="submit"
                disabled={save.isPending}
                whileHover={
                  save.isPending
                    ? undefined
                    : {
                        y: -1
                      }
                }
                whileTap={
                  save.isPending
                    ? undefined
                    : {
                        scale: 0.985
                      }
                }
                className="
                  editorial-button

                  min-w-[180px]

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {save.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : editing ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}

                {save.isPending ? "Saving..." : editing ? "Save & resubmit" : "Submit campaign"}
              </motion.button>

              {editing ? (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2

                    rounded-full

                    border
                    border-[var(--editorial-border)]

                    bg-transparent

                    px-5
                    py-3

                    text-sm
                    font-semibold

                    text-[var(--editorial-text-soft)]

                    transition

                    hover:bg-white/40
                    hover:text-[var(--editorial-text)]

                    dark:hover:bg-white/[0.05]
                  "
                >
                  <X className="size-4" />
                  Cancel editing
                </button>
              ) : null}
            </div>
          </div>
        </motion.form>
      ) : null}

      {/* CAMPAIGN LIST */}
      {showList ? (
        <section>
          <div
            className="
              mb-4

              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p className="editorial-label">Portfolio</p>

              <h2
                className="
                  display-heading

                  mt-1

                  text-3xl
                  leading-none
                "
              >
                Your campaigns
              </h2>
            </div>

            <p
              className="
                hidden

                text-xs

                text-[var(--editorial-muted)]

                sm:block
              "
            >
              {query.data?.length ?? 0} campaigns
            </p>
          </div>

          {query.isLoading ? (
            <div
              className="
                grid
                gap-4

                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {Array.from({
                length: 6
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                      h-[390px]
                      animate-pulse

                      rounded-[24px]

                      bg-[#c0cbc7]/55

                      dark:bg-[#17231e]
                    "
                />
              ))}
            </div>
          ) : query.data?.length ? (
            <div
              className="
                grid
                gap-4

                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {query.data.map((campaign, index) => {
                const campaignId = campaign.id || campaign._id;

                const progress = Math.min(
                  100,
                  Math.round((campaign.raisedCredits / Math.max(1, campaign.goalCredits)) * 100)
                );

                return (
                  <motion.article
                    key={campaignId}
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
                      delay: index * 0.04
                    }}
                    whileHover={{
                      y: -4
                    }}
                    className="
                        campaign-surface
                        group

                        flex
                        h-full
                        flex-col

                        overflow-hidden
                      "
                  >
                    {/* IMAGE */}
                    <div
                      className="
                          relative
                          aspect-[16/9]

                          overflow-hidden
                        "
                    >
                      <img
                        src={campaign.coverImageUrl}
                        alt={campaign.title}
                        className="
                            size-full
                            object-cover

                            transition-transform
                            duration-700

                            group-hover:scale-105
                          "
                      />

                      <div
                        className="
                            absolute
                            inset-0

                            bg-gradient-to-t

                            from-black/45
                            via-transparent
                            to-transparent
                          "
                      />

                      <span
                        className={`
                            absolute
                            right-3
                            top-3

                            rounded-full

                            border

                            px-3
                            py-1.5

                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]

                            backdrop-blur-xl

                            ${statusClass(campaign.status)}
                          `}
                      >
                        {campaign.status}
                      </span>
                    </div>

                    {/* BODY */}
                    <div
                      className="
                          flex
                          flex-1
                          flex-col

                          p-5
                        "
                    >
                      <p className="editorial-label">{campaign.category}</p>

                      <h3
                        className="
                            display-heading

                            mt-2

                            line-clamp-2

                            text-[2rem]
                            leading-[0.95]

                            text-[var(--editorial-text)]
                          "
                      >
                        {campaign.title}
                      </h3>

                      <div
                        className="
                            mt-4

                            flex
                            items-center
                            justify-between
                            gap-3

                            text-xs

                            text-[var(--editorial-muted)]
                          "
                      >
                        <span
                          className="
                              flex
                              items-center
                              gap-1.5
                            "
                        >
                          <Target className="size-3.5" />
                          {campaign.raisedCredits.toLocaleString()} /{" "}
                          {campaign.goalCredits.toLocaleString()}
                        </span>

                        <span>{progress}%</span>
                      </div>

                      {/* Progress */}
                      <div
                        className="
                            mt-2

                            h-1.5

                            overflow-hidden
                            rounded-full

                            bg-[#becbc5]

                            dark:bg-[#27372f]
                          "
                      >
                        <div
                          className="
                              h-full

                              rounded-full

                              bg-[#527064]

                              transition-all
                              duration-500

                              dark:bg-[#91aa9d]
                            "
                          style={{
                            width: `${progress}%`
                          }}
                        />
                      </div>

                      <div
                        className="
                            mt-4

                            flex
                            flex-wrap
                            gap-x-4
                            gap-y-2

                            text-xs

                            text-[var(--editorial-muted)]
                          "
                      >
                        <span
                          className="
                              flex
                              items-center
                              gap-1.5
                            "
                        >
                          <CalendarDays className="size-3.5" />

                          {new Date(campaign.deadline).toLocaleDateString()}
                        </span>

                        {campaign.location ? (
                          <span
                            className="
                                flex
                                items-center
                                gap-1.5
                              "
                          >
                            <MapPin className="size-3.5" />

                            {campaign.location}
                          </span>
                        ) : null}
                      </div>

                      {/* REJECTION */}
                      {campaign.rejectionReason ? (
                        <div
                          className="
                              mt-4

                              flex
                              items-start
                              gap-2

                              rounded-xl

                              border
                              border-red-500/15

                              bg-red-50

                              p-3

                              text-xs
                              leading-5

                              text-red-700

                              dark:border-red-400/15
                              dark:bg-red-400/[0.07]
                              dark:text-red-300
                            "
                        >
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />

                          <span>{campaign.rejectionReason}</span>
                        </div>
                      ) : null}

                      {/* MODERATION */}
                      {campaign.moderationReason ? (
                        <div
                          className="
                              mt-4

                              flex
                              items-start
                              gap-2

                              rounded-xl

                              border
                              border-amber-500/15

                              bg-amber-50

                              p-3

                              text-xs
                              leading-5

                              text-amber-800

                              dark:border-amber-400/15
                              dark:bg-amber-400/[0.07]
                              dark:text-amber-200
                            "
                        >
                          <AlertTriangle className="mt-0.5 size-4 shrink-0" />

                          <span>{campaign.moderationReason}</span>
                        </div>
                      ) : null}

                      {/* ACTIONS */}
                      <div
                        className="
                            mt-auto

                            flex
                            gap-2

                            pt-5
                          "
                      >
                        <Link
                          to={`/campaigns/${campaignId}`}
                          aria-label="View campaign"
                          className="
                              flex
                              size-10
                              shrink-0
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
                          <Eye className="size-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={!["draft", "pending", "rejected"].includes(campaign.status)}
                          onClick={() => edit(campaign)}
                          className="
                              flex
                              min-h-10
                              flex-1
                              items-center
                              justify-center
                              gap-2

                              rounded-full

                              border
                              border-[var(--editorial-border)]

                              px-4

                              text-sm
                              font-semibold

                              text-[var(--editorial-text-soft)]

                              transition-all

                              hover:bg-[#20352d]
                              hover:text-white

                              disabled:cursor-not-allowed
                              disabled:opacity-35

                              dark:hover:bg-[#d6e3dd]
                              dark:hover:text-[#10261f]
                            "
                        >
                          <Edit3 className="size-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          aria-label="Delete campaign"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Delete or archive this campaign and refund eligible contributions?"
                              )
                            ) {
                              remove.mutate(campaignId || "");
                            }
                          }}
                          className="
                              flex
                              size-10
                              shrink-0
                              items-center
                              justify-center

                              rounded-full

                              border
                              border-red-500/15

                              text-red-600

                              transition-all

                              hover:bg-red-600
                              hover:text-white

                              disabled:cursor-not-allowed
                              disabled:opacity-40

                              dark:text-red-400
                            "
                        >
                          {remove.isPending ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div
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
                <Rocket className="size-5" />
              </div>

              <h3
                className="
                  display-heading

                  mt-5

                  text-4xl
                "
              >
                No campaigns yet.
              </h3>

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
                Create your first campaign to begin the Admin review process.
              </p>

              <Link
                to="/dashboard/creator/campaigns/add"
                className="
                  editorial-button

                  mt-6
                "
              >
                <Plus className="size-4" />
                Create campaign
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </motion.main>
  );
}
