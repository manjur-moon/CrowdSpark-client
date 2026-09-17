import { Facebook, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

import { Link } from "react-router-dom";

import { Logo } from "./Logo";

const linkClass = `
  text-sm
  text-[#c0d1c9]
  transition-colors
  duration-200

  hover:text-white

  dark:text-[#b8c9c1]
  dark:hover:text-white
`;

export function Footer() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";

  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL || "https://www.linkedin.com";

  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com";

  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "support@crowdspark.app";

  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "+880 1700-000000";

  return (
    <footer
      className="
    relative
    overflow-hidden

    border-t
    border-white/10

    bg-[#173329]
    text-[#edf4f0]

    dark:bg-[#09140f]
    dark:text-[#edf4f0]
  "
    >
      {/* Soft background atmosphere */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0

          bg-[radial-gradient(circle_at_top_left,rgba(145,170,157,0.14),transparent_38%)]

          dark:bg-[radial-gradient(circle_at_top_left,rgba(145,170,157,0.08),transparent_36%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          right-[14%]
          top-0
          hidden
          h-full
          w-px
          bg-white/[0.06]
          xl:block
        "
      />

      <div
        className="
          container-app
          relative
          z-10
          grid
          gap-8
          py-10

          sm:grid-cols-2

          lg:grid-cols-[1.25fr_0.75fr_0.9fr_1fr]
          lg:gap-10
          lg:py-12
        "
      >
        {/* Brand */}
        <div>
          <Logo light />

          <p
            className="
              mt-4
              max-w-sm
              text-sm
              leading-6
              text-[#bfd0c8]

              dark:text-[#b5c6be]
            "
          >
            Transparent crowdfunding for projects, causes and products that create measurable
            community impact.
          </p>

          {/* Social media */}
          <div className="mt-5 flex gap-2">
            {[
              ["GitHub profile", githubUrl, Github],
              ["LinkedIn profile", linkedInUrl, Linkedin],
              ["Facebook profile", facebookUrl, Facebook]
            ].map(([label, href, Icon]) => {
              const SocialIcon = Icon as typeof Github;

              return (
                <a
                  key={String(label)}
                  aria-label={String(label)}
                  href={String(href)}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex
                    size-10
                    items-center
                    justify-center

                    rounded-full

                    border
                    border-white/15

                    bg-white/[0.06]

                    text-[#d4e1db]

                    backdrop-blur-sm

                    transition
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-[#a9beb3]/60
                    hover:bg-[#a9beb3]
                    hover:text-[#10261f]
                  "
                >
                  <SocialIcon className="size-[17px]" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white
            "
          >
            Platform
          </h3>

          <div className="mt-4 grid gap-3">
            <Link className={linkClass} to="/">
              Home
            </Link>

            <Link className={linkClass} to="/campaigns">
              Explore campaigns
            </Link>

            <Link className={linkClass} to="/register?role=creator">
              Start a campaign
            </Link>

            <Link className={linkClass} to="/about">
              About us
            </Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white
            "
          >
            Support & policies
          </h3>

          <div className="mt-4 grid gap-3">
            <Link className={linkClass} to="/contact">
              Contact and support
            </Link>

            <Link className={linkClass} to="/privacy">
              Privacy policy
            </Link>

            <Link className={linkClass} to="/terms">
              Terms and conditions
            </Link>

            <a className={linkClass} href={githubUrl} target="_blank" rel="noreferrer">
              Join as developer
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-white
            "
          >
            Contact
          </h3>

          <div
            className="
              mt-4
              grid
              gap-4

              text-sm
              text-[#bfd0c8]

              dark:text-[#b5c6be]
            "
          >
            <a
              className="
                flex
                items-start
                gap-3
                transition-colors
                duration-200
                hover:text-white
              "
              href={`mailto:${contactEmail}`}
            >
              <Mail
                className="
                  mt-0.5
                  size-4
                  shrink-0
                  text-[#91aa9d]
                "
              />

              <span>{contactEmail}</span>
            </a>

            <a
              className="
                flex
                items-start
                gap-3
                transition-colors
                duration-200
                hover:text-white
              "
              href={`tel:${contactPhone.replace(/\s/g, "")}`}
            >
              <Phone
                className="
                  mt-0.5
                  size-4
                  shrink-0
                  text-[#91aa9d]
                "
              />

              <span>{contactPhone}</span>
            </a>

            <p className="flex items-start gap-3">
              <MapPin
                className="
                  mt-0.5
                  size-4
                  shrink-0
                  text-[#91aa9d]
                "
              />

              <span>Dhaka, Bangladesh</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div
        className="
          relative
          z-10

          border-t
          border-white/10

          py-4

          text-center
          text-xs

          text-[#9fb3aa]

          dark:text-[#8fa39a]
        "
      >
        © {new Date().getFullYear()} CrowdSpark. Built for transparent impact.
      </div>
    </footer>
  );
}
