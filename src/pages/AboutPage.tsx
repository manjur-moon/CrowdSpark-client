import { motion } from "framer-motion";
import {
  BadgeCheck,
  Eye,
  HeartHandshake,
  ShieldCheck
} from "lucide-react";

const values = [
  {
    icon: Eye,
    number: "01",
    title: "Transparent by design",
    text: "Campaign goals, progress, updates and status changes remain visible."
  },
  {
    icon: ShieldCheck,
    number: "02",
    title: "Role-based protection",
    text: "Supporter, Creator and Admin workflows are enforced on the server."
  },
  {
    icon: HeartHandshake,
    number: "03",
    title: "Community centered",
    text: "Campaign tools help creators communicate clearly with supporters."
  },
  {
    icon: BadgeCheck,
    number: "04",
    title: "Moderated trust",
    text: "Admins review campaigns, withdrawals, users and reports."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 36
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function AboutPage() {
  return (
    <main
  className="
    relative
    min-h-screen
    overflow-hidden

    bg-[#183128]
    text-[#edf4f0]

    [--editorial-text:#edf4f0]
    [--editorial-text-soft:#c3d1cb]
    [--editorial-muted:#9fb3aa]
    [--editorial-card:rgba(18,45,35,0.70)]
    [--editorial-border:rgba(211,229,220,0.16)]

    dark:bg-[#0b1712]
    dark:[--editorial-text:#edf4f0]
    dark:[--editorial-text-soft:#bdcbc5]
    dark:[--editorial-muted:#91a69c]
    dark:[--editorial-card:rgba(10,30,23,0.76)]
    dark:[--editorial-border:rgba(211,229,220,0.13)]
  "
>
     {/* Background image */}
<div
  aria-hidden="true"
  className="
    pointer-events-none
    fixed
    inset-0
    z-0
    overflow-hidden
  "
>
  <img
    src="https://images.pexels.com/photos/7345444/pexels-photo-7345444.jpeg"
    alt=""
    className="
      h-full
      w-full
      object-cover
      object-center

      saturate-[0.72]
      contrast-[1.08]
      brightness-[0.56]
      opacity-[0.60]

      dark:saturate-[0.70]
      dark:contrast-[1.10]
      dark:brightness-[0.48]
      dark:opacity-[0.54]
    "
  />

  {/* Forest green tint */}
  <div
    className="
      absolute
      inset-0
      bg-[#123b2d]/48
      dark:bg-[#082b20]/58
    "
  />

  {/* Deep editorial wash */}
  <div
    className="
      absolute
      inset-0
      bg-[#10251e]/34
      dark:bg-[#07130f]/42
    "
  />

  {/* Green atmospheric light */}
  <div
    className="
      absolute
      inset-0
      bg-[radial-gradient(circle_at_18%_10%,rgba(100,158,132,0.18),transparent_42%)]
      dark:bg-[radial-gradient(circle_at_18%_10%,rgba(72,137,108,0.14),transparent_42%)]
    "
  />

  {/* Bottom depth */}
  <div
    className="
      absolute
      inset-0
      bg-gradient-to-b
      from-transparent
      via-transparent
      to-[#07150f]/30
      dark:to-black/38
    "
  />

  {/* Edge vignette */}
  <div
    className="
      absolute
      inset-0
      bg-[radial-gradient(circle_at_center,transparent_45%,rgba(3,15,10,0.26)_100%)]
      dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.34)_100%)]
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
    z-[1]
    hidden
    w-px

    bg-[var(--editorial-border)]

    opacity-40

    xl:block
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
    z-[1]
    hidden
    w-px

    bg-[var(--editorial-border)]

    opacity-40

    xl:block
  "
/>

{/* Page content */}
<div
  className="
    container-app
    relative
    z-10

    py-10
    sm:py-12
    lg:py-14
  "
>
        {/* Hero */}
        <section className="mx-auto max-w-6xl">
          <div
            className="
              grid
              gap-6
              border-b
              border-[var(--editorial-border)]
              pb-8
              lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]
              lg:items-end
              lg:pb-10
            "
          >
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
            >
              <p className="editorial-label">
                About CrowdSpark
              </p>

              <h1
                className="
                  display-heading
                  mt-4
                  max-w-4xl
                  text-[clamp(3.2rem,6.4vw,6.6rem)]
                  leading-[0.88]
                  tracking-[-0.045em]
                  text-[var(--editorial-text)]
                "
              >
                Crowdfunding built around clarity
              </h1>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 22
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.14,
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="lg:pb-1"
            >
              <p
                className="
                  max-w-xl
                  text-base
                  leading-7
                  text-[var(--editorial-text-soft)]
                "
              >
                CrowdSpark connects Supporters with Creators through moderated
                campaigns, platform credits, progress updates and traceable
                financial records.
              </p>

              <motion.div
                initial={{
                  width: 0
                }}
                animate={{
                  width: 72
                }}
                transition={{
                  delay: 0.4,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="
                  mt-5
                  h-px
                  bg-[var(--editorial-text)]
                  opacity-45
                "
              />
            </motion.div>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto mt-7 max-w-6xl lg:mt-9">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true,
              amount: 0.35
            }}
            transition={{
              duration: 0.6
            }}
            className="
              mb-6
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <p className="editorial-label">
                Our principles
              </p>

              <h2
                className="
                  display-heading
                  mt-2
                  text-4xl
                  leading-none
                  text-[var(--editorial-text)]
                  md:text-5xl
                "
              >
                Trust through structure
              </h2>
            </div>

            <p
              className="
                max-w-md
                text-sm
                leading-6
                text-[var(--editorial-text-soft)]
              "
            >
              Every core workflow is designed to make participation easier to
              understand, verify and follow.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.12
            }}
            className="
              grid
              overflow-hidden
              border-l
              border-t
              border-[var(--editorial-border)]
              md:grid-cols-2
            "
          >
            {values.map(
              ({
                icon: Icon,
                number,
                title,
                text
              }) => (
                <motion.article
                  key={title}
                  variants={cardVariants}
                  whileHover={{
                    y: -6,
                    scale: 1.006
                  }}
                  transition={{
                    duration: 0.25
                  }}
                  className="
                    group
                    relative
                    min-h-[245px]
                    overflow-hidden
                    border-b
                    border-r
                    border-[var(--editorial-border)]
                    bg-[var(--editorial-card)]/68
                    p-6
                    backdrop-blur-md
                    sm:p-7
                  "
                >
                  {/* Hover glow */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      -right-20
                      -top-20
                      size-64
                      rounded-full
                      bg-[#91aa9d]/0
                      blur-3xl
                      transition-all
                      duration-700
                      group-hover:bg-[#91aa9d]/20
                      dark:group-hover:bg-[#91aa9d]/9
                    "
                  />

                  {/* Top */}
                  <div
                    className="
                      relative
                      z-10
                      flex
                      items-start
                      justify-between
                      gap-6
                    "
                  >
                    <motion.div
  whileHover={{
    rotate: 8,
    scale: 1.07
  }}
  transition={{
    type: "spring",
    stiffness: 280,
    damping: 18
  }}
  className="
    flex
    size-11
    items-center
    justify-center
    rounded-full

    bg-[#d6e3dd]
    text-[#10261f]

    shadow-[0_8px_24px_rgba(32,53,45,0.14)]

    dark:bg-[#d6e3dd]
    dark:text-[#10261f]
  "
>
  <Icon className="size-[18px]" />
</motion.div>

                    <span
                      className="
                        text-[10px]
                        font-semibold
                        tracking-[0.22em]
                        text-[var(--editorial-muted)]
                        transition
                        duration-300
                        group-hover:-translate-y-1
                      "
                    >
                      {number}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className="
                      relative
                      z-10
                      mt-9
                      transition-transform
                      duration-400
                      ease-out
                      group-hover:-translate-y-1
                    "
                  >
                    <h3
                      className="
                        display-heading
                        max-w-lg
                        text-[clamp(2.2rem,3.5vw,3.1rem)]
                        leading-[0.96]
                        text-[var(--editorial-text)]
                      "
                    >
                      {title}
                    </h3>

                    <p
                      className="
                        mt-3
                        max-w-xl
                        text-sm
                        leading-6
                        text-[var(--editorial-text-soft)]
                        sm:text-[15px]
                      "
                    >
                      {text}
                    </p>
                  </div>

                  {/* Animated accent */}
                  <div
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-0
                      left-0
                      h-[3px]
                      w-full
                      origin-left
                      scale-x-0
                      bg-[#20352d]
                      transition-transform
                      duration-500
                      ease-out
                      group-hover:scale-x-100
                      dark:bg-[#d6e3dd]
                    "
                  />
                </motion.article>
              )
            )}
          </motion.div>
        </section>
      </div>
    </main>
  );
}