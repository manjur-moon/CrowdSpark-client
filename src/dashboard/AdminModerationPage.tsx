import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, PauseCircle, ShieldCheck, Trash2, X } from "lucide-react";
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
  reporter: { name: string; email: string };
  target: { id: string; label: string };
}

type AdminRequest = {
  method?: "post" | "patch" | "delete";
  url: string;
  body?: unknown;
  successMessage: string;
};

function requestReason(message: string): string | null {
  const reason = window.prompt(message)?.trim() ?? "";
  if (reason.length < 10) {
    toast.error("Provide a reason of at least 10 characters");
    return null;
  }
  return reason;
}

export default function AdminModerationPage({
  forcedSection,
  campaignStatus
}: {
  forcedSection?: "users" | "campaigns" | "reports";
  campaignStatus?: string;
}) {
  const [params, setParams] = useSearchParams();
  const section = forcedSection ?? params.get("section") ?? "users";
  const queryClient = useQueryClient();
  const { current } = useAuth();

  const users = useQuery({
    queryKey: ["admin-users", section],
    queryFn: async () =>
      (await api.get<{ data: Profile[] }>("/admin/users", { params: { limit: 50 } })).data.data,
    enabled: section === "users"
  });
  const campaigns = useQuery({
    queryKey: ["admin-campaigns", campaignStatus ?? "all"],
    queryFn: async () =>
      (
        await api.get<{ data: Campaign[] }>("/admin/campaigns", {
          params: { limit: 50, status: campaignStatus || undefined }
        })
      ).data.data,
    enabled: section === "campaigns"
  });
  const reports = useQuery({
    queryKey: ["admin-reports", section],
    queryFn: async () =>
      (await api.get<{ data: Report[] }>("/admin/reports", { params: { limit: 50 } })).data.data,
    enabled: section === "reports"
  });

  const action = useMutation({
    mutationFn: async ({ method = "post", url, body }: AdminRequest) => {
      const config = { headers: { "Idempotency-Key": crypto.randomUUID() } };
      if (method === "delete") return api.delete(url, { ...config, data: body });
      if (method === "patch") return api.patch(url, body, config);
      return api.post(url, body ?? {}, config);
    },
    onSuccess: async (_response, variables) => {
      toast.success(variables.successMessage);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
      ]);
    },
    onError: (error) => toast.error(apiErrorMessage(error))
  });

  const setSection = (nextSection: string) => {
    const next = new URLSearchParams();
    if (nextSection !== "users") next.set("section", nextSection);
    setParams(next);
  };

  const removeUser = (user: Profile) => {
    if (!window.confirm(`Remove ${user.name}? Financial records will remain for audit purposes.`))
      return;
    const reason = requestReason("Removal reason (minimum 10 characters)");
    if (!reason) return;
    action.mutate({
      method: "delete",
      url: `/admin/users/${user.id}`,
      body: { reason },
      successMessage: "User removed"
    });
  };

  const deleteCampaign = (campaign: Campaign) => {
    if (!window.confirm(`Delete or archive "${campaign.title}" and refund eligible contributions?`))
      return;
    const reason = requestReason("Campaign deletion reason (minimum 10 characters)");
    if (!reason) return;
    action.mutate({
      method: "delete",
      url: `/admin/campaigns/${campaign.id || campaign._id}`,
      body: { reason },
      successMessage: "Campaign deletion workflow completed"
    });
  };

  return (
    <main className="space-y-6">
      <header>
        <ShieldCheck className="size-10 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-black">Platform moderation</h1>
        <p className="mt-2 text-slate-600">
          Every sensitive action revokes stale authorization and creates an audit record.
        </p>
      </header>

      {!forcedSection ? (
        <div className="flex rounded-xl bg-white p-1">
          {["users", "campaigns", "reports"].map((item) => (
            <button
              key={item}
              className={`flex-1 rounded-lg p-3 font-bold capitalize ${section === item ? "bg-emerald-600 text-white" : ""}`}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {section === "users" ? (
        <div className="card overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Remove</th>
              </tr>
            </thead>
            <tbody>
              {users.data?.map((user) => {
                const isSelf = user.id === current?.profile?.id;
                return (
                  <tr key={user.id} className="border-t">
                    <td className="p-4">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      {isSelf ? (
                        <p className="text-xs font-bold text-emerald-700">Current Admin</p>
                      ) : null}
                    </td>
                    <td className="p-4">{user.credits}</td>
                    <td className="p-4">
                      <select
                        disabled={isSelf || action.isPending}
                        className="rounded-lg border p-2 disabled:opacity-50"
                        value={user.role}
                        onChange={(event) =>
                          action.mutate({
                            method: "patch",
                            url: `/admin/users/${user.id}/role`,
                            body: { role: event.target.value },
                            successMessage: "User role updated; old sessions revoked"
                          })
                        }
                      >
                        <option value="supporter">supporter</option>
                        <option value="creator">creator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        disabled={isSelf || action.isPending}
                        className="rounded-lg border p-2 disabled:opacity-50"
                        value={user.status}
                        onChange={(event) => {
                          const status = event.target.value;
                          const reason =
                            status === "active"
                              ? undefined
                              : requestReason("Status-change reason (minimum 10 characters)");
                          if (status !== "active" && !reason) return;
                          action.mutate({
                            method: "patch",
                            url: `/admin/users/${user.id}/status`,
                            body: { status, reason },
                            successMessage: "User status updated; active sessions revoked"
                          });
                        }}
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                        <option value="banned">banned</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        disabled={isSelf || action.isPending}
                        className="rounded-lg border border-red-200 p-2 text-red-700 disabled:opacity-40"
                        onClick={() => removeUser(user)}
                        aria-label={`Remove ${user.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : section === "campaigns" ? (
        <div className="card overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">Campaign</th>
                <th className="p-4">Creator</th>
                <th className="p-4">Goal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.data?.map((campaign) => {
                const id = campaign.id || campaign._id;
                return (
                  <tr key={id} className="border-t">
                    <td className="p-4 font-bold">{campaign.title}</td>
                    <td className="p-4">{campaign.creatorName}</td>
                    <td className="p-4">{campaign.goalCredits}</td>
                    <td className="p-4 capitalize">{campaign.status}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {campaign.status === "pending" ? (
                          <>
                            <button
                              className="rounded-lg bg-emerald-600 p-2 text-white"
                              onClick={() =>
                                action.mutate({
                                  url: `/admin/campaigns/${id}/approve`,
                                  successMessage: "Campaign approved"
                                })
                              }
                              aria-label="Approve campaign"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              className="rounded-lg bg-red-600 p-2 text-white"
                              onClick={() => {
                                const reason = requestReason("Rejection reason");
                                if (reason)
                                  action.mutate({
                                    url: `/admin/campaigns/${id}/reject`,
                                    body: { reason },
                                    successMessage: "Campaign rejected"
                                  });
                              }}
                              aria-label="Reject campaign"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        ) : null}
                        {["pending", "approved"].includes(campaign.status) ? (
                          <button
                            className="rounded-lg bg-amber-500 p-2 text-white"
                            onClick={() => {
                              const reason = requestReason("Suspension reason");
                              if (reason)
                                action.mutate({
                                  url: `/admin/campaigns/${id}/suspend`,
                                  body: { reason },
                                  successMessage: "Campaign suspended"
                                });
                            }}
                            aria-label="Suspend campaign"
                          >
                            <PauseCircle className="size-4" />
                          </button>
                        ) : null}
                        <button
                          className="rounded-lg border border-red-200 p-2 text-red-700"
                          onClick={() => deleteCampaign(campaign)}
                          aria-label="Delete campaign"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase">
              <tr>
                <th className="p-4">Report</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Campaign</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.data?.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="p-4">
                    <p className="font-bold">{report.reason}</p>
                    <p className="text-xs text-slate-500">{report.description}</p>
                  </td>
                  <td className="p-4">{report.reporter.name}</td>
                  <td className="p-4">{report.target.label}</td>
                  <td className="p-4 capitalize">{report.status}</td>
                  <td className="p-4">
                    {report.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-primary py-2 text-xs"
                          onClick={() => {
                            const resolutionNote = requestReason("Resolution note");
                            if (resolutionNote)
                              action.mutate({
                                url: `/admin/reports/${report.id}/resolve`,
                                body: { resolutionNote },
                                successMessage: "Report resolved"
                              });
                          }}
                        >
                          Resolve
                        </button>
                        <button
                          className="btn-secondary py-2 text-xs"
                          onClick={() => {
                            const resolutionNote = requestReason("Dismissal note");
                            if (resolutionNote)
                              action.mutate({
                                url: `/admin/reports/${report.id}/dismiss`,
                                body: { resolutionNote },
                                successMessage: "Report dismissed"
                              });
                          }}
                        >
                          Dismiss
                        </button>
                        <button
                          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white"
                          onClick={() => {
                            const resolutionNote = requestReason(
                              "Reason for suspending the reported campaign"
                            );
                            if (resolutionNote)
                              action.mutate({
                                url: `/admin/reports/${report.id}/action`,
                                body: { action: "suspend_campaign", resolutionNote },
                                successMessage: "Reported campaign suspended and report resolved"
                              });
                          }}
                        >
                          Suspend campaign
                        </button>
                        <button
                          className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white"
                          onClick={() => {
                            const resolutionNote = requestReason(
                              "Reason for deleting the reported campaign"
                            );
                            if (
                              resolutionNote &&
                              window.confirm(
                                "Delete or archive the reported campaign and refund eligible Supporters?"
                              )
                            )
                              action.mutate({
                                url: `/admin/reports/${report.id}/action`,
                                body: { action: "delete_campaign", resolutionNote },
                                successMessage: "Reported campaign deletion workflow completed"
                              });
                          }}
                        >
                          Delete campaign
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
      )}
    </main>
  );
}
