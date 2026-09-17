import {
  Banknote,
  Bell,
  ChevronRight,
  Coins,
  FileCheck2,
  FileWarning,
  HandHeart,
  LayoutDashboard,
  LoaderCircle,
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

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

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
  const [signingOut, setSigningOut] = useState(false);

  const { current, sessionUser, signOut } = useAuth();

  const navigate = useNavigate();

  const profile = current!.profile!;

  const balanceLabel =
    profile.role === "creator"
      ? `${profile.creatorBalance.toLocaleString()} withdrawable credits`
      : profile.role === "supporter"
        ? `${profile.credits.toLocaleString()} available credits`
        : "Platform administrator";

  const roleLabel =
    profile.role === "supporter"
      ? "Supporter workspace"
      : profile.role === "creator"
        ? "Creator workspace"
        : "Admin workspace";

  const logout = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut();

      navigate("/", {
        replace: true
      });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div
      className="
        min-h-screen

        bg-[#d1d8dc]
        text-[#17211d]

        dark:bg-[#0b1210]
        dark:text-[#edf4f0]
      "
    >
      {/* Mobile sidebar overlay */}
      {open ? (
        <button
          type="button"
          aria-label="Close dashboard menu overlay"
          className="
            fixed
            inset-0
            z-40

            bg-black/55

            backdrop-blur-[2px]

            lg:hidden
          "
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50

          flex
          w-[290px]
          flex-col

          overflow-hidden

          border-r
          border-white/10

          bg-[#173329]

          text-[#edf4f0]

          shadow-[20px_0_60px_rgba(16,38,30,0.12)]

          transition-transform
          duration-300

          dark:bg-[#09140f]
          dark:shadow-[20px_0_70px_rgba(0,0,0,0.32)]

          lg:translate-x-0

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-28
            top-20

            size-72

            rounded-full

            bg-[#91aa9d]/10

            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-20
            right-[-140px]

            size-72

            rounded-full

            bg-[#5f8b7a]/10

            blur-3xl
          "
        />

        <div
          className="
            relative
            z-10

            flex
            min-h-0
            flex-1
            flex-col

            p-4
          "
        >
          {/* Logo */}
          <div
            className="
              flex
              h-14
              items-center
              justify-between

              border-b
              border-white/10

              px-2
              pb-3
            "
          >
            <Link to="/" aria-label="CrowdSpark home">
              <Logo light />
            </Link>

            <button
              type="button"
              aria-label="Close dashboard menu"
              onClick={() => setOpen(false)}
              className="
                flex
                size-9
                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-white/[0.05]

                text-[#d6e3dd]

                transition

                hover:bg-white/10

                lg:hidden
              "
            >
              <X className="size-[18px]" />
            </button>
          </div>

          {/* User profile */}
          <div
            className="
              mt-4

              rounded-[20px]

              border
              border-white/10

              bg-white/[0.055]

              p-4

              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              {sessionUser?.image ? (
                <img
                  src={sessionUser.image}
                  alt=""
                  className="
                    size-11
                    rounded-xl

                    border
                    border-white/10

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
                  <UserRound className="size-[18px]" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className="
                    truncate
                    text-sm
                    font-semibold

                    text-white
                  "
                >
                  {profile.name}
                </p>

                <p
                  className="
                    mt-0.5

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]

                    text-[#9fb5aa]
                  "
                >
                  {profile.role}
                </p>
              </div>
            </div>

            <div
              className="
                mt-4

                border-t
                border-white/10

                pt-3
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]

                  text-[#91aa9d]
                "
              >
                Account status
              </p>

              <p
                className="
                  mt-1.5

                  text-xs
                  font-semibold
                  leading-5

                  text-[#d7e4de]
                "
              >
                {balanceLabel}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div
            className="
              mt-5

              flex
              min-h-0
              flex-1
              flex-col
            "
          >
            <p
              className="
                px-3

                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#829b90]
              "
            >
              Workspace
            </p>

            <nav
              aria-label={`${profile.role} dashboard navigation`}
              className="
                dashboard-scrollbar

                mt-3

                flex-1

                space-y-1

                overflow-y-auto

                pr-1
              "
            >
              {nav[profile.role].map(([label, to, Icon]) => (
                <NavLink
                  key={to}
                  end={to === `/dashboard/${profile.role}`}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                      group
                      relative

                      flex
                      items-center
                      gap-3

                      rounded-xl

                      px-3
                      py-2.5

                      text-sm
                      font-semibold

                      transition-all
                      duration-200

                      ${
                        isActive
                          ? `
                              bg-[#d6e3dd]
                              text-[#10261f]

                              shadow-[0_8px_24px_rgba(0,0,0,0.10)]
                            `
                          : `
                              text-[#c0d0c8]

                              hover:bg-white/[0.07]
                              hover:text-white
                            `
                      }
                    `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="
                            size-[17px]
                            shrink-0
                          "
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />

                      <span className="flex-1">{label}</span>

                      <ChevronRight
                        className={`
                            size-3.5

                            transition-all
                            duration-200

                            ${
                              isActive
                                ? `
                                    translate-x-0
                                    opacity-100
                                  `
                                : `
                                    -translate-x-1
                                    opacity-0

                                    group-hover:translate-x-0
                                    group-hover:opacity-60
                                  `
                            }
                          `}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sidebar bottom */}
          <div
            className="
              mt-4

              border-t
              border-white/10

              pt-4
            "
          >
            <button
              type="button"
              onClick={() => void logout()}
              disabled={signingOut}
              className="
                group

                flex
                w-full
                items-center
                gap-3

                rounded-xl

                px-3
                py-2.5

                text-sm
                font-semibold

                text-[#c3d1ca]

                transition-all

                hover:bg-white/[0.07]
                hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {signingOut ? (
                <LoaderCircle className="size-[17px] animate-spin" />
              ) : (
                <LogOut className="size-[17px]" />
              )}

              <span>{signingOut ? "Signing out..." : "Sign out"}</span>
            </button>

            <p
              className="
                mt-3
                px-3

                text-[10px]

                text-[#738b80]
              "
            >
              © {new Date().getFullYear()} CrowdSpark
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div
        className="
          flex
          min-h-screen
          flex-col

          lg:pl-[290px]
        "
      >
        {/* Header */}
        <header
          className="
            sticky
            top-0
            z-30

            flex
            h-[72px]
            items-center
            justify-between

            border-b
            border-[#aebcb6]/45

            bg-[#d1d8dc]/88

            px-4

            backdrop-blur-xl

            sm:px-6
            lg:px-8

            dark:border-white/10
            dark:bg-[#101916]/90
          "
        >
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open dashboard menu"
            onClick={() => setOpen(true)}
            className="
              flex
              size-10
              items-center
              justify-center

              rounded-full

              border
              border-[#aab8b2]

              bg-[#e7ecef]

              text-[#20352d]

              transition

              hover:bg-white

              dark:border-[#33483f]
              dark:bg-[#17221e]
              dark:text-[#d6e3dd]

              lg:hidden
            "
          >
            <Menu className="size-[18px]" />
          </button>

          {/* Workspace title */}
          <div
            className="
              hidden
              sm:block
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.19em]

                text-[#65756e]

                dark:text-[#8fa39a]
              "
            >
              {roleLabel}
            </p>

            <div
              className="
                mt-1
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  size-1.5
                  rounded-full

                  bg-[#527064]

                  dark:bg-[#91aa9d]
                "
              />

              <p
                className="
                  text-sm
                  font-semibold

                  text-[#20302a]

                  dark:text-[#edf4f0]
                "
              >
                {balanceLabel}
              </p>
            </div>
          </div>

          {/* Mobile title */}
          <div
            className="
              ml-3
              sm:hidden
            "
          >
            <p
              className="
                text-sm
                font-semibold
              "
            >
              {roleLabel}
            </p>
          </div>

          {/* Header actions */}
          <div
            className="
              ml-auto

              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                rounded-full

                border
                border-[#aab8b2]

                bg-[#e7ecef]

                dark:border-[#33483f]
                dark:bg-[#17221e]
              "
            >
              <ThemeToggle />
            </div>

            <div
              className="
                rounded-full

                border
                border-[#aab8b2]

                bg-[#e7ecef]

                dark:border-[#33483f]
                dark:bg-[#17221e]
              "
            >
              <NotificationBell />
            </div>

            <span
              className="
                mx-1
                hidden
                h-6
                w-px

                bg-[#aebcb6]/70

                dark:bg-white/10

                sm:block
              "
            />

            <button
              type="button"
              onClick={() => void logout()}
              disabled={signingOut}
              className="
                flex
                h-10
                items-center
                justify-center
                gap-2

                rounded-full

                border
                border-[#aab8b2]

                bg-transparent

                px-3.5

                text-sm
                font-semibold

                text-[#45554d]

                transition-all

                hover:bg-[#20352d]
                hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-[#33483f]
                dark:text-[#c7d5ce]

                dark:hover:bg-[#d6e3dd]
                dark:hover:text-[#10261f]
              "
            >
              {signingOut ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}

              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Sign out
              </span>
            </button>
          </div>
        </header>

        {/* Main dashboard content */}
        <main
          className="
            relative
            flex-1

            overflow-hidden

            p-4

            sm:p-6
            lg:p-8
          "
        >
          {/* Background atmosphere */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              overflow-hidden
            "
          >
            <div
              className="
                absolute
                -right-40
                -top-32

                size-[460px]

                rounded-full

                bg-[#789889]/10

                blur-[130px]

                dark:bg-[#28503f]/7
              "
            />

            <div
              className="
                absolute
                -bottom-52
                -left-40

                size-[500px]

                rounded-full

                bg-[#9aafa5]/8

                blur-[140px]

                dark:bg-[#163d2c]/7
              "
            />
          </div>

          <div
            className="
              relative
              z-10

              mx-auto
              w-full
              max-w-[1600px]
            "
          >
            <Outlet />
          </div>
        </main>

        {/* Compact footer */}
        <footer
          className="
            border-t
            border-[#aebcb6]/45

            bg-[#d1d8dc]/80

            px-4
            py-3

            text-center
            text-[11px]

            text-[#66766f]

            sm:px-6
            lg:px-8

            dark:border-white/10
            dark:bg-[#101916]
            dark:text-[#81958b]
          "
        >
          CrowdSpark · Secure crowdfunding operations and transparent impact
        </footer>
      </div>
    </div>
  );
}
