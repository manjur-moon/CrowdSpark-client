import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { dashboardPath, useAuth } from "./lib/AuthContext";

const AdminFinancePage = lazy(() => import("./dashboard/AdminFinancePage"));
const AdminModerationPage = lazy(() => import("./dashboard/AdminModerationPage"));
const CreatorCampaignsPage = lazy(() => import("./dashboard/CreatorCampaignsPage"));
const CreatorContributionsPage = lazy(() => import("./dashboard/CreatorContributionsPage"));
const CreatorWithdrawalsPage = lazy(() => import("./dashboard/CreatorWithdrawalsPage"));
const DashboardHome = lazy(() => import("./dashboard/DashboardHome"));
const NotificationsPage = lazy(() => import("./dashboard/NotificationsPage"));
const ProfilePage = lazy(() => import("./dashboard/ProfilePage"));
const SupporterContributionsPage = lazy(() => import("./dashboard/SupporterContributionsPage"));
const SupporterPaymentsPage = lazy(() => import("./dashboard/SupporterPaymentsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const CampaignDetailsPage = lazy(() => import("./pages/CampaignDetailsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const PrivacyPage = lazy(() =>
  import("./pages/PolicyPage").then((module) => ({ default: module.PrivacyPage }))
);
const TermsPage = lazy(() =>
  import("./pages/PolicyPage").then((module) => ({ default: module.TermsPage }))
);
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

function PageLoader() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div
        className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
        aria-label="Loading page"
      />
    </div>
  );
}

function DashboardRedirect() {
  const { current } = useAuth();
  return <Navigate to={dashboardPath(current?.profile?.role)} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<ExplorePage />} />
          <Route path="/campaigns/:campaignId" element={<CampaignDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            <Route element={<ProtectedRoute roles={["supporter"]} />}>
              <Route path="supporter" element={<DashboardHome />} />
              <Route path="supporter/explore" element={<ExplorePage />} />
              <Route path="supporter/contributions" element={<SupporterContributionsPage />} />
              <Route
                path="supporter/purchase-credits"
                element={<SupporterPaymentsPage mode="purchase" />}
              />
              <Route
                path="supporter/payment-history"
                element={<SupporterPaymentsPage mode="history" />}
              />
              <Route
                path="supporter/payments"
                element={<Navigate to="/dashboard/supporter/purchase-credits" replace />}
              />
            </Route>

            <Route element={<ProtectedRoute roles={["creator"]} />}>
              <Route path="creator" element={<DashboardHome />} />
              <Route path="creator/campaigns/add" element={<CreatorCampaignsPage mode="add" />} />
              <Route path="creator/campaigns" element={<CreatorCampaignsPage mode="manage" />} />
              <Route path="creator/contributions" element={<CreatorContributionsPage />} />
              <Route
                path="creator/withdrawals"
                element={<CreatorWithdrawalsPage mode="request" />}
              />
              <Route
                path="creator/payment-history"
                element={<CreatorWithdrawalsPage mode="history" />}
              />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="admin" element={<DashboardHome />} />
              <Route path="admin/users" element={<AdminModerationPage forcedSection="users" />} />
              <Route
                path="admin/campaign-approvals"
                element={<AdminModerationPage forcedSection="campaigns" campaignStatus="pending" />}
              />
              <Route
                path="admin/campaigns"
                element={<AdminModerationPage forcedSection="campaigns" />}
              />
              <Route
                path="admin/withdrawals"
                element={<AdminFinancePage forcedSection="withdrawals" />}
              />
              <Route
                path="admin/reports"
                element={<AdminModerationPage forcedSection="reports" />}
              />
              <Route path="admin/moderation" element={<AdminModerationPage />} />
              <Route path="admin/finance" element={<AdminFinancePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
