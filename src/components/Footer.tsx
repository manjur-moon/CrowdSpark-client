import { Facebook, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  const githubUrl = import.meta.env.VITE_GITHUB_URL || "https://github.com";
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL || "https://www.linkedin.com";
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com";
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "support@crowdspark.app";
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "+880 1700-000000";

  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
            Transparent crowdfunding for projects, causes and products that create measurable
            community impact.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              aria-label="GitHub profile"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white/10 p-2 hover:bg-emerald-600"
            >
              <Github className="size-5" />
            </a>
            <a
              aria-label="LinkedIn profile"
              href={linkedInUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white/10 p-2 hover:bg-emerald-600"
            >
              <Linkedin className="size-5" />
            </a>
            <a
              aria-label="Facebook profile"
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white/10 p-2 hover:bg-emerald-600"
            >
              <Facebook className="size-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Platform</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <Link className="hover:text-emerald-300" to="/">
              Home
            </Link>
            <Link className="hover:text-emerald-300" to="/campaigns">
              Explore Campaigns
            </Link>
            <Link className="hover:text-emerald-300" to="/register?role=creator">
              Start a Campaign
            </Link>
            <Link className="hover:text-emerald-300" to="/about">
              About Us
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Support & policies</h3>
          <div className="mt-4 grid gap-3 text-sm">
            <Link className="hover:text-emerald-300" to="/contact">
              Contact and Support
            </Link>
            <Link className="hover:text-emerald-300" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="hover:text-emerald-300" to="/terms">
              Terms and Conditions
            </Link>
            <a className="hover:text-emerald-300" href={githubUrl} target="_blank" rel="noreferrer">
              Join as Developer
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Contact</h3>
          <div className="mt-4 grid gap-4 text-sm text-slate-400">
            <a
              className="flex items-start gap-3 hover:text-emerald-300"
              href={`mailto:${contactEmail}`}
            >
              <Mail className="mt-0.5 size-4 shrink-0" />
              {contactEmail}
            </a>
            <a
              className="flex items-start gap-3 hover:text-emerald-300"
              href={`tel:${contactPhone.replace(/\s/g, "")}`}
            >
              <Phone className="mt-0.5 size-4 shrink-0" />
              {contactPhone}
            </a>
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              Dhaka, Bangladesh
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} CrowdSpark. Built for transparent impact.
      </div>
    </footer>
  );
}
