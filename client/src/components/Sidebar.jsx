import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  QrCode,
  AlertCircle,
  MessageSquareShare,
  CalendarCheck2,
  BarChart3,
  BellRing,
  FileClock,
  Settings,
  UserCheck,
  Shield,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen = false, onClose }) => {
  const { isPlatformAdmin, user, platformSettings } = useAuth();

  const adminNavItems = [
    { label: 'Overview', to: '/admin/overview', icon: LayoutDashboard },
    { label: 'Organization Management', to: '/admin/organizations', icon: Building2 },
    { label: 'QR Code Center', to: '/admin/qr-center', icon: QrCode },
    { label: 'Complaints (Cabasho)', to: '/admin/complaints', icon: AlertCircle },
    { label: 'Feedback (Talo)', to: '/admin/feedback', icon: MessageSquareShare },
    { label: 'Platform Complaints', to: '/admin/platform-complaints', icon: Shield },
    { label: 'Renewal Requests', to: '/admin/renewals', icon: CalendarCheck2 },
    { label: 'Analytics & Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: FileClock },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  const orgNavItems = [
    { label: 'Organization Overview', to: '/organization/overview', icon: LayoutDashboard },
    { label: 'Complaints (Cabasho)', to: '/organization/complaints', icon: AlertCircle },
    { label: 'Feedback (Talo)', to: '/organization/feedback', icon: MessageSquareShare },
    { label: 'Official QR Code', to: '/organization/qr', icon: QrCode },
    { label: 'Reports & Export', to: '/organization/reports', icon: BarChart3 },
    { label: 'Notification History', to: '/organization/notifications', icon: BellRing },
    { label: 'Account Profile', to: '/organization/profile', icon: UserCheck },
  ];

  const navItems = isPlatformAdmin ? adminNavItems : orgNavItems;

  const currentLogo = isPlatformAdmin
    ? platformSettings?.logo
    : user?.organization?.logo;

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#3D4F34]">
        <div className="flex items-center gap-3">
          {currentLogo ? (
            <img
              src={currentLogo}
              alt=""
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="w-9 h-9 rounded-xl bg-white object-contain p-1 border border-white/20 shadow-md"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#0086FF] flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white leading-none truncate max-w-[140px]">
              {isPlatformAdmin ? (
                platformSettings?.platformName || (
                  <>COMPLIANCE <span className="text-[#0086FF]">QR</span></>
                )
              ) : (
                user?.organization?.name || 'COMPLIANCE QR'
              )}
            </h1>
            <p className="text-[10px] text-emerald-200/70 font-medium tracking-wider uppercase mt-0.5">
              {isPlatformAdmin ? 'Platform Admin' : 'Org Portal'}
            </p>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200/70 hover:text-white hover:bg-[#3D4F34] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0086FF] text-white shadow-sm font-bold translate-x-1'
                    : 'text-emerald-100/80 hover:bg-[#3D4F34] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-[#3D4F34] bg-[#212B1C]/50 text-[11px] text-emerald-200/60">
        <p className="font-semibold text-white/90 truncate">
          {isPlatformAdmin ? 'Super Admin Console' : user?.organization?.name || 'Organization User'}
        </p>
        <p className="text-[10px] text-emerald-300/50 mt-0.5">v1.0.0 • Secure Compliance</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#2C3925] text-white flex-col flex-shrink-0 min-h-screen border-r border-[#212B1C] sticky top-0 h-screen">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-[#2C3925] text-white flex flex-col z-50 shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderContent(true)}
      </aside>
    </>
  );
};
