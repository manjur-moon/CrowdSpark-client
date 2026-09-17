import { ArrowUpRight, FileText, LockKeyhole, Scale, ShieldCheck } from "lucide-react";

import { motion } from "framer-motion";

type PolicySection = {
  title: string;
  text: string;
};

type PolicyProps = {
  title: string;
  description: string;
  sections: PolicySection[];
};

const reveal = {
  hidden: {
    opacity: 0,
    y: 24
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

export function PrivacyPage() {
  return (
    <Policy
      title="Privacy Policy"
      description="How CrowdSpark handles platform information, account sessions and support-related data."
      sections={[
        {
          title: "Information we store",
          text: "CrowdSpark stores account, campaign, contribution and payment metadata required to operate the platform."
        },
        {
          title: "Account & session security",
          text: "Authentication cookies are used to maintain secure sessions. Secrets and payment credentials remain on the server."
        },
        {
          title: "Support & data requests",
          text: "Users can contact support to request account assistance or data clarification."
        }
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <Policy
      title="Terms & Conditions"
      description="The basic rules that govern campaigns, contributions, moderation and the CrowdSpark demo environment."
      sections={[
        {
          title: "Campaign standards",
          text: "Campaigns must be accurate, lawful and supported by meaningful descriptions."
        },
        {
          title: "Supporter responsibility",
          text: "Supporters are responsible for reviewing campaign information before contributing credits."
        },
        {
          title: "Moderation & platform protection",
          text: "Admins may moderate campaigns, suspend accounts, resolve reports and review withdrawals to protect the platform."
        },
        {
          title: "Demo environment",
          text: "Demo payments are for local testing only and do not transfer real money."
        }
      ]}
    />
  );
}

function Policy({ title, description, sections }: PolicyProps) {
  const isPrivacy = title === "Privacy Policy";

  return (
    <main
      className="
        relative
        overflow-hidden

        bg-[var(--editorial-bg)]
        text-[var(--editorial-text)]
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
            -left-[12%]
            top-[-18%]

            size-[520px]

            rounded-full

            bg-[#789889]/12

            blur-[120px]

            dark:bg-[#28503f]/10
          "
        />

        <div
          className="
            absolute
            -right-[10%]
            bottom-[-20%]

            size-[500px]

            rounded-full

            bg-[#6a897b]/8

            blur-[130px]

            dark:bg-[#12392a]/12
          "
        />

        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.12),transparent_38%)]

            dark:bg-[radial-gradient(circle_at_50%_10%,rgba(112,158,136,0.04),transparent_36%)]
          "
        />
      </div>

      {/* Editorial vertical guides */}
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

          bg-[var(--editorial-border)]

          opacity-45

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

          hidden
          w-px

          bg-[var(--editorial-border)]

          opacity-45

          xl:block
        "
      />

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.08
        }}
        className="
          container-app
          relative
          z-10

          py-10
          sm:py-12
          lg:py-14
        "
      >
        {/* HERO */}
        <motion.section
          variants={reveal}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            grid
            gap-7

            border-b
            border-[var(--editorial-border)]

            pb-8

            lg:grid-cols-[1.1fr_0.9fr]
            lg:items-end
          "
        >
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
                  size-9
                  items-center
                  justify-center

                  rounded-full

                  bg-[#20352d]

                  text-white

                  dark:bg-[#d6e3dd]
                  dark:text-[#10261f]
                "
              >
                {isPrivacy ? <LockKeyhole className="size-4" /> : <Scale className="size-4" />}
              </div>

              <p className="editorial-label">CrowdSpark policy</p>
            </div>

            <h1
              className="
                display-heading

                mt-5

                text-[clamp(3.8rem,7vw,7rem)]
                leading-[0.86]

                text-[var(--editorial-text)]
              "
            >
              {title}
            </h1>
          </div>

          <div
            className="
              max-w-xl

              lg:justify-self-end
              lg:pb-1
            "
          >
            <p
              className="
                text-[15px]
                leading-7

                text-[var(--editorial-text-soft)]
              "
            >
              {description}
            </p>

            <div
              className="
                mt-5
                flex
                items-center
                gap-3

                text-xs

                text-[var(--editorial-muted)]
              "
            >
              <span
                className="
                  h-px
                  w-12

                  bg-[var(--editorial-text)]

                  opacity-30
                "
              />
              Last updated: July 14, 2026
            </div>
          </div>
        </motion.section>

        {/* POLICY BODY */}
        <div
          className="
            mt-7

            grid
            gap-6

            lg:grid-cols-[0.36fr_1fr]
            lg:gap-8
          "
        >
          {/* LEFT INDEX */}
          <motion.aside
            variants={reveal}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              lg:sticky
              lg:top-28
              lg:self-start
            "
          >
            <div
              className="
                campaign-surface
                overflow-hidden
              "
            >
              <div
                className="
                  border-b
                  border-[var(--editorial-border)]

                  p-5
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
                  <FileText className="size-[17px]" />
                </div>

                <p
                  className="
                    mt-5

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[var(--editorial-muted)]
                  "
                >
                  Document index
                </p>
              </div>

              <nav aria-label={`${title} sections`}>
                {sections.map((section, index) => (
                  <a
                    key={section.title}
                    href={`#policy-section-${index + 1}`}
                    className="
                      group

                      flex
                      items-center
                      justify-between
                      gap-4

                      border-b
                      border-[var(--editorial-border)]

                      px-5
                      py-4

                      text-sm
                      font-medium

                      text-[var(--editorial-text-soft)]

                      transition-all
                      duration-200

                      last:border-b-0

                      hover:bg-white/30
                      hover:text-[var(--editorial-text)]

                      dark:hover:bg-white/[0.025]
                    "
                  >
                    <span
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          text-[10px]
                          font-bold
                          tracking-[0.15em]

                          text-[var(--editorial-muted)]
                        "
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {section.title}
                    </span>

                    <ArrowUpRight
                      className="
                        size-3.5

                        opacity-0

                        transition-all
                        duration-200

                        group-hover:-translate-y-0.5
                        group-hover:translate-x-0.5
                        group-hover:opacity-100
                      "
                    />
                  </a>
                ))}
              </nav>
            </div>

            <div
              className="
                mt-4

                flex
                items-start
                gap-3

                px-1

                text-xs
                leading-5

                text-[var(--editorial-muted)]
              "
            >
              <ShieldCheck
                className="
                  mt-0.5
                  size-4
                  shrink-0

                  text-[#527064]

                  dark:text-[#91aa9d]
                "
              />

              <p>
                These policies describe the current CrowdSpark demo platform behavior and operating
                rules.
              </p>
            </div>
          </motion.aside>

          {/* CONTENT */}
          <motion.article
            variants={reveal}
            transition={{
              duration: 0.65,
              delay: 0.04,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              campaign-surface

              overflow-hidden
            "
          >
            {sections.map((section, index) => (
              <motion.section
                key={section.title}
                id={`policy-section-${index + 1}`}
                initial={{
                  opacity: 0,
                  y: 18
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true,
                  amount: 0.3
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="
                  group

                  relative

                  border-b
                  border-[var(--editorial-border)]

                  p-6

                  last:border-b-0

                  sm:p-8
                  lg:p-9
                "
              >
                {/* Hover accent */}
                <div
                  aria-hidden="true"
                  className="
                    absolute
                    bottom-0
                    left-0

                    h-[2px]
                    w-full

                    origin-left
                    scale-x-0

                    bg-[#527064]

                    transition-transform
                    duration-500

                    group-hover:scale-x-100

                    dark:bg-[#91aa9d]
                  "
                />

                <div
                  className="
                    grid
                    gap-5

                    sm:grid-cols-[72px_1fr]
                  "
                >
                  <div>
                    <span
                      className="
                        display-heading

                        text-4xl

                        text-[var(--editorial-muted)]

                        opacity-65
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div>
                    <h2
                      className="
                        display-heading

                        text-[clamp(2rem,3vw,3rem)]
                        leading-none

                        text-[var(--editorial-text)]
                      "
                    >
                      {section.title}
                    </h2>

                    <p
                      className="
                        mt-4

                        max-w-3xl

                        text-[15px]
                        leading-7

                        text-[var(--editorial-text-soft)]

                        sm:text-base
                        sm:leading-8
                      "
                    >
                      {section.text}
                    </p>
                  </div>
                </div>
              </motion.section>
            ))}
          </motion.article>
        </div>
      </motion.div>
    </main>
  );
}
