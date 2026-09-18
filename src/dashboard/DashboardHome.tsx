import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Coins,
  FileCheck2,
  Flag,
  HandHeart,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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
  "#173329",
  "#527064",
  "#78988a",
  "#91aa9d",
  "#b5c7be",
  "#637b70"
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

interface StatItem {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
}

interface PulseItem {
  label: string;
  value: string | number;
}

interface FocusItem {
  label: string;
  description: string;
  value: string | number;
  to: string;
  icon: LucideIcon;
  tone: "normal" | "warning" | "danger";
}

const tooltipStyle = {
  border: "1px solid var(--editorial-border)",
  borderRadius: "16px",
  background: "var(--editorial-card)",
  color: "var(--editorial-text)",
  boxShadow: "0 20px 45px rgba(0,0,0,0.14)"
};

const axisTick = {
  fill: "var(--editorial-muted)",
  fontSize: 11
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function ChartEmpty() {
  return (
    <div
      className="
        flex h-full min-h-[230px]
        flex-col items-center justify-center
        rounded-[20px]
        border border-dashed border-[var(--editorial-border)]
        bg-white/20 px-6 text-center
        dark:bg-white/[0.02]
      "
    >
      <div
        className="
          flex size-11 items-center justify-center
          rounded-full bg-[#d6e3dd]
          text-[#10261f]
        "
      >
        <Activity className="size-4" />
      </div>

      <p className="mt-4 text-sm font-semibold text-[var(--editorial-text)]">
        No activity yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--editorial-muted)]">
        This visualization will populate automatically as platform activity
        grows.
      </p>
    </div>
  );
}

function ChartCard({
  eyebrow,
  title,
  description,
  className = "",
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`
        campaign-surface
        group relative overflow-hidden
        p-5 sm:p-6
        ${className}
      `}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -right-20 -top-20
          size-56 rounded-full
          bg-[#78988a]/[0.08]
          blur-3xl
          transition-all duration-500
          group-hover:bg-[#78988a]/[0.13]
          dark:bg-[#78988a]/[0.04]
        "
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="editorial-label">{eyebrow}</p>

            <h3
              className="
                display-heading mt-1.5
                text-[2rem] leading-none
                text-[var(--editorial-text)]
              "
            >
              {title}
            </h3>

            <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--editorial-muted)]">
              {description}
            </p>
          </div>

          <div
            className="
              flex size-9 shrink-0 items-center justify-center
              rounded-full
              border border-[var(--editorial-border)]
              text-[var(--editorial-muted)]
            "
          >
            <TrendingUp className="size-4" />
          </div>
        </div>

        <div className="mt-5 h-[270px]">{children}</div>
      </div>
    </motion.section>
  );
}

function SupporterCharts({ data }: { data: SupporterDashboardData }) {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <ChartCard
        eyebrow="Contribution velocity"
        title="Monthly contributions"
        description="Approved credits contributed across recent months."
        className="xl:col-span-7"
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.monthlyContributions}
              margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--editorial-border)"
                strokeDasharray="4 5"
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

              <Tooltip contentStyle={tooltipStyle} />

              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#527064"
                strokeWidth={3}
                dot={{ r: 3, fill: "#527064" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        eyebrow="Portfolio mix"
        title="Contribution status"
        description="Distribution of your contribution review states."
        className="xl:col-span-5"
      >
        {data.statusDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusDistribution}
                dataKey="count"
                nameKey="status"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={4}
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              <Tooltip contentStyle={tooltipStyle} />

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

function CreatorCharts({ data }: { data: CreatorDashboardData }) {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <ChartCard
        eyebrow="Portfolio performance"
        title="Campaign funding"
        description="Raised credits compared with campaign funding goals."
        className="xl:col-span-7"
      >
        {data.campaignFunds.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.campaignFunds}
              margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--editorial-border)"
                strokeDasharray="4 5"
              />

              <XAxis
                dataKey="title"
                axisLine={false}
                tickLine={false}
                tick={axisTick}
                tickFormatter={(value) => String(value).slice(0, 12)}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={axisTick}
              />

              <Tooltip contentStyle={tooltipStyle} />

              <Legend wrapperStyle={{ fontSize: 11 }} />

              <Bar
                dataKey="raisedCredits"
                name="Raised"
                fill="#527064"
                radius={[7, 7, 0, 0]}
              />

              <Bar
                dataKey="goalCredits"
                name="Goal"
                fill="#b5c7be"
                radius={[7, 7, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        eyebrow="Funding trend"
        title="Monthly support"
        description="Approved credits received across all owned campaigns."
        className="xl:col-span-5"
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.monthlyContributions}
              margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--editorial-border)"
                strokeDasharray="4 5"
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

              <Tooltip contentStyle={tooltipStyle} />

              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#78988a"
                strokeWidth={3}
                dot={{ r: 3, fill: "#78988a" }}
                activeDot={{ r: 5 }}
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

function AdminCharts({ data }: { data: AdminDashboardData }) {
  const monthlyPayments = data.monthlyPayments.map((item) => ({
    ...item,
    amount: item.amountCents / 100
  }));

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <ChartCard
        eyebrow="Financial performance"
        title="Monthly payments"
        description="Successful Stripe and demo payment volume grouped by month."
        className="xl:col-span-8"
      >
        {monthlyPayments.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyPayments}
              margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--editorial-border)"
                strokeDasharray="4 5"
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
                contentStyle={tooltipStyle}
                formatter={(value) => `$${Number(value).toFixed(2)}`}
              />

              <Bar
                dataKey="amount"
                name="Payment volume"
                fill="#527064"
                radius={[8, 8, 0, 0]}
                maxBarSize={46}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        eyebrow="Community"
        title="User roles"
        description="Current platform accounts grouped by role."
        className="xl:col-span-4"
      >
        {data.roleDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.roleDistribution}
                dataKey="count"
                nameKey="role"
                innerRadius={60}
                outerRadius={92}
                paddingAngle={4}
              >
                {data.roleDistribution.map((entry, index) => (
                  <Cell
                    key={entry.role}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        eyebrow="Moderation lifecycle"
        title="Campaign status"
        description="Campaigns grouped by current moderation and lifecycle state."
        className="xl:col-span-6"
      >
        {data.campaignStatusDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.campaignStatusDistribution}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={94}
                paddingAngle={4}
              >
                {data.campaignStatusDistribution.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>

      <ChartCard
        eyebrow="Settlement operations"
        title="Withdrawal status"
        description="Creator withdrawal requests grouped by review state."
        className="xl:col-span-6"
      >
        {data.withdrawalDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.withdrawalDistribution}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                outerRadius={94}
                paddingAngle={4}
              >
                {data.withdrawalDistribution.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              <Tooltip contentStyle={tooltipStyle} />

              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}

function MetricCard({
  item,
  index
}: {
  item: StatItem;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.055,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{ y: -5 }}
      className="
        campaign-surface
        group relative min-h-[190px]
        overflow-hidden p-5
      "
    >
      <div
        aria-hidden="true"
        className="
          absolute -right-12 -top-12
          size-40 rounded-full
          bg-[#78988a]/[0.09]
          blur-3xl
          transition-all duration-500
          group-hover:scale-125
          group-hover:bg-[#78988a]/[0.15]
          dark:bg-[#78988a]/[0.04]
        "
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <span
            className="
              flex size-11 items-center justify-center
              rounded-full
              bg-[#d6e3dd]
              text-[#10261f]
              transition-transform duration-300
              group-hover:scale-110
            "
          >
            <Icon className="size-[18px]" />
          </span>

          <span
            className="
              text-[9px] font-bold
              tracking-[0.2em]
              text-[var(--editorial-muted)]
            "
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-auto pt-7">
          <p
            className="
              text-[clamp(2.1rem,3vw,3.2rem)]
              font-semibold leading-none
              tracking-[-0.055em]
              text-[var(--editorial-text)]
            "
          >
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </p>

          <p className="mt-2 text-sm font-semibold text-[var(--editorial-text-soft)]">
            {item.label}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[var(--editorial-muted)]">
            {item.helper}
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="
          absolute bottom-0 left-0
          h-[3px] w-full
          origin-left scale-x-0
          bg-[#527064]
          transition-transform duration-500
          group-hover:scale-x-100
          dark:bg-[#91aa9d]
        "
      />
    </motion.article>
  );
}

function MiniMetricCard({
  item,
  index
}: {
  item: StatItem;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.15 + index * 0.04
      }}
      whileHover={{ y: -3 }}
      className="
        campaign-surface
        flex items-center gap-4 p-4
      "
    >
      <span
        className="
          flex size-10 shrink-0 items-center justify-center
          rounded-full
          bg-[#d6e3dd]
          text-[#10261f]
        "
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-xl font-semibold tracking-[-0.04em] text-[var(--editorial-text)]">
          {typeof item.value === "number"
            ? item.value.toLocaleString()
            : item.value}
        </p>

        <p className="mt-0.5 text-xs font-medium text-[var(--editorial-muted)]">
          {item.label}
        </p>
      </div>
    </motion.article>
  );
}

function FocusCard({
  item,
  index
}: {
  item: FocusItem;
  index: number;
}) {
  const Icon = item.icon;

  const toneClass =
    item.tone === "danger"
      ? `
          bg-red-50/70
          border-red-500/15
          dark:bg-red-400/[0.05]
          dark:border-red-400/10
        `
      : item.tone === "warning"
        ? `
            bg-amber-50/65
            border-amber-500/15
            dark:bg-amber-400/[0.05]
            dark:border-amber-400/10
          `
        : `
            bg-white/25
            border-[var(--editorial-border)]
            dark:bg-white/[0.025]
          `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05
      }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={item.to}
        className={`
          group
          flex h-full min-h-[150px]
          flex-col
          rounded-[22px]
          border
          p-5
          transition-all duration-300
          hover:shadow-[0_18px_45px_rgba(20,45,36,0.09)]
          ${toneClass}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="
              flex size-10 items-center justify-center
              rounded-full
              bg-[#d6e3dd]
              text-[#10261f]
            "
          >
            <Icon className="size-4" />
          </span>

          <ArrowUpRight
            className="
              size-4
              text-[var(--editorial-muted)]
              transition-transform duration-300
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--editorial-text)]">
                {item.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--editorial-muted)]">
                {item.description}
              </p>
            </div>

            <p
              className="
                shrink-0 text-3xl font-semibold
                tracking-[-0.05em]
                text-[var(--editorial-text)]
              "
            >
              {item.value}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HeroPulse({
  items
}: {
  items: PulseItem[];
}) {
  return (
    <div
      className="
        grid min-w-[300px]
        grid-cols-3
        overflow-hidden
        rounded-[20px]
        border border-white/10
        bg-white/[0.06]
        backdrop-blur-xl
      "
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`
            px-4 py-4
            ${index ? "border-l border-white/10" : ""}
          `}
        >
          <p
            className="
              text-[9px] font-bold uppercase
              tracking-[0.15em]
              text-[#91aa9d]
            "
          >
            {item.label}
          </p>

          <p
            className="
              mt-1.5
              text-xl font-semibold
              tracking-[-0.04em]
              text-white
            "
          >
            {typeof item.value === "number"
              ? item.value.toLocaleString()
              : item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div
        className="
          h-[230px] animate-pulse
          rounded-[28px]
          bg-[#bcc8c3]/60
          dark:bg-[#17231e]
        "
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="
              h-[190px] animate-pulse
              rounded-[24px]
              bg-[#c2ccc8]/55
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

  if (query.isError || !query.data) {
    return (
      <section
        className="
          campaign-surface
          mx-auto max-w-2xl
          px-7 py-12 text-center
        "
      >
        <div
          className="
            mx-auto
            flex size-12 items-center justify-center
            rounded-full
            bg-red-100 text-red-700
            dark:bg-red-400/10 dark:text-red-300
          "
        >
          <BarChart3 className="size-5" />
        </div>

        <h1 className="display-heading mt-5 text-4xl">
          Dashboard unavailable.
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--editorial-muted)]">
          CrowdSpark could not retrieve the latest dashboard information.
        </p>

        <button
          type="button"
          onClick={() => void query.refetch()}
          className="editorial-button mt-6"
        >
          Try again
        </button>
      </section>
    );
  }

  let stats: StatItem[] = [];
  let pulse: PulseItem[] = [];
  let focusItems: FocusItem[] = [];
  let description = "";

  if (role === "admin") {
    const data = query.data as AdminDashboardData;

    stats = [
      {
        label: "Platform users",
        value: data.supporters + data.creators,
        helper: `${data.supporters.toLocaleString()} supporters · ${data.creators.toLocaleString()} creators`,
        icon: Users
      },
      {
        label: "Total campaigns",
        value: data.totalCampaigns,
        helper: "Campaigns currently recorded across CrowdSpark",
        icon: Rocket
      },
      {
        label: "Successful payments",
        value: data.successfulPayments,
        helper: `${money(data.totalPaymentsCents)} processed payment volume`,
        icon: HandHeart
      },
      {
        label: "Available credits",
        value: data.totalAvailableCredits,
        helper: "Credits currently available across platform accounts",
        icon: Coins
      },
      {
        label: "Pending campaigns",
        value: data.campaignsPending,
        helper: "Campaigns waiting for moderation",
        icon: FileCheck2
      },
      {
        label: "Pending withdrawals",
        value: data.withdrawalsPending,
        helper: "Creator settlements awaiting review",
        icon: WalletCards
      },
      {
        label: "Open reports",
        value: data.openReports,
        helper: "Community reports requiring attention",
        icon: Flag
      },
      {
        label: "Creator accounts",
        value: data.creators,
        helper: "Registered campaign creators",
        icon: Layers3
      }
    ];

    pulse = [
      {
        label: "Campaigns",
        value: data.campaignsPending
      },
      {
        label: "Withdrawals",
        value: data.withdrawalsPending
      },
      {
        label: "Reports",
        value: data.openReports
      }
    ];

    focusItems = [
      {
        label: "Campaign approvals",
        description: "Review campaigns waiting for an Admin decision.",
        value: data.campaignsPending,
        to: "/dashboard/admin/campaign-approvals",
        icon: FileCheck2,
        tone: data.campaignsPending ? "warning" : "normal"
      },
      {
        label: "Withdrawal requests",
        description: "Verify and settle creator payout requests.",
        value: data.withdrawalsPending,
        to: "/dashboard/admin/withdrawals",
        icon: WalletCards,
        tone: data.withdrawalsPending ? "warning" : "normal"
      },
      {
        label: "Open reports",
        description: "Resolve reported campaign and community issues.",
        value: data.openReports,
        to: "/dashboard/admin/reports",
        icon: Flag,
        tone: data.openReports ? "danger" : "normal"
      }
    ];

    description =
      "Monitor platform growth, financial operations and moderation priorities from one command center.";
  } else if (role === "creator") {
    const data = query.data as CreatorDashboardData;

    stats = [
      {
        label: "Total campaigns",
        value: data.totalCampaigns,
        helper: "Campaigns created from your account",
        icon: Rocket
      },
      {
        label: "Active campaigns",
        value: data.activeCampaigns,
        helper: "Campaigns currently open to supporters",
        icon: FileCheck2
      },
      {
        label: "Total raised",
        value: data.totalRaisedCredits,
        helper: "Credits raised across your campaigns",
        icon: HandHeart
      },
      {
        label: "Available balance",
        value: data.availableCreatorCredits,
        helper: "Credits currently eligible for withdrawal",
        icon: WalletCards
      },
      {
        label: "Pending campaigns",
        value: data.pendingCampaigns,
        helper: "Submissions awaiting Admin review",
        icon: BarChart3
      },
      {
        label: "Pending contributions",
        value: data.pendingContributions,
        helper: "Supporter contributions waiting for review",
        icon: Coins
      }
    ];

    pulse = [
      {
        label: "Active",
        value: data.activeCampaigns
      },
      {
        label: "Reviews",
        value: data.pendingContributions
      },
      {
        label: "Balance",
        value: data.availableCreatorCredits
      }
    ];

    focusItems = [
      {
        label: "My campaigns",
        description: "Review campaign performance and submissions.",
        value: data.totalCampaigns,
        to: "/dashboard/creator/campaigns",
        icon: Rocket,
        tone: "normal"
      },
      {
        label: "Contribution reviews",
        description: "Review contributions from your supporters.",
        value: data.pendingContributions,
        to: "/dashboard/creator/contributions",
        icon: HandHeart,
        tone: data.pendingContributions ? "warning" : "normal"
      },
      {
        label: "Withdrawals",
        description: "Manage settlement requests from available credits.",
        value: data.availableCreatorCredits,
        to: "/dashboard/creator/withdrawals",
        icon: WalletCards,
        tone: "normal"
      }
    ];

    description =
      "Track campaign performance, supporter activity and creator funds without leaving your workspace.";
  } else {
    const data = query.data as SupporterDashboardData;

    stats = [
      {
        label: "Total contributions",
        value: data.totalContributions,
        helper: "Campaign contributions made from your account",
        icon: HandHeart
      },
      {
        label: "Pending contributions",
        value: data.pendingContributions,
        helper: "Contributions awaiting creator review",
        icon: BarChart3
      },
      {
        label: "Approved credits",
        value: data.approvedContributionCredits,
        helper: "Credits approved across supported campaigns",
        icon: FileCheck2
      },
      {
        label: "Available credits",
        value: data.availableCredits,
        helper: "Current CrowdSpark wallet balance",
        icon: Coins
      }
    ];

    pulse = [
      {
        label: "Balance",
        value: data.availableCredits
      },
      {
        label: "Pending",
        value: data.pendingContributions
      },
      {
        label: "Approved",
        value: data.approvedContributionCredits
      }
    ];

    focusItems = [
      {
        label: "Explore campaigns",
        description: "Discover campaigns currently accepting support.",
        value: "Explore",
        to: "/dashboard/supporter/explore",
        icon: Sparkles,
        tone: "normal"
      },
      {
        label: "My contributions",
        description: "Track contribution approvals and history.",
        value: data.totalContributions,
        to: "/dashboard/supporter/contributions",
        icon: HandHeart,
        tone: data.pendingContributions ? "warning" : "normal"
      },
      {
        label: "Purchase credits",
        description: "Add credits to your CrowdSpark wallet.",
        value: data.availableCredits,
        to: "/dashboard/supporter/purchase-credits",
        icon: Coins,
        tone: "normal"
      }
    ];

    description =
      "Track the campaigns you support, contribution approvals and the credits available in your wallet.";
  }

  const primaryStats = stats.slice(0, 4);
  const secondaryStats = stats.slice(4);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* HERO */}
      <section
        className="
          relative min-h-[235px]
          overflow-hidden
          rounded-[30px]
          border border-white/10
          bg-[#123127]
          px-6 py-7
          text-white
          shadow-[0_28px_75px_rgba(18,49,39,0.18)]
          sm:px-8 sm:py-8
          dark:bg-[#091812]
        "
      >
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -right-24 -top-32
            size-[360px] rounded-full
            bg-[#9bb7a8]/[0.17]
            blur-[90px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -bottom-40 left-[28%]
            size-[360px] rounded-full
            bg-[#527064]/[0.13]
            blur-[100px]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-y-0 right-[35%]
            hidden w-px
            bg-gradient-to-b
            from-transparent via-white/10 to-transparent
            lg:block
          "
        />

        <div
          className="
            relative flex h-full
            flex-col justify-between gap-8
            xl:flex-row xl:items-end
          "
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <span
                className="
                  flex size-7 items-center justify-center
                  rounded-full
                  border border-white/10
                  bg-white/[0.06]
                "
              >
                <ShieldCheck className="size-3.5 text-[#a9c1b5]" />
              </span>

              <p
                className="
                  text-[10px] font-bold uppercase
                  tracking-[0.23em]
                  text-[#9fb6ab]
                "
              >
                {role} command center
              </p>
            </div>

            <h1
              className="
                display-heading
                mt-5
                max-w-3xl
                text-[clamp(3.1rem,6vw,6.2rem)]
                leading-[0.82]
                tracking-[-0.035em]
                text-white
              "
            >
              Welcome,
              <br />
              {profile.name}.
            </h1>

            <p
              className="
                mt-5 max-w-2xl
                text-sm leading-6
                text-[#bed0c7]
              "
            >
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <div
              className="
                flex items-center justify-between
                gap-5 px-1
              "
            >
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span
                    className="
                      absolute inline-flex size-full
                      animate-ping rounded-full
                      bg-[#b8d2c5] opacity-60
                    "
                  />

                  <span
                    className="
                      relative inline-flex
                      size-2 rounded-full
                      bg-[#b8d2c5]
                    "
                  />
                </span>

                <span
                  className="
                    text-[9px] font-bold uppercase
                    tracking-[0.17em]
                    text-[#b5c8be]
                  "
                >
                  Live platform pulse
                </span>
              </div>

              <Activity className="size-4 text-[#91aa9d]" />
            </div>

            <HeroPulse items={pulse} />
          </div>
        </div>
      </section>

      {/* PRIMARY KPI */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="editorial-label">Executive snapshot</p>

            <h2
              className="
                display-heading mt-1
                text-4xl leading-none
                text-[var(--editorial-text)]
              "
            >
              Key metrics
            </h2>
          </div>

          <div
            className="
              hidden items-center gap-2
              text-[10px] font-bold uppercase
              tracking-[0.15em]
              text-[var(--editorial-muted)]
              sm:flex
            "
          >
            <Activity className="size-3.5" />
            Current CrowdSpark data
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {primaryStats.map((item, index) => (
            <MetricCard
              key={item.label}
              item={item}
              index={index}
            />
          ))}
        </div>

        {secondaryStats.length ? (
          <div
            className={`
              mt-4 grid gap-4
              ${
                secondaryStats.length === 1
                  ? "sm:grid-cols-2 xl:grid-cols-4"
                  : "sm:grid-cols-2 xl:grid-cols-4"
              }
            `}
          >
            {secondaryStats.map((item, index) => (
              <MiniMetricCard
                key={item.label}
                item={item}
                index={index}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* PRIORITY QUEUE */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="editorial-label">Operational focus</p>

            <h2
              className="
                display-heading mt-1
                text-4xl leading-none
                text-[var(--editorial-text)]
              "
            >
              Priority queue
            </h2>
          </div>

          <p
            className="
              hidden max-w-sm
              text-right text-xs leading-5
              text-[var(--editorial-muted)]
              md:block
            "
          >
            High-value actions surfaced directly from your current platform
            data.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {focusItems.map((item, index) => (
            <FocusCard
              key={item.label}
              item={item}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* ANALYTICS */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="editorial-label">Intelligence layer</p>

            <h2
              className="
                display-heading mt-1
                text-4xl leading-none
                text-[var(--editorial-text)]
              "
            >
              Trends & distribution
            </h2>
          </div>

          <div
            className="
              hidden items-center gap-2
              rounded-full
              border border-[var(--editorial-border)]
              bg-white/20
              px-3 py-2
              text-[10px] font-bold uppercase
              tracking-[0.12em]
              text-[var(--editorial-muted)]
              md:flex
              dark:bg-white/[0.02]
            "
          >
            <TrendingUp className="size-3.5" />
            Analytics
          </div>
        </div>

        {role === "supporter" ? (
          <SupporterCharts
            data={query.data as SupporterDashboardData}
          />
        ) : role === "creator" ? (
          <CreatorCharts
            data={query.data as CreatorDashboardData}
          />
        ) : (
          <AdminCharts
            data={query.data as AdminDashboardData}
          />
        )}
      </section>

      {/* BOTTOM SIGNATURE */}
      <section
        className="
          relative overflow-hidden
          rounded-[26px]
          border border-[var(--editorial-border)]
          bg-[#173329]
          px-6 py-6
          text-white
          dark:bg-[#0b1712]
        "
      >
        <div
          aria-hidden="true"
          className="
            absolute -right-14 -top-20
            size-52 rounded-full
            bg-[#91aa9d]/10
            blur-3xl
          "
        />

        <div
          className="
            relative flex flex-col gap-5
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-[9px] font-bold uppercase
                tracking-[0.2em]
                text-[#91aa9d]
              "
            >
              CrowdSpark workspace
            </p>

            <h2
              className="
                display-heading mt-2
                text-3xl leading-none
                text-white
              "
            >
              Built for decisions, not decoration.
            </h2>

            <p
              className="
                mt-2 max-w-2xl
                text-xs leading-5
                text-[#b9ccc3]
              "
            >
              Metrics, moderation and financial operations stay connected in
              one role-aware workspace.
            </p>
          </div>

          <div
            className="
              flex size-11 shrink-0
              items-center justify-center
              rounded-full
              border border-white/10
              bg-white/[0.06]
            "
          >
            <Sparkles className="size-4 text-[#c7d9d0]" />
          </div>
        </div>
      </section>
    </motion.main>
  );
}