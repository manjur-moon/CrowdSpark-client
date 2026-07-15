import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  HandHeart,
  HeartHandshake,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { api } from "../lib/api";
import type { Campaign } from "../types";
import { CampaignCard } from "../components/CampaignCard";

const slides = [
  {
    title: "Fund ideas that move communities forward",
    text: "Discover transparent campaigns and support them with secure platform credits.",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1800&q=80"
  },
  {
    title: "Turn a bold vision into measurable impact",
    text: "Creators can launch campaigns, share updates and build trust with supporters.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=80"
  },
  {
    title: "Every contribution starts a spark",
    text: "Explore education, health, technology and community campaigns in one place.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=80"
  }
];

const categories = [
  [
    "Technology",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80"
  ],
  [
    "Education",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80"
  ],
  [
    "Health",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80"
  ],
  [
    "Community",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=700&q=80"
  ]
];

export default function HomePage() {
  const topCampaigns = useQuery({
    queryKey: ["home-campaigns", "top"],
    queryFn: async () =>
      (
        await api.get<{ data: Campaign[] }>("/campaigns", {
          params: { sort: "most_funded", limit: 4 }
        })
      ).data.data
  });
  const featuredCampaigns = useQuery({
    queryKey: ["home-campaigns", "featured"],
    queryFn: async () =>
      (await api.get<{ data: Campaign[] }>("/campaigns", { params: { sort: "newest", limit: 4 } }))
        .data.data
  });
  const stats = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () =>
      (
        await api.get<{
          data: { campaigns: number; supporters: number; creators: number; creditsRaised: number };
        }>("/stats")
      ).data.data
  });

  const campaignGrid = (items: Campaign[] | undefined, loading: boolean) => (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[470px] animate-pulse rounded-2xl bg-slate-200" />
          ))
        : items?.map((campaign) => (
            <CampaignCard key={campaign.id || campaign._id} campaign={campaign} />
          ))}
    </div>
  );

  return (
    <main>
      <section className="relative bg-slate-950">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          loop
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <div className="relative min-h-[65vh]">
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                <div className="container-app relative flex min-h-[65vh] items-center py-20">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl text-white"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-300">
                      <Sparkles className="size-4" /> Transparent crowdfunding
                    </span>
                    <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{slide.text}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link to="/campaigns" className="btn-primary px-6 py-3">
                        Explore Campaigns <ArrowRight className="size-5" />
                      </Link>
                      <Link
                        to="/register?role=creator"
                        className="btn-secondary border-white/30 bg-white/10 px-6 py-3 text-white"
                      >
                        Start a Campaign
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="container-app relative z-10 -mt-10" aria-label="Platform impact">
        <div className="card grid gap-6 p-7 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Live campaigns", stats.data?.campaigns ?? 0, Rocket],
            ["Supporters", stats.data?.supporters ?? 0, Users],
            ["Creators", stats.data?.creators ?? 0, HandHeart],
            ["Credits raised", stats.data?.creditsRaised ?? 0, Coins]
          ].map(([label, value, Icon]) => {
            const I = Icon as typeof Rocket;
            return (
              <div key={String(label)} className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-100">
                  <I className="size-6 text-emerald-700" />
                </span>
                <div>
                  <p className="text-2xl font-black">{Number(value).toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{String(label)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-app py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-emerald-700">Top funded campaigns</p>
            <h2 className="mt-2 text-3xl font-black">Ideas receiving strong support</h2>
          </div>
          <Link to="/campaigns?sort=most_funded" className="font-bold text-emerald-700">
            View all
          </Link>
        </div>
        {campaignGrid(topCampaigns.data, topCampaigns.isLoading)}
      </section>

      <section className="bg-white py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold text-emerald-700">Explore by category</p>
            <h2 className="mt-2 text-3xl font-black">Support the causes closest to you</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(([category, image]) => (
              <Link
                key={category}
                to={`/campaigns?category=${category}`}
                className="group relative min-h-56 overflow-hidden rounded-2xl"
              >
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/55" />
                <span className="absolute bottom-5 left-5 text-xl font-black text-white">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="container-app py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-bold text-emerald-700">How it works</p>
          <h2 className="mt-2 text-3xl font-black">From discovery to real-world impact</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            [
              Search,
              "Discover",
              "Browse approved campaigns and compare goals, progress and updates."
            ],
            [
              Coins,
              "Contribute",
              "Purchase secure credits and support campaigns that matter to you."
            ],
            [
              BadgeCheck,
              "Track impact",
              "Receive notifications and follow every campaign milestone."
            ]
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Search;
            return (
              <article key={String(title)} className="card p-7">
                <I className="size-9 text-emerald-600" />
                <h3 className="mt-5 text-xl font-bold">{String(title)}</h3>
                <p className="mt-3 leading-7 text-slate-600">{String(text)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="container-app">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-bold text-emerald-700">Featured campaigns</p>
              <h2 className="mt-2 text-3xl font-black">Fresh opportunities to create impact</h2>
            </div>
            <Link to="/campaigns?sort=newest" className="font-bold text-emerald-700">
              Browse newest
            </Link>
          </div>
          {campaignGrid(featuredCampaigns.data, featuredCampaigns.isLoading)}
        </div>
      </section>

      <section className="bg-emerald-950 py-20 text-white">
        <div className="container-app grid items-center gap-10 lg:grid-cols-2">
          <div>
            <ShieldCheck className="size-11 text-emerald-300" />
            <h2 className="mt-5 text-4xl font-black">Designed for trust and accountability</h2>
            <p className="mt-5 text-lg leading-8 text-emerald-100/80">
              Campaign moderation, role-based dashboards, auditable credit transactions and progress
              updates keep every participant informed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Admin-reviewed campaigns",
              "Immutable wallet records",
              "Contribution notifications",
              "Creator progress updates"
            ].map((item) => (
              <div key={item} className="rounded-2xl bg-white/10 p-5 font-bold">
                <BadgeCheck className="mb-3 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-bold text-emerald-700">Success stories</p>
          <h2 className="mt-2 text-3xl font-black">Small contributions, visible outcomes</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            [
              "Community water access",
              "A local Creator documented each installation milestone and kept Supporters informed through campaign updates."
            ],
            [
              "Learning devices for students",
              "Supporters pooled credits to help a classroom gain reliable access to digital learning resources."
            ],
            [
              "A safer neighbourhood clinic",
              "Transparent goals and Admin moderation helped a health campaign earn community trust."
            ]
          ].map(([title, text]) => (
            <article key={title} className="card p-7">
              <HeartHandshake className="size-9 text-emerald-600" />
              <h3 className="mt-5 text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold text-emerald-700">Testimonials</p>
            <h2 className="mt-2 text-3xl font-black">Why users choose CrowdSpark</h2>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 4500 }}
            pagination={{ clickable: true }}
            spaceBetween={24}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="mt-10 pb-12"
          >
            {[
              [
                "Ayesha Rahman",
                "Supporter",
                "The credit history and campaign updates make it easy to understand where my support is going."
              ],
              [
                "Daniel Karim",
                "Creator",
                "The review process helped me create a clearer campaign and communicate progress professionally."
              ],
              [
                "Nadia Islam",
                "Supporter",
                "I can discover local initiatives, contribute quickly and receive updates in one dashboard."
              ]
            ].map(([name, role, quote]) => (
              <SwiperSlide key={name}>
                <article className="card h-full p-7">
                  <p className="leading-7 text-slate-600">“{quote}”</p>
                  <div className="mt-6">
                    <p className="font-bold">{name}</p>
                    <p className="text-sm text-emerald-700">{role}</p>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="container-app py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="font-bold text-emerald-700">FAQ</p>
            <h2 className="mt-2 text-3xl font-black">Common questions</h2>
          </div>
          <div className="mt-8 space-y-4">
            {[
              [
                "How do CrowdSpark credits work?",
                "Supporters purchase credits and use them to submit contributions. Creator withdrawals follow the platform conversion and approval rules."
              ],
              [
                "When does a campaign become public?",
                "A new campaign remains pending until an Admin reviews and approves it."
              ],
              [
                "What happens when a contribution is rejected?",
                "The contribution status changes to rejected and the Supporter's credits are restored through a transaction-safe workflow."
              ],
              [
                "Can anyone register as an Admin?",
                "No. Public registration supports only Supporter and Creator roles. Admin access is managed securely by existing Admins."
              ]
            ].map(([question, answer]) => (
              <details key={question} className="card p-5">
                <summary className="cursor-pointer font-bold text-slate-950">{question}</summary>
                <p className="mt-3 leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app pb-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white sm:p-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black sm:text-4xl">
              Ready to turn one spark into lasting impact?
            </h2>
            <p className="mt-4 text-emerald-50">
              Join as a Supporter or Creator and start using CrowdSpark today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-white px-6 py-3 font-bold text-emerald-700"
              >
                Create account
              </Link>
              <Link
                to="/campaigns"
                className="rounded-xl border border-white/40 px-6 py-3 font-bold"
              >
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
