import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldAlert
} from "lucide-react";

import { motion } from "framer-motion";
import { type FormEvent, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { toast } from "sonner";

import { Logo } from "../components/Logo";
import { authClient } from "../lib/auth-client";

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

  placeholder:text-[#75837c]

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

export default function ResetPasswordPage() {
  const [params] = useSearchParams();

  const token = params.get("token");

  const [password, setPassword] = useState("");

  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [done, setDone] = useState(false);

  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pending) {
      return;
    }

    if (!token) {
      toast.error("Reset token is missing");

      return;
    }

    if (password.length < 8 || password !== confirm) {
      toast.error("Use matching passwords with at least 8 characters");

      return;
    }

    setPending(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token
      });

      if (result.error) {
        toast.error(result.error.message || "Password reset failed");

        return;
      }

      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
    } finally {
      setPending(false);
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

        lg:grid-cols-[0.92fr_1.08fr]
      "
    >
      {/* LEFT VISUAL */}
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
        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
          "
        >
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="
              h-full
              w-full
              object-cover
              object-center

              saturate-[0.7]
              contrast-[1.04]
              brightness-[0.48]
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-[#0c3024]/60
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-gradient-to-br
              from-[#07140f]/25
              via-[#123429]/15
              to-[#030a07]/85
            "
          />

          <div
            className="
              absolute
              inset-0

              bg-[radial-gradient(circle_at_22%_20%,rgba(169,205,188,0.18),transparent_38%)]
            "
          />
        </div>

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
          <Logo light />

          <motion.div
            initial={{
              opacity: 0,
              y: 28
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
              max-w-xl
            "
          >
            <div
              className="
                flex
                size-10
                items-center
                justify-center

                rounded-full

                bg-[#d6e3dd]

                text-[#10261f]
              "
            >
              <KeyRound className="size-[18px]" />
            </div>

            <p
              className="
                mt-6

                text-[11px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#b9ccc3]
              "
            >
              Secure reset
            </p>

            <h1
              className="
                display-heading

                mt-4

                text-[clamp(4rem,6vw,6.8rem)]
                leading-[0.84]

                text-white
              "
            >
              Choose a new
              <br />
              password.
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
              Set a new password and restore secure access to your CrowdSpark account.
            </p>
          </motion.div>

          <div
            className="
              border-t
              border-white/10

              pt-5

              text-xs

              text-[#9eb4aa]
            "
          >
            CrowdSpark account security
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section
        className="
          relative

          flex
          min-h-screen
          items-center
          justify-center

          overflow-hidden

          px-5
          py-14

          sm:px-8

          lg:px-10
          lg:py-8

          dark:bg-[#0c1813]
        "
      >
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

              bg-[#789889]/14

              blur-[120px]

              dark:bg-[#38624f]/9
            "
          />

          <div
            className="
              absolute
              -bottom-44
              -left-44

              size-[460px]

              rounded-full

              bg-[#97afa4]/10

              blur-[120px]

              dark:bg-[#1c4936]/10
            "
          />
        </div>

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
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            relative
            z-10

            w-full
            max-w-[470px]
          "
        >
          <div
            className="
              mb-8
              lg:hidden
            "
          >
            <Logo />
          </div>

          {!token ? (
            <div
              className="
                rounded-[28px]

                border
                border-red-300/50

                bg-white/45

                p-7

                backdrop-blur-xl

                dark:border-red-400/20
                dark:bg-[#14231d]/75
              "
            >
              <div
                className="
                  flex
                  size-11
                  items-center
                  justify-center

                  rounded-full

                  bg-red-100

                  text-red-700

                  dark:bg-red-400/10
                  dark:text-red-300
                "
              >
                <ShieldAlert className="size-5" />
              </div>

              <p className="editorial-label mt-6">Invalid reset request</p>

              <h2
                className="
                  display-heading

                  mt-2

                  text-5xl
                  leading-none
                "
              >
                Reset token missing.
              </h2>

              <p
                className="
                  mt-4

                  text-sm
                  leading-6

                  text-[#5e6d66]

                  dark:text-[#aebfb7]
                "
              >
                Request a new password reset link before continuing.
              </p>

              <Link
                to="/forgot-password"
                className="
                  editorial-button
                  mt-6
                  w-full
                "
              >
                Request new link
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : done ? (
            <motion.div
              initial={{
                opacity: 0,
                y: 15
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="
                rounded-[28px]

                border
                border-[#9fb3aa]/60

                bg-[#e5ece8]/80

                p-7

                shadow-[0_24px_70px_rgba(32,53,45,0.10)]

                backdrop-blur-xl

                dark:border-white/10
                dark:bg-[#14271f]/85
              "
            >
              <div
                className="
                  flex
                  size-11
                  items-center
                  justify-center

                  rounded-full

                  bg-[#20352d]

                  text-white

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                "
              >
                <CheckCircle2 className="size-5" />
              </div>

              <p className="editorial-label mt-6">Password updated</p>

              <h2
                className="
                  display-heading

                  mt-2

                  text-5xl
                  leading-none
                "
              >
                You&apos;re ready to return.
              </h2>

              <p
                className="
                  mt-4

                  text-sm
                  leading-6

                  text-[#5e6d66]

                  dark:text-[#aebfb7]
                "
              >
                Your password has been updated successfully. Sign in using your new credentials.
              </p>

              <Link
                to="/login"
                className="
                  editorial-button
                  mt-6
                  w-full
                "
              >
                Sign in
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          ) : (
            <>
              <p className="editorial-label">Secure reset</p>

              <h2
                className="
                  display-heading

                  mt-3

                  text-[clamp(3.2rem,5vw,4.8rem)]
                  leading-[0.88]
                "
              >
                Create a new
                <br />
                password.
              </h2>

              <p
                className="
                  mt-4

                  text-sm
                  leading-6

                  text-[#5e6d66]

                  dark:text-[#aebfb7]
                "
              >
                Use matching passwords with at least 8 characters.
              </p>

              <form
                onSubmit={submit}
                className="
                  mt-6

                  space-y-4

                  rounded-[24px]

                  border
                  border-[#aebcb6]/55

                  bg-[#e8edeb]/72

                  p-6

                  shadow-[0_20px_60px_rgba(35,54,46,0.08)]

                  backdrop-blur-xl

                  dark:border-white/10
                  dark:bg-[#14231d]/72
                  dark:shadow-[0_24px_70px_rgba(0,0,0,0.24)]
                "
              >
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="new-password"
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
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="new-password"
                      className={`
                        ${fieldClass}
                        pr-12
                      `}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
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

                        text-[#68766f]

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
                </div>

                {/* CONFIRM */}
                <div>
                  <label
                    htmlFor="confirm-password"
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
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirm-password"
                      className={`
                        ${fieldClass}
                        pr-12
                      `}
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirm((value) => !value)}
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

                        text-[#68766f]

                        transition

                        hover:bg-[#20352d]/8
                        hover:text-[#20352d]

                        dark:text-[#91a49b]
                        dark:hover:bg-white/5
                        dark:hover:text-white
                      "
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={pending}
                  whileHover={
                    pending
                      ? undefined
                      : {
                          y: -1
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
                      Updating...
                    </>
                  ) : (
                    <>
                      Reset password
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
              </form>

              <Link
                to="/login"
                className="
                  mt-5

                  flex
                  items-center
                  justify-center
                  gap-2

                  text-sm
                  font-semibold

                  text-[#426454]

                  transition

                  hover:text-[#20352d]

                  dark:text-[#adc5b9]
                  dark:hover:text-white
                "
              >
                <ArrowLeft className="size-4" />
                Return to sign in
              </Link>
            </>
          )}
        </motion.div>
      </section>
    </main>
  );
}
