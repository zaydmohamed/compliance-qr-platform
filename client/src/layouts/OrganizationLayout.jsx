import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MustChangePasswordModal } from '../components/MustChangePasswordModal';

export const OrganizationLayout = () => {
  const { user, loading, isOrgUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isOrgUser) {
    return <Navigate to="/admin/overview" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={user?.organization?.name ? `${user.organization.name} — Portal` : 'Organization Dashboard'}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Operations Copilot for Organization */}
      <ChatbotWidget mode="ORGANIZATION" />

      {/* Mandatory Password Change Modal on First Login */}
      {user?.mustChangePassword && <MustChangePasswordModal />}
    </div>
  );
};
