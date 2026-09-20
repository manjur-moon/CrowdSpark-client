import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  HeartHandshake,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { CampaignCard } from "../components/CampaignCard";
import { ImpactEditorialSection } from "../components/Home/ImpactEditorialSection";
import { api } from "../lib/api";
import type { Campaign } from "../types";

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

const trustItems = [
  {
    index: "01",
    title: "Admin-reviewed campaigns",
    eyebrow: "Moderation"
  },
  {
    index: "02",
    title: "Immutable wallet records",
    eyebrow: "Auditability"
  },
  {
    index: "03",
    title: "Contribution notifications",
    eyebrow: "Visibility"
  },
  {
    index: "04",
    title: "Creator progress updates",
    eyebrow: "Accountability"
  }
];

export default function HomePage() {
  const topCampaigns = useQuery({
    queryKey: ["home-campaigns", "top"],
    queryFn: async () =>
      (
        await api.get<{ data: Campaign[] }>("/campaigns", {
          params: {
            sort: "most_funded",
            limit: 4
          }
        })
      ).data.data
  });

  const featuredCampaigns = useQuery({
    queryKey: ["home-campaigns", "featured"],
    queryFn: async () =>
      (
        await api.get<{ data: Campaign[] }>("/campaigns", {
          params: {
            sort: "newest",
            limit: 4
          }
        })
      ).data.data
  });

  const stats = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () =>
      (
        await api.get<{
          data: {
            campaigns: number;
            supporters: number;
            creators: number;
            creditsRaised: number;
          };
        }>("/stats")
      ).data.data
  });

  const campaignGrid = (items: Campaign[] | undefined, loading: boolean) => {
    if (loading) {
      return (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="
                h-[470px]
                overflow-hidden
                rounded-[28px]
                border
                border-[#77877f]/25
                bg-white/30
                p-4
                backdrop-blur-sm
                dark:border-[#496057]/30
                dark:bg-white/5
              "
            >
              <div
                className="
                  h-full
                  animate-pulse
                  rounded-[22px]
                  bg-[#93a39c]/25
                  dark:bg-[#304038]/40
                "
              />
            </div>
          ))}
        </div>
      );
    }

    if (!items || items.length === 0) {
      return (
        <div
          className="
            mt-10
            rounded-[32px]
            border
            border-[#77877f]/25
            bg-white/35
            px-8
            py-16
            text-center
            backdrop-blur-sm
            dark:border-[#496057]/30
            dark:bg-white/5
          "
        >
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#5a6c64]
              dark:text-[#93a79e]
            "
          >
            No featured data yet
          </p>

          <h3
            className="
              mt-4
              text-2xl
              font-semibold
              tracking-[-0.03em]
              text-[#18231f]
              dark:text-[#edf4f0]
            "
          >
            Top campaigns will appear here
          </h3>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-[#31423b]
              dark:text-[#bccbc4]
            "
          >
            Once campaign data is available from the API, this section will automatically show the
            strongest-performing campaigns.
          </p>

          <Link
            to="/campaigns"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#9db5a9]
              px-5
              py-3
              text-sm
              font-semibold
              text-[#10261f]
              transition
              duration-300
              hover:bg-[#b2c6bc]
            "
          >
            Explore campaigns
            <ArrowRight className="size-4" />
          </Link>
        </div>
      );
    }

    return (
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((campaign) => (
          <CampaignCard key={campaign.id || campaign._id} campaign={campaign} />
        ))}
      </div>
    );
  };

  return (
    <main>
      {/* Premium cinematic hero */}
      <section
        className="
          crowdspark-hero
          relative
          isolate
          min-h-[100svh]
          overflow-hidden
          bg-[#07140f]
        "
      >
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false
          }}
          pagination={{
            clickable: true
          }}
          loop
          className="min-h-[100svh]"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.title} className="min-h-[100svh]">
              <div className="relative min-h-[100svh] overflow-hidden">
                <img
                  src={slide.image}
                  alt=""
                  className="
                    absolute
                    inset-0
                    size-full
                    scale-[1.02]
                    object-cover
                  "
                />

                <div className="absolute inset-0 bg-black/30" />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-b
                    from-[#06110d]/60
                    via-transparent
                    to-[#06110d]/80
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_center,transparent_15%,rgba(4,18,13,0.16)_65%,rgba(4,18,13,0.45)_100%)]
                  "
                />

                <div
                  className="
                    container-app
                    relative
                    z-10
                    flex
                    min-h-[100svh]
                    flex-col
                    items-center
                    px-4
                    pb-[340px]
                    pt-36
                    text-center
                    sm:pb-[280px]
                    sm:pt-40
                    lg:pb-64
                    lg:pt-36
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
                    className="
                      flex
                      max-w-6xl
                      flex-1
                      flex-col
                      items-center
                      justify-start
                      pt-[5vh]
                      sm:pt-[7vh]
                    "
                  >
                    <span
                      className="
                        mb-6
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-white/15
                        bg-[#15372c]/65
                        px-4
                        py-2
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#dce8e2]
                        backdrop-blur-xl
                        sm:text-xs
                      "
                    >
                      <Sparkles className="size-3.5" />
                      Transparent crowdfunding
                    </span>

                    <h1
                      className="
                        display-heading
                        max-w-[1050px]
                        text-[clamp(3.6rem,8vw,8rem)]
                        font-normal
                        uppercase
                        leading-[0.88]
                        tracking-[-0.045em]
                        text-[#edf3f0]
                        [text-wrap:balance]
                      "
                    >
                      {slide.title}
                    </h1>
                  </motion.div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-20">
                  <div className="container-app pb-8 sm:pb-10">
                    <div
                      className="
                        grid
                        items-end
                        gap-6
                        lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]
                      "
                    >
                      <div
                        className="
                          grid
                          overflow-hidden
                          rounded-lg
                          border
                          border-white/15
                          bg-[#d9e2df]/80
                          shadow-2xl
                          shadow-black/20
                          backdrop-blur-xl
                          sm:grid-cols-3
                        "
                      >
                        {[
                          ["Campaigns", stats.data?.campaigns ?? 0],
                          ["Supporters", stats.data?.supporters ?? 0],
                          ["Credits raised", stats.data?.creditsRaised ?? 0]
                        ].map(([label, value], index) => (
                          <div
                            key={String(label)}
                            className={`
                              px-6
                              py-5
                              text-left
                              text-[#183329]
                              sm:px-7
                              sm:py-6

                              ${
                                index !== 0
                                  ? "border-t border-[#17332a]/15 sm:border-l sm:border-t-0"
                                  : ""
                              }
                            `}
                          >
                            <p
                              className="
                                text-3xl
                                font-light
                                tracking-[-0.05em]
                                sm:text-4xl
                              "
                            >
                              {Number(value).toLocaleString()}
                              {label === "Campaigns" ? "+" : ""}
                            </p>

                            <p
                              className="
                                mt-2
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.14em]
                                text-[#355248]
                              "
                            >
                              {String(label)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div
                        className="
                          flex
                          flex-col
                          items-start
                          gap-5
                          lg:items-end
                        "
                      >
                        <p
                          className="
                            max-w-[420px]
                            text-left
                            text-sm
                            font-medium
                            uppercase
                            leading-6
                            tracking-[0.025em]
                            text-white/85
                            lg:text-right
                          "
                        >
                          {slide.text}
                        </p>

                        <div className="flex flex-wrap gap-3 lg:justify-end">
                          <Link
                            to="/campaigns"
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              bg-[#9db5a9]
                              px-5
                              py-3
                              text-sm
                              font-semibold
                              text-[#10261f]
                              transition
                              duration-200
                              hover:bg-[#b2c6bc]
                            "
                          >
                            Explore campaigns
                            <ArrowRight className="size-4" />
                          </Link>

                          <Link
                            to="/register?role=creator"
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              border
                              border-white/25
                              bg-black/15
                              px-5
                              py-3
                              text-sm
                              font-semibold
                              text-white
                              backdrop-blur-md
                              transition
                              duration-200
                              hover:bg-white/10
                            "
                          >
                            Start a campaign
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    left-[13%]
                    top-0
                    hidden
                    w-px
                    bg-white/[0.08]
                    xl:block
                  "
                />

                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    bottom-0
                    right-[13%]
                    top-0
                    hidden
                    w-px
                    bg-white/[0.08]
                    xl:block
                  "
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Impact editorial section */}
      <ImpactEditorialSection />

      {/* Top campaigns */}
      <section
        className="
          bg-[var(--editorial-bg)]
          py-24
          text-[var(--editorial-text)]
        "
      >
        <div className="container-app">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[var(--editorial-muted)]
                "
              >
                Top funded campaigns
              </p>

              <h2
                className="
                  display-heading
                  mt-4
                  text-5xl
                  leading-[0.95]
                  text-[var(--editorial-text)]
                  md:text-6xl
                "
              >
                Ideas receiving strong support
              </h2>
            </div>

            <Link
              to="/campaigns?sort=most_funded"
              className="
                hidden
                text-sm
                font-semibold
                uppercase
                tracking-[0.15em]
                text-[var(--editorial-text)]
                transition
                hover:opacity-60
                sm:block
              "
            >
              View all →
            </Link>
          </div>

          {campaignGrid(topCampaigns.data, topCampaigns.isLoading)}
        </div>
      </section>

      {/* Categories */}
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
                className="
                  group
                  relative
                  min-h-56
                  overflow-hidden
                  rounded-2xl
                "
              >
                <img
                  src={image}
                  alt=""
                  className="
                    absolute
                    inset-0
                    size-full
                    object-cover
                    transition
                    duration-500
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-slate-950/55" />

                <span
                  className="
                    absolute
                    bottom-5
                    left-5
                    text-xl
                    font-black
                    text-white
                  "
                >
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
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

      {/* Featured campaigns */}
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

      {/* Trust */}
      <section
        className="
          relative
          isolate
          overflow-hidden
          bg-[linear-gradient(90deg,#071812_0%,#0a2119_45%,#0b241c_100%)]
          py-16
          text-white
          sm:py-[72px]
          lg:py-20
        "
      >
        {/* Background atmosphere */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            -z-10
            overflow-hidden
          "
        >
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -14, 0]
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="
              absolute
              -left-32
              -top-36
              size-[420px]
              rounded-full
              bg-[#91aa9d]/[0.08]
              blur-[120px]
            "
          />

          <motion.div
            animate={{
              x: [0, -22, 0],
              y: [0, 16, 0]
            }}
            transition={{
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="
              absolute
              -bottom-48
              -right-32
              size-[500px]
              rounded-full
              bg-[#527064]/[0.12]
              blur-[130px]
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_52%_10%,rgba(214,227,221,0.065),transparent_42%)]
            "
          />

          <div
            className="
              absolute
              inset-0
              opacity-[0.04]
              [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)]
              [background-size:72px_72px]
            "
          />

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-[#91aa9d]/35
              to-transparent
            "
          />

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-[#91aa9d]/20
              to-transparent
            "
          />
        </div>

        <div className="container-app">
          <div
            className="
              grid
              items-center
              gap-10
              lg:grid-cols-[minmax(0,0.88fr)_minmax(500px,1.12fr)]
              lg:gap-16
            "
          >
            {/* Left */}
            <motion.div
              initial={{
                opacity: 0,
                y: 26
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
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative max-w-xl"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  rotate: -8
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  duration: 0.6,
                  type: "spring",
                  stiffness: 120
                }}
                className="
                  relative
                  flex
                  size-12
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#91aa9d]/20
                  bg-[#91aa9d]/10
                  text-[#80e8bf]
                  shadow-[0_14px_40px_rgba(76,177,137,0.08)]
                  backdrop-blur-xl
                "
              >
                <motion.span
                  aria-hidden="true"
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.28, 0, 0.28]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="
                    absolute
                    inset-0
                    rounded-2xl
                    border
                    border-[#80e8bf]/30
                  "
                />

                <ShieldCheck className="relative size-6" />
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  x: -12
                }}
                whileInView={{
                  opacity: 1,
                  x: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.12,
                  duration: 0.5
                }}
                className="mt-6 flex items-center gap-3"
              >
                <span className="h-px w-8 bg-[#91aa9d]/50" />

                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-[#91aa9d]
                  "
                >
                  Trust architecture
                </p>
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 18
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.16,
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="
                  display-heading
                  mt-4
                  max-w-[620px]
                  text-[clamp(3rem,4.7vw,5rem)]
                  leading-[0.9]
                  tracking-[-0.045em]
                  text-[#edf4f0]
                "
              >
                Designed for trust and accountability.
              </motion.h2>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 14
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.22,
                  duration: 0.55
                }}
                className="
                  mt-5
                  max-w-[540px]
                  text-sm
                  leading-7
                  text-[#b8c9c1]
                  sm:text-[15px]
                "
              >
                Campaign moderation, role-based dashboards, auditable credit transactions and
                progress updates keep every participant informed.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  width: 0
                }}
                whileInView={{
                  opacity: 1,
                  width: "100%"
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.75
                }}
                className="
                  mt-7
                  max-w-xs
                  border-t
                  border-[#91aa9d]/15
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    pt-3
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#789589]
                  "
                >
                  <Sparkles className="size-3.5" />
                  Transparent by design
                </div>
              </motion.div>
            </motion.div>

            {/* Right cards */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  hidden
                  size-48
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-[#91aa9d]/[0.055]
                  blur-3xl
                  lg:block
                "
              />

              <motion.div
                aria-hidden="true"
                initial={{
                  scaleY: 0
                }}
                whileInView={{
                  scaleY: 1
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.7
                }}
                className="
                  absolute
                  bottom-[18%]
                  left-1/2
                  top-[18%]
                  hidden
                  w-px
                  origin-center
                  bg-gradient-to-b
                  from-transparent
                  via-[#91aa9d]/20
                  to-transparent
                  lg:block
                "
              />

              <motion.div
                aria-hidden="true"
                initial={{
                  scaleX: 0
                }}
                whileInView={{
                  scaleX: 1
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.36,
                  duration: 0.7
                }}
                className="
                  absolute
                  left-[18%]
                  right-[18%]
                  top-1/2
                  hidden
                  h-px
                  origin-center
                  bg-gradient-to-r
                  from-transparent
                  via-[#91aa9d]/20
                  to-transparent
                  lg:block
                "
              />

              <div className="relative grid gap-3 sm:grid-cols-2">
                {trustItems.map((item, index) => (
                  <motion.article
                    key={item.title}
                    initial={{
                      opacity: 0,
                      y: 22,
                      scale: 0.98
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}
                    viewport={{
                      once: true,
                      amount: 0.25
                    }}
                    transition={{
                      delay: 0.1 + index * 0.08,
                      duration: 0.55,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    whileHover={{
                      y: -5,
                      scale: 1.01
                    }}
                    className="
                      group
                      relative
                      isolate
                      min-h-[148px]
                      overflow-hidden
                      rounded-[22px]
                      border
                      border-[#91aa9d]/[0.16]
                      bg-[linear-gradient(145deg,rgba(16,45,35,0.96),rgba(20,55,43,0.90))]
                      p-5
                      shadow-[0_16px_45px_rgba(0,0,0,0.13)]
                      backdrop-blur-xl
                      transition-all
                      duration-300
                      hover:border-[#91aa9d]/[0.34]
                      hover:bg-[linear-gradient(145deg,rgba(20,55,43,0.98),rgba(27,68,54,0.94))]
                      hover:shadow-[0_22px_55px_rgba(0,0,0,0.18)]
                    "
                  >
                    <div
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        -z-10
                        translate-x-[-110%]
                        bg-[linear-gradient(115deg,transparent_20%,rgba(214,227,221,0.045)_48%,transparent_76%)]
                        transition-transform
                        duration-700
                        group-hover:translate-x-[110%]
                      "
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <motion.div
                          whileHover={{
                            rotate: 7,
                            scale: 1.07
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 18
                          }}
                          className="
                            flex
                            size-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[#80e8bf]/[0.15]
                            bg-[#80e8bf]/[0.07]
                            text-[#80e8bf]
                            shadow-[0_8px_24px_rgba(128,232,191,0.04)]
                          "
                        >
                          <BadgeCheck className="size-[18px]" />
                        </motion.div>

                        <span
                          className="
                            text-[8px]
                            font-bold
                            tracking-[0.2em]
                            text-[#6f8b80]
                          "
                        >
                          {item.index}
                        </span>
                      </div>

                      <div className="mt-auto pt-5">
                        <p
                          className="
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.18em]
                            text-[#789589]
                            transition-colors
                            duration-300
                            group-hover:text-[#91aa9d]
                          "
                        >
                          {item.eyebrow}
                        </p>

                        <div
                          className="
                            mt-1.5
                            flex
                            items-end
                            justify-between
                            gap-3
                          "
                        >
                          <h3
                            className="
                              max-w-[230px]
                              text-[15px]
                              font-semibold
                              leading-5
                              text-[#edf4f0]
                            "
                          >
                            {item.title}
                          </h3>

                          <ArrowRight
                            className="
                              size-3.5
                              shrink-0
                              -translate-x-1
                              text-[#91aa9d]
                              opacity-0
                              transition-all
                              group-hover:translate-x-0
                              group-hover:opacity-100
                            "
                          />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success stories */}
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

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold text-emerald-700">Testimonials</p>

            <h2 className="mt-2 text-3xl font-black">Why users choose CrowdSpark</h2>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{
              delay: 4500
            }}
            pagination={{
              clickable: true
            }}
            spaceBetween={24}
            breakpoints={{
              768: {
                slidesPerView: 2
              },
              1024: {
                slidesPerView: 3
              }
            }}
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

      {/* Final CTA */}
      <section className="container-app pb-10 pt-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 28
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            amount: 0.25
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="
            group
            relative
            isolate
            min-h-[360px]
            overflow-hidden
            rounded-[30px]
            border
            border-[#91aa9d]/20
            bg-[#071812]
            shadow-[0_30px_80px_rgba(13,37,29,0.15)]
            sm:min-h-[400px]
            sm:rounded-[36px]
          "
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85"
            alt=""
            className="
              absolute
              inset-0
              -z-30
              size-full
              object-cover
              object-center
              transition-transform
              duration-[1800ms]
              group-hover:scale-[1.025]
              lg:object-[65%_center]
            "
          />

          {/* Forest overlays */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-20
              bg-[linear-gradient(90deg,rgba(5,24,18,0.98)_0%,rgba(7,31,23,0.94)_38%,rgba(8,32,24,0.72)_66%,rgba(5,23,18,0.55)_100%)]
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-20
              bg-[linear-gradient(180deg,rgba(3,17,12,0.08),rgba(3,17,12,0.55))]
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-20
              bg-[radial-gradient(circle_at_70%_45%,rgba(145,170,157,0.09),transparent_34%)]
            "
          />

          {/* Atmospheric glow */}
          <motion.div
            aria-hidden="true"
            animate={{
              x: [0, 25, 0],
              y: [0, -14, 0]
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="
              pointer-events-none
              absolute
              -left-24
              -top-28
              -z-10
              size-[360px]
              rounded-full
              bg-[#91aa9d]/10
              blur-[110px]
            "
          />

          {/* Decorative arc */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-[280px]
              right-[8%]
              hidden
              size-[620px]
              rounded-full
              border
              border-[#a7c1b4]/20
              lg:block
            "
          />

          {/* Top highlight */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-x-14
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-[#b9d0c4]/40
              to-transparent
            "
          />

          {/* Content */}
          <div
            className="
              relative
              z-10
              flex
              min-h-[360px]
              items-center
              px-6
              py-10
              sm:min-h-[400px]
              sm:px-10
              sm:py-12
              lg:px-14
            "
          >
            <div className="max-w-[760px]">
              <motion.div
                initial={{
                  opacity: 0,
                  x: -16
                }}
                whileInView={{
                  opacity: 1,
                  x: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.55
                }}
                className="flex items-center gap-3"
              >
                <p
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.24em]
                    text-[#91aa9d]
                    sm:text-[10px]
                  "
                >
                  Make a bigger tomorrow
                </p>

                <span className="h-px w-12 bg-[#91aa9d]/45" />
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 20
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="
                  display-heading
                  mt-5
                  max-w-[720px]
                  text-[clamp(3rem,6vw,5.7rem)]
                  leading-[0.88]
                  tracking-[-0.045em]
                  text-[#f0f5f2]
                "
              >
                Ready to turn one spark into{" "}
                <span className="italic text-[#a9c7b8]">lasting impact?</span>
              </motion.h2>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 14
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.27,
                  duration: 0.55
                }}
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-7
                  text-[#c0d0c8]
                  sm:text-base
                "
              >
                Join as a Supporter or Creator and start using CrowdSpark today.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 14
                }}
                whileInView={{
                  opacity: 1,
                  y: 0
                }}
                viewport={{
                  once: true
                }}
                transition={{
                  delay: 0.34,
                  duration: 0.55
                }}
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:flex-wrap
                "
              >
                <Link
                  to="/register"
                  className="
                    group/button
                    inline-flex
                    min-h-[50px]
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    bg-[#edf4f0]
                    px-6
                    text-sm
                    font-semibold
                    text-[#10261f]
                    shadow-[0_12px_35px_rgba(0,0,0,0.16)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-white
                    hover:shadow-[0_16px_42px_rgba(0,0,0,0.2)]
                  "
                >
                  Create account
                  <ArrowRight
                    className="
                      size-4
                      transition-transform
                      group-hover/button:translate-x-1
                    "
                  />
                </Link>

                <Link
                  to="/campaigns"
                  className="
                    group/button
                    inline-flex
                    min-h-[50px]
                    items-center
                    justify-center
                    gap-3
                    rounded-full
                    border
                    border-white/25
                    bg-[#10291f]/45
                    px-6
                    text-sm
                    font-semibold
                    text-[#eef4f1]
                    backdrop-blur-xl
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#91aa9d]/55
                    hover:bg-[#173a2d]/75
                  "
                >
                  Browse campaigns
                  <ArrowRight
                    className="
                      size-4
                      text-[#a7c2b5]
                      transition-transform
                      group-hover/button:translate-x-1
                    "
                  />
                </Link>
              </motion.div>
            </div>

            <div
              className="
                absolute
                bottom-9
                right-10
                hidden
                lg:block
              "
            >
              <div
                className="
                  text-right
                  text-[9px]
                  font-bold
                  uppercase
                  leading-5
                  tracking-[0.22em]
                  text-[#9ab2a6]/60
                "
              >
                <p>Real ideas</p>
                <p>Stronger together</p>
              </div>

              <span
                className="
                  ml-auto
                  mt-3
                  block
                  h-px
                  w-16
                  bg-[#91aa9d]/35
                "
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* THIS CLOSING TAG MUST EXIST */}
    </main>
  );
}
