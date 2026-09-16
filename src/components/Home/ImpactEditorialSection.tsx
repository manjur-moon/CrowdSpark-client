import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1] as const;

export function ImpactEditorialSection() {
  const reduceMotion = useReducedMotion();

  const reveal = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 28
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.75,
        ease
      }
    }
  };

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduceMotion ? 0 : 0.12,
        delayChildren: reduceMotion ? 0 : 0.15
      }
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        border-y
        border-[#d9dfdc]
        bg-[#aebbc0]
        text-[#17211d]

        dark:border-[#2f3a35]
        dark:bg-[#16211d]
        dark:text-[#edf3f0]
      "
    >
      {/* background reveal */}
      <motion.div
        aria-hidden="true"
        initial={{
          scaleY: reduceMotion ? 1 : 0
        }}
        whileInView={{
          scaleY: 1
        }}
        viewport={{
          once: true,
          amount: 0.18
        }}
        transition={{
          duration: reduceMotion ? 0 : 1.05,
          ease
        }}
        className="
          pointer-events-none
          absolute
          inset-0
          origin-bottom
          bg-[#aebbc0]

          dark:bg-[#16211d]
        "
      />

      <div
        className="
          relative
          z-10
          grid

          lg:min-h-[660px]
          lg:grid-cols-[1fr_1fr_1fr]
        "
      >
        {/* LEFT */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.35
          }}
          className="
            flex
            flex-col
            justify-center

            border-b
            border-[#7f9189]/40

            px-6
            py-16

            sm:px-10
            sm:py-20

            lg:border-b-0
            lg:border-r
            lg:px-14
            lg:py-20

            xl:px-20
          "
        >
          <motion.p
            variants={reveal}
            className="
              mb-5
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#42554d]

              dark:text-[#9fb1a9]
            "
          >
            Built for real impact
          </motion.p>

          <motion.h2
            variants={reveal}
            className="
              display-heading
              max-w-[460px]
              text-[clamp(2.7rem,4vw,4.5rem)]
              leading-[0.96]
              text-[#13231d]

              dark:text-[#edf3f0]
            "
          >
            Funding ideas that deserve to move forward
          </motion.h2>

          <motion.p
            variants={reveal}
            className="
              mt-8
              max-w-[430px]
              text-[15px]
              leading-7
              text-[#33443d]

              sm:text-base

              dark:text-[#bdcbc5]
            "
          >
            CrowdSpark gives creators a transparent place to launch meaningful campaigns while
            supporters can contribute with confidence and follow every step of the journey.
          </motion.p>

          <motion.div variants={reveal} className="mt-9">
            <Link
              to="/about"
              className="
                group
                inline-flex
                items-center
                gap-3

                text-sm
                font-semibold
                uppercase
                tracking-[0.08em]

                text-[#17251f]

                dark:text-[#e5efeb]
              "
            >
              About CrowdSpark
              <span
                className="
                  flex
                  size-8
                  items-center
                  justify-center
                  rounded-sm

                  bg-[#20332b]
                  text-white

                  transition
                  duration-300

                  group-hover:translate-x-1
                  group-hover:bg-[#12624f]

                  dark:bg-[#d7e5df]
                  dark:text-[#11231c]
                  dark:group-hover:bg-[#9fc7b8]
                "
              >
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* CENTER IMAGE */}
        <motion.div
          initial={{
            opacity: 0,
            scale: reduceMotion ? 1 : 0.965
          }}
          whileInView={{
            opacity: 1,
            scale: 1
          }}
          viewport={{
            once: true,
            amount: 0.22
          }}
          transition={{
            duration: reduceMotion ? 0 : 1,
            delay: reduceMotion ? 0 : 0.08,
            ease
          }}
          className="
            relative
            min-h-[520px]
            overflow-hidden

            lg:min-h-full
          "
        >
          <motion.img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85"
            alt="People collaborating on a community project"
            loading="lazy"
            initial={{
              scale: reduceMotion ? 1 : 1.08,
              y: reduceMotion ? 0 : 28
            }}
            whileInView={{
              scale: 1,
              y: 0
            }}
            viewport={{
              once: true,
              amount: 0.2
            }}
            transition={{
              duration: reduceMotion ? 0 : 1.25,
              ease
            }}
            className="
              absolute
              inset-0
              size-full
              object-cover
            "
          />

          {/* image tone */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-[#07120e]/20
              via-transparent
              to-white/5
            "
          />

          {/* reveal curtain */}
          <motion.div
            aria-hidden="true"
            initial={{
              y: "0%"
            }}
            whileInView={{
              y: "-102%"
            }}
            viewport={{
              once: true,
              amount: 0.2
            }}
            transition={{
              duration: reduceMotion ? 0 : 1.05,
              delay: reduceMotion ? 0 : 0.15,
              ease
            }}
            className="
              absolute
              inset-0
              z-20
              bg-[#879891]

              dark:bg-[#21342c]
            "
          />
        </motion.div>

        {/* RIGHT */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.35
          }}
          className="
            flex
            flex-col
            justify-between

            border-t
            border-[#7f9189]/40

            px-6
            py-16

            sm:px-10
            sm:py-20

            lg:border-l
            lg:border-t-0
            lg:px-14
            lg:py-20

            xl:px-20
          "
        >
          <motion.div
            variants={reveal}
            className="
              flex
              justify-center

              lg:justify-start
            "
          >
            <div
              className="
                grid
                size-[48px]
                grid-cols-4
                gap-[2px]
              "
              aria-hidden="true"
            >
              {Array.from({
                length: 16
              }).map((_, index) => (
                <span
                  key={index}
                  className="
                    rounded-full
                    border
                    border-[#31483e]/55

                    dark:border-[#8ba296]/45
                  "
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={reveal}
            className="
              my-16

              lg:my-auto
              lg:py-16
            "
          >
            <p
              className="
                max-w-[440px]
                text-center
                text-sm
                font-medium
                uppercase
                leading-6
                tracking-[0.025em]
                text-[#253931]

                lg:text-left

                dark:text-[#c8d6d0]
              "
            >
              Transparent campaigns, secure contributions and measurable progress — designed to
              build trust between people who create and people who support.
            </p>
          </motion.div>

          <motion.div
            variants={reveal}
            className="
              flex
              items-center
              justify-center
              gap-3

              lg:justify-start
            "
          >
            <Sparkles
              className="
                size-4
                text-[#405a4f]

                dark:text-[#99afa5]
              "
            />

            <span
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#40534b]

                dark:text-[#9fb0a8]
              "
            >
              CrowdSpark Platform
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
