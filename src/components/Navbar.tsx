import { ArrowRight, Bell, Code2, LoaderCircle, LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { dashboardPath, useAuth } from "../lib/AuthContext";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const publicLinks = [
  {
    label: "Explore",
    to: "/campaigns"
  },
  {
    label: "How it works",
    to: "/#how-it-works"
  },
  {
    label: "About",
    to: "/about"
  },
  {
    label: "Contact",
    to: "/contact"
  }
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { current, sessionUser, signOut } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";

  const useCinematicNavbar = isHome || isAbout;

  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  const accountDestination = current?.profile ? dashboardPath(current.profile.role) : "/onboarding";

  const accountLabel = current?.profile ? "Dashboard" : "Finish setup";

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");

    const handleChange = () => {
      if (desktopQuery.matches) {
        setOpen(false);
      }
    };

    handleChange();

    desktopQuery.addEventListener("change", handleChange);

    return () => {
      desktopQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const logout = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut();

      setOpen(false);

      navigate("/", {
        replace: true
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) => `
    inline-flex
    items-center
    justify-center

    rounded-full

    border
    border-white/10

    bg-[#123229]/80

    px-4
    py-2.5

    text-sm
    font-semibold
    text-white

    backdrop-blur-xl

    transition-all
    duration-200

    hover:-translate-y-0.5
    hover:border-[#315f50]
    hover:bg-[#194438]

    ${
      isActive
        ? `
            border-[#315f50]
            bg-[#194438]
          `
        : ""
    }
  `;

  const mobileNavigationClass = `
    group

    flex
    min-h-[42px]
    items-center
    justify-between

    rounded-[14px]

    border
    border-white/10

    bg-white/[0.035]

    px-3.5

    text-[13px]
    font-semibold

    text-white/90

    transition-all

    hover:bg-white/[0.07]
    hover:text-white
  `;

  return (
    <>
      {/* FIXED NAVBAR */}
      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50

          w-full

          border-b
          border-white/10

          bg-[#08130f]/88

          shadow-[0_8px_30px_rgba(0,0,0,0.08)]

          backdrop-blur-2xl
        "
      >
        <div
          className="
            container-app
            relative

            flex
            h-[64px]
            items-center
            justify-between

            gap-3

            sm:h-[68px]

            xl:h-[92px]
          "
        >
          {/* DESKTOP LEFT */}
          <nav
            aria-label="Primary navigation"
            className="
              hidden
              items-center
              gap-2

              xl:flex
            "
          >
            <NavLink to="/campaigns" className={desktopLinkClass}>
              Explore
            </NavLink>

            <Link
              to="/#how-it-works"
              className="
                inline-flex
                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-[#123229]/80

                px-4
                py-2.5

                text-sm
                font-semibold
                text-white

                backdrop-blur-xl

                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:border-[#315f50]
                hover:bg-[#194438]
              "
            >
              How it works
            </Link>
          </nav>

          {/* MAIN LOGO */}
          <div
            className="
              shrink-0

              xl:absolute
              xl:left-1/2
              xl:-translate-x-1/2
            "
          >
            <Logo light />
          </div>

          {/* DESKTOP RIGHT */}
          <div
            className="
              hidden
              items-center
              gap-2

              xl:flex
            "
          >
            <NavLink to="/about" className={desktopLinkClass}>
              About
            </NavLink>

            <NavLink to="/contact" className={desktopLinkClass}>
              Contact
            </NavLink>

            {!sessionUser ? (
              <>
                <NavLink
                  to="/login"
                  className="
                    inline-flex
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-white/10

                    bg-[#123229]/80

                    px-4
                    py-2.5

                    text-sm
                    font-semibold
                    text-white

                    backdrop-blur-xl

                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:bg-[#194438]
                  "
                >
                  Sign in
                </NavLink>

                <NavLink
                  to="/register"
                  className="
                    inline-flex
                    items-center
                    justify-center

                    rounded-full

                    bg-[#b5c8be]

                    px-5
                    py-2.5

                    text-sm
                    font-semibold

                    text-[#10261f]

                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:bg-[#d2e1da]
                  "
                >
                  Get started
                </NavLink>
              </>
            ) : (
              <>
                {current?.profile?.role === "supporter" ? (
                  <span
                    className="
                      rounded-full

                      bg-[#91aa9d]

                      px-4
                      py-2.5

                      text-xs
                      font-semibold

                      text-[#10261f]
                    "
                  >
                    {current.profile.credits.toLocaleString()} credits
                  </span>
                ) : null}

                <NavLink to={accountDestination} className={desktopLinkClass}>
                  {accountLabel}
                </NavLink>

                {current?.profile ? (
                  <NavLink
                    to="/dashboard/notifications"
                    aria-label="Notifications"
                    className={desktopLinkClass}
                  >
                    <Bell className="size-[17px]" />
                  </NavLink>
                ) : null}

                <button
                  type="button"
                  onClick={() => void logout()}
                  disabled={signingOut}
                  aria-label="Sign out"
                  className="
                    flex
                    size-10
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-white/10

                    bg-[#123229]/80

                    text-white

                    transition-all

                    hover:bg-[#194438]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {signingOut ? (
                    <LoaderCircle className="size-[17px] animate-spin" />
                  ) : (
                    <LogOut className="size-[17px]" />
                  )}
                </button>
              </>
            )}

            <ThemeToggle
              className="
                !rounded-full
                !border-white/10
                !bg-[#91aa9d]
                !text-[#10261f]

                hover:!bg-[#aec1b7]
              "
            />

            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="CrowdSpark GitHub"
              className="
                flex
                size-10
                items-center
                justify-center

                rounded-full

                bg-[#91aa9d]

                text-[#10261f]

                transition-all

                hover:-translate-y-0.5
                hover:bg-[#aec1b7]
              "
            >
              <Code2 className="size-[17px]" />
            </a>
          </div>

          {/* MOBILE ONLY */}
          <div
            className="
              ml-auto

              flex
              items-center
              gap-2

              xl:hidden
            "
          >
            <ThemeToggle
              className="
                !size-10
                !rounded-full

                !border-white/10

                !bg-[#91aa9d]

                !text-[#10261f]

                hover:!bg-[#aec1b7]
              "
            />

            <button
              type="button"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation-drawer"
              onClick={() => setOpen((value) => !value)}
              className="
                flex
                size-10
                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-[#a9bdb3]

                text-[#10261f]

                transition-all

                hover:bg-[#c5d6ce]
              "
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* FIXED NAVBAR SPACER */}
      {!useCinematicNavbar ? (
        <div
          aria-hidden="true"
          className="
            h-[64px]

            sm:h-[68px]

            xl:h-[92px]
          "
        />
      ) : null}

      {/* MOBILE BACKDROP */}
      {open ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[55]

            bg-[#020805]/65

            backdrop-blur-[3px]

            xl:hidden
          "
        />
      ) : null}

      {/* MOBILE DRAWER */}
      <aside
        id="mobile-navigation-drawer"
        aria-label="Mobile navigation"
        className={`
          fixed
          bottom-0
          right-0
          top-0
          z-[60]

          flex
          w-[calc(100vw-60px)]
          max-w-[330px]
          flex-col

          border-l
          border-white/10

          bg-[linear-gradient(180deg,#08140f_0%,#101914_50%,#111914_100%)]

          text-white

          shadow-[-24px_0_70px_rgba(0,0,0,0.34)]

          backdrop-blur-2xl

          transition-transform
          duration-300
          ease-out

          xl:hidden

          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* DRAWER HEADER — NO EXTRA LOGO */}
        <div
          className="
            flex
            min-h-[64px]
            shrink-0
            items-center
            justify-between

            border-b
            border-white/[0.08]

            px-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#8fa99d]
              "
            >
              Navigation
            </p>

            <p
              className="
                mt-0.5

                truncate

                text-[11px]

                text-white/70
              "
            >
              Explore CrowdSpark
            </p>
          </div>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center

              rounded-full

              border
              border-white/10

              bg-white/[0.04]

              text-white

              transition-all

              hover:bg-white/[0.09]
            "
          >
            <X className="size-4" />
          </button>
        </div>

        {/* DRAWER BODY */}
        <div
          className="
            dashboard-scrollbar

            min-h-0
            flex-1

            overflow-y-auto
            overscroll-contain

            px-3
            py-3
          "
        >
          {/* NAVIGATION */}
          <nav
            className="
              grid
              gap-2
            "
          >
            {publicLinks.map((item) => {
              if (item.to.includes("#")) {
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={mobileNavigationClass}
                  >
                    <span>{item.label}</span>

                    <ArrowRight
                      className="
                          size-3.5

                          text-white/45

                          transition-transform

                          group-hover:translate-x-0.5
                        "
                    />
                  </Link>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                      ${mobileNavigationClass}

                      ${
                        isActive
                          ? `
                              border-[#7fa393]/30
                              bg-white/[0.08]
                            `
                          : ""
                      }
                    `}
                >
                  <span>{item.label}</span>

                  <ArrowRight
                    className="
                        size-3.5

                        text-white/45

                        transition-transform

                        group-hover:translate-x-0.5
                      "
                  />
                </NavLink>
              );
            })}
          </nav>

          {/* QUICK ACCESS */}
          <section
            className="
              mt-4

              rounded-[20px]

              border
              border-white/10

              bg-white/[0.035]

              p-3
            "
          >
            <p
              className="
                px-1

                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]

                text-[#91aa9d]
              "
            >
              Quick access
            </p>

            <div
              className="
                mt-3

                grid
                gap-2
              "
            >
              {!sessionUser ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      min-h-[38px]
                      items-center
                      justify-center

                      rounded-full

                      border
                      border-white/10

                      bg-white/[0.035]

                      px-4

                      text-[12px]
                      font-semibold

                      text-white

                      transition-all

                      hover:bg-white/[0.08]
                    "
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      min-h-[38px]
                      items-center
                      justify-center

                      rounded-full

                      bg-[#d6e3dd]

                      px-4

                      text-[12px]
                      font-semibold

                      text-[#10261f]

                      transition-all

                      hover:bg-[#edf4f0]
                    "
                  >
                    Get started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={accountDestination}
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      min-h-[40px]
                      items-center
                      justify-center
                      gap-2

                      rounded-full

                      bg-[#d6e3dd]

                      px-4

                      text-[12px]
                      font-semibold

                      text-[#10261f]
                    "
                  >
                    <UserRound className="size-4" />

                    {accountLabel}
                  </Link>

                  {current?.profile ? (
                    <Link
                      to="/dashboard/notifications"
                      onClick={() => setOpen(false)}
                      className="
                        flex
                        min-h-[40px]
                        items-center
                        justify-center
                        gap-2

                        rounded-full

                        border
                        border-white/10

                        bg-white/[0.035]

                        px-4

                        text-[12px]
                        font-semibold

                        text-white
                      "
                    >
                      <Bell className="size-4" />
                      Notifications
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={signingOut}
                    className="
                      flex
                      min-h-[40px]
                      items-center
                      justify-center
                      gap-2

                      rounded-full

                      border
                      border-white/10

                      bg-white/[0.035]

                      px-4

                      text-[12px]
                      font-semibold

                      text-white

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {signingOut ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <LogOut className="size-4" />
                    )}

                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </>
              )}

              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="
                  flex
                  min-h-[38px]
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  border
                  border-white/10

                  bg-transparent

                  px-4

                  text-[12px]
                  font-semibold

                  text-white/90

                  transition-all

                  hover:bg-white/[0.05]
                "
              >
                <Code2 className="size-4" />
                GitHub
              </a>
            </div>
          </section>
        </div>

        {/* DRAWER FOOTER */}
        <div
          className="
            shrink-0

            border-t
            border-white/[0.08]

            p-3
          "
        >
          <Link
            to="/campaigns"
            onClick={() => setOpen(false)}
            className="
              group

              flex
              min-h-[40px]
              items-center
              justify-between

              rounded-[13px]

              border
              border-white/10

              bg-white/[0.035]

              px-3.5

              text-[12px]
              font-semibold

              text-white

              transition

              hover:bg-white/[0.07]
            "
          >
            <span>Explore campaigns</span>

            <ArrowRight
              className="
                size-3.5

                text-white/50

                transition-transform

                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>
      </aside>
    </>
  );
}
