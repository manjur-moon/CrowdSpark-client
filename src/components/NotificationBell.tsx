import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { NotificationItem } from "../types";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const count = useQuery({
    queryKey: ["notification-count"],
    queryFn: async () =>
      (await api.get<{ data: { count: number } }>("/notifications/unread-count")).data.data.count,
    refetchInterval: 20000
  });
  const items = useQuery({
    queryKey: ["notification-recent"],
    queryFn: async () =>
      (await api.get<{ data: NotificationItem[] }>("/notifications", { params: { limit: 6 } })).data
        .data,
    enabled: open
  });
  const read = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-count"] });
      qc.invalidateQueries({ queryKey: ["notification-recent"] });
    }
  });
  return (
    <div className="relative">
      <button
        className="relative flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-5" />
        {(count.data ?? 0) > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {Math.min(99, count.data ?? 0)}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(90vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b p-4">
            <h3 className="font-bold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.isLoading ? (
              <p className="p-6 text-center text-sm">Loading...</p>
            ) : items.data?.length ? (
              items.data.map((item) => (
                <button
                  key={item.id}
                  className={`block w-full border-b p-4 text-left ${item.isRead ? "bg-white" : "bg-emerald-50"}`}
                  onClick={() => {
                    if (!item.isRead) read.mutate(item.id);
                    setOpen(false);
                    navigate(item.actionUrl || "/dashboard/notifications");
                  }}
                >
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{item.message}</p>
                </button>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-slate-500">No notifications</p>
            )}
          </div>
          <Link
            to="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block p-3 text-center text-sm font-bold text-emerald-700"
          >
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
