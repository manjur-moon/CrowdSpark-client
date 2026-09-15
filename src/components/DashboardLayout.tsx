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
import { ThemeToggle } from "./ThemeToggle";

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
    <div className="min-h-screen bg-[#f5f5f5] text-[#242424] dark:bg-[#111111] dark:text-[#f5f5f5]">
      {open ? (
        <button
          type="button"
          aria-label="Close dashboard menu overlay"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#e1dfdd] bg-white p-4 text-[#242424] shadow-xl shadow-black/5 transition-transform dark:border-[#383838] dark:bg-[#181818] dark:text-[#f5f5f5] dark:shadow-black/30 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-12 items-center justify-between px-1">
          <Logo />
          <button
            type="button"
            className="theme-toggle lg:hidden"
            aria-label="Close dashboard menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-[#e1dfdd] bg-[#fafafa] p-3.5 dark:border-[#383838] dark:bg-[#202020]">
          <div className="flex items-center gap-3">
            {sessionUser?.image ? (
              <img src={sessionUser.image} alt="" className="size-10 rounded-md object-cover" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-md bg-[#ebebeb] text-[#616161] dark:bg-[#303030] dark:text-[#d6d6d6]">
                <UserRound className="size-[18px]" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile.name}</p>
              <p className="mt-0.5 text-xs capitalize text-[#707070] dark:text-[#adadad]">
                {profile.role}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-[#e1dfdd] pt-3 text-xs font-semibold text-brand-700 dark:border-[#383838] dark:text-brand-300">
            {balanceLabel}
          </p>
        </div>

        <nav
          aria-label={`${profile.role} dashboard navigation`}
          className="mt-5 flex-1 space-y-1 overflow-y-auto pr-1"
        >
          {nav[profile.role].map(([label, to, Icon]) => (
            <NavLink
              key={to}
              end={to === `/dashboard/${profile.role}`}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-[#616161] hover:bg-[#f5f5f5] hover:text-[#242424] dark:text-[#d6d6d6] dark:hover:bg-[#292929] dark:hover:text-white"
                }`
              }
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-[#e1dfdd] pt-3 dark:border-[#383838]">
          <p className="px-3 text-[11px] text-[#8a8886] dark:text-[#8f8f8f]">
            © {new Date().getFullYear()} CrowdSpark
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e1dfdd] bg-white/95 px-4 backdrop-blur-xl dark:border-[#383838] dark:bg-[#1b1b1b]/95 sm:px-7">
          <button
            type="button"
            className="theme-toggle lg:hidden"
            aria-label="Open dashboard menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs font-semibold capitalize text-[#707070] dark:text-[#adadad]">
              {profile.role} workspace
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#242424] dark:text-[#f5f5f5]">
              {balanceLabel}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <span className="mx-1 hidden h-5 w-px bg-[#e1dfdd] dark:bg-[#383838] sm:block" />
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-sm font-semibold text-[#616161] transition hover:bg-[#f5f5f5] hover:text-[#242424] dark:text-[#d6d6d6] dark:hover:bg-[#292929] dark:hover:text-white"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="size-[17px]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-7">
          <Outlet />
        </main>

        <footer className="border-t border-[#e1dfdd] bg-white px-4 py-4 text-center text-xs text-[#707070] dark:border-[#383838] dark:bg-[#1b1b1b] dark:text-[#adadad] sm:px-7">
          CrowdSpark · Secure crowdfunding operations and transparent impact
        </footer>
      </div>
    </div>
  );
}
