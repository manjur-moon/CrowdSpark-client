import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Coins,
  FileCheck2,
  Flag,
  HandHeart,
  RefreshCw,
  Rocket,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";

import type { ReactNode } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const CHART_COLORS = [
  "#20352d",
  "#527064",
  "#78988a",
  "#91aa9d",
  "#afc1b8",
  "#677c72",
  "#3e594d"
];

interface SupporterDashboardData {
  totalContributions: number;
  pendingContributions: number;
  approvedContributionCredits: number;
  availableCredits: number;

  statusDistribution: Array<{
    status: string;
    count: number;
    credits: number;
  }>;

  monthlyContributions: Array<{
    month: string;
    credits: number;
    count: number;
  }>;
}

interface CreatorDashboardData {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  pendingContributions: number;
  totalRaisedCredits: number;
  availableCreatorCredits: number;

  campaignFunds: Array<{
    campaignId: string;
    title: string;
    raisedCredits: number;
    goalCredits: number;
    status: string;
  }>;

  monthlyContributions: Array<{
    month: string;
    credits: number;
    count: number;
  }>;
}

interface AdminDashboardData {
  supporters: number;
  creators: number;
  totalCampaigns: number;
  campaignsPending: number;
  withdrawalsPending: number;
  openReports: number;
  totalAvailableCredits: number;
  totalPaymentsCents: number;
  successfulPayments: number;

  roleDistribution: Array<{
    role: string;
    count: number;
  }>;

  campaignStatusDistribution: Array<{
    status: string;
    count: number;
  }>;

  monthlyPayments: Array<{
    month: string;
    amountCents: number;
    count: number;
  }>;

  withdrawalDistribution: Array<{
    status: string;
    count: number;
    credits: number;
  }>;
}

type DashboardData =
  | SupporterDashboardData
  | CreatorDashboardData
  | AdminDashboardData;

type StatItem = {
  label: string;
  value: number;
  icon: LucideIcon;
};

const chartTooltipStyle = {
  border: "1px solid var(--editorial-border)",
  borderRadius: "14px",
  background: "var(--editorial-card)",
  color: "var(--editorial-text)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.12)"
};

const axisTick = {
  fill: "var(--editorial-muted)",
  fontSize: 11
};

const gridStroke = "var(--editorial-border)";

function ChartEmpty() {
  return (
    <div
      className="
        flex
        h-full
        min-h-[230px]
        flex-col
        items-center
        justify-center

        rounded-2xl

        border
        border-dashed
        border-[var(--editorial-border)]

        bg-white/20

        px-5
        text-center

        dark:bg-white/[0.02]
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
        <BarChart3 className="size-4" />
      </div>

      <p
        className="
          mt-3
          text-sm
          font-semibold
          text-[var(--editorial-text)]
        "
      >
        No chart data yet
      </p>

      <p
        className="
          mt-1
          max-w-xs
          text-xs
          leading-5
          text-[var(--editorial-muted)]
        "
      >
        Activity will appear here when enough data is available.
      </p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      whileHover={{
        y: -3
      }}
      transition={{
        duration: 0.2
      }}
      className="
        campaign-surface
        group

        relative
        overflow-hidden

        p-5
        sm:p-6
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20

          size-52
          rounded-full

          bg-[#78988a]/8
          blur-3xl

          transition-opacity
          duration-500

          group-hover:opacity-150

          dark:bg-[#78988a]/5
        "
      />

      <div className="relative">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <p className="editorial-label">
              Analytics
            </p>

            <h2
              className="
                display-heading
                mt-1.5

                text-[2rem]
                leading-none

                text-[var(--editorial-text)]
              "
            >
              {title}
            </h2>
          </div>

          <span
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center

              rounded-full

              border
              border-[var(--editorial-border)]

              text-[var(--editorial-muted)]
            "
          >
            <TrendingUp className="size-4" />
          </span>
        </div>

        <p
          className="
            mt-2
            max-w-xl

            text-xs
            leading-5

            text-[var(--editorial-muted)]
          "
        >
          {description}
        </p>

        <div
          className="
            mt-5
            h-[255px]
          "
        >
          {children}
        </div>
      </div>
    </motion.section>
  );
}

function SupporterCharts({
  data
}: {
  data: SupporterDashboardData;
}) {
  return (
    <div
      className="
        grid
        gap-5
        xl:grid-cols-2
      "
    >
      <ChartCard
        title="Monthly contributions"
        description="Approved contribution credits grouped by month."
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data.monthlyContributions}
              margin={{
                top: 10,
                right: 10,
                left: -18,
                bottom: 0
              }}
            >
              <CartesianGrid
                stroke={gridStroke}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: "var(--editorial-muted)"
                }}
              />

              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#527064"
                strokeWidth={3}
                dot={{
                  fill: "#527064",
                  r: 3
                }}
                activeDot={{
                  r: 5
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        title="Contribution status"
        description="Count of your contributions by current status."
      >
        {data.statusDistribution.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data.statusDistribution}
                dataKey="count"
                nameKey="status"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.statusDistribution.map(
                  (entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ]
                      }
                      stroke="transparent"
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11,
                  color: "var(--editorial-muted)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}

function CreatorCharts({
  data
}: {
  data: CreatorDashboardData;
}) {
  return (
    <div
      className="
        grid
        gap-5
        xl:grid-cols-2
      "
    >
      <ChartCard
        title="Campaign funding"
        description="Raised credits compared with funding goals."
      >
        {data.campaignFunds.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data.campaignFunds}
              margin={{
                top: 10,
                right: 10,
                left: -18,
                bottom: 0
              }}
            >
              <CartesianGrid
                stroke={gridStroke}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="title"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
                tickFormatter={(value) =>
                  String(value).slice(0, 11)
                }
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11
                }}
              />

              <Bar
                dataKey="raisedCredits"
                name="Raised"
                fill="#527064"
                radius={[7, 7, 0, 0]}
              />

              <Bar
                dataKey="goalCredits"
                name="Goal"
                fill="#aebfb7"
                radius={[7, 7, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        title="Monthly contributions"
        description="Approved credits received across your campaigns."
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data.monthlyContributions}
              margin={{
                top: 10,
                right: 10,
                left: -18,
                bottom: 0
              }}
            >
              <CartesianGrid
                stroke={gridStroke}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11
                }}
              />

              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#78988a"
                strokeWidth={3}
                dot={{
                  fill: "#78988a",
                  r: 3
                }}
                activeDot={{
                  r: 5
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}

function AdminCharts({
  data
}: {
  data: AdminDashboardData;
}) {
  const monthlyPayments =
    data.monthlyPayments.map((item) => ({
      ...item,
      amount: item.amountCents / 100
    }));

  return (
    <div
      className="
        grid
        gap-5
        xl:grid-cols-2
      "
    >
      <ChartCard
        title="User roles"
        description="Active platform accounts grouped by role."
      >
        {data.roleDistribution.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data.roleDistribution}
                dataKey="count"
                nameKey="role"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.roleDistribution.map(
                  (entry, index) => (
                    <Cell
                      key={entry.role}
                      fill={
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ]
                      }
                      stroke="transparent"
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        title="Campaign status"
        description="Campaigns grouped by moderation and lifecycle status."
      >
        {data.campaignStatusDistribution
          .length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={
                  data.campaignStatusDistribution
                }
                dataKey="count"
                nameKey="status"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.campaignStatusDistribution.map(
                  (entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ]
                      }
                      stroke="transparent"
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        title="Monthly payments"
        description="Successful Stripe and demo payment value in USD."
      >
        {monthlyPayments.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={monthlyPayments}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 0
              }}
            >
              <CartesianGrid
                stroke={gridStroke}
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(value) =>
                  `$${Number(value).toFixed(2)}`
                }
              />

              <Bar
                dataKey="amount"
                name="Payment amount"
                fill="#527064"
                radius={[7, 7, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        title="Withdrawal status"
        description="Withdrawal requests grouped by review status."
      >
        {data.withdrawalDistribution.length ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={
                  data.withdrawalDistribution
                }
                dataKey="count"
                nameKey="status"
                innerRadius={52}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.withdrawalDistribution.map(
                  (entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={
                        CHART_COLORS[
                          index %
                            CHART_COLORS.length
                        ]
                      }
                      stroke="transparent"
                    />
                  )
                )}
              </Pie>

              <Tooltip
                contentStyle={chartTooltipStyle}
              />

              <Legend
                wrapperStyle={{
                  fontSize: 11
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}

function StatCard({
  item,
  index
}: {
  item: StatItem;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.045,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -4
      }}
      className="
        campaign-surface
        group

        relative
        overflow-hidden

        p-5
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute
          -right-12
          -top-12

          size-32

          rounded-full

          bg-[#78988a]/8

          blur-2xl

          transition-all
          duration-500

          group-hover:bg-[#78988a]/14

          dark:bg-[#78988a]/4
        "
      />

      <div className="relative">
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <span
            className="
              flex
              size-10
              items-center
              justify-center

              rounded-full

              bg-[#d6e3dd]

              text-[#10261f]

              transition-transform
              duration-300

              group-hover:scale-105
            "
          >
            <Icon className="size-[17px]" />
          </span>

          <span
            className="
              text-[10px]
              font-bold
              tracking-[0.18em]

              text-[var(--editorial-muted)]
            "
          >
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </span>
        </div>

        <p
          className="
            mt-5

            text-[clamp(1.8rem,2.8vw,2.5rem)]
            font-semibold
            leading-none

            tracking-[-0.04em]

            text-[var(--editorial-text)]
          "
        >
          {item.value.toLocaleString()}
        </p>

        <p
          className="
            mt-2

            text-xs
            font-medium
            leading-5

            text-[var(--editorial-muted)]
          "
        >
          {item.label}
        </p>
      </div>

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

          bg-[#527064]

          transition-transform
          duration-500

          group-hover:scale-x-100

          dark:bg-[#91aa9d]
        "
      />
    </motion.article>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div
        className="
          h-32
          animate-pulse
          rounded-[24px]

          bg-[#bfc9c6]/60

          dark:bg-[#17231e]
        "
      />

      <div
        className="
          grid
          gap-4

          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {Array.from({
          length: 4
        }).map((_, index) => (
          <div
            key={index}
            className="
              h-36
              animate-pulse
              rounded-[22px]

              bg-[#c3cdca]/60

              dark:bg-[#17231e]
            "
          />
        ))}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { current } = useAuth();

  const profile = current!.profile!;
  const role = profile.role;

  const endpoint =
    role === "creator"
      ? "/creator/dashboard"
      : role === "admin"
        ? "/admin/dashboard"
        : "/contributions/dashboard";

  const query = useQuery({
    queryKey: ["dashboard", role],

    queryFn: async () =>
      (
        await api.get<{
          data: DashboardData;
        }>(endpoint)
      ).data.data
  });

  if (query.isLoading) {
    return <DashboardLoading />;
  }

  if (
    query.isError ||
    !query.data
  ) {
    return (
      <section
        className="
          campaign-surface

          mx-auto
          max-w-2xl

          p-8
          text-center
        "
      >
        <div
          className="
            mx-auto

            flex
            size-11
            items-center
            justify-center

            rounded-full

            bg-red-100

            text-red-700

            dark:bg-red-400/10
            dark:text-red-300
          "
        >
          <BarChart3 className="size-5" />
        </div>

        <h1
          className="
            display-heading

            mt-5

            text-4xl
          "
        >
          Dashboard unavailable
        </h1>

        <p
          className="
            mx-auto
            mt-3
            max-w-md

            text-sm
            leading-6

            text-[var(--editorial-muted)]
          "
        >
          CrowdSpark could not load your dashboard data. Try the request again.
        </p>

        <button
          type="button"
          onClick={() =>
            void query.refetch()
          }
          className="
            editorial-button
            mt-6
          "
        >
          <RefreshCw className="size-4" />

          Try again
        </button>
      </section>
    );
  }

  const cards: StatItem[] =
    role === "creator"
      ? [
          {
            label: "Total campaigns",
            value: (
              query.data as CreatorDashboardData
            ).totalCampaigns,
            icon: Rocket
          },
          {
            label: "Active campaigns",
            value: (
              query.data as CreatorDashboardData
            ).activeCampaigns,
            icon: FileCheck2
          },
          {
            label: "Pending campaigns",
            value: (
              query.data as CreatorDashboardData
            ).pendingCampaigns,
            icon: BarChart3
          },
          {
            label: "Total raised credits",
            value: (
              query.data as CreatorDashboardData
            ).totalRaisedCredits,
            icon: HandHeart
          },
          {
            label:
              "Available withdrawal credits",
            value: (
              query.data as CreatorDashboardData
            ).availableCreatorCredits,
            icon: WalletCards
          }
        ]
      : role === "admin"
        ? [
            {
              label: "Supporters",
              value: (
                query.data as AdminDashboardData
              ).supporters,
              icon: Users
            },
            {
              label: "Creators",
              value: (
                query.data as AdminDashboardData
              ).creators,
              icon: Rocket
            },
            {
              label: "Total campaigns",
              value: (
                query.data as AdminDashboardData
              ).totalCampaigns,
              icon: FileCheck2
            },
            {
              label: "Pending campaigns",
              value: (
                query.data as AdminDashboardData
              ).campaignsPending,
              icon: BarChart3
            },
            {
              label: "Available credits",
              value: (
                query.data as AdminDashboardData
              ).totalAvailableCredits,
              icon: Coins
            },
            {
              label: "Successful payments",
              value: (
                query.data as AdminDashboardData
              ).successfulPayments,
              icon: HandHeart
            },
            {
              label: "Pending withdrawals",
              value: (
                query.data as AdminDashboardData
              ).withdrawalsPending,
              icon: WalletCards
            },
            {
              label: "Open reports",
              value: (
                query.data as AdminDashboardData
              ).openReports,
              icon: Flag
            }
          ]
        : [
            {
              label: "Total contributions",
              value: (
                query.data as SupporterDashboardData
              ).totalContributions,
              icon: HandHeart
            },
            {
              label: "Pending contributions",
              value: (
                query.data as SupporterDashboardData
              ).pendingContributions,
              icon: BarChart3
            },
            {
              label: "Approved credits",
              value: (
                query.data as SupporterDashboardData
              ).approvedContributionCredits,
              icon: Coins
            },
            {
              label: "Available credits",
              value: (
                query.data as SupporterDashboardData
              ).availableCredits,
              icon: WalletCards
            }
          ];

  const dashboardDescription =
    role === "creator"
      ? "Track your campaigns, funding activity and available withdrawal balance."
      : role === "admin"
        ? "Monitor platform growth, moderation activity and financial operations."
        : "Track the campaigns you support, approved contributions and available credits.";

  return (
    <motion.main
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 0.35
      }}
      className="
        space-y-6
      "
    >
      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden

          rounded-[26px]

          border
          border-white/10

          bg-[#173329]

          px-6
          py-6

          text-[#edf4f0]

          shadow-[0_20px_55px_rgba(23,51,41,0.12)]

          sm:px-7

          dark:bg-[#0d1c16]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -right-24
            -top-28

            size-72

            rounded-full

            bg-[#91aa9d]/14

            blur-3xl
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            bottom-[-130px]
            left-[30%]

            size-72

            rounded-full

            bg-[#527064]/10

            blur-3xl
          "
        />

        <div
          className="
            relative

            flex
            flex-col
            gap-5

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]

                text-[#9fb6ab]
              "
            >
              {role} dashboard
            </p>

            <h1
              className="
                display-heading

                mt-2

                text-[clamp(2.8rem,5vw,4.7rem)]
                leading-[0.9]

                text-white
              "
            >
              Welcome, {profile.name}.
            </h1>

            <p
              className="
                mt-3
                max-w-2xl

                text-sm
                leading-6

                text-[#b9ccc3]
              "
            >
              {dashboardDescription}
            </p>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2

              rounded-full

              border
              border-white/10

              bg-white/[0.06]

              px-4
              py-2.5

              text-xs
              font-semibold

              text-[#d6e3dd]

              backdrop-blur-xl
            "
          >
            Live overview

            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div
          className="
            mb-4

            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p className="editorial-label">
              Key metrics
            </p>

            <h2
              className="
                display-heading

                mt-1

                text-3xl
                leading-none
              "
            >
              Activity overview
            </h2>
          </div>

          <p
            className="
              hidden

              text-xs

              text-[var(--editorial-muted)]

              sm:block
            "
          >
            Current CrowdSpark data
          </p>
        </div>

        <div
          className="
            grid
            gap-4

            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {cards.map(
            (item, index) => (
              <StatCard
                key={item.label}
                item={item}
                index={index}
              />
            )
          )}
        </div>
      </section>

      {/* CHARTS */}
      <section>
        <div
          className="
            mb-4

            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p className="editorial-label">
              Performance
            </p>

            <h2
              className="
                display-heading

                mt-1

                text-3xl
                leading-none
              "
            >
              Trends & distribution
            </h2>
          </div>
        </div>

        {role === "supporter" ? (
          <SupporterCharts
            data={
              query.data as SupporterDashboardData
            }
          />
        ) : role === "creator" ? (
          <CreatorCharts
            data={
              query.data as CreatorDashboardData
            }
          />
        ) : (
          <AdminCharts
            data={
              query.data as AdminDashboardData
            }
          />
        )}
      </section>
    </motion.main>
  );
}