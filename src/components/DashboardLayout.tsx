import {
  Banknote,
  Bell,
  Coins,
  FileCheck2,
  FileWarning,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  PlusCircle,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  WalletCards,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import type { Role } from "../types";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";

const nav: Record<Role, Array<[string, string, LucideIcon]>> = {
  supporter: [
    ["Home", "/dashboard/supporter", LayoutDashboard],
    ["Explore Campaigns", "/dashboard/supporter/explore", Megaphone],
    ["My Contributions", "/dashboard/supporter/contributions", HandHeart],
    ["Purchase Credits", "/dashboard/supporter/purchase-credits", Coins],
    ["Payment History", "/dashboard/supporter/payment-history", Banknote],
    ["Notifications", "/dashboard/notifications", Bell],
    ["Profile", "/dashboard/profile", Settings]
  ],
  creator: [
    ["Home", "/dashboard/creator", LayoutDashboard],
    ["Add New Campaign", "/dashboard/creator/campaigns/add", PlusCircle],
    ["My Campaigns", "/dashboard/creator/campaigns", Megaphone],
    ["Contributions", "/dashboard/creator/contributions", HandHeart],
    ["Withdrawals", "/dashboard/creator/withdrawals", WalletCards],
    ["Payment History", "/dashboard/creator/payment-history", Banknote],
    ["Notifications", "/dashboard/notifications", Bell],
    ["Profile", "/dashboard/profile", Settings]
  ],
  admin: [
    ["Home", "/dashboard/admin", LayoutDashboard],
    ["Manage Users", "/dashboard/admin/users", Users],
    ["Campaign Approvals", "/dashboard/admin/campaign-approvals", FileCheck2],
    ["Manage Campaigns", "/dashboard/admin/campaigns", FileWarning],
    ["Withdrawal Requests", "/dashboard/admin/withdrawals", WalletCards],
    ["Reports", "/dashboard/admin/reports", ShieldCheck],
    ["Notifications", "/dashboard/notifications", Bell],
    ["Profile", "/dashboard/profile", Settings]
  ]
};

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { current, sessionUser, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = current!.profile!;
  const balanceLabel =
    profile.role === "creator"
      ? `${profile.creatorBalance.toLocaleString()} withdrawable credits`
      : profile.role === "supporter"
        ? `${profile.credits.toLocaleString()} available credits`
        : "Platform administrator";

  return (
    <div className="min-h-screen bg-slate-100">
      {open ? (
        <button
          type="button"
          aria-label="Close dashboard menu overlay"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 p-5 text-white transition lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Logo light />
          <button
            type="button"
            className="lg:hidden"
            aria-label="Close dashboard menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="mt-8 rounded-2xl bg-white/10 p-4">
          <div className="flex items-center gap-3">
            {sessionUser?.image ? (
              <img src={sessionUser.image} alt="" className="size-11 rounded-xl object-cover" />
            ) : (
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                <UserRound className="size-5" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold">{profile.name}</p>
              <p className="mt-1 text-xs capitalize text-slate-400">{profile.role}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-bold text-emerald-300">{balanceLabel}</p>
        </div>
        <nav
          aria-label={`${profile.role} dashboard navigation`}
          className="mt-7 flex-1 space-y-1 overflow-y-auto"
        >
          {nav[profile.role].map(([label, to, Icon]) => (
            <NavLink
              key={to}
              end={to === `/dashboard/${profile.role}`}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-white/10"}`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CrowdSpark
        </p>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
            aria-label="Open dashboard menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {profile.role} dashboard
            </p>
            <p className="text-sm font-bold text-slate-800">{balanceLabel}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <button
              className="btn-secondary px-3"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-7">
          <Outlet />
        </div>
        <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-500 sm:px-7">
          CrowdSpark role-based crowdfunding dashboard · Secure credits, campaigns and notifications
        </footer>
      </div>
    </div>
  );
}
