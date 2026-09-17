import { zodResolver } from "@hookform/resolvers/zod";

import { ArrowRight, Eye, EyeOff, LogIn, ShieldCheck, Sparkles } from "lucide-react";

import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "../components/Logo";

import { refreshAccessToken } from "../lib/access-token";
import { api, apiErrorMessage } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { dashboardPath, useAuth } from "../lib/AuthContext";

import type { CurrentUserResponse } from "../types";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters")
});

type Values = z.infer<typeof schema>;

export function safeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

const fieldClass = `
  w-full
  rounded-xl

  border
  border-[#bdc9c5]

  bg-white/55

  px-4
  py-3.5

  text-sm
  text-[#17211d]

  outline-none

  backdrop-blur-md

  transition-all
  duration-200

  placeholder:text-[#73817b]

  hover:border-[#8ca096]

  focus:border-[#527064]
  focus:bg-white/75
  focus:ring-4
  focus:ring-[#527064]/10

  dark:border-[#33483f]
  dark:bg-white/[0.045]
  dark:text-[#edf4f0]
  dark:placeholder:text-[#83968d]

  dark:hover:border-[#557267]

  dark:focus:border-[#7f9f90]
  dark:focus:bg-white/[0.065]
`;

const demoAccounts = {
  supporter: {
    email: "supporter@crowdspark.demo",
    password: "Supporter12345"
  },

  creator: {
    email: "creator@crowdspark.demo",
    password: "Creator12345"
  },

  admin: {
    email: "admin@crowdspark.demo",
    password: "Admin12345"
  }
} as const;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { refresh } = useAuth();

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Values>({
    resolver: zodResolver(schema),

    defaultValues: {
      email: "",
      password: ""
    }
  });

  const submit = async (values: Values) => {
    try {
      const result = await authClient.signIn.email({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        rememberMe: true
      });

      if (result.error) {
        toast.error(result.error.message || "Email or password is incorrect");

        return;
      }

      const token = await refreshAccessToken();

      if (!token) {
        throw new Error("Access token could not be created");
      }

      const response = await api.get<{
        data: CurrentUserResponse;
      }>("/users/me");

      const me = response.data.data;

      await refresh();

      const redirect = safeRedirect(params.get("redirect"));

      navigate(me.profile ? (redirect ?? dashboardPath(me.profile.role)) : "/onboarding", {
        replace: true
      });

      toast.success("Signed in successfully");
    } catch (error) {
      console.error("CrowdSpark login failed:", error);

      toast.error(
        apiErrorMessage(error, error instanceof Error ? error.message : "Sign in failed")
      );
    }
  };

  const demo = (role: "supporter" | "creator" | "admin") => {
    const account = demoAccounts[role];

    setValue("email", account.email, {
      shouldValidate: true
    });

    setValue("password", account.password, {
      shouldValidate: true
    });
  };

  const google = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",

        callbackURL: `${window.location.origin}/onboarding`
      });
    } catch (error) {
      toast.error(apiErrorMessage(error, "Google login is not configured"));
    }
  };

  return (
    <main
      className="
        grid
        min-h-screen

        bg-[#d1d8dc]

        text-[#17211d]

        dark:bg-[#09140f]
        dark:text-[#edf4f0]

        lg:grid-cols-[1.03fr_0.97fr]
      "
    >
      {/* LEFT CINEMATIC PANEL */}
      <section
        className="
          relative
          hidden
          min-h-screen
          overflow-hidden

          lg:flex
          lg:flex-col
        "
      >
        {/* Background image */}
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
          "
        >
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="
              h-full
              w-full
              object-cover
              object-center

              saturate-[0.72]
              contrast-[1.03]
              brightness-[0.52]
            "
          />

          {/* Forest green tint */}
          <div
            className="
    absolute
    inset-0
    bg-[#0c3024]/48
  "
          />

          {/* Cinematic depth */}
          <div
            className="
    absolute
    inset-0
    bg-gradient-to-br
    from-[#07140f]/25
    via-[#102b21]/15
    to-[#050c09]/76
  "
          />

          {/* Sage highlight */}
          <div
            className="
    absolute
    inset-0
    bg-[radial-gradient(circle_at_25%_24%,rgba(163,199,182,0.18),transparent_38%)]
  "
          />

          {/* Dark depth */}
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-[#07140f]/35
              via-[#102b21]/20
              to-[#050c09]/80
            "
          />

          {/* Subtle highlight */}
          <div
            className="
              absolute
              inset-0

              bg-[radial-gradient(circle_at_24%_24%,rgba(163,199,182,0.18),transparent_36%)]
            "
          />
        </div>

        {/* Guide line */}
        <div
          aria-hidden="true"
          className="
            absolute
            bottom-0
            right-[12%]
            top-0

            w-px

            bg-white/[0.10]
          "
        />

        <div
          className="
            relative
            z-10

            flex
            min-h-screen
            flex-col

            p-10
            xl:p-12
          "
        >
          <div>
            <Logo light />
          </div>

          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              my-auto
              max-w-2xl
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  size-9
                  items-center
                  justify-center

                  rounded-full

                  bg-[#d6e3dd]

                  text-[#10261f]
                "
              >
                <Sparkles className="size-4" />
              </div>

              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.22em]

                  text-[#b9ccc3]
                "
              >
                Welcome back
              </p>
            </div>

            <h1
              className="
                display-heading

                mt-6

                max-w-2xl

                text-[clamp(4.2rem,6.2vw,7rem)]
                leading-[0.84]

                text-white
              "
            >
              Continue ideas
              <br />
              that matter.
            </h1>

            <p
              className="
                mt-6

                max-w-lg

                text-base
                leading-7

                text-[#c5d5cd]
              "
            >
              Access your CrowdSpark workspace to support campaigns, manage projects and follow
              measurable community impact.
            </p>

            <div
              className="
                mt-8

                flex
                items-center
                gap-3

                text-sm

                text-[#afc3b9]
              "
            >
              <ShieldCheck className="size-4" />
              Secure role-based access
            </div>
          </motion.div>

          <div
            className="
              flex
              items-center
              justify-between

              border-t
              border-white/10

              pt-5

              text-xs

              text-[#9eb4aa]
            "
          >
            <span>CrowdSpark</span>

            <span>Transparent crowdfunding platform</span>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section
        className="
          relative

          flex
          min-h-screen
          items-center
          justify-center

          overflow-hidden

          px-5
          py-16

          sm:px-8

          lg:px-10
          lg:py-10

          dark:bg-[#0c1813]
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
              -top-40

              size-[500px]

              rounded-full

              bg-[#6f9282]/15

              blur-[120px]

              dark:bg-[#38624f]/10
            "
          />

          <div
            className="
              absolute
              -bottom-44
              -left-44

              size-[460px]

              rounded-full

              bg-[#97afa4]/12

              blur-[120px]

              dark:bg-[#1c4936]/10
            "
          />
        </div>

        {/* Vertical guide */}
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

        <motion.div
          initial={{
            opacity: 0,
            y: 24,
            scale: 0.985
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}
          transition={{
            duration: 0.65,
            delay: 0.08,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            relative
            z-10

            w-full
            max-w-[460px]
          "
        >
          {/* Mobile logo */}
          <div
            className="
              mb-9

              lg:hidden
            "
          >
            <Logo />
          </div>

          {/* Heading */}
          <div>
            <p className="editorial-label">Account access</p>

            <h2
              className="
                display-heading

                mt-3

                text-[clamp(3.2rem,5vw,4.7rem)]
                leading-[0.88]
              "
            >
              Sign in to
              <br />
              CrowdSpark.
            </h2>

            <p
              className="
                mt-4

                text-sm
                leading-6

                text-[#57665f]

                dark:text-[#aebfb7]
              "
            >
              Access your role-based dashboard and continue where you left off.
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleSubmit(submit)}
            className="
              relative

              mt-6

              overflow-hidden

              rounded-[24px]

              border
              border-[#aebcb6]/55

              bg-[#e8edeb]/72

              p-5

              shadow-[0_20px_60px_rgba(35,54,46,0.08)]

              backdrop-blur-xl

              sm:p-6

              dark:border-white/10
              dark:bg-[#14231d]/72
              dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]
            "
          >
            {/* Soft glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-20
                -top-20

                size-52

                rounded-full

                bg-[#6c9180]/10

                blur-3xl

                dark:bg-[#6c9180]/6
              "
            />

            <div
              className="
                relative
                space-y-4
              "
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="
                    mb-2
                    block

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]

                    text-[#66766f]

                    dark:text-[#96aaa1]
                  "
                >
                  Email address
                </label>

                <input
                  id="login-email"
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />

                {errors.email ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              {/* Password */}
              <div>
                <div
                  className="
                    mb-2

                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <label
                    htmlFor="login-password"
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.2em]

                      text-[#66766f]

                      dark:text-[#96aaa1]
                    "
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="
                      text-xs
                      font-semibold

                      text-[#315d4c]

                      transition-colors

                      hover:text-[#173d30]

                      dark:text-[#a7c0b4]
                      dark:hover:text-white
                    "
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    className={`
                      ${fieldClass}
                      pr-12
                    `}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="
                      absolute
                      right-3
                      top-1/2

                      flex
                      size-8
                      -translate-y-1/2
                      items-center
                      justify-center

                      rounded-full

                      text-[#66766f]

                      transition

                      hover:bg-[#20352d]/8
                      hover:text-[#20352d]

                      dark:text-[#91a49b]
                      dark:hover:bg-white/5
                      dark:hover:text-white
                    "
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {errors.password ? (
                  <p
                    className="
                      mt-1.5
                      text-xs
                      text-red-600

                      dark:text-red-400
                    "
                  >
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              {/* Login */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={
                  isSubmitting
                    ? undefined
                    : {
                        y: -1
                      }
                }
                whileTap={
                  isSubmitting
                    ? undefined
                    : {
                        scale: 0.985
                      }
                }
                className="
                  group

                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  bg-[#20352d]

                  px-5
                  py-3.5

                  text-sm
                  font-bold
                  text-white

                  shadow-[0_12px_30px_rgba(32,53,45,0.16)]

                  transition-all
                  duration-200

                  hover:bg-[#2d493e]
                  hover:shadow-[0_16px_36px_rgba(32,53,45,0.22)]

                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                  dark:hover:bg-[#edf5f1]
                "
              >
                <LogIn className="size-4" />

                {isSubmitting ? "Signing in..." : "Sign in"}

                {!isSubmitting ? (
                  <ArrowRight
                    className="
                      size-4

                      transition-transform
                      duration-200

                      group-hover:translate-x-0.5
                    "
                  />
                ) : null}
              </motion.button>

              {/* Divider */}
              <div
                className="
                  flex
                  items-center
                  gap-3

                  py-1
                "
              >
                <div
                  className="
                    h-px
                    flex-1

                    bg-[#afbbb6]/65

                    dark:bg-white/10
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]

                    text-[#7b8983]

                    dark:text-[#82948c]
                  "
                >
                  or
                </span>

                <div
                  className="
                    h-px
                    flex-1

                    bg-[#afbbb6]/65

                    dark:bg-white/10
                  "
                />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={google}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3

                  rounded-full

                  border
                  border-[#aebcb6]

                  bg-white/55

                  px-5
                  py-3.5

                  text-sm
                  font-semibold

                  text-[#26362f]

                  transition-all
                  duration-200

                  hover:border-[#80958b]
                  hover:bg-white/80

                  dark:border-[#35483f]
                  dark:bg-white/[0.035]
                  dark:text-[#e7efeb]

                  dark:hover:border-[#637d71]
                  dark:hover:bg-white/[0.06]
                "
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          </form>

          {/* Demo accounts */}
          <div className="mt-5">
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]

                  text-[#67776f]

                  dark:text-[#899d93]
                "
              >
                Quick demo access
              </p>

              <span
                className="
                  text-[11px]

                  text-[#78867f]

                  dark:text-[#71857b]
                "
              >
                Auto-fill credentials
              </span>
            </div>

            <div
              className="
                mt-3

                grid
                grid-cols-3
                gap-2
              "
            >
              {(["supporter", "creator", "admin"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => demo(role)}
                  className="
                    rounded-full

                    border
                    border-[#aebcb6]

                    bg-white/30

                    px-2
                    py-2.5

                    text-xs
                    font-semibold
                    capitalize

                    text-[#33443c]

                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-[#748b80]
                    hover:bg-white/55

                    dark:border-[#30443b]
                    dark:bg-white/[0.025]
                    dark:text-[#b8c8c0]

                    dark:hover:border-[#627a6f]
                    dark:hover:bg-white/[0.05]
                    dark:hover:text-white
                  "
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Register */}
          <p
            className="
              mt-6

              text-center
              text-sm

              text-[#5e6d66]

              dark:text-[#91a49b]
            "
          >
            New to CrowdSpark?{" "}
            <Link
              className="
                font-bold

                text-[#315d4c]

                transition-colors

                hover:text-[#173d30]

                dark:text-[#bdd2c8]
                dark:hover:text-white
              "
              to="/register"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px]">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-1.99 3.02v2.54h3.23c1.89-1.74 2.98-4.3 2.98-7.41Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.23-2.54c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.05v2.62A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.03 6.03 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.05A10 10 0 0 0 2 12c0 1.61.38 3.13 1.05 4.55l3.34-2.62Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.45l3.34 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}
