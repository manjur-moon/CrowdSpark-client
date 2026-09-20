import { Bell, Code2, LoaderCircle, LogOut, Menu, UserRound, X } from "lucide-react";

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

  const navigate = useNavigate();

  const location = useLocation();

  const isHome = location.pathname === "/";

  const isAbout = location.pathname === "/about";

  /*
   * Home and About share the cinematic,
   * transparent navigation treatment.
   */
  const useCinematicNavbar = isHome || isAbout;

  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  const accountDestination = current?.profile ? dashboardPath(current.profile.role) : "/onboarding";

  const accountLabel = current?.profile ? "Dashboard" : "Finish setup";

  const closeMenu = () => {
    setOpen(false);
  };

  /*
   * Always close the mobile navigation
   * after the URL changes.
   */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, location.hash]);

  /*
   * If the viewport grows into desktop
   * mode while the menu is open, reset
   * the mobile state.
   */
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");

    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        setOpen(false);
      }
    };

    handleDesktopChange();

    desktopQuery.addEventListener("change", handleDesktopChange);

    return () => {
      desktopQuery.removeEventListener("change", handleDesktopChange);
    };
  }, []);

  /*
   * Prevent the page behind the mobile
   * navigation from scrolling and support
   * keyboard dismissal.
   */
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

  const logout = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut();

      closeMenu();

      navigate("/", {
        replace: true
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (useCinematicNavbar) {
      return `
        inline-flex
        items-center
        justify-center

        rounded-full

        border
        border-white/10

        bg-[#143229]/80

        px-4
        py-2.5

        text-sm
        font-semibold
        text-white

        backdrop-blur-xl

        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-[#2f5c4d]
        hover:bg-[#1b4538]

        ${
          isActive
            ? `
                border-[#315f50]
                bg-[#1b4538]
              `
            : ""
        }
      `;
    }

    return `
      inline-flex
      items-center
      justify-center

      rounded-full

      px-4
      py-2.5

      text-sm
      font-semibold

      transition-all
      duration-200

      ${
        isActive
          ? `
              bg-[#20352d]
              text-white

              dark:bg-[#d6e3dd]
              dark:text-[#10261f]
            `
          : `
              text-[#45545b]

              hover:bg-white/40
              hover:text-[#172126]

              dark:text-[#d6d6d6]
              dark:hover:bg-white/5
              dark:hover:text-white
            `
      }
    `;
  };

  const secondaryDesktopLink = useCinematicNavbar
    ? `
          rounded-full

          border
          border-white/10

          bg-[#143229]/80

          px-4
          py-2.5

          text-sm
          font-semibold
          text-white

          backdrop-blur-xl

          transition-all
          duration-200

          hover:-translate-y-0.5
          hover:border-[#2f5c4d]
          hover:bg-[#1b4538]
        `
    : `
          rounded-full

          px-4
          py-2.5

          text-sm
          font-semibold

          text-[#45545b]

          transition-all
          duration-200

          hover:bg-white/40
          hover:text-[#172126]

          dark:text-[#d6d6d6]
          dark:hover:bg-white/5
          dark:hover:text-white
        `;

  const mobileBasicLink = useCinematicNavbar
    ? `
          rounded-2xl

          border
          border-white/10

          bg-[#143229]/70

          px-4
          py-3.5

          text-sm
          font-semibold
          text-white

          transition

          hover:bg-[#1b4538]
        `
    : `
          rounded-2xl

          px-4
          py-3.5

          text-sm
          font-semibold

          text-[#172126]

          transition

          hover:bg-white/40

          dark:text-white
          dark:hover:bg-white/5
        `;

  return (
    <header
      className={
        useCinematicNavbar
          ? `
              absolute
              left-0
              right-0
              top-0
              z-50

              w-full

              border-b
              border-white/15

              bg-[#07140f]/20

              backdrop-blur-md
            `
          : `
              sticky
              top-0
              z-50

              w-full

              border-b
              border-[#81958d]/25

              bg-[#d1d8dc]/75

              backdrop-blur-2xl

              dark:border-white/10
              dark:bg-[#0d1b16]/88
            `
      }
    >
      <div
        className="
          container-app
          relative

          flex
          h-[78px]
          items-center
          justify-between

          gap-3

          sm:h-[84px]

          xl:h-[94px]
        "
      >
        {/* DESKTOP LEFT NAV */}
        <nav
          aria-label="Primary navigation"
          className="
            hidden
            items-center
            gap-1.5

            xl:flex
          "
        >
          <NavLink to="/campaigns" className={desktopLinkClass}>
            Explore
          </NavLink>

          <Link to="/#how-it-works" className={secondaryDesktopLink}>
            How it works
          </Link>
        </nav>

        {/* LOGO */}
        <div
          className="
            shrink-0

            xl:absolute
            xl:left-1/2
            xl:-translate-x-1/2
          "
        >
          <Logo light={useCinematicNavbar} />
        </div>

        {/* DESKTOP RIGHT NAV */}
        <div
          className="
            hidden
            items-center
            gap-1.5

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
                className={
                  useCinematicNavbar
                    ? `
                        rounded-full

                        border
                        border-white/10

                        bg-[#143229]/80

                        px-4
                        py-2.5

                        text-sm
                        font-semibold
                        text-white

                        backdrop-blur-xl

                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:border-[#2f5c4d]
                        hover:bg-[#1b4538]
                      `
                    : `
                        rounded-full

                        border
                        border-[#b8c5ca]

                        bg-transparent

                        px-4
                        py-2.5

                        text-sm
                        font-semibold

                        text-[#172126]

                        transition-all
                        duration-200

                        hover:bg-white/50

                        dark:border-[#465550]
                        dark:text-white
                        dark:hover:bg-white/5
                      `
                }
              >
                Sign in
              </NavLink>

              <NavLink
                to="/register"
                className={
                  useCinematicNavbar
                    ? `
                        rounded-full

                        bg-[#91aa9d]

                        px-4
                        py-2.5

                        text-sm
                        font-semibold
                        text-[#10261f]

                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:bg-[#a9beb3]
                      `
                    : `
                        rounded-full

                        bg-[#20352d]

                        px-4
                        py-2.5

                        text-sm
                        font-semibold
                        text-white

                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:bg-[#314c42]

                        dark:bg-[#d6e3dd]
                        dark:text-[#10261f]
                        dark:hover:bg-[#eef5f1]
                      `
                }
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

                    px-3.5
                    py-2

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
                  className={desktopLinkClass}
                  aria-label="Notifications"
                >
                  <Bell className="size-[18px]" />
                </NavLink>
              ) : null}

              <button
                type="button"
                onClick={() => void logout()}
                disabled={signingOut}
                aria-label="Sign out"
                className={
                  useCinematicNavbar
                    ? `
                        flex
                        size-10
                        items-center
                        justify-center

                        rounded-full

                        border
                        border-white/10

                        bg-[#143229]/80

                        text-white

                        backdrop-blur-xl

                        transition-all
                        duration-200

                        hover:bg-[#1b4538]

                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      `
                    : `
                        flex
                        size-10
                        items-center
                        justify-center

                        rounded-full

                        bg-[#20352d]

                        text-white

                        transition-all
                        duration-200

                        hover:bg-[#314c42]

                        disabled:cursor-not-allowed
                        disabled:opacity-60

                        dark:bg-[#d6e3dd]
                        dark:text-[#10261f]
                      `
                }
              >
                {signingOut ? (
                  <LoaderCircle className="size-[18px] animate-spin" />
                ) : (
                  <LogOut className="size-[18px]" />
                )}
              </button>
            </>
          )}

          <ThemeToggle
            className={
              useCinematicNavbar
                ? `
                    !rounded-full
                    !border-white/10
                    !bg-[#91aa9d]
                    !text-[#10261f]

                    transition-all
                    duration-200

                    hover:!bg-[#a9beb3]
                  `
                : `
                    !rounded-full
                    !border-[#b8c5ca]
                    !bg-[#e7ecef]
                    !text-[#20352d]

                    dark:!border-[#465550]
                    dark:!bg-[#17221e]
                    dark:!text-[#d6e3dd]
                  `
            }
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
              duration-200

              hover:-translate-y-0.5
              hover:bg-[#a9beb3]
            "
          >
            <Code2 className="size-[18px]" />
          </a>
        </div>

        {/* MOBILE / TABLET CONTROLS */}
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
            className={
              useCinematicNavbar
                ? `
                    !rounded-full
                    !border-white/10
                    !bg-[#91aa9d]
                    !text-[#10261f]
                  `
                : `
                    !rounded-full
                    !border-[#b8c5ca]
                    !bg-[#e7ecef]
                    !text-[#20352d]

                    dark:!border-[#465550]
                    dark:!bg-[#17221e]
                    dark:!text-[#d6e3dd]
                  `
            }
          />

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="public-mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="
              flex
              size-10
              items-center
              justify-center

              rounded-full

              border
              border-[#91aa9d]/30

              bg-[#91aa9d]

              text-[#10261f]

              shadow-[0_7px_22px_rgba(16,38,31,0.12)]

              transition-all

              hover:bg-[#a9beb3]
            "
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET MENU */}
      {open ? (
        <div
          id="public-mobile-menu"
          className={
            useCinematicNavbar
              ? `
                  absolute
                  left-0
                  right-0
                  top-full

                  max-h-[calc(100dvh-78px)]

                  overflow-y-auto

                  border-t
                  border-white/10

                  bg-[#0b2119]/96

                  shadow-[0_24px_70px_rgba(0,0,0,0.30)]

                  backdrop-blur-2xl

                  sm:max-h-[calc(100dvh-84px)]

                  xl:hidden
                `
              : `
                  absolute
                  left-0
                  right-0
                  top-full

                  max-h-[calc(100dvh-78px)]

                  overflow-y-auto

                  border-t
                  border-[#aebdb6]/55

                  bg-[#d9e0e3]/97

                  shadow-[0_24px_70px_rgba(20,45,36,0.16)]

                  backdrop-blur-2xl

                  sm:max-h-[calc(100dvh-84px)]

                  dark:border-[#2d3935]
                  dark:bg-[#101916]/98

                  xl:hidden
                `
          }
        >
          <nav
            aria-label="Mobile navigation"
            className="
              container-app

              grid
              gap-2

              py-4
              sm:py-5
            "
          >
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  useCinematicNavbar
                    ? `
                          rounded-2xl

                          border
                          border-white/10

                          px-4
                          py-3.5

                          text-sm
                          font-semibold
                          text-white

                          transition

                          ${isActive ? "bg-[#1b4538]" : "bg-[#143229]/70 hover:bg-[#1b4538]"}
                        `
                    : `
                          rounded-2xl

                          px-4
                          py-3.5

                          text-sm
                          font-semibold

                          transition

                          ${
                            isActive
                              ? `
                                  bg-[#20352d]
                                  text-white

                                  dark:bg-[#d6e3dd]
                                  dark:text-[#10261f]
                                `
                              : `
                                  text-[#172126]

                                  hover:bg-white/45

                                  dark:text-white
                                  dark:hover:bg-white/5
                                `
                          }
                        `
                }
              >
                {link.label}
              </NavLink>
            ))}

            <Link to="/#how-it-works" onClick={closeMenu} className={mobileBasicLink}>
              How it works
            </Link>

            {sessionUser ? (
              <div
                className={
                  useCinematicNavbar
                    ? `
                        mt-2

                        grid
                        gap-2

                        border-t
                        border-white/10

                        pt-4
                      `
                    : `
                        mt-2

                        grid
                        gap-2

                        border-t
                        border-[#aebdb6]

                        pt-4

                        dark:border-[#2d3935]
                      `
                }
              >
                {current?.profile?.role === "supporter" ? (
                  <div
                    className="
                      flex
                      items-center
                      justify-between

                      rounded-2xl

                      bg-[#91aa9d]/20

                      px-4
                      py-3

                      text-xs
                      font-semibold

                      text-[#173329]

                      dark:text-[#c9ddd3]
                    "
                  >
                    <span>Available credits</span>

                    <strong>{current.profile.credits.toLocaleString()}</strong>
                  </div>
                ) : null}

                <Link
                  to={accountDestination}
                  onClick={closeMenu}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
                          min-h-11
                          items-center
                          justify-center

                          rounded-full

                          bg-[#91aa9d]

                          px-5
                          py-3

                          text-sm
                          font-semibold
                          text-[#10261f]
                        `
                      : "editorial-button"
                  }
                >
                  {accountLabel}
                </Link>

                {current?.profile ? (
                  <>
                    <Link to="/dashboard/profile" onClick={closeMenu} className={mobileBasicLink}>
                      <span
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <UserRound className="size-4" />
                        Profile
                      </span>
                    </Link>

                    <Link
                      to="/dashboard/notifications"
                      onClick={closeMenu}
                      className={mobileBasicLink}
                    >
                      <span
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >
                        <Bell className="size-4" />
                        Notifications
                      </span>
                    </Link>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => void logout()}
                  disabled={signingOut}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2

                          rounded-full

                          border
                          border-white/10

                          bg-[#143229]/80

                          px-5
                          py-3

                          text-sm
                          font-semibold
                          text-white

                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `
                      : `
                          flex
                          min-h-11
                          items-center
                          justify-center
                          gap-2

                          rounded-full

                          border
                          border-[var(--editorial-border)]

                          px-5
                          py-3

                          text-sm
                          font-semibold

                          text-[var(--editorial-text)]

                          transition

                          hover:bg-white/40

                          disabled:cursor-not-allowed
                          disabled:opacity-60

                          dark:hover:bg-white/5
                        `
                  }
                >
                  {signingOut ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}

                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : (
              <div
                className={
                  useCinematicNavbar
                    ? `
                        mt-2

                        grid
                        grid-cols-2
                        gap-2

                        border-t
                        border-white/10

                        pt-4
                      `
                    : `
                        mt-2

                        grid
                        grid-cols-2
                        gap-2

                        border-t
                        border-[#aebdb6]

                        pt-4

                        dark:border-[#2d3935]
                      `
                }
              >
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
                          min-h-11
                          items-center
                          justify-center

                          rounded-full

                          border
                          border-white/10

                          bg-[#143229]/80

                          px-4
                          py-3

                          text-sm
                          font-semibold
                          text-white
                        `
                      : "btn-secondary"
                  }
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
                          min-h-11
                          items-center
                          justify-center

                          rounded-full

                          bg-[#91aa9d]

                          px-4
                          py-3

                          text-sm
                          font-semibold
                          text-[#10261f]
                        `
                      : "editorial-button"
                  }
                >
                  Get started
                </Link>
              </div>
            )}

            <a href={githubUrl} target="_blank" rel="noreferrer" className={mobileBasicLink}>
              <span
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Code2 className="size-4" />
                GitHub
              </span>
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
