import { Bell, Code2, LogOut, Menu, UserRound, X } from "lucide-react";

import { useState } from "react";

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

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

  const { current, sessionUser, signOut } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAbout = location.pathname === "/about";

  /*
   * Home and About use the same cinematic navbar palette.
   */
  const useCinematicNavbar = isHome || isAbout;

  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  const closeMenu = () => {
    setOpen(false);
  };

  const logout = async () => {
    await signOut();

    closeMenu();

    navigate("/");
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

        px-5
        py-2.5

        text-sm
        font-semibold
        text-white

        backdrop-blur-xl

        transition-all
        duration-200

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

      px-5
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

              bg-[#d1d8dc]/60
              backdrop-blur-xl

              dark:border-white/10
              dark:bg-[#0d1b16]/80
            `
      }
    >
      <div
        className="
          container-app
          relative

          flex
          h-[94px]
          items-center
          justify-between

          gap-4
        "
      >
        {/* LEFT NAV */}
        <nav
          aria-label="Primary navigation"
          className="
            hidden
            items-center
            gap-2

            lg:flex
          "
        >
          <NavLink to="/campaigns" className={desktopLinkClass}>
            Explore
          </NavLink>

          <Link
            to="/#how-it-works"
            className={
              useCinematicNavbar
                ? `
                    rounded-full

                    border
                    border-white/10

                    bg-[#143229]/80

                    px-5
                    py-2.5

                    text-sm
                    font-semibold
                    text-white

                    backdrop-blur-xl

                    transition-all
                    duration-200

                    hover:border-[#2f5c4d]
                    hover:bg-[#1b4538]
                  `
                : `
                    rounded-full

                    px-5
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
                  `
            }
          >
            How it works
          </Link>
        </nav>

        {/* LOGO */}
        <div
          className="
            lg:absolute
            lg:left-1/2
            lg:-translate-x-1/2
          "
        >
          <Logo light={useCinematicNavbar} />
        </div>

        {/* RIGHT NAV */}
        <div
          className="
            hidden
            items-center
            gap-2

            lg:flex
          "
        >
          <NavLink to="/about" className={desktopLinkClass}>
            About
          </NavLink>

          {!sessionUser ? (
            <>
              {/* SIGN IN */}
              <NavLink
                to="/login"
                className={
                  useCinematicNavbar
                    ? `
                        rounded-full

                        border
                        border-white/10

                        bg-[#143229]/80

                        px-5
                        py-2.5

                        text-sm
                        font-semibold
                        text-white

                        backdrop-blur-xl

                        transition-all
                        duration-200

                        hover:border-[#2f5c4d]
                        hover:bg-[#1b4538]
                      `
                    : `
                        rounded-full

                        border
                        border-[#b8c5ca]

                        bg-transparent

                        px-5
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

              {/* GET STARTED */}
              <NavLink
                to="/register"
                className={
                  useCinematicNavbar
                    ? `
                        rounded-full

                        bg-[#91aa9d]

                        px-5
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

                        px-5
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
              {/* SUPPORTER CREDIT */}
              {current?.profile?.role === "supporter" ? (
                <span
                  className={
                    useCinematicNavbar
                      ? `
                          rounded-full

                          border
                          border-white/10

                          bg-[#91aa9d]

                          px-4
                          py-2

                          text-xs
                          font-semibold
                          text-[#10261f]
                        `
                      : `
                          rounded-full

                          bg-[#91aa9d]

                          px-4
                          py-2

                          text-xs
                          font-semibold
                          text-[#10261f]
                        `
                  }
                >
                  {current.profile.credits.toLocaleString()} credits
                </span>
              ) : null}

              {/* DASHBOARD */}
              <NavLink to={dashboardPath(current?.profile?.role)} className={desktopLinkClass}>
                Dashboard
              </NavLink>

              {/* NOTIFICATIONS */}
              <NavLink
                to="/dashboard/notifications"
                className={desktopLinkClass}
                aria-label="Notifications"
              >
                <Bell className="size-[18px]" />
              </NavLink>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={() => void logout()}
                aria-label="Logout"
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

                        dark:bg-[#d6e3dd]
                        dark:text-[#10261f]
                      `
                }
              >
                <LogOut className="size-[18px]" />
              </button>
            </>
          )}

          {/* THEME TOGGLE */}
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

          {/* GITHUB */}
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

        {/* MOBILE CONTROLS */}
        <div
          className="
            ml-auto

            flex
            items-center
            gap-2

            lg:hidden
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
            onClick={() => setOpen((value) => !value)}
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

                    bg-[#91aa9d]

                    text-[#10261f]
                  `
                : `
                    flex
                    size-10
                    items-center
                    justify-center

                    rounded-full

                    bg-[#91aa9d]

                    text-[#10261f]
                  `
            }
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open ? (
        <div
          className={
            useCinematicNavbar
              ? `
                  border-t
                  border-white/10

                  bg-[#0c2119]/95

                  p-4

                  backdrop-blur-xl

                  lg:hidden
                `
              : `
                  border-t
                  border-[#b8c5ca]

                  bg-[#d1d8dc]

                  p-4

                  dark:border-[#2d3935]
                  dark:bg-[#111716]

                  lg:hidden
                `
          }
        >
          <nav
            className="
              container-app

              grid
              gap-2
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
                        rounded-full

                        border
                        border-white/10

                        px-4
                        py-3

                        text-sm
                        font-semibold
                        text-white

                        transition

                        ${isActive ? "bg-[#1b4538]" : "bg-[#143229]/70 hover:bg-[#1b4538]"}
                      `
                    : `
                        rounded-full

                        px-4
                        py-3

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

                                hover:bg-white/40

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

            <Link
              to="/#how-it-works"
              onClick={closeMenu}
              className={
                useCinematicNavbar
                  ? `
                      rounded-full

                      border
                      border-white/10

                      bg-[#143229]/70

                      px-4
                      py-3

                      text-sm
                      font-semibold
                      text-white

                      transition

                      hover:bg-[#1b4538]
                    `
                  : `
                      rounded-full

                      px-4
                      py-3

                      text-sm
                      font-semibold

                      text-[#172126]

                      transition

                      hover:bg-white/40

                      dark:text-white
                      dark:hover:bg-white/5
                    `
              }
            >
              How it works
            </Link>

            {sessionUser ? (
              <div
                className={
                  useCinematicNavbar
                    ? `
                        mt-3

                        grid
                        gap-2

                        border-t
                        border-white/10

                        pt-4
                      `
                    : `
                        mt-3

                        grid
                        gap-2

                        border-t
                        border-[#b8c5ca]

                        pt-4

                        dark:border-[#2d3935]
                      `
                }
              >
                <Link
                  to={dashboardPath(current?.profile?.role)}
                  onClick={closeMenu}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
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
                  Dashboard
                </Link>

                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
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
                        `
                      : "editorial-button"
                  }
                >
                  <UserRound className="size-4" />
                  Profile
                </Link>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className={
                    useCinematicNavbar
                      ? `
                          flex
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
                        `
                      : "editorial-button"
                  }
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div
                className={
                  useCinematicNavbar
                    ? `
                        mt-3

                        grid
                        grid-cols-2
                        gap-2

                        border-t
                        border-white/10

                        pt-4
                      `
                    : `
                        mt-3

                        grid
                        grid-cols-2
                        gap-2

                        border-t
                        border-[#b8c5ca]

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
                          items-center
                          justify-center

                          rounded-full

                          border
                          border-white/10

                          bg-[#143229]/80

                          px-5
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
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
