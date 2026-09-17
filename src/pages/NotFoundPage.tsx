import { ArrowLeft, ArrowRight, Compass, Home, Search } from "lucide-react";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
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
        py-10

        text-[#17211d]

        dark:bg-[#09140f]
        dark:text-[#edf4f0]
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
            -left-32
            -top-32

            size-[460px]

            rounded-full

            bg-[#7c9a8c]/16

            blur-[120px]

            dark:bg-[#2c5a45]/12
          "
        />

        <div
          className="
            absolute
            -bottom-40
            -right-36

            size-[500px]

            rounded-full

            bg-[#9aafa5]/12

            blur-[130px]

            dark:bg-[#173d2d]/12
          "
        />

        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_48%)]

            dark:bg-[radial-gradient(circle_at_center,rgba(116,162,139,0.05),transparent_46%)]
          "
        />
      </div>

      {/* Editorial guide lines */}
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
          max-w-5xl

          overflow-hidden

          rounded-[32px]

          border
          border-[#aebcb6]/55

          bg-[#e8edeb]/72

          p-6

          shadow-[0_28px_90px_rgba(35,54,46,0.10)]

          backdrop-blur-xl

          sm:p-8
          lg:p-10

          dark:border-white/10
          dark:bg-[#14231d]/78
          dark:shadow-[0_30px_90px_rgba(0,0,0,0.30)]
        "
      >
        {/* Giant watermark */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-4
            -top-10

            select-none

            display-heading

            text-[clamp(10rem,25vw,20rem)]
            leading-none

            text-[#20352d]/[0.035]

            dark:text-white/[0.025]
          "
        >
          404
        </div>

        <div
          className="
            relative

            grid
            gap-8

            lg:grid-cols-[1.08fr_0.92fr]
            lg:items-end
          "
        >
          {/* Main copy */}
          <div>
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
                  size-10
                  items-center
                  justify-center

                  rounded-full

                  bg-[#20352d]

                  text-white

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                "
              >
                <Compass className="size-[18px]" />
              </div>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.22em]

                  text-[#62736b]

                  dark:text-[#9baea4]
                "
              >
                Error 404
              </p>
            </div>

            <h1
              className="
                display-heading

                mt-5

                max-w-2xl

                text-[clamp(4rem,8vw,7.2rem)]
                leading-[0.84]
              "
            >
              This page
              <br />
              wandered off.
            </h1>

            <p
              className="
                mt-5

                max-w-xl

                text-sm
                leading-6

                text-[#5f6e67]

                sm:text-base
                sm:leading-7

                dark:text-[#aebfb7]
              "
            >
              The CrowdSpark page you requested doesn&apos;t exist, may have moved, or the link may
              be incorrect.
            </p>

            <div
              className="
                mt-7

                flex
                flex-wrap
                gap-3
              "
            >
              <Link
                to="/"
                className="
                  group

                  inline-flex
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

                  transition-all
                  duration-200

                  hover:-translate-y-0.5
                  hover:bg-[#2d493e]

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                  dark:hover:bg-[#edf5f1]
                "
              >
                <Home className="size-4" />
                Return home
                <ArrowRight
                  className="
                    size-4
                    transition-transform
                    group-hover:translate-x-0.5
                  "
                />
              </Link>

              <Link
                to="/campaigns"
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2

                  rounded-full

                  border
                  border-[#9fafA7]

                  bg-white/35

                  px-6
                  py-3.5

                  text-sm
                  font-semibold

                  text-[#31453c]

                  transition-all
                  duration-200

                  hover:-translate-y-0.5
                  hover:border-[#6e897d]
                  hover:bg-white/60

                  dark:border-[#3f554c]
                  dark:bg-white/[0.035]
                  dark:text-[#d4dfda]

                  dark:hover:border-[#6f8b7e]
                  dark:hover:bg-white/[0.06]
                  dark:hover:text-white
                "
              >
                <Search className="size-4" />
                Explore campaigns
              </Link>
            </div>
          </div>

          {/* Right side */}
          <motion.div
            initial={{
              opacity: 0,
              x: 24
            }}
            animate={{
              opacity: 1,
              x: 0
            }}
            transition={{
              duration: 0.65,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              rounded-[24px]

              border
              border-[#b3c0ba]/60

              bg-white/28

              p-5

              dark:border-white/10
              dark:bg-white/[0.025]
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]

                text-[#66776f]

                dark:text-[#91a49b]
              "
            >
              Try this instead
            </p>

            <div
              className="
                mt-4
                grid
                gap-3
              "
            >
              <Link
                to="/campaigns"
                className="
                  group

                  flex
                  items-center
                  justify-between
                  gap-4

                  rounded-2xl

                  border
                  border-[#b5c2bc]

                  bg-white/30

                  p-4

                  transition-all
                  duration-200

                  hover:border-[#7e9589]
                  hover:bg-white/55

                  dark:border-[#32463d]
                  dark:bg-white/[0.025]

                  dark:hover:border-[#60796d]
                  dark:hover:bg-white/[0.05]
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Discover campaigns
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5

                      text-[#66756e]

                      dark:text-[#91a49b]
                    "
                  >
                    Browse active community ideas.
                  </p>
                </div>

                <ArrowRight
                  className="
                    size-4
                    shrink-0

                    text-[#527064]

                    transition-transform

                    group-hover:translate-x-1

                    dark:text-[#a9c0b5]
                  "
                />
              </Link>

              <Link
                to="/contact"
                className="
                  group

                  flex
                  items-center
                  justify-between
                  gap-4

                  rounded-2xl

                  border
                  border-[#b5c2bc]

                  bg-white/30

                  p-4

                  transition-all
                  duration-200

                  hover:border-[#7e9589]
                  hover:bg-white/55

                  dark:border-[#32463d]
                  dark:bg-white/[0.025]

                  dark:hover:border-[#60796d]
                  dark:hover:bg-white/[0.05]
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Contact support
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5

                      text-[#66756e]

                      dark:text-[#91a49b]
                    "
                  >
                    Get help if something looks wrong.
                  </p>
                </div>

                <ArrowRight
                  className="
                    size-4
                    shrink-0

                    text-[#527064]

                    transition-transform

                    group-hover:translate-x-1

                    dark:text-[#a9c0b5]
                  "
                />
              </Link>
            </div>

            <Link
              to="/"
              className="
                mt-5

                inline-flex
                items-center
                gap-2

                text-xs
                font-semibold

                text-[#61716a]

                transition

                hover:text-[#20352d]

                dark:text-[#8fa299]
                dark:hover:text-white
              "
            >
              <ArrowLeft className="size-3.5" />
              Back to CrowdSpark
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
