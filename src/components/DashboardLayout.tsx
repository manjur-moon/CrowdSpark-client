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
  Sparkles,
  UserRound,
  Users,
  WalletCards,
  X
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import { useState } from "react";

import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();

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

  const baseRoute = `/dashboard/${profile.role}`;

  const exactItem = nav[profile.role].find(([, to]) => location.pathname === to);

  const nestedItem =
    exactItem ??
    nav[profile.role].find(([, to]) => to !== baseRoute && location.pathname.startsWith(`${to}/`));

  const currentPageLabel = nestedItem?.[0] ?? roleLabel;

  const avatarImage = profile.image || sessionUser?.image || "";

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

        dark:bg-[#09110e]
        dark:text-[#edf4f0]
      "
    >
      {/* MOBILE OVERLAY */}
      {open ? (
        <button
          type="button"
          aria-label="Close dashboard menu overlay"
          className="
            fixed
            inset-0
            z-40

            bg-[#06100c]/65

            backdrop-blur-[3px]

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
          w-[274px]
          flex-col

          overflow-hidden

          border-r
          border-white/[0.08]

          bg-gradient-to-b
          from-[#14352a]
          via-[#102d23]
          to-[#0b241c]

          text-[#edf4f0]

          shadow-[18px_0_65px_rgba(10,35,26,0.13)]

          transition-transform
          duration-300

          dark:from-[#081610]
          dark:via-[#091812]
          dark:to-[#07110d]

          dark:shadow-[20px_0_70px_rgba(0,0,0,0.34)]

          lg:translate-x-0

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* SIDEBAR ATMOSPHERE */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-28
            top-16

            size-72

            rounded-full

            bg-[#9cb7aa]/[0.10]

            blur-[90px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-16
            right-[-150px]

            size-80

            rounded-full

            bg-[#648e7d]/[0.10]

            blur-[100px]
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

            px-3.5
            pb-3
          "
        >
          {/* BRAND */}
          <div
            className="
              flex
              h-[68px]
              items-center
              justify-between

              border-b
              border-white/[0.08]

              px-1.5
            "
          >
            <Link
              to="/"
              aria-label="CrowdSpark home"
              className="
                transition-opacity

                hover:opacity-85
              "
            >
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

                transition-all

                hover:bg-white/10

                lg:hidden
              "
            >
              <X className="size-[17px]" />
            </button>
          </div>

          {/* ACCOUNT CARD */}
          <div
            className="
              mt-4

              rounded-[22px]

              border
              border-white/[0.10]

              bg-white/[0.055]

              p-3.5

              shadow-[0_12px_40px_rgba(0,0,0,0.06)]

              backdrop-blur-xl
            "
          >
            <Link
              to="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="
                group

                flex
                items-center
                gap-3
              "
            >
              {avatarImage ? (
                <img
                  src={avatarImage}
                  alt={profile.name}
                  className="
                    size-11
                    shrink-0

                    rounded-[14px]

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

                    rounded-[14px]

                    bg-[#d9e7e0]

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

                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.17em]

                    text-[#98b0a5]
                  "
                >
                  {profile.role}
                </p>
              </div>

              <ChevronRight
                className="
                  size-3.5
                  shrink-0

                  text-[#79978a]

                  transition-transform

                  group-hover:translate-x-0.5
                "
              />
            </Link>

            <div
              className="
                mt-3.5

                border-t
                border-white/[0.08]

                pt-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.17em]

                    text-[#829d91]
                  "
                >
                  Account status
                </p>

                <span
                  className="
                    size-1.5
                    rounded-full

                    bg-[#aed0bf]

                    shadow-[0_0_0_4px_rgba(174,208,191,0.08)]
                  "
                />
              </div>

              <p
                className="
                  mt-1.5

                  text-[11px]
                  font-semibold
                  leading-5

                  text-[#d3e1da]
                "
              >
                {balanceLabel}
              </p>
            </div>
          </div>

          {/* NAVIGATION */}
          <div
            className="
              mt-5

              flex
              min-h-0
              flex-1
              flex-col
            "
          >
            <div
              className="
                flex
                items-center
                justify-between

                px-2.5
              "
            >
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.23em]

                  text-[#759185]
                "
              >
                Workspace
              </p>

              <Sparkles
                className="
                  size-3

                  text-[#759185]
                "
              />
            </div>

            <nav
              aria-label={`${profile.role} dashboard navigation`}
              className="
                dashboard-scrollbar

                mt-2.5

                flex-1

                space-y-1

                overflow-y-auto

                pr-0.5
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
                      min-h-[43px]
                      items-center
                      gap-3

                      overflow-hidden

                      rounded-[13px]

                      px-3

                      text-[13px]
                      font-semibold

                      transition-all
                      duration-200

                      ${
                        isActive
                          ? `
                              bg-[#dde8e3]
                              text-[#10261f]

                              shadow-[0_10px_26px_rgba(0,0,0,0.10)]
                            `
                          : `
                              text-[#bdd0c7]

                              hover:bg-white/[0.065]
                              hover:text-white
                            `
                      }
                    `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="
                              absolute
                              left-1.5
                              top-1/2

                              h-5
                              w-[3px]

                              -translate-y-1/2

                              rounded-full

                              bg-[#315b4a]
                            "
                        />
                      ) : null}

                      <span
                        className={`
                            flex
                            size-7
                            shrink-0
                            items-center
                            justify-center

                            rounded-lg

                            transition-all

                            ${
                              isActive
                                ? `
                                    bg-[#c8dbd1]
                                    text-[#173329]
                                  `
                                : `
                                    bg-transparent
                                    text-[#aac0b5]

                                    group-hover:bg-white/[0.06]
                                    group-hover:text-white
                                  `
                            }
                          `}
                      >
                        <Icon className="size-[15px]" strokeWidth={isActive ? 2.1 : 1.8} />
                      </span>

                      <span className="flex-1 truncate">{label}</span>

                      <ChevronRight
                        className={`
                            size-3.5
                            shrink-0

                            transition-all
                            duration-200

                            ${
                              isActive
                                ? `
                                    translate-x-0
                                    opacity-80
                                  `
                                : `
                                    -translate-x-1
                                    opacity-0

                                    group-hover:translate-x-0
                                    group-hover:opacity-50
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

          {/* SIDEBAR FOOTER */}
          <div
            className="
              mt-3

              border-t
              border-white/[0.08]

              pt-3
            "
          >
            <button
              type="button"
              onClick={() => void logout()}
              disabled={signingOut}
              className="
                group

                flex
                min-h-[42px]
                w-full
                items-center
                gap-3

                rounded-[13px]

                px-3

                text-[13px]
                font-semibold

                text-[#bbcec5]

                transition-all

                hover:bg-white/[0.065]
                hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span
                className="
                  flex
                  size-7
                  items-center
                  justify-center

                  rounded-lg

                  transition

                  group-hover:bg-white/[0.06]
                "
              >
                {signingOut ? (
                  <LoaderCircle className="size-[15px] animate-spin" />
                ) : (
                  <LogOut className="size-[15px]" />
                )}
              </span>

              <span>{signingOut ? "Signing out..." : "Sign out"}</span>
            </button>

            <div
              className="
                mt-2

                flex
                items-center
                justify-between

                px-3

                text-[9px]

                text-[#6f8a7e]
              "
            >
              <span>© {new Date().getFullYear()} CrowdSpark</span>

              <span>v1.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div
        className="
          flex
          min-h-screen
          flex-col

          lg:pl-[274px]
        "
      >
        {/* TOPBAR */}
        <header
          className="
            sticky
            top-0
            z-30

            flex
            h-[68px]
            items-center

            border-b
            border-[#aab8b2]/40

            bg-[#d1d8dc]/88

            px-4

            backdrop-blur-2xl

            sm:px-6
            lg:px-7
            xl:px-8

            dark:border-white/[0.08]
            dark:bg-[#0e1713]/90
          "
        >
          {/* MOBILE MENU */}
          <button
            type="button"
            aria-label="Open dashboard menu"
            onClick={() => setOpen(true)}
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center

              rounded-xl

              border
              border-[#aab8b2]/70

              bg-[#e5ebe8]/80

              text-[#20352d]

              transition-all

              hover:bg-white

              dark:border-[#31463c]
              dark:bg-[#17221e]
              dark:text-[#d6e3dd]

              lg:hidden
            "
          >
            <Menu className="size-[17px]" />
          </button>

          {/* CONTEXT */}
          <div
            className="
              ml-3
              min-w-0

              lg:ml-0
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <p
                className="
                  hidden

                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]

                  text-[#6b7e75]

                  sm:block

                  dark:text-[#8da096]
                "
              >
                {roleLabel}
              </p>

              <span
                className="
                  hidden
                  size-1
                  rounded-full

                  bg-[#6e887c]

                  sm:block
                "
              />

              <p
                className="
                  truncate

                  text-[13px]
                  font-semibold

                  text-[#24352e]

                  dark:text-[#edf4f0]
                "
              >
                {currentPageLabel}
              </p>
            </div>

            <div
              className="
                mt-1
                hidden

                items-center
                gap-2

                lg:flex
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
                  text-[10px]
                  font-medium

                  text-[#6d7c75]

                  dark:text-[#8fa39a]
                "
              >
                {balanceLabel}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
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
                flex
                items-center
                gap-1

                rounded-2xl

                border
                border-[#aab8b2]/55

                bg-[#e3e9e6]/65

                p-1

                shadow-[0_5px_18px_rgba(20,45,36,0.04)]

                dark:border-[#30443b]
                dark:bg-[#15201c]/80
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center

                  rounded-xl
                "
              >
                <ThemeToggle />
              </div>

              <div
                className="
                  h-5
                  w-px

                  bg-[#a9b7b1]/55

                  dark:bg-white/10
                "
              />

              <div
                className="
                  flex
                  items-center
                  justify-center

                  rounded-xl
                "
              >
                <NotificationBell />
              </div>
            </div>

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
                border-[#a6b5ae]/65

                bg-transparent

                px-3.5

                text-xs
                font-semibold

                text-[#405149]

                transition-all

                hover:-translate-y-0.5
                hover:bg-[#173329]
                hover:text-white

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:border-[#31463c]
                dark:text-[#c5d4cd]

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

        {/* CONTENT */}
        <main
          className="
            relative
            flex-1

            overflow-hidden

            px-4
            py-5

            sm:px-6
            sm:py-6

            lg:px-7
            lg:py-7

            xl:px-8
          "
        >
          {/* ATMOSPHERE */}
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
                -right-44
                -top-36

                size-[520px]

                rounded-full

                bg-[#789889]/[0.10]

                blur-[140px]

                dark:bg-[#28503f]/[0.07]
              "
            />

            <div
              className="
                absolute
                -bottom-56
                -left-48

                size-[560px]

                rounded-full

                bg-[#9aafa5]/[0.08]

                blur-[150px]

                dark:bg-[#163d2c]/[0.07]
              "
            />

            <div
              className="
                absolute
                left-[46%]
                top-[38%]

                size-[380px]

                rounded-full

                bg-white/[0.12]

                blur-[150px]

                dark:bg-transparent
              "
            />
          </div>

          <div
            className="
              relative
              z-10

              mx-auto
              w-full

              max-w-[1740px]
            "
          >
            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer
          className="
            border-t
            border-[#aab8b2]/35

            bg-[#d1d8dc]/75

            px-5
            py-2.5

            dark:border-white/[0.07]
            dark:bg-[#0d1612]
          "
        >
          <div
            className="
              mx-auto

              flex
              w-full
              max-w-[1740px]
              items-center
              justify-between
              gap-4

              text-[9px]
              font-medium

              text-[#708079]

              dark:text-[#7e9288]
            "
          >
            <span>CrowdSpark operational workspace</span>

            <span
              className="
                hidden
                sm:inline
              "
            >
              Secure crowdfunding · transparent impact
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
