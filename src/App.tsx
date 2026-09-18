import { lazy, Suspense, type ReactNode } from "react";

import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { ThemeToggle } from "./components/ThemeToggle";

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
  import("./pages/PolicyPage").then((module) => ({
    default: module.PrivacyPage
  }))
);

const TermsPage = lazy(() =>
  import("./pages/PolicyPage").then((module) => ({
    default: module.TermsPage
  }))
);

const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/onboarding",
  "/forgot-password",
  "/reset-password"
]);

function AuthThemeAccess() {
  const { pathname } = useLocation();

  if (!AUTH_PATHS.has(pathname)) {
    return null;
  }

  return (
    <div
      className="
        fixed
        right-4
        top-4
        z-[70]

        sm:right-6
        sm:top-6
      "
    >
      <ThemeToggle />
    </div>
  );
}

function PageLoader() {
  return (
    <div
      className="
        flex
        min-h-[360px]
        items-center
        justify-center

        px-6
      "
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="
            relative
            mx-auto

            flex
            size-14
            items-center
            justify-center
          "
        >
          <div
            className="
              absolute
              inset-0

              animate-spin

              rounded-full

              border-2
              border-[#b7c5bf]
              border-t-[#315b4a]

              dark:border-[#263a31]
              dark:border-t-[#a9c2b6]
            "
          />

          <div
            className="
              size-2
              rounded-full

              bg-[#527064]

              dark:bg-[#91aa9d]
            "
          />
        </div>

        <p
          className="
            mt-4

            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]

            text-[#65776f]

            dark:text-[#8da198]
          "
        >
          Loading CrowdSpark
        </p>
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function DashboardRedirect() {
  const { current } = useAuth();

  return <Navigate to={dashboardPath(current?.profile?.role)} replace />;
}

export default function App() {
  return (
    <>
      <AuthThemeAccess />

      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route
            path="/"
            element={
              <LazyPage>
                <HomePage />
              </LazyPage>
            }
          />

          <Route
            path="/campaigns"
            element={
              <LazyPage>
                <ExplorePage />
              </LazyPage>
            }
          />

          <Route
            path="/campaigns/:campaignId"
            element={
              <LazyPage>
                <CampaignDetailsPage />
              </LazyPage>
            }
          />

          <Route
            path="/about"
            element={
              <LazyPage>
                <AboutPage />
              </LazyPage>
            }
          />

          <Route
            path="/contact"
            element={
              <LazyPage>
                <ContactPage />
              </LazyPage>
            }
          />

          <Route
            path="/privacy"
            element={
              <LazyPage>
                <PrivacyPage />
              </LazyPage>
            }
          />

          <Route
            path="/terms"
            element={
              <LazyPage>
                <TermsPage />
              </LazyPage>
            }
          />
        </Route>

        {/* AUTH */}
        <Route
          path="/login"
          element={
            <LazyPage>
              <LoginPage />
            </LazyPage>
          }
        />

        <Route
          path="/register"
          element={
            <LazyPage>
              <RegisterPage />
            </LazyPage>
          }
        />

        <Route
          path="/onboarding"
          element={
            <LazyPage>
              <OnboardingPage />
            </LazyPage>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <LazyPage>
              <ForgotPasswordPage />
            </LazyPage>
          }
        />

        <Route
          path="/reset-password"
          element={
            <LazyPage>
              <ResetPasswordPage />
            </LazyPage>
          }
        />

        {/* AUTHENTICATED DASHBOARD */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardRedirect />} />

            {/* SHARED DASHBOARD */}
            <Route
              path="profile"
              element={
                <LazyPage>
                  <ProfilePage />
                </LazyPage>
              }
            />

            <Route
              path="notifications"
              element={
                <LazyPage>
                  <NotificationsPage />
                </LazyPage>
              }
            />

            {/* SUPPORTER */}
            <Route element={<ProtectedRoute roles={["supporter"]} />}>
              <Route
                path="supporter"
                element={
                  <LazyPage>
                    <DashboardHome />
                  </LazyPage>
                }
              />

              <Route
                path="supporter/explore"
                element={
                  <LazyPage>
                    <ExplorePage />
                  </LazyPage>
                }
              />

              <Route
                path="supporter/contributions"
                element={
                  <LazyPage>
                    <SupporterContributionsPage />
                  </LazyPage>
                }
              />

              <Route
                path="supporter/purchase-credits"
                element={
                  <LazyPage>
                    <SupporterPaymentsPage mode="purchase" />
                  </LazyPage>
                }
              />

              <Route
                path="supporter/payment-history"
                element={
                  <LazyPage>
                    <SupporterPaymentsPage mode="history" />
                  </LazyPage>
                }
              />

              <Route
                path="supporter/payments"
                element={<Navigate to="/dashboard/supporter/purchase-credits" replace />}
              />
            </Route>

            {/* CREATOR */}
            <Route element={<ProtectedRoute roles={["creator"]} />}>
              <Route
                path="creator"
                element={
                  <LazyPage>
                    <DashboardHome />
                  </LazyPage>
                }
              />

              <Route
                path="creator/campaigns/add"
                element={
                  <LazyPage>
                    <CreatorCampaignsPage mode="add" />
                  </LazyPage>
                }
              />

              <Route
                path="creator/campaigns"
                element={
                  <LazyPage>
                    <CreatorCampaignsPage mode="manage" />
                  </LazyPage>
                }
              />

              <Route
                path="creator/contributions"
                element={
                  <LazyPage>
                    <CreatorContributionsPage />
                  </LazyPage>
                }
              />

              <Route
                path="creator/withdrawals"
                element={
                  <LazyPage>
                    <CreatorWithdrawalsPage mode="request" />
                  </LazyPage>
                }
              />

              <Route
                path="creator/payment-history"
                element={
                  <LazyPage>
                    <CreatorWithdrawalsPage mode="history" />
                  </LazyPage>
                }
              />
            </Route>

            {/* ADMIN */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route
                path="admin"
                element={
                  <LazyPage>
                    <DashboardHome />
                  </LazyPage>
                }
              />

              <Route
                path="admin/users"
                element={
                  <LazyPage>
                    <AdminModerationPage forcedSection="users" />
                  </LazyPage>
                }
              />

              <Route
                path="admin/campaign-approvals"
                element={
                  <LazyPage>
                    <AdminModerationPage forcedSection="campaigns" campaignStatus="pending" />
                  </LazyPage>
                }
              />

              <Route
                path="admin/campaigns"
                element={
                  <LazyPage>
                    <AdminModerationPage forcedSection="campaigns" />
                  </LazyPage>
                }
              />

              <Route
                path="admin/withdrawals"
                element={
                  <LazyPage>
                    <AdminFinancePage forcedSection="withdrawals" />
                  </LazyPage>
                }
              />

              <Route
                path="admin/reports"
                element={
                  <LazyPage>
                    <AdminModerationPage forcedSection="reports" />
                  </LazyPage>
                }
              />

              <Route
                path="admin/moderation"
                element={
                  <LazyPage>
                    <AdminModerationPage />
                  </LazyPage>
                }
              />

              <Route
                path="admin/finance"
                element={
                  <LazyPage>
                    <AdminFinancePage />
                  </LazyPage>
                }
              />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <LazyPage>
              <NotFoundPage />
            </LazyPage>
          }
        />
      </Routes>
    </>
  );
}
