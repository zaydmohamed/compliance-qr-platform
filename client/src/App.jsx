import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { OrganizationLayout } from './layouts/OrganizationLayout';
import { CustomerLayout } from './layouts/CustomerLayout';
import { LoadingSpinner } from './components/LoadingSpinner';

// Helper for lazy loading named exports
const lazyLoad = (importFn, namedExport) =>
  lazy(async () => {
    const module = await importFn();
    return { default: namedExport ? module[namedExport] : (module.default || module) };
  });

// Public Pages (Lazy)
const HomePage = lazyLoad(() => import('./pages/public/HomePage'), 'HomePage');
const AboutPage = lazyLoad(() => import('./pages/public/AboutPage'), 'AboutPage');
const ContactPage = lazyLoad(() => import('./pages/public/ContactPage'), 'ContactPage');
const PlatformComplaintPage = lazyLoad(() => import('./pages/public/PlatformComplaintPage'), 'PlatformComplaintPage');

// Auth Pages (Lazy)
const LoginPage = lazyLoad(() => import('./pages/auth/LoginPage'), 'LoginPage');

// Customer QR Experience Pages (Lazy)
const QRLandingPage = lazyLoad(() => import('./pages/customer/QRLandingPage'), 'QRLandingPage');
const ComplaintFormPage = lazyLoad(() => import('./pages/customer/ComplaintFormPage'), 'ComplaintFormPage');
const FeedbackFormPage = lazyLoad(() => import('./pages/customer/FeedbackFormPage'), 'FeedbackFormPage');
const ConfirmationPage = lazyLoad(() => import('./pages/customer/ConfirmationPage'), 'ConfirmationPage');
const ServiceUnavailablePage = lazyLoad(() => import('./pages/customer/ServiceUnavailablePage'), 'ServiceUnavailablePage');

// Admin Pages (Lazy)
const OverviewPage = lazyLoad(() => import('./pages/admin/OverviewPage'), 'OverviewPage');
const OrganizationsPage = lazyLoad(() => import('./pages/admin/OrganizationsPage'), 'OrganizationsPage');
const OrganizationCreatePage = lazyLoad(() => import('./pages/admin/OrganizationCreatePage'), 'OrganizationCreatePage');
const OrganizationDetailsPage = lazyLoad(() => import('./pages/admin/OrganizationDetailsPage'), 'OrganizationDetailsPage');
const QrCodesPage = lazyLoad(() => import('./pages/admin/QrCodesPage'), 'QrCodesPage');
const SubmissionsPage = lazyLoad(() => import('./pages/admin/SubmissionsPage'), 'SubmissionsPage');
const PlatformComplaintsPage = lazyLoad(() => import('./pages/admin/PlatformComplaintsPage'), 'PlatformComplaintsPage');
const RenewalsPage = lazyLoad(() => import('./pages/admin/RenewalsPage'), 'RenewalsPage');
const PaymentsPage = lazyLoad(() => import('./pages/admin/PaymentsPage'), 'PaymentsPage');
const ReportsPage = lazyLoad(() => import('./pages/admin/ReportsPage'), 'ReportsPage');
const AuditLogsPage = lazyLoad(() => import('./pages/admin/AuditLogsPage'), 'AuditLogsPage');
const AdminUsersPage = lazyLoad(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');

// Organization Pages (Lazy)
const OrgDashboardPage = lazyLoad(() => import('./pages/org/OrgDashboardPage'), 'OrgDashboardPage');
const OrgSubmissionsPage = lazyLoad(() => import('./pages/org/OrgSubmissionsPage'), 'OrgSubmissionsPage');
const OrgQrPage = lazyLoad(() => import('./pages/org/OrgQrPage'), 'OrgQrPage');
const OrgSubscriptionPage = lazyLoad(() => import('./pages/org/OrgSubscriptionPage'), 'OrgSubscriptionPage');
const OrgReportsPage = lazyLoad(() => import('./pages/org/OrgReportsPage'), 'OrgReportsPage');
const OrgProfilePage = lazyLoad(() => import('./pages/org/OrgProfilePage'), 'OrgProfilePage');
const OrgNotificationsPage = lazyLoad(() => import('./pages/org/OrgNotificationsPage'), 'OrgNotificationsPage');

const PageFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[40vh]">
    <LoadingSpinner size="sm" message="" />
  </div>
);

export const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#2F2E2D',
            color: '#fff',
            fontSize: '13px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#0086FF',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#E11D48',
              secondary: '#fff',
            },
          },
        }}
      />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public SaaS Pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/platform-complaint" element={<PlatformComplaintPage />} />
          </Route>

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />

          {/* Customer Experience (Mobile-First / Anonymous) */}
          <Route path="/c/:token" element={<CustomerLayout />}>
            <Route index element={<QRLandingPage />} />
            <Route path="cabasho" element={<ComplaintFormPage />} />
            <Route path="complaint" element={<ComplaintFormPage />} />
            <Route path="talo" element={<FeedbackFormPage />} />
            <Route path="feedback" element={<FeedbackFormPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
            <Route path="unavailable" element={<ServiceUnavailablePage />} />
          </Route>

          {/* Platform Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/create" element={<OrganizationCreatePage />} />
            <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
            <Route path="qr-center" element={<QrCodesPage />} />
            <Route path="complaints" element={<SubmissionsPage />} />
            <Route path="feedback" element={<SubmissionsPage />} />
            <Route path="platform-complaints" element={<PlatformComplaintsPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="subscriptions" element={<RenewalsPage />} />
            <Route path="renewals" element={<RenewalsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="settings" element={<AdminUsersPage />} />
          </Route>

          {/* Organization Portal */}
          <Route path="/organization" element={<OrganizationLayout />}>
            <Route index element={<Navigate to="/organization/overview" replace />} />
            <Route path="overview" element={<OrgDashboardPage />} />
            <Route path="complaints" element={<OrgSubmissionsPage />} />
            <Route path="feedback" element={<OrgSubmissionsPage />} />
            <Route path="submissions" element={<OrgSubmissionsPage />} />
            <Route path="qr" element={<OrgQrPage />} />
            <Route path="subscription" element={<OrgSubscriptionPage />} />
            <Route path="reports" element={<OrgReportsPage />} />
            <Route path="notifications" element={<OrgNotificationsPage />} />
            <Route path="profile" element={<OrgProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};
export default App;
