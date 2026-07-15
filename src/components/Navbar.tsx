import { Bell, Code2, LogOut, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { dashboardPath, useAuth } from "../lib/AuthContext";
import { Logo } from "./Logo";

const publicLinks = [
  { label: "Explore Campaigns", to: "/campaigns" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" }
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-2 py-2 text-sm font-semibold transition ${
    isActive ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { current, sessionUser, signOut } = useAuth();
  const navigate = useNavigate();
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  const closeMenu = () => setOpen(false);
  const logout = async () => {
    await signOut();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary navigation" className="hidden items-center gap-3 lg:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/#how-it-works"
            className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700"
          >
            How It Works
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-3 text-sm"
          >
            <Code2 className="size-4" />
            Join as Developer
          </a>

          {sessionUser ? (
            <>
              {current?.profile?.role === "supporter" ? (
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  {current.profile.credits.toLocaleString()} credits
                </span>
              ) : null}
              <NavLink className={navClass} to={dashboardPath(current?.profile?.role)}>
                Dashboard
              </NavLink>
              <NavLink
                className={navClass}
                to="/dashboard/notifications"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </NavLink>
              <NavLink
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                to="/dashboard/profile"
              >
                {sessionUser.image ? (
                  <img src={sessionUser.image} alt="" className="size-8 rounded-lg object-cover" />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100">
                    <UserRound className="size-4" />
                  </span>
                )}
                <span className="max-w-24 truncate">Profile</span>
              </NavLink>
              <button className="btn-primary px-3" onClick={() => void logout()}>
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className="btn-secondary" to="/login">
                Login
              </NavLink>
              <NavLink className="btn-primary" to="/register">
                Register
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white p-4 lg:hidden">
          <nav aria-label="Mobile navigation" className="container-app grid gap-2 px-0">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={closeMenu} className={navClass}>
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/#how-it-works"
              onClick={closeMenu}
              className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-600"
            >
              How It Works
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary mt-2"
              onClick={closeMenu}
            >
              <Code2 className="size-4" /> Join as Developer
            </a>

            {sessionUser ? (
              <div className="mt-2 grid gap-2 border-t border-slate-200 pt-4">
                {current?.profile?.role === "supporter" ? (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                    Available: {current.profile.credits.toLocaleString()} credits
                  </p>
                ) : null}
                <Link
                  to={dashboardPath(current?.profile?.role)}
                  className="btn-secondary"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link to="/dashboard/notifications" className="btn-secondary" onClick={closeMenu}>
                  <Bell className="size-4" /> Notifications
                </Link>
                <Link to="/dashboard/profile" className="btn-secondary" onClick={closeMenu}>
                  <UserRound className="size-4" /> Profile
                </Link>
                <button className="btn-primary" onClick={() => void logout()}>
                  <LogOut className="size-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4">
                <Link className="btn-secondary" to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link className="btn-primary" to="/register" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
