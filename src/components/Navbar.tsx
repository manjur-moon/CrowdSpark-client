import {
  Bell,
  Code2,
  LogOut,
  Menu,
  UserRound,
  X
} from "lucide-react";

import { useState } from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  dashboardPath,
  useAuth
} from "../lib/AuthContext";

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

  const {
    current,
    sessionUser,
    signOut
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const isHome =
    location.pathname === "/";

  const githubUrl =
    import.meta.env.VITE_GITHUB_URL ||
    "https://github.com";

  const closeMenu = () => {
    setOpen(false);
  };

  const logout = async () => {
    await signOut();

    closeMenu();

    navigate("/");
  };

  const desktopLinkClass = ({
    isActive
  }: {
    isActive: boolean;
  }) => {
    if (isHome) {
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
        transition
        hover:bg-[#1b4538]
        ${
          isActive
            ? "border-white/20 bg-[#1b4538]"
            : ""
        }
      `;
    }

    return `
      rounded-md
      px-3
      py-2
      text-sm
      font-semibold
      transition-colors
      ${
        isActive
          ? `
            bg-brand-50
            text-brand-700
            dark:bg-brand-950
            dark:text-brand-300
          `
          : `
            text-[#616161]
            hover:bg-[#f5f5f5]
            hover:text-[#242424]
            dark:text-[#d6d6d6]
            dark:hover:bg-[#292929]
            dark:hover:text-white
          `
      }
    `;
  };

  return (
    <header
      className={
        isHome
          ? `
            absolute
            left-0
            right-0
            top-0
            z-50
            w-full
            border-b
            border-white/15
            bg-transparent
          `
          : `
            sticky
            top-0
            z-50
            w-full
            border-b
            border-[#e1dfdd]
            bg-white/95
            backdrop-blur-xl
            dark:border-[#383838]
            dark:bg-[#1b1b1b]/95
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
        {/* Desktop left navigation */}
        <nav
          aria-label="Primary navigation"
          className="
            hidden
            items-center
            gap-2
            lg:flex
          "
        >
          <NavLink
            to="/campaigns"
            className={desktopLinkClass}
          >
            Explore
          </NavLink>

          <Link
            to="/#how-it-works"
            className={
              isHome
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
                  transition
                  hover:bg-[#1b4538]
                `
                : `
                  rounded-md
                  px-3
                  py-2
                  text-sm
                  font-semibold
                  text-[#616161]
                  transition-colors
                  hover:bg-[#f5f5f5]
                  hover:text-[#242424]
                  dark:text-[#d6d6d6]
                  dark:hover:bg-[#292929]
                  dark:hover:text-white
                `
            }
          >
            How it works
          </Link>
        </nav>

        {/* Center brand */}
        <div
          className="
            lg:absolute
            lg:left-1/2
            lg:-translate-x-1/2
          "
        >
          <Logo light={isHome} />
        </div>

        {/* Desktop right navigation */}
        <div
          className="
            hidden
            items-center
            gap-2
            lg:flex
          "
        >
          <NavLink
            to="/about"
            className={desktopLinkClass}
          >
            About
          </NavLink>

          {!sessionUser ? (
            <>
              <NavLink
                to="/login"
                className={
                  isHome
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
                      transition
                      hover:bg-[#1b4538]
                    `
                    : "btn-secondary"
                }
              >
                Sign in
              </NavLink>

              <NavLink
                to="/register"
                className={
                  isHome
                    ? `
                      rounded-full
                      bg-[#91aa9d]
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      text-[#10261f]
                      transition
                      hover:bg-[#a9beb3]
                    `
                    : "btn-primary"
                }
              >
                Get started
              </NavLink>
            </>
          ) : (
            <>
              {current?.profile?.role ===
              "supporter" ? (
                <span
                  className={
                    isHome
                      ? `
                        rounded-full
                        border
                        border-white/10
                        bg-white/10
                        px-4
                        py-2.5
                        text-xs
                        font-semibold
                        text-white
                        backdrop-blur-xl
                      `
                      : `
                        rounded-md
                        bg-brand-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-brand-700
                        dark:bg-brand-950
                        dark:text-brand-300
                      `
                  }
                >
                  {current.profile.credits.toLocaleString()}{" "}
                  credits
                </span>
              ) : null}

              <NavLink
                to={dashboardPath(
                  current?.profile?.role
                )}
                className={desktopLinkClass}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/dashboard/notifications"
                aria-label="Notifications"
                className={desktopLinkClass}
              >
                <Bell className="size-[18px]" />
              </NavLink>

              <button
                type="button"
                onClick={() => void logout()}
                aria-label="Logout"
                className={
                  isHome
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
                      transition
                      hover:bg-[#1b4538]
                    `
                    : `
                      inline-flex
                      size-9
                      items-center
                      justify-center
                      rounded-md
                      text-[#616161]
                      transition
                      hover:bg-[#f5f5f5]
                      hover:text-[#242424]
                      dark:text-[#d6d6d6]
                      dark:hover:bg-[#292929]
                      dark:hover:text-white
                    `
                }
              >
                <LogOut className="size-[18px]" />
              </button>
            </>
          )}

          <ThemeToggle
            className={
              isHome
                ? `
                  !rounded-full
                  !border-white/10
                  !bg-[#91aa9d]
                  !text-[#10261f]
                  hover:!bg-[#a9beb3]
                `
                : ""
            }
          />

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Developer profile"
            className={
              isHome
                ? `
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#91aa9d]
                  text-[#10261f]
                  transition
                  hover:bg-[#a9beb3]
                `
                : "theme-toggle"
            }
          >
            <Code2 className="size-[18px]" />
          </a>
        </div>

        {/* Mobile controls */}
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
              isHome
                ? `
                  !border-white/15
                  !bg-white/10
                  !text-white
                `
                : ""
            }
          />

          <button
            type="button"
            aria-label={
              open
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={open}
            onClick={() =>
              setOpen((value) => !value)
            }
            className={
              isHome
                ? `
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-full
                  bg-[#91aa9d]
                  text-[#10261f]
                `
                : "theme-toggle"
            }
          >
            {open ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div
          className="
            border-t
            border-[#e1dfdd]
            bg-white
            p-4
            shadow-xl
            dark:border-[#383838]
            dark:bg-[#1b1b1b]
            lg:hidden
          "
        >
          <nav
            aria-label="Mobile navigation"
            className="
              container-app
              grid
              gap-2
              px-0
            "
          >
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className="
                  rounded-md
                  px-3
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#424242]
                  transition
                  hover:bg-[#f5f5f5]
                  dark:text-[#e5e5e5]
                  dark:hover:bg-[#292929]
                "
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/#how-it-works"
              onClick={closeMenu}
              className="
                rounded-md
                px-3
                py-2.5
                text-sm
                font-semibold
                text-[#424242]
                dark:text-[#e5e5e5]
              "
            >
              How it works
            </Link>

            {sessionUser ? (
              <div
                className="
                  mt-2
                  grid
                  gap-2
                  border-t
                  border-[#e1dfdd]
                  pt-4
                  dark:border-[#383838]
                "
              >
                <Link
                  to={dashboardPath(
                    current?.profile?.role
                  )}
                  onClick={closeMenu}
                  className="btn-secondary"
                >
                  Dashboard
                </Link>

                <Link
                  to="/dashboard/profile"
                  onClick={closeMenu}
                  className="btn-secondary"
                >
                  <UserRound className="size-4" />
                  Profile
                </Link>

                <button
                  onClick={() => void logout()}
                  className="btn-primary"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div
                className="
                  mt-2
                  grid
                  grid-cols-2
                  gap-2
                  border-t
                  border-[#e1dfdd]
                  pt-4
                  dark:border-[#383838]
                "
              >
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="btn-secondary"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="btn-primary"
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