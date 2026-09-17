import {
  ArrowRight,
  Check,
  LoaderCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Logo } from "../components/Logo";
import { refreshAccessToken } from "../lib/access-token";
import { api, apiErrorMessage } from "../lib/api";
import { dashboardPath, useAuth } from "../lib/AuthContext";

import type { Profile, Role } from "../types";

const roleOptions = {
  supporter: {
    title: "Supporter",
    description: "Discover campaigns, contribute credits and track the projects you support.",
    credits: "50 starting credits",
    icon: Users
  },

  creator: {
    title: "Creator",
    description: "Create campaigns, communicate with supporters and request withdrawals.",
    credits: "20 starting credits",
    icon: Rocket
  }
} satisfies Record<
  "supporter" | "creator",
  {
    title: string;
    description: string;
    credits: string;
    icon: typeof Users;
  }
>;

export default function OnboardingPage() {
  const { sessionUser, current, loading, refresh } = useAuth();

  const navigate = useNavigate();

  const [role, setRole] = useState<Role>(() => {
    const stored = sessionStorage.getItem("crowdspark.pendingRole");

    return stored === "creator" ? "creator" : "supporter";
  });

  const [pending, setPending] = useState(false);

  const profileRole = current?.profile?.role;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!sessionUser) {
      navigate("/login", {
        replace: true
      });

      return;
    }

    if (profileRole) {
      navigate(dashboardPath(profileRole), {
        replace: true
      });
    }
  }, [loading, sessionUser, profileRole, navigate]);

  const submit = async () => {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const profile = (
        await api.post<{
          data: Profile;
        }>("/users/onboarding", {
          role
        })
      ).data.data;

      sessionStorage.removeItem("crowdspark.pendingRole");

      await refreshAccessToken();
      await refresh();

      toast.success(`${role === "supporter" ? 50 : 20} registration credits added`);

      navigate(dashboardPath(profile.role), {
        replace: true
      });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Onboarding could not be completed"));
    } finally {
      setPending(false);
    }
  };

  if (loading || !sessionUser || profileRole) {
    return <OnboardingLoader />;
  }

  return (
    <main
      className="
        relative
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden

        bg-[#d1d8dc]

        px-5
        py-12

        text-[#17211d]

        dark:bg-[#09140f]
        dark:text-[#edf4f0]

        sm:px-8
      "
    >
      {/* Background image */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1800&q=85"
          alt=""
          className="
            h-full
            w-full
            object-cover
            object-center

            saturate-[0.7]
            contrast-[0.98]

            opacity-[0.12]

            dark:brightness-[0.5]
            dark:opacity-[0.1]
          "
        />

        {/* Editorial wash */}
        <div
          className="
            absolute
            inset-0

            bg-[#d1d8dc]/78

            dark:bg-[#09140f]/82
          "
        />

        {/* Green atmosphere */}
        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_20%_18%,rgba(96,145,123,0.18),transparent_40%)]

            dark:bg-[radial-gradient(circle_at_20%_18%,rgba(70,132,104,0.13),transparent_42%)]
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-40

            size-[520px]

            rounded-full

            bg-[#789889]/10

            blur-[130px]

            dark:bg-[#24533e]/10
          "
        />
      </div>

      {/* Guide lines */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-[12%]
          top-0

          hidden
          w-px

          bg-[#81958d]/20

          xl:block

          dark:bg-white/[0.07]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          right-[12%]
          top-0

          hidden
          w-px

          bg-[#81958d]/20

          xl:block

          dark:bg-white/[0.07]
        "
      />

      <motion.section
        initial={{
          opacity: 0,
          y: 26,
          scale: 0.985
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="
          relative
          z-10

          w-full
          max-w-[760px]

          overflow-hidden

          rounded-[30px]

          border
          border-[#aebcb6]/60

          bg-[#e8edeb]/78

          p-6

          shadow-[0_26px_80px_rgba(30,53,43,0.10)]

          backdrop-blur-xl

          sm:p-8

          dark:border-white/10
          dark:bg-[#14231d]/78
          dark:shadow-[0_28px_80px_rgba(0,0,0,0.28)]
        "
      >
        {/* Glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32

            size-80

            rounded-full

            bg-[#7c9d8e]/12

            blur-3xl

            dark:bg-[#7c9d8e]/6
          "
        />

        <div className="relative">
          {/* Top */}
          <div
            className="
              flex
              items-center
              justify-between
              gap-6

              border-b
              border-[#afbbb6]/60

              pb-5

              dark:border-white/10
            "
          >
            <Logo />

            <div
              className="
                hidden
                items-center
                gap-2

                text-xs
                font-semibold

                text-[#61716a]

                sm:flex

                dark:text-[#9aaca3]
              "
            >
              <ShieldCheck className="size-4" />
              Secure onboarding
            </div>
          </div>

          {/* Heading */}
          <div
            className="
              mt-6

              grid
              gap-5

              md:grid-cols-[1.15fr_0.85fr]
              md:items-end
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2.5
                "
              >
                <div
                  className="
                    flex
                    size-8
                    items-center
                    justify-center

                    rounded-full

                    bg-[#20352d]

                    text-white

                    dark:bg-[#d6e3dd]
                    dark:text-[#10261f]
                  "
                >
                  <Sparkles className="size-3.5" />
                </div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#62736b]

                    dark:text-[#9badA4]
                  "
                >
                  Final setup
                </p>
              </div>

              <h1
                className="
                  display-heading

                  mt-4

                  text-[clamp(3rem,6vw,5.3rem)]
                  leading-[0.86]
                "
              >
                Choose your
                <br />
                CrowdSpark role.
              </h1>
            </div>

            <p
              className="
                max-w-md

                text-sm
                leading-6

                text-[#5d6c65]

                dark:text-[#a9bab2]
              "
            >
              Select one permanent self-service role. Admin access cannot be selected during
              onboarding.
            </p>
          </div>

          {/* Role cards */}
          <div
            className="
              mt-7

              grid
              gap-4

              sm:grid-cols-2
            "
          >
            {(["supporter", "creator"] as const).map((value) => {
              const option = roleOptions[value];

              const Icon = option.icon;

              const selected = role === value;

              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  whileHover={{
                    y: -4
                  }}
                  whileTap={{
                    scale: 0.99
                  }}
                  className={`
                    group
                    relative

                    overflow-hidden

                    rounded-[22px]

                    border

                    p-5

                    text-left

                    transition-colors
                    duration-200

                    ${
                      selected
                        ? `
                            border-[#527064]

                            bg-[#dce6e1]

                            shadow-[0_12px_34px_rgba(32,53,45,0.08)]

                            dark:border-[#8ca89a]
                            dark:bg-[#20372d]
                          `
                        : `
                            border-[#bbc6c1]

                            bg-white/30

                            hover:border-[#81998e]
                            hover:bg-white/50

                            dark:border-[#30443b]
                            dark:bg-white/[0.025]

                            dark:hover:border-[#587166]
                            dark:hover:bg-white/[0.04]
                          `
                    }
                  `}
                >
                  {/* Accent */}
                  <div
                    aria-hidden="true"
                    className={`
                      absolute
                      bottom-0
                      left-0

                      h-[3px]
                      w-full

                      origin-left

                      bg-[#527064]

                      transition-transform
                      duration-400

                      dark:bg-[#a7bdb2]

                      ${selected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                    `}
                  />

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        size-11
                        items-center
                        justify-center

                        rounded-full

                        bg-[#d6e3dd]

                        text-[#10261f]
                      "
                    >
                      <Icon className="size-[18px]" />
                    </div>

                    <div
                      className={`
                        flex
                        size-6
                        items-center
                        justify-center

                        rounded-full

                        border

                        transition-all

                        ${
                          selected
                            ? `
                                border-[#20352d]

                                bg-[#20352d]

                                text-white

                                dark:border-[#d6e3dd]
                                dark:bg-[#d6e3dd]
                                dark:text-[#10261f]
                              `
                            : `
                                border-[#94a59d]

                                text-transparent

                                dark:border-[#64796f]
                              `
                        }
                      `}
                    >
                      <Check className="size-3.5" />
                    </div>
                  </div>

                  <h2
                    className="
                      display-heading

                      mt-5

                      text-4xl
                      leading-none
                    "
                  >
                    {option.title}
                  </h2>

                  <p
                    className="
                      mt-3

                      text-sm
                      leading-6

                      text-[#5d6d65]

                      dark:text-[#a4b5ac]
                    "
                  >
                    {option.description}
                  </p>

                  <p
                    className="
                      mt-4

                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.17em]

                      text-[#426454]

                      dark:text-[#b4cabf]
                    "
                  >
                    {option.credits}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Bottom action */}
          <div
            className="
              mt-6

              flex
              flex-col
              gap-4

              border-t
              border-[#afbbb6]/60

              pt-5

              dark:border-white/10

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                max-w-sm

                text-xs
                leading-5

                text-[#6a7972]

                dark:text-[#899c92]
              "
            >
              Your selected role controls which dashboard tools and workflows are available.
            </p>

            <motion.button
              type="button"
              disabled={pending}
              onClick={() => void submit()}
              whileHover={
                pending
                  ? undefined
                  : {
                      y: -2
                    }
              }
              whileTap={
                pending
                  ? undefined
                  : {
                      scale: 0.985
                    }
              }
              className="
                group

                flex
                min-w-[180px]
                items-center
                justify-center
                gap-2

                rounded-full

                bg-[#20352d]

                px-6
                py-3.5

                text-sm
                font-bold
                text-white

                shadow-[0_12px_30px_rgba(32,53,45,0.16)]

                transition-all

                hover:bg-[#2d493e]

                disabled:cursor-not-allowed
                disabled:opacity-60

                dark:bg-[#d6e3dd]
                dark:text-[#10261f]
                dark:hover:bg-[#edf5f1]
              "
            >
              {pending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Complete setup
                  <ArrowRight
                    className="
                      size-4

                      transition-transform

                      group-hover:translate-x-0.5
                    "
                  />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

function OnboardingLoader() {
  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center

        bg-[#d1d8dc]

        dark:bg-[#09140f]
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-4
        "
      >
        <LoaderCircle
          className="
            size-8
            animate-spin

            text-[#20352d]

            dark:text-[#d6e3dd]
          "
        />

        <p
          className="
            text-sm
            font-medium

            text-[#5d6c65]

            dark:text-[#9dafA6]
          "
        >
          Preparing your account...
        </p>
      </div>
    </main>
  );
}
