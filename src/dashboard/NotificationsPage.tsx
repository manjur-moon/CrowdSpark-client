import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../lib/api";
import type { NotificationItem } from "../types";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications-all"],
    queryFn: async () =>
      (await api.get<{ data: NotificationItem[] }>("/notifications", { params: { limit: 50 } }))
        .data.data
  });
  const all = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: async () => {
      toast.success("All notifications marked as read");
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["notifications-all"] }),
        qc.invalidateQueries({ queryKey: ["notification-count"] })
      ]);
    },
    onError: (e) => toast.error(apiErrorMessage(e))
  });
  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <Bell className="size-10 text-emerald-600" />
          <h1 className="mt-4 text-3xl font-black">Notifications</h1>
        </div>
        <button className="btn-primary" onClick={() => all.mutate()}>
          <CheckCheck className="size-4" />
          Mark all read
        </button>
      </header>
      <section className="space-y-3">
        {query.data?.length ? (
          query.data.map((n) => (
            <article
              key={n.id}
              className={`card p-5 ${n.isRead ? "" : "border-emerald-300 bg-emerald-50"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{n.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {n.actionUrl ? (
                  <Link className="btn-secondary text-sm" to={n.actionUrl}>
                    Open
                  </Link>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="card p-10 text-center">No notifications yet.</div>
        )}
      </section>
    </main>
  );
}
