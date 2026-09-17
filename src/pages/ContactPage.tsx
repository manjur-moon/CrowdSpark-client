import { ArrowUpRight, Clock3, Mail, Send, ShieldCheck } from "lucide-react";

import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

import { api, apiErrorMessage } from "../lib/api";

const fieldClass = `
  w-full
  rounded-xl

  border
  border-[var(--editorial-border)]

  bg-white/45

  px-4
  py-3

  text-sm
  text-[var(--editorial-text)]

  outline-none

  backdrop-blur-sm

  transition-all
  duration-300

  placeholder:text-[var(--editorial-muted)]

  hover:border-[#779185]/60

  focus:border-[#527064]
  focus:bg-white/65
  focus:ring-4
  focus:ring-[#527064]/10

  dark:bg-white/[0.04]
  dark:hover:border-[#78988a]/50
  dark:focus:border-[#78988a]
  dark:focus:bg-white/[0.06]
`;

const labelClass = `
  mb-2
  block

  text-[10px]
  font-bold
  uppercase
  tracking-[0.22em]

  text-[var(--editorial-muted)]
`;

const reveal = {
  hidden: {
    opacity: 0,
    y: 26
  },
  visible: {
    opacity: 1,
    y: 0
  }
};

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPending(true);

    try {
      await api.post("/contact", form);

      toast.success("Message received");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <main
      className="
        relative
        overflow-hidden

        bg-[var(--editorial-bg)]
        text-[var(--editorial-text)]
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
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="
            h-full
            w-full
            object-cover
            object-center

            saturate-[0.72]
            contrast-[0.96]

            opacity-[0.18]

            dark:saturate-[0.65]
            dark:brightness-[0.52]
            dark:opacity-[0.13]
          "
        />

        {/* Editorial wash */}
        <div
          className="
            absolute
            inset-0

            bg-[#d1d8dc]/76

            dark:bg-[#091712]/80
          "
        />

        {/* Green tint */}
        <div
          className="
            absolute
            inset-0

            bg-[#628577]/10

            dark:bg-[#0b3527]/24
          "
        />

        {/* Atmospheric light */}
        <div
          className="
            absolute
            inset-0

            bg-[radial-gradient(circle_at_18%_15%,rgba(103,150,130,0.18),transparent_38%)]

            dark:bg-[radial-gradient(circle_at_18%_15%,rgba(73,133,107,0.12),transparent_40%)]
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
            to-[#658276]/10

            dark:to-black/25
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
          staggerChildren: 0.09
        }}
        className="
          container-app
          relative
          z-10

          py-8
          sm:py-10
          lg:py-11
        "
      >
        {/* Header */}
        <motion.section
          variants={reveal}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            grid
            gap-5

            border-b
            border-[var(--editorial-border)]

            pb-6

            lg:grid-cols-[1.08fr_0.92fr]
            lg:items-end
          "
        >
          <div>
            <p className="editorial-label">Contact & support</p>

            <h1
              className="
                display-heading

                mt-3

                max-w-3xl

                text-[clamp(3.4rem,6vw,6.15rem)]
                leading-[0.84]

                text-[var(--editorial-text)]
              "
            >
              Tell us how
              <br />
              we can help.
            </h1>
          </div>

          <div
            className="
              max-w-lg

              lg:justify-self-end
              lg:pb-1
            "
          >
            <p
              className="
                text-sm
                leading-6

                text-[var(--editorial-text-soft)]

                sm:text-[15px]
              "
            >
              Use this form for platform support, campaign questions or responsible disclosure.
              Messages are stored securely for Admin review.
            </p>

            <div
              className="
                mt-4
                h-px
                w-16

                bg-[var(--editorial-text)]

                opacity-30
              "
            />
          </div>
        </motion.section>

        {/* Content */}
        <div
          className="
            mt-6

            grid
            gap-5

            lg:grid-cols-[0.76fr_1.24fr]
            lg:items-start
            lg:gap-6
          "
        >
          {/* Left side */}
          <motion.div
            variants={reveal}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="
              grid
              gap-4
            "
          >
            {/* Main support card */}
            <motion.div
              whileHover={{
                y: -5,
                scale: 1.008
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 20
              }}
              className="
                group
                relative
                overflow-hidden

                rounded-[24px]

                border
                border-white/10

                bg-[#173329]

                p-6

                text-[#edf4f0]

                shadow-[0_18px_50px_rgba(23,51,41,0.16)]

                dark:bg-[#0b1d16]
              "
            >
              {/* Glow */}
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20

                  size-56

                  rounded-full

                  bg-[#91aa9d]/14

                  blur-3xl

                  transition-all
                  duration-500

                  group-hover:bg-[#91aa9d]/22
                "
              />

              {/* Decorative line */}
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

                  bg-[#91aa9d]

                  transition-transform
                  duration-500

                  group-hover:scale-x-100
                "
              />

              <div className="relative">
                <motion.div
                  whileHover={{
                    rotate: 8,
                    scale: 1.08
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18
                  }}
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
                  <Mail className="size-4" />
                </motion.div>

                <p
                  className="
                    mt-6

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.22em]

                    text-[#9fb7ac]
                  "
                >
                  Demo support
                </p>

                <a
                  href="mailto:support@crowdspark.demo"
                  className="
                    mt-2

                    inline-flex
                    items-center
                    gap-2

                    text-lg
                    font-semibold

                    text-white

                    transition-colors
                    duration-200

                    hover:text-[#cfe0d8]
                  "
                >
                  support@crowdspark.demo
                  <ArrowUpRight
                    className="
                      size-4

                      transition-transform
                      duration-200

                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </a>

                <p
                  className="
                    mt-3

                    max-w-sm

                    text-sm
                    leading-6

                    text-[#b9ccc3]
                  "
                >
                  For account access, campaign assistance, reporting issues or general platform
                  support.
                </p>
              </div>
            </motion.div>

            {/* Support information */}
            <div
              className="
                campaign-surface

                divide-y
                divide-[var(--editorial-border)]

                overflow-hidden
              "
            >
              <motion.div
                whileHover={{
                  x: 4
                }}
                transition={{
                  duration: 0.2
                }}
                className="
                  group/info

                  flex
                  items-start
                  gap-4

                  p-5

                  transition-colors
                  duration-300

                  hover:bg-white/20

                  dark:hover:bg-white/[0.025]
                "
              >
                <div
                  className="
                    flex
                    size-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]

                    transition-transform
                    duration-300

                    group-hover/info:scale-105
                  "
                >
                  <ShieldCheck className="size-4" />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold

                      text-[var(--editorial-text)]
                    "
                  >
                    Secure review
                  </p>

                  <p
                    className="
                      mt-1

                      text-sm
                      leading-5

                      text-[var(--editorial-text-soft)]
                    "
                  >
                    Support messages are submitted for authorized Admin review.
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{
                  x: 4
                }}
                transition={{
                  duration: 0.2
                }}
                className="
                  group/info

                  flex
                  items-start
                  gap-4

                  p-5

                  transition-colors
                  duration-300

                  hover:bg-white/20

                  dark:hover:bg-white/[0.025]
                "
              >
                <div
                  className="
                    flex
                    size-9
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    bg-[#d6e3dd]

                    text-[#10261f]

                    transition-transform
                    duration-300

                    group-hover/info:scale-105
                  "
                >
                  <Clock3 className="size-4" />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-semibold

                      text-[var(--editorial-text)]
                    "
                  >
                    Clear communication
                  </p>

                  <p
                    className="
                      mt-1

                      text-sm
                      leading-5

                      text-[var(--editorial-text-soft)]
                    "
                  >
                    Include enough detail so the support team can understand your request quickly.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={reveal}
            initial={{
              opacity: 0,
              y: 28,
              scale: 0.985
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            transition={{
              duration: 0.72,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            onSubmit={submit}
            className="
              campaign-surface

              group/form
              relative
              overflow-hidden

              p-5
              sm:p-6
              lg:p-7
            "
          >
            {/* CONTACT watermark */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-5
                top-5

                select-none

                font-black

                text-[clamp(5rem,10vw,9rem)]
                leading-none

                tracking-[-0.06em]

                text-[#20352d]/[0.035]

                dark:text-white/[0.025]
              "
            >
              CONTACT
            </div>

            {/* Soft glow */}
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-24
                -top-24

                size-64

                rounded-full

                bg-[#78988a]/8

                blur-3xl

                transition-all
                duration-700

                group-hover/form:bg-[#78988a]/12

                dark:bg-[#78988a]/5
              "
            />

            <div className="relative">
              {/* Form heading */}
              <div
                className="
                  mb-5

                  flex
                  items-center
                  justify-between
                  gap-4

                  border-b
                  border-[var(--editorial-border)]

                  pb-4
                "
              >
                <div>
                  <p className="editorial-label">Send a message</p>

                  <h2
                    className="
                      display-heading

                      mt-1.5

                      text-4xl
                      leading-none

                      sm:text-[2.75rem]
                    "
                  >
                    Start the conversation
                  </h2>
                </div>

                <motion.div
                  whileHover={{
                    rotate: -8,
                    scale: 1.08
                  }}
                  className="
                    hidden
                    size-10
                    shrink-0
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-[var(--editorial-border)]

                    text-[var(--editorial-muted)]

                    sm:flex
                  "
                >
                  <Send className="size-4" />
                </motion.div>
              </div>

              {/* Fields */}
              <div
                className="
                  grid
                  gap-4

                  sm:grid-cols-2
                "
              >
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Name
                  </label>

                  <input
                    id="contact-name"
                    className={fieldClass}
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                    }
                    placeholder="Your name"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email
                  </label>

                  <input
                    id="contact-email"
                    className={fieldClass}
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value
                      })
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contact-subject" className={labelClass}>
                    Subject
                  </label>

                  <input
                    id="contact-subject"
                    className={fieldClass}
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value
                      })
                    }
                    placeholder="How can we help?"
                    required
                    minLength={3}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="contact-message" className={labelClass}>
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    className={`
                      ${fieldClass}
                      min-h-[130px]
                      resize-y
                    `}
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        message: e.target.value
                      })
                    }
                    placeholder="Describe your question or issue..."
                    required
                    minLength={10}
                  />
                </div>
              </div>

              {/* Bottom */}
              <div
                className="
                  mt-5

                  flex
                  flex-col
                  gap-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    max-w-[380px]

                    text-[11px]
                    leading-5

                    text-[var(--editorial-muted)]
                  "
                >
                  Please avoid including passwords, payment credentials or other sensitive
                  authentication information.
                </p>

                <motion.button
                  type="submit"
                  disabled={pending}
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
                          scale: 0.98
                        }
                  }
                  className="
                    editorial-button
                    group

                    min-w-[158px]

                    shadow-[0_10px_25px_rgba(32,53,45,0.10)]

                    transition-shadow
                    duration-300

                    hover:shadow-[0_14px_34px_rgba(32,53,45,0.20)]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {pending ? (
                    "Sending..."
                  ) : (
                    <>
                      Send message
                      <Send
                        className="
                          size-4

                          transition-transform
                          duration-200

                          group-hover:translate-x-0.5
                          group-hover:-translate-y-0.5
                        "
                      />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </main>
  );
}
