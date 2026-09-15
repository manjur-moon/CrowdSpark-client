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
        className="theme-toggle relative"
        aria-label="Notifications"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-[18px]" />
        {(count.data ?? 0) > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-[#d13438] px-1 py-0.5 text-center text-[9px] font-bold leading-none text-white">
            {Math.min(99, count.data ?? 0)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(90vw,380px)] overflow-hidden rounded-lg border border-[#e1dfdd] bg-white shadow-xl shadow-black/10 dark:border-[#383838] dark:bg-[#1b1b1b] dark:shadow-black/30">
          <div className="border-b border-[#e1dfdd] px-4 py-3.5 dark:border-[#383838]">
            <h3 className="text-sm font-semibold text-[#242424] dark:text-[#f5f5f5]">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.isLoading ? (
              <p className="p-6 text-center text-sm text-[#616161] dark:text-[#bdbdbd]">Loading...</p>
            ) : items.data?.length ? (
              items.data.map((item) => (
                <button
                  key={item.id}
                  className={`block w-full border-b border-[#edebe9] p-4 text-left transition hover:bg-[#f5f5f5] dark:border-[#303030] dark:hover:bg-[#292929] ${
                    item.isRead ? "bg-white dark:bg-[#1b1b1b]" : "bg-brand-50 dark:bg-brand-950"
                  }`}
                  onClick={() => {
                    if (!item.isRead) read.mutate(item.id);
                    setOpen(false);
                    navigate(item.actionUrl || "/dashboard/notifications");
                  }}
                >
                  <p className="text-sm font-semibold text-[#242424] dark:text-[#f5f5f5]">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#616161] dark:text-[#bdbdbd]">{item.message}</p>
                </button>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-[#707070] dark:text-[#adadad]">No notifications</p>
            )}
          </div>
          <Link
            to="/dashboard/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#e1dfdd] p-3 text-center text-sm font-semibold text-brand-700 transition hover:bg-[#f5f5f5] dark:border-[#383838] dark:text-brand-300 dark:hover:bg-[#292929]"
          >
            View all notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}
