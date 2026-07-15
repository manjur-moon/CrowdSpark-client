import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  BarChart3,
  Coins,
  FileCheck2,
  Flag,
  HandHeart,
  Rocket,
  Users,
  WalletCards
} from "lucide-react";
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

const CHART_COLORS = ["#059669", "#0f766e", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#475569"];

interface SupporterDashboardData {
  totalContributions: number;
  pendingContributions: number;
  approvedContributionCredits: number;
  availableCredits: number;
  statusDistribution: Array<{ status: string; count: number; credits: number }>;
  monthlyContributions: Array<{ month: string; credits: number; count: number }>;
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
  monthlyContributions: Array<{ month: string; credits: number; count: number }>;
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
  roleDistribution: Array<{ role: string; count: number }>;
  campaignStatusDistribution: Array<{ status: string; count: number }>;
  monthlyPayments: Array<{ month: string; amountCents: number; count: number }>;
  withdrawalDistribution: Array<{ status: string; count: number; credits: number }>;
}

type DashboardData = SupporterDashboardData | CreatorDashboardData | AdminDashboardData;

function ChartEmpty() {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
      No chart data available yet.
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
    <section className="card p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-6 h-72">{children}</div>
    </section>
  );
}

function SupporterCharts({ data }: { data: SupporterDashboardData }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Monthly contributions"
        description="Approved contribution credits grouped by month."
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyContributions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#059669"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
      <ChartCard
        title="Contribution status distribution"
        description="Count of your contributions by current status."
      >
        {data.statusDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusDistribution}
                dataKey="count"
                nameKey="status"
                outerRadius={95}
                label
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
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
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="Funds raised by campaign"
        description="Raised credits across your most relevant campaigns."
      >
        {data.campaignFunds.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.campaignFunds}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" tickFormatter={(value) => String(value).slice(0, 12)} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="raisedCredits"
                name="Raised credits"
                fill="#059669"
                radius={[8, 8, 0, 0]}
              />
              <Bar dataKey="goalCredits" name="Funding goal" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
      <ChartCard
        title="Monthly approved contributions"
        description="Approved credits received across all owned campaigns."
      >
        {data.monthlyContributions.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyContributions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="credits"
                name="Credits"
                stroke="#2563eb"
                strokeWidth={3}
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
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard
        title="User-role distribution"
        description="Active platform accounts grouped by role."
      >
        {data.roleDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.roleDistribution}
                dataKey="count"
                nameKey="role"
                outerRadius={95}
                label
              >
                {data.roleDistribution.map((entry, index) => (
                  <Cell key={entry.role} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
      <ChartCard
        title="Campaign-status distribution"
        description="All campaigns grouped by moderation and lifecycle status."
      >
        {data.campaignStatusDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.campaignStatusDistribution}
                dataKey="count"
                nameKey="status"
                outerRadius={95}
                label
              >
                {data.campaignStatusDistribution.map((entry, index) => (
                  <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
      <ChartCard
        title="Monthly successful payments"
        description="Stripe and demo payment value grouped by month in USD."
      >
        {monthlyPayments.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPayments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
              <Bar dataKey="amount" name="Payment amount" fill="#0f766e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
      <ChartCard
        title="Withdrawal statistics"
        description="Withdrawal requests grouped by review status."
      >
        {data.withdrawalDistribution.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.withdrawalDistribution}
                dataKey="count"
                nameKey="status"
                outerRadius={95}
                label
              >
                {data.withdrawalDistribution.map((entry, index) => (
                  <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty />
        )}
      </ChartCard>
    </div>
  );
}

export default function DashboardHome() {
  const { current } = useAuth();
  const role = current!.profile!.role;
  const endpoint =
    role === "creator"
      ? "/creator/dashboard"
      : role === "admin"
        ? "/admin/dashboard"
        : "/contributions/dashboard";
  const query = useQuery({
    queryKey: ["dashboard", role],
    queryFn: async () => (await api.get<{ data: DashboardData }>(endpoint)).data.data
  });

  if (query.isLoading) return <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />;
  if (query.isError || !query.data)
    return (
      <div className="card p-10 text-center">
        <h1 className="text-xl font-bold text-red-700">Dashboard data could not be loaded</h1>
        <button className="btn-secondary mt-5" onClick={() => void query.refetch()}>
          Try again
        </button>
      </div>
    );

  const cards =
    role === "creator"
      ? [
          ["Total campaigns", (query.data as CreatorDashboardData).totalCampaigns, Rocket],
          ["Active campaigns", (query.data as CreatorDashboardData).activeCampaigns, FileCheck2],
          ["Pending campaigns", (query.data as CreatorDashboardData).pendingCampaigns, BarChart3],
          ["Total raised", (query.data as CreatorDashboardData).totalRaisedCredits, HandHeart],
          [
            "Available withdrawal credits",
            (query.data as CreatorDashboardData).availableCreatorCredits,
            WalletCards
          ]
        ]
      : role === "admin"
        ? [
            ["Supporters", (query.data as AdminDashboardData).supporters, Users],
            ["Creators", (query.data as AdminDashboardData).creators, Rocket],
            ["Total campaigns", (query.data as AdminDashboardData).totalCampaigns, FileCheck2],
            ["Pending campaigns", (query.data as AdminDashboardData).campaignsPending, BarChart3],
            ["Available credits", (query.data as AdminDashboardData).totalAvailableCredits, Coins],
            [
              "Successful payments",
              (query.data as AdminDashboardData).successfulPayments,
              HandHeart
            ],
            [
              "Pending withdrawals",
              (query.data as AdminDashboardData).withdrawalsPending,
              WalletCards
            ],
            ["Open reports", (query.data as AdminDashboardData).openReports, Flag]
          ]
        : [
            [
              "Total contributions",
              (query.data as SupporterDashboardData).totalContributions,
              HandHeart
            ],
            [
              "Pending contributions",
              (query.data as SupporterDashboardData).pendingContributions,
              BarChart3
            ],
            [
              "Approved credits",
              (query.data as SupporterDashboardData).approvedContributionCredits,
              Coins
            ],
            [
              "Available credits",
              (query.data as SupporterDashboardData).availableCredits,
              WalletCards
            ]
          ];

  return (
    <main className="space-y-7">
      <header>
        <p className="font-bold text-emerald-700">{role.toUpperCase()} DASHBOARD</p>
        <h1 className="mt-2 text-3xl font-black">Welcome, {current!.profile!.name}</h1>
        <p className="mt-2 text-slate-600">
          Monitor your real CrowdSpark activity and take the next action.
        </p>
      </header>
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => {
          const ItemIcon = Icon as typeof Coins;
          return (
            <article key={String(label)} className="card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100">
                <ItemIcon className="size-5 text-emerald-700" />
              </span>
              <p className="mt-5 text-3xl font-black">{Number(value).toLocaleString()}</p>
              <p className="mt-1 text-sm text-slate-500">{String(label)}</p>
            </article>
          );
        })}
      </section>
      {role === "supporter" ? (
        <SupporterCharts data={query.data as SupporterDashboardData} />
      ) : role === "creator" ? (
        <CreatorCharts data={query.data as CreatorDashboardData} />
      ) : (
        <AdminCharts data={query.data as AdminDashboardData} />
      )}
    </main>
  );
}
