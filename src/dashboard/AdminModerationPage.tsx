import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Coins,
  Flag,
  LoaderCircle,
  Megaphone,
  PauseCircle,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X
} from "lucide-react";

import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

import { useAuth } from "../lib/AuthContext";

import type { Campaign, Profile } from "../types";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;

  reporter: {
    name: string;
    email: string;
  };

  target: {
    id: string;
    label: string;
  };
}

type AdminRequest = {
  method?: "post" | "patch" | "delete";

  url: string;
  body?: unknown;
  successMessage: string;
};

type ModerationSection = "users" | "campaigns" | "reports";

const selectClass = `
  min-w-[130px]

  rounded-xl

  border
  border-[var(--editorial-border)]

  bg-white/35

  px-3
  py-2.5

  text-xs
  font-semibold

  text-[var(--editorial-text)]

  outline-none

  transition-all

  focus:border-[#527064]
  focus:ring-4
  focus:ring-[#527064]/10

  disabled:cursor-not-allowed
  disabled:opacity-45

  dark:bg-white/[0.03]
`;

function requestReason(message: string): string | null {
  const reason = window.prompt(message)?.trim() ?? "";

  if (reason.length < 10) {
    toast.error("Provide a reason of at least 10 characters");

    return null;
  }

  return reason;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
    case "resolved":
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

    case "suspended":
      return `
        border-orange-500/20
        bg-orange-50
        text-orange-800

        dark:border-orange-400/20
        dark:bg-orange-400/10
        dark:text-orange-200
      `;

    case "rejected":
    case "banned":
      return `
        border-red-500/20
        bg-red-50
        text-red-700

        dark:border-red-400/20
        dark:bg-red-400/10
        dark:text-red-300
      `;

    case "dismissed":
      return `
        border-slate-400/25
        bg-slate-100
        text-slate-700

        dark:border-white/10
        dark:bg-white/[0.05]
        dark:text-slate-300
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

export default function AdminModerationPage({
  forcedSection,
  campaignStatus
}: {
  forcedSection?: "users" | "campaigns" | "reports";

  campaignStatus?: string;
}) {
  const [params, setParams] = useSearchParams();

  const section = (forcedSection ?? params.get("section") ?? "users") as ModerationSection;

  const queryClient = useQueryClient();

  const { current } = useAuth();

  const users = useQuery({
    queryKey: ["admin-users", section],

    queryFn: async () =>
      (
        await api.get<{
          data: Profile[];
        }>("/admin/users", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: section === "users"
  });

  const campaigns = useQuery({
    queryKey: ["admin-campaigns", campaignStatus ?? "all"],

    queryFn: async () =>
      (
        await api.get<{
          data: Campaign[];
        }>("/admin/campaigns", {
          params: {
            limit: 50,
            status: campaignStatus || undefined
          }
        })
      ).data.data,

    enabled: section === "campaigns"
  });

  const reports = useQuery({
    queryKey: ["admin-reports", section],

    queryFn: async () =>
      (
        await api.get<{
          data: Report[];
        }>("/admin/reports", {
          params: {
            limit: 50
          }
        })
      ).data.data,

    enabled: section === "reports"
  });

  const action = useMutation({
    mutationFn: async ({ method = "post", url, body }: AdminRequest) => {
      const config = {
        headers: {
          "Idempotency-Key": crypto.randomUUID()
        }
      };

      if (method === "delete") {
        return api.delete(url, {
          ...config,
          data: body
        });
      }

      if (method === "patch") {
        return api.patch(url, body, config);
      }

      return api.post(url, body ?? {}, config);
    },

    onSuccess: async (_response, variables) => {
      toast.success(variables.successMessage);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-users"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-campaigns"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-reports"]
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-dashboard"]
        })
      ]);
    },

    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const setSection = (nextSection: ModerationSection) => {
    const next = new URLSearchParams();

    if (nextSection !== "users") {
      next.set("section", nextSection);
    }

    setParams(next);
  };

  const removeUser = (user: Profile) => {
    if (!window.confirm(`Remove ${user.name}? Financial records will remain for audit purposes.`)) {
      return;
    }

    const reason = requestReason("Removal reason (minimum 10 characters)");

    if (!reason) {
      return;
    }

    action.mutate({
      method: "delete",

      url: `/admin/users/${user.id}`,

      body: {
        reason
      },

      successMessage: "User removed"
    });
  };

  const deleteCampaign = (campaign: Campaign) => {
    if (
      !window.confirm(`Delete or archive "${campaign.title}" and refund eligible contributions?`)
    ) {
      return;
    }

    const reason = requestReason("Campaign deletion reason (minimum 10 characters)");

    if (!reason) {
      return;
    }

    action.mutate({
      method: "delete",

      url: `/admin/campaigns/${campaign.id || campaign._id}`,

      body: {
        reason
      },

      successMessage: "Campaign deletion workflow completed"
    });
  };

  const pageTitle =
    section === "users"
      ? "User moderation"
      : section === "campaigns"
        ? campaignStatus === "pending"
          ? "Campaign approvals"
          : "Campaign moderation"
        : "Report moderation";

  const pageDescription =
    section === "users"
      ? "Manage account roles, access status and platform membership."
      : section === "campaigns"
        ? "Review campaign submissions and control campaign lifecycle status."
        : "Review community reports and take audited moderation actions.";

  const activeCount =
    section === "users"
      ? (users.data?.length ?? 0)
      : section === "campaigns"
        ? (campaigns.data?.length ?? 0)
        : (reports.data?.length ?? 0);

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
              Admin workspace
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
              Visible records
            </p>

            <p
              className="
                mt-1

                text-2xl
                font-semibold

                tracking-[-0.04em]

                text-white
              "
            >
              {activeCount.toLocaleString()}
            </p>
          </div>
        </div>
      </section>

      {/* AUDIT NOTICE */}
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
            Audited moderation
          </p>

          <p
            className="
              mt-1

              text-xs
              leading-5

              text-[var(--editorial-muted)]
            "
          >
            Sensitive moderation actions revoke stale authorization where required and create an
            audit record.
          </p>
        </div>
      </section>

      {/* SECTION TABS */}
      {!forcedSection ? (
        <div
          className="
            grid
            grid-cols-3

            rounded-2xl

            border
            border-[var(--editorial-border)]

            bg-white/30

            p-1.5

            dark:bg-white/[0.025]
          "
        >
          {[
            {
              value: "users",
              label: "Users",
              icon: Users
            },
            {
              value: "campaigns",
              label: "Campaigns",
              icon: Megaphone
            },
            {
              value: "reports",
              label: "Reports",
              icon: Flag
            }
          ].map(({ value, label, icon: Icon }) => {
            const active = section === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setSection(value as ModerationSection)}
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

                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* USERS */}
      {section === "users" ? (
        <ModerationPanel
          label="Account control"
          title="Platform users"
          description="Update roles, restrict access or remove accounts."
          icon={Users}
          loading={users.isLoading}
          error={users.isError}
          onRetry={() => void users.refetch()}
          empty={!users.data?.length}
          emptyText="No user accounts found."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">
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

                  <th className="px-5 py-4">Credits</th>

                  <th className="px-5 py-4">Role</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Remove</th>
                </tr>
              </thead>

              <tbody>
                {users.data?.map((user, index) => {
                  const isSelf = user.id === current?.profile?.id;

                  return (
                    <motion.tr
                      key={user.id}
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

                          <div className="min-w-0">
                            <p
                              className="
                                  max-w-[240px]
                                  truncate

                                  text-sm
                                  font-semibold

                                  text-[var(--editorial-text)]
                                "
                            >
                              {user.name}
                            </p>

                            <p
                              className="
                                  mt-0.5
                                  max-w-[240px]
                                  truncate

                                  text-xs

                                  text-[var(--editorial-muted)]
                                "
                            >
                              {user.email}
                            </p>

                            {isSelf ? (
                              <span
                                className="
                                    mt-1
                                    inline-flex

                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.12em]

                                    text-[#527064]

                                    dark:text-[#9fbaad]
                                  "
                              >
                                Current admin
                              </span>
                            ) : null}
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

                                text-[var(--editorial-text)]
                              "
                          >
                            {user.credits.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          disabled={isSelf || action.isPending}
                          className={selectClass}
                          value={user.role}
                          onChange={(event) =>
                            action.mutate({
                              method: "patch",

                              url: `/admin/users/${user.id}/role`,

                              body: {
                                role: event.target.value
                              },

                              successMessage: "User role updated; old sessions revoked"
                            })
                          }
                        >
                          <option value="supporter">supporter</option>

                          <option value="creator">creator</option>

                          <option value="admin">admin</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          disabled={isSelf || action.isPending}
                          className={selectClass}
                          value={user.status}
                          onChange={(event) => {
                            const status = event.target.value;

                            const reason =
                              status === "active"
                                ? undefined
                                : requestReason("Status-change reason (minimum 10 characters)");

                            if (status !== "active" && !reason) {
                              return;
                            }

                            action.mutate({
                              method: "patch",

                              url: `/admin/users/${user.id}/status`,

                              body: {
                                status,
                                reason
                              },

                              successMessage: "User status updated; active sessions revoked"
                            });
                          }}
                        >
                          <option value="active">active</option>

                          <option value="suspended">suspended</option>

                          <option value="banned">banned</option>
                        </select>

                        <div className="mt-2">
                          <StatusBadge status={user.status} />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={isSelf || action.isPending}
                          onClick={() => removeUser(user)}
                          aria-label={`Remove ${user.name}`}
                          className="
                              flex
                              size-9
                              items-center
                              justify-center

                              rounded-full

                              border
                              border-red-500/20

                              text-red-600

                              transition-all

                              hover:bg-red-600
                              hover:text-white

                              disabled:cursor-not-allowed
                              disabled:opacity-35

                              dark:text-red-400
                            "
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModerationPanel>
      ) : null}

      {/* CAMPAIGNS */}
      {section === "campaigns" ? (
        <ModerationPanel
          label="Campaign control"
          title={campaignStatus === "pending" ? "Pending approvals" : "Campaign moderation"}
          description="Review campaign submissions, lifecycle status and destructive actions."
          icon={Rocket}
          loading={campaigns.isLoading}
          error={campaigns.isError}
          onRetry={() => void campaigns.refetch()}
          empty={!campaigns.data?.length}
          emptyText={
            campaignStatus === "pending"
              ? "No campaigns are waiting for approval."
              : "No campaign records found."
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">
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

                  <th className="px-5 py-4">Creator</th>

                  <th className="px-5 py-4">Goal</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.data?.map((campaign, index) => {
                  const id = campaign.id || campaign._id;

                  return (
                    <motion.tr
                      key={id}
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
                          {campaign.coverImageUrl ? (
                            <img
                              src={campaign.coverImageUrl}
                              alt={campaign.title}
                              className="
                                  size-11
                                  shrink-0

                                  rounded-xl

                                  object-cover
                                "
                            />
                          ) : (
                            <span
                              className="
                                  flex
                                  size-11
                                  shrink-0
                                  items-center
                                  justify-center

                                  rounded-xl

                                  bg-[#d6e3dd]

                                  text-[#10261f]
                                "
                            >
                              <Megaphone className="size-4" />
                            </span>
                          )}

                          <div>
                            <p
                              className="
                                  max-w-[280px]

                                  line-clamp-2

                                  text-sm
                                  font-semibold

                                  text-[var(--editorial-text)]
                                "
                            >
                              {campaign.title}
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
                              {campaign.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td
                        className="
                            px-5
                            py-4

                            text-sm

                            text-[var(--editorial-text-soft)]
                          "
                      >
                        {campaign.creatorName || "—"}
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

                                text-[var(--editorial-text)]
                              "
                          >
                            {campaign.goalCredits.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                              flex
                              flex-wrap
                              gap-2
                            "
                        >
                          {campaign.status === "pending" ? (
                            <>
                              <ActionIconButton
                                label="Approve campaign"
                                disabled={action.isPending}
                                onClick={() =>
                                  action.mutate({
                                    url: `/admin/campaigns/${id}/approve`,

                                    successMessage: "Campaign approved"
                                  })
                                }
                                variant="approve"
                              >
                                <Check className="size-4" />
                              </ActionIconButton>

                              <ActionIconButton
                                label="Reject campaign"
                                disabled={action.isPending}
                                onClick={() => {
                                  const reason = requestReason("Rejection reason");

                                  if (reason) {
                                    action.mutate({
                                      url: `/admin/campaigns/${id}/reject`,

                                      body: {
                                        reason
                                      },

                                      successMessage: "Campaign rejected"
                                    });
                                  }
                                }}
                                variant="danger"
                              >
                                <X className="size-4" />
                              </ActionIconButton>
                            </>
                          ) : null}

                          {["pending", "approved"].includes(campaign.status) ? (
                            <ActionIconButton
                              label="Suspend campaign"
                              disabled={action.isPending}
                              onClick={() => {
                                const reason = requestReason("Suspension reason");

                                if (reason) {
                                  action.mutate({
                                    url: `/admin/campaigns/${id}/suspend`,

                                    body: {
                                      reason
                                    },

                                    successMessage: "Campaign suspended"
                                  });
                                }
                              }}
                              variant="warning"
                            >
                              <PauseCircle className="size-4" />
                            </ActionIconButton>
                          ) : null}

                          <ActionIconButton
                            label="Delete campaign"
                            disabled={action.isPending}
                            onClick={() => deleteCampaign(campaign)}
                            variant="outlineDanger"
                          >
                            <Trash2 className="size-4" />
                          </ActionIconButton>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ModerationPanel>
      ) : null}

      {/* REPORTS */}
      {section === "reports" ? (
        <ModerationPanel
          label="Community safety"
          title="Reported content"
          description="Review submitted reports and record the resolution applied."
          icon={Flag}
          loading={reports.isLoading}
          error={reports.isError}
          onRetry={() => void reports.refetch()}
          empty={!reports.data?.length}
          emptyText="No moderation reports found."
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
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
                  <th className="px-5 py-4">Report</th>

                  <th className="px-5 py-4">Reporter</th>

                  <th className="px-5 py-4">Campaign</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {reports.data?.map((report, index) => (
                  <motion.tr
                    key={report.id}
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
                            items-start
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

                              bg-amber-100

                              text-amber-800

                              dark:bg-amber-400/10
                              dark:text-amber-200
                            "
                        >
                          <AlertTriangle className="size-4" />
                        </span>

                        <div>
                          <p
                            className="
                                max-w-[300px]

                                text-sm
                                font-semibold

                                text-[var(--editorial-text)]
                              "
                          >
                            {report.reason}
                          </p>

                          {report.description ? (
                            <p
                              className="
                                  mt-1
                                  max-w-[340px]

                                  text-xs
                                  leading-5

                                  text-[var(--editorial-muted)]
                                "
                            >
                              {report.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p
                        className="
                            text-sm
                            font-semibold

                            text-[var(--editorial-text)]
                          "
                      >
                        {report.reporter.name}
                      </p>

                      <p
                        className="
                            mt-0.5

                            text-xs

                            text-[var(--editorial-muted)]
                          "
                      >
                        {report.reporter.email}
                      </p>
                    </td>

                    <td
                      className="
                          max-w-[260px]

                          px-5
                          py-4

                          text-sm
                          font-medium

                          text-[var(--editorial-text-soft)]
                        "
                    >
                      {report.target.label}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={report.status} />
                    </td>

                    <td className="px-5 py-4">
                      {report.status === "pending" ? (
                        <div
                          className="
                              flex
                              max-w-[390px]
                              flex-wrap
                              gap-2
                            "
                        >
                          <button
                            type="button"
                            disabled={action.isPending}
                            onClick={() => {
                              const resolutionNote = requestReason("Resolution note");

                              if (resolutionNote) {
                                action.mutate({
                                  url: `/admin/reports/${report.id}/resolve`,

                                  body: {
                                    resolutionNote
                                  },

                                  successMessage: "Report resolved"
                                });
                              }
                            }}
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
                            <CheckCircle2 className="size-3.5" />
                            Resolve
                          </button>

                          <button
                            type="button"
                            disabled={action.isPending}
                            onClick={() => {
                              const resolutionNote = requestReason("Dismissal note");

                              if (resolutionNote) {
                                action.mutate({
                                  url: `/admin/reports/${report.id}/dismiss`,

                                  body: {
                                    resolutionNote
                                  },

                                  successMessage: "Report dismissed"
                                });
                              }
                            }}
                            className="
                                inline-flex
                                items-center
                                gap-2

                                rounded-full

                                border
                                border-[var(--editorial-border)]

                                px-3.5
                                py-2

                                text-xs
                                font-semibold

                                text-[var(--editorial-text-soft)]

                                transition

                                hover:bg-white/45

                                disabled:cursor-not-allowed
                                disabled:opacity-45

                                dark:hover:bg-white/[0.05]
                              "
                          >
                            <X className="size-3.5" />
                            Dismiss
                          </button>

                          <button
                            type="button"
                            disabled={action.isPending}
                            onClick={() => {
                              const resolutionNote = requestReason(
                                "Reason for suspending the reported campaign"
                              );

                              if (resolutionNote) {
                                action.mutate({
                                  url: `/admin/reports/${report.id}/action`,

                                  body: {
                                    action: "suspend_campaign",

                                    resolutionNote
                                  },

                                  successMessage: "Reported campaign suspended and report resolved"
                                });
                              }
                            }}
                            className="
                                inline-flex
                                items-center
                                gap-2

                                rounded-full

                                border
                                border-amber-500/20

                                bg-amber-50

                                px-3.5
                                py-2

                                text-xs
                                font-semibold

                                text-amber-800

                                transition

                                hover:bg-amber-500
                                hover:text-white

                                disabled:cursor-not-allowed
                                disabled:opacity-45

                                dark:bg-amber-400/[0.08]
                                dark:text-amber-200
                              "
                          >
                            <PauseCircle className="size-3.5" />
                            Suspend
                          </button>

                          <button
                            type="button"
                            disabled={action.isPending}
                            onClick={() => {
                              const resolutionNote = requestReason(
                                "Reason for deleting the reported campaign"
                              );

                              if (
                                resolutionNote &&
                                window.confirm(
                                  "Delete or archive the reported campaign and refund eligible Supporters?"
                                )
                              ) {
                                action.mutate({
                                  url: `/admin/reports/${report.id}/action`,

                                  body: {
                                    action: "delete_campaign",

                                    resolutionNote
                                  },

                                  successMessage: "Reported campaign deletion workflow completed"
                                });
                              }
                            }}
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

                                transition

                                hover:bg-red-600
                                hover:text-white

                                disabled:cursor-not-allowed
                                disabled:opacity-45

                                dark:text-red-400
                              "
                          >
                            <Trash2 className="size-3.5" />
                            Delete
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
        </ModerationPanel>
      ) : null}

      {/* GLOBAL ACTION STATE */}
      {action.isPending ? (
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
          Applying moderation action...
        </div>
      ) : null}
    </motion.main>
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

function ActionIconButton({
  label,
  disabled,
  onClick,
  variant,
  children
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;

  variant: "approve" | "danger" | "warning" | "outlineDanger";

  children: ReactNode;
}) {
  const variants = {
    approve: `
      bg-[#20352d]
      text-white

      hover:bg-[#2f4b40]

      dark:bg-[#d6e3dd]
      dark:text-[#10261f]
    `,

    danger: `
      bg-red-600
      text-white

      hover:bg-red-700
    `,

    warning: `
      bg-amber-500
      text-white

      hover:bg-amber-600
    `,

    outlineDanger: `
      border
      border-red-500/20

      text-red-600

      hover:bg-red-600
      hover:text-white

      dark:text-red-400
    `
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        size-9
        items-center
        justify-center

        rounded-full

        transition-all

        hover:-translate-y-0.5

        disabled:cursor-not-allowed
        disabled:opacity-40

        ${variants[variant]}
      `}
    >
      {children}
    </button>
  );
}

function ModerationPanel({
  label,
  title,
  description,
  icon: Icon,
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  children
}: {
  label: string;
  title: string;
  description: string;
  icon: typeof Users;
  loading: boolean;
  error: boolean;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
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

      {loading ? (
        <ModerationLoading />
      ) : error ? (
        <div
          className="
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
            <AlertTriangle className="size-5" />
          </div>

          <h3
            className="
              display-heading

              mt-4

              text-4xl
            "
          >
            Data unavailable.
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
            CrowdSpark could not load this moderation section.
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
      ) : empty ? (
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
            <CheckCircle2 className="size-5" />
          </div>

          <h3
            className="
              display-heading

              mt-4

              text-4xl
            "
          >
            Nothing to review.
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
            {emptyText}
          </p>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function ModerationLoading() {
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
