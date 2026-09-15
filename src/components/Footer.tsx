import { Facebook, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const linkClass =
  "text-sm text-[#616161] transition hover:text-brand-700 dark:text-[#bdbdbd] dark:hover:text-brand-300";

export function Footer() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL || "https://www.linkedin.com";
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com";
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "support@crowdspark.app";
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "+880 1700-000000";

  return (
    <footer className="mt-20 border-t border-[#e1dfdd] bg-[#f2f2f2] text-[#242424] dark:border-[#383838] dark:bg-[#161616] dark:text-[#f5f5f5]">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#616161] dark:text-[#bdbdbd]">
            Transparent crowdfunding for projects, causes and products that create measurable
            community impact.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              ["GitHub profile", githubUrl, Github],
              ["LinkedIn profile", linkedInUrl, Linkedin],
              ["Facebook profile", facebookUrl, Facebook]
            ].map(([label, href, Icon]) => (
              <a
                key={String(label)}
                aria-label={String(label)}
                href={String(href)}
                target="_blank"
                rel="noreferrer"
                className="flex size-9 items-center justify-center rounded-md border border-[#d2d0ce] bg-white text-[#616161] transition hover:border-brand-600 hover:text-brand-700 dark:border-[#383838] dark:bg-[#202020] dark:text-[#d6d6d6] dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                <Icon className="size-[17px]" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Platform</h3>
          <div className="mt-4 grid gap-3">
            <Link className={linkClass} to="/">Home</Link>
            <Link className={linkClass} to="/campaigns">Explore campaigns</Link>
            <Link className={linkClass} to="/register?role=creator">Start a campaign</Link>
            <Link className={linkClass} to="/about">About us</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Support & policies</h3>
          <div className="mt-4 grid gap-3">
            <Link className={linkClass} to="/contact">Contact and support</Link>
            <Link className={linkClass} to="/privacy">Privacy policy</Link>
            <Link className={linkClass} to="/terms">Terms and conditions</Link>
            <a className={linkClass} href={githubUrl} target="_blank" rel="noreferrer">Join as developer</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Contact</h3>
          <div className="mt-4 grid gap-4 text-sm text-[#616161] dark:text-[#bdbdbd]">
            <a className="flex items-start gap-3 transition hover:text-brand-700 dark:hover:text-brand-300" href={`mailto:${contactEmail}`}>
              <Mail className="mt-0.5 size-4 shrink-0" /> {contactEmail}
            </a>
            <a className="flex items-start gap-3 transition hover:text-brand-700 dark:hover:text-brand-300" href={`tel:${contactPhone.replace(/\s/g, "")}`}>
              <Phone className="mt-0.5 size-4 shrink-0" /> {contactPhone}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" /> Dhaka, Bangladesh
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#d2d0ce] py-5 text-center text-xs text-[#707070] dark:border-[#383838] dark:text-[#8f8f8f]">
        © {new Date().getFullYear()} CrowdSpark. Built for transparent impact.
      </div>
    </footer>
  );
}
