import {
  Bell,
  Code2,
  LogOut,
  Menu,
  // UserRound,
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
            ? "bg-[#1b4538]"
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

      transition

      ${
        isActive
          ? `
            bg-[#143229]

            text-white
          `
          : `
            text-[#26343a]

            hover:bg-black/5

            dark:text-[#d6d6d6]

            dark:hover:bg-white/5
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

            border-[var(--editorial-border)]


            bg-[var(--editorial-bg)]/90


            backdrop-blur-xl


            dark:bg-[var(--editorial-bg)]/90
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

                  inline-flex

                  items-center

                  justify-center


                  rounded-full


                  px-5

                  py-2.5


                  text-sm

                  font-semibold


                  text-[#26343a]


                  transition


                  hover:bg-black/5

                  dark:text-[#d6d6d6]

                  dark:hover:bg-white/5

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


        {/* Right navigation */}

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


                    : `
                      rounded-full

                      border

                      border-[var(--editorial-border)]

                      bg-transparent


                      px-5

                      py-2.5


                      text-sm

                      font-semibold


                      text-[var(--editorial-text)]


                      transition


                      hover:bg-black/5


                      dark:hover:bg-white/5
                    `
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


                    : `
                      rounded-full

                      bg-[#586970]


                      px-5

                      py-2.5


                      text-sm

                      font-semibold


                      text-white


                      transition


                      hover:bg-[#46575d]
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

                    px-4

                    py-2

                    text-xs

                    font-semibold

                    text-[#10261f]

                  "

                >

                  {current.profile.credits.toLocaleString()} credits

                </span>

              ) : null}



              <NavLink

                to={dashboardPath(current?.profile?.role)}

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

                className="

                  flex

                  size-10

                  items-center

                  justify-center


                  rounded-full


                  bg-[#586970]


                  text-white


                  transition


                  hover:bg-[#46575d]

                "

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

                `

                : `

                  !rounded-full

                  !border-[var(--editorial-border)]

                  !bg-transparent

                `

            }

          />




          <a

            href={githubUrl}

            target="_blank"

            rel="noreferrer"

            className="

              flex

              size-10

              items-center

              justify-center


              rounded-full


              bg-[#91aa9d]


              text-[#10261f]


              transition


              hover:bg-[#a9beb3]

            "

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

          <ThemeToggle />


          <button

            type="button"

            onClick={() => setOpen((v) => !v)}

            className="

              flex

              size-10

              items-center

              justify-center


              rounded-full


              bg-[#91aa9d]


              text-[#10261f]

            "

          >

            {open ? (

              <X className="size-5" />

            ) : (

              <Menu className="size-5" />

            )}

          </button>


        </div>



      </div>





      {open ? (

        <div

          className="

            border-t

            border-[var(--editorial-border)]

            bg-[var(--editorial-bg)]

            p-4

            lg:hidden

          "

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

                className="

                  rounded-full

                  px-4

                  py-3

                  text-sm

                  font-semibold

                  text-[var(--editorial-text)]

                  hover:bg-black/5

                "

              >

                {link.label}

              </NavLink>

            ))}


          </nav>

        </div>

      ) : null}



    </header>

  );

}